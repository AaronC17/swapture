/**
 * ============================================================================
 *  record-swapture-ad.js
 *  ----------------------------------------------------------------------------
 *  Automatización de grabación de video para el anuncio "Product-Led" de
 *  Swapture. Genera dos segmentos de video (.webm) listos para post-edición:
 *
 *    recordings/01-customer.webm  -> Flujo del cliente dentro del "iPhone 17"
 *                                    (viewport vertical 393x852, touch, retina)
 *    recordings/02-admin.webm     -> Panel de Administrador (desktop 1440x900)
 *
 *  QUÉ HACE (lineal):
 *    A) Login admin en un contexto auxiliar (sin grabar) -> guarda cookies.
 *    B) Contexto MOBILE (con video): landing 3/4 (splash + hero), formulario
 *       de contacto (lead #1 "María González"), menú, carrito con checkout
 *       3 pasos, "Enviar por WhatsApp" (lead #2 "Juan Pérez", total ₡15.600).
 *       Bloquea el popup de wa.me para que no aparezca en el video.
 *    C) Contexto DESKTOP (con video, ya autenticado): dashboard /admin
 *       (estado "antes"), reload -> el lead aparece en "Últimos contactos" y
 *       el contador "Hoy" sube, luego /admin/leads con la tabla.
 *
 *  PRE-REQUISITOS:
 *    1. npm install  (y npx playwright install chromium)
 *    2. .env con DATABASE_URL y JWT_SECRET
 *    3. node prisma/seed.js
 *    4. node scripts/set-whatsapp.js   (setea WhatsApp de Tres Cuartos)
 *    5. npm run dev  (servidor en http://localhost:3000)
 *
 *  EJECUCIÓN:
 *    node scripts/record-swapture-ad.js
 *    node scripts/record-swapture-ad.js http://localhost:3000   (URL custom)
 *
 *  POST-PRODUCCIÓN:
 *    scripts/compose-ad.ps1  -> overlay iPhone 17 + crossfade + .mp4 final
 * ============================================================================
 */
require('dotenv/config')
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

// ──────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN
// ──────────────────────────────────────────────────────────────────────────
const BASE_URL = process.argv[2] || 'http://localhost:3000'
const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings')

const SLUG = 'tres-cuartos-streetfood'
const MENU_URL = `${BASE_URL}/site/${SLUG}/menu/guachipli`
const LANDING_URL = `${BASE_URL}/site/${SLUG}`
const LOGIN_URL = `${BASE_URL}/login`
const ADMIN_URL = `${BASE_URL}/admin`
const ADMIN_LEADS_URL = `${BASE_URL}/admin/leads`

const ADMIN_EMAIL = 'admin@swapture.com'
const ADMIN_PASS = 'admin123'

// Datos simulados de los pedidos (leads)
const FORM_LEAD = {
  name: 'María González',
  email: 'maria@example.com',
  phone: '+506 8888 1234',
  message: 'Hola, quiero hacer un pedido de 2 burgers para recoger',
}
const CART_LEAD = {
  name: 'Juan Pérez',
  phone: '+506 8888 7777',
}

// Resolución del iPhone 17 (puntos CSS 393x852) + retina 2x para grabación estable.
// NOTA: isMobile:false evita un crash de Chromium headless-shell; el viewport de 393px
// activa todos los estilos mobile (splash, sm:hidden, etc.) y hasTouch emula el touch.
const IPHONE17 = {
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: false,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
}
const DESKTOP = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
}

// Tiempos de pausa (ms) para que la interacción se entienda en el video
const T = {
  micro: 450,    // entre clics rápidos
  short: 900,    // entre acciones
  medium: 1600,  // lectura de pantalla
  long: 2400,    // momentos clave (éxito, transición)
}

