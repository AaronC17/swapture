'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Reveal from '../Reveal'

const features = [
  'Sin costo de instalación',
  'Listo en semanas',
  'Todo incluido en un solo pago',
  'Cancelación flexible',
]

export default function CTA() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({
    nombre: '',
    negocio: '',
    contacto: '',
    mensaje: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('sent')
        setForm({ nombre: '', negocio: '', contacto: '', mensaje: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left - Copy */}
          <div>
            <Reveal>
              <span className="section-label">Activa tu sistema</span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold leading-tight mb-5">
                Empieza a generar
                <br />
                <span className="text-gradient">clientes hoy.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="text-muted text-sm sm:text-base mb-8 leading-relaxed">
                Cuéntanos sobre tu negocio y te mostramos cómo podemos
                ayudarte a conseguir más clientes desde el primer mes.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface/20 border border-border/15">
                    <CheckCircle2 size={14} className="text-accent/60 shrink-0" />
                    <span className="text-xs text-white/60 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right - Form */}
          <Reveal delay={4}>
            <div className="p-5 sm:p-7 rounded-2xl border border-border/30 bg-surface/10">
              {status === 'sent' ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={28} className="text-accent/70" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2">
                    ¡Mensaje recibido!
                  </h3>
                  <p className="text-sm text-muted">
                    Te contactaremos en las próximas 48 horas.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-muted/70 uppercase tracking-wider font-semibold mb-1.5 block">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="¿Cómo te llamas?"
                      className="w-full px-4 py-3 rounded-xl bg-bg/60 border border-border/30 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/70 uppercase tracking-wider font-semibold mb-1.5 block">
                      Tu negocio
                    </label>
                    <input
                      type="text"
                      name="negocio"
                      value={form.negocio}
                      onChange={handleChange}
                      required
                      placeholder="¿A qué te dedicas?"
                      className="w-full px-4 py-3 rounded-xl bg-bg/60 border border-border/30 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/70 uppercase tracking-wider font-semibold mb-1.5 block">
                      Email o WhatsApp
                    </label>
                    <input
                      type="text"
                      name="contacto"
                      value={form.contacto}
                      onChange={handleChange}
                      required
                      placeholder="Para contactarte"
                      className="w-full px-4 py-3 rounded-xl bg-bg/60 border border-border/30 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted/70 uppercase tracking-wider font-semibold mb-1.5 block">
                      ¿Qué necesitas resolver?
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Cuéntanos brevemente..."
                      className="w-full px-4 py-3 rounded-xl bg-bg/60 border border-border/30 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-accent/40 transition-all duration-300 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-xs text-center">
                      Hubo un error al enviar. Intenta de nuevo.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-3.5 bg-accent text-white font-semibold rounded-full text-sm hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:bg-accent-light transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Quiero más clientes
                        <ArrowRight size={16} />
                      </>
                    )}
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
