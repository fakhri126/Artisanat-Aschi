'use client'

import { useState, useEffect } from 'react'
import { Reveal } from './reveal'
import { publicApi, Reference } from '@/lib/api'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

const MOCK_CLIENTS = [
  'Dar El Medina',
  'Villa Carthage',
  'Hôtel La Badira',
  'Résidence Gammarth',
  'Le Golfe Royal',
  'Sidi Bou Palace',
  'Dar Hammamet',
  'Maison Sophonisbe',
  'Résidence Les Oliviers',
  'Château Bleu',
  'Riad El Jasmin',
  'Domaine Sidi Slim',
]

export function References() {
  const { color: titleColor, isMounted: isHeroColorMounted } = useRandomHeroColor()
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReferences() {
      try {
        const data = await publicApi.getReferences()
        setReferences(data)
      } catch (err) {
        console.error('Error fetching references from API, using fallback data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadReferences()
  }, [])

  const displayClients = references.length > 0
    ? references.map(ref => ref.name)
    : MOCK_CLIENTS

  return (
    <section className="bg-transparent py-20 md:py-28 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-references.png')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 z-10">
        <Reveal className="text-center">
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#C17D59] drop-shadow-sm">
            Ils nous ont fait confiance
          </p>
          <h2 
            className="mx-auto mt-5 max-w-2xl text-balance font-heading text-3xl font-light leading-tight sm:text-4xl md:text-5xl transition-colors duration-1000 drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)]"
            style={{ color: isHeroColorMounted ? titleColor : '#800020' }}
          >
            Des références prestigieuses à travers la Tunisie
          </h2>
        </Reveal>

        <div className="mt-20 w-full overflow-hidden relative border-y border-[#D4AF37]/20 bg-stone-950/30 backdrop-blur-sm py-10 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
          {/* Gradient edges for smooth fade */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-stone-900 to-transparent z-10 pointer-events-none" />
          
          <div className="flex whitespace-nowrap w-max animate-marquee">
            {/* Double the array for seamless loop */}
            {[...displayClients, ...displayClients].map((client, i) => (
              <div
                key={`${client}-${i}`}
                className="mx-8 md:mx-16 flex items-center justify-center group cursor-default"
              >
                <span className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium text-white/40 drop-shadow-sm transition-all duration-500 group-hover:text-[#D4AF37] group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  {client}
                </span>
                {/* Decorative separator between clients */}
                <span className="ml-16 md:ml-32 text-[#D4AF37]/20 text-xl font-light opacity-50">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scrollMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: scrollMarquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
      </div>
    </section>
  )
}
