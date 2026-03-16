'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Reveal from '../Reveal'
import clsx from 'clsx'

const faqs = [
  {
    question: '¿La página web está incluida?',
    answer:
      'Sí. La página web forma parte de la solución cuando el proyecto lo requiere. Se define desde el inicio junto con el resto de herramientas.',
  },
  {
    question: '¿Hay algún costo de instalación?',
    answer:
      'Depende del alcance. Antes de iniciar te presentamos una propuesta con fases, entregables y costos claros para evitar sorpresas.',
  },
  {
    question: '¿Cuánto tarda en estar listo?',
    answer:
      'Depende del alcance y del material disponible. Normalmente en pocas semanas puedes tener una primera versión funcional para empezar a operar.',
  },
  {
    question: '¿Necesito saber de computadoras o internet?',
    answer:
      'Para nada. Nosotros nos encargamos de todo lo técnico. Tú solo recibirás información clara y simple de cómo van las cosas.',
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer:
      'Las condiciones se acuerdan antes de iniciar. Siempre trabajamos con objetivos, tiempos y responsabilidades claras para ambas partes.',
  },
  {
    question: '¿Esto sirve para mi tipo de negocio?',
    answer:
      'Si necesitas conseguir clientes de forma constante — ya sea consultorio, tienda, clínica, agencia, inmobiliaria o cualquier servicio — sí, esto es para ti.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Reveal>
            <span className="section-label">Preguntas frecuentes</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="section-title">
              ¿Tienes dudas?
              <br />
              <span className="text-gradient">Es normal.</span>
            </h2>
          </Reveal>
        </div>

        {/* Accordion */}
        <div className="mt-8 sm:mt-16 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i

            return (
              <Reveal key={i} delay={i + 2}>
                <div
                  className={clsx(
                    'rounded-2xl border transition-all duration-500 overflow-hidden',
                    isOpen
                      ? 'border-accent/30 bg-accent/5'
                      : 'border-border/30 bg-surface/20 hover:border-border/50'
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <span className="text-sm md:text-base font-semibold text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={clsx(
                        'text-accent shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  <div
                    className={clsx(
                      'transition-all duration-500 ease-in-out',
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
