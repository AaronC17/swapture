/**
 * generate-narration.js
 * ---------------------------------------------------------------------------
 * Genera la narración en off del anuncio de Swapture usando OpenAI TTS.
 *
 * Entrada:  scripts/storyboard.json
 * Salidas:  recordings/narration/beat-XX-*.mp3   (un archivo por beat)
 *           recordings/narration.mp3             (narración continua de 32s)
 *           recordings/timeline.json             (duraciones reales por beat)
 *
 * Requiere: OPENAI_API_KEY en .env
 *            FFmpeg/ffprobe en PATH
 */
require('dotenv/config')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const OpenAI = require('openai')

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
const OUT_DIR = path.join(ROOT, 'recordings', 'narration')
const FINAL_PATH = path.join(ROOT, 'recordings', 'narration.mp3')
const TIMELINE_PATH = path.join(ROOT, 'recordings', 'timeline.json')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

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

async function getDuration(file) {
  const out = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ])
  return parseFloat(out.trim())
}

async function generateSpeech(text, outFile, voice) {
  const res = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outFile, buffer)
}

async function generateSilence(durationSec, outFile) {
  await run('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', `anullsrc=r=44100:cl=stereo`,
    '-t', String(durationSec),
    '-acodec', 'libmp3lame',
    '-q:a', '4',
    outFile,
  ])
}

async function concatFiles(files, outFile) {
  const listPath = path.join(OUT_DIR, 'concat.txt')
  const list = files.map((f) => `file '${f.replace(/'/g, "'\\'")}'`).join('\n')
  fs.writeFileSync(listPath, list)
  await run('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-acodec', 'libmp3lame',
    '-q:a', '2',
    '-t', '32',
    outFile,
  ])
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Falta OPENAI_API_KEY en .env')
    process.exit(1)
  }

  ensureDir(OUT_DIR)

  const storyboard = JSON.parse(fs.readFileSync(STORYBOARD_PATH, 'utf8'))
  const voice = storyboard.voice || 'onyx'
  const beats = storyboard.beats

  console.log(`🎙️  Generando narración con voz "${voice}"...`)

  const timeline = []
  const concatFilesList = []

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i]
    const num = String(i).padStart(2, '0')
    const safeId = beat.id.replace(/[^a-z0-9]/gi, '-')
    const beatFile = path.join(OUT_DIR, `beat-${num}-${safeId}.mp3`)

    if (!beat.voiceover) {
      timeline.push({ id: beat.id, duration: 0, file: null })
      continue
    }

    if (!fs.existsSync(beatFile)) {
      console.log(`  · beat ${num} (${beat.id}): "${beat.voiceover.substring(0, 50)}..."`)
      await generateSpeech(beat.voiceover, beatFile, voice)
    } else {
      console.log(`  · beat ${num} (${beat.id}): ya existe, se reusa`)
    }

    const duration = await getDuration(beatFile)
    timeline.push({ id: beat.id, duration, file: beatFile })
    concatFilesList.push(beatFile)

    // Calcular silencio hasta el siguiente beat
    if (i < beats.length - 1) {
      const slotDuration = beats[i + 1].start - beat.start
      const silenceDuration = Math.max(0, slotDuration - duration)
      if (silenceDuration > 0.01) {
        const silenceFile = path.join(OUT_DIR, `silence-${num}-${safeId}.mp3`)
        if (!fs.existsSync(silenceFile)) {
          await generateSilence(silenceDuration, silenceFile)
        }
        concatFilesList.push(silenceFile)
      }
    }
  }

  // Asegurar que el audio total dure exactamente lo que indica el storyboard
  const totalTarget = storyboard.totalDuration || beats[beats.length - 1].end
  console.log(`\n🔗 Concatenando narración (${totalTarget}s)...`)
  await concatFiles(concatFilesList, FINAL_PATH)

  fs.writeFileSync(TIMELINE_PATH, JSON.stringify({
    totalDuration: totalTarget,
    voice,
    beats: timeline,
  }, null, 2))

  const finalDuration = await getDuration(FINAL_PATH)
  console.log(`\n✅ Narración lista: ${FINAL_PATH}`)
  console.log(`   Duración final: ${finalDuration.toFixed(2)}s`)
  console.log(`   Timeline: ${TIMELINE_PATH}`)
}

main().catch((err) => {
  console.error('\n❌ Error generando narración:', err)
  process.exit(1)
})
