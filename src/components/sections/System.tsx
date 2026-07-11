import { Globe, BarChart3, Zap, Bell, LineChart, LayoutDashboard } from 'lucide-react'
import Reveal from '../Reveal'

const includes = [
  {
    icon: Globe,
    title: 'Tu propia página web',
    description: 'Un sitio profesional, adaptado a tu negocio, diseñado para que la gente te contacte.',
  },
  {
    icon: Bell,
    title: 'Captación de clientes',
    description: 'Herramientas que capturan a las personas interesadas y te avisan al momento para que cierres la venta.',
  },
  {
    icon: Zap,
    title: 'Recibes los contactos al instante',
    description: 'Cuando alguien te escribe, el sistema lo captura y te avisa de una vez. Nada se pierde en el camino.',
  },
  {
    icon: LayoutDashboard,
    title: 'Panel de administración',
    description: 'Un dashboard donde ves y gestionas todo: clientes, pedidos, ventas y la información de tu negocio en un solo lugar.',
  },
  {
    icon: BarChart3,
    title: 'Todos tus contactos organizados',
    description: 'Clientes, prospectos y conversaciones en un solo lugar. Sin hojas de Excel ni libretas.',
  },
  {
    icon: LineChart,
    title: 'Métricas claras',
    description: 'Sabes cuánta gente te visita, te contacta y se convierte en cliente. Decisiones con datos reales.',
  },
]

export default function System() {
  return (
    <section id="sistema" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <Reveal>
            <span className="section-label">Cómo funciona</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Software que se adapta
              <br />
              <span className="text-gradient">a tu negocio</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-sm sm:text-lg max-w-xl mx-auto">
              Un sistema completamente funcional, ajustado al tipo de negocio que tienes.
              Página web, captación de clientes, seguimiento y reportes — todo incluido.
            </p>
          </Reveal>
        </div>

        {/* What's included grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          {includes.map((item, i) => (
            <Reveal key={item.title} delay={i + 3}>
              <div className="group p-3.5 sm:p-6 rounded-2xl border border-border/60 bg-surface/[0.42] shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 h-full text-center sm:text-left">
                <div className="mb-2.5 sm:mb-4 flex justify-center sm:justify-start">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent/30 via-accent/18 to-accent-dim/12 border border-accent/25 border-t-accent-light/30 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <item.icon size={18} className="text-accent-light drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] sm:w-[22px] sm:h-[22px]" />
                  </div>
                </div>

                <h3 className="text-[13px] sm:text-lg font-heading font-bold text-white mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
