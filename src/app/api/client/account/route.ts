import { NextResponse } from 'next/server'
import { getCurrentUser, comparePassword, hashPassword } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { rateLimit, getClientIp, LOGIN_LIMIT } from '@/lib/security'

// GET account info
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json({
      account: {
        name: client?.user?.name || '',
        email: user.email,
        plan: client?.plan || 'N/A',
        status: client?.status || 'N/A',
        businessName: client?.businessName || '',
        subscriptionStart: client?.createdAt || null,
        monthlyPrice: client?.monthlyPrice || 0,
      },
    })
  } catch (error) {
    console.error('Account GET error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - change password
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Rate limit password changes
  const ip = getClientIp(request)
  const rl = rateLimit(`pw:${ip}`, LOGIN_LIMIT.max, LOGIN_LIMIT.window)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 }) }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  if (newPassword.length < 6 || newPassword.length > 128) {
    return NextResponse.json({ error: 'La nueva contraseña debe tener entre 6 y 128 caracteres' }, { status: 400 })
  }

  // Verify current password
  const fullUser = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!fullUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const valid = await comparePassword(currentPassword, fullUser.password)
  if (!valid) {
    return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 403 })
  }

  // Update password
  const hashed = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.userId },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true })
}
