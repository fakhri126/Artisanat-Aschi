'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimationControls } from 'framer-motion'
import { publicApi, News } from '@/lib/api'
import { EventModal } from './event-modal'
import { BohoBand, BohoCarvedColumn, BohoCarvedKnob } from './boho-decor'

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
      <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center">

        
        {/* Decorative Grid Lines — motif géométrique */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(193,125,89,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(193,125,89,0.04)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

        {/* Wrapper for Card and Pillars */}
        <div className="relative z-10 w-[90%] max-w-5xl h-[75%] max-h-[800px]">
          
          {/* Motif Carved Column stuck to the LEFT side of the card */}
          <BohoCarvedColumn className="absolute top-0 left-[-15px] md:left-[-30px] lg:left-[-40px] h-full w-12 md:w-20 lg:w-28 opacity-100 z-20 pointer-events-none drop-shadow-2xl" color="#A67B5B" delay={0.3} />
          
          {/* Motif Carved Column stuck to the RIGHT side of the card */}
          <BohoCarvedColumn className="absolute top-0 right-[-15px] md:right-[-30px] lg:right-[-40px] h-full w-12 md:w-20 lg:w-28 opacity-100 z-20 pointer-events-none drop-shadow-2xl" color="#A67B5B" delay={0.2} />

          {/* Floating Artisan Frame */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex flex-col md:flex-row items-center border-[3px] border-[#C8B8A6] bg-[#E5D3C1] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(58,42,30,0.2)]"
          >
            {/* Texture de fond artisanale */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply" />

            {/* Cadre intérieur décoratif */}
            <div className="absolute inset-3 border border-[#C17D59]/40 rounded-lg pointer-events-none" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#C17D59]/40 -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#C17D59]/40 translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#C17D59]/40 -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#C17D59]/40 translate-x-1 translate-y-1" />

          {/* Left Side: Image inside Arch Frame */}
          <div className="w-full md:w-1/2 h-[45%] md:h-full relative p-6 md:p-10 flex items-center justify-center">
            
            {/* Arched Window Container */}
            <motion.div 
              className="relative w-full h-full overflow-hidden group shadow-2xl rounded-t-full rounded-b-xl border-[6px] border-[#D8C6B3] md:translate-x-8"
              animate={{ rotateY: isHovered ? -5 : 0, perspective: 1000 }}
              transition={{ duration: 0.5 }}
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

          {/* Right Side: Content */}
          <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center items-center md:items-start text-center md:text-left relative z-10">
            
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[2px] bg-[#C17D59] hidden md:block opacity-60" />
              <p className="text-[#8B5E3C] text-[11px] font-bold tracking-[0.4em] uppercase">
                Événement & Foire
              </p>
              <span className="w-12 h-[2px] bg-[#C17D59] hidden md:block opacity-60" />
            </div>            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] text-[#3A2A21] leading-[1.1] mb-6">
              {latestEvent.title}
            </h1>

            <div className="w-16 h-1 bg-[#D9CEB8] mb-6 md:mb-8 rounded-full" />

            <p className="text-sm md:text-lg font-light text-[#5A453A] leading-relaxed line-clamp-3 mb-10 max-w-lg">
              {latestEvent.content}
            </p>

            {/* Rotating Knob Action */}
            <div 
              className="relative flex flex-col items-center gap-4 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsModalOpen(true)}
            >
              <div className="relative size-24 md:size-28 rounded-full border border-[#C8B8A6] flex items-center justify-center bg-[#F3E7DB] shadow-[0_4px_20px_rgba(193,125,89,0.2)] transition-shadow hover:shadow-[0_4px_30px_rgba(193,125,89,0.35)]">
                <motion.div animate={controls}>
                  <BohoCarvedKnob className="w-20 h-20 md:w-24 md:h-24" color="#8B5E3C" />
                </motion.div>
                
                {/* Ping animation */}
                <div className="absolute inset-0 rounded-full bg-[#C17D59]/10 animate-ping opacity-30 pointer-events-none" />
              </div>
              
              <span className="text-[10px] text-[#8B5E3C] tracking-[0.3em] uppercase">
                Ouvrir
              </span>
            </div>

          </div>
        </motion.div>
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
