import { NextResponse } from 'next/server'
import { getCurrentUser, COOKIE_NAME } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tokenUser = await getCurrentUser()
    if (!tokenUser) {
      const res = NextResponse.json({ user: null }, { status: 401 })
      res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return res
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, name: true, email: true, role: true, active: true },
    })

    if (!user || !user.active) {
      const res = NextResponse.json({ user: null }, { status: 401 })
      res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return res
    }

    return NextResponse.json({ user })
  } catch {
    const res = NextResponse.json({ user: null }, { status: 401 })
    res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return res
  }
}
