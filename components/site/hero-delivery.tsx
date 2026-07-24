'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi, Delivery } from '@/lib/api'
import { Truck, PackageOpen, MapPin, Calendar, Star, X } from 'lucide-react'
import Link from 'next/link'

export function HeroDelivery() {
  const [latestDelivery, setLatestDelivery] = useState<Delivery | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isUnveiled, setIsUnveiled] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    publicApi.getDeliveries()
      .then(deliveries => {
        if (deliveries && deliveries.length > 0) {
          // Assuming the last one is the latest or they are sorted by date
          // If not sorted, we can just take the last element or sort them here
          const sorted = deliveries.sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())
          setLatestDelivery(sorted[0])
        }
      })
      .catch(console.error)
  }, [])

  // Auto-unveil after a few seconds if the user doesn't hover
  useEffect(() => {
    if (!latestDelivery) return
    const timer = setTimeout(() => {
      setIsUnveiled(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [latestDelivery])

  if (!isMounted || !latestDelivery) return null

  const image = latestDelivery.imageUrl || '/hero-bg.jpg'

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-950 flex items-center justify-center font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 w-full h-full">
        {image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
          <video
            src={image}
            muted
            autoPlay
            loop
            playsInline
            className="object-cover w-full h-full opacity-20 scale-110 blur-xl"
          />
        ) : (
          <Image
            src={image}
            alt={latestDelivery.title}
            fill
            priority
            className="object-cover opacity-20 scale-110 blur-xl"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950" />
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Title / Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-6 md:mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <Truck className="size-4 animate-bounce" />
            Nouvelle Livraison Client
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-white drop-shadow-lg mb-4">
            Directement chez nos clients
          </h2>
          <p className="text-stone-300 font-light max-w-xl mx-auto text-sm md:text-base">
            Découvrez la toute dernière pièce unique tout juste sortie de notre atelier et installée chez son propriétaire.
          </p>
        </motion.div>

        {/* The "Box" / Unveiling area */}
        <div 
          className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[21/9] perspective-1000 cursor-pointer group"
          onMouseEnter={() => setIsUnveiled(true)}
          onClick={() => setModalOpen(true)}
        >
          {/* Unveiled Content (The Product) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isUnveiled ? 1 : 0.9, opacity: isUnveiled ? 1 : 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-2xl overflow-hidden border border-gold/40 shadow-[0_0_80px_rgba(212,175,55,0.4)]"
          >
            {image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video
                src={image}
                muted
                autoPlay
                loop
                playsInline
                className="object-cover w-full h-full transition-transform duration-[15s] ease-out group-hover:scale-110"
              />
            ) : (
              <Image
                src={image}
                alt={latestDelivery.title}
                fill
                className="object-cover transition-transform duration-[15s] ease-out group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            
            {/* Delivery Details */}
            <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isUnveiled ? 1 : 0, x: isUnveiled ? 0 : -20 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <h3 className="font-heading text-3xl md:text-4xl text-ivory mb-3 leading-tight">
                  {latestDelivery.title}
                </h3>
                <p className="text-ivory/80 text-sm md:text-base font-light mb-6 line-clamp-3 text-pretty">
                  {latestDelivery.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-gold uppercase">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {new Date(latestDelivery.deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                  <span className="flex items-center gap-1.5">
                    <Star className="size-4" />
                    Pièce Unique
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* The Wrapper / Curtains (Left) */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isUnveiled ? '-100%' : 0 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 bg-stone-900 border-r-2 border-gold/50 shadow-[20px_0_50px_rgba(0,0,0,0.8)] origin-left flex items-center justify-end overflow-hidden z-20"
          >
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
            <div className="w-16 h-full flex flex-col justify-center items-center opacity-50 relative z-10">
              <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-gold to-transparent glow-gold" />
            </div>
          </motion.div>

          {/* The Wrapper / Curtains (Right) */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isUnveiled ? '100%' : 0 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 bg-stone-900 border-l-2 border-gold/50 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] origin-right flex items-center justify-start overflow-hidden z-20"
          >
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
            
            {/* Ribbon / Unbox CTA */}
            <AnimatePresence>
              {!isUnveiled && (
                <motion.div 
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ duration: 0.8 }}
                  className="absolute -left-16 flex flex-col items-center gap-4 z-30 pointer-events-none"
                >
                  <div className="relative size-32 rounded-full bg-gold/10 border-2 border-gold/40 backdrop-blur-md flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(212,175,55,0.4)]">
                    <PackageOpen className="size-10 text-gold drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <span className="text-gold text-xs uppercase tracking-[0.4em] font-bold drop-shadow-md">
                    Dévoiler
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-16 h-full flex flex-col justify-center items-center opacity-50 relative z-10">
              <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-gold to-transparent glow-gold" />
            </div>
          </motion.div>

          {/* Magical Dust Particles on unveil */}
          <AnimatePresence>
            {isUnveiled && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 pointer-events-none z-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen"
               />
            )}
          </AnimatePresence>

        </div>
        
        {/* Call to action at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isUnveiled ? 1 : 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 md:mt-12"
        >
          <Link
            href="/contact?subject=Commande%20sur%20mesure"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase text-white/70 hover:text-gold transition-colors relative group"
          >
            Commandez votre chef-d'œuvre
            <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
          </Link>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl h-[90vh] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-stone-800"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-colors"
              >
                <X className="size-6" />
              </button>

              <div className="w-full md:w-2/3 h-1/2 md:h-full bg-stone-900 relative">
                {image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={image}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={image}
                    alt={latestDelivery.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="w-full md:w-1/3 p-8 flex flex-col justify-center bg-stone-950 border-t md:border-t-0 md:border-l border-stone-800 overflow-y-auto">
                <span className="text-xs uppercase tracking-[0.2em] text-gold mb-2 block font-semibold">
                  Installation Client Récente
                </span>
                <h2 className="font-heading text-3xl text-white mb-6">
                  {latestDelivery.title}
                </h2>
                <p className="text-stone-400 font-light leading-relaxed mb-6">
                  {latestDelivery.description}
                </p>
                <div className="flex flex-col gap-3 text-xs font-semibold tracking-wider text-gold uppercase mt-6 pt-6 border-t border-stone-800">
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    Date : {new Date(latestDelivery.deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="size-4" />
                    Pièce Unique Artisanat Aschi
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
