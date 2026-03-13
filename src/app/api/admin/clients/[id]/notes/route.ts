import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

// POST add note to client
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await safeJsonParse(req)
    const content = sanitizeString(body?.content, 2000)

    if (!content) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        clientId: id,
        content,
        author: 'admin',
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
