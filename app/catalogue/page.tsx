import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CatalogPage } from '@/components/site/catalog-page'
import { CustomProcess } from '@/components/site/custom-process'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Catalogue d'Inspiration • Création Sur-Mesure — Artisanat Aschi",
  description: "Parcourez notre catalogue d'inspiration pour vos projets sur-mesure. Filtrez par essence de bois, teintes et dimensions pour concevoir votre meuble unique avec l'Atelier Aschi.",
}

export default function CataloguePage() {
  return (
    <main className="relative w-full bg-[#241812] min-h-screen overflow-x-hidden font-sans text-[#F7F4EE]">
      {/* Background Texture Layer */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-brass-cabinet-catalogue.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />

      {/* Amber Light Halos */}
      <div className="absolute top-1/4 left-1/4 size-[500px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[500px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        <div className="pt-20">
          <CatalogPage />
        </div>
        
        <CustomProcess />
        
        <Footer />
      </div>
    </main>
  )
}
