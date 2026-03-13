'use client'

import { useEffect, useState } from 'react'
import { Users, MessageSquare, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalClients: number
  activeClients: number
  totalLeads: number
  newLeadsToday: number
  recentLeads: Array<{
    id: string
    name: string
    clientName: string
    source: string
    createdAt: string
  }>
  recentClients: Array<{
    id: string
    businessName: string
    status: string
    plan: string
  }>
}

const statusLabels: Record<string, string> = {
  pending: 'Por iniciar',
  configuring: 'En preparación',
  active: 'Funcionando',
  paused: 'En pausa',
  cancelled: 'Cancelado',
}

const planLabels: Record<string, string> = {
  starter: 'Básico', growth: 'Crecimiento', scale: 'Premium',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold">Panel de administración</h1>
        <p className="text-muted text-sm mt-0.5">Resumen general</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Clientes', value: stats?.totalClients ?? 0, icon: Users },
          { label: 'Activos', value: stats?.activeClients ?? 0, icon: TrendingUp },
          { label: 'Contactos', value: stats?.totalLeads ?? 0, icon: MessageSquare },
          { label: 'Hoy', value: stats?.newLeadsToday ?? 0, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className="text-muted" />
              <span className="text-[11px] text-muted uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent clients */}
        <div className="rounded-xl border border-border/20 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-border/10 flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Últimos clientes</span>
            <Link href="/admin/clients" className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {stats?.recentClients?.length ? stats.recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{client.businessName}</p>
                  <p className="text-xs text-muted">{planLabels[client.plan] || client.plan}</p>
                </div>
                <span className="text-xs text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-full ml-3 shrink-0">
                  {statusLabels[client.status] || client.status}
                </span>
              </Link>
            )) : (
              <p className="px-4 py-10 text-sm text-muted text-center">No hay clientes aún</p>
            )}
          </div>
        </div>

        {/* Recent leads */}
        <div className="rounded-xl border border-border/20 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-border/10 flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Últimos contactos</span>
            <Link href="/admin/leads" className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {stats?.recentLeads?.length ? stats.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                  <p className="text-xs text-muted">{lead.clientName}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <span className="text-xs text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-full">{lead.source}</span>
                  <p className="text-[10px] text-muted mt-1">{new Date(lead.createdAt).toLocaleDateString('es')}</p>
                </div>
              </div>
            )) : (
              <p className="px-4 py-10 text-sm text-muted text-center">No hay contactos aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
