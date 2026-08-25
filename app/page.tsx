import { Navbar } from "@/components/site/navbar"
import { AboutVideo } from "@/components/site/about-video"
import { HeroSlider } from "@/components/site/hero-slider"
import { WhyAschi } from "@/components/site/why-aschi"
import { Projects } from "@/components/site/projects"
import { References } from "@/components/site/references"
import { NewsSection } from "@/components/site/news-section"
import { WeeklyDelivery } from "@/components/site/weekly-delivery"
import { VideoReel } from "@/components/site/video-reel"
import { Footer } from "@/components/site/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artisanat Aschi — Sculpteurs du patrimoine tunisien depuis 1960",
  description:
    "Atelier familial fondé en 1960 en Tunisie. Mobilier d'art sculpté à la main, portes artistiques, miroirs de luxe et créations sur-mesure pour villas, hôtels et restaurants.",
}

export default function Page() {
  return (
    <main className="overflow-x-hidden relative bg-[#241812] text-[#F7F4EE] min-h-screen">
      {/* 🌟 FOND MAÎTRE SCROLLABLE (Défile naturellement avec toute la page d'accueil) */}
      <div 
        className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-stats-about.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" 
      />
      {/* Voile d'ombrage doux pour haute lisibilité des cartes et typographies */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#241812]/80 via-black/25 to-[#241812]/85 pointer-events-none" />
      
      {/* Halos d'ambiance atelier répartis sur toute la hauteur */}
      <div className="absolute top-[8%] left-1/4 size-[450px] rounded-full bg-[#E6A635]/18 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[65%] left-1/3 size-[450px] rounded-full bg-[#E6A635]/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[90%] right-1/3 size-[450px] rounded-full bg-[#C78318]/15 blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        {/* 1. Hero : Qui Sommes-Nous & L'Héritage Aschi */}
        <AboutVideo />

        {/* 2. Carrousel des Univers & Collections d'Art */}
        <div className="cv-auto">
          <HeroSlider />
        </div>

        {/* 3. Pourquoi Artisanat Aschi (Piliers, Statistiques & Devis 3D) */}
        <div className="cv-auto">
          <WhyAschi />
        </div>

        {/* 4. Projets & Réalisations d'Exception */}
        <div className="cv-auto">
          <Projects />
        </div>

        {/* 5. Références de Prestige (Placé immédiatement après Réalisations) */}
        <div className="cv-auto">
          <References />
        </div>

        {/* 6. Actualités & Événements (Position C : entre Références et Livraison) */}
        <div className="cv-auto">
          <NewsSection />
        </div>

        {/* 7. Livraison de la semaine & Installations */}
        <div className="cv-auto">
          <WeeklyDelivery />
        </div>

        {/* 8. Témoignages (Placé immédiatement après Livraison) */}
        <div className="cv-auto">
          <VideoReel />
        </div>

        {/* 9. Footer */}
        <Footer />
      </div>
    </main>
  )
}
