import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Swapture',
  description: 'Condiciones de uso del sistema Swapture para generar clientes, automatizar procesos y gestionar oportunidades de negocio.',
}

export default function TerminosPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <span className="section-label">Información legal</span>
          <h1 className="section-title">Términos de Servicio</h1>
          <p className="text-muted text-sm sm:text-base mb-10 sm:mb-12 leading-relaxed">
            Al usar Swapture, aceptas estas condiciones. Las actualizamos cuando es necesario; la versión vigente siempre está publicada aquí.
          </p>

          <div className="space-y-8 sm:space-y-10">
            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">1. Qué ofrecemos</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Swapture es una plataforma que integra sitio web, automatizaciones, CRM, métricas y acompañamiento para ayudar a negocios a generar y gestionar clientes. El alcance exacto depende del plan contratado.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">2. Uso permitido</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                El servicio debe usarse de manera lícita. No está permitido utilizar la plataforma para actividades ilegales, spam, suplantación de identidad, distribución de malware o cualquier uso que dañe a terceros o a la infraestructura de Swapture.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">3. Cuentas y responsabilidad</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu cuenta. Notificanos de inmediato si detectas un uso no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">4. Pagos y suscripciones</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Las tarifas aplicables se muestran antes de contratar. Las suscripciones se facturan de forma recurrente según el plan elegido. Puedes cancelar en cualquier momento; el acceso permanece activo hasta el final del período pagado.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">5. Propiedad intelectual</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Swapture conserva los derechos sobre su marca, software, diseños y metodologías. Tú conservas los derechos sobre el contenido que cargues en la plataforma, y nos otorgas una licencia limitada para hospedarlo y mostrarlo según el funcionamiento del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">6. Limitación de responsabilidad</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Ponemos el máximo cuidado en mantener el servicio disponible y seguro, pero no garantizamos un funcionamiento ininterrumpido o libre de errores. Swapture no se hace responsable por resultados comerciales específicos derivados del uso de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">7. Modificaciones y terminación</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Podemos modificar estas condiciones o suspender el servicio con previo aviso cuando sea razonable. También podemos suspender cuentas que incumplan estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">8. Ley aplicable</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Estos términos se rigen por las leyes de la República de Costa Rica. Cualquier diferencia se resolverá ante los tribunales competentes de San José, Costa Rica.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">9. Contacto</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Si tienes dudas sobre estos términos, escríbenos por WhatsApp al{' '}
                <a
                  href="https://wa.me/50661555619"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-light hover:text-white transition-colors"
                >
                  +506 6155 5619
                </a>
                .
              </p>
            </section>
          </div>

          <p className="mt-12 sm:mt-16 text-xs text-muted/50">
            Última actualización: {new Date().getFullYear()}.
          </p>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
