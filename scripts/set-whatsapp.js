/**
 * set-whatsapp.js
 * --------------------------------------------------------------------------
 * Utilidad para grabación del anuncio de Swapture.
 *
 * PROBLEMA: En el seed (prisma/seed.js) el cliente "Tres Cuartos Streetfood"
 * se crea con `whatsappNumber: ''` (vacío). El flujo de carrito del menú
 * (TresCuartosMenuClient.tsx -> sendOrderWA) tiene un guard:
 *
 *     if (!data.whatsappNumber || !cart.length) return
 *
 * Por lo tanto, si el WhatsApp está vacío el botón "Enviar por WhatsApp"
 * NO ejecuta nada y NO se crea el lead en la BD.
 *
 * SOLUCIÓN: Este script setea un WhatsApp demo en el documento del Client.
 * El menú arma `data.whatsappNumber = locData.whatsapp || client.whatsappNumber`
 * (ver src/app/site/[slug]/menu/[location]/page.tsx:73), por lo que basta con
 * setear el campo top-level `whatsappNumber` del Client.
 *
 * USO:
 *   node scripts/set-whatsapp.js                 -> setea +50688887777
 *   node scripts/set-whatsapp.js +50611112222    -> setea un número custom
 *   node scripts/set-whatsapp.js --reset         -> lo vuelve a dejar vacío
 *
 * Requiere: DATABASE_URL en .env  (y `npm install` ya corrido para prisma).
 * --------------------------------------------------------------------------
 */
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const SLUG = 'tres-cuartos-streetfood'
const DEFAULT_WA = '+50688887777'

async function main() {
  const arg = process.argv[2] || DEFAULT_WA
  const reset = arg === '--reset'
  const value = reset ? '' : arg

  const client = await prisma.client.findUnique({ where: { slug: SLUG } })
  if (!client) {
    console.error(`No se encontró el cliente con slug "${SLUG}".`)
    console.error('Corre primero:  node prisma/seed.js')
    process.exit(1)
  }

  const before = client.whatsappNumber || '(vacío)'
  await prisma.client.update({
    where: { slug: SLUG },
    data: { whatsappNumber: value },
  })

  console.log('━'.repeat(60))
  console.log(` Cliente:  ${client.businessName}`)
  console.log(` Slug:     ${SLUG}`)
  console.log(` Antes:    ${before}`)
  console.log(` Ahora:    ${reset ? '(vacío)' : value}`)
  console.log('━'.repeat(60))
  console.log(reset
    ? 'WhatsApp reseteado. El carrito NO creará leads.'
    : 'WhatsApp seteado. El carrito YA puede crear leads al "Enviar por WhatsApp".')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
