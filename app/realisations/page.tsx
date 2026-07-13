import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Projects } from '@/components/site/projects'
import { References } from '@/components/site/references'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Réalisations — Artisanat Aschi",
  description: "Découvrez nos projets d'exception : hôtels, villas, maisons d'hôtes et restaurants habillés par l'atelier Artisanat Aschi depuis 1960.",
}

export default function RealisationsPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="pt-20">
        <Projects />
        <References />
      </div>
      <Footer />
    </main>
  )
}
