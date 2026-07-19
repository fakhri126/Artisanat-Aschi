'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isDoorOpened, setIsDoorOpened] = useState(false)
  const [isLatching, setIsLatching] = useState(false)

  // Disable scroll when the door is closed and force scroll to top
  useEffect(() => {
    if (!isDoorOpened) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDoorOpened])

  useEffect(() => {
    const onScroll = () => {
      if (isDoorOpened) {
        setOffset(window.scrollY)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isDoorOpened])

  // Auto-play (only runs when door is open)
  useEffect(() => {
    if (!isDoorOpened) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [current, isDoorOpened])

  const handleOpenDoor = () => {
    setIsLatching(true)
    setTimeout(() => {
      setIsDoorOpened(true)
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

            <div className="mt-10">
              <Link
                href={SLIDES[current].href}
                className="inline-block rounded-full bg-gold px-10 py-4 text-xs font-medium uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:bg-white hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                {SLIDES[current].cta}
              </Link>
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

      {/* Door Opening Entry Overlay */}
      <AnimatePresence>
        {!isDoorOpened && (
          <motion.div
            className="fixed inset-0 z-[60] flex overflow-hidden pointer-events-auto"
            exit={{ 
              pointerEvents: 'none',
              transition: { delay: 1 } 
            }}
          >
            {/* Left Door Panel */}
            <motion.div
              initial={{ x: 0 }}
              exit={{ 
                x: '-100%',
                transition: { duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 0.2 }
              }}
              className="absolute top-0 left-0 h-full w-1/2 bg-[#2d1b0f] border-r border-[#d4af37]/20 shadow-[inset_-10px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-end overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(to right, #1f120a, #2d1b0f, #1a0f09)',
              }}
            >
              {/* Elegant panel molding on Left Door */}
              <div className="absolute inset-y-12 left-12 right-6 border border-[#d4af37]/15 rounded-sm shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-end">
                <div className="text-right pr-8 select-none opacity-20">
                  <span className="font-heading text-5xl uppercase tracking-[0.25em] text-[#d4af37] block">Artisanat</span>
                </div>
              </div>
            </motion.div>

            {/* Right Door Panel */}
            <motion.div
              initial={{ x: 0 }}
              exit={{ 
                x: '100%',
                transition: { duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 0.2 }
              }}
              className="absolute top-0 right-0 h-full w-1/2 bg-[#2d1b0f] border-l border-[#d4af37]/20 shadow-[inset_10px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-start overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(to left, #1f120a, #2d1b0f, #1a0f09)',
              }}
            >
              {/* Elegant panel molding on Right Door */}
              <div className="absolute inset-y-12 right-12 left-6 border border-[#d4af37]/15 rounded-sm shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-start">
                <div className="text-left pl-8 select-none opacity-20">
                  <span className="font-heading text-5xl uppercase tracking-[0.25em] text-[#d4af37] block">Aschi</span>
                </div>
              </div>
            </motion.div>

            {/* Handle in the Center */}
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { delay: 0.4, duration: 0.8 }
                }}
                exit={{ 
                  scale: 0.8,
                  opacity: 0,
                  transition: { duration: 0.4 }
                }}
                className="pointer-events-auto cursor-pointer flex flex-col items-center"
                onClick={handleOpenDoor}
              >
                {/* Glow ring behind handle */}
                <div className="absolute w-36 h-36 rounded-full bg-[#d4af37]/15 blur-xl animate-pulse" />
                
                {/* The Knob */}
                <motion.div
                  animate={isLatching ? { rotate: [0, -35, 5, 0] } : {}}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative w-32 h-32 rounded-full border-[4px] border-[#d4af37]/75 bg-stone-900 shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_4px_10px_rgba(255,255,255,0.2)] overflow-hidden"
                  whileHover={{ rotate: 12, scale: 1.05 }}
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
                
                <span className="mt-6 text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold bg-black/50 px-4 py-1.5 rounded-full border border-[#d4af37]/20 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.4)] animate-pulse select-none">
                  Tourner la poignée pour entrer
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
