import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

const allowedStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost']

// GET /api/client/leads/:id — full lead detail with notes & activity
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({ where: { userId: user.userId } })
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, clientId: client.id },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    })

    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Lead detail error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH /api/client/leads/:id — update lead status, tags, rating
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({ where: { userId: user.userId } })
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const existing = await prisma.lead.findFirst({ where: { id: params.id, clientId: client.id } })
    if (!existing) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const body = await safeJsonParse(req)
    if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    const updates: Record<string, unknown> = {}
    const changedFields: string[] = []

    if (body.status && allowedStatuses.includes(String(body.status))) {
      updates.status = String(body.status)
      changedFields.push('status')
      if (String(body.status) === 'converted' && !existing.convertedAt) {
        updates.convertedAt = new Date()
      }
    }
    if (body.name !== undefined) {
      updates.name = sanitizeString(body.name, 120)
      changedFields.push('name')
    }
    if (body.email !== undefined) {
      updates.email = sanitizeString(body.email, 254).toLowerCase()
      changedFields.push('email')
    }
    if (body.phone !== undefined) {
      updates.phone = sanitizeString(body.phone, 30)
      changedFields.push('phone')
    }
    if (body.message !== undefined) {
      updates.message = sanitizeString(body.message, 2000)
      changedFields.push('message')
    }
    if (body.orderDetails !== undefined) {
      updates.orderDetails = sanitizeString(body.orderDetails, 20000)
      changedFields.push('orderDetails')
    }
    if (body.totalAmount !== undefined) {
      updates.totalAmount = Math.max(0, Math.min(10000000, Number(body.totalAmount) || 0))
      changedFields.push('totalAmount')
    }
    if (body.tags !== undefined) {
      updates.tags = sanitizeString(body.tags, 500)
      changedFields.push('tags')
    }
    if (body.rating !== undefined) {
      updates.rating = Math.min(5, Math.max(0, Number(body.rating) || 0))
      changedFields.push('rating')
    }

    if (changedFields.length === 0) {
      return NextResponse.json({ error: 'No hay cambios para actualizar.' }, { status: 400 })
    }

    updates.lastContactAt = new Date()

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updates,
    })

    // Log activity if status changed
    if (updates.status && updates.status !== existing.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: params.id,
          type: 'status_change',
          detail: JSON.stringify({ from: existing.status, to: updates.status }),
          author: 'client',
        },
      })
    }

    await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        type: 'profile_update',
        detail: JSON.stringify({ fields: changedFields }),
        author: 'client',
      },
    }).catch(() => {})

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/client/leads/:id — remove a lead and its related records
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({ where: { userId: user.userId } })
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const existing = await prisma.lead.findFirst({ where: { id: params.id, clientId: client.id } })
    if (!existing) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead delete error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
