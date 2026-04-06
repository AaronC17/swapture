'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Phone, Mail, Send, X, Clock,
  ShoppingBag, User, MessageCircle, ChevronRight, Repeat,
  Pencil, Save, Trash2
} from 'lucide-react'

/* ─── types ─── */
interface Lead {
  id: string; name: string; email: string; phone: string; message: string
  source: string; status: string; createdAt: string; updatedAt: string
  orderDetails: string; totalAmount: number; tags: string; rating: number
  lastContactAt: string | null; convertedAt: string | null
}

interface LeadNote {
  id: string; content: string; author: string; createdAt: string
}

interface LeadActivity {
  id: string; type: string; detail: string; author: string; createdAt: string
}

interface LeadDetail extends Lead {
  notes: LeadNote[]; activities: LeadActivity[]
}

/* ─── constants ─── */
const sourceLabels: Record<string, string> = {
  website: 'Web',
  whatsapp: 'WhatsApp',
  'whatsapp-menu': 'WhatsApp (menú)',
  'whatsapp-chatbot': 'WhatsApp (chatbot)',
  manual: 'Manual',
  form: 'Formulario',
  chatbot: 'Chatbot',
}
const sourceEmoji: Record<string, string> = {
  website: '🌐',
  whatsapp: '📱',
  'whatsapp-menu': '🛒',
  'whatsapp-chatbot': '🤖',
  manual: '✏️',
  form: '📋',
  chatbot: '🤖',
}

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  converted: 'Convertido',
  lost: 'Perdido',
}

