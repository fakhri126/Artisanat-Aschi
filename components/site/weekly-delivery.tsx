'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/motion/fade-in'
import { publicApi, Delivery } from '@/lib/api'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'
import { Truck, MapPin, Calendar } from 'lucide-react'
import Image from 'next/image'
import { BohoCeramicPattern, BohoGoldenLattice, BohoRosace, BohoDoorPanel } from './boho-decor'

export function WeeklyDelivery() {
  const { color: titleColor, isMounted: isHeroColorMounted } = useRandomHeroColor()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Données de secours si l'API est vide ou hors ligne
  const fallbackDeliveries: Delivery[] = [
    {
      id: 1,
      title: "Chambre à coucher - Bois de Noyer",
      description: "Installation complète d'une suite parentale avec tête de lit sculptée, tables de chevet et commode.",
      imageUrl: "/placeholder.jpg",
      deliveryDate: new Date().toISOString()
    },
    {
      id: 2,
      title: "Salon Marocain - Sur Mesure",
      description: "Livraison d'un salon complet avec boiserie artisanale et tissus haut de gamme pour une villa à Carthage.",
      imageUrl: "/placeholder.jpg",
      deliveryDate: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
    }
  ]

  useEffect(() => {
    setIsMounted(true)
    publicApi.getDeliveries()
      .then(data => {
        if (data && data.length > 0) {
          // Sort by highest ID (newest added)
          const sorted = data.sort((a, b) => b.id - a.id)
          setDeliveries(sorted)
        } else {
          setDeliveries(fallbackDeliveries)
        }
      })
      .catch((error) => {
        console.error("Failed to fetch deliveries, using fallback:", error)
        setDeliveries(fallbackDeliveries)
      })
  }, [])

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (deliveries.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deliveries.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [deliveries.length])

  if (!isMounted || deliveries.length === 0) return null

  const currentDelivery = deliveries[currentIndex]
  const isVideo = currentDelivery?.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i)

  return (
    <section id="livraison" className="relative w-full overflow-hidden bg-transparent py-16 md:py-24">
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
        <FadeIn className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-[#EDE6D6] text-[#8B5E3C] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4 md:mb-6 border border-[#D4B896]/50 shadow-sm">
            <Truck className="size-3 md:size-4 animate-pulse" />
            Directement chez vous
          </div>
          <h2 
            className="font-heading text-2xl md:text-4xl lg:text-5xl drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] font-light tracking-tight mb-4 md:mb-6 transition-colors duration-1000"
            style={{ color: isHeroColorMounted ? titleColor : '#6B8E23' }}
          >
            L'Élégance Livrée Chez Vous
          </h2>
          <p className="text-white font-medium drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] max-w-2xl mx-auto text-sm md:text-lg px-2">
            Découvrez nos dernières créations tout juste sorties de l'atelier et installées dans leurs nouvelles demeures d'exception.
          </p>
        </FadeIn>

        <div className="relative min-h-[400px] md:min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col md:flex-row items-center gap-8 lg:gap-24"
            >
              
              {/* Visual */}
              <div 
                className="w-full md:w-5/12 lg:w-2/5 relative group px-4 md:px-8 mx-auto"
              >
                <div className="relative aspect-[4/5] lg:aspect-[3/4] w-full max-w-[380px] mx-auto rounded-t-full rounded-b-2xl overflow-hidden shadow-[0_10px_30px_rgba(58,42,30,0.15)] border-[6px] border-white bg-[#3A2A1E]">
                  {isVideo ? (
                    <video
                      src={currentDelivery.imageUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105 z-0"
                    />
                  ) : (
                    <Image
                      src={currentDelivery.imageUrl || '/placeholder.jpg'}
                      alt={currentDelivery.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
                    />
                  )}
                  
                  {/* Subtle inner gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A2A1E]/40 via-transparent to-transparent pointer-events-none z-0" />
                </div>
                
                {/* Floating Date Badge */}
                <div className="absolute -bottom-4 right-0 md:top-8 md:-right-6 md:bottom-auto bg-[#F7F3EC] p-2.5 md:p-4 rounded-xl shadow-xl border border-[#D9CEB8] flex flex-col items-center justify-center min-w-[70px] md:min-w-[100px] z-10">
                  <span className="text-[#8B5E3C] text-[8px] md:text-[10px] uppercase tracking-widest mb-0.5 md:mb-1 font-bold">Date</span>
                  <span className="font-heading text-base md:text-xl text-[#3A2A1E]">
                    {new Date(currentDelivery.deliveryDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="w-full md:w-7/12 lg:w-3/5 py-4 md:py-6 px-4 md:px-8">
                <h3 className="font-heading text-xl md:text-3xl lg:text-4xl text-[#6B8E23] drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] mb-3 md:mb-6 leading-tight">
                  {currentDelivery.title}
                </h3>
                
                <div className="w-8 md:w-12 h-1 bg-[#FDFBF7] shadow-[0_1px_2px_rgba(26,17,11,0.8)] mb-4 md:mb-8 rounded-full" />
                
                <p className="text-white font-medium drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8 line-clamp-4">
                  {currentDelivery.description}
                </p>

                <div className="flex flex-col gap-3 md:gap-5 text-[#5A453A] text-xs md:text-sm font-medium tracking-wide bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-[#D9CEB8]">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="size-8 md:size-10 rounded-full bg-[#EDE6D6] flex items-center justify-center shrink-0">
                      <MapPin className="size-4 md:size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-[#8B5E3C] font-bold">Lieu d'installation</p>
                      <p className="text-[#3A2A1E] text-sm md:text-base">{currentDelivery.location || "Livraison VIP - Installation sur mesure"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="size-8 md:size-10 rounded-full bg-[#EDE6D6] flex items-center justify-center shrink-0">
                      <Calendar className="size-4 md:size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-[#8B5E3C] font-bold">Date d'achèvement</p>
                      <p className="text-[#3A2A1E] text-sm md:text-base">{new Date(currentDelivery.deliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Slideshow Pagination Dots */}
          <div className="flex justify-center mt-10 md:mt-16 gap-2 md:gap-3">
            {deliveries.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all duration-500 ease-out rounded-full ${
                  i === currentIndex 
                    ? 'w-6 md:w-10 h-1.5 md:h-2.5 bg-[#C17D59]' 
                    : 'w-1.5 md:w-2.5 h-1.5 md:h-2.5 bg-[#D9CEB8] hover:bg-[#C17D59]/50'
                }`}
                aria-label={`Aller à la livraison ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
