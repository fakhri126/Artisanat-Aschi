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
  Clock, 
  MessageCircle, 
  FileText, 
  ArrowRight,
  Gem,
  Trees,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface StatProps {
  value: number
  suffix: string
  label: string
  sublabel: string
}

function StatNumber({ value, suffix, label, sublabel }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

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
    <div ref={ref} className="text-center p-2 sm:p-3">
      <div className="font-sans font-extralight text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gold-gradient tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        {formattedCount}
        <span className="text-[#F2BD52] font-sans font-light ml-0.5 text-base sm:text-xl md:text-2xl">{suffix}</span>
      </div>
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#F2BD52] font-bold mt-0.5 sm:mt-1">
        {label}
      </div>
      <div className="text-[9px] sm:text-[10.5px] text-white/80 drop-shadow font-normal mt-0.5 hidden sm:block">
        {sublabel}
      </div>
    </div>
  )
}

export function WhyAschi() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const statsList = [
    { value: 65, suffix: ' Ans', label: "D'Héritage Artisanal", sublabel: "Atelier familial fondé en 1960" },
    { value: 1200, suffix: '+', label: 'Demeures Sublimées', sublabel: "Villas & résidences privées" },
    { value: 500, suffix: '+', label: 'Projets Monumentaux', sublabel: "Palaces, riads & hôtels 5★" },
    { value: 100, suffix: '%', label: 'Bois Noble Garanti', sublabel: "Noyer massif séché à cœur" }
  ]

  const engagements = [
    {
      id: 1,
      tag: "01 • Matériau d'Exception",
      tabTitle: "100% Noyer Massif",
      title: "100% Noyer Noble Séché à Cœur",
      desc: "Chaque bille de noyer est rigoureusement sélectionnée et séchée naturellement au grand air. Une essence noble garantissant une patine intemporelle, une stabilité parfaite et une longévité sur plusieurs générations.",
      image: "/images/raw-sculptures.jpg",
      icon: <Trees className="size-4 text-[#F2BD52]" />
    },
    {
      id: 2,
      tag: "02 • Savoir-Faire & Héritage",
      tabTitle: "Maîtrise depuis 1960",
      title: "Trois Générations de Maîtres Sculpteurs",
      desc: "Héritière de plus de six décennies de gestes nobles, la Maison Aschi façonne chaque ornement à la main. Ciselage au ciseau et à la gouge pour donner relief, âme et vie au bois massif.",
      image: "/news-exposition.jpg",
      icon: <Award className="size-4 text-[#F2BD52]" />
    },
    {
      id: 3,
      tag: "03 • Ingénierie & Sur-Mesure",
      tabTitle: "Plans 3D & Conception",
      title: "Étude Sur-Mesure & Modélisation 3D sous 24h",
      desc: "De la prise de cotes à l'intégration architecturale, chaque création fait l'objet d'une modélisation 3D photoréaliste. Vous visualisez et validez les proportions et volumes de votre mobilier avant toute mise en fabrication.",
      image: "/project-villa.png",
      icon: <Compass className="size-4 text-[#F2BD52]" />
    },
    {
      id: 4,
      tag: "04 • Orfèvrerie & Métaux",
      tabTitle: "Finitions d'Art",
      title: "Laiton Ciselé, Cuivre Forgé & Céramiques",
      desc: "Sublimation de l'ébénisterie par les arts du feu : poignées en majolique peintes à la main, quincaillerie en laiton massif martelé, ferrures d'art et dorure délicate à la feuille d'or fin.",
      image: "/images/luminaire-cuivre-bois.jpg",
      icon: <Gem className="size-4 text-[#F2BD52]" />
    }
  ]

  // Autoplay (every 5 seconds)
  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % engagements.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay, engagements.length])

  const nextSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev + 1) % engagements.length)
  }

  const prevSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev - 1 + engagements.length) % engagements.length)
  }

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const currentItem = engagements[currentIndex]

  return (
    <section id="pourquoi-aschi" className="relative overflow-hidden bg-transparent py-10 sm:py-16 lg:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE AVEC FOND DE LISIBILITÉ                             */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B271C]/95 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Pourquoi Artisanat Aschi ?</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light leading-tight text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight">
              L&apos;Excellence du Patrimoine <br className="hidden sm:inline" />
              <span className="font-serif italic text-white font-normal text-xl sm:text-3xl md:text-4xl block sm:inline mt-0.5 sm:mt-0">
                &amp; de la Haute Ébénisterie
              </span>
            </h2>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATISTIQUES STATUTAIRES EN HAUT (Compteurs Animés Propres)             */}
        {/* ========================================================================= */}
        <Reveal delay={100} className="mb-6 sm:mb-8">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/40 bg-[#3B271C]/95 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6A635]/20">
              {statsList.map((stat, i) => (
                <StatNumber
                  key={i}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  sublabel={stat.sublabel}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* ========================================================================= */}
        {/* 3. CARROUSEL IMMERSIF : Grande Image & Texte Intégré                      */}
        {/* ========================================================================= */}
        <div className="relative mb-6 sm:mb-8">
          
          {/* Onglets sélecteurs rapides sur Desktop/Tablette */}
          <div className="hidden sm:grid grid-cols-4 gap-2.5 mb-4">
            {engagements.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setAutoplay(false)
                  setCurrentIndex(idx)
                }}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[#3B271C] border-[#E6A635] text-[#F2BD52] shadow-lg scale-[1.02]'
                    : 'bg-[#241812]/90 border-[#E6A635]/25 text-white/75 hover:bg-[#3B271C]/80 hover:text-white'
                }`}
              >
                <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  idx === currentIndex ? 'bg-[#241812] border-[#E6A635]' : 'bg-[#1A110B] border-[#E6A635]/20'
                }`}>
                  {item.icon}
                </div>
                <div className="truncate">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#F2BD52] block">
                    0{item.id}
                  </span>
                  <span className="text-xs font-heading font-medium truncate block">
                    {item.tabTitle}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Diapositive Active (Grande Image avec Texte Intégré) */}
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
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative h-[380px] sm:h-[430px] md:h-[480px] w-full flex flex-col justify-between p-4 sm:p-7 md:p-9"
              >
                {/* Background Image */}
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/98 via-[#1A110B]/70 to-[#1A110B]/30 z-10 pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="relative z-20 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812]/95 backdrop-blur-md border border-[#E6A635]/50 text-[#F2BD52] text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] shadow-lg">
                    {currentItem.icon}
                    <span>{currentItem.tag}</span>
                  </div>

                  <div className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold bg-[#241812]/90 px-3 py-1 rounded-full border border-[#E6A635]/30">
                    <span>0{currentIndex + 1}</span>
                    <span className="text-white/40 mx-1">/</span>
                    <span className="text-white/60">0{engagements.length}</span>
                  </div>
                </div>

                {/* Bottom Integrated Content */}
                <div className="relative z-20 text-white max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.16em] text-[#F2BD52] mb-1.5">
                    <ShieldCheck className="size-3.5 text-[#E6A635]" />
                    <span>Signature d&apos;Excellence Maison Aschi</span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-3xl md:text-4xl font-light text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mb-2 group-hover:text-[#F2BD52] transition-colors">
                    {currentItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal leading-relaxed">
                    {currentItem.desc}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Flèches de navigation sur l'image */}
            <button
              onClick={prevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Précédent"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Suivant"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Dots / Puces de progression en bas */}
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            {engagements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAutoplay(false)
                  setCurrentIndex(idx)
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 sm:w-8 h-1.5 bg-gradient-to-r from-[#F3C45E] to-[#E6A635]'
                    : 'w-1.5 h-1.5 bg-[#E6A635]/30 hover:bg-[#E6A635]/70'
                }`}
                aria-label={`Voir l'engagement ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. CONSOLE DE CONVERSION (Devis 3D & WhatsApp)                            */}
        {/* ========================================================================= */}
        <Reveal delay={140}>
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/45 bg-[#3B271C]/95 backdrop-blur-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="max-w-xl">
                <h3 className="font-heading text-lg sm:text-2xl font-light text-gold-gradient leading-tight mb-1">
                  Un Projet de Mobilier d&apos;Exception en Tête ?
                </h3>
                <p className="text-white/90 text-xs sm:text-sm font-normal">
                  Étude personnalisée, modélisation 3D réaliste et devis gratuit sous 24h.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
                <Link
                  href="/custom-creation"
                  className="btn-sheen inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.14em] shadow-lg transition-all hover:scale-105 w-full sm:w-auto text-center"
                >
                  <FileText className="size-3.5 text-[#1A110B]" />
                  <span>Demander un Devis 3D</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/45 bg-[#241812]/95 hover:bg-[#4E3425] hover:text-[#F2BD52] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all shadow-md w-full sm:w-auto text-center"
                >
                  <MessageCircle className="size-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
