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
      {/* Background Texture with sharper, controlled scale & vivid brightness */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-creations-disponibles.jpg')] bg-[length:100%_auto] sm:bg-[length:550px_auto] lg:bg-[length:480px_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/75 via-[#1A110B]/50 to-[#241812]/80 pointer-events-none z-0" />
      
      <div className="absolute top-1/4 left-1/4 size-[500px] rounded-full bg-[#E6A635]/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[500px] rounded-full bg-[#C78318]/18 blur-[130px] pointer-events-none z-0" />

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
