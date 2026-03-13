'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, MessageSquare, FileText, User, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Usuarios', icon: MessageSquare },
  { href: '/dashboard/info', label: 'Mi negocio', icon: FileText },
  { href: '/dashboard/account', label: 'Mi cuenta', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) throw new Error('unauthorized')
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        if (!data.user) {
          setRedirecting(true)
          // Cookie already cleared by /api/auth/me — navigate to login
          window.location.replace('/login')
        } else if (data.user.role === 'admin') {
          setRedirecting(true)
          window.location.replace('/admin')
        } else {
          setUser(data.user)
          setLoading(false)
        }
      })
      .catch(() => {
        if (cancelled) return
        setRedirecting(true)
        // Explicitly clear cookie then redirect
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          window.location.replace('/login')
        })
      })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white/70 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-bg border-r border-border/40 flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 px-5 border-b border-border/40 flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/image.png" alt="Swapture" width={100} height={100} className="w-8 h-8 object-contain brightness-[1.2]" />
            <span className="text-lg font-heading font-bold tracking-tight">
              SWAP<span className="text-accent">TURE.</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold text-muted/50 uppercase tracking-[0.15em]">
            Mi panel
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-muted hover:text-white hover:bg-white/[0.03]'
                )}
              >
                <item.icon size={18} className={isActive ? 'text-white/70' : ''} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-white/30" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/40 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/70 text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:text-negative hover:bg-negative/5 transition-all"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-bg/80 backdrop-blur-xl border-b border-border/40 px-5 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-muted bg-white/[0.05] px-3 py-1.5 rounded-full font-medium">
            Mi panel
          </span>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
