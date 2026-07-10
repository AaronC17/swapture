import { X, Check } from 'lucide-react'
import Reveal from '../Reveal'

const beforeItems = [
  'Pagas varias herramientas por separado',
  'Tu página web no te trae clientes',
  'Pierdes clientes por no dar seguimiento',
  'Llevas el negocio con cuadernos o Excel',
  'No sabes qué te está funcionando',
  'Cada mes es una sorpresa',
]

const afterItems = [
  'Todo en un solo sistema, un solo proveedor',
  'Tu página atrae clientes y te los conecta',
  'Recibes cada contacto al instante, organizado',
  'Panel de administración para gestionar todo',
  'Ves exactamente qué funciona y qué no',
  'Clientes llegando de forma constante',
]

export default function Comparison() {
  return (
    <section id="resultados" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <Reveal>
            <span className="section-label">Resultados</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Antes vs después
              <br />
              <span className="text-gradient">de Swapture</span>
            </h2>
          </Reveal>
        </div>

        {/* Before / After Grid */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-5">
          {/* Before */}
          <Reveal delay={2}>
            <div className="p-4 sm:p-7 rounded-2xl border border-border/60 bg-surface/[0.42] shadow-[0_8px_30px_rgba(0,0,0,0.25)] h-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted/50 mb-4 sm:mb-6 text-center md:text-left">
                Sin Swapture
              </h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {beforeItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-muted/8 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={12} className="text-muted/40" />
                    </div>
                    <span className="text-[13px] sm:text-sm text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* After */}
          <Reveal delay={3}>
            <div className="p-4 sm:p-7 rounded-2xl border border-accent/30 bg-accent/[0.07] shadow-[0_8px_30px_rgba(168,85,247,0.12)] h-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent/70 mb-4 sm:mb-6 text-center md:text-left">
                Con Swapture
              </h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {afterItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-accent/70" />
                    </div>
                    <span className="text-[13px] sm:text-sm text-white/80 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
