'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'

const navLinks = [
  { href: '#problema', label: 'Problema' },
  { href: '#sistema', label: 'Plataforma' },
  { href: '#resultados', label: 'Resultados' },
  { href: '#sectores', label: 'Industrias' },
  { href: '#precios', label: 'Precios' },
  { href: '#proceso', label: 'Empezar' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Scroll to top on page load / refresh */
  useEffect(() => {
    window.scrollTo(0, 0)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const scrollToSection = (href: string) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      const navHeight = (document.querySelector('nav') as HTMLElement)?.offsetHeight ?? 80
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleDesktopClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    scrollToSection(href)
  }

  const handleMobileClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileOpen(false)
    setTimeout(() => scrollToSection(href), 350)
  }

  return (
    <>
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 transition-all duration-500 z-50',
          scrolled
            ? 'bg-bg/85 backdrop-blur-2xl border-b border-border/20 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent py-4 sm:py-5'
        )}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <Image src="/logotipo.png" alt="Swapture" fill sizes="(max-width: 640px) 48px, 56px" priority className="object-contain mix-blend-screen" />
            </div>
            <span className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
              SWAP<span className="text-accent">TURE.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleDesktopClick(e, link.href)}
                className="px-3.5 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/[0.04] transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-muted hover:text-white transition-colors px-3 py-2"
            >
              Iniciar sesión
            </a>
            <a
              href="#contacto"
              onClick={(e) => handleDesktopClick(e, '#contacto')}
              className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-light transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-[0.97]"
            >
              Empezar ahora
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative p-2 text-white hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 w-full h-[100dvh] bg-bg flex flex-col z-[60] transition-all duration-400',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-end p-5">
          <button
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/40 bg-surface/20 text-white hover:text-accent transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
          <ul className="w-full max-w-xs space-y-3">
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className={clsx(
                  'transition-all duration-300 text-center',
                  mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
                style={{ transitionDelay: mobileOpen ? `${(i + 1) * 50}ms` : '0ms' }}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleMobileClick(e, link.href)}
                  className="block w-full py-3 rounded-full text-base font-heading font-semibold text-white/80 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-6 pb-10 space-y-3">
          <a
            href="#contacto"
            onClick={(e) => handleMobileClick(e, '#contacto')}
            className={clsx(
              'block w-full max-w-xs mx-auto text-center py-3.5 bg-accent text-white font-semibold rounded-full text-sm transition-all duration-300 active:scale-[0.97] shadow-[0_0_30px_rgba(168,85,247,0.2)]',
              mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: mobileOpen ? `${(navLinks.length + 1) * 50}ms` : '0ms' }}
          >
            Empezar ahora
          </a>
          <a
            href="/login"
            className={clsx(
              'block w-full max-w-xs mx-auto text-center py-3.5 bg-accent/[0.08] border border-accent/30 text-accent-light font-semibold rounded-full text-sm transition-all duration-300 hover:bg-accent/15 hover:border-accent/50 active:scale-[0.97]',
              mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: mobileOpen ? `${(navLinks.length + 2) * 50}ms` : '0ms' }}
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    </>
  )
}
