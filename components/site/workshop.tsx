'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './reveal'
import { Volume2, VolumeX, Sparkles, TreePine, Hammer, Paintbrush, Award, Play } from 'lucide-react'

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'La Sélection du Bois',
    icon: TreePine,
    startTime: 0,
    endTime: 5,
    subtitle: 'Étape 1 • Sélection Noble',
    script: "Tout commence par le choix du noyer massif. L'artisan étudie le grain, devine la veine et écoute la matière. Seules les pièces d'exception sont retenues pour la création.",
  },
  {
    num: '02',
    title: 'La Sculpture à la Main',
    icon: Hammer,
    startTime: 5,
    endTime: 10,
    subtitle: 'Étape 2 • Le Ciseau & La Gravure',
    script: "Le ciseau danse sur le bois. Arabesques, motifs floraux et géométries traditionnelles : chaque entaille est sculptée à la main avec une précision transmise depuis 1960.",
  },
  {
    num: '03',
    title: 'La Peinture & La Dorure',
    icon: Paintbrush,
    startTime: 10,
    endTime: 15,
    subtitle: 'Étape 3 • L\'Art de la Feuille d\'Or',
    script: "La feuille d'or 24 carats et les pigments minéraux chauds révèlent les volumes sculptés. Un travail de patience qui apporte la lumière et la noblesse d'antan.",
  },
  {
    num: '04',
    title: 'Finition & Polissage Satiné',
    icon: Award,
    startTime: 15,
    endTime: 20,
    subtitle: 'Étape 4 • La Révélation Ultime',
    script: "Huilé, poli et caressé : le bois noble prend vie. La pièce d'artisanat achevée conserve la chaleur de la main qui l'a façonnée pour des générations.",
  },
]

export function Workshop() {
  const [isMuted, setIsMuted] = useState(true)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration || 20

    // Divide actual video duration into 4 equal dynamic segments
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
    <section id="atelier" className="relative bg-transparent py-24 md:py-36 overflow-hidden">
      {/* Unified Background */}
      <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* Header */}
        <Reveal className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1512]/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.25em] shadow-md mb-6">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Film Immersion Savoir-Faire</span>
          </div>
          <h2 className="text-balance font-heading text-4xl font-light leading-tight text-[#E8DCCB] sm:text-5xl md:text-6xl">
            Le geste, transmis et répété, devient un art
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base font-light leading-relaxed text-[#D4B896]">
            Suivez en direct les 4 grandes séquences de création de notre atelier. Chaque étape est expliquée au rythme du geste de nos artisans.
          </p>
        </Reveal>

        {/* Single Full-Width Video Frame with Synchronized Script Overlay */}
        <Reveal delay={120} className="relative w-full max-w-6xl mx-auto">
          <div className="relative aspect-[16/9] min-h-[420px] md:min-h-[550px] rounded-[2.5rem] overflow-hidden border-[6px] border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#1A1512]">
            
            {/* Background Video */}
            <video
              ref={videoRef}
              src="/Video-art.mp4"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 size-full object-cover opacity-90 transition-opacity duration-1000"
            />

            {/* Gradient Overlays for readable text without background box */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Sound Toggle Button (Top Right) */}
            <button
              onClick={toggleSound}
              className="absolute top-6 right-6 z-30 group flex items-center gap-2.5 bg-[#1A1512]/80 hover:bg-[#C17D59] text-white backdrop-blur-md px-4 py-2.5 rounded-full border border-[#D4AF37]/40 shadow-xl transition-all duration-300 transform hover:scale-105"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="size-4 text-[#D4AF37] group-hover:text-white" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8DCCB] group-hover:text-white hidden sm:inline">Activer le son de l&apos;atelier</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-4 text-emerald-400 group-hover:text-white animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 group-hover:text-white hidden sm:inline">Son de l&apos;atelier actif</span>
                </>
              )}
            </button>

            {/* Synchronized Script Overlay — Completely Transparent without Background Box */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:left-12 md:bottom-12 z-20 max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.num}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-2 pointer-events-none"
                >
                  <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-[#D4AF37] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {activeStep.subtitle}
                  </p>

                  <h3 className="font-heading text-3xl md:text-4xl text-white font-light tracking-wide leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]">
                    {activeStep.title}
                  </h3>

                  <p className="text-sm md:text-base font-extralight text-[#F7F3EC]/95 leading-relaxed tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-lg">
                    {activeStep.script}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </Reveal>

        {/* 4 Interactive Chapter Timeline Cards below the Video */}
        <Reveal delay={200} className="mt-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS_STEPS.map((step, idx) => {
              const IconComp = step.icon
              const isActive = idx === activeStepIndex

              return (
                <button
                  key={step.num}
                  onClick={() => jumpToStep(idx)}
                  className={`group relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1512] border-[#D4AF37] shadow-[0_10px_25px_rgba(212,175,55,0.25)] scale-[1.02]'
                      : 'bg-[#1A1512]/60 border-[#E8DCCB]/15 hover:border-[#D4AF37]/50 hover:bg-[#1A1512]/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#C17D59] text-white' : 'bg-[#C17D59]/20 text-[#D4AF37]'
                    }`}>
                      <IconComp className="size-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isActive && <Play className="size-3 text-[#D4AF37] animate-pulse" />}
                      <span className={`font-mono text-xs font-bold ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/60'}`}>
                        {step.num}
                      </span>
                    </div>
                  </div>

                  <h3 className={`font-heading text-base font-medium mb-1.5 transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-[#E8DCCB]'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className="text-[11px] text-[#D4B896]/70 leading-relaxed font-light line-clamp-2">
                    {step.desc}
                  </p>

                  {/* Active progress indicator line */}
                  <div className={`mt-3 h-1 w-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-[#D4AF37]' : 'bg-white/10 group-hover:bg-white/20'
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


