import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeNumber, rateLimit, getClientIp, CHAT_LIMIT } from '@/lib/security'

export const dynamic = 'force-dynamic'

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function buildFallbackReply(client: { businessName: string; businessType: string; description: string; services: string; phone: string; whatsappNumber: string; customNotes: string }, recentMessages: Array<{ role: 'assistant' | 'user'; content: string }>): string {
  const lastUserMessage = [...recentMessages].reverse().find(m => m.role === 'user')?.content || ''
  const q = normalizeText(lastUserMessage)

  let menuData: Record<string, unknown> | null = null
  if (client.customNotes) {
    try {
      menuData = JSON.parse(client.customNotes) as Record<string, unknown>
    } catch {
      menuData = null
    }
  }

  const locations = (menuData?.locations as Record<string, { name?: string; phone?: string; phone2?: string; hours?: string }> | undefined) || {}
  const hasLocations = Object.keys(locations).length > 0
  const globalHours = typeof menuData?.hours === 'string' ? menuData.hours : ''

  if (/horario|abre|cierran|hora/.test(q)) {
    if (hasLocations) {
      const lines = Object.values(locations)
        .slice(0, 4)
        .map(loc => `- ${loc.name || 'Sucursal'}: ${loc.hours || globalHours || 'Horario por confirmar'}`)
      return `Estos son los horarios disponibles:\n${lines.join('\n')}`
    }
    if (globalHours) return `Nuestro horario actual es: ${globalHours}.`
    return 'El horario se confirma según sucursal. Si quieres, te ayudamos por WhatsApp en este momento.'
  }

  if (/sucursal|ubicacion|direccion|local/.test(q)) {
    if (hasLocations) {
      const lines = Object.values(locations)
        .slice(0, 4)
        .map(loc => `- ${loc.name || 'Sucursal'}${loc.phone ? ` (${loc.phone}${loc.phone2 ? ` / ${loc.phone2}` : ''})` : ''}`)
      return `Tenemos estas sucursales:\n${lines.join('\n')}`
    }
    return `Atendemos por ${client.businessName}. Si quieres la ubicación exacta, te la compartimos por WhatsApp.`
  }

  if (/telefono|whatsapp|contacto|llamar/.test(q)) {
    const phones = [client.phone, client.whatsappNumber].filter(Boolean)
    if (phones.length > 0) return `Puedes contactarnos al: ${phones.join(' / ')}.`
    return 'En este momento te atendemos por el canal principal del negocio.'
  }

  if (/menu|carta|comida|pedido|ordenar|pedir|hamburguesa|burger/.test(q)) {
    return 'Puedes ver el menú completo y hacer tu pedido desde la opción "Ver menú". Si prefieres, también te apoyamos por WhatsApp.'
  }

  if (/precio|cuanto cuesta|cuanto vale|promo|promocion/.test(q)) {
    return 'Los precios pueden variar por producto y sucursal. En el menú actualizado puedes ver montos exactos en tiempo real.'
  }

  if (/domicilio|envio|delivery/.test(q)) {
    return 'Sí manejamos pedidos para recoger y opciones de envío según la zona. Te confirmamos cobertura al momento de ordenar.'
  }

  const services = client.services
    ? client.services.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6)
    : []

  if (services.length > 0) {
    return `Te puedo ayudar con: ${services.join(', ')}. Si quieres, dime cuál te interesa y te guío paso a paso.`
  }

  return `Gracias por tu mensaje. Puedo ayudarte con menú, horarios, sucursales y pedidos de ${client.businessName}. ¿Qué deseas consultar?`
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Rate limit — chat is expensive (OpenAI calls)
    const ip = getClientIp(req)
    const rl = rateLimit(`chat:${ip}`, CHAT_LIMIT.max, CHAT_LIMIT.window)
    if (!rl.allowed) {
      return NextResponse.json({ reply: 'Estamos atendiendo muchas consultas. Por favor intenta en unos segundos.' })
    }

    const { slug } = params
    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 }) }

    const { messages, contactData } = body as { messages?: unknown[]; contactData?: Record<string, unknown> }

    // Find client by slug
    const client = await prisma.client.findUnique({ where: { slug } })

    if (!client || client.status !== 'active') {
      return NextResponse.json({ error: 'Negocio no encontrado.' }, { status: 404 })
    }

    // ── If contactData is provided, save as lead ──
    if (contactData && typeof contactData === 'object') {
      const name = sanitizeString(contactData.name, 100)
      const email = sanitizeEmail(contactData.email)
      const phone = sanitizePhone(contactData.phone)
      const interest = sanitizeString(contactData.interest, 500)
      const orderDetails = sanitizeString(contactData.orderDetails, 5000)
      const totalAmount = sanitizeNumber(contactData.totalAmount, 0, 9999999)

      if (name && (phone || email)) {
        const lead = await prisma.lead.create({
          data: {
            clientId: client.id,
            name,
            email,
            phone,
            message: interest,
            source: 'chatbot',
            status: 'new',
            orderDetails,
            totalAmount,
          },
        })

        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            type: 'chatbot_conversation',
            detail: 'Datos capturados vía chatbot',
            author: 'visitor',
          },
        })

        if (totalAmount > 0) {
          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              type: 'order_placed',
              detail: JSON.stringify({ total: totalAmount }),
              author: 'visitor',
            },
          })
        }

        return NextResponse.json({ reply: '__LEAD_SAVED__', leadId: lead.id })
      }
    }

    // ── GPT conversation for service questions ──
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos.' }, { status: 400 })
    }

    // Sanitize messages — limit to last 8, truncate content
    const recentMessages = messages.slice(-8).map((m: unknown) => {
      const msg = m as { role?: string; content?: string }
      const role = msg.role === 'assistant' ? 'assistant' as const : 'user' as const
      const content = sanitizeString(msg.content, 500)
      return { role, content }
    }).filter(m => m.content)

    if (recentMessages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos.' }, { status: 400 })
    }

    const services = client.services ? client.services.split(',').map(s => s.trim()).filter(Boolean) : []

    const systemPrompt = `Eres el asistente virtual de "${client.businessName}" (${client.businessType || 'servicios'}).

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${client.businessName}
- Tipo: ${client.businessType}
- Descripción: ${client.description || 'No disponible'}
- Servicios: ${services.length > 0 ? services.join(', ') : 'Consultar con el negocio'}

REGLAS ESTRICTAS:
1. Responde SIEMPRE en español
2. Sé breve: máximo 2 oraciones por respuesta
3. NO inventes información (precios, horarios, direcciones) que no tengas
4. Si no sabes algo, di: "Para esa información específica, te recomiendo dejar tus datos y te contactamos directamente"
5. NUNCA digas que eres IA o chatbot
6. NO pidas datos de contacto tú mismo — el sistema tiene un formulario para eso
7. Enfócate SOLO en responder la pregunta sobre el negocio/servicios
8. Si la pregunta no tiene que ver con el negocio, redirige amablemente a los servicios disponibles`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: buildFallbackReply(client, recentMessages) })
    }

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages,
      ],
      max_tokens: 150,
      temperature: 0.6,
    })

    const reply = completion.choices[0]?.message?.content || 'Disculpa, no pude procesar tu mensaje.'

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number }
      if (apiError.status === 429) {
        return NextResponse.json({ reply: 'Estamos atendiendo muchas consultas. Por favor intenta en unos segundos.' })
      }
    }

    return NextResponse.json({ reply: 'Disculpa, hubo un problema técnico. Intenta de nuevo en un momento.' })
  }
}
