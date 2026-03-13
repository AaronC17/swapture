import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sanitizeString, sanitizeEmail, safeJsonParse } from '@/lib/security'

// GET all clients
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { leads: true } },
      },
    })

    return NextResponse.json({
      clients: clients.map(c => ({
        id: c.id,
        businessName: c.businessName,
        status: c.status,
        plan: c.plan,
        phone: c.phone,
        domain: c.domain,
        leadsCount: c._count.leads,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
      })),
    })
  } catch (error) {
    console.error('List clients error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST create new client
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await safeJsonParse(req)
    if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

    const name = sanitizeString(body.name, 100)
    const email = sanitizeEmail(body.email)
    const password = typeof body.password === 'string' ? body.password : ''
    const businessName = sanitizeString(body.businessName, 200)
    const businessType = sanitizeString(body.businessType, 100)
    const phone = sanitizeString(body.phone, 20)
    const plan = ['starter', 'growth', 'scale'].includes(String(body.plan)) ? String(body.plan) : 'starter'
    const monthlyPrice = Math.max(0, Number(body.monthlyPrice) || 0)

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: 'Nombre, email, contraseña y nombre de negocio son requeridos' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'El formato del email no es válido' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    // Create user + client sequentially
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'client',
      },
    })

    let client
    try {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          businessName,
          businessType,
          phone,
          plan,
          monthlyPrice,
          status: 'pending',
          slug: businessName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36),
          subscriptionStart: new Date(),
        },
      })
    } catch (err) {
      // Cleanup user if client creation fails
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
      throw err
    }

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
