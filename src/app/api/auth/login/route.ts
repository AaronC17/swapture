import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, createToken, COOKIE_NAME } from '@/lib/auth'
import { sanitizeString, rateLimit, getClientIp, safeJsonParse, LOGIN_LIMIT } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    // Rate limit login attempts
    const ip = getClientIp(req)
    const rl = rateLimit(`login:${ip}`, LOGIN_LIMIT.max, LOGIN_LIMIT.window)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta en unos minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
      )
    }

    const body = await safeJsonParse(req)
    if (!body) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }

    const email = sanitizeString(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 })
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'client',
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 })
  }
}
