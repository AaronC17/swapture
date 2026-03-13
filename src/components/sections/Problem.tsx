import { Users, Clock, TrendingDown, Repeat } from 'lucide-react'
import Reveal from '../Reveal'

const problems = [
  {
    icon: Users,
    title: 'Pagas varias cosas por separado',
    description: 'Una herramienta para la página, otra para los correos, otra para llevar tus contactos. Nada se conecta y tú pierdes tiempo y dinero.',
  },
  {
    icon: Clock,
    title: 'Todo depende de ti',
    description: 'Si tú no contestas, no se agenda. Si no le das seguimiento, se pierde el cliente. No puedes estar en todo siempre.',
  },
  {
    icon: TrendingDown,
    title: 'Tu página no te trae clientes',
    description: 'Tienes un sitio web que se ve bonito, pero nadie te contacta desde ahí. Es un gasto, no una herramienta que funciona.',
  },
  {
    icon: Repeat,
    title: 'No sabes cuántos clientes tendrás',
    description: 'Un mes bien, otro mal. Sin un sistema, conseguir clientes depende de la suerte o de que alguien te recomiende.',
  },
]

export default function Problem() {
  return (
    <section id="problema" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <Reveal>
            <span className="section-label">El problema</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              ¿Te suena
              <br />
              <span className="text-gradient">familiar?</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
              Si sientes que tu negocio podría ir mejor pero no sabes por dónde empezar,
              probablemente estés lidiando con alguno de estos problemas.
            </p>
          </Reveal>
        </div>

        {/* Problem Cards — clean, minimal */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {problems.map((item, i) => (
            <Reveal key={item.title} delay={i + 3}>
              <div className="group relative p-5 sm:p-7 rounded-2xl border border-border/30 bg-surface/10 hover:border-accent/20 transition-all duration-500 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center">
                    <item.icon size={20} className="text-accent/70" />
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-semibold text-white flex-1">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-muted leading-relaxed">
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
