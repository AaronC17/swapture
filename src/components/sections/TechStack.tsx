'use client'

import { Monitor, Server, Cloud } from 'lucide-react'
import Reveal from '../Reveal'

const categories = [
  {
    icon: Monitor,
    title: 'Frontend',
    subtitle: 'Interfaz & Experiencia',
    techs: [
      { name: 'Next.js 14', desc: 'Framework React con SSR/SSG' },
      { name: 'React 18', desc: 'UI reactiva con Server Components' },
      { name: 'TypeScript', desc: 'Tipado estático para robustez' },
      { name: 'Tailwind CSS', desc: 'Utilidades CSS de alto rendimiento' },
    ],
  },
  {
    icon: Server,
    title: 'Backend',
    subtitle: 'Lógica & Datos',
    techs: [
      { name: 'Node.js', desc: 'Runtime de alto rendimiento' },
      { name: 'MongoDB', desc: 'Base de datos flexible y escalable' },
      { name: 'Prisma', desc: 'ORM type-safe para Node.js' },
      { name: 'GraphQL', desc: 'API flexible y eficiente' },
    ],
  },
  {
    icon: Cloud,
    title: 'Cloud & Infra',
    subtitle: 'Deploy & Servicios',
    techs: [
      { name: 'Vercel', desc: 'Deploy global con edge computing' },
      { name: 'AWS', desc: 'Infraestructura escalable' },
      { name: 'Redis', desc: 'Cache de alta velocidad' },
      { name: 'Stripe', desc: 'Procesamiento de pagos seguro' },
    ],
  },
]

const codePreview = `// swapture.config.ts
import { SwaptureEngine } from '@swapture/core'

const engine = new SwaptureEngine({
  capture: {
    forms: 'intelligent',
    tracking: ['analytics', 'heatmaps'],
    optimization: 'auto'
  },
  convert: {
    funnels: true,
    abTesting: true,
    personalization: 'dynamic'
  },
  automate: {
    crm: 'integrated',
    email: 'sequences',
    payments: 'stripe',
    reports: 'realtime'
  }
})`

export default function TechStack() {
  return (
    <section id="tecnologia" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <Reveal>
          <span className="section-label">Stack tecnológico</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Tecnología de vanguardia,
            <br />
            <span className="text-gradient">resultados reales.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-muted text-lg max-w-2xl mb-16">
            Cada herramienta en nuestro stack está seleccionada por rendimiento,
            escalabilidad y resultados probados en producción.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Tech Categories - 3 columns */}
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Reveal key={cat.title} delay={i + 3}>
                <div className="group p-6 rounded-2xl border border-border/30 bg-surface/20 backdrop-blur-sm hover:border-accent/30 transition-all duration-500 h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                    <cat.icon size={20} className="text-accent" />
                  </div>

                  <h3 className="text-lg font-heading font-bold text-white mb-0.5">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-mono text-accent mb-5">{cat.subtitle}</p>

                  <div className="space-y-3">
                    {cat.techs.map((tech) => (
                      <div key={tech.name}>
                        <p className="text-sm font-semibold text-white">{tech.name}</p>
                        <p className="text-xs text-muted">{tech.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Code Preview - 2 columns */}
          <Reveal delay={6} className="lg:col-span-2">
            <div className="rounded-2xl border border-border/30 bg-surface/30 overflow-hidden h-full">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/20 bg-surface/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-negative/60" />
                  <span className="w-3 h-3 rounded-full bg-[#f5c542]/60" />
                  <span className="w-3 h-3 rounded-full bg-positive/60" />
                </div>
                <span className="text-xs font-mono text-muted ml-2">swapture.config.ts</span>
              </div>

              {/* Code */}
              <pre className="p-5 overflow-x-auto text-xs leading-relaxed">
                <code>
                  {codePreview.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="inline-block w-8 text-right mr-4 text-border/40 select-none text-[11px]">
                        {i + 1}
                      </span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightSyntax(line),
                        }}
                      />
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function highlightSyntax(line: string): string {
  return line
    .replace(/\/\/.*/g, '<span class="code-comment">$&</span>')
    .replace(
      /\b(import|from|const|new|true|false|auto)\b/g,
      '<span class="code-keyword">$&</span>'
    )
    .replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>')
    .replace(
      /\b(SwaptureEngine|capture|convert|automate|forms|tracking|optimization|funnels|abTesting|personalization|crm|email|payments|reports)\b(?=\s*[:{])/g,
      '<span class="code-prop">$&</span>'
    )
}
