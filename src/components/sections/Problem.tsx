import { Users, Clock, TrendingDown, Repeat } from 'lucide-react'
import Reveal from '../Reveal'

const problems = [
  {
    icon: Users,
    title: 'Pagas varias cosas por separado',
    description: 'Una herramienta para la página, otra para los mensajes, otra para llevar tus contactos. Nada se conecta y tú pierdes tiempo y dinero.',
  },
  {
    icon: Clock,
    title: 'El seguimiento se te escapa',
    description: 'Cuando un cliente te escribe, si tardas en contestar o se te olvida darle seguimiento, se enfría y se va. Es difícil estar pendiente de cada uno manualmente.',
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
    <section id="problema" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
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
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
          {problems.map((item, i) => (
            <Reveal key={item.title} delay={i + 3}>
              <div className="group relative p-4 sm:p-7 rounded-2xl border border-border/60 bg-surface/25 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 h-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-accent/70" />
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-semibold text-white">
                    {item.title}
                  </h3>
                </div>

                <p className="text-[13px] sm:text-sm text-muted leading-relaxed">
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
