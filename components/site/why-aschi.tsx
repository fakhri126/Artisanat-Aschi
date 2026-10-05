'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from './reveal'
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Compass, 
  Trees, 
  Gem,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react'

interface StatProps {
  value: number
  suffix: string
  label: string
  sublabel: string
}

function StatItem({ value, suffix, label, sublabel }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setCount(Math.floor(latest))
      })
      return () => controls.stop()
    }
  }, [isInView, value])

  const formattedCount = value >= 1000 ? count.toLocaleString('fr-FR') : count

  return (
    <div ref={ref} className="text-center px-1 py-1.5 sm:py-3">
      <div className="font-heading font-light text-2xl sm:text-4xl lg:text-5xl text-gold-gradient tracking-tight tabular-nums">
        {formattedCount}
        <span className="text-[#F2BD52] font-heading font-light ml-0.5 text-base sm:text-2xl lg:text-3xl">{suffix}</span>
      </div>
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#F2BD52] font-semibold mt-0.5 sm:mt-1">
        {label}
      </div>
      <div className="text-[8.5px] sm:text-[11px] text-white/70 font-normal mt-0.5">
        {sublabel}
      </div>
    </div>
  )
}

const ENGAGEMENTS = [
  {
    id: 1,
    tabNum: '01',
    tabTitle: '100% Noyer Massif',
    tag: '01 • LE MATÉRIAU',
    title: 'Du Vrai Bois de Noyer Massif',
    desc: "Nous utilisons uniquement du bois de noyer noble bien séché à cœur. Vos meubles ne bougent pas avec le temps, résistent à l'humidité et durent toute une vie.",
    image: '/images/bg-carved-wood.jpg',
    icon: Trees,
  },
  {
    id: 2,
    tabNum: '02',
    tabTitle: 'Sculpté à la Main',
    tag: '02 • LE TRAVAIL MANUEL',
    title: '100% Fait Main depuis 1960',
    desc: "Chaque motif, arabesque et détail est sculpté à la main par nos maîtres artisans. C'est ce travail d'artisan qui donne à chaque pièce son âme et son authenticité.",
    image: '/images/raw-sculptures.jpg',
    icon: Award,
  },
  {
    id: 3,
    tabNum: '03',
    tabTitle: 'Plans 3D Gratuits',
    tag: '03 • LE SUR-MESURE',
    title: 'Meubles Sur-Mesure avec Plan 3D sous 24h',
    desc: 'Vous choisissez vos dimensions, vos formes et vos couleurs. Nous réalisons un plan 3D réaliste pour que vous puissiez voir votre futur meuble avant sa fabrication.',
    image: '/project-villa.png',
    icon: Compass,
  },
  {
    id: 4,
    tabNum: '04',
    tabTitle: 'Finitions d’Art',
    tag: '04 • LES FINITIONS',
    title: 'Cuivre, Céramique & Poignées d’Art',
    desc: 'Nous sublimons nos meubles avec de superbes finitions : poignées en céramique peintes à la main, ferronneries en cuivre martelé et touches dorées raffinées.',
    image: '/images/luminaire-cuivre-bois.jpg',
    icon: Gem,
  },
]

