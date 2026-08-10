'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Truck, Eye, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { publicApi, Delivery, Product } from '@/lib/api'
import { BohoRosace } from './boho-decor'
import { ProductModal } from './product-modal'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function HeroDelivery() {
  const { color: titleColor, isMounted } = useRandomHeroColor()
  const [latestDelivery, setLatestDelivery] = useState<Delivery | null>(null)
  const [isUnveiled, setIsUnveiled] = useState(false)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUnveiled(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!latestDelivery) {
    return (
      <div className="h-screen w-full bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-pulse w-32 h-32 rounded-full border-4 border-[#C17D59]/30 border-t-[#C17D59] animate-spin" />
      </div>
    )
  }

  const image = latestDelivery.imageUrl || '/hero-bg.jpg'
  const isVideo = image.match(/\.(mp4|webm|ogg|mov)$/i)

  return (
    <div className="relative h-full min-h-[700px] w-full overflow-hidden flex items-center font-sans">
      {/* Intricate Bohemian Motifs */}

      <div className="relative z-10 h-full w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-y-0 lg:gap-x-20 pt-24 pb-10 items-center">
        
        {/* Left Side: Elegant typography and CTA */}
        <div className="w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1 lg:col-start-1 lg:row-start-1 lg:pb-8 z-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9CEB8] text-[#C17D59] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4 lg:mb-6 shadow-sm">
              <Truck className="size-3 md:size-4" />
              Expédition Garantie
            </div>
            
            <h2 
              className="font-heading text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-6 leading-none transition-colors duration-1000"
              style={{ color: isMounted ? titleColor : '#87CEEB' }}
            >
              Nos Meubles <br/>
              <span className="text-[#D4AF37] italic text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">Chez Vous</span>
            </h2>
            
            <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium max-w-md text-lg md:text-xl mb-4 leading-relaxed">
              Découvrez la toute dernière pièce unique sortie de notre atelier et installée chez son propriétaire à <strong>{latestDelivery.location}</strong>.
            </p>

            {latestDelivery.clientReview && (
              <p className="text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] font-medium max-w-md text-base md:text-lg mb-10 italic">
                "{latestDelivery.clientReview}"
              </p>
            )}
            
            {!latestDelivery.clientReview && <div className="mb-6" />}
            
            <button
              onClick={() => setModalOpen(true)}
              className="group relative inline-flex items-center justify-center bg-[#2D5F8A] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#2D5F8A]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2D5F8A]/30"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Eye className="size-4" />
                Voir les détails
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D5F8A] via-[#4382BA] to-[#2D5F8A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>
        </div>

        {/* Visual / Frame Content */}
        <div 
          className="w-full relative h-[50vh] lg:h-[75vh] max-h-[800px] cursor-pointer group z-10 order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex items-center justify-center"
          onMouseEnter={() => setIsUnveiled(true)}
          onClick={() => setIsUnveiled(true)}
        >
          <div className="relative aspect-square w-full max-w-[420px] sm:max-w-[550px] lg:max-w-[650px] xl:max-w-[700px] mx-auto flex items-center justify-center mt-6 lg:mt-0">

            {/* The Rosette Container (Natural shape, transparent background) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100 }}
              className="absolute inset-0"
              style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.4))' }}
            >
              <img 
                src="/isolated-rosette-transparent.png" 
                alt="Cadre Rosace" 
                className="w-full h-full object-contain scale-105 transition-transform duration-[30s] group-hover:rotate-12"
              />
            </motion.div>

            {/* The actual photo inside the rosette (Normal blending) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative w-[75%] h-[75%] rounded-full overflow-hidden border-[4px] border-[#FDFBF7]/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] z-10"
            >
              {isVideo ? (
                <video
                  src={image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="absolute inset-0 object-cover w-full h-full transition-transform duration-[10s] group-hover:scale-110"
                />
              ) : (
                <Image
                  src={image}
                  alt={latestDelivery.title}
                  fill
                  className="absolute inset-0 object-cover transition-transform duration-[10s] group-hover:scale-110"
                />
              )}
              {/* Subtle glass reflection over the photo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            </motion.div>

            {/* Subtle floating badge (Normal blending) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100 }}
              className="absolute -bottom-4 right-0 md:-right-4 bg-white p-3 md:p-4 rounded-xl shadow-2xl border border-[#D9CEB8] flex items-center gap-3 z-30 transform group-hover:scale-105 transition-transform"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E8DCCB] flex items-center justify-center shadow-inner">
                <Truck className="size-4 md:size-5 text-[#C17D59]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-[#C17D59] mb-0.5 md:mb-1">Status</p>
                <p className="text-xs md:text-sm font-semibold text-[#3A2A1E]">Livré avec succès</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Product Details Modal (using the shared component, adapted slightly for Delivery) */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={{
          id: latestDelivery.id,
          name: latestDelivery.title,
          description: latestDelivery.description,
          dimensions: '',
          materials: '',
          color: '',
          price: null,
          availability: '',
          type: 'PIECE_UNIQUE',
          isFeatured: false,
          category: { id: 0, name: 'Livraison', type: 'LIVRAISON' },
          images: [{ id: 0, imageUrl: image, isPrimary: true }]
        } as Product}
      />
    </div>
  )
}
