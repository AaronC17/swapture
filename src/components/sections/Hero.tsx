'use client'

import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal'

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center pt-24 sm:pt-28 pb-20 sm:pb-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 w-full text-center">
        {/* Label */}
        <Reveal>
          <span className="section-label">El sistema completo para tu negocio</span>
        </Reveal>

        {/* Main heading */}
        <Reveal delay={1}>
          <h1 className="text-[2.1rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-heading font-bold leading-[1.08] tracking-tight mb-5 sm:mb-6">
            Un negocio moderno
            <br />
            <span className="text-gradient">necesita más que</span>
            <br />
            <span className="text-gradient">una página web</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={2}>
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Página web, captación de clientes, seguimiento y más — todo en uno.
            <br className="hidden sm:block" />
            Tú te enfocas en lo tuyo, nosotros nos encargamos del resto.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={3}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-14 px-2 sm:px-0">
            <a
              href="#contacto"
              className="group inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 bg-accent text-white font-semibold rounded-full text-sm sm:text-base hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] hover:bg-accent-light transition-all duration-500"
            >
              Quiero saber más
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#sistema"
              className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border border-border/40 text-white font-medium rounded-full text-sm sm:text-base hover:border-accent/30 hover:bg-accent/5 transition-all duration-500"
            >
              ¿Qué incluye?
            </a>
          </div>
        </Reveal>

        {/* Minimal trust line */}
        <Reveal delay={4}>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-muted/50">
            <span>Sin contrato largo</span>
            <span className="w-1 h-1 rounded-full bg-border/40 hidden sm:block" />
            <span>Listo en semanas</span>
            <span className="w-1 h-1 rounded-full bg-border/40 hidden sm:block" />
            <span>Soporte incluido</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
