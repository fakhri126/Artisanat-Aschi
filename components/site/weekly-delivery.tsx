'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './reveal'
import { publicApi, Delivery } from '@/lib/api'
import { Truck, MapPin, Calendar, ChevronLeft, ChevronRight, ShieldCheck, Star } from 'lucide-react'
import Image from 'next/image'

export function WeeklyDelivery() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const fallbackDeliveries: Delivery[] = [
    {
      id: 1,
      title: "Suite Parentale — Noyer Massif Sculpté",
      description: "Installation complète d'une suite de prestige comprenant une tête de lit monumentale ciselée à la main aux motifs andalous, tables de chevet marquetées et console d'entrée en noyer noble.",
      imageUrl: "/placeholder.jpg",
      location: "Villa Privée — Gammarth",
      deliveryDate: new Date().toISOString(),
      clientReview: "Un travail d'orfèvre d'une qualité exceptionnelle. Les finitions en noyer massif et les patines artisanales sont sublimes."
    },
    {
      id: 2,
      title: "Salon d'Apparat & Boiserie Andalouse",
      description: "Aménagement complet sur-mesure avec boiserie murale ciselée, portes intérieures à claustra traditionnel et finitions en laiton vieilli pour une demeure de maître.",
      imageUrl: "/placeholder.jpg",
      location: "Résidence de Prestige — Carthage",
      deliveryDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      clientReview: "Ponctualité exemplaire et installation soignée dans les moindres détails par les maîtres de l'atelier."
    }
  ]

  useEffect(() => {
    setIsMounted(true)
    publicApi.getDeliveries()
      .then(data => {
        if (data && data.length > 0) {
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

  useEffect(() => {
    if (deliveries.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deliveries.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [deliveries.length, isPaused])

  if (!isMounted || deliveries.length === 0) return null

  const currentDelivery = deliveries[currentIndex]
  const isVideo = currentDelivery?.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i)

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? deliveries.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % deliveries.length)
  }

  return (
    <section id="livraison" className="relative w-full overflow-hidden bg-transparent py-10 sm:py-14 lg:py-18 border-none">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE (Harmonisé & Centré)                                */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.18em] mb-2.5 sm:mb-3 shadow-md">
              <Truck className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Installations &amp; Demeures Privées</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-light text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2">
              L&apos;Élégance du Noyer <br className="hidden sm:inline" />
              <span className="font-serif italic text-white font-normal text-xl sm:text-2xl md:text-4xl block sm:inline mt-0.5 sm:mt-0">
                Installée Chez Vous
              </span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed px-1">
              Chaque semaine, nos maîtres ébénistes livrent et installent des pièces uniques façonnées sur-mesure dans les plus belles résidences de Tunisie.
            </p>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. CARROUSEL COMPACT & PRESTIGIEUX (Avec Pause au Survol)                 */}
        {/* ========================================================================= */}
        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center bg-[#3B271C]/90 backdrop-blur-2xl border-2 border-[#E6A635]/45 p-5 sm:p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
            >
              
              {/* Left Column (5 Cols): Arched Showcase Photo */}
              <div className="lg:col-span-5 relative w-full flex justify-center">
                <div className="relative w-full max-w-[320px] sm:max-w-[360px] h-[260px] sm:h-[320px] rounded-t-full rounded-b-3xl overflow-hidden border-[4px] sm:border-[5px] border-[#E6A635]/60 shadow-[0_15px_40px_rgba(0,0,0,0.9)] bg-[#241812] group">
                  {isVideo ? (
                    <video
                      src={currentDelivery.imageUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="object-cover w-full h-full transition-transform duration-[10s] group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={currentDelivery.imageUrl || '/placeholder.jpg'}
                      alt={currentDelivery.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                      className="object-cover transition-transform duration-[10s] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Floating Date Badge */}
                  <div className="absolute bottom-3 left-3 z-20 bg-[#3B271C]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#E6A635]/40 flex items-center gap-1.5 text-xs text-[#F2BD52] font-semibold shadow-lg">
                    <Calendar className="size-3 text-[#E6A635]" />
                    <span>{new Date(currentDelivery.deliveryDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Content Details */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                
                {/* Verified Delivery Status */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/45 text-emerald-300 text-[10px] font-bold tracking-wider mb-2.5 w-fit shadow-sm">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  <span>Livré &amp; Installé avec Succès</span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl text-white drop-shadow mb-2 leading-tight">
                  {currentDelivery.title}
                </h3>
                
                <div className="w-10 h-0.5 bg-gradient-to-r from-[#E6A635] via-[#F2BD52] to-transparent mb-3" />
                
                {/* Description */}
                <p className="text-white drop-shadow font-normal text-xs sm:text-sm leading-relaxed mb-4">
                  {currentDelivery.description}
                </p>

                {/* Location & Guarantee Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#241812]/90 backdrop-blur-xl p-3 rounded-2xl border border-[#E6A635]/35 shadow-sm mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-[#3B271C] border border-[#E6A635]/40 flex items-center justify-center shrink-0">
                      <MapPin className="size-3.5 text-[#F2BD52]" />
                    </div>
                    <div>
                      <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold">Lieu d&apos;Installation</p>
                      <p className="text-white text-xs font-medium">{currentDelivery.location || "Villa Privée — Tunisie"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-[#3B271C] border border-[#E6A635]/40 flex items-center justify-center shrink-0">
                      <Truck className="size-3.5 text-[#F2BD52]" />
                    </div>
                    <div>
                      <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold">Service Aschi</p>
                      <p className="text-white text-xs font-medium">Pose &amp; Montage Clé en Main</p>
                    </div>
                  </div>
                </div>

                {/* Client Review Quote */}
                {currentDelivery.clientReview && (
                  <div className="bg-[#241812]/80 border-l-2 border-[#E6A635] p-3 rounded-r-2xl">
                    <div className="flex items-center gap-1 mb-1 text-[#F2BD52]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-current" />
                      ))}
                      <span className="text-[9px] text-white/80 ml-1 font-semibold uppercase tracking-wider">Avis Client Vérifié</span>
                    </div>
                    <p className="italic text-xs text-white leading-relaxed">
                      « {currentDelivery.clientReview} »
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Carousel Controls: Prev / Next Buttons & Glowing Dots */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            {deliveries.length > 1 && (
              <button
                onClick={prevSlide}
                className="size-9 sm:size-10 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] transition-all cursor-pointer shadow-md"
                aria-label="Livraison précédente"
              >
                <ChevronLeft className="size-4 sm:size-5" />
              </button>
            )}

            <div className="flex items-center gap-2">
              {deliveries.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    i === currentIndex
                      ? 'w-7 sm:w-8 h-1.5 sm:h-2 bg-[#E6A635] shadow-[0_0_10px_#E6A635]'
                      : 'w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {deliveries.length > 1 && (
              <button
                onClick={nextSlide}
                className="size-9 sm:size-10 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] transition-all cursor-pointer shadow-md"
                aria-label="Livraison suivante"
              >
                <ChevronRight className="size-4 sm:size-5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
