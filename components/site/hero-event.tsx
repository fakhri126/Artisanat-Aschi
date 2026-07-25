'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimationControls } from 'framer-motion'
import { publicApi, News } from '@/lib/api'
import { EventModal } from './event-modal'

export function HeroEvent() {
  const [latestEvent, setLatestEvent] = useState<News | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimationControls()

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
      <div className="relative h-full w-full overflow-hidden bg-stone-950 flex items-center justify-center">
        {/* Background Image with Parallax & Blur */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={image}
            alt={latestEvent.title}
            fill
            priority
            className="object-cover opacity-40 scale-105 blur-sm"
          />
        </div>

        {/* Elegant Overlays */}
        <div className="absolute inset-0 bg-stone-950/60" />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

        {/* Floating Artisan Frame */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-[90%] max-w-5xl h-[75%] max-h-[800px] flex flex-col md:flex-row items-center border border-white/10 bg-white/20 backdrop-blur-md"
        >
          {/* Golden Accents for the frame */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#E8DCCB]/50 -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#E8DCCB]/50 translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#E8DCCB]/50 -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#E8DCCB]/50 translate-x-1 translate-y-1" />

          {/* Left Side: Image inside Frame */}
          <div className="w-full md:w-1/2 h-[40%] md:h-full relative p-6 md:p-12">
            <motion.div 
              className="relative w-full h-full overflow-hidden group origin-left"
              animate={{ rotateY: isHovered ? -5 : 0, perspective: 1000 }}
              transition={{ duration: 0.5 }}
            >
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

          {/* Right Side: Content */}
          <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center items-center md:items-start text-center md:text-left relative">
            
            <p className="text-[#C17D59] text-[10px] font-bold tracking-[0.4em] uppercase mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-[#E8DCCB]/50 hidden md:block" />
              Événement & Foire
            </p>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#3A2A21] leading-tight mb-8">
              {latestEvent.title}
            </h1>

            <p className="text-sm md:text-base font-light text-white/70 leading-relaxed line-clamp-3 mb-12 max-w-md">
              {latestEvent.content}
            </p>

            {/* Rotating Knob Action */}
            <div 
              className="relative flex flex-col items-center gap-4 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsModalOpen(true)}
            >
              <div className="relative size-16 md:size-20 rounded-full border border-[#E8DCCB]/30 flex items-center justify-center bg-white/40 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-shadow hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                <motion.div animate={controls}>
                  <Image 
                    src="/handle-knob.png" 
                    alt="Tourner pour découvrir" 
                    width={40} 
                    height={40} 
                    className="opacity-90"
                  />
                </motion.div>
                
                {/* Ping animation effect behind the knob */}
                <div className="absolute inset-0 rounded-full bg-[#E8DCCB]/10 animate-ping opacity-20 pointer-events-none" />
              </div>
              
              <span className="text-[10px] text-white/50 tracking-[0.3em] uppercase">
                Ouvrir
              </span>
            </div>

          </div>
        </motion.div>
      </div>

      <EventModal 
        event={latestEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
