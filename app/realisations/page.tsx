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
    <main className="overflow-x-hidden relative bg-[#241812] text-[#F7F4EE] min-h-screen">
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME (Luminosité constante sur toute la page, sans dégradé) */}
      <div 
        className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-stats-about.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" 
      />
      {/* Voile d'ombrage plat et uniforme (100% même luminosité de haut en bas, aucun dégradé) */}
      <div className="absolute inset-0 z-0 bg-[#241812]/65 pointer-events-none" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        <div className="pt-20">
          <Projects />
          <References />
        </div>
        <Footer />
      </div>
    </main>
  )
}
