/**
 * mix-audio.js
 * ---------------------------------------------------------------------------
 * Mezcla la narración generada con los SFX del storyboard usando FFmpeg.
 *
 * Entradas: recordings/narration.mp3
 *           recordings/sfx/*.wav
 *           scripts/storyboard.json
 * Salida:   recordings/final-audio.mp3
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

// Refrescar PATH en Windows para encontrar FFmpeg recién instalado por winget
if (process.platform === 'win32') {
  try {
    const refreshed = require('child_process')
      .execSync(
        'powershell -Command "[Environment]::GetEnvironmentVariable(\'Path\',\'Machine\') + \';\' + [Environment]::GetEnvironmentVariable(\'Path\',\'User\')"',
        { encoding: 'utf8' }
      )
      .trim()
    process.env.Path = refreshed
    process.env.PATH = refreshed
  } catch {}
}

const ROOT = path.join(__dirname, '..')
const STORYBOARD_PATH = path.join(ROOT, 'scripts', 'storyboard.json')
const NARRATION_PATH = path.join(ROOT, 'recordings', 'narration.mp3')
const SFX_DIR = path.join(ROOT, 'recordings', 'sfx')
const OUT_PATH = path.join(ROOT, 'recordings', 'final-audio.mp3')

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += d.toString() })
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`${cmd} ${args.join(' ')} failed: ${stderr}`))
      resolve(stdout)
    })
  })
}

async function main() {
  if (!fs.existsSync(NARRATION_PATH)) {
    console.error(`❌ Falta ${NARRATION_PATH}. Corre primero: node scripts/generate-narration.js`)
    process.exit(1)
  }

  const storyboard = JSON.parse(fs.readFileSync(STORYBOARD_PATH, 'utf8'))
  const totalDuration = storyboard.totalDuration || storyboard.beats[storyboard.beats.length - 1].end

  // Recolectar todos los eventos SFX con tiempo absoluto
  const events = []
  for (const beat of storyboard.beats) {
    if (!beat.sfx) continue
    for (const e of beat.sfx) {
      const file = path.join(SFX_DIR, `${e.type}.wav`)
      if (!fs.existsSync(file)) {
        console.warn(`  ⚠️  SFX no encontrado: ${file}. Se omite.`)
        continue
      }
      events.push({
        file,
        at: Math.round((beat.start + (e.at || 0)) * 1000), // ms
      })
    }
  }

  console.log(`🎚️  Mezclando narración + ${events.length} eventos SFX...`)

  if (events.length === 0) {
    // Sin SFX, simplemente copiar narración
    fs.copyFileSync(NARRATION_PATH, OUT_PATH)
    console.log(`\n✅ Audio final listo (sin SFX): ${OUT_PATH}`)
    return
  }

  // Construir comando FFmpeg
  // Input 0: narración
  const args = ['-y', '-i', NARRATION_PATH]
  // Inputs 1..N: SFX
  for (const e of events) {
    args.push('-i', e.file)
  }

  // Filter complex: adelay para cada SFX, luego amix todo
  const filterParts = []
  for (let i = 0; i < events.length; i++) {
    const inputIdx = i + 1
    const delay = events[i].at
    filterParts.push(`[${inputIdx}:a]adelay=${delay}|${delay}[s${i}]`)
  }

  const mixInputs = ['[0:a]'].concat(events.map((_, i) => `[s${i}]`)).join('')
  filterParts.push(`${mixInputs}amix=inputs=${events.length + 1}:duration=longest:dropout_transition=0,volume=0.85[outa]`)

  args.push('-filter_complex', filterParts.join(';'))
  args.push('-map', '[outa]')
  args.push('-t', String(totalDuration))
  args.push('-ac', '2')
  args.push('-ar', '44100')
  args.push('-b:a', '192k')
  args.push(OUT_PATH)

  await run('ffmpeg', args)

  console.log(`\n✅ Audio final listo: ${OUT_PATH}`)
  console.log(`   Duración objetivo: ${totalDuration}s`)
}

main().catch((err) => {
  console.error('\n❌ Error mezclando audio:', err)
  process.exit(1)
})
