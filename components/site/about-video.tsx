'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from './reveal'
import { Award, History, ArrowRight, Sparkles, Compass } from 'lucide-react'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function AboutVideo() {
  const { color: titleColor, isMounted } = useRandomHeroColor()

  return (
    <section id="savoir-faire" className="relative overflow-hidden bg-transparent py-20 sm:py-32">
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Text Content */}
        <div className="w-full lg:w-1/2">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1512]/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.25em] shadow-md mb-6">
              <Sparkles className="size-3.5 animate-pulse" />
              <span>Qui sommes-nous</span>
            </div>

            <h2 
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-light leading-tight drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] transition-colors duration-1000 mb-6"
              style={{ color: isMounted ? titleColor : '#D4AF37' }}
            >
              Maison Artisanat Aschi
            </h2>

            <p className="text-pretty text-base sm:text-lg font-light leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] mb-8">
              Implantée en Tunisie depuis 1960, la Maison Artisanat Aschi perpétue l&apos;excellence de la sculpture sur bois noble. Notre atelier façonne des pièces uniques où le noyer massif, le laiton et la lumière chaude se rencontrent pour créer du mobilier et des installations d&apos;exception.
            </p>
          </Reveal>

          {/* Action Buttons */}
          <Reveal delay={150}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/atelier"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#C17D59] to-[#8C5230] hover:from-[#d4af37] hover:to-[#C17D59] text-white px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest shadow-xl border border-[#E8DCCB]/30 transition-all transform hover:-translate-y-1"
              >
                <span>Découvrir l&apos;Atelier</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/custom-creation"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9CEB8] bg-white/90 backdrop-blur-md px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest text-[#3A2A1E] transition-all hover:bg-[#E8DCCB]"
              >
                <Compass className="size-4 text-[#C17D59]" />
                <span>Devis Sur-Mesure</span>
              </Link>
            </div>
          </Reveal>

          {/* Trust Highlights */}
          <Reveal delay={200} className="mt-12 pt-8 border-t border-white/15">
            <div className="grid grid-cols-3 gap-4 text-white">
              <div>
                <span className="font-heading text-2xl font-bold text-[#D4AF37] block">1960</span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-medium">Fondation Familiale</span>
              </div>
              <div>
                <span className="font-heading text-2xl font-bold text-[#D4AF37] block">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-medium">Bois Noble Massif</span>
              </div>
              <div>
                <span className="font-heading text-2xl font-bold text-[#D4AF37] block">Sur-Mesure</span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-medium">Conception D'Exception</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Photo Frame (Cleaned image without marionette) */}
        <div className="w-full lg:w-1/2">
          <Reveal delay={200} className="relative mx-auto max-w-[520px]">
            {/* Outer Luxury Frame */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-white/90 bg-[#3A2A1E] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              
              <Image
                src="/images/about-atelier-stand.jpg"
                alt="Stand d'exposition & mobilier sculpté - Artisanat Aschi"
                fill
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Inner Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512]/80 via-transparent to-transparent z-10 pointer-events-none" />

              {/* Floating Badge on Photo */}
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#1A1512]/80 backdrop-blur-md border border-[#D4AF37]/40 p-4 rounded-2xl flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#C17D59] flex items-center justify-center text-white shrink-0">
                    <Award className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-medium text-[#E8DCCB]">Mobilier &amp; Boiserie D&apos;Art</h4>
                    <p className="text-[10px] text-[#D4B896] uppercase tracking-wider">Luxe, Sculpture &amp; Luminaires</p>
                  </div>
                </div>
              </div>

            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}


