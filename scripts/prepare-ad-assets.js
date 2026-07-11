/**
 * prepare-ad-assets.js
 * ---------------------------------------------------------------------------
 * Copia los archivos de media del anuncio a public/ad-assets/ para que el
 * navegador pueda servirlos desde la ruta /ad-assets/*.
 *
 * Entradas: recordings/01-customer.webm
 *           recordings/02-admin.webm
 *           recordings/final-audio.mp3
 * Salidas:  public/ad-assets/customer.webm
 *           public/ad-assets/admin.webm
 *           public/ad-assets/final-audio.mp3
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public', 'ad-assets')

const ASSETS = [
  { src: path.join(ROOT, 'recordings', '01-customer.webm'), dst: 'customer.webm' },
  { src: path.join(ROOT, 'recordings', '02-admin.webm'), dst: 'admin.webm' },
  { src: path.join(ROOT, 'recordings', 'final-audio.mp3'), dst: 'final-audio.mp3' },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function main() {
  ensureDir(PUBLIC_DIR)
  console.log('📦 Preparando assets del anuncio...')

  for (const { src, dst } of ASSETS) {
    const dstPath = path.join(PUBLIC_DIR, dst)
    if (!fs.existsSync(src)) {
      console.warn(`  ⚠️  No existe: ${src}`)
      continue
    }
    fs.copyFileSync(src, dstPath)
    const size = (fs.statSync(dstPath).size / 1024 / 1024).toFixed(2)
    console.log(`  · ${dst} → ${size} MB`)
  }

  console.log(`\n✅ Assets listos en: ${PUBLIC_DIR}`)
}

main().catch((err) => {
  console.error('\n❌ Error preparando assets:', err)
  process.exit(1)
})
