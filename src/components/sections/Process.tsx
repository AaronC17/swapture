import { Search, Wrench, TrendingUp } from 'lucide-react'
import Reveal from '../Reveal'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Cuéntanos de tu negocio',
    description: 'Nos platicas qué haces, qué necesitas y cómo te gustaría crecer. Sin compromisos, sin presión.',
  },
  {
    icon: Wrench,
    number: '02',
    title: 'Nosotros lo armamos todo',
    description: 'Creamos tu página, conectamos tus herramientas y dejamos todo listo. Tú no tienes que hacer nada técnico.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Empiezas a recibir clientes',
    description: 'Tu sistema se activa y comienza a trabajar. Cada mes lo revisamos juntos y lo hacemos mejor.',
  },
]

export default function Process() {
  return (
    <section id="proceso" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <Reveal>
            <span className="section-label">Cómo empezar</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Actívalo
              <br />
              <span className="text-gradient">en 3 pasos</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-sm sm:text-lg max-w-xl mx-auto">
              Sin procesos complicados ni esperas de meses.
              En poco tiempo tu negocio empieza a recibir clientes nuevos.
            </p>
          </Reveal>
        </div>

        {/* Steps */}
        <div className="space-y-3 sm:space-y-5">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i + 3}>
              <div className="group flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6 p-4 sm:p-7 rounded-2xl border border-border/60 bg-surface/[0.42] shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 text-center sm:text-left">
                <div className="shrink-0">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-accent/30 via-accent/18 to-accent-dim/12 border border-accent/25 border-t-accent-light/30 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <step.icon size={20} className="text-accent-light drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] sm:w-[22px] sm:h-[22px]" />
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-bold text-accent/40 uppercase tracking-[0.25em]">
                    Paso {step.number}
                  </span>
                  <h3 className="text-base sm:text-xl font-heading font-bold text-white mb-1.5 sm:mb-2 mt-1">
                    {step.title}
                  </h3>
                  <p className="text-[13px] sm:text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