export function WhyAschi() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const stats = [
    { value: 65, suffix: ' Ans', label: "D'Héritage", sublabel: "Depuis 1960" },
    { value: 1500, suffix: '+', label: 'Espaces Aménagés', sublabel: "Demeures & villas" },
    { value: 100, suffix: '%', label: 'Bois Massif Garanti', sublabel: "Noyer séché à cœur" },
    { value: 24, suffix: 'h', label: 'Plans 3D Offerts', sublabel: "Rendu personnalisé" },
  ]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ENGAGEMENTS.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ENGAGEMENTS.length) % ENGAGEMENTS.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) {
      nextSlide()
    } else if (distance < -50) {
      prevSlide()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const currentItem = ENGAGEMENTS[currentIndex]

  return (
    <section id="pourquoi-aschi" className="relative overflow-hidden bg-transparent py-8 sm:py-14 lg:py-18 scroll-mt-20">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 relative z-10">
        
        {/* 1. EN-TÊTE ÉPURÉ AVEC TITRE DEMANDÉ */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1A110B]/80 border border-[#E6A635]/30 text-[#F2BD52] text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] mb-2 sm:mb-2.5">
              <Sparkles className="size-2.5 text-[#E6A635]" />
              <span>Excellence &amp; Savoir-Faire</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-light text-gold-gradient tracking-tight leading-tight">
              Pourquoi choisir Artisanat Aschi ?
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-1.5 sm:mt-2.5 text-white/80 text-[11.5px] sm:text-sm font-normal leading-relaxed max-w-xl mx-auto">
              L’alliance du vrai bois de noyer massif, de la sculpture manuelle à la gouge et d’un bureau d’étude 3D dédié à vos projets sur-mesure.
            </p>
          </Reveal>
        </div>

        {/* 2. CHIFFRES CLÉS : BANDEAU FIN & DISCRET */}
        <Reveal delay={120} className="mb-6 sm:mb-8 max-w-4xl mx-auto">
          <div className="border-y border-[#E6A635]/20 py-2 sm:py-4 bg-[#1A110B]/35 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6A635]/15">
              {stats.map((s, idx) => (
                <StatItem
                  key={idx}
                  value={s.value}
                  suffix={s.suffix}
                  label={s.label}
                  sublabel={s.sublabel}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* 3. LES CARTES : TABS + SLIDER CARTE PRESTIGE (LARGEUR RESSERRÉE) */}
        <div className="relative max-w-4xl mx-auto mb-8 sm:mb-10">
          
          {/* Onglets rapides masqués sur mobile, affichés sur desktop/tablette */}
          <div className="hidden sm:grid grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            {ENGAGEMENTS.map((item, idx) => {
              const Icon = item.icon
              const isActive = idx === currentIndex
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#3B271C] border-[#E6A635] text-[#F2BD52] shadow-[0_4px_20px_rgba(230,166,53,0.3)] scale-[1.02]'
                      : 'bg-[#241812]/90 border-[#E6A635]/25 text-white/75 hover:bg-[#3B271C]/80 hover:text-white'
                  }`}
                >
                  <div className={`size-6 sm:size-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-[#241812] border-[#E6A635]' : 'bg-[#1A110B] border-[#E6A635]/20'
                  }`}>
                    <Icon className="size-3 sm:size-3.5 text-[#F2BD52]" />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-[#F2BD52] block">
                      {item.tabNum}
                    </span>
                    <span className="text-[11px] sm:text-xs font-heading font-medium truncate block">
                      {item.tabTitle}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Diapositive Active (Grande Carte Visuelle) */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E6A635]/50 bg-[#241812] shadow-[0_20px_60px_rgba(0,0,0,0.85)] group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative h-[320px] sm:h-[400px] md:h-[450px] w-full flex flex-col justify-between p-4 sm:p-7 md:p-9"
              >
                {/* Image de fond avec transition */}
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover object-center transition-transform duration-[1.5s] group-hover:scale-105"
                />

                {/* Dégradé sombre pour lisibilité maximale */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/98 via-[#1A110B]/70 to-[#1A110B]/30 z-10 pointer-events-none" />

                {/* Badges du haut */}
                <div className="relative z-20 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-[#241812]/95 backdrop-blur-md border border-[#E6A635]/50 text-[#F2BD52] text-[9.5px] sm:text-xs font-bold uppercase tracking-[0.16em] shadow-lg">
                    {(() => {
                      const CurrentIcon = currentItem.icon
                      return <CurrentIcon className="size-3 text-[#F2BD52]" />
                    })()}
                    <span>{currentItem.tag}</span>
                  </div>

                  <div className="text-[10px] sm:text-xs uppercase tracking-widest text-[#F2BD52] font-semibold bg-[#241812]/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#E6A635]/30">
                    <span>0{currentIndex + 1}</span>
                    <span className="text-white/40 mx-1">/</span>
                    <span className="text-white/60">0{ENGAGEMENTS.length}</span>
                  </div>
                </div>

                {/* Contenu textuel en bas */}
                <div className="relative z-20 text-white max-w-2xl pr-8 sm:pr-0">
                  <div className="inline-flex items-center gap-1.5 text-[8.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.16em] text-[#F2BD52] mb-1 sm:mb-1.5">
                    <ShieldCheck className="size-3 sm:size-3.5 text-[#E6A635]" />
                    <span>GARANTIE QUALITÉ MAISON ASCHI</span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mb-1.5 sm:mb-2 group-hover:text-[#F2BD52] transition-colors">
                    {currentItem.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs md:text-sm text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {currentItem.desc}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Flèche gauche */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-8 sm:size-10 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Précédent"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>

            {/* Flèche droite */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-8 sm:size-10 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Suivant"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </div>

          {/* Dots de progression en bas */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {ENGAGEMENTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 sm:w-8 h-1 sm:h-1.5 bg-gradient-to-r from-[#F3C45E] to-[#E6A635]'
                    : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-[#E6A635]/30 hover:bg-[#E6A635]/70'
                }`}
                aria-label={`Voir l'engagement ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* 4. BANDEAU DE CONTACT DISCRET & FIN */}
        <Reveal delay={200} className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E6A635]/20 bg-[#1A110B]/40 backdrop-blur-sm text-center sm:text-left">
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#F2BD52] block">
                Vous avez un projet ou des dimensions spécifiques ?
              </span>
              <p className="text-[10px] sm:text-xs text-white/70 font-normal mt-0.5">
                Bureau d’étude 3D et devis personnalisé sous 24h.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center shrink-0">
              <Link
                href="/contact"
                className="btn-sheen inline-flex items-center justify-center gap-1 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10.5px] sm:text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-all text-center"
              >
                <Compass className="size-3 text-[#1A110B]" />
                <span>Étude 3D &amp; Devis</span>
              </Link>

              <a
                href="https://wa.me/21655743760"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-full border border-[#E6A635]/35 bg-[#1F140E] hover:bg-[#3B271C] hover:text-[#F2BD52] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm text-center"
              >
                <MessageCircle className="size-3 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
