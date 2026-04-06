import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function getRangeStart(range: string): Date | null {
  const now = new Date()
  if (range === '7d') {
    now.setDate(now.getDate() - 7)
    return now
  }
  if (range === '30d') {
    now.setDate(now.getDate() - 30)
    return now
  }
  if (range === '90d') {
    now.setDate(now.getDate() - 90)
    return now
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedRange = searchParams.get('range') || 'all'
    const range = ['7d', '30d', '90d', 'all'].includes(requestedRange) ? requestedRange : 'all'
    const source = (searchParams.get('source') || 'all').trim()
    const status = (searchParams.get('status') || 'all').trim()
    const q = (searchParams.get('q') || '').trim()

    const user = await getCurrentUser()
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({ where: { userId: user.userId } })
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const rangeStart = getRangeStart(range)
    const where: Record<string, unknown> = { clientId: client.id }
    if (rangeStart) where.createdAt = { gte: rangeStart }
    if (source !== 'all') where.source = source
    if (status !== 'all') where.status = status
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ]
    }

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })

    return NextResponse.json({ leads, range })
  } catch (error) {
    console.error('Client leads error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
