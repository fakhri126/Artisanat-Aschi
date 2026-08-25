import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CustomFormWizard } from '@/components/site/custom-form'
import { Catalog } from '@/components/site/catalog'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Studio Sur-Mesure 3D — Artisanat Aschi',
  description: 'Concevez votre meuble d\'art sur-mesure avec l\'Atelier Aschi. Étude 3D et devis personnalisé.',
}

export default function CustomCreationPage() {
  return (
    <main className="min-h-screen bg-[#241812] text-[#F7F4EE] relative overflow-hidden font-sans">
      {/* Background Texture Layer */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-brass-cabinet-catalogue.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />

      {/* Amber Light Halos */}
      <div className="absolute top-1/4 left-1/4 size-[500px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[500px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        {/* Intro & Wizard Form */}
        <div className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] uppercase tracking-[0.2em] mb-3 font-bold shadow-md">
              <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
              <span>Studio Sur-Mesure 3D</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Votre Pièce d&apos;Art Sur-Mesure
            </h1>
            <p className="text-[#EAE4D9]/90 text-xs sm:text-sm md:text-base leading-relaxed font-light drop-shadow-md">
              De l&apos;esquisse initiale et la modélisation 3D à la sculpture ciselée à la main : nous façonnons l&apos;ouvrage d&apos;art qui s&apos;intégrera avec distinction dans votre espace de vie.
            </p>
          </div>
          
          <CustomFormWizard />
        </div>

        {/* Catalog / Inspiration Section */}
        <div className="border-t border-[#E6A635]/20 py-16 bg-[#241812]/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl text-gold-gradient mb-2.5">
              Galerie d&apos;Inspiration
            </h2>
            <p className="text-[#EAE4D9]/80 text-xs sm:text-sm max-w-xl mx-auto font-light">
              Découvrez nos modèles de référence. Toute création peut être réinterprétée ou adaptée sur-mesure selon vos dimensions et finitions.
            </p>
          </div>
          <Catalog />
        </div>

        <Footer />
      </div>
    </main>
  )
}
