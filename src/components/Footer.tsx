import Image from 'next/image'

const navLinks = [
  { label: 'Plataforma', href: '#sistema' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Industrias', href: '#sectores' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Footer() {
  return (
    <footer className="relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
        {/* Main row — centered */}
        <div className="flex flex-col items-center gap-8">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 overflow-hidden">
              <Image src="/logotipo.png" alt="Swapture" fill sizes="44px" className="object-contain mix-blend-screen" />
            </div>
            <span className="text-lg font-heading font-bold leading-none">
              SWAP<span className="text-accent">TURE</span>
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

          {/* Legal + Instagram */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0 ml-4 sm:ml-6">
            <a
              href="https://www.instagram.com/swapture.cr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:scale-110 transition-transform duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                fill="none"
                stroke="url(#instagram-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="50%" stopColor="#e6683c" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <div className="flex items-center text-xs text-muted/50">
              <a
                href="/privacidad"
                className="w-[72px] text-center hover:text-white transition-colors duration-300"
              >
                Privacidad
              </a>
              <span className="text-border/30 mx-2">·</span>
              <a
                href="/terminos"
                className="w-[72px] text-center hover:text-white transition-colors duration-300"
              >
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div>
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
