'use client'

import Reveal from '../Reveal'
import LiveSalesTicker from '../LiveSalesTicker'

export default function LiveSalesSection() {
  return (
    <section className="relative py-10 sm:py-16 pb-12 sm:pb-20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
        <Reveal>
          <div className="flex items-center justify-center mb-5">
            <p className="text-[10px] sm:text-xs text-muted/50 uppercase tracking-[0.2em] font-medium">
              Pedidos y pagos en tiempo real
            </p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <LiveSalesTicker />
        </Reveal>
      </div>
    </section>
  )
}
