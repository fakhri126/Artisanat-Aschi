'use client'

import { useState, useEffect } from 'react'
import { Reveal } from './reveal'
import { publicApi, Reference } from '@/lib/api'
import { Sparkles } from 'lucide-react'

const MOCK_BRANDS_ROW1 = [
  'Hôtel La Badira 5★',
  'Dar El Jeld Hotel & Spa',
  'Villa Carthage',
  'Dar El Medina',
  'Résidence Gammarth',
  'Sidi Bou Palace',
  'Le Golfe Royal',
  'Hasdrubal Prestige',
]

const MOCK_BRANDS_ROW2 = [
  'Dar Said Sidi Bou Saïd',
  'Dar Hammamet',
  'Maison Sophonisbe',
  'Riad El Jasmin',
  'Résidence Les Oliviers',
  'Château Bleu Gammarth',
  'Domaine Sidi Slim',
  'Palais Ennejma Ezzahra',
]

export function References() {
  const [references, setReferences] = useState<Reference[]>([])

  useEffect(() => {
    async function loadReferences() {
      try {
        const data = await publicApi.getReferences()
        if (data && data.length > 0) setReferences(data)
      } catch (err) {
        console.error('Error fetching references from API, using fallback data:', err)
      }
    }
    loadReferences()
  }, [])

  const brandsList = references.length > 0 ? references.map(r => r.name) : [...MOCK_BRANDS_ROW1, ...MOCK_BRANDS_ROW2]
  const halfLength = Math.ceil(brandsList.length / 2)
  const row1 = brandsList.slice(0, halfLength)
  const row2 = brandsList.slice(halfLength)

  return (
    <section id="references" className="bg-transparent py-8 sm:py-12 relative overflow-hidden border-none scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 z-20">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE ÉPURÉ & STATUTAIRE                                             */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Partenaires &amp; Prestigieuses Demeures</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-light text-gold-gradient drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-tight">
              Ils Nous Font Confiance Depuis 1960
            </h2>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. DOUBLE BANDEAU DÉROULANT CONTINU (Double Marquee Luxe)                 */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 sm:space-y-3">
          
          {/* Marquee Row 1 */}
          <div className="w-full overflow-hidden relative bg-[#3B271C]/90 border-y-2 border-[#E6A635]/40 backdrop-blur-xl py-3.5 sm:py-4 shadow-xl rounded-2xl">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#241812] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#241812] to-transparent z-10 pointer-events-none" />

            <div className="flex whitespace-nowrap w-max animate-marquee-left">
              {[...row1, ...row1, ...row1, ...row1].map((brand, i) => (
                <div key={`r1-${brand}-${i}`} className="mx-4 md:mx-7 flex items-center group cursor-pointer">
                  <span className="font-heading text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white drop-shadow transition-all duration-300 group-hover:text-[#F2BD52] group-hover:scale-105 font-serif tracking-wide">
                    {brand}
                  </span>
                  <span className="ml-6 md:ml-12 text-[#F2BD52] text-xs font-semibold">✦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Row 2 */}
          <div className="w-full overflow-hidden relative bg-[#3B271C]/75 border-b-2 border-[#E6A635]/30 backdrop-blur-md py-3 sm:py-3.5 shadow-md rounded-2xl">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#241812] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#241812] to-transparent z-10 pointer-events-none" />

            <div className="flex whitespace-nowrap w-max animate-marquee-right">
              {[...row2, ...row2, ...row2, ...row2].map((brand, i) => (
                <div key={`r2-${brand}-${i}`} className="mx-4 md:mx-7 flex items-center group cursor-pointer">
                  <span className="font-heading text-sm sm:text-base md:text-lg lg:text-xl font-light text-white/90 drop-shadow transition-all duration-300 group-hover:text-[#F2BD52] group-hover:scale-105 font-serif italic">
                    {brand}
                  </span>
                  <span className="ml-6 md:ml-12 text-[#E6A635]/60 text-[10px] font-semibold">❖</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Marquee Keyframes Animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-33.333%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marqueeLeft 34s linear infinite;
            will-change: transform;
          }
          .animate-marquee-right {
            animation: marqueeRight 38s linear infinite;
            will-change: transform;
          }
          .animate-marquee-left:hover, .animate-marquee-right:hover {
            animation-play-state: paused;
          }
        `}} />

      </div>
    </section>
  )
}
