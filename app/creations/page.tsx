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
      {/* Background Texture & Ambient Halos */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-white-cabinet.png')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />
      
      <div className="absolute top-1/4 left-1/4 size-[450px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        <div className="pt-20">
          <Creations />
        </div>
        <Footer />
      </div>
    </main>
  )
}
