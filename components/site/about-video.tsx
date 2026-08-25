'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from './reveal'
import { Award, ArrowRight, Sparkles, Compass, MessageCircle } from 'lucide-react'
import { MagneticCard } from '../motion/magnetic-card'
import { HeritageSeal } from './heritage-seal'

export function AboutVideo() {
  return (
    <section id="accueil" className="relative overflow-hidden bg-transparent pt-24 sm:pt-32 lg:pt-36 pb-14 sm:pb-18 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 🖥️ DESKTOP LAYOUT (lg:) : 2 Colonnes (Texte à Gauche, Image à Droite)    */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          
          {/* Colonne Gauche (7 Colonnes) : Texte, Boutons & 3 Piliers */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center">
            <Reveal>
              {/* Badge d'Apparat */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-xs font-bold uppercase tracking-[0.2em] shadow-md mb-4">
                <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
                <span>Maison Fondée en 1960 • Tunisie</span>
              </div>

              {/* Titre Principal */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-light text-gold-gradient leading-[1.08] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-4">
                Maison Artisanat Aschi <br />
                <span className="font-serif italic text-white font-normal text-2xl sm:text-3xl lg:text-[2.8rem] block mt-1">
                  Haute Ébénisterie &amp; Sculpture d&apos;Art
                </span>
              </h1>

              {/* Paragraphe Introductif en Blanc Pur */}
              <p className="text-pretty text-sm sm:text-base md:text-[16.5px] font-normal leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-2xl mb-7">
                Depuis plus de six décennies, notre atelier perpétue l&apos;excellence du travail du noyer massif, du laiton ciselé et des patines d&apos;apparat. Nous concevons du mobilier d&apos;exception et des aménagements monumentaux sur-mesure pour les plus belles demeures et palaces.
              </p>
            </Reveal>

            {/* Boutons d'Action (Desktop) */}
            <Reveal delay={100}>
              <div className="flex flex-row items-center gap-3.5 mb-7">
                {/* Contactez-nous */}
                <Link
                  href="/contact"
                  className="btn-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(230,166,53,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <MessageCircle className="size-4 text-[#1A110B]" />
                  <span>Contactez-nous</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                {/* Visiter l'Atelier */}
                <Link
                  href="/atelier"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/40 bg-[#3B271C]/85 backdrop-blur-md px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#4E3425] hover:border-[#E6A635] hover:text-[#F2BD52] shadow-md whitespace-nowrap"
                >
                  <Compass className="size-3.5 text-[#F2BD52]" />
                  <span>Visiter l&apos;Atelier</span>
                </Link>
              </div>
            </Reveal>

            {/* Les 3 Piliers (Desktop) */}
            <Reveal delay={150}>
              <div className="py-2.5 px-4 rounded-xl bg-[#3B271C]/75 backdrop-blur-md border border-[#E6A635]/30 shadow-md max-w-xl">
                <div className="grid grid-cols-3 divide-x divide-[#E6A635]/20 text-center">
                  <div className="px-2">
                    <span className="font-heading text-lg sm:text-xl font-light text-gold-gradient block leading-tight">1960</span>
                    <span className="text-[9.5px] uppercase tracking-[0.14em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Atelier Familial</span>
                  </div>
                  <div className="px-2">
                    <span className="font-heading text-lg sm:text-xl font-light text-gold-gradient block leading-tight">100%</span>
                    <span className="text-[9.5px] uppercase tracking-[0.14em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Noyer Noble</span>
                  </div>
                  <div className="px-2">
                    <span className="font-heading text-base sm:text-lg font-light text-gold-gradient block leading-tight">Sur-Mesure</span>
                    <span className="text-[9.5px] uppercase tracking-[0.14em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Conception 3D</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Colonne Droite (5 Colonnes) : Cadre Photo d'Art & Sceau */}
          <div className="lg:col-span-5 relative flex justify-end">
            <Reveal delay={150} className="relative w-full max-w-[440px]">
              {/* Sceau d'Héritage Tournant */}
              <div className="absolute -top-6 -right-5 z-30 pointer-events-none">
                <HeritageSeal size={105} />
              </div>

              {/* Lueur d'ambiance */}
              <div className="absolute inset-0 bg-[#E6A635]/18 blur-2xl rounded-3xl -z-10" />

              <MagneticCard intensity={3} glareOpacity={0.1}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-[#E6A635]/45 bg-[#3B271C] shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                  <Image
                    src="/images/about-atelier-stand.jpg"
                    alt="Stand d'exposition & mobilier d'art - Artisanat Aschi"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-black/15 to-transparent z-10 pointer-events-none" />

                  {/* Badge Flottant Inférieur */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#3B271C]/95 backdrop-blur-xl border border-[#E6A635]/40 p-3.5 rounded-xl flex items-center justify-between text-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-to-tr from-[#F3C45E] via-[#E6A635] to-[#C78318] flex items-center justify-center text-[#1A110B] shrink-0 shadow-md">
                        <Award className="size-5 text-[#1A110B]" />
                      </div>
                      <div>
                        <h4 className="font-heading text-xs sm:text-sm font-semibold text-white leading-tight">Mobilier &amp; Boiserie D&apos;Art</h4>
                        <p className="text-[10px] text-[#F2BD52] uppercase font-bold tracking-[0.14em] mt-0.5">Sculpture sur Bois Noble &amp; Noyer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </Reveal>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 📱 MOBILE LAYOUT (< lg:) : Séquence Linéaire (Texte ➔ Image ➔ Piliers ➔ Boutons) */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:hidden items-center text-center">
          
          {/* 1. Texte de Présentation */}
          <div className="w-full max-w-xl mx-auto mb-5">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-bold uppercase tracking-[0.18em] shadow-md mb-3">
                <Sparkles className="size-2.5 text-[#E6A635] animate-pulse" />
                <span>Maison Fondée en 1960 • Tunisie</span>
              </div>

              <h1 className="font-heading text-[1.85rem] sm:text-4xl font-light text-gold-gradient leading-[1.1] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-2.5">
                Maison Artisanat Aschi <br />
                <span className="font-serif italic text-white font-normal text-xl sm:text-2xl block mt-0.5">
                  Haute Ébénisterie &amp; Sculpture d&apos;Art
                </span>
              </h1>

              <p className="text-pretty text-xs sm:text-sm font-normal leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-lg mx-auto">
                Depuis plus de six décennies, notre atelier perpétue l&apos;excellence du travail du noyer massif, du laiton ciselé et des patines d&apos;apparat. Nous concevons du mobilier d&apos;exception et des aménagements monumentaux sur-mesure.
              </p>
            </Reveal>
          </div>

          {/* 2. L'Image Agrandie avec enseigne "ARTISANAT ASCHI" bien visible */}
          <Reveal delay={100} className="relative w-full max-w-[360px] sm:max-w-[420px] mx-auto mb-5">
            {/* Sceau décalé à gauche pour dégager l'enseigne */}
            <div className="absolute -top-3.5 -left-2 z-30 pointer-events-none scale-75 origin-top-left">
              <HeritageSeal size={90} />
            </div>

            <div className="absolute inset-0 bg-[#E6A635]/18 blur-xl rounded-2xl -z-10" />

            <div className="relative aspect-[4/5] min-h-[350px] w-full overflow-hidden rounded-2xl border-2 border-[#E6A635]/45 bg-[#3B271C] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group">
              <Image
                src="/images/about-atelier-stand.jpg"
                alt="Stand d'exposition & mobilier d'art - Artisanat Aschi"
                fill
                priority
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-black/10 to-transparent z-10 pointer-events-none" />

              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 bg-[#3B271C]/95 backdrop-blur-xl border border-[#E6A635]/40 p-2.5 rounded-xl flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-gradient-to-tr from-[#F3C45E] via-[#E6A635] to-[#C78318] flex items-center justify-center text-[#1A110B] shrink-0 shadow-md">
                    <Award className="size-4 text-[#1A110B]" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-heading text-xs font-semibold text-white leading-tight">Mobilier &amp; Boiserie D&apos;Art</h4>
                    <p className="text-[9px] text-[#F2BD52] uppercase font-bold tracking-[0.12em] mt-0.5">Sculpture sur Bois Noble &amp; Noyer</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 3. Les 3 Piliers (Sous l'image) */}
          <Reveal delay={150} className="w-full max-w-sm sm:max-w-md mx-auto mb-5">
            <div className="py-2 px-3 rounded-xl bg-[#3B271C]/85 backdrop-blur-md border border-[#E6A635]/30 shadow-md">
              <div className="grid grid-cols-3 divide-x divide-[#E6A635]/20 text-center">
                <div className="px-1">
                  <span className="font-heading text-base font-light text-gold-gradient block leading-tight">1960</span>
                  <span className="text-[8.5px] uppercase tracking-[0.12em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Atelier Familial</span>
                </div>
                <div className="px-1">
                  <span className="font-heading text-base font-light text-gold-gradient block leading-tight">100%</span>
                  <span className="text-[8.5px] uppercase tracking-[0.12em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Noyer Noble</span>
                </div>
                <div className="px-1">
                  <span className="font-heading text-sm font-light text-gold-gradient block leading-tight">Sur-Mesure</span>
                  <span className="text-[8.5px] uppercase tracking-[0.12em] text-[#F2BD52] font-semibold mt-0.5 block truncate">Conception 3D</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 4. Les 2 Boutons (En dessous des piliers) */}
          <Reveal delay={200} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-sm sm:max-w-md mx-auto">
            <Link
              href="/contact"
              className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="size-4 text-[#1A110B] shrink-0" />
              <span>Contactez-nous</span>
              <ArrowRight className="size-3.5 shrink-0" />
            </Link>

            <Link
              href="/atelier"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/40 bg-[#3B271C]/85 backdrop-blur-md px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-white transition-all hover:bg-[#4E3425] hover:border-[#E6A635] hover:text-[#F2BD52] shadow-md"
            >
              <Compass className="size-3.5 text-[#F2BD52] shrink-0" />
              <span>Visiter l&apos;Atelier</span>
            </Link>
          </Reveal>

        </div>

      </div>
    </section>
  )
}