// ──────────────────────────────────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────────────────────────────────
const log = (msg) => console.log(`  · ${msg}`)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Navegación robusta: retry una vez si el frame se desconecta (splash/animaciones agresivas)
async function robustGoto(page, url, options = { waitUntil: 'load' }) {
  try {
    await page.goto(url, options)
  } catch (e) {
    if (e.message && (e.message.includes('ERR_ABORTED') || e.message.includes('detached'))) {
      console.log(`  Retry navegación a ${url}`)
      await wait(1000)
      await page.goto(url, options)
    } else {
      throw e
    }
  }
}

// Tipea texto en un locator de forma pausada (legible en video)
async function typeSlow(locator, text, delay = 85) {
  await locator.click()
  await locator.pressSequentially(text, { delay })
}

// Scroll suave a una sección por id
async function smoothScrollTo(page, id) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, id)
}

// Asegura que exista el directorio de grabaciones
function ensureRecordingsDir() {
  if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true })
}

// ──────────────────────────────────────────────────────────────────────────
//  FASE A — Login admin (sin grabar) y persistencia de cookies
// ──────────────────────────────────────────────────────────────────────────
async function loginAdmin(browser) {
  log('FASE A · Login admin (contexto auxiliar, sin video)')
  const ctx = await browser.newContext(DESKTOP)
  const page = await ctx.newPage()
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' })

  await page.locator('#email').fill(ADMIN_EMAIL)
  await page.locator('#password').fill(ADMIN_PASS)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  // El login redirige a /admin cuando es admin
  await page.waitForURL('**/admin', { timeout: 15000 })
  log('  Login OK · redirigió a /admin')

  // Guardamos el estado (cookie swapture-token) para reutilizarlo en la fase C
  const state = await ctx.storageState()
  await ctx.close()
  return state
}

