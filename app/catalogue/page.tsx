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
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME (Luminosité constante sur toute la page, sans dégradé) */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-brass-cabinet-catalogue.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      {/* Voile d'ombrage plat et uniforme (100% même luminosité de haut en bas, aucun dégradé) */}
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

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
