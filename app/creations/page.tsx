import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Creations } from '@/components/site/creations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Pièces Disponibles — Artisanat Aschi",
  description: "Découvrez nos pièces d'art sculptées disponibles immédiatement à la commande : buffets d'apparat, miroirs, consoles et mobilier d'exception en noyer massif.",
}

export default function CreationsPage() {
  return (
    <main className="relative overflow-x-hidden bg-[#241812] min-h-screen font-sans text-[#F7F4EE]">
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME (Luminosité constante sur toute la page, sans dégradé) */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-creations-disponibles.jpg')] bg-[length:100%_auto] sm:bg-[length:550px_auto] lg:bg-[length:480px_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      {/* Voile d'ombrage plat et uniforme (100% même luminosité de haut en bas, aucun dégradé) */}
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        <div className="pt-14 sm:pt-20">
          <Creations />
        </div>
        <Footer />
      </div>
    </main>
  )
}
