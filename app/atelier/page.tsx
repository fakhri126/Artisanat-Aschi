import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Story } from '@/components/site/story'
import { RawMaterials } from '@/components/site/raw-materials'
import { Workshop } from '@/components/site/workshop'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "L'Atelier — Artisanat Aschi",
  description: "Découvrez l'histoire de l'atelier Artisanat Aschi fondé en 1960 par Hechmi Aschi, le savoir-faire transmis de génération en génération et le processus de création sur-mesure.",
}

export default function AtelierPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      
      <Story />
      <RawMaterials />
      <Workshop />
      
      <section className="relative w-full">
        {/* Unified Background */}
        <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
        {/* Darkening Overlay */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
        
        <div className="relative z-10 w-full">
          <Footer />
        </div>
      </section>
    </main>
  )
}
