'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'

interface BusinessInfo {
  businessName: string
  businessType: string
  phone: string
  description: string
  services: string
}

export default function ClientInfoPage() {
  const [info, setInfo] = useState<BusinessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/client/info')
      .then(r => r.json())
      .then(d => setInfo(d.info))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!info) return
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/client/info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
  }

  if (!info) return <div className="text-center py-20 text-muted">No se pudo cargar la información</div>

  const cls = "w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50"

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">Mi negocio</h1>
          <p className="text-muted text-sm mt-1">Actualiza la información básica de tu negocio</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 shrink-0">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">Nombre del negocio</label>
          <input type="text" value={info.businessName} onChange={e => setInfo({ ...info, businessName: e.target.value })} className={cls} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Tipo de negocio</label>
          <input type="text" value={info.businessType} onChange={e => setInfo({ ...info, businessType: e.target.value })} className={cls} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Teléfono / WhatsApp</label>
          <input type="text" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} className={cls} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Descripción</label>
          <textarea value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })} rows={3} className={`${cls} resize-none`} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Servicios (separados por coma)</label>
          <textarea value={info.services} onChange={e => setInfo({ ...info, services: e.target.value })} rows={2} className={`${cls} resize-none`} />
        </div>
      </div>
    </div>
  )
}
