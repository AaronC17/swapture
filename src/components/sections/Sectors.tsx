import { Briefcase, Heart, ShoppingCart, GraduationCap, Building2, Scissors } from 'lucide-react'
import Reveal from '../Reveal'

const sectors = [
  {
    icon: Briefcase,
    title: 'Consultores y Agencias',
    result: 'Atrae clientes nuevos sin depender solo de recomendaciones o redes sociales.',
  },
  {
    icon: Heart,
    title: 'Clínicas y Salud',
    result: 'Agenda de citas en línea, recordatorios automáticos y seguimiento de pacientes.',
  },
  {
    icon: ShoppingCart,
    title: 'Tiendas en línea',
    result: 'Recupera ventas perdidas y mantén a tus clientes comprando una y otra vez.',
  },
  {
    icon: GraduationCap,
    title: 'Educación y Coaches',
    result: 'Llena tus cursos y sesiones con una página que inscribe alumnos por ti.',
  },
  {
    icon: Building2,
    title: 'Inmobiliarias',
    result: 'Filtra a tus mejores prospectos y agenda visitas sin que tú muevas un dedo.',
  },
  {
    icon: Scissors,
    title: 'Servicios Locales',
    result: 'Presencia profesional en internet con reservas en línea y seguimiento incluido.',
  },
]

export default function Sectors() {
  return (
    <section id="sectores" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <Reveal>
            <span className="section-label">¿Para quién?</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Adaptado a
              <br />
              <span className="text-gradient">tu industria.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
              No importa tu industria — configuramos todo según lo que tu negocio necesita.
              Sin complicaciones, sin saber de tecnología.
            </p>
          </Reveal>
        </div>

        {/* Sector Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sectors.map((sector, i) => (
            <Reveal key={sector.title} delay={i + 3}>
              <div className="group p-4 sm:p-6 rounded-2xl border border-border/30 bg-surface/10 hover:border-accent/20 transition-all duration-500 h-full">
                <div className="mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center">
                    <sector.icon size={18} className="text-accent/70 sm:w-5 sm:h-5" />
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-heading font-semibold text-white mb-1.5 sm:mb-2">
                  {sector.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {sector.result}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
