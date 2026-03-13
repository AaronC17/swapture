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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-bg/85 backdrop-blur-2xl border-b border-border/20 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent py-4 sm:py-5'
        )}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/image.png" alt="Swapture" width={300} height={300} priority className="w-9 h-9 sm:w-11 sm:h-11 object-contain brightness-[1.2] contrast-[1.1] group-hover:scale-105 transition-transform duration-300" />
            <span className="text-lg sm:text-xl font-heading font-bold tracking-tight">
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
            className="lg:hidden relative z-[60] p-2 text-white hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 w-full h-[100dvh] bg-bg/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 z-[55] transition-all duration-400',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Logo in mobile menu */}
        <div className={clsx(
          'mb-4 transition-all duration-300',
          mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}>
          <Image src="/image.png" alt="Swapture" width={48} height={48} className="w-20 h-20 mx-auto mb-3 object-contain brightness-[1.2] contrast-[1.1]" />
          <span className="text-xl font-heading font-bold tracking-tight block text-center">
            SWAP<span className="text-accent">TURE.</span>
          </span>
        </div>

        <div className="w-12 h-px bg-border/30 mb-2" />

        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleMobileClick(e, link.href)}
            className={clsx(
              'text-xl font-heading font-semibold text-white hover:text-accent transition-all duration-300',
              mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: mobileOpen ? `${(i + 1) * 50}ms` : '0ms' }}
          >
            {link.label}
          </a>
        ))}

        <a
          href="#contacto"
          onClick={(e) => handleMobileClick(e, '#contacto')}
          className={clsx(
            'mt-3 px-8 py-3 bg-accent text-white font-semibold rounded-full text-base transition-all duration-300',
            mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: mobileOpen ? `${(navLinks.length + 1) * 50}ms` : '0ms' }}
        >
          Empezar ahora
        </a>

        <a
          href="/login"
          className={clsx(
            'mt-1 text-sm text-muted hover:text-accent transition-all duration-300',
            mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: mobileOpen ? `${(navLinks.length + 2) * 50}ms` : '0ms' }}
        >
          Iniciar sesión
        </a>
      </div>
    </>
  )
}
