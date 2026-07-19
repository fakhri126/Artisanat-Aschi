'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const SLIDES = [
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
    id: 'evenements',
    title: 'Événements',
    subtitle: 'Prestations Événementielles',
    description: 'Créez une atmosphère inoubliable pour vos réceptions avec notre mobilier et décoration artisanale de luxe.',
    image: '/event_service.jpg',
    cta: 'En savoir plus',
    href: '/contact',
  },
  {
    id: 'nouveautes',
    title: 'Nouveaux Produits',
    subtitle: 'Dernières Créations',
    description: 'Découvrez les toutes dernières pièces conçues dans notre atelier, alliant tradition et modernité.',
    image: '/new1.jpg',
    cta: 'Voir les nouveautés',
    href: '/creations',
  }
]

export function HeroSlider() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [offset, setOffset] = useState(0)
  const [clickedKnob, setClickedKnob] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [current])

  const handleKnobClick = (href: string) => {
    if (clickedKnob) return
    setClickedKnob(href)
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

  const variants = {
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

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } }
  }

  return (
    <section id="top" className="relative h-screen min-h-[40rem] w-full overflow-hidden grain">
      {/* Slideshow */}
      <AnimatePresence initial={false} custom={direction}>
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
              src={SLIDES[current].image}
              alt={SLIDES[current].title}
              fill
              priority
              className="object-cover"
            />
          </div>
          
          {/* Much lighter overlays for a brighter, cleaner look */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            variants={textVariants}
            className="flex flex-col items-center"
          >
            <p className="mb-4 text-xs uppercase tracking-luxury text-gold sm:text-sm drop-shadow-md">
              {SLIDES[current].subtitle}
            </p>
            <h1 className="font-heading text-5xl font-medium leading-[1] text-white text-shadow-cinematic sm:text-6xl md:text-7xl lg:text-[7rem]">
              {SLIDES[current].title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/95 drop-shadow-md sm:text-xl">
              {SLIDES[current].description}
            </p>

            <div className="mt-10 flex flex-col items-center">
              <div 
                onClick={() => handleKnobClick(SLIDES[current].href)}
                className="relative group/knob cursor-pointer flex flex-col items-center"
              >
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
                <span className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold bg-black/40 px-4 py-1.5 rounded-full border border-[#d4af37]/20 backdrop-blur-sm shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all group-hover/knob:bg-gold group-hover/knob:text-walnut group-hover/knob:border-gold duration-300 select-none">
                  {SLIDES[current].cta}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="absolute top-1/2 left-4 sm:left-8 z-30 -translate-y-1/2">
        <button
          onClick={() => paginate(-1)}
          className="p-3 sm:p-4 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-gold hover:text-walnut transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>
      </div>
      <div className="absolute top-1/2 right-4 sm:right-8 z-30 -translate-y-1/2">
        <button
          onClick={() => paginate(1)}
          className="p-3 sm:p-4 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-gold hover:text-walnut transition-colors"
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
              idx === current ? 'w-10 bg-gold' : 'w-2 bg-white/50 hover:bg-white/80'
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
