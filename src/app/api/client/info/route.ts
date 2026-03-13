import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, safeJsonParse } from '@/lib/security'

// GET client info
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
      select: { businessName: true, businessType: true, phone: true, description: true, services: true },
    })

    return NextResponse.json({ info: client })
  } catch (error) {
    console.error('Client info error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH update client info (limited fields)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await safeJsonParse(req)
    if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

    // Client can only update these specific fields — sanitize each
    const fieldLimits: Record<string, number> = { businessName: 200, businessType: 100, phone: 20, description: 1000, services: 1000 }
    const data: Record<string, string> = {}
    for (const [key, max] of Object.entries(fieldLimits)) {
      if (body[key] !== undefined) data[key] = sanitizeString(body[key], max)
    }

    const client = await prisma.client.update({
      where: { userId: user.userId },
      data,
    })

    return NextResponse.json({ info: client })
  } catch (error) {
    console.error('Update client info error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
