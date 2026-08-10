'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi, Relooking } from '@/lib/api'
import { Sparkles, ArrowRightLeft, Mail, Phone, Hammer } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'

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

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-stone-950/20 rounded-3xl p-6 md:p-8 border border-[#E8DCCB]/10 hover:border-[#E8DCCB]/20 transition-all duration-300">
      {/* Draggable Slider Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full lg:w-[50%] aspect-[16/10] rounded-2xl overflow-hidden shadow-xl select-none cursor-ew-resize border border-[#E8DCCB]/15 shrink-0"
      >
        {/* BEFORE image (Left/Background) */}
        <Image
          src={item.imageAvantUrl || '/relooking-before.jpg'}
          alt={`${item.title} - Avant`}
          fill
          className="object-cover animate-fade-in"
          priority
        />
        
        <div className="absolute top-3 left-3 z-20 bg-stone-900/80 backdrop-blur-md border border-red-500/25 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-red-400">
          Avant
        </div>

        {/* AFTER image */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
          }}
        >
          <Image
            src={item.imageApresUrl || '/relooking-after.jpg'}
            alt={`${item.title} - Après`}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="absolute top-3 right-3 z-20 bg-stone-900/80 backdrop-blur-md border border-[#E8DCCB]/35 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#C17D59]">
          Après
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 z-30 w-[2.5px] bg-[#E8DCCB] cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#E8DCCB] text-walnut shadow-lg border-2 border-walnut flex items-center justify-center">
            <ArrowRightLeft className="size-3.5 text-walnut" />
          </div>
        </div>
      </div>

      {/* Description Area */}
      <div className="flex flex-col justify-center items-start text-left flex-1 py-1">
        <div className="space-y-4">
          {item.category && (
            <span className="text-[10px] uppercase tracking-widest text-white font-bold bg-[#C17D59] px-3 py-1 rounded-full shadow-sm border border-[#C17D59]/50">
              {item.category}
            </span>
          )}
          
          <h3 className="font-heading text-2xl sm:text-3xl text-white font-medium">
            {item.title}
          </h3>
          
          <p className="text-sm font-light leading-relaxed text-[#D4B896] text-pretty">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

const BackgroundOverlay = () => (
  <>
    <div className="absolute inset-0 z-0 opacity-80 brightness-75 pointer-events-none bg-[url('/images/bg-relooking.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
    <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />
  </>
);

const STATIC_RELOOKINGS: Relooking[] = [
  {
    id: 1,
    title: "Restauration & Patine d'Art sur Noyer Massif",
    description: "Restauration complète d'un buffet d'époque : ponçage artisanal à la main, traitement conservateur du bois noble, application d'une patine dorée et restauration des gravures traditionnelles.",
    imageAvantUrl: "/relooking-before.jpg",
    imageApresUrl: "/relooking-after.jpg",
    createdDate: new Date().toISOString()
  },
  {
    id: 2,
    title: "Mise en Teinte & Relooking d'une Armoire d'Apparat",
    description: "Modernisation d'une pièce sculptée ancienne : rénovation de la structure en bois massif, égalisation du grain et application d'une finition ivoire patinée pour une parfaite harmonie dans un intérieur contemporain.",
    imageAvantUrl: "/mirror-before.jpg",
    imageApresUrl: "/mirror-after.jpg",
    createdDate: new Date().toISOString()
  }
]

export default function RelookingPage() {
  const [items, setItems] = useState<Relooking[]>(STATIC_RELOOKINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.getRelookings()
      .then(data => {
        if (data && data.length > 0) {
          setItems(data)
        }
      })
      .catch(err => {
        console.error("Erreur de chargement des relookings, utilisation des données statiques", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen flex flex-col text-[#E8DCCB] overflow-x-hidden bg-[#1A1512]">
      <Navbar />
      
      {/* Header Section */}
      <section className="relative w-full flex flex-col items-center justify-center px-6 pt-32 pb-16">
        <BackgroundOverlay />
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/25 text-[#C17D59] text-xs uppercase tracking-[0.2em] mb-4">
              <Sparkles className="size-3.5" /> Restauration d&apos;Art
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
              Relooking &amp; Restauration
            </h1>
            <p className="text-[#D4B896] text-base sm:text-lg leading-relaxed text-pretty font-light">
              À l&apos;Atelier Aschi, nous croyons que chaque meuble ancien possède une âme. Nos ébénistes et sculpteurs restaurent, relaquent et subliment vos pièces de famille pour les adapter aux intérieurs contemporains les plus raffinés.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="relative w-full flex flex-col items-center justify-center px-6 py-16 border-t border-[#E8DCCB]/10">
        <BackgroundOverlay />
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-12">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-[#D4B896]/70 animate-pulse"
              >
                Chargement de nos restaurations...
              </motion.div>
            ) : items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-[#D4B896]/70"
              >
                Aucun projet de restauration trouvé.
              </motion.div>
            ) : (
              <div className="flex flex-col gap-10">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <BeforeAfterItem item={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative w-full flex flex-col items-center justify-center px-6 py-24 border-t border-[#E8DCCB]/10">
        <BackgroundOverlay />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <Reveal delay={200} className="w-full">
            <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-[#E8DCCB]/25 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
              <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-[#E8DCCB]/5 blur-[120px] pointer-events-none" />
              <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-[#E8DCCB]/5 blur-[120px] pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/20 text-[#C17D59] text-xs uppercase tracking-[0.2em] mb-6">
                <Hammer className="size-3.5" /> Donner vie à vos objets
              </div>
              
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 max-w-2xl leading-tight">
                Faites restaurer votre pièce de famille
              </h2>
              
              <p className="text-[#D4B896] text-sm max-w-xl mb-8 leading-relaxed font-light text-pretty">
                Qu&apos;il s&apos;agisse de restaurer à l&apos;identique ou de relooker pour intégrer dans un décor moderne, nos artisans étudient vos pièces sur photo ou en atelier.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/contact?subject=relooking"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#E8DCCB] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
                >
                  <Mail className="size-3.5" />
                  Demander une étude
                </Link>
                
                <a
                  href="tel:+21655743760"
                  className="inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-white/10"
                >
                  <Phone className="size-3.5 text-[#C17D59]" />
                  +216 55 743 760
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      
      <section className="relative w-full">
        <BackgroundOverlay />
        <div className="relative z-10 w-full">
          <Footer />
        </div>
      </section>
    </main>
  )
}