const statusColor: Record<string, string> = {
  new: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  contacted: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
  qualified: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  converted: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  lost: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
}

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/* ─── page ─── */
export default function ClientLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [sending, setSending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    status: 'new',
    tags: '',
    rating: 0,
  })

  const fetchLeads = useCallback(() => {
    fetch('/api/client/leads')
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  /* ─── derived ─── */
  const daysForPeriod = filterPeriod === '7d' ? 7 : filterPeriod === '30d' ? 30 : filterPeriod === '90d' ? 90 : 0
  const threshold = daysForPeriod > 0 ? new Date(Date.now() - daysForPeriod * 24 * 60 * 60 * 1000) : null

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    const matchSource = filterSource === 'all' || l.source === filterSource
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchPeriod = !threshold || new Date(l.createdAt) >= threshold
    return matchSearch && matchSource && matchStatus && matchPeriod
  })

  // Count how many times each person appears (by phone, as frequency indicator)
  const phoneCount: Record<string, number> = {}
  leads.forEach(l => { if (l.phone) phoneCount[l.phone] = (phoneCount[l.phone] || 0) + 1 })

  // Source counts for filter
  const sourceCounts = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const withOrders = leads.filter(l => l.totalAmount > 0).length
  const totalRevenue = leads.reduce((s, l) => s + l.totalAmount, 0)

  /* ─── handlers ─── */
  const openDetail = async (id: string) => {
    setDetailLoading(true)
    setSelectedLead(null)
    setEditing(false)
    try {
      const r = await fetch(`/api/client/leads/${id}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setSelectedLead(d.lead)
      setForm({
        name: d.lead.name || '',
        phone: d.lead.phone || '',
        email: d.lead.email || '',
        message: d.lead.message || '',
        status: d.lead.status || 'new',
        tags: d.lead.tags || '',
        rating: Number(d.lead.rating || 0),
      })
    } catch { /* noop */ }
    setDetailLoading(false)
  }

  const addNote = async () => {
    if (!selectedLead || !noteText.trim()) return
    setSending(true)
    try {
      await fetch(`/api/client/leads/${selectedLead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText.trim() }),
      })
      setNoteText('')
      openDetail(selectedLead.id)
    } catch { /* noop */ }
    setSending(false)
  }

  const saveLead = async () => {
    if (!selectedLead) return
    setSaving(true)
    try {
      const r = await fetch(`/api/client/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error()
      await fetchLeads()
      await openDetail(selectedLead.id)
      setEditing(false)
    } catch {
      // noop - keep drawer open so user can retry
    }
    setSaving(false)
  }

  const deleteLead = async () => {
    if (!selectedLead || deleting) return
    const ok = window.confirm('¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')
    if (!ok) return

    setDeleting(true)
    try {
      const r = await fetch(`/api/client/leads/${selectedLead.id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setSelectedLead(null)
      setEditing(false)
      setNoteText('')
      await fetchLeads()
    } catch {
      // noop - keep user in context if deletion fails
    }
    setDeleting(false)
  }

  const parseOrder = (details: string) => {
    try {
      const items = JSON.parse(details)
      if (Array.isArray(items)) return items as { name: string; qty: number; price: number }[]
    } catch { /* noop */ }
    return null
  }

  /* ─── render ─── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold">Usuarios</h1>
        <p className="text-muted text-sm mt-1">{filtered.length} de {leads.length} usuarios en el período</p>
      </div>

      {/* Quick summary */}
      {leads.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          {withOrders > 0 && (
            <span className="flex items-center gap-1.5 text-emerald-400/80">
              <ShoppingBag size={13} /> {withOrders} con pedidos · ₡{totalRevenue.toLocaleString()}
            </span>
          )}
          {Object.entries(sourceCounts).map(([source, count]) => (
            <span key={source} className="flex items-center gap-1 text-white/30">
              {sourceEmoji[source]} {count} por {sourceLabels[source] || source}
            </span>
          ))}
        </div>
      )}

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted/50 focus:outline-none focus:border-white/20 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={filterPeriod === '7d'} onClick={() => setFilterPeriod('7d')}>Semanal</FilterBtn>
          <FilterBtn active={filterPeriod === '30d'} onClick={() => setFilterPeriod('30d')}>Mensual</FilterBtn>
          <FilterBtn active={filterPeriod === '90d'} onClick={() => setFilterPeriod('90d')}>90 días</FilterBtn>
          <FilterBtn active={filterPeriod === 'all'} onClick={() => setFilterPeriod('all')}>Todo</FilterBtn>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={filterSource === 'all'} onClick={() => setFilterSource('all')}>Todos</FilterBtn>
          {Object.keys(sourceCounts).map(s => (
            <FilterBtn key={s} active={filterSource === s} onClick={() => setFilterSource(s)}>
              {sourceEmoji[s]} {sourceLabels[s] || s}
            </FilterBtn>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>Todos los estados</FilterBtn>
          <FilterBtn active={filterStatus === 'new'} onClick={() => setFilterStatus('new')}>Nuevos</FilterBtn>
          <FilterBtn active={filterStatus === 'contacted'} onClick={() => setFilterStatus('contacted')}>Contactados</FilterBtn>
          <FilterBtn active={filterStatus === 'qualified'} onClick={() => setFilterStatus('qualified')}>Calificados</FilterBtn>
          <FilterBtn active={filterStatus === 'converted'} onClick={() => setFilterStatus('converted')}>Convertidos</FilterBtn>
          <FilterBtn active={filterStatus === 'lost'} onClick={() => setFilterStatus('lost')}>Perdidos</FilterBtn>
        </div>
      </div>

      {/* Contact list */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          {search || filterSource !== 'all' ? 'No se encontraron usuarios' : 'Aún no tienes usuarios registrados'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const order = parseOrder(lead.orderDetails)
            const isFrequent = lead.phone && phoneCount[lead.phone] > 1
            return (
              <div key={lead.id}
                onClick={() => openDetail(lead.id)}
                className="flex items-start gap-3 p-4 rounded-xl border border-border/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-sm font-bold text-white/40 uppercase">
                  {lead.name.charAt(0)}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{lead.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColor[lead.status] || 'text-white/60 border-white/15 bg-white/[0.05]'}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                    {isFrequent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400/80 font-medium flex items-center gap-0.5">
                        <Repeat size={8} /> Frecuente
                      </span>
                    )}
                    {lead.totalAmount > 0 && (
                      <span className="text-[11px] text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded font-medium">
                        ₡{lead.totalAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted">
                    {lead.phone && <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>}
                    {lead.email && <span className="flex items-center gap-1"><Mail size={10} />{lead.email}</span>}
                  </div>

                  {/* Order details */}
                  {order && (
                    <p className="text-[11px] text-white/25 mt-1.5">
                      🛒 {order.map(i => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                  )}

                  {/* Message if no order */}
                  {!lead.totalAmount && lead.message && (
                    <p className="text-xs text-white/20 mt-1 line-clamp-1">💬 {lead.message}</p>
                  )}
                </div>

                {/* Right side */}
                <div className="text-right shrink-0 space-y-1">
                  <span className="text-[11px] text-white/30">
                    {sourceEmoji[lead.source]} {sourceLabels[lead.source] || lead.source}
                  </span>
                  <p className="text-[10px] text-muted/40 flex items-center gap-1 justify-end">
                    <Clock size={9} /> {timeAgo(lead.createdAt)}
                  </p>
                  <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors ml-auto" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail drawer */}
      {(selectedLead || detailLoading) && (
        <ContactDrawer
          lead={selectedLead}
          loading={detailLoading}
          noteText={noteText}
          setNoteText={setNoteText}
          sending={sending}
          onAddNote={addNote}
          onClose={() => { setSelectedLead(null); setNoteText(''); setEditing(false) }}
          phoneCount={phoneCount}
          editing={editing}
          setEditing={setEditing}
          form={form}
          setForm={setForm}
          onSave={saveLead}
          saving={saving}
          onDelete={deleteLead}
          deleting={deleting}
        />
      )}
    </div>
  )
}

/* ━━━━━━━━━━ Filter button ━━━━━━━━━━ */
function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-white/[0.1] text-white' : 'text-muted hover:text-white/70 hover:bg-white/[0.04]'}`}
    >
      {children}
    </button>
  )
}

/* ━━━━━━━━━━ Contact detail drawer ━━━━━━━━━━ */
function ContactDrawer({
  lead, loading, noteText, setNoteText, sending, onAddNote, onClose, phoneCount,
  editing, setEditing, form, setForm, onSave, saving, onDelete, deleting
}: {
  lead: LeadDetail | null; loading: boolean
  noteText: string; setNoteText: (v: string) => void; sending: boolean
  onAddNote: () => void; onClose: () => void
  phoneCount: Record<string, number>
  editing: boolean
  setEditing: (v: boolean) => void
  form: {
    name: string
    phone: string
    email: string
    message: string
    status: string
    tags: string
    rating: number
  }
  setForm: React.Dispatch<React.SetStateAction<{
    name: string
    phone: string
    email: string
    message: string
    status: string
    tags: string
    rating: number
  }>>
  onSave: () => void
  saving: boolean
  onDelete: () => void
  deleting: boolean
}) {
  const parseOrder = (details: string) => {
    try {
      const items = JSON.parse(details)
      if (Array.isArray(items)) return items as { name: string; qty: number; price: number }[]
    } catch { /* noop */ }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111115] border-l border-white/[0.08] h-full overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white z-10">
          <X size={18} />
        </button>

        {loading || !lead ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-lg font-bold text-white/40 uppercase shrink-0">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-white">{lead.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted">
                    {sourceEmoji[lead.source]} {sourceLabels[lead.source] || lead.source}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColor[lead.status] || 'text-white/60 border-white/15 bg-white/[0.05]'}`}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  {lead.phone && phoneCount[lead.phone] > 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400/80 font-medium flex items-center gap-0.5">
                      <Repeat size={8} /> Usuario frecuente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.15] hover:bg-white/[0.05] text-xs"
                >
                  <Pencil size={12} /> Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-400/25 text-emerald-300 hover:bg-emerald-400/10 text-xs disabled:opacity-50"
                  >
                    <Save size={12} /> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.15] hover:bg-white/[0.05] text-xs"
                  >
                    Cancelar
                  </button>
                </>
              )}
              <button
                onClick={onDelete}
                disabled={deleting}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-400/25 text-rose-300 hover:bg-rose-400/10 text-xs disabled:opacity-50"
              >
                <Trash2 size={12} /> {deleting ? 'Eliminando...' : 'Borrar'}
              </button>
            </div>

            {/* Editable fields */}
            {editing && (
              <div className="space-y-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                    placeholder="Nombre"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                    placeholder="Teléfono"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                    placeholder="Email"
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                  >
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="qualified">Calificado</option>
                    <option value="converted">Convertido</option>
                    <option value="lost">Perdido</option>
                  </select>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                    placeholder="Tags (separados por coma)"
                  />
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value || 0) }))}
                    className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
                    placeholder="Rating 0-5"
                  />
                </div>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm min-h-[92px]"
                  placeholder="Mensaje del usuario"
                />
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-2">
              {lead.phone && (
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                  <Phone size={16} className="text-green-400/60" />
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{lead.phone}</p>
                    <p className="text-[10px] text-green-400/50">Abrir WhatsApp</p>
                  </div>
                  <ChevronRight size={14} className="text-white/15" />
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                  <Mail size={16} className="text-blue-400/60" />
                  <p className="text-sm text-white/80 flex-1">{lead.email}</p>
                  <ChevronRight size={14} className="text-white/15" />
                </a>
              )}
            </div>

            {/* Order details */}
            {lead.totalAmount > 0 && (
              <div className="p-4 rounded-xl bg-emerald-400/[0.05] border border-emerald-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={14} className="text-emerald-400/70" />
                  <span className="text-xs text-emerald-400/60 font-medium">Pedido</span>
                  <span className="ml-auto text-lg font-bold text-emerald-400">₡{lead.totalAmount.toLocaleString()}</span>
                </div>
                {(() => {
                  const order = parseOrder(lead.orderDetails)
                  if (!order) return lead.orderDetails ? <p className="text-xs text-white/30">{lead.orderDetails}</p> : null
                  return (
                    <div className="space-y-1 mt-2">
                      {order.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/50">{item.qty}x {item.name}</span>
                          <span className="text-white/30">₡{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Message */}
            {lead.message && !editing && (
              <div>
                <p className="text-xs text-muted mb-1.5 flex items-center gap-1"><MessageCircle size={11} /> Mensaje</p>
                <p className="text-sm text-white/60 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">{lead.message}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 text-xs text-muted">
              <div>
                <p className="text-muted/40 mb-0.5">Registrado</p>
                <p>{new Date(lead.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              {lead.lastContactAt && (
                <div>
                  <p className="text-muted/40 mb-0.5">Última compra</p>
                  <p>{new Date(lead.lastContactAt).toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>
                </div>
              )}
            </div>

            {/* Add note */}
            <div>
              <p className="text-xs text-muted mb-2 font-medium">Añadir una nota</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Ya le confirme el pedido..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onAddNote()}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-muted/40 focus:outline-none focus:border-white/20"
                />
                <button
                  onClick={onAddNote}
                  disabled={sending || !noteText.trim()}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white/70 disabled:opacity-30 transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Notes list */}
            {lead.notes.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2 font-medium">Notas ({lead.notes.length})</p>
                <div className="space-y-2">
                  {lead.notes.map(note => (
                    <div key={note.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-sm text-white/70">{note.content}</p>
                      <p className="text-[10px] text-muted/40 mt-1.5 flex items-center gap-1">
                        <User size={9} />
                        {new Date(note.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })} — {new Date(note.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
