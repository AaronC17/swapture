'use client'

import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal'

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-32 sm:pt-36 pb-16 sm:pb-28 overflow-hidden">
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
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed">
            Sistemas que capturan ingresos: tu página web, clientes y administración en un solo lugar.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={3}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-14 px-2 sm:px-0">
            <a
              href="#contacto"
              className="group inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 bg-accent/[0.08] border border-accent/30 text-accent-light font-semibold rounded-full text-sm sm:text-base hover:bg-accent/15 hover:border-accent/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500"
            >
              Quiero saber más
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#sistema"
              className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border border-border/60 bg-surface/15 text-white font-medium rounded-full text-sm sm:text-base hover:border-accent/40 hover:bg-accent/10 hover:text-accent-light transition-all duration-500"
            >
              ¿Qué incluye?
            </a>
          </div>
        </Reveal>

        {/* Minimal trust line */}
        <Reveal delay={4}>
          <p className="text-xs sm:text-sm text-muted/70 font-medium text-center">
            +10 negocios confían en Swapture
          </p>
        </Reveal>
      </div>
    </section>
  )
}
