'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, Eye, MapPin } from 'lucide-react'
import Image from 'next/image'
import { publicApi, Delivery } from '@/lib/api'

export function HeroDelivery() {
  const [latestDelivery, setLatestDelivery] = useState<Delivery | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function loadLatest() {
      try {
        const deliveries = await publicApi.getDeliveries()
        if (deliveries && deliveries.length > 0) {
          setLatestDelivery(deliveries[0])
        }
      } catch (err) {
        console.warn('Failed to fetch latest delivery')
      }
    }
    loadLatest()
  }, [])

  if (!latestDelivery) {
    return (
      <div className="h-full min-h-[480px] w-full bg-transparent flex items-center justify-center">
        <div className="size-10 rounded-full border-2 border-[#E6A635]/30 border-t-[#E6A635] animate-spin" />
      </div>
    )
  }

  const image = latestDelivery.imageUrl || '/images/bg-weekly-delivery-2.jpg'
  const isVideo = image.match(/\.(mp4|webm|ogg|mov)$/i)

  return (
    <div className="relative h-full w-full overflow-hidden flex items-center font-sans py-2 sm:py-4">
      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-y-0 lg:gap-x-14 py-2 sm:py-4 items-center">
        
        {/* Left Side: Elegant typography and CTA */}
        <div className="w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1 lg:col-start-1 lg:row-start-1 lg:pb-6 z-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 shadow-md">
              <Truck className="size-3 text-[#E6A635]" />
              <span>Livraison de la Semaine</span>
            </div>
            
            {/* Title */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Nos Chefs-d&apos;Œuvre <br/>
              <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl block mt-0.5">
                Installés Chez Vous
              </span>
            </h2>
            
            {/* Description in Pure White */}
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-md text-xs sm:text-sm md:text-base mb-4 leading-relaxed">
              Découvrez la dernière réalisation d&apos;art installée chez notre client
              {latestDelivery.location && (
                <span className="text-[#F2BD52] font-semibold"> à {latestDelivery.location}</span>
              )}.
            </p>

            {/* Client Review Quote */}
            {latestDelivery.clientReview && (
              <blockquote className="border-l-2 border-[#E6A635]/60 pl-4 my-2 italic text-xs sm:text-sm text-white max-w-md bg-[#3B271C]/60 py-2 pr-3 rounded-r-xl">
                « {latestDelivery.clientReview} »
              </blockquote>
            )}
            
            {/* CTA Button */}
            <div className="mt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Eye className="size-3.5 text-[#1A110B]" />
                <span>Découvrir cette Réalisation</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Traditional Arched Window Showcase Photo (Rétablie & Agrandie) */}
        <div className="w-full relative flex justify-center lg:justify-end z-20 order-2 lg:col-start-2 lg:row-start-1 mt-2 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[420px] lg:max-w-[460px] h-[48vh] sm:h-[54vh] lg:h-[60vh] max-h-[580px] rounded-t-full rounded-b-3xl overflow-hidden border-[4px] sm:border-[5px] border-[#E6A635]/60 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-[#3B271C] group"
          >
            {isVideo ? (
              <video
                src={image}
                muted
                autoPlay
                loop
                playsInline
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={image}
                alt={latestDelivery.title || "Livraison Artisanat Aschi"}
                fill
                priority
                className="object-cover transition-transform duration-[12s] group-hover:scale-105"
              />
            )}
            
            {/* Window Glass Reflection & Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/90 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Location Badge on Window */}
            {latestDelivery.location && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#3B271C]/95 backdrop-blur-xl px-5 py-2 rounded-full border border-[#E6A635]/50 flex items-center gap-2 text-xs font-semibold text-[#F2BD52] shadow-2xl whitespace-nowrap">
                <MapPin className="size-3.5 text-[#E6A635]" />
                <span>{latestDelivery.location}</span>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
