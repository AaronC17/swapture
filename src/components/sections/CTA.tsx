'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Reveal from '../Reveal'

const features = [
  'Implementación desde ₡100,000',
  'Mensualidad fija de ₡25,000',
  'Listo en pocas semanas',
  'Sistema siempre activo',
]

export default function CTA() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')
  const [form, setForm] = useState({
    nombre: '',
    negocio: '',
    contacto: '',
    mensaje: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nombre = form.nombre.trim()
    const negocio = form.negocio.trim()
    const contacto = form.contacto.trim()
    const mensaje = form.mensaje.trim()

    const message = [
      `Hola, soy *${nombre}*.`,
      `Mi negocio: *${negocio}*.`,
      `Contacto: *${contacto}*.`,
      '',
      `Necesito resolver: ${mensaje}`,
    ].join('\n')

    const url = `https://wa.me/50661555619?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    setStatus('sent')
    setForm({ nombre: '', negocio: '', contacto: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="relative py-14 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left - Copy */}
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="section-label">Activa tu sistema</span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold leading-tight mb-5">
                Empieza a generar
                <br />
                <span className="text-gradient">clientes hoy</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="text-muted text-xs sm:text-base mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                Cuéntanos sobre tu negocio y te mostramos cómo podemos
                ayudarte a captar más oportunidades con una propuesta realista y aterrizada a tu contexto.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface/30 border border-border/40 text-center sm:text-left justify-center sm:justify-start">
                    <CheckCircle2 size={14} className="text-positive shrink-0 hidden sm:block" />
                    <span className="text-[11px] sm:text-xs text-white/60 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right - Form */}
          <Reveal delay={4}>
            <div className="p-4 sm:p-6 rounded-2xl border border-border/40 bg-surface/20 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              {status === 'sent' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={22} className="text-accent/70" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-white mb-1">
                    ¡Mensaje listo!
                  </h3>
                  <p className="text-xs text-muted">
                    Se abrió WhatsApp con tu información.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold mb-1 block">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="¿Cómo te llamas?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg/60 border border-border/40 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold mb-1 block">
                      Tu negocio
                    </label>
                    <input
                      type="text"
                      name="negocio"
                      value={form.negocio}
                      onChange={handleChange}
                      required
                      placeholder="¿A qué te dedicas?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg/60 border border-border/40 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold mb-1 block">
                      Email o WhatsApp
                    </label>
                    <input
                      type="text"
                      name="contacto"
                      value={form.contacto}
                      onChange={handleChange}
                      required
                      placeholder="Para contactarte"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg/60 border border-border/40 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold mb-1 block">
                      ¿Qué necesitas resolver?
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Cuéntanos brevemente..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg/60 border border-border/40 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-accent/[0.08] border border-accent/30 text-accent-light font-semibold rounded-full text-sm hover:bg-accent/15 hover:border-accent/50 transition-all duration-500 flex items-center justify-center gap-2 pl-[5.25%]"
                  >
                    Quiero más clientes
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
