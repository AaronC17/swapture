import { Rocket, RefreshCw, Check } from 'lucide-react'
import Reveal from '../Reveal'

const setupIncludes = [
  'Página web profesional adaptada a tu negocio',
  'Configuración de captación de clientes',
  'Sistema de seguimiento y respuestas',
  'Ajustes según tu tipo de negocio',
]

const monthlyIncludes = [
  'Sistema activo y funcionando 24/7',
  'Mantenimiento y mejoras continuas',
  'Soporte y acompañamiento',
  'Revisión de resultados mes a mes',
]

export default function Pricing() {
  return (
    <section id="precios" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <Reveal>
            <span className="section-label">Inversión</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              Precios claros,
              <br />
              <span className="text-gradient">sin sorpresas.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
              Un pago único para implementar tu sistema y una mensualidad fija
              para mantenerlo activo y mejorando.
            </p>
          </Reveal>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-5">
          {/* Implementation */}
          <Reveal delay={3}>
            <div className="group relative p-4 sm:p-7 rounded-2xl border border-border/60 bg-surface/25 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 h-full text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                  <Rocket size={20} className="text-accent/70" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white">
                    Implementación
                  </h3>
                  <span className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">
                    Pago único
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-5 flex items-baseline justify-center md:justify-start flex-wrap gap-x-2">
                <span className="text-2xl sm:text-4xl font-heading font-bold text-white">
                  ₡50,000
                </span>
                <span className="text-muted text-sm">a</span>
                <span className="text-2xl sm:text-4xl font-heading font-bold text-white">
                  ₡100,000
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4 sm:mb-5">
                Varía según el tipo de negocio y los extras que incluyas.
                Te damos el precio exacto antes de iniciar.
              </p>

              <ul className="space-y-2.5 text-left">
                {setupIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-accent/70" />
                    </div>
                    <span className="text-xs sm:text-sm text-white/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Monthly */}
          <Reveal delay={4}>
            <div className="group relative p-4 sm:p-7 rounded-2xl border border-accent/30 bg-accent/[0.07] backdrop-blur-sm shadow-[0_8px_30px_rgba(168,85,247,0.12)] hover:border-accent/50 hover:shadow-[0_12px_40px_rgba(168,85,247,0.2)] transition-all duration-500 h-full text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                  <RefreshCw size={20} className="text-accent/70" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white">
                    Mensualidad
                  </h3>
                  <span className="text-[10px] text-accent/70 uppercase tracking-wider font-semibold">
                    Fija · mensual
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-5 flex items-baseline justify-center md:justify-start">
                <span className="text-2xl sm:text-4xl font-heading font-bold text-white">
                  ₡25,000
                </span>
                <span className="text-muted text-sm ml-2">/mes</span>
              </div>

              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4 sm:mb-5">
                Mantiene tu sistema activo, funcionando y mejorando.
                Sin contratos eternos, cancelas cuando quieras.
              </p>

              <ul className="space-y-2.5 text-left">
                {monthlyIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-accent/70" />
                    </div>
                    <span className="text-xs sm:text-sm text-white/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={5}>
          <p className="text-center text-xs sm:text-sm text-muted/50 mt-6 sm:mt-8 max-w-lg mx-auto">
            Todos los precios en colones costarricenses. La mensualidad se gestiona
            desde tu panel una vez registrado.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
