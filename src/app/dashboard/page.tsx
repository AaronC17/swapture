'use client'

import { useEffect, useState } from 'react'
import {
  Users, ShoppingBag, Phone, MessageCircle, ExternalLink,
  Clock, Repeat, ChevronRight, Sparkles
} from 'lucide-react'

interface RecentLead {
  id: string; name: string; phone: string; source: string; status: string
  totalAmount: number; orderDetails: string; message: string
  createdAt: string; lastContactAt: string | null
}

interface DashboardData {
  businessName: string
  slug: string
  status: string
  plan: string
  totalContacts: number
  newThisWeek: number
  ordersCount: number
  totalRevenue: number
  frequentCount: number
  whatsappLeads: number
  chatbotLeads: number
  recentLeads: RecentLead[]
}

const planLabels: Record<string, string> = { starter: 'Básico', growth: 'Crecimiento', scale: 'Premium' }
const sourceLabels: Record<string, string> = { website: 'Web', whatsapp: 'WhatsApp', manual: 'Manual', form: 'Formulario', chatbot: 'Chatbot' }
const sourceEmoji: Record<string, string> = { website: '🌐', whatsapp: '📱', manual: '✏️', form: '📋', chatbot: '🤖' }

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/dashboard')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { if (d && d.businessName) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
  }

  if (!data) {
    return <div className="text-center py-20 text-muted">No se pudo cargar tu información</div>
  }

  const parseOrder = (details: string): { name: string; qty: number; price: number }[] | null => {
    try {
      const items = JSON.parse(details)
      if (Array.isArray(items)) return items
    } catch { /* noop */ }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">{data.businessName}</h1>
          <p className="text-muted text-sm mt-0.5">{planLabels[data.plan] || data.plan}</p>
        </div>
        {data.slug && data.status === 'active' && (
          <a href={`/site/${data.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all">
            <ExternalLink size={14} /> Ver mi página
          </a>
        )}
      </div>

      {/* Simple stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Ventas" value={data.totalContacts} sub={data.newThisWeek > 0 ? `+${data.newThisWeek} esta semana` : undefined} />
        <StatCard icon={ShoppingBag} label="Pedidos" value={data.ordersCount} sub={data.totalRevenue > 0 ? `₡${data.totalRevenue.toLocaleString()} total` : undefined} color="text-emerald-400" />
        <StatCard icon={MessageCircle} label="Vía chatbot" value={data.chatbotLeads} />
        <StatCard icon={Repeat} label="Frecuentes" value={data.frequentCount} sub="2+ pedidos" color="text-amber-400" />
      </div>

      {/* Recent purchases — the main useful section */}
      <div className="rounded-xl border border-border/20 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-border/10 flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">Últimas ventas</span>
          <a href="/dashboard/leads" className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1">
            Ver todos <ChevronRight size={12} />
          </a>
        </div>

        {!data.recentLeads?.length ? (
          <div className="px-4 py-14 text-center">
            <Sparkles size={24} className="mx-auto mb-3 text-white/10" />
            <p className="text-sm text-muted">Aún no hay ventas registradas</p>
            <p className="text-xs text-muted/50 mt-1">Cuando alguien haga un pedido, aparecerá aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {data.recentLeads.map(lead => {
              const order = parseOrder(lead.orderDetails)
              const isFrequent = false // frequency shown in leads page
              return (
                <a key={lead.id} href="/dashboard/leads" className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-white/40 uppercase">
                    {lead.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      {isFrequent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400/80 font-medium">
                          Frecuente
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    {lead.phone && (
                      <p className="text-xs text-muted/70 mt-0.5 flex items-center gap-1">
                        <Phone size={10} /> {lead.phone}
                      </p>
                    )}

                    {/* Order summary */}
                    {lead.totalAmount > 0 && (
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-emerald-400/80">
                          ₡{lead.totalAmount.toLocaleString()}
                        </span>
                        {order && (
                          <span className="text-[11px] text-white/30">
                            {order.map(i => `${i.qty}x ${i.name}`).join(', ')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message preview if no order */}
                    {!lead.totalAmount && lead.message && (
                      <p className="text-xs text-white/25 mt-1 line-clamp-1">{lead.message}</p>
                    )}
                  </div>

                  {/* Right side: source + time */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-white/30">
                      {sourceEmoji[lead.source] || '📩'} {sourceLabels[lead.source] || lead.source}
                    </span>
                    <p className="text-[10px] text-muted/40 mt-0.5 flex items-center gap-1 justify-end">
                      <Clock size={9} /> {timeAgo(lead.createdAt)}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick summary cards */}
      {(data.whatsappLeads > 0 || data.totalRevenue > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.whatsappLeads > 0 && (
            <div className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={14} className="text-green-400/60" />
                <span className="text-xs text-muted">Pedidos por WhatsApp</span>
              </div>
              <p className="text-2xl font-heading font-bold text-green-400">{data.whatsappLeads}</p>
              <p className="text-[11px] text-muted/40 mt-1">Personas que llegaron por WhatsApp</p>
            </div>
          )}
          {data.totalRevenue > 0 && (
            <div className="p-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03]">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={14} className="text-emerald-400/60" />
                <span className="text-xs text-emerald-400/50">Total en pedidos</span>
              </div>
              <p className="text-2xl font-heading font-bold text-emerald-400">₡{data.totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-muted/40 mt-1">{data.ordersCount} {data.ordersCount === 1 ? 'pedido' : 'pedidos'} registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ━━━━━━━━━━ Stat card ━━━━━━━━━━ */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: number; sub?: string; color?: string
}) {
  return (
    <div className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-muted" />
        <span className="text-[11px] text-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-heading font-bold ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted/40 mt-0.5">{sub}</p>}
    </div>
  )
}