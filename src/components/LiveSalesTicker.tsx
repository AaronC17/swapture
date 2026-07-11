'use client'

import { useMemo } from 'react'

interface Sale {
  name: string
  initials: string
  time: string
  amount: number
  gradient: string
}

const sales: Sale[] = [
  { name: 'María G.', initials: 'MG', time: 'hace 2 min', amount: 8450, gradient: 'from-accent/80 to-accent-dim' },
  { name: 'Don Tito', initials: 'DT', time: 'hace 5 min', amount: 14500, gradient: 'from-slate-600 to-slate-700' },
  { name: 'Roxana V.', initials: 'RV', time: 'hace 8 min', amount: 3200, gradient: 'from-indigo-900 to-slate-800' },
  { name: 'Juancho', initials: 'JC', time: 'hace 12 min', amount: 18200, gradient: 'from-slate-700 to-slate-800' },
  { name: 'Sofía M.', initials: 'SM', time: 'hace 15 min', amount: 4200, gradient: 'from-purple-900 to-indigo-900' },
  { name: 'Carlos R.', initials: 'CR', time: 'hace 18 min', amount: 12750, gradient: 'from-gray-700 to-gray-800' },
  { name: 'Lucía F.', initials: 'LF', time: 'hace 22 min', amount: 9500, gradient: 'from-violet-900 to-purple-900' },
  { name: 'Pedro A.', initials: 'PA', time: 'hace 25 min', amount: 15300, gradient: 'from-blue-900 to-slate-900' },
  { name: 'Ana K.', initials: 'AK', time: 'hace 28 min', amount: 7800, gradient: 'from-slate-800 to-purple-900' },
  { name: 'Diego S.', initials: 'DS', time: 'hace 32 min', amount: 21600, gradient: 'from-indigo-800 to-slate-700' },
]

function formatColones(amount: number) {
  return '₡' + amount.toString()
}

function SaleCard({ sale }: { sale: Sale }) {
  return (
    <div className="flex w-[172px] sm:w-[200px] shrink-0 items-center gap-2 sm:gap-2.5 rounded-[11px] border border-white/[0.08] bg-gradient-to-b from-surface to-bg-card px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${sale.gradient} text-[11px] font-bold text-white shadow-inner`}
      >
        {sale.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium tracking-tight text-white/90">
          {sale.name}
        </div>
        <div className="font-mono text-[9px] text-white/35">
          {sale.time}
        </div>
      </div>
      <div className="shrink-0 font-mono text-[11px] font-semibold text-white/90">
        {formatColones(sale.amount)}
      </div>
    </div>
  )
}

function MarqueeRow({ sales, reverse = false, duration = 28 }: { sales: Sale[]; reverse?: boolean; duration?: number }) {
  const duplicated = useMemo(() => [...sales, ...sales], [sales])

  return (
    <div className="relative overflow-hidden">
      {/* Left fade mask */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a0a12] to-transparent" />
      {/* Right fade mask */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a0a12] to-transparent" />

      <div
        className={`flex w-max gap-2.5 will-change-transform group-hover/ticker:[animation-play-state:paused] ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {duplicated.map((sale, i) => (
          <SaleCard key={`${sale.initials}-${i}`} sale={sale} />
        ))}
      </div>
    </div>
  )
}

export default function LiveSalesTicker() {
  const row1 = useMemo(() => sales.slice(0, 5), [])
  const row2 = useMemo(() => sales.slice(5).reverse(), [])

  return (
    <div className="group/ticker relative w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-3 py-2">
        <MarqueeRow sales={row1} duration={26} />
        <MarqueeRow sales={row2} reverse duration={32} />
      </div>
    </div>
  )
}
