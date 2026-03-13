import Image from 'next/image'

const navLinks = [
  { label: 'Problema', href: '#problema' },
  { label: 'Plataforma', href: '#sistema' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Industrias', href: '#sectores' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-border/15">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        {/* Main row — all horizontal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Image src="/image.png" alt="Swapture" width={24} height={24} className="w-7 h-7 object-contain brightness-[1.2] contrast-[1.1]" />
            <span className="text-base font-heading font-bold">
              SWAP<span className="text-accent">TURE.</span>
            </span>
          </div>

          {/* Nav links — horizontal row */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-muted/60 hover:text-white transition-colors duration-300 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Legal */}
          <div className="flex items-center gap-4 text-xs text-muted/50 shrink-0">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <span className="text-border/30">·</span>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/8">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="text-[11px] text-muted/40">
            © {new Date().getFullYear()} Swapture. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-muted/40">
            Sistemas que capturan ingresos.
          </p>
        </div>
      </div>
    </footer>
  )
}
