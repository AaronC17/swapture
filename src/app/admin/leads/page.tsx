'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

interface LeadRow {
  id: string
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: string
  createdAt: string
  client: { id: string; businessName: string }
}

const statusLabels: Record<string, string> = {
  new: 'Nuevo', contacted: 'En conversación', qualified: 'Muy interesado', converted: 'Usuario fijo', lost: 'No interesado'
}
const statusColors: Record<string, string> = {
  new: 'text-white/70 bg-white/[0.06]', contacted: 'text-white/70 bg-white/[0.06]',
  qualified: 'text-white/70 bg-white/[0.06]', converted: 'text-white/70 bg-white/[0.06]', lost: 'text-white/40 bg-white/[0.04]'
}

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/leads')
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (leadId: string, status: string) => {
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.client.businessName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Todos los contactos</h1>
        <p className="text-muted text-sm mt-1">{leads.length} personas interesadas en total</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder="Buscar contacto o negocio..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted/50 focus:outline-none focus:border-white/20 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map(lead => (
              <div key={lead.id} className="p-4 rounded-xl border border-border/20 bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <a href={`/admin/clients/${lead.client.id}`} className="text-xs text-white/50 hover:text-white hover:underline">{lead.client.businessName}</a>
                  </div>
                  <select value={lead.status} onChange={e => handleStatusChange(lead.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer shrink-0 ${statusColors[lead.status] || ''}`}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {lead.email && <span className="truncate max-w-[180px]">{lead.email}</span>}
                  {lead.phone && <span>{lead.phone}</span>}
                  <span className="bg-white/[0.06] text-white/70 px-2 py-0.5 rounded-full">{lead.source}</span>
                  <span>{new Date(lead.createdAt).toLocaleDateString('es')}</span>
                </div>
                {lead.message && <p className="text-xs text-muted/70 mt-2 line-clamp-2">{lead.message}</p>}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-border/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02] text-muted text-left">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Negocio</th>
                  <th className="px-5 py-3 font-medium">Datos de contacto</th>
                  <th className="px-5 py-3 font-medium">Fuente</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium">{lead.name}</p>
                      {lead.message && <p className="text-xs text-muted truncate max-w-[200px]">{lead.message}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <a href={`/admin/clients/${lead.client.id}`} className="text-white/50 hover:text-white hover:underline">{lead.client.businessName}</a>
                    </td>
                    <td className="px-5 py-3">
                      <p>{lead.email}</p>
                      <p className="text-xs text-muted">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-white/[0.06] text-white/70 px-2 py-0.5 rounded-full">{lead.source}</span>
                    </td>
                    <td className="px-5 py-3">
                      <select value={lead.status} onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer ${statusColors[lead.status] || ''}`}>
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
    </div>
  )
}
