'use client'

import { useEffect, useState } from 'react'
import { User, Lock, Loader2, Shield, Mail } from 'lucide-react'

interface AccountData {
  name: string
  email: string
  plan: string
  status: string
  businessName: string
  subscriptionStart: string | null
  monthlyPrice: number
}

const planLabels: Record<string, string> = {
  starter: 'Básico', growth: 'Crecimiento', scale: 'Premium',
}

export default function ClientAccountPage() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/client/account')
      .then(r => r.json())
      .then(d => setData(d.account))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMessage(null)

    if (newPw.length < 6) {
      setPwMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }
    if (newPw !== confirmPw) {
      setPwMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/client/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const result = await res.json()
      if (!res.ok) {
        setPwMessage({ type: 'error', text: result.error || 'Error al cambiar contraseña' })
      } else {
        setPwMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' })
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Error de conexión' })
    }
    setPwLoading(false)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
  }

  if (!data) return <div className="text-center py-20 text-muted">No se pudo cargar tu información</div>

  const cls = "w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mi cuenta</h1>
        <p className="text-muted text-sm mt-1">Tu información personal y tu plan</p>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-2">
          <User size={14} /> Información de la cuenta
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xs text-muted mb-1">Nombre</p>
            <p className="text-sm font-medium">{data.name}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xs text-muted mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
            <p className="text-sm font-medium">{data.email}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xs text-muted mb-1">Negocio</p>
            <p className="text-sm font-medium">{data.businessName}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03]">
            <p className="text-xs text-muted mb-1">Plan</p>
            <p className="text-sm font-medium">{planLabels[data.plan] || data.plan} — <span className="text-white/60">${data.monthlyPrice.toLocaleString()}/mes</span></p>
          </div>
        </div>
        {data.subscriptionStart && (
          <p className="text-xs text-muted">
            Cliente desde: {new Date(data.subscriptionStart).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Lock size={14} /> Cambiar contraseña
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {pwMessage && (
            <div className={`p-3 rounded-xl text-sm ${pwMessage.type === 'error' ? 'bg-negative/10 border border-negative/20 text-negative' : 'bg-positive/10 border border-positive/20 text-positive'}`}>
              {pwMessage.text}
            </div>
          )}
          <div>
            <label className="block text-sm text-muted mb-1">Contraseña actual</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className={cls} placeholder="Tu contraseña actual" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Nueva contraseña</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className={cls} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Confirmar nueva contraseña</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className={cls} placeholder="Repite la nueva contraseña" />
          </div>
          <button type="submit" disabled={pwLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50">
            {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
