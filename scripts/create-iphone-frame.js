/**
 * create-iphone-frame.js
 * --------------------------------------------------------------------------
 * Genera un marco estético de iPhone 17 con el área de pantalla transparente,
 * listo para usar como overlay en FFmpeg (compose-ad.ps1).
 *
 * Usa Playwright para renderizar un SVG a PNG con fondo transparente.
 * Dimensiones (coinciden con compose-ad.ps1 por defecto):
 *   - Marco completo: 1170 x 2532 px
 *   - Pantalla transparente: 1080 x 2340 px, offset (45, 96)
 *   - Esquinas redondeadas, Dynamic Island, botones laterales.
 *
 * USO:
 *   node scripts/create-iphone-frame.js
 *   npm run create:frame
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '..', 'recordings', 'iphone17-frame.png')

// SVG del marco iPhone 17 con agujero transparente para la pantalla
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1170" height="2532" viewBox="0 0 1170 2532">
  <defs>
    <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#323234"/>
      <stop offset="50%" stop-color="#1a1a1c"/>
      <stop offset="100%" stop-color="#0e0e10"/>
    </linearGradient>
    <linearGradient id="bezelGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a4a4c"/>
      <stop offset="100%" stop-color="#1a1a1c"/>
    </linearGradient>
  </defs>

  <!-- Marco exterior (opaco) con agujero de pantalla vía fill-rule="evenodd" -->
  <path fill="url(#frameGrad)" fill-rule="evenodd" d="
    M170,0  h830
    a170,170 0 0 1 170,170     v2192
    a170,170 0 0 1 -170,170    h-830
    a170,170 0 0 1 -170,-170   v-2192
    a170,170 0 0 1 170,-170    z

    M45,96   h1080
    a40,40 0 0 1 40,40        v2260
    a40,40 0 0 1 -40,40       h-1080
    a40,40 0 0 1 -40,-40      v-2260
    a40,40 0 0 1 40,-40       z
  "/>

  <!-- Borde fino metálico alrededor del marco -->
  <rect x="4" y="4" width="1162" height="2524" rx="166" fill="none" stroke="url(#bezelGrad)" stroke-width="8" opacity="0.6"/>

  <!-- Dynamic Island -->
  <rect x="495" y="120" width="180" height="44" rx="22" fill="#000"/>

  <!-- Botones laterales (detalle) -->
  <rect x="-4" y="380" width="4" height="90" rx="2" fill="#3a3a3c"/>
  <rect x="-4" y="500" width="4" height="130" rx="2" fill="#3a3a3c"/>
  <rect x="-4" y="670" width="4" height="130" rx="2" fill="#3a3a3c"/>
  <rect x="1170" y="520" width="4" height="170" rx="2" fill="#3a3a3c"/>

  <!-- Antenna bands sutiles -->
  <rect x="0" y="240" width="1170" height="1" fill="#000" opacity="0.25"/>
  <rect x="0" y="2292" width="1170" height="1" fill="#000" opacity="0.25"/>
</svg>
`

async function main() {
  const svgBase64 = Buffer.from(SVG).toString('base64')
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1170, height: 2532 } })

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; }
          img { display: block; width: 1170px; height: 2532px; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="iPhone 17 frame" />
      </body>
    </html>
  `)

  await page.screenshot({ path: OUT, omitBackground: true })
  await browser.close()

  const stats = fs.statSync(OUT)
  console.log('━'.repeat(60))
  console.log(' iPhone 17 frame generado')
  console.log(` Ruta:   ${OUT}`)
  console.log(` Tamaño: ${stats.size.toLocaleString()} bytes`)
  console.log(` Resol.: 1170x2532 · Pantalla transparente: 1080x2340 @ (45,96)`)
  console.log('━'.repeat(60))
  console.log(' Ahora puedes correr:  pwsh scripts/compose-ad.ps1')
}

main().catch((e) => { console.error(e); process.exit(1) })
