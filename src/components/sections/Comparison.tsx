import { X, Check } from 'lucide-react'
import Reveal from '../Reveal'

const beforeItems = [
  'Pagas varias herramientas por separado',
  'Tu página web no te trae clientes',
  'Contestas y agendas todo a mano',
  'No sabes qué te está funcionando',
  'Cada mes es una sorpresa',
  'Si tú paras, todo se detiene',
]

const afterItems = [
  'Todo en un solo lugar con un solo pago',
  'Tu página atrae clientes y te los conecta',
  'Las respuestas y seguimientos son automáticos',
  'Ves exactamente qué funciona y qué no',
  'Clientes llegando de forma constante',
  'Tu negocio trabaja incluso cuando tú descansas',
]

export default function Comparison() {
  return (
    <section id="resultados" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <Reveal>
            <span className="section-label">Resultados</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Antes vs. después
              <br />
              <span className="text-gradient">de Swapture.</span>
            </h2>
          </Reveal>
        </div>

        {/* Before / After Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
          {/* Before */}
          <Reveal delay={2}>
            <div className="p-5 sm:p-7 rounded-2xl border border-border/30 bg-surface/10 h-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted/50 mb-6">
                Sin Swapture
              </h3>
              <ul className="space-y-3.5">
                {beforeItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-muted/8 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={12} className="text-muted/40" />
                    </div>
                    <span className="text-sm text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* After */}
          <Reveal delay={3}>
            <div className="p-5 sm:p-7 rounded-2xl border border-accent/20 bg-accent/[0.03] h-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent/70 mb-6">
                Con Swapture
              </h3>
              <ul className="space-y-3.5">
                {afterItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-accent/70" />
                    </div>
                    <span className="text-sm text-white/80 leading-relaxed">{item}</span>
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
