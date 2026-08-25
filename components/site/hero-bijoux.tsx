'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'
import { BohoBand } from './boho-decor'

const KNOBS = [
  { src: '/poignees/hq_knob_1.jpg', bg: '/poignees/user_wood_motif.png', delay: 0 },
  { src: '/poignees/hq_knob_2.jpg', bg: '/poignees/user_wood_motif.png', delay: 0.2 },
  { src: '/poignees/hq_knob_3.jpg', bg: '/poignees/user_wood_motif.png', delay: 0.4 },
]

export function HeroBijoux() {
  const router = useRouter()

  const handleNavigate = () => {
    setTimeout(() => {
      router.push('/bijoux-de-porte')
    }, 400)
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
        
        {/* 3-Column Layout: Text (Left) - Handles (Middle) - Large Image (Right) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center justify-items-center">
          
          {/* 1. Left Column: Text Content */}
          <div className="w-full lg:col-span-4 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
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
                onClick={handleNavigate}
                className="btn-sheen group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 rounded-full font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* 2. Middle Column: Poignées fines et délicates */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full lg:col-span-3 relative flex items-center justify-center min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] order-2 z-10"
          >
            {/* Grande Poignée Centrale (Taille affinée et élégante) */}
            <button
              onClick={handleNavigate}
              className="group relative z-20 flex items-center justify-center focus:outline-none cursor-pointer"
              aria-label="Grande poignée artisanale"
            >
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative size-28 sm:size-32 md:size-36 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
              >
                <motion.div 
                  whileTap={{ rotate: 120, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 150, damping: 10, mass: 1 }}
                  className="relative size-full flex items-center justify-center"
                >
                  {/* Motif Bois Artisanal original */}
                  <div className="absolute inset-0 z-0 rounded-full overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-[#E6A635]/40">
                    <Image 
                      src="/poignees/user_wood_motif.png" 
                      alt="Motif bois sculpté" 
                      fill 
                      className="object-cover pointer-events-none" 
                      style={{ transform: 'scale(1.15)' }} 
                    />
                  </div>
                  
                  {/* Céramique de Majolique Centrale */}
                  <div className="relative size-16 sm:size-20 md:size-22 rounded-full overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.9),0_0_15px_rgba(230,166,53,0.4)] z-10 border-2 border-[#E6A635]">
                    <Image 
                      src="/poignees/hq_knob_1.jpg" 
                      alt="Grande poignée artisanale" 
                      fill 
                      className="object-cover pointer-events-none" 
                      style={{ transform: 'scale(1.35)' }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/40 pointer-events-none" />
                  </div>
                </motion.div>
              </motion.div>
              
              <div className="absolute -bottom-5 bg-[#3B271C]/95 border border-[#E6A635]/40 px-3 py-0.5 rounded-full text-[#F2BD52] text-[9px] uppercase tracking-[0.18em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                Tournez-moi ❖
              </div>
            </button>

            {/* 2 Petites Poignées Orbitantes Fines */}
            {KNOBS.slice(1).map((knob, idx) => {
              const angle = (idx * Math.PI) - (Math.PI / 4)
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1,
                    scale: 1,
                    x: [0, Math.cos(angle) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 95)], 
                    y: [0, Math.sin(angle) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 95)] 
                  }}
                  transition={{ duration: 1.5, delay: 0.8 + knob.delay, type: "spring", bounce: 0.3 }}
                  className="absolute z-10 flex items-center justify-center cursor-pointer group"
                  onClick={handleNavigate}
                >
                  <div className="relative size-14 sm:size-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-115">
                    <motion.div
                      animate={{ rotate: [-5, 5, -5], y: [0, -6, 0] }}
                      transition={{ duration: 3.5 + (idx * 0.5), repeat: Infinity, ease: "easeInOut", delay: knob.delay }}
                      className="relative size-full flex items-center justify-center"
                    >
                      <div className="absolute inset-0 z-0 rounded-full overflow-hidden shadow-md border border-[#E6A635]/30">
                        {knob.bg && (
                          <Image 
                            src={knob.bg} 
                            alt="Motif bois sculpté" 
                            fill 
                            className="object-cover pointer-events-none" 
                            style={{ transform: 'scale(1.15)' }} 
                          />
                        )}
                      </div>
                      
                      <div className="relative size-8 sm:size-10 rounded-full overflow-hidden shadow-sm z-10 border border-[#E6A635]/70">
                        <Image 
                          src={knob.src} 
                          alt="Petite poignée artisanale" 
                          fill 
                          className="object-cover pointer-events-none" 
                          style={{ transform: 'scale(1.35)' }} 
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 via-transparent to-white/50 pointer-events-none" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* 3. Right Column: Image de Présentation Agrandie & Majestueuse */}
          <div className="w-full lg:col-span-5 flex justify-center lg:justify-end z-20 order-3 mt-4 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[480px] lg:max-w-[540px] rounded-3xl overflow-hidden border-2 border-[#E6A635]/50 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#3B271C] group"
            >
              <Image 
                src="/images/poignees_display.jpg" 
                alt="Exposition de poignées artisanales" 
                width={1200}
                height={960}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge flottant en bas de l'image */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#3B271C]/95 backdrop-blur-md border border-[#E6A635]/40 px-3.5 py-2 rounded-xl flex items-center justify-between text-white shadow-lg">
                <span className="font-heading text-xs sm:text-sm font-semibold text-white">Émaux &amp; Céramiques d&apos;Art</span>
                <span className="text-[9px] sm:text-[10px] text-[#F2BD52] uppercase font-bold tracking-wider">Peint à la main</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Small floating subtle motifs */}
      <BohoBand className="absolute top-10 left-10 md:left-20 w-48 opacity-[0.06]" color="#E6A635" />
      <BohoBand className="absolute bottom-10 right-10 md:right-20 w-48 opacity-[0.06]" color="#E6A635" />
    </div>
  )
}
