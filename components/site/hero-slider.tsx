'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight, Sparkles, FileText, ShieldCheck, TreePine, Ruler, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { HeroSplit } from './hero-split'
import { HeroEvent } from './hero-event'
import { HeroRelooking } from './hero-relooking'
import { HeroDelivery } from './hero-delivery'
import { HeroBijoux } from './hero-bijoux'
import { HeroCatalogue } from './hero-catalogue'
import { ZellijScatter } from './zellij-scatter'
import { BohoCarvedKnob } from './boho-decor'

const SLIDES = [
  {
    id: 'nouveautes',
    image: '/placeholder.jpg',
    subtitle: 'Créations Récentes',
    title: 'Nouvelle Création d\'Art',
    description: 'Découvrez les dernières pièces sorties de notre atelier.',
    cta: 'Voir les nouveautés',
    href: '#nouveautes'
  },
  {
    id: 'bijoux-porte',
    title: 'Les Bijoux de Porte',
    subtitle: 'Boutons & Céramiques d\'Art',
    description: 'Sublimez vos portes et mobilier avec nos poignées en céramique d\'art peintes à la main. Des détails d\'exception pour des demeures uniques.',
    image: '/bijoux-de-porte.jpg',
    cta: 'Découvrir la collection',
    href: '/bijoux-de-porte',
  },
  {
    id: 'catalogue',
    title: 'Catalogue Sur-Mesure',
    subtitle: 'Inspiration & Haute Ébénisterie',
    description: 'Explorez notre collection intemporelle de mobilier d\'art sculpté à la main.',
    image: '/herochaise.png',
    cta: 'Voir le catalogue',
    href: '/catalogue',
  },
  {
    id: 'relooking',
    title: 'Relooking & Restauration',
    subtitle: 'Restauration d\'Art',
    description: 'Offrez une seconde vie à vos meubles familiaux grâce à la magie de notre savoir-faire ancestral.',
    cta: 'Découvrir la Restauration',
    href: '/relooking',
  },
  {
    id: 'livraison',
    image: '/placeholder.jpg',
    subtitle: 'Livraison de la semaine',
    title: 'Réalisation Client',
    description: 'Découvrez notre dernière livraison chez nos clients',
    cta: 'Découvrir',
    href: '#livraison'
  },
  {
    id: 'evenement',
    image: '/placeholder.jpg',
    subtitle: 'Événement & Salons',
    title: 'Actualité',
    description: 'Dernier événement en date',
    cta: 'Voir l\'événement',
    href: '#news'
  }
]

