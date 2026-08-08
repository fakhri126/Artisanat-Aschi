import { Navbar } from "@/components/site/navbar"
import { HeroSlider } from "@/components/site/hero-slider"
import { AboutVideo } from "@/components/site/about-video"
import { Projects } from "@/components/site/projects"
import { ExpressQuoteCTA } from "@/components/site/express-quote-cta"
import { WeeklyDelivery } from "@/components/site/weekly-delivery"
import { NewsSection } from "@/components/site/news-section"
import { VideoReel } from "@/components/site/video-reel"
import { References } from "@/components/site/references"
import { Stats } from "@/components/site/stats"
import { Footer } from "@/components/site/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artisanat Aschi — Sculpteurs du patrimoine tunisien depuis 1960",
  description:
    "Atelier familial fondé en 1960 en Tunisie. Mobilier d'art sculpté à la main, portes artistiques, miroirs de luxe et créations sur-mesure pour villas, hôtels et restaurants.",
}

export default function Page() {
  return (
    <main className="overflow-x-hidden relative">
      <Navbar />
      
      {/* 1. Hero */}
      <HeroSlider />
      
      {/* 2. Qui sommes nous */}
      <div className="relative">
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
          style={{ 
            backgroundImage: "url('/images/bg-stats-about.jpg')",
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            backgroundRepeat: "repeat"
          }} 
        />
        <div className="relative z-10">
          <AboutVideo />
        </div>
      </div>
      
      {/* 3. Projets / Réalisations */}
      <Projects />
      
      {/* 4. Demande de devis (Express CTA) */}
      <div className="relative">
        <div 
          className="absolute inset-0 z-0 opacity-50 brightness-90 pointer-events-none bg-[url('/images/bg-green-cabinet-devis.jpg')] bg-cover bg-center" 
        />
        <div className="relative z-10">
          <ExpressQuoteCTA />
        </div>
      </div>
      
      {/* 5. Livraison */}
      <div className="relative">
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
          style={{ 
            backgroundImage: "url('/images/bg-weekly-delivery-2.jpg')",
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            backgroundRepeat: "repeat"
          }} 
        />
        <div className="relative z-10">
          <WeeklyDelivery />
        </div>
      </div>
      
      {/* 6. Actualités */}
      <NewsSection />
      
      {/* 7. Témoignages Vidéo (Video Reel avec avis réseaux) */}
      <VideoReel />
      
      {/* 8. Références */}
      <References />
      
      {/* 9. Stats + Footer */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-green-cabinet.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" 
        />
        <div className="relative z-10 w-full">
          <Stats />
          <Footer />
        </div>
      </section>
    </main>
  )
}

