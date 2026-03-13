import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

// POST /api/client/leads/:id/notes — add a note to a lead
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    const content = sanitizeString(body?.content, 2000)
    if (!content) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId: params.id,
        content,
        author: user.role === 'admin' ? 'admin' : 'client',
      },
    })

    // Log activity
    await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        type: 'note_added',
        detail: content.substring(0, 100),
        author: user.role === 'admin' ? 'admin' : 'client',
      },
    })

    // Update last contact
    await prisma.lead.update({
      where: { id: params.id },
      data: { lastContactAt: new Date() },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Lead note error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
