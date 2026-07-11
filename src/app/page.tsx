import Navbar from '@/components/Navbar'
import Hero from '@/components/sections/Hero'
import LiveSalesSection from '@/components/sections/LiveSalesSection'
import System from '@/components/sections/System'
import ScannerFeature from '@/components/sections/ScannerFeature'
import Sectors from '@/components/sections/Sectors'
import Comparison from '@/components/sections/Comparison'
import Process from '@/components/sections/Process'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import SectionDivider from '@/components/SectionDivider'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionDivider />
        <LiveSalesSection />
        <SectionDivider />
        <System />
        <SectionDivider />
        <ScannerFeature />
        <SectionDivider />
        <Comparison />
        <SectionDivider />
        <Sectors />
        <SectionDivider />
        <Process />
        <SectionDivider />
        <Pricing />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
