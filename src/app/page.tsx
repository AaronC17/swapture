import Navbar from '@/components/Navbar'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import System from '@/components/sections/System'
import Sectors from '@/components/sections/Sectors'
import Comparison from '@/components/sections/Comparison'
import Process from '@/components/sections/Process'
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
        <Problem />
        <System />
        <Comparison />
        <Sectors />
        <Process />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
