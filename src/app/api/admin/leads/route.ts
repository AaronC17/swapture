import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all leads (admin)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, businessName: true } },
      },
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('List leads error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
