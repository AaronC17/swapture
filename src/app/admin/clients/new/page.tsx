'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    phone: '',
    plan: 'starter',
    monthlyPrice: 0,
  })

  const update = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al crear cliente')
        setLoading(false)
        return
      }

      router.push(`/admin/clients/${data.client.id}`)
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients" className="text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold">Nuevo cliente</h1>
          <p className="text-muted text-sm mt-1">Crea una cuenta y configura su sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-negative/10 border border-negative/20 text-negative text-sm">{error}</div>
        )}

        {/* Datos de acceso */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Datos de acceso</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Nombre completo</label>
              <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Contraseña temporal</label>
            <input type="text" required value={form.password} onChange={e => update('password', e.target.value)}
              placeholder="Contraseña que le darás al cliente"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50" />
          </div>
        </div>

        {/* Info del negocio */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Información del negocio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Nombre del negocio</label>
              <input type="text" required value={form.businessName} onChange={e => update('businessName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Tipo de negocio</label>
              <input type="text" value={form.businessType} onChange={e => update('businessType', e.target.value)}
                placeholder="Restaurante, clínica, etc."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Teléfono / WhatsApp</label>
            <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20" />
          </div>
        </div>

        {/* Plan */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Plan y precio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Plan</label>
              <select value={form.plan} onChange={e => update('plan', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20">
                <option value="starter">Básico</option>
                <option value="growth">Crecimiento</option>
                <option value="scale">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Precio mensual (MXN)</label>
              <input type="number" min={0} value={form.monthlyPrice} onChange={e => update('monthlyPrice', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Creando...</> : 'Crear cliente'}
        </button>
      </form>
    </div>
  )
}
