'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi, Relooking } from '@/lib/api'
import { Sparkles, ArrowRightLeft, Mail, Phone, Hammer, MessageCircle, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'

import { formatImageUrl } from '@/lib/utils'

const DEMO_RELOOKINGS: Relooking[] = [
  {
    id: 6,
    title: "Banc Traditionnel Restauré en Blanc Patiné & Incrustations de Jelliz",
    category: "Mobilier d'Art",
    description: "Redonnez une seconde vie à votre intérieur avec ce banc artisanal en bois massif entièrement rénové. Sublimé par une finition blanc vieilli à effet patiné, il intègre des détails sculptés raffinés et des carreaux de zellige traditionnels.",
    imageAvantUrl: "/images/relooking/banc-avant.jpg",
    imageApresUrl: "/images/relooking/banc-apres.jpg",
    createdDate: "2026-09-27"
  },
  {
    id: 5,
    title: "Buffet Vaisselier Traditionnel Restauré – Bois Naturel & Finitions Vert Émeraude",
    category: "Mobilier d'Art",
    description: "Ce vaisselier en bois massif à deux corps a été entièrement remis en valeur avec un décapage soigné révélant les veines chaleureuses du bois brut.",
    imageAvantUrl: "/images/relooking/vaisselier-avant.jpg",
    imageApresUrl: "/images/relooking/vaisselier-apres.jpg",
    createdDate: "2026-09-27"
  }
]

function BeforeAfterItem({ item }: { item: Relooking }) {
  const [sliderPosition, setSliderPosition] = useState(50) // 0 to 100
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let percentage = (x / rect.width) * 100
    if (percentage < 0) percentage = 0
    if (percentage > 100) percentage = 100
    setSliderPosition(percentage)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  const apresSrc = formatImageUrl(item.imageApresUrl, '/images/relooking/banc-apres.jpg')
  const avantSrc = formatImageUrl(item.imageAvantUrl, '/images/relooking/banc-avant.jpg')

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center bg-[#3B271C]/90 rounded-3xl p-5 sm:p-7 md:p-8 border border-[#E6A635]/35 hover:border-[#E6A635]/75 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.65)] transition-all duration-300">
      {/* Draggable Slider Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={(e) => {
          setIsDragging(true)
          handleMove(e.clientX)
        }}
        onTouchStart={(e) => {
          setIsDragging(true)
          if (e.touches.length > 0) handleMove(e.touches[0].clientX)
        }}
        className="relative w-full lg:w-[50%] aspect-[16/10] rounded-2xl overflow-hidden shadow-xl select-none cursor-ew-resize border border-[#E6A635]/30 shrink-0 bg-[#241812]"
      >
        {/* Base Layer: Après Image */}
        <div className="absolute inset-0">
          <img
            src={apresSrc}
            alt={`Après : ${item.title}`}
            className="absolute inset-0 w-full h-full object-cover block pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1'
                target.src = '/images/relooking/banc-apres.jpg'
              }
            }}
          />
          <div className="absolute top-3.5 right-3.5 bg-[#241812]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#F2BD52] border border-[#E6A635]/40 pointer-events-none shadow-md z-10">
            Après
          </div>
        </div>

        {/* Clipped Top Layer: Avant Image */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
        >
          <img
            src={avantSrc}
            alt={`Avant : ${item.title}`}
            className="absolute inset-0 w-full h-full object-cover block pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1'
                target.src = '/images/relooking/banc-avant.jpg'
              }
            }}
          />
          <div className="absolute top-3.5 left-3.5 bg-[#1A110B]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#EAE4D9] border border-white/20 pointer-events-none shadow-md z-10">
            Avant
          </div>
        </div>

        {/* Vertical Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#E6A635] shadow-[0_0_10px_#E6A635] pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 rounded-full bg-[#E6A635] text-[#1A110B] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 border-white pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
            <ArrowRightLeft className="size-4" />
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex flex-col justify-between items-start text-left flex-1 w-full">
        <div>
          {item.category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/35 text-[#F2BD52] text-[10px] font-bold uppercase tracking-widest mb-2.5">
              <Hammer className="size-3" />
              <span>{item.category}</span>
            </div>
          )}

          <h3 className="font-heading text-xl sm:text-2xl md:text-3xl text-[#F7F4EE] leading-tight mb-2.5">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm font-light leading-relaxed text-[#EAE4D9]/90 mb-6">
            {item.description}
          </p>
        </div>

        {/* Action Link to Quote */}
        <div className="w-full pt-4 border-t border-[#E6A635]/25 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-[#EAE4D9]/75 font-light">
            Vous avez un meuble similaire à restaurer ?
          </span>

          <Link
            href="/contact"
            className="btn-sheen inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all"
          >
            <span>Restaurer mon meuble</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RelookingPage() {
  const [items, setItems] = useState<Relooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.getRelookings()
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error("Erreur de chargement des relookings", err)
        setItems([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const validDbItems = items.filter(i => (i.imageAvantUrl && i.imageAvantUrl.trim() !== '') || (i.imageApresUrl && i.imageApresUrl.trim() !== ''))
  const displayItems = validDbItems.length > 0 ? validDbItems : DEMO_RELOOKINGS

  return (
    <main className="relative w-full min-h-screen flex flex-col text-[#F7F4EE] overflow-x-hidden bg-[#241812]">
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-relooking.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      {/* Voile d'ombrage plat et uniforme */}
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        <Navbar />
        
        {/* Header Section */}
        <section className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 pb-10">
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center">
            <div className="mb-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] uppercase tracking-[0.2em] mb-3 font-bold shadow-md">
                <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
                <span>Restauration &amp; Relooking d&apos;Art</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                Seconde Vie pour Vos Meubles de Famille
              </h1>
              <p className="text-[#EAE4D9]/90 text-xs sm:text-sm md:text-base leading-relaxed font-light drop-shadow-md">
                À l&apos;Atelier Aschi, nous croyons que chaque meuble ancien possède une âme. Nos ébénistes et sculpteurs restaurent, relaquent et subliment vos pièces de famille pour les adapter aux intérieurs contemporains les plus raffinés.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 pb-20">
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="text-center py-16 text-[#F2BD52] animate-pulse">
                  Chargement de nos restaurations...
                </div>
              ) : (
                displayItems.map(item => (
                  <Reveal key={item.id}>
                    <BeforeAfterItem item={item} />
                  </Reveal>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
