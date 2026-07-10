import Navbar from '@/components/Navbar'
import Hero from '@/components/sections/Hero'
import System from '@/components/sections/System'
import Sectors from '@/components/sections/Sectors'
import Comparison from '@/components/sections/Comparison'
import Process from '@/components/sections/Process'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <System />
        <Comparison />
        <Sectors />
        <Process />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
