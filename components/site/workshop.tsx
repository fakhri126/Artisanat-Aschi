'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Reveal } from './reveal'
import { Volume2, VolumeX, Sparkles, Trees, Hammer, Paintbrush, Award, Play } from 'lucide-react'

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Sélection du Noyer Massif',
    icon: Trees,
    subtitle: 'Étape 1 • Choix Noble',
    script: "Tout commence par le choix du noyer massif centenaire. L'artisan étudie le fil du bois, devine la veine et sélectionne uniquement les pièces les plus nobles pour la création.",
  },
  {
    num: '02',
    title: 'Sculpture au Ciseau & Gouge',
    icon: Hammer,
    subtitle: 'Étape 2 • Haute Sculpture',
    script: "Le ciseau cisèle la matière avec précision. Arabesques, entrelacs et motifs géométriques : chaque ornement est sculpté à la main selon la tradition familiale.",
  },
  {
    num: '03',
    title: 'Céramiques & Laiton Ciselé',
    icon: Paintbrush,
    subtitle: 'Étape 3 • Orfèvrerie & Émaux',
    script: "Incrustation d'émaux de majolique peints à la main et pose de ferrures en laiton forgé pour apporter la lumière et le cachet d'antan.",
  },
  {
    num: '04',
    title: 'Finition & Patine d\'Apparat',
    icon: Award,
    subtitle: 'Étape 4 • Révélation Finale',
    script: "Huilé, ciré et poli au chiffon de laine : le bois noble révèle ses nuances dorées pour traverser les générations avec distinction.",
  },
]

export function Workshop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { margin: '150px 0px', once: false })

  const [isMuted, setIsMuted] = useState(true)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  useEffect(() => {
    if (!videoRef.current) return

    if (isInView) {
      setHasLoaded(true)
      videoRef.current.play().catch(() => {})
    } else if (hasLoaded) {
      videoRef.current.pause()
    }
  }, [isInView, hasLoaded])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration || 20

    const segmentDuration = duration / 4
    if (currentTime < segmentDuration) setActiveStepIndex(0)
    else if (currentTime < segmentDuration * 2) setActiveStepIndex(1)
    else if (currentTime < segmentDuration * 3) setActiveStepIndex(2)
    else setActiveStepIndex(3)
  }

  const jumpToStep = (index: number) => {
    setActiveStepIndex(index)
    if (videoRef.current) {
      const duration = videoRef.current.duration || 20
      const segmentDuration = duration / 4
      videoRef.current.currentTime = segmentDuration * index
      videoRef.current.play()
    }
  }

  const activeStep = PROCESS_STEPS[activeStepIndex]

  return (
    <section id="savoir-faire" ref={containerRef} className="relative bg-transparent py-10 sm:py-16 lg:py-24 overflow-hidden scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-12">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Démonstration d&apos;Atelier en Vidéo</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2">
              Le Geste Artisanal en 4 Séquences
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-white drop-shadow font-normal max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-1">
              Suivez les 4 grandes étapes de fabrication au rythme des mains expertes de nos maîtres ébénistes.
            </p>
          </Reveal>
        </div>

        {/* Video Frame with Glass & Gold Border */}
        <Reveal delay={120} className="relative w-full max-w-5xl mx-auto">
          <div className="relative w-full aspect-video min-h-[220px] sm:min-h-[380px] md:min-h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-[#E6A635]/45 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#1A110B]">
            
            {/* Video Element */}
            <video
              ref={videoRef}
              src={hasLoaded ? "/Video-art.mp4" : undefined}
              poster="/images/raw-sculptures.jpg"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="none"
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 size-full object-cover opacity-90"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-transparent to-black/30 pointer-events-none" />

            {/* Sound Toggle Button (Top Right) */}
            <button
              onClick={toggleSound}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 flex items-center gap-1.5 sm:gap-2 bg-[#241812]/90 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E6A635]/40 shadow-xl transition-all duration-300 cursor-pointer"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="size-3.5" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Activer le son</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-400 hidden sm:inline">Son actif</span>
                </>
              )}
            </button>

            {/* Synchronized Caption (Inside video on Desktop, clean overlay) */}
            <div className="absolute bottom-3 left-3 right-3 sm:left-8 sm:bottom-8 z-20 max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.num}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-1 pointer-events-none"
                >
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#F2BD52]">
                    {activeStep.subtitle}
                  </span>

                  <h3 className="font-heading text-base sm:text-2xl md:text-3xl text-white font-normal leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {activeStep.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-normal text-white/95 leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                    {activeStep.script}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </Reveal>

        {/* 4 Interactive Step Buttons */}
        <Reveal delay={160} className="mt-4 sm:mt-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {PROCESS_STEPS.map((step, idx) => {
              const IconComp = step.icon
              const isActive = idx === activeStepIndex

              return (
                <button
                  key={step.num}
                  onClick={() => jumpToStep(idx)}
                  className={`group relative flex flex-col text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#3B271C] border-[#E6A635] shadow-[0_10px_25px_rgba(230,166,53,0.25)] scale-[1.02]'
                      : 'bg-[#3B271C]/60 border-[#E6A635]/20 hover:border-[#E6A635]/50 hover:bg-[#3B271C]/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className={`size-7 sm:size-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#E6A635] text-[#1A110B]' : 'bg-[#241812] text-[#F2BD52] border border-[#E6A635]/30'
                    }`}>
                      <IconComp className="size-3.5 sm:size-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      {isActive && <Play className="size-2.5 text-[#E6A635] fill-current animate-pulse" />}
                      <span className={`font-mono text-[10.5px] font-bold ${isActive ? 'text-[#F2BD52]' : 'text-white/60'}`}>
                        {step.num}
                      </span>
                    </div>
                  </div>

                  <h4 className={`font-heading text-xs sm:text-sm font-semibold mb-1 leading-snug truncate ${
                    isActive ? 'text-[#F2BD52]' : 'text-white'
                  }`}>
                    {step.title}
                  </h4>
                  
                  {/* Progress Line */}
                  <div className={`mt-2 h-1 w-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-[#E6A635]' : 'bg-white/10'
                  }`} />
                </button>
              )
            })}
          </div>
        </Reveal>

      </div>
    </section>
  )
}
