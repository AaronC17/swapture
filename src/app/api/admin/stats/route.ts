import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalClients, activeClients, totalLeads, newLeadsToday, recentLeads, recentClients] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'active' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { businessName: true } } },
      }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, businessName: true, status: true, plan: true },
      }),
    ])

    return NextResponse.json({
      totalClients,
      activeClients,
      totalLeads,
      newLeadsToday,
      recentLeads: recentLeads.map(l => ({
        id: l.id,
        name: l.name,
        clientName: l.client.businessName,
        source: l.source,
        createdAt: l.createdAt.toISOString(),
      })),
      recentClients,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
