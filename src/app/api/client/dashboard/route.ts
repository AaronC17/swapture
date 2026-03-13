import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const allLeads: any[] = await (prisma.lead as any).findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
    })

    // Simple useful stats derived from leads
    const totalContacts = allLeads.length
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const newThisWeek = allLeads.filter(l => new Date(l.createdAt) >= weekAgo).length
    const ordersCount = allLeads.filter(l => l.totalAmount > 0).length
    const totalRevenue = allLeads.reduce((s, l) => s + l.totalAmount, 0)
    const chatbotLeads = allLeads.filter(l => l.source === 'chatbot').length

    // Frequency: count by phone number
    const phoneMap: Record<string, number> = {}
    allLeads.forEach(l => { if (l.phone) phoneMap[l.phone] = (phoneMap[l.phone] || 0) + 1 })
    const frequentCount = Object.values(phoneMap).filter(c => c >= 2).length

    // WhatsApp source leads
    const whatsappLeads = allLeads.filter(l => l.source === 'whatsapp').length

    // Recent 10
    const recentLeads = allLeads.slice(0, 10)

    return NextResponse.json({
      businessName: client.businessName,
      slug: client.slug,
      status: client.status,
      plan: client.plan,
      totalContacts,
      newThisWeek,
      ordersCount,
      totalRevenue,
      frequentCount,
      whatsappLeads,
      chatbotLeads,
      recentLeads: recentLeads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        source: l.source,
        status: l.status,
        totalAmount: l.totalAmount,
        orderDetails: l.orderDetails,
        message: l.message,
        createdAt: l.createdAt.toISOString(),
        lastContactAt: l.lastContactAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    console.error('Client dashboard error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
