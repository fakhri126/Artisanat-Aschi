'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'
import { BohoBand } from './boho-decor'


export function HeroBijoux() {
  const router = useRouter()
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleKnobClick = () => {
    if (isSpinning) return
    setIsSpinning(true)
    
    // Rotation complète de 360° au clic
    setRotation(prev => prev + 360)

    // Redirection fluide après avoir vu la poignée tourner
    setTimeout(() => {
      router.push('/bijoux-de-porte')
    }, 700)
  }

  const handleButtonClick = () => {
    router.push('/bijoux-de-porte')
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center font-sans py-2 sm:py-4">
      
      {/* Decorative Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute rounded-full bg-[#E6A635]/30 blur-[1px]"
            style={{
              width: `${(i % 3) * 2 + 2}px`,
              height: `${(i % 3) * 2 + 2}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 23) % 100}%`,
            }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.4, 0] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-center py-2 sm:py-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* 2-Column Responsive Layout: Text (Left) - Photo originale + Poignée en bas (Right) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center justify-items-center">
          
          {/* 1. Colonne Gauche : Texte & Bouton d'action */}
          <div className="w-full lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-lg"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 lg:mb-4 shadow-md backdrop-blur-md">
                <Sparkles className="size-3 text-[#E6A635]" />
                <span>Collection Exclusive</span>
              </div>
              
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                Bijoux de Porte <br/>
                <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl block mt-0.5">
                  100% Artisanaux
                </span>
              </h2>

              <p className="text-white font-normal text-xs sm:text-sm md:text-[14.5px] mb-5 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                Sublimez vos meubles et portes avec nos poignées en céramique d&apos;art peintes à la main et encadrées de boiserie sculptée en noyer.
              </p>

              <button
                onClick={handleButtonClick}
                className="btn-sheen group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 rounded-full font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* 2. Colonne Droite : Photo originale restaurée + Poignée en bas sans jaune */}
          <div className="w-full lg:col-span-7 flex flex-col items-center justify-center z-20 order-2 mt-2 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[460px] lg:max-w-[520px] flex flex-col items-center"
            >
              {/* Cadre Photo Originale (Exposition de poignées sur fond sombre) */}
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#3B271C] group">
                <Image 
                  src="/images/poignees_display.jpg" 
                  alt="Exposition de poignées artisanales" 
                  width={1200}
                  height={960}
                  priority
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/75 via-transparent to-transparent pointer-events-none" />
                
                {/* Badge flottant en bas de l'image */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-white shadow-lg pointer-events-none">
                  <span className="font-heading text-xs sm:text-sm font-semibold text-white">Émaux &amp; Céramiques d&apos;Art</span>
                  <span className="text-[9px] sm:text-[10px] text-[#F2BD52] uppercase font-bold tracking-wider">Peint à la main</span>
                </div>
              </div>

              {/* 🌟 POIGNÉE UNIQUE EN BAS DE LA PHOTO — SANS COULEUR JAUNE — TOURNE AU CLIC */}
              <div className="relative -mt-6 sm:-mt-7 z-30 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleKnobClick}
                  className="group relative flex flex-col items-center focus:outline-none cursor-pointer"
                  aria-label="Poignée artisanale interactive - Cliquez pour tourner"
                >
                  <motion.div 
                    animate={{ 
                      rotate: rotation,
                      y: isSpinning ? [0, -4, 0] : [0, -3, 0]
                    }}
                    whileHover={{ 
                      rotate: rotation + 18,
                      scale: 1.08 
                    }}
                    transition={{ 
                      rotate: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
                      y: { duration: 3.5, repeat: isSpinning ? 0 : Infinity, ease: "easeInOut" },
                      scale: { duration: 0.25 }
                    }}
                    className="relative size-16 sm:size-20 flex items-center justify-center"
                  >
                    {/* Anneau de boiserie naturelle en noyer noble (aucune couleur jaune) */}
                    <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.9)] border-2 border-[#5A3E2D]/80 bg-[#2C1D15]">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4A3325] via-[#2C1D15] to-[#1A110B] pointer-events-none" />
                    </div>
                    
                    {/* Céramique d'art authentique peinte à la main (issue de votre photo) */}
                    <div className="relative size-12 sm:size-15 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.85)] z-10 border border-[#8C6B50]/60">
                      <Image 
                        src="/poignees/knob_user_new.png" 
                        alt="Poignée céramique artisanale peinte à la main" 
                        fill 
                        className="object-cover pointer-events-none" 
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/15 via-transparent to-white/30 pointer-events-none" />
                    </div>
                  </motion.div>
                  
                  {/* Pastille Guide Interactive Sobre (Sans Jaune Vif) */}
                  <motion.div 
                    whileHover={{ scale: 1.04 }}
                    className="mt-1.5 inline-flex items-center gap-1.5 bg-[#2A1D15]/95 border border-[#8C6B50]/40 px-3.5 py-0.5 rounded-full text-[#EDE4D8] text-[9.5px] uppercase tracking-[0.16em] font-medium shadow-lg group-hover:bg-[#4A3325] group-hover:border-[#C4A480]/60 group-hover:text-white transition-all whitespace-nowrap"
                  >
                    <span className="size-1.5 rounded-full bg-[#C4A480] animate-pulse" />
                    <span>Cliquez pour tourner ❖</span>
                  </motion.div>
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Subtle background motifs */}
      <BohoBand className="absolute top-10 left-10 md:left-20 w-48 opacity-[0.06]" color="#E6A635" />
      <BohoBand className="absolute bottom-10 right-10 md:right-20 w-48 opacity-[0.06]" color="#E6A635" />
    </div>
  )
}
