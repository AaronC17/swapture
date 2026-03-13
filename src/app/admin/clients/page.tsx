'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye } from 'lucide-react'

interface ClientRow {
  id: string
  businessName: string
  status: string
  plan: string
  phone: string
  domain: string
  leadsCount: number
  createdAt: string
  user: { name: string; email: string }
}

const statusColors: Record<string, string> = {
  pending: 'text-white/60 bg-white/[0.06]',
  configuring: 'text-white/70 bg-white/[0.06]',
  active: 'text-white/80 bg-white/[0.06]',
  paused: 'text-white/40 bg-white/[0.04]',
  cancelled: 'text-white/40 bg-white/[0.04]',
}
const statusLabels: Record<string, string> = {
  pending: 'Por iniciar',
  configuring: 'En preparación',
  active: 'Funcionando',
  paused: 'En pausa',
  cancelled: 'Cancelado',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(data => setClients(data.clients || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Clientes</h1>
          <p className="text-muted text-sm mt-1">{clients.length} clientes en total</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-all"
        >
          <Plus size={16} />
          Nuevo cliente
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, negocio o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted/50 focus:outline-none focus:border-white/20 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No se encontraron clientes</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}
                className="block p-4 rounded-xl border border-border/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{client.businessName}</p>
                    <p className="text-xs text-muted truncate">{client.user.name} — {client.user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 text-white/50 bg-white/[0.04]`}>
                    {statusLabels[client.status] || client.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="capitalize">{client.plan}</span>
                  <span className="text-white/60 font-medium">{client.leadsCount} contactos</span>
                  {client.domain && <span className="truncate">{client.domain}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-border/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02] text-muted text-left">
                  <th className="px-5 py-3 font-medium">Negocio</th>
                  <th className="px-5 py-3 font-medium">Contacto</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Contactos</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{client.businessName}</p>
                      {client.domain && <p className="text-xs text-muted">{client.domain}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-white">{client.user.name}</p>
                      <p className="text-xs text-muted">{client.user.email}</p>
                    </td>
                    <td className="px-5 py-3 capitalize">{client.plan}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium text-white/50 bg-white/[0.04]`}>
                        {statusLabels[client.status] || client.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/70 font-medium">{client.leadsCount}</td>
                    <td className="px-5 py-3 text-muted">{new Date(client.createdAt).toLocaleDateString('es')}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/clients/${client.id}`} className="text-white/50 hover:text-white transition-colors">
                        <Eye size={16} />
                      </Link>
                    </td>
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
