import { Navbar } from "@/components/site/navbar"
import { HeroSlider } from "@/components/site/hero-slider"
import { Stats } from "@/components/site/stats"
import { AboutVideo } from "@/components/site/about-video"
import { WeeklyDelivery } from "@/components/site/weekly-delivery"
import { NewsSection } from "@/components/site/news-section"
import { Testimonials } from "@/components/site/testimonials"
import { VideoReel } from "@/components/site/video-reel"
import { Gallery } from "@/components/site/gallery"
import { ZellijScatter } from "@/components/site/zellij-scatter"
import { Footer } from "@/components/site/footer"
import { SectionSeparator } from "@/components/site/section-separator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artisanat Aschi — Sculpteurs du patrimoine tunisien depuis 1960",
  description:
    "Atelier familial fondé en 1960 en Tunisie. Mobilier d'art sculpté à la main, portes artistiques, miroirs de luxe et créations sur-mesure pour villas, hôtels et restaurants.",
}

export default function Page() {
  return (
    <main className="overflow-x-hidden relative">
      <ZellijScatter type="page" />
      <Navbar />
      <HeroSlider />
      
      <SectionSeparator />
      <Stats />
      
      <SectionSeparator />
      <AboutVideo />
      
      <SectionSeparator />
      <WeeklyDelivery />
      
      <SectionSeparator />
      <NewsSection />
      
      <SectionSeparator />
      <Testimonials />
      
      <SectionSeparator />
      <VideoReel />
      
      <SectionSeparator />
      <Gallery />
      
      <Footer />
    </main>
  )
}

