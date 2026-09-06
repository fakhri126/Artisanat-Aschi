import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Story } from '@/components/site/story'
import { RawMaterials } from '@/components/site/raw-materials'
import { Workshop } from '@/components/site/workshop'
import { MobileFloatingVIP } from '@/components/site/mobile-floating-vip'
import { Reveal } from '@/components/site/reveal'
import { Sparkles, MapPin, MessageCircle, ArrowRight, Compass, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "L'Atelier d'Art & Savoir-Faire — Maison Artisanat Aschi depuis 1960",
  description: "Découvrez l'histoire de l'atelier Artisanat Aschi fondé par Hachemi Aschi, le savoir-faire ébéniste transmis de génération en génération et nos matières premières nobles.",
}

export default function AtelierPage() {
  return (
    <main className="overflow-x-hidden relative bg-[#241812] text-[#F7F4EE] min-h-screen">
      {/* Fond Maître Sculpté Original */}
      <div 
        className="absolute inset-0 z-0 opacity-70 brightness-90 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" 
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#241812]/80 via-black/25 to-[#241812]/85 pointer-events-none" />

      {/* Halos d'ambiance atelier */}
      <div className="absolute top-[10%] left-1/4 size-[400px] rounded-full bg-[#E6A635]/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[80%] left-1/3 size-[400px] rounded-full bg-[#E6A635]/15 blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        {/* ========================================================================= */}
        {/* 1. HERO D'ACCUEIL IMMERSIF POUR L'ATELIER                                 */}
        {/* ========================================================================= */}
        <section className="pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 text-center px-4 relative">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-xs font-bold uppercase tracking-[0.2em] shadow-md mb-4">
                <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
                <span>Coulisses &amp; Histoire Vivante • La Goulette, Tunis</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-light text-gold-gradient leading-[1.1] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-4">
                L&apos;Âme de l&apos;Atelier <br />
                <span className="font-serif italic text-white font-normal text-2xl sm:text-4xl block mt-1">
                  &amp; La Passion du Geste Artisanal
                </span>
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-pretty text-xs sm:text-base font-normal leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-2xl mx-auto mb-7">
                Depuis 1960, notre atelier familial sculpte le bois de noyer noble au cœur du port historique de La Goulette. Poussez les portes de notre temple de la haute ébénisterie tunisienne.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
                <a
                  href="#histoire"
                  className="btn-sheen w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Compass className="size-4 text-[#1A110B]" />
                  <span>Explorer l&apos;Histoire</span>
                  <ArrowRight className="size-3.5" />
                </a>

                <a
                  href="#visite"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/40 bg-[#3B271C]/85 backdrop-blur-md px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#4E3425] hover:border-[#E6A635] hover:text-[#F2BD52] shadow-md"
                >
                  <MapPin className="size-3.5 text-[#F2BD52]" />
                  <span>Venir à l&apos;Atelier</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. Frise Chronologique Historique */}
        <div className="cv-auto">
          <Story />
        </div>

        {/* 3. Les Matières Premières Nobles */}
        <div className="cv-auto">
          <RawMaterials />
        </div>

        {/* 4. Film & Démonstration Vidéo des 4 Séquences */}
        <div className="cv-auto">
          <Workshop />
        </div>

        {/* ========================================================================= */}
        {/* 5. BLOC FINAL : INVITATION À VISITER L'ATELIER EN PRIVÉ                   */}
        {/* ========================================================================= */}
        <section id="visite" className="relative py-14 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-[#3B271C]/95 backdrop-blur-2xl border-2 border-[#E6A635]/50 p-6 sm:p-10 lg:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-center">
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
                  <MapPin className="size-3 text-[#E6A635]" />
                  <span>Accueil Privé sur Rendez-Vous</span>
                </div>

                <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-light text-gold-gradient mb-3 drop-shadow">
                  Venez Vivre l&apos;Expérience à l&apos;Atelier
                </h2>

                <p className="text-xs sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed mb-6 font-normal drop-shadow">
                  Rencontrez nos maîtres ébénistes, touchez la noblesse de nos essences de bois séchées et concevez votre projet sur-mesure autour d&apos;un thé traditionnel.
                </p>

                {/* Coordonnées Rapides */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8 text-left">
                  <div className="bg-[#241812]/90 border border-[#E6A635]/30 p-3.5 rounded-2xl flex items-center gap-3">
                    <MapPin className="size-5 text-[#F2BD52] shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold">Localisation</p>
                      <p className="text-white text-xs font-medium">La Goulette, Tunis</p>
                    </div>
                  </div>

                  <div className="bg-[#241812]/90 border border-[#E6A635]/30 p-3.5 rounded-2xl flex items-center gap-3">
                    <Clock className="size-5 text-[#F2BD52] shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold">Horaires</p>
                      <p className="text-white text-xs font-medium">Lun - Sam : 08h30 - 18h30</p>
                    </div>
                  </div>

                  <div className="bg-[#241812]/90 border border-[#E6A635]/30 p-3.5 rounded-2xl flex items-center gap-3">
                    <Phone className="size-5 text-[#F2BD52] shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold">Téléphone</p>
                      <p className="text-white text-xs font-medium">+216 55 743 760</p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'Action VIP */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
                  <a
                    href="https://wa.me/21655743760?text=Bonjour%20Maison%20Aschi,%20je%20souhaite%20prendre%20rendez-vous%20pour%20visiter%20l'atelier."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sheen w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="size-4 text-[#1A110B]" />
                    <span>Prendre RDV WhatsApp</span>
                  </a>

                  <Link
                    href="/contact"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/45 bg-[#241812] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:text-[#F2BD52] transition-colors"
                  >
                    <span>Formulaire de Contact</span>
                  </Link>
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* Barre Flottante VIP Mobile */}
        <MobileFloatingVIP />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
