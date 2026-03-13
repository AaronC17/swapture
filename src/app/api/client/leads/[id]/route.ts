import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

// GET /api/client/leads/:id — full lead detail with notes & activity
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
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
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({ where: { userId: user.userId } })
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const existing = await prisma.lead.findFirst({ where: { id: params.id, clientId: client.id } })
    if (!existing) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const body = await safeJsonParse(req)
    if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    const updates: Record<string, unknown> = {}

    if (body.status && ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(String(body.status))) {
      updates.status = String(body.status)
      if (String(body.status) === 'converted' && !existing.convertedAt) {
        updates.convertedAt = new Date()
      }
    }
    if (body.tags !== undefined) updates.tags = sanitizeString(body.tags, 500)
    if (body.rating !== undefined) updates.rating = Math.min(5, Math.max(0, Number(body.rating) || 0))
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

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
