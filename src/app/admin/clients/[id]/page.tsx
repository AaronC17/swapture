'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, MessageSquare, Plus, Globe, Zap, Users, Check, ExternalLink } from 'lucide-react'

interface ClientDetail {
  id: string
  businessName: string
  businessType: string
  phone: string
  website: string
  domain: string
  slug: string
  status: string
  plan: string
  brandColor: string
  description: string
  services: string
  monthlyPrice: number
  subscriptionStart: string | null
  subscriptionEnd: string | null
  createdAt: string
  websiteStatus: string
  automationStatus: string
  crmStatus: string
  whatsappNumber: string
  googleAnalytics: string
  facebookPixel: string
  customNotes: string
  user: { id: string; name: string; email: string; active: boolean }
  leads: Array<{ id: string; name: string; email: string; phone: string; source: string; status: string; createdAt: string }>
  notes: Array<{ id: string; content: string; author: string; createdAt: string }>
}

const leadStatusLabels: Record<string, string> = {
  new: 'Nuevo', contacted: 'En conversación', qualified: 'Muy interesado', converted: '¡Es cliente!', lost: 'No interesado'
}
const leadStatusColors: Record<string, string> = {
  new: 'text-white/70 bg-white/[0.06]', contacted: 'text-white/70 bg-white/[0.06]',
  qualified: 'text-white/70 bg-white/[0.06]', converted: 'text-white/70 bg-white/[0.06]', lost: 'text-white/40 bg-white/[0.04]'
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [tab, setTab] = useState<'config' | 'setup' | 'leads' | 'notes'>('config')
  const [newNote, setNewNote] = useState('')

  const fetchClient = () => {
    fetch(`/api/admin/clients/${id}`)
      .then(r => r.json())
      .then(d => setClient(d.client))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClient() }, [id])

  const updateField = (field: string, value: string | number | boolean) => {
    setClient(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async () => {
    if (!client) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: client.businessName,
          businessType: client.businessType,
          phone: client.phone,
          website: client.website,
          domain: client.domain,
          status: client.status,
          plan: client.plan,
          brandColor: client.brandColor,
          description: client.description,
          services: client.services,
          monthlyPrice: client.monthlyPrice,
          websiteStatus: client.websiteStatus,
          automationStatus: client.automationStatus,
          crmStatus: client.crmStatus,
          whatsappNumber: client.whatsappNumber,
          googleAnalytics: client.googleAnalytics,
          facebookPixel: client.facebookPixel,
          customNotes: client.customNotes,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSaveMsg({ type: 'err', text: data.error || 'Error al guardar' })
      } else {
        setSaveMsg({ type: 'ok', text: '¡Cambios guardados correctamente!' })
        setTimeout(() => setSaveMsg(null), 3000)
      }
    } catch (err) {
      console.error(err)
      setSaveMsg({ type: 'err', text: 'Error de conexión' })
    }
    setSaving(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    await fetch(`/api/admin/clients/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    })
    setNewNote('')
    fetchClient()
  }

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchClient()
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este cliente y todos sus datos? Esta acción no se puede deshacer.')) return
    await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
    router.push('/admin/clients')
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
  }

  if (!client) {
    return <div className="text-center py-20 text-muted">Cliente no encontrado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/clients" className="text-muted hover:text-white transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold truncate">{client.businessName}</h1>
            <p className="text-muted text-xs sm:text-sm truncate">{client.user.name} — {client.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {client.slug && client.status === 'active' && (
            <a href={`/site/${client.slug}`} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all flex items-center gap-2">
              <ExternalLink size={14} /> Ver página
            </a>
          )}
          <button onClick={handleDelete} className="px-4 py-2 text-sm text-negative hover:bg-negative/10 rounded-xl transition-all flex items-center gap-2">
            <Trash2 size={14} /> Eliminar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-white/[0.08] text-white text-sm font-medium rounded-xl hover:bg-white/[0.14] transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>
      </div>

      {/* Save feedback */}
      {saveMsg && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${saveMsg.type === 'ok' ? 'bg-positive/10 border border-positive/20 text-positive' : 'bg-negative/10 border border-negative/20 text-negative'}`}>
          {saveMsg.type === 'ok' ? '✓' : '✕'} {saveMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit min-w-fit">
          {(['config', 'setup', 'leads', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab === t ? 'bg-white/[0.10] text-white' : 'text-muted hover:text-white'}`}>
              {t === 'config' ? 'Datos' : t === 'setup' ? '🚀 Progreso' : t === 'leads' ? `Contactos (${client.leads.length})` : `Notas (${client.notes.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Config Tab */}
      {tab === 'config' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Negocio</span>
            <div className="space-y-3">
              <Field label="Nombre del negocio" value={client.businessName} onChange={v => updateField('businessName', v)} />
              <Field label="Tipo de negocio" value={client.businessType} onChange={v => updateField('businessType', v)} />
              <Field label="Teléfono" value={client.phone} onChange={v => updateField('phone', v)} />
              <Field label="Sitio web" value={client.website} onChange={v => updateField('website', v)} />
              <Field label="Dominio" value={client.domain} onChange={v => updateField('domain', v)} placeholder="ej: cliente.com" />
              <Field label="Slug (URL pública)" value={client.slug} onChange={v => updateField('slug', v)} placeholder="mi-negocio" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Estado y plan</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Estado</label>
                  <select value={client.status} onChange={e => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20">
                    <option value="pending">Por iniciar</option>
                    <option value="configuring">En preparación</option>
                    <option value="active">Funcionando</option>
                    <option value="paused">En pausa</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Plan</label>
                  <select value={client.plan} onChange={e => updateField('plan', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20">
                    <option value="starter">Básico</option>
                    <option value="growth">Crecimiento</option>
                    <option value="scale">Premium</option>
                  </select>
                </div>
              </div>
              <Field label="Precio mensual (MXN)" type="number" value={String(client.monthlyPrice)} onChange={v => updateField('monthlyPrice', Number(v))} />
            </div>

            <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Branding</span>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted">Color principal</label>
                <input type="color" value={client.brandColor} onChange={e => updateField('brandColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent" />
                <span className="text-sm text-muted">{client.brandColor}</span>
              </div>
              <Field label="Descripción del negocio" value={client.description} onChange={v => updateField('description', v)} textarea />
              <Field label="Servicios (separados por coma)" value={client.services} onChange={v => updateField('services', v)} textarea />
            </div>
          </div>
        </div>
      )}

      {/* Setup Tab */}
      {tab === 'setup' && (
        <div className="space-y-5">
          {/* Pipeline visual */}
          <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Progreso de implementación</span>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {[
                { key: 'websiteStatus', icon: Globe, label: 'Página web', statuses: { not_started: 'Sin empezar', designing: 'Diseñando', review: 'En revisión', published: 'Lista' } },
                { key: 'automationStatus', icon: Zap, label: 'Respuestas automáticas', statuses: { not_started: 'Sin empezar', configuring: 'Preparando', active: 'Activo' } },
                { key: 'crmStatus', icon: Users, label: 'Gestión de contactos', statuses: { not_started: 'Sin empezar', configuring: 'Preparando', active: 'Activo' } },
              ].map((step) => {
                const value = (client as unknown as Record<string, unknown>)[step.key] as string
                return (
                  <div key={step.key} className="p-3 rounded-lg border border-border/15 bg-white/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon size={13} className="text-muted" />
                      <span className="text-[11px] font-medium text-muted uppercase tracking-wide">{step.label}</span>
                    </div>
                    <select value={value} onChange={e => updateField(step.key, e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg bg-white/[0.03] border border-border/15 text-white focus:outline-none focus:border-white/20 cursor-pointer">
                      {Object.entries(step.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-muted/40 mt-3 text-center">Recuerda guardar después de hacer cambios</p>
          </div>

          {/* Integrations */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Integraciones</span>
              <Field label="WhatsApp del negocio" value={client.whatsappNumber || ''} onChange={v => updateField('whatsappNumber', v)} placeholder="+52 55 1234 5678" />
              <Field label="Google Analytics ID" value={client.googleAnalytics || ''} onChange={v => updateField('googleAnalytics', v)} placeholder="G-XXXXXXXXXX" />
              <Field label="Facebook Pixel ID" value={client.facebookPixel || ''} onChange={v => updateField('facebookPixel', v)} placeholder="123456789012345" />
            </div>

            <div className="rounded-xl border border-border/20 bg-white/[0.02] p-5 space-y-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Notas del proyecto</span>
              <Field label="Notas internas" value={client.customNotes || ''} onChange={v => updateField('customNotes', v)} textarea placeholder="Apuntes sobre la implementación, preferencias del cliente, etc." />
            </div>
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        <>
          {client.leads.length === 0 ? (
            <div className="rounded-xl border border-border/20 p-12 text-center">
              <p className="text-sm text-muted">No hay contactos para este cliente</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 lg:hidden">
                {client.leads.map(lead => (
                  <div key={lead.id} className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted truncate">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-muted">{lead.phone}</p>}
                      </div>
                      <select value={lead.status} onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer shrink-0 ${leadStatusColors[lead.status] || ''}`}>
                        {Object.entries(leadStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="bg-white/[0.06] text-white/70 px-2 py-0.5 rounded-full">{lead.source}</span>
                      <span>{new Date(lead.createdAt).toLocaleDateString('es')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block rounded-xl border border-border/20 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] text-muted text-left">
                      <th className="px-5 py-3 font-medium">Nombre</th>
                      <th className="px-5 py-3 font-medium">Contacto</th>
                      <th className="px-5 py-3 font-medium">Fuente</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {client.leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-medium">{lead.name}</td>
                        <td className="px-5 py-3">
                          <p>{lead.email}</p>
                          <p className="text-xs text-muted">{lead.phone}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-white/[0.06] text-white/70 px-2 py-0.5 rounded-full">{lead.source}</span>
                        </td>
                        <td className="px-5 py-3">
                          <select value={lead.status} onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer ${leadStatusColors[lead.status] || ''}`}>
                            {Object.entries(leadStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-muted">{new Date(lead.createdAt).toLocaleDateString('es')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Notes Tab */}
      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              placeholder="Agregar nota interna..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-border/20 text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/40"
            />
            <button onClick={handleAddNote} className="px-4 py-2.5 bg-white/[0.08] text-white rounded-lg hover:bg-white/[0.12] transition-all">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {client.notes.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No hay notas aún</p>
            ) : client.notes.map(note => (
              <div key={note.id} className="p-3 rounded-lg border border-border/15 bg-white/[0.01]">
                <p className="text-sm text-white/80">{note.content}</p>
                <p className="text-[11px] text-muted/50 mt-1.5">{new Date(note.createdAt).toLocaleString('es')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean
}) {
  const cls = "w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 placeholder:text-muted/50"
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}
