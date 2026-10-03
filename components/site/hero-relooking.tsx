'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Paintbrush, Sparkles, ArrowRight, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'
import { publicApi, Relooking } from '@/lib/api'
import { formatImageUrl } from '@/lib/utils'

export function HeroRelooking() {
  const [relooking, setRelooking] = useState<Relooking | null>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    async function loadLatest() {
      try {
        const data = await publicApi.getRelookings()
        if (data && data.length > 0) {
          setRelooking(data[0])
        }
      } catch (err) {
        console.warn('Failed to fetch relookings, using defaults')
      }
    }
    loadLatest()
  }, [])

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

  const beforeImg = formatImageUrl(relooking?.imageAvantUrl, '/gallery-1.png')
  const afterImg = formatImageUrl(relooking?.imageApresUrl, '/relooking_service.jpg')

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center font-sans py-2 sm:py-4">
      
      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 h-full grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-0 lg:gap-x-10 py-2 sm:py-4 items-center">
        
        {/* Left Text Content (5 Cols) */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 shadow-md backdrop-blur-md">
              <Paintbrush className="size-3 text-[#E6A635]" />
              <span>Savoir-Faire &amp; Restauration</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Relooking d&apos;Art <br/>
              <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl block mt-0.5">
                &amp; Restauration Noble
              </span>
            </h2>
            
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-md text-xs sm:text-sm md:text-[14.5px] mb-5 leading-relaxed">
              Offrez une seconde vie à vos précieux meubles de famille. Notre atelier restaure, patine et sublime vos pièces anciennes en préservant leur histoire et leur âme.
            </p>
            
            <Link
              href="/relooking"
              className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>Découvrir la Restauration</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Right Comparison Slider (7 Cols - Agrandie et Majestueuse) */}
        <div className="w-full lg:col-span-7 flex justify-center lg:justify-end z-20 order-2 mt-2 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
            className="relative w-full max-w-[560px] lg:max-w-[600px] aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border-2 border-[#E6A635]/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] cursor-ew-resize select-none bg-[#3B271C]"
          >
            {/* After Image (Full width background) */}
            <div className="absolute inset-0">
              <img 
                src={afterImg} 
                alt="Après Restauration d'Art" 
                className="size-full object-cover pointer-events-none" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/relooking_service.jpg' }}
              />
              <div className="absolute top-3.5 right-3.5 bg-[#3B271C]/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#E6A635]/40 text-[9.5px] uppercase tracking-[0.2em] font-bold text-[#F2BD52] shadow-md z-10">
                Après Restauration
              </div>
            </div>

            {/* Before Image (Clipped with sliderPosition) */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img 
                src={beforeImg} 
                alt="Avant Restauration" 
                className="size-full object-cover" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/gallery-1.png' }}
              />
              <div className="absolute top-3.5 left-3.5 bg-[#1A110B]/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 text-[9.5px] uppercase tracking-[0.2em] font-bold text-white shadow-md z-10">
                État Initial
              </div>
            </div>

            {/* Sliding Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#E6A635] shadow-[0_0_12px_#E6A635]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 sm:size-10 rounded-full bg-[#3B271C] border-2 border-[#E6A635] shadow-xl flex items-center justify-center text-[#F2BD52]">
                <ArrowLeftRight className="size-4" />
              </div>
            </div>

            {/* Bottom Guide */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#3B271C]/90 backdrop-blur-md px-4 py-1 rounded-full border border-[#E6A635]/35 text-[9px] sm:text-[9.5px] uppercase tracking-[0.2em] text-[#F2BD52] font-semibold pointer-events-none shadow-md">
              Glisser pour comparer
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
