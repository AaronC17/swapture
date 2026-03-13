import { NextRequest, NextResponse } from 'next/server'
import { sanitizeString, rateLimit, getClientIp, safeJsonParse, CONTACT_LIMIT } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(req)
    const rl = rateLimit(`contact:${ip}`, CONTACT_LIMIT.max, CONTACT_LIMIT.window)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
      )
    }

    const body = await safeJsonParse(req)
    if (!body) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }

    // Sanitize inputs
    const nombre = sanitizeString(body.nombre, 100)
    const negocio = sanitizeString(body.negocio, 100)
    const contacto = sanitizeString(body.contacto, 100)
    const mensaje = sanitizeString(body.mensaje, 1000)

    // Validate
    if (!nombre || !negocio || !contacto || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      )
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram env vars')
      return NextResponse.json(
        { error: 'Error de configuración del servidor.' },
        { status: 500 }
      )
    }

    // Format message for Telegram
    const text = [
      `🔔 *Nuevo lead desde Swapture*`,
      ``,
      `👤 *Nombre:* ${escapeMarkdown(nombre)}`,
      `🏢 *Negocio:* ${escapeMarkdown(negocio)}`,
      `📱 *Contacto:* ${escapeMarkdown(contacto)}`,
      `💬 *Mensaje:* ${escapeMarkdown(mensaje)}`,
      ``,
      `📅 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
    ].join('\n')

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const tgResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    })

    if (!tgResponse.ok) {
      const err = await tgResponse.text()
      console.error('Telegram API error:', err)
      return NextResponse.json(
        { error: 'Error al enviar el mensaje.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}