// ──────────────────────────────────────────────────────────────────────────
//  FASE B — Flujo del cliente en el "iPhone 17" (con video)
// ──────────────────────────────────────────────────────────────────────────
async function recordCustomer(browser) {
  log('FASE B · Flujo cliente en iPhone 17 (grabando 01-customer.webm)')

  const ctx = await browser.newContext({
    ...IPHONE17,
    deviceScaleFactor: 1, // evita que Playwright grabe el doble de tamaño y deje bordes grises
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 393, height: 852 },
    },
  })

  const page = await ctx.newPage()

  // ── 1. Landing Tres Cuartos ────────────────────────────────────────────
  await robustGoto(page, LANDING_URL)

  // Limpiar estado previo del chatbot (persiste 24h en localStorage)
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'load' })

  // Splash / curtain reveal (mobile < 640px) ~2.5s -> gancho visual de apertura
  log('  Splash mobile (2.5s)...')
  await wait(2800)

  // Hero: pequeña pausa para que se aprecie
  await wait(T.medium)

  // ── 2. Beat secundario: formulario de contacto (#contacto) ─────────────
  log('  Scroll a #contacto · llenar formulario (lead María González)')
  await smoothScrollTo(page, 'contacto')
  await wait(T.short)

  const contacto = page.locator('#contacto')
  await typeSlow(contacto.locator('input[placeholder="Tu nombre"]'), FORM_LEAD.name)
  await wait(T.micro)
  await typeSlow(contacto.locator('input[placeholder="tu@email.com"]'), FORM_LEAD.email)
  await wait(T.micro)
  await typeSlow(contacto.locator('input[placeholder="+506 6012 3456"]'), FORM_LEAD.phone)
  await wait(T.micro)
  await typeSlow(
    contacto.locator('textarea[placeholder="¿En qué podemos ayudarte?"]'),
    FORM_LEAD.message,
  )
  await wait(T.short)

  await contacto.locator('button[type="submit"]').click() // "Enviar mensaje"
  await page.getByText('¡Mensaje enviado!').waitFor({ state: 'visible', timeout: 10000 })
  log('  Formulario enviado · "¡Mensaje enviado!" visible')
  await wait(T.long)

  // ── 3. Volver al hero y abrir el menú ──────────────────────────────────
  log('  Volver al hero · tap "Ver Menú"')
  await smoothScrollTo(page, 'hero-section')
  await wait(T.short)
  await page.getByRole('button', { name: 'Ver Menú' }).first().click()

  // /menu auto-redirige a /menu/guachipli (1 sola sucursal)
  await page.waitForURL('**/menu/guachipli', { timeout: 15000 })
  await page.waitForLoadState('load')
  await wait(T.medium)

  // ── 4. Abrir modal del primer producto y agregar 2x ────────────────────
  log('  Abrir modal del primer producto')
  // El botón "+" verde de la primera card abre el modal de detalle
  await page.locator('main button:has(svg.lucide-plus)').first().click()
  await page.locator('[aria-label="Cerrar"]').waitFor({ state: 'visible', timeout: 5000 })
  await wait(T.short)

  // Subir cantidad a 2 (modalQty empieza en 1)
  log('  Cantidad: 2x (aria-label "Sumar")')
  await page.getByRole('button', { name: 'Sumar' }).click()
  await wait(T.micro)

  // Agregar al carrito (botón "Agregar ₡7.800") -> cierra el modal
  log('  Tap "Agregar" -> item en carrito')
  await page.getByRole('button', { name: /Agregar/ }).click()
  await wait(T.short)

  // ── 5. Abrir carrito ───────────────────────────────────────────────────
  log('  Abrir carrito (botón nav ShoppingCart)')
  await page.locator('nav button:has(svg.lucide-shopping-cart)').click()
  await page.getByRole('button', { name: /Confirmar pedido/ }).waitFor({ state: 'visible' })
  await wait(T.short)

  // ── 6. Checkout paso 1 -> 2 (info) ─────────────────────────────────────
  log('  Checkout · "Confirmar pedido" -> paso info')
  await page.getByRole('button', { name: /Confirmar pedido/ }).click()
  await page.locator('input[placeholder="Tu nombre"]').waitFor({ state: 'visible' })
  await wait(T.micro)

  // Tipear lento nombre y teléfono (legible en video)
  await typeSlow(page.locator('input[placeholder="Tu nombre"]').first(), CART_LEAD.name)
  await wait(T.micro)
  await typeSlow(page.locator('input[placeholder="+506 6012 3456"]').first(), CART_LEAD.phone)
  await wait(T.short)

  // Tipo de entrega: "Para recoger"
  log('  Seleccionar "Para recoger"')
  await page.getByRole('button', { name: 'Para recoger' }).first().click()
  await wait(T.micro)

  // ── 7. Checkout paso 2 -> 3 (confirmación) ─────────────────────────────
  log('  "Continuar" -> paso confirmación')
  await page.getByRole('button', { name: /Continuar/ }).click()
  await page.getByRole('button', { name: /Enviar por WhatsApp/ }).waitFor({ state: 'visible' })
  await wait(T.short)

  // ── 8. Enviar pedido ───────────────────────────────────────────────────
  log('  "Enviar por WhatsApp" -> POST /lead (popup wa.me bloqueado)')
  // Anulamos window.open para evitar que se abra la pestaña de WhatsApp Web
  // durante la grabación; el fetch /api/site/[slug]/lead se ejecuta igual.
  await page.evaluate(() => { window.open = () => null })

  // Esperamos la respuesta del POST del lead para confirmar que se creó.
  const [leadResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(`/api/site/${SLUG}/lead`) && r.request().method() === 'POST'),
    page.getByRole('button', { name: /Enviar por WhatsApp/ }).click(),
  ])
  if (!leadResponse.ok()) {
    throw new Error(`POST /lead falló con status ${leadResponse.status()}`)
  }
  const leadBody = await leadResponse.json().catch(() => ({}))
  log(`  Lead creado · ID: ${leadBody.leadId || 'n/a'}`)
  await wait(1500) // feedback visual antes de cerrar el segmento

  // Flush del video: cerrar la página finaliza la grabación.
  // Capturamos la referencia ANTES de cerrar el contexto.
  const video = page.video()
  await page.close()
  const target = path.join(RECORDINGS_DIR, '01-customer.webm')
  if (video) await video.saveAs(target)
  await ctx.close()
  log(`  Video móvil guardado: ${target}`)
  return target
}

