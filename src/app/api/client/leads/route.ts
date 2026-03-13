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
      include: { leads: { orderBy: { createdAt: 'desc' } } },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ leads: client.leads })
  } catch (error) {
    console.error('Client leads error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
