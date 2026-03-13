import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'swapture-token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'swapture-dev-secret')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isLoginRoute = pathname === '/login'

  const token = req.cookies.get(COOKIE_NAME)?.value

  // If no token and trying to access protected route → redirect to login
  if (!token && (isAdminRoute || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If has token, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string

      // If on login page and already authenticated → redirect to panel
      if (isLoginRoute) {
        const dest = role === 'admin' ? '/admin' : '/dashboard'
        return NextResponse.redirect(new URL(dest, req.url))
      }

      // If client tries to access admin → redirect
      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // If admin tries to access client dashboard → allow (admin can see everything)
      // Continue
    } catch {
      // Invalid token → clear cookie and redirect
      if (isAdminRoute || isDashboardRoute) {
        const response = NextResponse.redirect(new URL('/login', req.url))
        response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
}