// ──────────────────────────────────────────────────────────────────────────
//  FASE C — Panel de Administrador (desktop, con video, ya autenticado)
// ──────────────────────────────────────────────────────────────────────────
async function recordAdmin(browser, storageState) {
  log('FASE C · Panel Admin desktop (grabando 02-admin.webm)')

  const ctx = await browser.newContext({
    ...DESKTOP,
    deviceScaleFactor: 1, // evita bordes grises por escalado de Playwright
    storageState, // reutiliza la cookie swapture-token de la fase A
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1440, height: 900 },
    },
  })
  const page = await ctx.newPage()

  // ── 1. Dashboard "antes" del lead nuevo ────────────────────────────────
  await robustGoto(page, ADMIN_URL)
  await page.getByText('Últimos contactos').waitFor({ state: 'visible', timeout: 15000 })
  log('  Dashboard /admin cargado (estado "antes")')
  await wait(T.medium) // pausa para que el espectador lea el dashboard

  // ── 2. Recargar -> el lead nuevo aparece ───────────────────────────────
  // El admin NO es reactivo (carga una sola vez al montar), por eso el reload
  // es necesario para reflejar el lead creado en la fase B.
  log('  Reload /admin -> el lead aparece en tiempo real')
  await page.reload({ waitUntil: 'load' })
  await page.getByText('Últimos contactos').waitFor({ state: 'visible', timeout: 15000 })

  // Verificamos que "Juan Pérez" (pedido del carrito) aparezca arriba
  await page.getByText(CART_LEAD.name).first().waitFor({ state: 'visible', timeout: 10000 })
  log(`  "${CART_LEAD.name}" visible en "Últimos contactos"`)
  await wait(T.long)

  // ── 3. Ir a la tabla completa de contactos ─────────────────────────────
  log('  Navegando a /admin/leads (tabla completa)')
  await robustGoto(page, ADMIN_LEADS_URL)
  await page.getByRole('heading', { name: 'Todos los contactos' }).waitFor({ state: 'visible', timeout: 10000 })
  await page.getByRole('row').filter({ hasText: CART_LEAD.name }).first().waitFor({ state: 'visible', timeout: 10000 })
  log('  Tabla /admin/leads · lead visible')
  await wait(T.long) // cierre del segmento admin

  const video = page.video()
  await page.close()
  const target = path.join(RECORDINGS_DIR, '02-admin.webm')
  if (video) await video.saveAs(target)
  await ctx.close()
  log(`  Video admin guardado: ${target}`)
  return target
}

// ──────────────────────────────────────────────────────────────────────────
//  ORQUESTADOR
// ──────────────────────────────────────────────────────────────────────────
async function main() {
  ensureRecordingsDir()
  console.log('\n🎬  Swapture — Grabación de anuncio Product-Led')
  console.log(`   Base URL: ${BASE_URL}\n`)

  const browser = await chromium.launch({ headless: true }) // headless:true es estable en servidores/CI y graba video igual

  try {
    const storageState = await loginAdmin(browser)
    const mobileVideo = await recordCustomer(browser)
    const adminVideo = await recordAdmin(browser, storageState)

    console.log('\n✅  Grabación completada')
    console.log('   Segmentos listos para post-producción:')
    if (mobileVideo) console.log(`     - ${mobileVideo}`)
    if (adminVideo) console.log(`     - ${adminVideo}`)
    console.log('\n   Siguiente paso:  pwsh scripts/compose-ad.ps1')
    console.log('   (overlay iPhone 17 + crossfade + export .mp4)\n')
  } catch (err) {
    console.error('\n❌  Error durante la grabación:\n', err)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()
