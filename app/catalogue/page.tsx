import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CatalogPage } from '@/components/site/catalog-page'
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
      <Footer />
    </main>
  )
}
