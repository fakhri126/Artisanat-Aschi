'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, ArrowRight } from 'lucide-react'
import { publicApi, News } from '@/lib/api'
import { EventModal } from './event-modal'

export function HeroEvent() {
  const [latestEvent, setLatestEvent] = useState<News | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  if (!isMounted || !latestEvent) return null

  const image = latestEvent.imageUrl || '/news-exposition.jpg'

  return (
    <>
      <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center font-sans py-2 sm:py-4">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-x-16 py-2 sm:py-4 items-center">
          
          {/* Left Side: Text and Actions */}
          <div className="w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-start w-full max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-4 shadow-md">
                <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
                <span>Actualité de la Maison</span>
              </div>
              
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                Événements <br/>
                <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                  &amp; Salons d&apos;Artisanat
                </span>
              </h2>
              
              <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-md text-xs sm:text-sm md:text-base mb-6 leading-relaxed line-clamp-3">
                {latestEvent.content}
              </p>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>Lire l&apos;Actualité</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Right Side: Arched Image */}
          <div className="w-full flex justify-center lg:justify-end z-20 order-2 lg:col-start-2 lg:row-start-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[420px] aspect-[3/4] overflow-hidden group shadow-2xl rounded-t-full rounded-b-2xl border border-[#D4AF37]/50 bg-[#18130E]"
            >
              <Image
                src={image}
                alt={latestEvent.title}
                fill
                className="object-cover transition-transform duration-[12s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18130E]/80 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={latestEvent}
      />
    </>
  )
}
