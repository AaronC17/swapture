import { Globe, BarChart3, Zap, Bell, LineChart, Shield } from 'lucide-react'
import Reveal from '../Reveal'

const includes = [
  {
    icon: Globe,
    title: 'Tu propia página web',
    description: 'Un sitio profesional diseñado para que la gente te contacte. No es un extra, viene incluido.',
  },
  {
    icon: Zap,
    title: 'Respuestas automáticas',
    description: 'Cuando alguien te escribe, recibe respuesta al instante. Citas, recordatorios y seguimiento — todo solo.',
  },
  {
    icon: Bell,
    title: 'Captación de clientes',
    description: 'Formularios y herramientas que capturan a las personas interesadas y te avisan al momento.',
  },
  {
    icon: BarChart3,
    title: 'Todos tus contactos organizados',
    description: 'Clientes, prospectos y conversaciones en un solo lugar. Sin hojas de Excel ni libretas.',
  },
  {
    icon: LineChart,
    title: 'Sabes qué funciona',
    description: 'Números claros y fáciles de entender. Sabes cuánta gente te visita, te contacta y se convierte en cliente.',
  },
  {
    icon: Shield,
    title: 'Siempre acompañado',
    description: 'No te dejamos solo. Cada mes revisamos y mejoramos tu sistema para que funcione cada vez mejor.',
  },
]

export default function System() {
  return (
    <section id="sistema" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <Reveal>
            <span className="section-label">Una sola suscripción</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Todo incluido.
              <br />
              <span className="text-gradient">Sin costos ocultos.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
              Tu página web, la captación de clientes, el seguimiento y los reportes.
              Todo incluido en un solo pago. Sin costos de instalación ni sorpresas.
            </p>
          </Reveal>
        </div>

        {/* What's included grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {includes.map((item, i) => (
            <Reveal key={item.title} delay={i + 3}>
              <div className="group relative rounded-2xl border border-border/30 bg-surface/10 hover:border-accent/20 transition-all duration-500 h-full">
                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center">
                      <item.icon size={20} className="text-accent/70" />
                    </div>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white flex-1">
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
