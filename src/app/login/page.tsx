'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      if (data.user.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5 overflow-hidden">
            <Image
              src="/logotipo.png"
              alt="Swapture"
              fill
              sizes="64px"
              className="object-contain mix-blend-screen"
            />
          </div>
          <h1 className="text-xl font-heading font-bold tracking-tight mb-1">
            Accede a tu panel
          </h1>
          <p className="text-sm text-muted">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-surface/[0.35] border border-border/50 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.1),inset_0_-1px_1px_0_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/10 pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-negative/10 border border-negative/20 flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-negative shrink-0" />
                <span className="text-negative text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-bg/80 border border-border/60 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-bg/80 border border-border/60 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent/[0.08] border border-accent/30 text-accent-light font-semibold rounded-full text-sm hover:bg-accent/15 hover:border-accent/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-muted/60 mt-8">
          © {new Date().getFullYear()} Swapture. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
