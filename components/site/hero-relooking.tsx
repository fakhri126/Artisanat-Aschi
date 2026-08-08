'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Paintbrush, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { publicApi, Relooking } from '@/lib/api'
import { BohoCeramicCross, BohoOrnateDiamond } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function HeroRelooking() {
  const { color: titleColor, isMounted } = useRandomHeroColor()
  const [relooking, setRelooking] = useState<Relooking | null>(null)
  const [sliderPosition, setSliderPosition] = useState(50) // Percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    async function loadLatest() {
      try {
        const data = await publicApi.getRelookings()
        if (data && data.length > 0) {
          setRelooking(data[0]) // Get the most recent one
        }
      } catch (err) {
        console.warn('Failed to fetch relookings, using defaults')
      }
    }
    loadLatest()
  }, [])

  // Handle drag for the comparison slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percent)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center">
      
      {/* Motif Zellij en bas à gauche */}
      <BohoCeramicCross className="absolute bottom-10 left-10 w-48 h-48 text-[#E8DCCB] opacity-50 pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-7xl px-6 h-full flex flex-col lg:flex-row items-center justify-center gap-12 pt-20 lg:pt-0 pb-16 lg:pb-0">

        
        {/* Left Text Content */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 mt-8 lg:mt-0 order-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9CEB8] text-[#C17D59] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <Paintbrush className="size-4" />
              Restauration d&apos;Art & Relooking
            </div>
            
            <h2 
              className="font-heading text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-6 leading-none transition-colors duration-1000"
              style={{ color: isMounted ? titleColor : '#87CEEB' }}
            >
              Relooking <br/>
              <span className="text-[#D4AF37] italic text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">& Restauration</span>
            </h2>
            
            <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium max-w-sm xl:max-w-md text-sm md:text-base xl:text-lg mb-10 leading-relaxed">
              Offrez une seconde vie à vos précieux meubles de famille. Notre atelier restaure, patine et réinvente vos pièces d&apos;exception en préservant leur noblesse et leur histoire.
            </p>
            
            <Link
              href="/relooking"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-[#C17D59] to-[#8C5230] hover:from-[#d4af37] hover:to-[#C17D59] text-white px-8 py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#E8DCCB]/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2 md:gap-3">
                <Sparkles className="size-4" />
                Découvrir la Restauration
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Right Comparison Slider */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-2/3 w-full h-[50vh] lg:h-[65vh] relative perspective-1000 max-w-2xl mx-auto"
        >
          {/* Ornate Frame around the slider */}
          
          <div 
            ref={containerRef}
            className="relative w-full h-full overflow-hidden shadow-2xl cursor-ew-resize select-none z-10 border-[8px] border-white rounded-sm bg-stone-100"
            onMouseDown={(e) => {
              setIsDragging(true)
              handleMove(e.clientX)
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => {
              setIsDragging(true)
              handleMove(e.touches[0].clientX)
            }}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* The Base Image: "APRES" (Restored, full color, vibrant) */}
            <Image
              src={relooking ? relooking.imageApresUrl : "/relooking_service.jpg"}
              alt={relooking ? relooking.title : "Meuble restauré - Après"}
              fill
              className="object-cover pointer-events-none"
              priority
            />
            
            {/* Tag APRES */}
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-[#E8DCCB]/30 text-[#C17D59] text-[10px] uppercase tracking-widest font-bold z-0 pointer-events-none">
              Après
            </div>

            {/* The Overlay Image: "AVANT" (Old, dusty, sepia/grayscale) */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r-2 border-[#E8DCCB] shadow-[2px_0_15px_rgba(0,0,0,0.5)]"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="absolute inset-y-0 left-0 w-[100vw] lg:w-[60vw]">
                {/* We apply a CSS filter ONLY IF it's the default static image. If it's real data, we show the real imageAvant unmodified! */}
                <Image
                  src={relooking ? relooking.imageAvantUrl : "/relooking_service.jpg"}
                  alt="Meuble ancien - Avant"
                  fill
                  className={`object-cover pointer-events-none ${!relooking ? 'filter sepia-[0.5] grayscale-[0.8] brightness-[0.6] contrast-[1.2]' : ''}`}
                  priority
                />
              </div>

              {/* Tag AVANT */}
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-stone-200/90 backdrop-blur-md border border-stone-400 text-stone-800 text-[10px] uppercase tracking-widest font-bold pointer-events-none">
                Avant
              </div>
            </div>

            {/* The Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center -ml-4"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-[#E8DCCB] border-2 border-white shadow-lg flex items-center justify-center text-stone-900 pointer-events-none transition-transform hover:scale-110">
                <ArrowLeftRight className="size-4" />
              </div>
            </div>
            
          </div>
          
          
          {/* Instruction Text below slider */}
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[#C17D59] text-[9px] font-bold tracking-[0.3em] uppercase hidden lg:block">
            Glissez pour révéler la transformation
          </p>
        </motion.div>

      </div>
    </div>
  )
}