export function HeroSlider() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [offset, setOffset] = useState(0)
  const [clickedKnob, setClickedKnob] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-play
  useEffect(() => {
    // Pause auto-play if hovered (so Modals or interactive slides stay visible)
    if (isHovered) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [current, isHovered])

  const handleKnobClick = (href: string) => {
    if (clickedKnob) return
    setClickedKnob(href)
    setShowGuide(false)
    setTimeout(() => {
      router.push(href)
      // Reset after a delay so it's ready if they navigate back
      setTimeout(() => setClickedKnob(null), 1000)
    }, 600)
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    if (newDirection === 1) {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    } else {
      setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
    }
  }

  const variants: any = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      z: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        z: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  const textVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } }
  }

  // Safe bounds check to prevent crash during hot reload
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        paginate(1) // swipe left -> next
      } else {
        paginate(-1) // swipe right -> prev
      }
    }
    setTouchStart(null)
  }

  const slide = SLIDES[current] || SLIDES[0]

  return (
    <section 
      id="collections" 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[720px] sm:min-h-[720px] lg:min-h-[640px] w-full overflow-hidden bg-transparent select-none py-8 sm:py-12 lg:py-16"
    >

      {/* Floating Golden Dust Particles (Ambient Craft Glow) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={`hero-dust-${i}`}
            className="absolute rounded-full bg-[#D4AF37]/40 blur-[1px]"
            style={{
              width: `${(i % 3) * 2 + 2}px`,
              height: `${(i % 3) * 2 + 2}px`,
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.5, 0.8],
              y: [0, -25, 0],
            }}
            transition={{
              duration: 4 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <ZellijScatter type="hero" />
      {/* Slideshow */}
      <AnimatePresence initial={false} custom={direction}>
        {slide.id === 'nouveautes' ? (
          <motion.div
            key="nouveautes-split"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroSplit />
          </motion.div>
        ) : slide.id === 'bijoux-porte' ? (
          <motion.div
            key="bijoux-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroBijoux />
          </motion.div>
        ) : slide.id === 'evenement' ? (
          <motion.div
            key="evenement-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroEvent />
          </motion.div>
        ) : slide.id === 'relooking' ? (
          <motion.div
            key="relooking-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroRelooking />
          </motion.div>
        ) : slide.id === 'livraison' ? (
          <motion.div
            key="livraison-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroDelivery />
          </motion.div>
        ) : slide.id === 'catalogue' ? (
          <motion.div
            key="catalogue-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 z-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HeroCatalogue />
          </motion.div>
        ) : (
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.8 }
            }}
            className="absolute inset-0 bg-[#2a1e16]"
          >
            <div
              className="absolute inset-0 scale-105"
              style={{ transform: `translateY(${offset * 0.3}px)` }}
            >
              <Image
                src={slide.image || '/placeholder.jpg'}
                alt={slide.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Warm bohemian overlay — léger voile crème sur le bas et le haut pour lisibilité */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#F7F3EC]/50 via-transparent to-[#3A2A1E]/55" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content for standard slides */}
      {(slide.id !== 'nouveautes' && slide.id !== 'evenement' && slide.id !== 'relooking' && slide.id !== 'livraison' && slide.id !== 'bijoux-porte' && slide.id !== 'catalogue') && (
        <div className="relative z-20 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={textVariants}
              className="max-w-3xl"
            >
              {/* Prestige Banner */}
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="flex items-center gap-2 text-[#D4AF37] text-[11px] font-medium tracking-[0.25em] uppercase bg-[#1A1512]/60 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 backdrop-blur-md">
                  <Sparkles className="size-3.5 text-[#D4AF37] animate-pulse" />
                  <span>Maison Fondée en 1960 • Sculpteurs du Patrimoine</span>
                </div>
                <span className="text-[#F7F3EC] text-xs font-bold tracking-[0.3em] uppercase bg-[#C17D59]/80 px-5 py-1.5 rounded-full border border-[#E8DCCB]/30 backdrop-blur-sm shadow-md">
                  {slide.subtitle}
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-7xl text-white mb-6 leading-tight" style={{textShadow: '0 2px 20px rgba(58,42,30,0.5)'}}>
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl font-light text-[#F7F3EC]/90 mb-8 max-w-2xl mx-auto leading-relaxed" style={{textShadow: '0 1px 10px rgba(58,42,30,0.4)'}}>
                {slide.description}
              </p>
              
              {/* Dual CTA: Knob interactive + Direct Devis Express Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
                {/* Knob Interactive Element */}
                <div 
                  onClick={() => handleKnobClick(slide.href)}
                  onMouseEnter={() => setShowGuide(false)}
                  className="relative group/knob cursor-pointer flex flex-col items-center"
                >
                  {/* Click Guide Tooltip */}
                  <AnimatePresence>
                    {showGuide && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap bg-[#F7F3EC]/95 text-[#3A2A1E] text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(193,125,89,0.4)] border border-[#C17D59]/30 animate-pulse"
                      >
                        Tournez la poignée
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Glow ring behind knob */}
                  <div className="absolute w-24 h-24 rounded-full bg-[#d4af37]/15 blur-lg group-hover/knob:bg-[#d4af37]/30 transition-all duration-500" />
                  
                  {/* The Knob */}
                  <motion.div
                    animate={clickedKnob === SLIDES[current].href ? { rotate: [0, -35, 10, 0] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-[3px] border-[#C17D59] bg-[#3A2A1E] shadow-[0_10px_20px_rgba(58,42,30,0.6),inset_0_4px_8px_rgba(255,255,255,0.15)] overflow-hidden"
                    whileHover={{ rotate: 15, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BohoCarvedKnob className="w-full h-full text-[#E8DCCB]" color="currentColor" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/15 pointer-events-none" />
                  </motion.div>
                  
                  <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#F7F3EC] font-semibold bg-[#C17D59]/80 px-4 py-1.5 rounded-full border border-[#C17D59]/40 backdrop-blur-sm shadow-[0_4px_10px_rgba(193,125,89,0.4)] transition-all group-hover/knob:bg-[#F7F3EC] group-hover/knob:text-[#3A2A1E] group-hover/knob:border-[#D9CEB8] duration-300 select-none">
                    {SLIDES[current].cta}
                  </span>
                </div>

                {/* Separator / Or */}
                <div className="hidden sm:flex flex-col items-center gap-1 opacity-50">
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37]">ou</span>
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
                </div>

                {/* Direct High-Conversion Button */}
                <Link
                  href="/custom-creation"
                  className="group flex items-center gap-3 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold text-xs uppercase tracking-[0.16em] px-7 py-4 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(230,166,53,0.35)] border border-[#E6A635]/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] btn-sheen"
                >
                  <FileText className="size-4 text-[#1A110B] group-hover:scale-110 transition-transform" />
                  <span>Devis Sur-Mesure Express</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Slider Controls Bar (Bottom) */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 z-40 flex flex-col items-center -translate-x-1/2 w-full max-w-md px-4">
        
        {/* Controls Bar */}
        <div className="flex items-center gap-5 sm:gap-6 bg-[#3B271C]/90 backdrop-blur-xl px-5 sm:px-7 py-2 sm:py-2.5 rounded-full border border-[#E6A635]/40 shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
          <button
            onClick={() => paginate(-1)}
            className="p-1 rounded-full bg-[#F7F4EE]/10 text-white hover:bg-[#E6A635] hover:text-[#1A110B] hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft className="size-3.5 sm:size-4" />
          </button>

          <div className="flex gap-2 items-center">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > current ? 1 : -1)
                  setCurrent(idx)
                }}
                className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                  idx === current ? 'w-7 sm:w-9 bg-[#E6A635] shadow-[0_0_8px_#E6A635]' : 'w-2 bg-white/40 hover:bg-white/80 hover:w-3.5'
                }`}
                aria-label={`Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => paginate(1)}
            className="p-1 rounded-full bg-[#F7F4EE]/10 text-white hover:bg-[#E6A635] hover:text-[#1A110B] hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Diapositive suivante"
          >
            <ChevronRight className="size-3.5 sm:size-4" />
          </button>
        </div>

      </div>
    </section>
  )
}
