'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi, Relooking } from '@/lib/api'
import { Sparkles, ArrowRightLeft, Mail, Phone, Calendar, Hammer, Heart } from 'lucide-react'
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

        {/* AFTER image (Overlay with clip-path, dynamically revealed from the right) */}
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
      <div className="flex flex-col justify-between items-start text-left flex-1 py-1">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-white font-bold bg-[#C17D59] px-3 py-1 rounded-full shadow-sm border border-[#C17D59]/50">
            {item.category || 'Général'}
          </span>
          
          <h3 className="font-heading text-2xl sm:text-3xl text-white font-medium">
            {item.title}
          </h3>
          
          <p className="text-sm font-light leading-relaxed text-[#3A2A21]/70 text-pretty">
            {item.description}
          </p>
        </div>

      </div>
    </div>
  )
}

export default function RelookingPage() {
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState<Relooking[]>([])
  const [categories, setCategories] = useState<{id: string, label: string}[]>([{ id: 'all', label: 'Tous les projets' }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelookings() {
      try {
        setLoading(true)
        const data = await publicApi.getRelookings()
        setItems(data || [])
        
        // Extract unique categories
        const uniqueCats = new Set<string>()
        data?.forEach((item: Relooking) => {
          if (item.category) {
            uniqueCats.add(item.category)
          }
        })
        
        const catArray = Array.from(uniqueCats).map(cat => ({
          id: cat,
          label: cat
        }))
        
        setCategories([{ id: 'all', label: 'Tous les projets' }, ...catArray])
      } catch (err) {
        console.error("Failed to load relookings", err)
      } finally {
        setLoading(false)
      }
    }
    loadRelookings()
  }, [])

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter)

  return (
    <main className="min-h-screen flex flex-col  text-[#3A2A21]">
      <Navbar />
      
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/25 text-[#C17D59] text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="size-3.5" /> Restauration d&apos;Art
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Relooking &amp; Restauration
          </h1>
          <p className="text-[#3A2A21]/70 text-base sm:text-lg leading-relaxed text-pretty font-light">
            À l&apos;Atelier Aschi, nous croyons que chaque meuble ancien possède une âme. Nos ébénistes et sculpteurs restaurent, relaquent et subliment vos pièces de famille pour les adapter aux intérieurs contemporains les plus raffinés.
          </p>
        </div>

        {/* Filter Bar */}
        <Reveal delay={100} className="w-full flex justify-center mb-12 overflow-x-auto pb-3 scrollbar-thin">
          <div className="flex gap-2 p-1.5 rounded-full bg-stone-950/40 border border-[#E8DCCB]/15 backdrop-blur-sm shrink-0">
            {categories.map((cat) => {
              const isActive = filter === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#E8DCCB] text-walnut shadow-md'
                      : 'text-[#3A2A21]/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* Before/After list */}
        <div className="w-full flex flex-col gap-12 mb-20">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-[#3A2A21]/50"
              >
                Chargement des projets...
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-[#3A2A21]/50"
              >
                Aucun projet de restauration trouvé pour cette catégorie.
              </motion.div>
            ) : (
              <div className="flex flex-col gap-10">
                {filteredItems.map((item) => (
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

        {/* Contact CTA Section */}
        <Reveal delay={200} className="w-full">
          <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-[#E8DCCB]/25 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Design accents */}
            <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-[#E8DCCB]/5 blur-[120px] pointer-events-none" />
            <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-[#E8DCCB]/5 blur-[120px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/20 text-[#C17D59] text-xs uppercase tracking-[0.2em] mb-6">
              <Hammer className="size-3.5" /> Donner vie à vos objets
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 max-w-2xl leading-tight">
              Faites restaurer votre pièce de famille
            </h2>
            
            <p className="text-[#3A2A21]/60 text-sm max-w-xl mb-8 leading-relaxed font-light text-pretty">
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
      
      <Footer />
    </main>
  )
}
