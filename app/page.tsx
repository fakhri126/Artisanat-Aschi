import { Navbar } from "@/components/site/navbar"
import { HeroSlider } from "@/components/site/hero-slider"
import { Stats } from "@/components/site/stats"
import { AboutVideo } from "@/components/site/about-video"
import { HomeTeaser } from "@/components/site/home-teaser"
import { NewsSection } from "@/components/site/news-section"
import { Testimonials } from "@/components/site/testimonials"
import { VideoReel } from "@/components/site/video-reel"
import { Gallery } from "@/components/site/gallery"
import { Footer } from "@/components/site/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artisanat Aschi — Sculpteurs du patrimoine tunisien depuis 1960",
  description:
    "Atelier familial fondé en 1960 en Tunisie. Mobilier d'art sculpté à la main, portes artistiques, miroirs de luxe et créations sur-mesure pour villas, hôtels et restaurants.",
}

export default function Page() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSlider />
      <Stats />
      <AboutVideo />
      <HomeTeaser />
      <NewsSection />
      <Testimonials />
      <VideoReel />
      <Gallery />
      <Footer />
    </main>
  )
}
