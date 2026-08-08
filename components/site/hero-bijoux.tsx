'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Heart } from 'lucide-react'
import { BohoBand, BohoFloralRosette, BohoCarvedKnob, BohoDeepCarvedDiamond, BohoGoldenSun } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

const KNOBS = [
  { src: '/poignees/hq_knob_1.jpg', delay: 0 },
  { src: '/poignees/hq_knob_2.jpg', delay: 0.2, bg: '/poignees/user_wood_motif.png' },
  { src: '/poignees/hq_knob_3.jpg', delay: 0.4, bg: '/poignees/user_wood_motif.png' },
  { src: '/poignees/hq_knob_4.png', delay: 0.6, bg: '/poignees/user_wood_motif.png' },
]

export function HeroBijoux() {
  const router = useRouter()
  const { color: titleColor, isMounted } = useRandomHeroColor()

  const handleNavigate = () => {
    // Wait for the rotation animation to play before navigating
    setTimeout(() => {
      router.push('/bijoux-de-porte')
    }, 500)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center font-sans pb-10 pt-20">
      {/* Repeating small ceramic background pattern */}

      
      {/* Warm Bohemian Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#EDE6D6] via-[#F7F3EC] to-[#F0EBE0]" />
      
      {/* Decorative Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute rounded-full bg-[#C17D59]/20 blur-[1px]"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-center pt-24 pb-16 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* 3-Column Layout: Text (Left) - Handles (Middle) - Image (Right) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-4 xl:gap-8 items-center justify-items-center">
          
          {/* 1. Left Column: Text Content */}
          <div className="w-full lg:col-span-3 xl:col-span-3 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="w-full"
            >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8DCCB]/60 border border-[#DDA72D]/30 text-[#6B4E31] text-xs font-bold tracking-[0.2em] mb-6 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-[#DDA72D]" />
            POIGNÉES D'ART
          </div>
          
          <h2 
            className="font-heading text-4xl md:text-5xl xl:text-6xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-4 lg:mb-6 leading-none transition-colors duration-1000"
            style={{ color: isMounted ? titleColor : '#87CEEB' }}
          >
            Bijoux de Porte <br/>
            <span className="text-[#D4AF37] text-3xl md:text-4xl xl:text-5xl italic drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
              100% Artisanaux
            </span>
          </h2>
          
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 md:mb-6">
            <div className="h-px w-8 lg:w-16 bg-gradient-to-r from-transparent to-[#C17D59]/50" />
            <div className="size-1.5 rounded-full bg-[#C17D59]/50 rotate-45" />
            <div className="h-px w-8 lg:w-16 bg-gradient-to-l from-transparent to-[#C17D59]/50" />
          </div>

          <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed tracking-wide max-w-lg">
            Sublimez vos meubles et portes avec nos poignées en céramique d'art. 
            Des détails peints à la main pour apporter une élégance absolue à votre intérieur.
          </p>

          <button
            onClick={handleNavigate}
            className="group relative inline-flex items-center gap-4 bg-[#3A2A1E] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 border border-[#3A2A1E]/50 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Découvrir la collection
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
          </button>
          </motion.div>
        </div>

        {/* 2. Middle Column: Interactive Handles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full lg:col-span-4 xl:col-span-4 relative flex items-center justify-center min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] order-2 z-10"
        >
          {/* Main Giant Knob (Center) */}
          <button
            onClick={handleNavigate}
            className="group relative z-20 flex items-center justify-center focus:outline-none mt-16 sm:mt-0"
          >
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative size-36 sm:size-44 md:size-56 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
            >
              <motion.div 
                whileTap={{ rotate: 120, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 150, damping: 10, mass: 1 }}
                className="relative size-full flex items-center justify-center"
              >
                {/* Motif Frame (AI Wood) for the central knob */}
                <div className="absolute inset-0 z-0 rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                  <Image src="/poignees/user_wood_motif.png" alt="Motif bois sculpté" fill className="object-cover pointer-events-none" style={{ transform: 'scale(1.15)' }} />
                </div>
                
                {/* Ceramic Knob inside */}
                <div className="relative size-20 sm:size-28 md:size-36 rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.5),inset_0_4px_10px_rgba(255,255,255,0.3)] z-10">
                  <Image 
                    src="/poignees/hq_knob_1.jpg" 
                    alt="Découvrir les poignées" 
                    fill 
                    className="object-cover pointer-events-none" 
                    style={{ transform: 'scale(1.35)' }}
                  />
                  {/* 3D Ceramic Glaze Highlight */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/40 pointer-events-none" />
                  <div className="absolute top-1 left-[15%] right-[15%] h-1/4 rounded-t-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none opacity-90" />
                </div>
              </motion.div>
            </motion.div>
            <div className="absolute -bottom-8 bg-[#F7F3EC] border border-[#D9CEB8] px-3 py-1 rounded-full text-[#C17D59] text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Tournez-moi
            </div>
          </button>

          {/* Floating Orbiting Knobs */}
          {KNOBS.slice(1).map((knob, idx) => {
            // Calculate orbital positions
            const angle = (idx * Math.PI) - (Math.PI / 4);
            const orbitRadius = 140; // Responsive enough for both mobile and desktop
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: [0, Math.cos(angle) * orbitRadius], 
                  y: [0, Math.sin(angle) * orbitRadius] 
                }}
                transition={{ duration: 1.5, delay: 1 + knob.delay, type: "spring", bounce: 0.3 }}
                className="absolute z-10 flex items-center justify-center cursor-pointer group"
                onClick={handleNavigate}
              >
                <div className="relative size-16 md:size-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-125">
                    <motion.div
                      animate={{ rotate: [-6, 6, -6], y: [0, -10, 0] }}
                      transition={{ duration: 3.5 + (idx * 0.5), repeat: Infinity, ease: "easeInOut", delay: knob.delay }}
                      className="relative size-full flex items-center justify-center"
                    >
                      {/* Motif Frame (AI Wood) */}
                      <div className="absolute inset-0 z-0 rounded-full overflow-hidden shadow-md">
                        {knob.bg && <Image src={knob.bg} alt="Motif bois sculpté" fill className="object-cover pointer-events-none" style={{ transform: 'scale(1.15)' }} />}
                      </div>
                      
                      {/* Ceramic Knob inside */}
                      <div className="relative size-10 md:size-16 rounded-full overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10">
                        <Image src={knob.src} alt="Poignée artisanale" fill className="object-cover pointer-events-none" style={{ transform: 'scale(1.35)' }} />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/50 pointer-events-none" />
                      </div>
                    </motion.div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

          {/* 3. Right Column: Big Image */}
          <div className="w-full lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end z-20 order-3 lg:-ml-12 xl:-ml-16 mt-10 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[450px] sm:max-w-[650px] lg:max-w-[1000px] xl:max-w-[1200px] rounded-2xl overflow-hidden border-[6px] lg:border-[10px] border-[#DDA72D] shadow-2xl bg-white"
            >
              <Image 
                src="/images/poignees_display.jpg" 
                alt="Exposition de poignées artisanales" 
                width={1400}
                height={1120}
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700" 
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Small floating zigzag motifs (Brown) */}
      <BohoBand className="absolute top-10 left-10 md:left-20 w-48 opacity-20" color="#8B5E3C" />
      <BohoBand className="absolute bottom-10 right-10 md:right-20 w-48 opacity-20" color="#8B5E3C" />
    </div>
  )
}
