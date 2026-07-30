'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Truck, Eye, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { publicApi, Delivery } from '@/lib/api'
import { BohoRosace } from './boho-decor'
import { ProductModal } from './product-modal'

export function HeroDelivery() {
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
    <div className="relative h-full min-h-[700px] w-full overflow-hidden flex items-center font-sans border-b border-[#D9CEB8]">
      {/* Intricate Bohemian Motifs */}
      <BohoRosace className="absolute top-[10%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] pointer-events-none" delay={0.2} />

      <div className="relative z-10 h-full w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-y-0 lg:gap-x-20 pt-24 pb-10 items-center">
        
        {/* Title and Intro Text */}
        <div className="w-full flex flex-col justify-end order-1 lg:col-start-1 lg:row-start-1 lg:pb-8 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D9CEB8] text-[#C17D59] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <Truck className="size-4 animate-bounce" />
              Nouvelle Livraison Client
            </div>
            
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#3A2A1E] mb-6 leading-tight">
              Directement<br/>chez nos clients
            </h2>
            
            <p className="text-[#5A453A] font-light max-w-md text-base md:text-lg leading-relaxed mb-4 lg:mb-0">
              Découvrez la toute dernière pièce unique tout juste sortie de notre atelier et installée chez son propriétaire.
            </p>
          </motion.div>
        </div>

        {/* Details Card */}
        <div className="w-full flex flex-col justify-start order-3 lg:col-start-1 lg:row-start-2 z-30 mt-6 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-[#D9CEB8] shadow-lg max-w-sm md:max-w-md mx-auto lg:mx-0">
              <h3 className="font-heading text-lg md:text-2xl text-[#3A2A1E] mb-3 md:mb-4">{latestDelivery.title}</h3>
              
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#7A6250]">
                  <MapPin className="size-4 text-[#C17D59]"/> {latestDelivery.location}
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#7A6250]">
                  <Calendar className="size-4 text-[#C17D59]"/> {new Date(latestDelivery.deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {latestDelivery.clientReview && (
                  <div className="mt-2 pt-2 md:mt-3 md:pt-3 border-t border-[#D9CEB8]/50">
                    <div className="flex text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-current" />)}
                    </div>
                    <p className="text-xs text-[#5A453A] italic">"{latestDelivery.clientReview}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto bg-[#3A7D50] hover:bg-[#2D6A40] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-[#3A7D50]/50 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Eye className="size-4" /> Voir les détails
                  </span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                </button>
                <Link
                  href="#livraison-semaine"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-[#3A7D50] text-[#3A7D50] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#3A7D50] hover:text-white transition-all text-center relative overflow-hidden group"
                >
                  <span className="relative z-10">Autres livraisons</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual / Frame Content */}
        <div 
          className="w-full relative h-[40vh] lg:h-[65vh] max-h-[700px] cursor-pointer group z-10 order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2"
          onMouseEnter={() => setIsUnveiled(true)}
          onClick={() => setIsUnveiled(true)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full relative"
          >
            {/* Arched Frame */}
            <div className="absolute inset-0 rounded-t-full rounded-b-[40px] overflow-hidden border-[12px] border-white shadow-2xl bg-[#3A2A1E]">
              {isVideo ? (
                <video
                  src={image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="absolute inset-0 object-cover w-full h-full opacity-90 transition-transform duration-[20s] hover:scale-110 z-0"
                />
              ) : (
                <Image
                  src={image}
                  alt={latestDelivery.title}
                  fill
                  className="absolute inset-0 object-cover transition-transform duration-[20s] hover:scale-110 z-0"
                />
              )}

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            </div>

            {/* Subtle floating badge */}
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-4 rounded-xl shadow-xl border border-[#D9CEB8] flex items-center gap-3 z-30">
              <div className="w-10 h-10 rounded-full bg-[#E8DCCB] flex items-center justify-center">
                <Truck className="size-5 text-[#C17D59]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#C17D59] mb-1">Status</p>
                <p className="text-sm font-semibold text-[#3A2A1E]">Livré avec succès</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Product Details Modal (using the shared component, adapted slightly for Delivery) */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={{
          id: latestDelivery.id.toString(),
          name: latestDelivery.title,
          description: latestDelivery.description,
          price: 0, // Not applicable
          stock_quantity: 0,
          category: { name: 'Livraison' },
          image_url: image
        }}
      />
    </div>
  )
}
