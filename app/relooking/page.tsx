'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRightLeft, Mail, Phone, Calendar, Hammer, Heart } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'

const FILTER_CATEGORIES = [
  { id: 'all', label: 'Tous les projets' },
  { id: 'mobilier', label: 'Mobilier d\'Art' },
  { id: 'miroir', label: 'Miroirs & Cadres' },
  { id: 'porte', label: 'Portes & Sculptures' }
]

const ITEMS = [
  {
    id: 1,
    title: 'Commode de Style Louis XVI',
    category: 'mobilier',
    description: 'Restauration complète d\'une commode en placage de noyer desséchée. Décapage de l\'ancien vernis craquelé, comblement des fentes, traitement curatif du bois et application d\'un vernis au tampon traditionnel pour raviver les contrastes naturels du veinage.',
    beforeImage: '/relooking-before.jpg',
    afterImage: '/relooking-after.jpg',
    steps: ['Décapage & Nettoyage', 'Traitement fongicide', 'Vernissage traditionnel au tampon']
  },
  {
    id: 2,
    title: 'Cadre de Miroir Ottoman',
    category: 'miroir',
    description: 'Reconstitution des ornements sculptés endommagés sur un cadre en bois doré d\'époque. Moulage des détails manquants, consolidation structurelle, et application d\'une nouvelle dorure fine à la feuille d&apos;or avec patine ancienne.',
    beforeImage: '/mirror-before.jpg',
    afterImage: '/mirror-after.jpg',
    steps: ['Moulage d\'ornements', 'Dorure fine à la feuille d\'or', 'Patine de vieillissement']
  },
  {
    id: 3,
    title: 'Porte d\'Entrée de Demeure',
    category: 'porte',
    description: 'Rénovation esthétique et protectrice d\'une porte d\'entrée en bois massif exposée aux intempéries et blanchie par le soleil. Ponçage en profondeur, recollage des assemblages disjoints, teinte chaude protectrice et finitions hydrofuges huilées.',
    beforeImage: '/door-before.jpg',
    afterImage: '/door-after.jpg',
    steps: ['Ponçage & Gommage', 'Recollage des assemblages', 'Application d\'huile protectrice']
  }
]

function BeforeAfterItem({ item }: { item: typeof ITEMS[0] }) {
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-stone-950/20 rounded-3xl p-6 md:p-8 border border-gold/10 hover:border-gold/20 transition-all duration-300">
      {/* Draggable Slider Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full lg:w-[50%] aspect-[16/10] rounded-2xl overflow-hidden shadow-xl select-none cursor-ew-resize border border-gold/15 shrink-0"
      >
        {/* BEFORE image (Left/Background) */}
        <Image
          src={item.beforeImage}
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
            src={item.afterImage}
            alt={`${item.title} - Après`}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="absolute top-3 right-3 z-20 bg-stone-900/80 backdrop-blur-md border border-gold/35 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-gold">
          Après
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 z-30 w-[2.5px] bg-gold cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-gold text-walnut shadow-lg border-2 border-walnut flex items-center justify-center">
            <ArrowRightLeft className="size-3.5 text-walnut" />
          </div>
        </div>
      </div>

      {/* Description Area */}
      <div className="flex flex-col justify-between items-start text-left flex-1 py-1">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold bg-gold/10 px-3 py-1 rounded-full border border-gold/15">
            {FILTER_CATEGORIES.find(c => c.id === item.category)?.label || item.category}
          </span>
          
          <h3 className="font-heading text-2xl sm:text-3xl text-white font-medium">
            {item.title}
          </h3>
          
          <p className="text-sm font-light leading-relaxed text-ivory/70 text-pretty">
            {item.description}
          </p>
        </div>

        {/* Restoration Steps */}
        <div className="mt-6 space-y-2.5 w-full">
          <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Interventions Réalisées</h4>
          <div className="flex flex-wrap gap-2">
            {item.steps.map((step, idx) => (
              <span
                key={idx}
                className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-ivory/80 font-medium"
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RelookingPage() {
  const [filter, setFilter] = useState('all')

  const filteredItems = filter === 'all' 
    ? ITEMS 
    : ITEMS.filter(item => item.category === filter)

  return (
    <main className="min-h-screen flex flex-col bg-walnut text-ivory">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="size-3.5" /> Restauration d&apos;Art
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Relooking &amp; Restauration
          </h1>
          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed text-pretty font-light">
            À l&apos;Atelier Aschi, nous croyons que chaque meuble ancien possède une âme. Nos ébénistes et sculpteurs restaurent, relaquent et subliment vos pièces de famille pour les adapter aux intérieurs contemporains les plus raffinés.
          </p>
        </div>

        {/* Filter Bar */}
        <Reveal delay={100} className="w-full flex justify-center mb-12 overflow-x-auto pb-3 scrollbar-thin">
          <div className="flex gap-2 p-1.5 rounded-full bg-stone-950/40 border border-gold/15 backdrop-blur-sm shrink-0">
            {FILTER_CATEGORIES.map((cat) => {
              const isActive = filter === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gold text-walnut shadow-md'
                      : 'text-ivory/60 hover:text-white hover:bg-white/5'
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
            {filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-ivory/50"
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
          <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-gold/25 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Design accents */}
            <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-[0.2em] mb-6">
              <Hammer className="size-3.5" /> Donner vie à vos objets
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 max-w-2xl leading-tight">
              Faites restaurer votre pièce de famille
            </h2>
            
            <p className="text-ivory/60 text-sm max-w-xl mb-8 leading-relaxed font-light text-pretty">
              Qu&apos;il s&apos;agisse de restaurer à l&apos;identique ou de relooker pour intégrer dans un décor moderne, nos artisans étudient vos pièces sur photo ou en atelier.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact?subject=relooking"
                className="inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
              >
                <Mail className="size-3.5" />
                Demander une étude
              </Link>
              
              <a
                href="tel:+21655743760"
                className="inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-white/10"
              >
                <Phone className="size-3.5 text-gold" />
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
