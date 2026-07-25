'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Heart } from 'lucide-react'

const KNOBS = [
  { src: '/poignees/new_knob_15.jpg', delay: 0 },
  { src: '/poignees/new_knob_7.jpg', delay: 0.2 },
  { src: '/poignees/new_knob_12.jpg', delay: 0.4 },
  { src: '/poignees/new_knob_22.jpg', delay: 0.6 },
]

export function HeroBijoux() {
  const router = useRouter()

  const handleNavigate = () => {
    // Wait for the rotation animation to play before navigating
    setTimeout(() => {
      router.push('/bijoux-de-porte')
    }, 500)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a1512] flex items-center justify-center font-sans pb-10 pt-20">
      {/* Warm Ambience Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-walnut/50 via-[#2a2420] to-[#1a1512]" />
      
      {/* Decorative Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute rounded-full bg-[#E8DCCB]/40 blur-[1px]"
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16">
        
        {/* Left: Premium Plaque Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex-1 w-full max-w-2xl text-center lg:text-left bg-gradient-to-b lg:bg-gradient-to-r from-[#2a2420]/90 to-[#15110e]/90 p-8 md:p-12 rounded-[2rem] border border-[#D4AF37]/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_15px_rgba(212,175,55,0.15)] relative"
        >
          {/* Decorative Accent */}
          <div className="absolute -top-[1px] left-1/2 lg:left-12 -translate-x-1/2 lg:translate-x-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-inner">
            <Sparkles className="size-3" />
            Collection Exclusive
          </div>
          
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6 drop-shadow-2xl leading-[1.1]">
            Bijoux de Porte <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#fce69a] to-[#aa7c11] italic font-serif font-light tracking-wide">
              100% Artisanaux
            </span>
          </h2>
          
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <div className="h-px w-8 lg:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
            <div className="size-1.5 rounded-full bg-[#D4AF37]/50 rotate-45" />
            <div className="h-px w-8 lg:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
          </div>

          <p className="text-[#3A2A21]/80 font-light text-sm sm:text-base md:text-lg mb-8 leading-relaxed tracking-wide drop-shadow-md">
            Sublimez vos meubles et portes avec nos poignées en céramique d&apos;art. 
            Des détails peints à la main pour apporter une élégance absolue à votre intérieur.
          </p>

          <button
            onClick={handleNavigate}
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-[#D4AF37] to-[#8a6308] text-[#1a1512] px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300"
          >
            Découvrir la collection
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              →
            </motion.span>
          </button>
        </motion.div>

        {/* Right: The Jewelry Display (Interactive Knobs) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex-1 w-full relative flex items-center justify-center min-h-[300px] sm:min-h-[400px]"
        >
          {/* Main Giant Knob (Center) */}
          <button
            onClick={handleNavigate}
            className="group relative z-20 flex flex-col items-center focus:outline-none"
          >
            {/* The Backplate (Rosace en laiton) */}
            <div className="relative size-40 sm:size-48 md:size-56 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#AA7C11] to-[#3a2800] shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.5)] flex items-center justify-center transition-transform duration-500 group-hover:scale-105 border border-yellow-900/60">
              
              {/* Inner ring */}
              <div className="absolute inset-[8px] sm:inset-[10px] rounded-full border border-black/50 shadow-[inset_0_5px_20px_rgba(0,0,0,0.9)] bg-gradient-to-br from-[#1a1512] to-[#2a2420]" />
              
              {/* The Rotating Knob */}
              <motion.div 
                whileTap={{ rotate: 120, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 150, damping: 10, mass: 1 }}
                className="relative size-28 sm:size-32 md:size-40 rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.5),inset_0_4px_10px_rgba(255,255,255,0.3)] z-10 cursor-pointer border-[3px] border-[#D4AF37]/90 bg-white"
              >
                <Image 
                  src="/poignees/new_knob_13.jpg" 
                  alt="Découvrir les poignées" 
                  fill 
                  className="object-cover scale-[1.05] pointer-events-none" 
                />
                {/* 3D Ceramic Glaze Highlight */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/40 pointer-events-none" />
                <div className="absolute top-1 left-[15%] right-[15%] h-1/4 rounded-t-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none opacity-90" />
              </motion.div>
            </div>
            <div className="absolute -bottom-8 bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[#D4AF37] text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Tournez-moi
            </div>
          </button>

          {/* Floating Orbiting Knobs */}
          {KNOBS.slice(1).map((knob, idx) => {
            // Calculate orbital positions
            const angle = (idx * Math.PI) - (Math.PI / 4);
            const radius = 120; // distance from center on small screens
            const radiusLg = 160;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: [0, Math.cos(angle) * radiusLg], 
                  y: [0, Math.sin(angle) * radiusLg] 
                }}
                transition={{ duration: 1.5, delay: 1 + knob.delay, type: "spring", bounce: 0.3 }}
                className="absolute z-10 hidden sm:flex items-center justify-center cursor-pointer group"
                onClick={handleNavigate}
              >
                <div className="relative size-16 md:size-24 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#AA7C11] to-[#3a2800] shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-yellow-900/50 flex items-center justify-center transition-transform duration-500 group-hover:scale-125">
                  <div className="absolute inset-[3px] md:inset-[4px] rounded-full border border-black/50 shadow-inner bg-gradient-to-br from-[#1a1512] to-[#2a2420]" />
                  <motion.div
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: knob.delay }}
                    className="relative size-10 md:size-16 rounded-full overflow-hidden shadow-lg border-2 border-[#D4AF37]/80 z-10 bg-white"
                  >
                    <Image src={knob.src} alt="Poignée artisanale" fill className="object-cover scale-105 pointer-events-none" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/30 pointer-events-none" />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
