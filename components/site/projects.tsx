'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Reveal } from './reveal'
import { publicApi, Project } from '@/lib/api'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'Hôtel Dar El Jeld',
    category: 'Hôtels',
    imageUrl: '/project-hotel.png',
    span: 'lg:col-span-2 lg:row-span-2',
    description: "Aménagement monumental complet de l'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques d'inspiration andalouse, et mobilier de salon d'exception.",
  },
  {
    id: 2,
    title: "Maison d'Hôtes Dar Said",
    category: "Maisons d'hôtes",
    imageUrl: '/project-guesthouse.png',
    span: '',
    description: "Conception sur-mesure d'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés, commodes incrustées de laiton poli et cadres de miroirs dorés à la feuille d'or.",
  },
  {
    id: 3,
    title: 'Restaurant La Falaise',
    category: 'Restaurants',
    imageUrl: '/project-restaurant.png',
    span: '',
    description: "Conception globale de l'espace bar et de la salle de repas. Comptoir de bar sculpté dans un tronc de chêne massif, tables marquetées et luminaires d'ambiance ajourés.",
  },
  {
    id: 4,
    title: "Bureaux Corporate L'Ébène",
    category: "Entreprises",
    imageUrl: '/project-villa.png',
    span: 'lg:col-span-2',
    description: "Aménagement prestigieux de la salle du conseil d'administration et des bureaux de direction. Table de réunion de 6 mètres de long en chêne d'un seul tenant, et habillage acoustique sculpté.",
  },
]

export function Projects() {
  const router = useRouter()
  const { color: titleColor, isMounted: isHeroColorMounted } = useRandomHeroColor()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const timer = setInterval(() => {
      // If scrollWidth is greater than clientWidth, it means we are in the mobile scroll view
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
        
        if (scrollContainer.scrollLeft >= maxScroll - 10) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Scroll by the width of one card approximately (85vw + gap)
          const scrollAmount = window.innerWidth * 0.85 + 20
          scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      }
    }, 5000)
    
    return () => clearInterval(timer)
  }, [])

  const displayProjects = MOCK_PROJECTS

  return (
    <section id="realisations" className="relative overflow-hidden bg-transparent py-24 md:py-36 border-y border-[#D9CEB8]/30">
      <div 
        className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-colorful-cabinet.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 z-10">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_2px_rgba(26,17,11,0.9)]">
              Projets & réalisations
            </p>
            <h2 
              className="mt-5 max-w-2xl text-balance font-heading text-4xl font-light leading-tight drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] sm:text-5xl md:text-6xl transition-colors duration-1000"
              style={{ color: isHeroColorMounted ? titleColor : '#800020' }}
            >
              Des lieux d&apos;exception signés Aschi
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-base font-medium leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] text-left">
            Villas, maisons d&apos;hôtes, hôtels, restaurants et résidences
            privées : nous façonnons des décors qui traversent le temps.
          </p>
        </Reveal>

        <div 
          ref={scrollRef}
          className="mt-14 flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 sm:grid sm:auto-rows-[16rem] sm:grid-cols-2 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {displayProjects.map((p, i) => {
            const title = p.title
            const category = 'category' in p ? p.category : (p as any).category
            const image = 'imageUrl' in p ? p.imageUrl : (p as any).imageUrl
            const desc = p.description
            const span = (p as any).span || ''

            return (
              <Reveal
                key={title}
                delay={(i % 2) * 120}
                className={`group relative overflow-hidden shrink-0 w-[85vw] h-[26rem] snap-center sm:w-auto sm:h-auto sm:shrink-1 sm:snap-none ${span} cursor-pointer rounded-2xl`}
              >
                <div 
                  className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-transparent transition-all duration-700 hover:border-[#D4AF37]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] group-hover:-translate-y-2 bg-stone-950"
                  onClick={() => {
                    const id = (p as any).id || (i + 1)
                    router.push(`/espaces-d-exception?projectId=${id}`)
                  }}
                >
                  {image?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video
                      src={image}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="size-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <img
                      src={image || '/placeholder.svg'}
                      alt={title}
                      className="size-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-70" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 text-white text-left overflow-hidden">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#D4AF37] font-bold drop-shadow-md transform transition-transform duration-500 group-hover:-translate-y-1">
                      {category}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-medium leading-tight md:text-3xl drop-shadow-lg text-white transform transition-transform duration-500 group-hover:-translate-y-1">
                      {title}
                    </h3>
                    <p className="max-w-xs text-sm font-light text-white/90 drop-shadow-md transition-all duration-700 max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 group-hover:mt-3 line-clamp-3">
                      {desc}
                    </p>
                  </div>
                  <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Reveal>
            )
          })}
        </div>
        
        {/* CTA Section */}
        <Reveal delay={200} className="w-full flex justify-center mt-20 z-10 relative">
          <div className="relative group/cta">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#C17D59] rounded-full blur opacity-40 group-hover/cta:opacity-75 transition duration-1000 group-hover/cta:duration-200"></div>
            <Link
              href="/contact?subject=espaces-exception"
              className="relative inline-flex items-center gap-3 rounded-full bg-stone-950 px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-stone-900 border border-[#D4AF37]/50"
            >
              Démarrer votre projet
              <ChevronRight className="size-4 text-[#D4AF37] transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
