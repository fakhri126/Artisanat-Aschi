'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { HeroSplit } from './hero-split'
import { HeroEvent } from './hero-event'
import { HeroRelooking } from './hero-relooking'
import { HeroDelivery } from './hero-delivery'
import { HeroBijoux } from './hero-bijoux'

const SLIDES = [
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
    title: 'Catalogue',
    subtitle: 'Luminaire et Artisanat Aschi',
    description: 'Explorez notre collection intemporelle de mobilier d\'art sculpté à la main.',
    image: '/prod1.jpg',
    cta: 'Voir le catalogue',
    href: '/catalogue',
  },
  {
    id: 'relooking',
    title: 'Rebooking & Relooking',
    subtitle: 'Nouveau Service',
    description: 'Offrez une seconde vie à vos meubles grâce à notre savoir-faire unique et notre approche sur-mesure.',
    image: '/relooking_service.jpg',
    cta: 'Découvrir le service',
    href: '/relooking',
  },
  {
    id: 'nouveautes',
    image: '/placeholder.jpg',
    subtitle: 'Créations Récentes',
    title: 'Nouveautés',
    description: 'Découvrez les dernières pièces sorties de notre atelier.',
    cta: 'Voir les nouveautés',
    href: '#nouveautes'
  },
  {
    id: 'evenement',
    image: '/placeholder.jpg',
    subtitle: 'Événement',
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
  const slide = SLIDES[current] || SLIDES[0]

  return (
    <section id="top" className="relative h-screen min-h-[40rem] w-full overflow-hidden grain">
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
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 scale-105"
              style={{ transform: `translateY(${offset * 0.3}px)` }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Much lighter overlays for a brighter, cleaner look */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content for standard slides */}
      {(slide.id !== 'nouveautes' && slide.id !== 'evenement' && slide.id !== 'relooking' && slide.id !== 'livraison' && slide.id !== 'bijoux-porte') && (
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
              <div className="flex justify-center mb-6">
                <span className="text-[#C17D59] text-xs font-bold tracking-[0.3em] uppercase bg-stone-900/40 px-4 py-2 border border-[#E8DCCB]/20">
                  {slide.subtitle}
                </span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl text-[#3A2A21] mb-6 text-shadow-lg leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl font-light text-white/90 mb-10 text-shadow max-w-2xl mx-auto leading-relaxed">
                {slide.description}
              </p>
              
              <div className="flex flex-col items-center gap-6">
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
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap bg-[#E8DCCB]/95 text-walnut text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(212,175,55,0.3)] border border-[#E8DCCB]/30 animate-pulse"
                      >
                        Tournez la poignée
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Glow ring behind knob */}
                  <div className="absolute w-28 h-28 rounded-full bg-[#d4af37]/15 blur-lg group-hover/knob:bg-[#d4af37]/25 transition-all duration-500" />
                  
                  {/* The Knob */}
                  <motion.div
                    animate={clickedKnob === SLIDES[current].href ? { rotate: [0, -35, 10, 0] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative w-24 h-24 rounded-full border-[3px] border-[#d4af37]/75 bg-stone-900 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_4px_8px_rgba(255,255,255,0.2)] overflow-hidden"
                    whileHover={{ rotate: 15, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src="/handle-knob.png"
                      alt="Poignée de porte"
                      fill
                      className="object-cover rounded-full"
                    />
                    {/* Highlight overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/15 pointer-events-none" />
                  </motion.div>
                  
                  {/* Text prompt to click */}
                  <span className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold bg-white/40 px-4 py-1.5 rounded-full border border-[#d4af37]/20 backdrop-blur-sm shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all group-hover/knob:bg-[#E8DCCB] group-hover/knob:text-walnut group-hover/knob:border-[#E8DCCB] duration-300 select-none">
                    {SLIDES[current].cta}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Slider Controls */}
      <div className="absolute top-1/2 left-4 sm:left-8 z-30 -translate-y-1/2">
        <button
          onClick={() => paginate(-1)}
          className="p-3 sm:p-4 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-[#E8DCCB] hover:text-walnut transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>
      </div>
      <div className="absolute top-1/2 right-4 sm:right-8 z-30 -translate-y-1/2">
        <button
          onClick={() => paginate(1)}
          className="p-3 sm:p-4 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-[#E8DCCB] hover:text-walnut transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > current ? 1 : -1)
              setCurrent(idx)
            }}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              idx === current ? 'w-10 bg-[#E8DCCB]' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-white/70">
        <ArrowDown className="size-6 animate-bounce" />
      </div>
    </section>
  )
}
