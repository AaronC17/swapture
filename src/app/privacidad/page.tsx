import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Swapture',
  description: 'Cómo recopilamos, usamos y protegemos tu información en Swapture.',
}

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className="relative pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <span className="section-label">Información legal</span>
          <h1 className="section-title">Política de Privacidad</h1>
          <p className="text-muted text-sm sm:text-base mb-10 sm:mb-12 leading-relaxed">
            En Swapture tratamos tu información con responsabilidad. Esta política explica qué datos recopilamos, para qué los usamos y cómo puedes ejercer tus derechos.
          </p>

          <div className="space-y-8 sm:space-y-10">
            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                El responsable de los datos personales es Swapture, operado desde Costa Rica. Para cualquier consulta sobre privacidad puedes contactarnos por WhatsApp al{' '}
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

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">2. Datos que recopilamos</h2>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted leading-relaxed space-y-1">
                <li>Datos de contacto: nombre, correo electrónico, teléfono y nombre del negocio.</li>
                <li>Información de uso: interacciones con la plataforma, páginas visitadas y métricas de rendimiento.</li>
                <li>Datos de clientes finales: cuando usas nuestros formularios o chat, recopilamos la información que tus prospectos deciden compartir.</li>
                <li>Datos técnicos: dirección IP, navegador, dispositivo y cookies necesarias para el funcionamiento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">3. Finalidad del tratamiento</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Usamos la información para: prestar y mejorar el servicio, gestionar tu cuenta, responder solicitudes, enviar comunicaciones relevantes, analizar el rendimiento de campañas y cumplir obligaciones legales. No vendemos datos personales a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">4. Compartición de datos</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Solo compartimos datos con proveedores de confianza que nos ayudan a operar la plataforma (hosting, comunicaciones, pagos y análisis), siempre bajo obligaciones de confidencialidad y seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">5. Seguridad</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Aplicamos medidas técnicas y organizativas para proteger tu información contra accesos no autorizados, pérdida o alteración. Ningún sistema es 100 % infalible, por lo que también dependemos de que mantengas tus credenciales seguras.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">6. Cookies y tecnologías similares</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Usamos cookies esenciales para el funcionamiento del sitio y, cuando aplica, cookies de análisis para entender cómo se usa la plataforma. Puedes configurar tu navegador para rechazar cookies, aunque algunas funciones podrían verse afectadas.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">7. Tus derechos</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos personales. Para ejercer estos derechos, escríbenos al WhatsApp indicado arriba y atenderemos tu solicitud en el menor tiempo posible.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">8. Cambios en esta política</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Podemos actualizar esta política para reflejar cambios en el servicio o en la normativa. Publicaremos la versión revisada en esta misma página con la fecha de actualización.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-white mb-3">9. Contacto</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Para cualquier tema relacionado con privacidad, contactanos por WhatsApp al{' '}
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
