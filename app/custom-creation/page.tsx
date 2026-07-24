import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CustomFormWizard } from '@/components/site/custom-form'
import { Catalog } from '@/components/site/catalog'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Créations sur Mesure - Artisanat Aschi',
  description: 'Concevez votre meuble d\'art sur-mesure avec l\'Atelier Aschi.',
}

export default function CustomCreationPage() {
  return (
    <main className="min-h-screen bg-walnut text-ivory">
      <Navbar />
      
      {/* Intro & Wizard Form */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="size-3.5" /> Service sur Mesure
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Votre création unique
          </h1>
          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed">
            De l&apos;esquisse initiale à la finition ciselée à la main, nous façonnons la pièce qui s&apos;intégrera parfaitement dans votre espace de vie. Suivez notre configurateur de projet pour exprimer votre besoin.
          </p>
        </div>
        
        <CustomFormWizard />
      </div>

      {/* Catalog / Inspiration Section */}
      <div className="bg-stone-950/40 border-t border-gold/10 py-20">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4">
            Galerie d&apos;Inspiration
          </h2>
          <p className="text-ivory/60 text-sm max-w-xl mx-auto font-light">
            Découvrez quelques-uns de nos modèles passés. Toute pièce peut être reproduite ou servir de base d&apos;inspiration pour votre propre création.
          </p>
        </div>
        <Catalog />
      </div>

      <Footer />
    </main>
  )
}
