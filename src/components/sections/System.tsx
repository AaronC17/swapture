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
              <span className="text-gradient">a tu negocio.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
              Un sistema completamente funcional, ajustado al tipo de negocio que tienes.
              Página web, captación de clientes, seguimiento y reportes — todo incluido.
            </p>
          </Reveal>
        </div>

        {/* What's included grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {includes.map((item, i) => (
            <Reveal key={item.title} delay={i + 3}>
              <div className="group relative rounded-2xl border border-border/60 bg-surface/25 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 h-full">
                <div className="p-4 sm:p-7 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-accent/70" />
                    </div>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {item.description}
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
