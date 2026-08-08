import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CatalogPage } from '@/components/site/catalog-page'
import { CustomProcess } from '@/components/site/custom-process'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Catalogue d'inspiration — Artisanat Aschi",
  description: "Parcourez le catalogue de réalisations d'Artisanat Aschi. Filtrez par catégorie, couleur et dimensions pour trouver l'inspiration pour votre projet sur-mesure.",
}

export default function CataloguePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      
      <div className="pt-20">
        <CatalogPage />
      </div>
      
      <CustomProcess />
      
      <section className="relative w-full">
        {/* Unified Background for Footer to match CustomProcess */}
        <div className="absolute inset-0 z-0 opacity-60 brightness-50 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
        <div className="relative z-10 w-full">
          <Footer />
        </div>
      </section>
    </main>
  )
}
