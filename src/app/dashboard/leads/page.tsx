'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Phone, Mail, Clock, ChevronRight, X, ShoppingBag, MessageCircle, Send, User } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: string
  createdAt: string
  orderDetails: string
  totalAmount: number
  lastContactAt: string | null
}

interface LeadNote {
  id: string
  content: string
  createdAt: string
}

interface LeadActivity {
  id: string
  type: string
  detail: string
  createdAt: string
}

interface LeadDetail extends Lead {
  notes: LeadNote[]
  activities: LeadActivity[]
}

const sourceLabels: Record<string, string> = {
  website: 'Web',
  whatsapp: 'WhatsApp',
  'whatsapp-menu': 'WhatsApp (menu)',
  'whatsapp-chatbot': 'WhatsApp (chatbot)',
  manual: 'Manual',
  form: 'Formulario',
  chatbot: 'Chatbot',
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} d`
}

function matchesPeriod(createdAt: string, period: '1d' | '7d' | '30d' | 'all'): boolean {
  if (period === 'all') return true

  const date = new Date(createdAt)
  if (period === '1d') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const days = period === '7d' ? 7 : 30
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return date >= threshold
}

export default function ClientLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<'1d' | '7d' | '30d' | 'all'>('30d')

  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [sending, setSending] = useState(false)

  const fetchLeads = useCallback(() => {
    setLoading(true)
    fetch('/api/client/leads')
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filtered = leads.filter((l) => {
    const text = `${l.name} ${l.phone} ${l.email}`.toLowerCase()
    const matchSearch = text.includes(search.toLowerCase())
    const matchTime = matchesPeriod(l.createdAt, period)
    return matchSearch && matchTime
  })

  const openDetail = async (id: string) => {
    setSelectedLead(null)
    setDetailLoading(true)
    try {
      const r = await fetch(`/api/client/leads/${id}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setSelectedLead(d.lead)
    } catch {
      setSelectedLead(null)
    }
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
      await openDetail(selectedLead.id)
    } catch {
      // noop
    }
    setSending(false)
  }

  const ordersCount = filtered.filter((l) => l.totalAmount > 0).length
  const totalRevenue = filtered.reduce((sum, l) => sum + (l.totalAmount || 0), 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold">Clientes</h1>
        <p className="text-muted text-sm mt-1">
          {filtered.length} clientes · {ordersCount} pedidos · CRC {totalRevenue.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o telefono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted/50 focus:outline-none focus:border-white/20 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={period === '1d'} onClick={() => setPeriod('1d')}>Hoy</FilterBtn>
          <FilterBtn active={period === '7d'} onClick={() => setPeriod('7d')}>Semanal</FilterBtn>
          <FilterBtn active={period === '30d'} onClick={() => setPeriod('30d')}>Mensual</FilterBtn>
          <FilterBtn active={period === 'all'} onClick={() => setPeriod('all')}>Todo</FilterBtn>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">No hay clientes para este filtro</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <button
              key={lead.id}
              onClick={() => openDetail(lead.id)}
              className="w-full text-left flex items-start gap-3 p-4 rounded-xl border border-border/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-sm font-bold text-white/40 uppercase">
                {lead.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{lead.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted">
                  {lead.phone && <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>}
                  {lead.email && <span className="flex items-center gap-1"><Mail size={10} />{lead.email}</span>}
                </div>
                {lead.message && lead.totalAmount <= 0 && (
                  <p className="text-xs text-white/25 mt-1 line-clamp-1">{lead.message}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-emerald-400">
                  {lead.totalAmount > 0 ? `CRC ${lead.totalAmount.toLocaleString()}` : 'Sin compra'}
                </p>
                <p className="text-[10px] text-muted mt-1 flex items-center gap-1 justify-end">
                  <Clock size={9} /> {timeAgo(lead.createdAt)}
                </p>
                <p className="text-[10px] text-white/35 mt-1">{sourceLabels[lead.source] || lead.source}</p>
                <ChevronRight size={14} className="text-white/20 ml-auto mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}

      {(selectedLead || detailLoading) && (
        <LeadDrawer
          lead={selectedLead}
          loading={detailLoading}
          noteText={noteText}
          setNoteText={setNoteText}
          sending={sending}
          onAddNote={addNote}
          onClose={() => {
            setSelectedLead(null)
            setNoteText('')
          }}
        />
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-white/[0.12] text-white' : 'text-muted hover:text-white/70 hover:bg-white/[0.04]'
      }`}
    >
      {children}
    </button>
  )
}

function LeadDrawer({
  lead,
  loading,
  noteText,
  setNoteText,
  sending,
  onAddNote,
  onClose,
}: {
  lead: LeadDetail | null
  loading: boolean
  noteText: string
  setNoteText: (v: string) => void
  sending: boolean
  onAddNote: () => void
  onClose: () => void
}) {
  const parseOrder = (details: string) => {
    try {
      const items = JSON.parse(details)
      if (Array.isArray(items)) return items as { name: string; qty: number; price: number }[]
    } catch {
      // noop
    }
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
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-lg font-bold text-white/40 uppercase shrink-0">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-white">{lead.name}</h2>
                <p className="text-xs text-muted mt-1">{sourceLabels[lead.source] || lead.source}</p>
              </div>
            </div>

            <div className="space-y-2">
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                >
                  <Phone size={16} className="text-green-400/60" />
                  <p className="text-sm text-white/80 flex-1">{lead.phone}</p>
                  <ChevronRight size={14} className="text-white/15" />
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                >
                  <Mail size={16} className="text-blue-400/60" />
                  <p className="text-sm text-white/80 flex-1">{lead.email}</p>
                  <ChevronRight size={14} className="text-white/15" />
                </a>
              )}
            </div>

            {lead.totalAmount > 0 && (
              <div className="p-4 rounded-xl bg-emerald-400/[0.05] border border-emerald-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={14} className="text-emerald-400/70" />
                  <span className="text-xs text-emerald-400/60 font-medium">Pedido</span>
                  <span className="ml-auto text-lg font-bold text-emerald-400">CRC {lead.totalAmount.toLocaleString()}</span>
                </div>
                {(() => {
                  const order = parseOrder(lead.orderDetails)
                  if (!order) return null
                  return (
                    <div className="space-y-1 mt-2">
                      {order.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/50">{item.qty}x {item.name}</span>
                          <span className="text-white/30">CRC {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

            {lead.message && (
              <div>
                <p className="text-xs text-muted mb-1.5 flex items-center gap-1"><MessageCircle size={11} /> Mensaje</p>
                <p className="text-sm text-white/60 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">{lead.message}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted mb-2 font-medium">Anadir nota</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: cliente confirmo entrega"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAddNote()}
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

            {lead.notes.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2 font-medium">Notas ({lead.notes.length})</p>
                <div className="space-y-2">
                  {lead.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-sm text-white/70">{note.content}</p>
                      <p className="text-[10px] text-muted/40 mt-1.5 flex items-center gap-1">
                        <User size={9} />
                        {new Date(note.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
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
