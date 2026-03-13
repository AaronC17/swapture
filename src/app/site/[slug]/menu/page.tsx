import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = await prisma.client.findUnique({ where: { slug: params.slug } })
  if (!client) return { title: 'No encontrado' }
  return {
    title: `Menú — ${client.businessName}`,
    description: `Elegí tu sucursal para ver el menú de ${client.businessName}.`,
  }
}

const locationImages: Record<string, string> = {
  orotina: '/hamburguesas/oklahoma.png',
  jaco: '/menu/double bacon.png',
  esparza: '/menu/triple bacon.png',
}

export default async function MenuPage({ params }: Props) {
  const client = await prisma.client.findUnique({
    where: { slug: params.slug },
  })

  if (!client || client.status !== 'active') {
    notFound()
  }

  let menuData = null
  if (client.customNotes) {
    try { menuData = JSON.parse(client.customNotes) } catch { /* not JSON */ }
  }

  /* ── New format: locations object ── */
  if (menuData?.locations) {
    const allKeys = Object.keys(menuData.locations)
    const menuKeys = allKeys.filter(
      (k) => menuData.locations[k].categories?.length > 0
    )

    if (menuKeys.length === 1 && allKeys.length === 1) {
      redirect(`/site/${params.slug}/menu/${menuKeys[0]}`)
    }

    const G = '#6abf4b'

    return (
      <div className="min-h-screen text-white selection:bg-green-500/30" style={{ background: 'linear-gradient(180deg, #0d0f0c 0%, #0a0b09 35%, #0c0d0b 70%, #0a0b09 100%)' }}>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${G}04, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, ${G}02, transparent 60%)` }} />

        {/* ═══════ FLOATING NAV ═══════ */}
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-3 sm:mx-8 mt-3 sm:mt-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between h-12 sm:h-14 px-4 sm:px-5 rounded-2xl bg-[#0b0c0a]/95 backdrop-blur-2xl border border-white/[0.08]" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
              <Link href={`/site/${params.slug}`} className="flex items-center gap-2 text-white/50 hover:text-white transition-all group">
                <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                  <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] hidden sm:inline">Sucursales</span>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${G}15` }}>
                  <svg className="w-3.5 h-3.5" style={{ color: G }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>
                </div>
                <div className="leading-none">
                  <span className="text-xs font-black tracking-tight uppercase">Quincho&apos;s</span>
                  <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: `${G}90` }}>Menú</p>
                </div>
              </div>
              <div className="w-16 sm:w-[72px]" />
            </div>
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <header className="relative pt-20 sm:pt-24 lg:pt-28 pb-4 sm:pb-6 overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full blur-[140px] opacity-[0.06]" style={{ background: G }} />

          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-4 sm:mb-5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G }} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Seleccionar sucursal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-3">
              <span className="text-white">¿Dónde querés</span><br />
              <span style={{ color: G }}>ordenar?</span>
            </h1>
            <p className="text-xs sm:text-base text-white/40 max-w-md mx-auto leading-relaxed">
              Elegí tu sucursal para ver nuestro menú completo y hacer tu pedido.
            </p>

          </div>
        </header>

        {/* ═══════ LOCATION CARDS ═══════ */}
        <main className="relative max-w-5xl mx-auto px-4 sm:px-8 pb-8 sm:pb-14">
          {/* Section divider */}
          <div className="flex items-center gap-4 mb-5 sm:mb-8 px-1">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase text-white/25 shrink-0">Nuestros locales</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allKeys.map((key, idx) => {
              const loc = menuData.locations[key]
              const hasLocMenu = loc.categories && loc.categories.length > 0
              const totalItems = hasLocMenu ? loc.categories.reduce((s: number, c: { items: unknown[] }) => s + c.items.length, 0) : 0
              const waLink = loc.whatsapp
                ? `https://wa.me/${loc.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, quiero hacer un pedido en Quincho's — ${loc.name}`)}`
                : null
              const img = locationImages[key] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop&q=85'

              return (
                <div
                  key={key}
                  className="group relative rounded-[20px] overflow-hidden transition-all duration-500"
                  style={{
                    background: 'linear-gradient(170deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[20px]" style={{ background: `radial-gradient(ellipse at 50% 0%, ${G}08, transparent 70%)` }} />

                  {/* Image section */}
                  <div className="relative h-36 sm:h-44 overflow-hidden flex items-center justify-center" style={{ background: '#111309' }}>
                    <img src={img} alt={loc.name} className="h-full w-auto max-w-none object-contain group-hover:scale-[1.04] transition-transform duration-700 ease-out drop-shadow-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0a] via-transparent to-transparent" />

                    {/* Number */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/50 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center">
                        <span className="text-[10px] sm:text-[11px] font-black text-white/40">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      {hasLocMenu ? (
                        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xl border border-white/[0.06]">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider" style={{ color: G }}>Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xl border border-white/[0.06]">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-yellow-500/50">Pronto</span>
                        </div>
                      )}
                    </div>

                    {/* Location name */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Quincho&apos;s Smash Burger</p>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none">{loc.name}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Info chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {hasLocMenu && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-semibold text-white/50">
                          {loc.categories.length} categorías
                        </span>
                      )}
                      {hasLocMenu && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-semibold text-white/50">
                          {totalItems} productos
                        </span>
                      )}
                      {loc.phone && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-semibold text-white/50">
                          {loc.phone}
                        </span>
                      )}
                      {loc.hours && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-semibold text-white/50">
                          🕐 {loc.hours}
                        </span>
                      )}
                    </div>

                    {/* Separator */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

                    {/* Actions */}
                    <div className="flex gap-2">
                      {hasLocMenu ? (
                        <Link
                          href={`/site/${params.slug}/menu/${key}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-black transition-all hover:brightness-110 active:scale-[0.98] min-h-[42px] sm:min-h-[46px]"
                          style={{ background: G, boxShadow: `0 4px 25px ${G}20` }}
                        >
                          Ver Menú →
                        </Link>
                      ) : waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[#25D366] bg-[#25D366]/[0.06] border border-[#25D366]/15 hover:bg-[#25D366]/[0.12] transition-all min-h-[42px] sm:min-h-[46px]"
                        >
                          Pedir por WhatsApp
                        </a>
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-3 rounded-xl text-[10px] font-bold text-white/12 bg-white/[0.015] border border-white/[0.03] min-h-[42px]">
                          Próximamente
                        </div>
                      )}
                      {waLink && hasLocMenu && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-[42px] sm:w-[46px] h-[42px] sm:h-[46px] rounded-xl flex items-center justify-center bg-[#25D366]/[0.06] border border-[#25D366]/12 hover:bg-[#25D366]/[0.12] transition-all shrink-0"
                          title="WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.106 1.518 5.834L.051 23.486a.5.5 0 00.613.613l5.652-1.467A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.93 0-3.748-.558-5.282-1.52l-.368-.223-3.353.87.87-3.353-.223-.368A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ═══════ FOOTER ═══════ */}
          <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-px bg-gradient-to-r from-transparent to-white/[0.08]" />
              <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/15">QUINCHO&apos;S SMASH BURGER</span>
              <div className="w-14 h-px bg-gradient-to-l from-transparent to-white/[0.08]" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Fallback: old format ── */
  if (!menuData?.categories?.length) {
    notFound()
  }

  const { default: MenuClient } = await import('./MenuClient')
  const data = {
    slug: client.slug,
    businessName: client.businessName,
    whatsappNumber: client.whatsappNumber,
    menuData,
  }

  return <MenuClient data={data} />
}
