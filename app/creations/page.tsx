import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Creations } from '@/components/site/creations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Créations — Artisanat Aschi",
  description: "Découvrez nos pièces uniques et modèles reproductibles : buffets, miroirs, portes d'apparat, coffres et meubles artisanaux disponibles à la commande.",
}

export default function CreationsPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="pt-20">
        <Creations />
      </div>
      <Footer />
    </main>
  )
}
