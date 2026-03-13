import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0a0a12',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Swapture — Todo lo que necesitas para generar clientes',
  description: 'Página web, automatizaciones, CRM, métricas y soporte en una sola suscripción mensual. El sistema completo que genera clientes para tu negocio.',
  keywords: 'SaaS, sistema de clientes, suscripción, automatización, captación de clientes, plataforma digital',
  openGraph: {
    title: 'Swapture — Todo lo que necesitas para generar clientes',
    description: 'Un solo sistema. Un solo pago mensual. Página, automatizaciones, CRM y métricas — todo incluido.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bg text-white font-body antialiased overflow-x-hidden">
        {/* Background Effects */}
        <div className="noise-overlay" />
        <div className="grid-bg" />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="gradient-orb gradient-orb--1" />
          <div className="gradient-orb gradient-orb--2" />
          <div className="gradient-orb gradient-orb--3" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
