import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

// GET single client with leads & notes
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, active: true } },
        leads: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Get client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH update client
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await safeJsonParse(req)
    if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

    // Allowed fields with length limits — sanitize strings
    const stringFields: Record<string, number> = {
      businessName: 200, businessType: 100, phone: 20, website: 300,
      domain: 200, slug: 100, brandColor: 20, description: 2000,
      services: 2000, whatsappNumber: 20, googleAnalytics: 100, facebookPixel: 100,
    }
    const enumFields = ['status', 'plan', 'websiteStatus', 'automationStatus', 'crmStatus']
    const data: Record<string, unknown> = {}

    for (const [key, max] of Object.entries(stringFields)) {
      if (body[key] !== undefined) data[key] = sanitizeString(body[key], max)
    }
    for (const key of enumFields) {
      if (body[key] !== undefined) data[key] = String(body[key]).slice(0, 30)
    }
    if (body.monthlyPrice !== undefined) data.monthlyPrice = Math.max(0, Number(body.monthlyPrice) || 0)
    if (body.customNotes !== undefined) data.customNotes = typeof body.customNotes === 'string' ? body.customNotes.slice(0, 50000) : ''

    // Validate enum-like fields
    const validStatus = ['pending', 'configuring', 'active', 'paused', 'cancelled']
    const validPlan = ['starter', 'growth', 'scale']
    const validWebsite = ['not_started', 'designing', 'review', 'published']
    const validAutomation = ['not_started', 'configuring', 'active']
    const validCrm = ['not_started', 'configuring', 'active']

    if (data.status && !validStatus.includes(data.status as string)) {
      return NextResponse.json({ error: 'Estado de cliente no válido' }, { status: 400 })
    }
    if (data.plan && !validPlan.includes(data.plan as string)) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }
    if (data.websiteStatus && !validWebsite.includes(data.websiteStatus as string)) {
      return NextResponse.json({ error: 'Estado de web no válido' }, { status: 400 })
    }
    if (data.automationStatus && !validAutomation.includes(data.automationStatus as string)) {
      return NextResponse.json({ error: 'Estado de automatización no válido' }, { status: 400 })
    }
    if (data.crmStatus && !validCrm.includes(data.crmStatus as string)) {
      return NextResponse.json({ error: 'Estado de gestión no válido' }, { status: 400 })
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE client (and user)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findUnique({ where: { id }, select: { userId: true } })
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Delete user (cascade will delete client, leads, notes)
    await prisma.user.delete({ where: { id: client.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
