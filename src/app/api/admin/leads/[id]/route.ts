import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { safeJsonParse } from '@/lib/security'

// PATCH update lead status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await safeJsonParse(req)
    const status = String(body?.status || '')

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
