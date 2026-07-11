/**
 * normalize-recordings.js
 * ---------------------------------------------------------------------------
 * Corrige los .webm generados por Playwright cuando el viewport es más chico
 * que el tamaño de grabación, dejando bordes grises. Recorta al área útil y
 * escala al tamaño de grabación original para mantener resolución.
 *
 * Entradas: recordings/01-customer.webm  (786x1704, viewport 393x852)
 *           recordings/02-admin.webm     (1920x1200, viewport 1440x900)
 * Salidas:  recordings/01-customer.webm  (sobrescrito)
 *           recordings/02-admin.webm     (sobrescrito)
 *
 * Requiere: FFmpeg en PATH
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
const REC = path.join(ROOT, 'recordings')

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`${cmd} ${args.join(' ')} failed: ${stderr}`))
      resolve()
    })
  })
}

function backup(file) {
  const bak = `${file}.bak`
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak)
}

async function normalizeCustomer() {
  const input = path.join(REC, '01-customer.webm')
  const output = path.join(REC, '01-customer-norm.webm')
  if (!fs.existsSync(input)) {
    console.warn('  ⚠️  No existe 01-customer.webm')
    return
  }
  backup(input)
  console.log('  · Recortando 01-customer.webm al viewport 393x852...')
  await run('ffmpeg', [
    '-y', '-i', input,
    '-vf', 'crop=393:1704:0:0,scale=786:1704:flags=lanczos,format=yuv420p,fps=30,setsar=1',
    '-c:v', 'libvpx-vp9',
    '-b:v', '2M',
    '-auto-alt-ref', '0',
    output,
  ])
  fs.renameSync(output, input)
  console.log('  · 01-customer.webm normalizado')
}

async function normalizeAdmin() {
  const input = path.join(REC, '02-admin.webm')
  const output = path.join(REC, '02-admin-norm.webm')
  if (!fs.existsSync(input)) {
    console.warn('  ⚠️  No existe 02-admin.webm')
    return
  }
  backup(input)
  console.log('  · Recortando 02-admin.webm al viewport 1440x900...')
  await run('ffmpeg', [
    '-y', '-i', input,
    '-vf', 'crop=1440:900:240:150,scale=1920:1200:flags=lanczos,format=yuv420p,fps=30,setsar=1',
    '-c:v', 'libvpx-vp9',
    '-b:v', '2M',
    '-auto-alt-ref', '0',
    output,
  ])
  fs.renameSync(output, input)
  console.log('  · 02-admin.webm normalizado')
}

async function main() {
  console.log('✂️  Normalizando recordings (eliminando bordes grises)...')
  await normalizeCustomer()
  await normalizeAdmin()
  console.log('\n✅ Recordings normalizados')
}

main().catch((err) => {
  console.error('\n❌ Error normalizando recordings:', err)
  process.exit(1)
})
