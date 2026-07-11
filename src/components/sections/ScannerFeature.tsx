import Reveal from '../Reveal'
import AddToCartCard from '../AddToCartCard'

export default function ScannerFeature() {
  return (
    <section className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
        <Reveal>
          <span className="section-label">Automatización</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Cada pedido se registra
            <br />
            <span className="text-gradient">sin que tú hagas nada</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-muted text-sm sm:text-lg max-w-xl mx-auto mb-10 sm:mb-14">
            Cuando un cliente hace un pedido, el sistema lo captura, organiza y te avisa al instante.
          </p>
        </Reveal>

        <Reveal delay={3}>
          <AddToCartCard />
        </Reveal>
      </div>
    </section>
  )
}
