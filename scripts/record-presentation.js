/**
 * record-presentation.js
 * ---------------------------------------------------------------------------
 * Graba la página /ad/presentation con Playwright y exporta un .webm de video
 * (sin audio, éste se mezcla después con FFmpeg).
 *
 * Requiere:  npm run dev  levantado en http://localhost:3000
 *            o que run-ad-pipeline.ps1 lo haya iniciado.
 *
 * Salida:    recordings/presentation.webm
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const http = require('http')

const ROOT = path.join(__dirname, '..')
const STORYBOARD_PATH = path.join(ROOT, 'scripts', 'storyboard.json')
const OUT_DIR = path.join(ROOT, 'recordings')
const OUT_FILE = path.join(OUT_DIR, 'presentation.webm')
const BASE_URL = process.argv[2] || 'http://localhost:3000'
const PRESENTATION_URL = `${BASE_URL}/ad/presentation`

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(url, timeoutSeconds = 120) {
  const target = new URL(url)
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSeconds) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get({ hostname: target.hostname, port: target.port, path: '/' }, (res) => {
          if (res.statusCode === 200) resolve()
          else reject(new Error(`status ${res.statusCode}`))
        })
        req.on('error', reject)
        req.setTimeout(2000, () => reject(new Error('timeout')))
      })
      return true
    } catch {
      await wait(1000)
    }
  }
  return false
}

async function main() {
  if (!fs.existsSync(STORYBOARD_PATH)) {
    console.error(`❌ Falta ${STORYBOARD_PATH}`)
    process.exit(1)
  }

  const storyboard = JSON.parse(fs.readFileSync(STORYBOARD_PATH, 'utf8'))
  const totalDuration = storyboard.totalDuration || storyboard.beats[storyboard.beats.length - 1].end
  const bufferSeconds = 2

  console.log(`⏳ Esperando servidor en ${BASE_URL}...`)
  if (!(await waitForServer(BASE_URL))) {
    console.error(`❌ El servidor no respondió en 120s. ¿Está corriendo npm run dev?`)
    process.exit(1)
  }

  console.log('🎬 Iniciando grabación de presentación...')
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })

  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  })

  const page = await ctx.newPage()

  try {
    await page.goto(PRESENTATION_URL, { waitUntil: 'networkidle', timeout: 60000 })

    // Esperar a que los videos y audio estén listos
    await page.waitForFunction(
      () => {
        const vids = Array.from(document.querySelectorAll('video'))
        return vids.every((v) => v.readyState >= 3 || v.readyState >= 1)
      },
      { timeout: 30000 }
    )

    // Iniciar presentación
    await page.evaluate(() => {
      if (typeof window.startPresentation === 'function') {
        window.startPresentation()
      } else {
        throw new Error('window.startPresentation no está disponible')
      }
    })

    console.log(`   Reproduciendo ${totalDuration}s + buffer ${bufferSeconds}s...`)
    await wait((totalDuration + bufferSeconds) * 1000)

    await page.close()
    const video = page.video()
    if (video) await video.saveAs(OUT_FILE)
    await ctx.close()
    await browser.close()

    const size = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)
    console.log(`\n✅ Presentación grabada: ${OUT_FILE} (${size} MB)`)
  } catch (err) {
    await ctx.close().catch(() => {})
    await browser.close().catch(() => {})
    throw err
  }
}

main().catch((err) => {
  console.error('\n❌ Error grabando presentación:', err)
  process.exit(1)
})
