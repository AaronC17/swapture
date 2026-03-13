import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeNumber, rateLimit, getClientIp, safeJsonParse, LEAD_LIMIT } from '@/lib/security'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Rate limit
    const ip = getClientIp(req)
    const rl = rateLimit(`lead:${ip}`, LEAD_LIMIT.max, LEAD_LIMIT.window)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
    }

    const { slug } = params
    const body = await safeJsonParse(req)
    if (!body) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }

    // Sanitize all inputs
    const name = sanitizeString(body.name, 100)
    const email = sanitizeEmail(body.email)
    const phone = sanitizePhone(body.phone)
    const message = sanitizeString(body.message, 1000)
    const source = ['website', 'whatsapp', 'chatbot'].includes(String(body.source)) ? String(body.source) : 'website'
    const orderDetails = sanitizeString(body.orderDetails, 5000)
    const totalAmount = sanitizeNumber(body.totalAmount, 0, 9999999)

    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: 'Nombre y al menos un dato de contacto son obligatorios.' }, { status: 400 })
    }

    // Find client by slug
    const client = await prisma.client.findUnique({ where: { slug } })

    if (!client || client.status !== 'active') {
      return NextResponse.json({ error: 'Negocio no encontrado.' }, { status: 404 })
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        clientId: client.id,
        name,
        email,
        phone,
        message,
        source,
        status: 'new',
        orderDetails,
        totalAmount,
      },
    })

    // Log activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'form_submission',
        detail: source === 'whatsapp' ? 'Pedido enviado por WhatsApp' : 'Formulario de contacto',
        author: 'visitor',
      },
    })

    // If order was placed, log that too
    if (totalAmount > 0) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'order_placed',
          detail: JSON.stringify({ total: totalAmount, items: orderDetails }),
          author: 'visitor',
        },
      })
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
