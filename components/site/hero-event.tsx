'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimationControls } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { publicApi, News } from '@/lib/api'
import { EventModal } from './event-modal'
import { BohoBand, BohoCarvedColumn, BohoCarvedKnob } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function HeroEvent() {
  const [latestEvent, setLatestEvent] = useState<News | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimationControls()
  const { color: titleColor } = useRandomHeroColor()

  useEffect(() => {
    setIsMounted(true)
    publicApi.getNews()
      .then(news => {
        if (news && news.length > 0) {
          setLatestEvent(news[0])
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (isHovered) {
      controls.start({ rotate: 180, scale: 1.15, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.8))' })
    } else {
      controls.start({ rotate: 0, scale: 1, filter: 'drop-shadow(0 0 0px rgba(212,175,55,0))' })
    }
  }, [isHovered, controls])

  if (!isMounted || !latestEvent) return null

  const image = latestEvent.imageUrl || '/hero-bg.jpg'

  return (
    <>
      <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center">

        
        {/* Decorative Grid Lines — motif géométrique */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(193,125,89,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(193,125,89,0.04)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

        {/* Main Content Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-x-20 pt-16 pb-8 items-center">
          
          {/* Left Side: Text and Actions */}
          <div className="w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-start w-full max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9CEB8] text-[#C17D59] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4 lg:mb-6 shadow-sm">
                <Sparkles className="size-3 md:size-4 animate-pulse" />
                Événement & Foire
              </div>
              
              <h2 
                className="font-heading text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-6 leading-none transition-colors duration-1000"
                style={{ color: titleColor }}
              >
                Actualité<br/>
                <span className="text-[#D4AF37] text-4xl md:text-5xl italic drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">{latestEvent.title}</span>
              </h2>
              
              <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium max-w-sm xl:max-w-md text-sm md:text-base xl:text-lg mb-10 leading-relaxed line-clamp-3">
                {latestEvent.content}
              </p>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center justify-center bg-[#2D5F8A] text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#2D5F8A]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2D5F8A]/30"
              >
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  <Sparkles className="size-4" />
                  Voir l'événement
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D5F8A] via-[#4382BA] to-[#2D5F8A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </motion.div>
          </div>

          {/* Right Side: Arched Image */}
          <div className="w-full flex justify-center lg:justify-end z-20 order-2 lg:col-start-2 lg:row-start-1">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[400px] lg:max-w-[450px] aspect-[3/4] overflow-hidden group shadow-2xl rounded-t-full rounded-b-xl border-[6px] border-[#D8C6B3]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute inset-0 ring-1 ring-[#C17D59]/20 rounded-t-full rounded-b-xl z-10 pointer-events-none" />
              <Image
                src={image}
                alt={latestEvent.title}
                fill
                className="object-cover transition-transform duration-[15s] ease-out group-hover:scale-125"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] pointer-events-none" />
              {/* Magic dust effect */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Small floating zigzag motifs (Brown) */}
        <BohoBand className="absolute top-10 right-10 md:right-20 w-48 opacity-20" color="#8B5E3C" />
        <BohoBand className="absolute bottom-10 left-10 md:left-20 w-48 opacity-20" color="#8B5E3C" />
      </div>

      <EventModal 
        event={latestEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
