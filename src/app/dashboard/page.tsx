'use client'

import { useCallback, useEffect, useState } from 'react'
import { Users, ShoppingBag, Receipt, ExternalLink, Clock, ChevronRight } from 'lucide-react'

interface RecentLead {
  id: string
  name: string
  phone: string
  source: string
  totalAmount: number
  orderDetails: string
  createdAt: string
}

interface DashboardData {
  businessName: string
  slug: string
  status: string
  plan: string
  range: '1d' | '7d' | '30d' | '90d' | 'all'
  rangeLabel: string
  totalContacts: number
  ordersCount: number
  totalRevenue: number
  recentLeads: RecentLead[]
}

const planLabels: Record<string, string> = {
  starter: 'Basico',
  growth: 'Crecimiento',
  scale: 'Premium',
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

function formatCostaRicaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  let local = digits

  if (digits.startsWith('00506')) local = digits.slice(5)
  else if (digits.startsWith('506')) local = digits.slice(3)

  if (local.length === 8) {
    return `+506 ${local.slice(0, 4)} ${local.slice(4)}`
  }

  return phone || 'Sin telefono'
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'1d' | '7d' | '30d' | 'all'>('30d')

  const fetchDashboard = useCallback((selectedRange: '1d' | '7d' | '30d' | 'all') => {
    setLoading(true)
    fetch(`/api/client/dashboard?range=${selectedRange}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => {
        if (d?.businessName) setData(d)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDashboard(range)
  }, [fetchDashboard, range])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-20 text-muted">No se pudo cargar tu informacion</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">{data.businessName}</h1>
          <p className="text-muted text-sm mt-0.5">{planLabels[data.plan] || data.plan}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <RangeBtn active={range === '1d'} onClick={() => setRange('1d')}>Hoy</RangeBtn>
          <RangeBtn active={range === '7d'} onClick={() => setRange('7d')}>Semanal</RangeBtn>
          <RangeBtn active={range === '30d'} onClick={() => setRange('30d')}>Mensual</RangeBtn>
          <RangeBtn active={range === 'all'} onClick={() => setRange('all')}>Todo</RangeBtn>

          {data.slug && data.status === 'active' && (
            <a
              href={`/site/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/[0.10] hover:border-white/[0.18] rounded-xl transition-all"
            >
              <ExternalLink size={14} /> Ver mi pagina
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Clientes" value={data.totalContacts} sub={`Periodo: ${data.rangeLabel}`} />
        <StatCard icon={ShoppingBag} label="Ventas" value={`CRC ${data.totalRevenue.toLocaleString()}`} />
        <StatCard icon={Receipt} label="Pedidos" value={data.ordersCount} />
      </div>

      <div className="rounded-xl border border-border/20 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-border/10 flex items-center justify-between">
          <span className="text-sm font-medium text-white/85">Ultimos pedidos</span>
          <a href="/dashboard/leads" className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1">
            Ver usuarios <ChevronRight size={12} />
          </a>
        </div>

        {!data.recentLeads.length ? (
          <p className="px-4 py-12 text-center text-sm text-muted">Aun no hay pedidos registrados</p>
        ) : (
          <div className="divide-y divide-border/10">
            {data.recentLeads.slice(0, 8).map((lead) => (
              <a
                key={lead.id}
                href="/dashboard/leads"
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{lead.name}</p>
                  <p className="text-[11px] text-muted truncate">
                    {formatCostaRicaPhone(lead.phone)} · {sourceLabels[lead.source] || lead.source}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-emerald-400">
                    {lead.totalAmount > 0 ? `CRC ${lead.totalAmount.toLocaleString()}` : 'Sin compra'}
                  </p>
                  <p className="text-[10px] text-muted flex items-center gap-1 justify-end">
                    <Clock size={9} /> {timeAgo(lead.createdAt)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-muted" />
        <span className="text-[11px] text-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold text-white">{value}</p>
      {sub && <p className="text-[11px] text-muted/40 mt-0.5">{sub}</p>}
    </div>
  )
}

function RangeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        active
          ? 'bg-white/[0.12] text-white border-white/[0.20]'
          : 'text-muted hover:text-white/80 hover:bg-white/[0.04] border-white/[0.08]'
      }`}
    >
      {children}
    </button>
  )
}
