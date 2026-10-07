'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Paintbrush, Sparkles, ArrowRight, ArrowLeftRight, ChevronLeft, ChevronRight, Eye, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { publicApi, Relooking } from '@/lib/api'
import { formatImageUrl } from '@/lib/utils'

// Projets réels initiaux (provenant de la base de données de l'artisan) pour éliminer tout flash de photo morte
const INITIAL_REAL_RELOOKINGS: Relooking[] = [
  {
    id: 6,
    title: "Banc Traditionnel Restauré en Blanc Patiné & Incrustations de Jelliz",
    description: "Redonnez une seconde vie à votre intérieur avec ce banc artisanal en bois massif entièrement rénové. Sublimé par une finition blanc vieilli à effet patiné, il intègre des détails sculptés raffinés et des carreaux de zellige traditionnels.",
    category: "Mobilier d'Art",
    imageAvantUrl: "https://artisanat-aschi-backend.onrender.com/api/uploads/81143238-3556-4124-b3ff-2538a5975b6b.webp",
    imageApresUrl: "https://artisanat-aschi-backend.onrender.com/api/uploads/937dd829-3d3c-42bd-b59b-2312ae2bfc49.webp",
    createdDate: "2026-09-27T16:10:55.371848"
  },
  {
    id: 5,
    title: "Buffet Vaisselier Traditionnel Restauré – Bois Naturel & Finitions Vert Émeraude",
    description: "Ce vaisselier en bois massif à deux corps a été entièrement remis en valeur avec un décapage soigné révélant les veines chaleureuses du bois brut.",
    category: "Mobilier d'Art",
    imageAvantUrl: "https://artisanat-aschi-backend.onrender.com/api/uploads/26b7ebea-86ae-4480-adca-d98285ff32e8.webp",
    imageApresUrl: "https://artisanat-aschi-backend.onrender.com/api/uploads/807773d1-77e4-491a-8ad9-3abcd1d59ff3.webp",
    createdDate: "2026-09-27T15:27:07.500496"
  }
]

function isDeadPhoto(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  const lower = url.toLowerCase().trim()
  return (
    lower.includes('gallery-1') ||
    lower.includes('gallery-2') ||
    lower.includes('relooking_service') ||
    lower.includes('herochaise') ||
    lower.includes('placeholder')
  )
}

export function HeroRelooking() {
  // Initialisation directe avec les vraies photos de l'artisan (AUCUNE photo morte dès la 1ère milliseconde)
  const [relookings, setRelookings] = useState<Relooking[]>(INITIAL_REAL_RELOOKINGS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Essai de lecture du cache local instantané
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('aschi_relookings_cache')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validCached = parsed.filter(
              r => !isDeadPhoto(r.imageAvantUrl) && !isDeadPhoto(r.imageApresUrl)
            )
            if (validCached.length > 0) {
              setRelookings(validCached)
            }
          }
        }
      }
    } catch (_) {}

    // 2. Chargement des dernières données depuis l'API / BDD
    async function loadRelookings() {
      try {
        const data = await publicApi.getRelookings()
        if (Array.isArray(data) && data.length > 0) {
          const valid = data.filter(
            r => !isDeadPhoto(r.imageAvantUrl) && !isDeadPhoto(r.imageApresUrl)
          )
          if (valid.length > 0) {
            setRelookings(valid)
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem('aschi_relookings_cache', JSON.stringify(valid))
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('Erreur chargement relookings:', err)
      }
    }
    loadRelookings()
  }, [])

  const currentItem = relookings[currentIndex] || relookings[0] || INITIAL_REAL_RELOOKINGS[0]

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percent)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX)
  }

  const prevProject = () => {
    setCurrentIndex(prev => (prev === 0 ? relookings.length - 1 : prev - 1))
    setSliderPosition(50)
  }

  const nextProject = () => {
    setCurrentIndex(prev => (prev + 1) % relookings.length)
    setSliderPosition(50)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center justify-center font-sans py-2 sm:py-4">
      
      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 h-full grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-0 lg:gap-x-10 py-2 sm:py-4 items-center">
        
        {/* Left Text Content (5 Cols) */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 shadow-md backdrop-blur-md">
              <Paintbrush className="size-3 text-[#E6A635]" />
              <span>{currentItem.category || "Ébénisterie & Restauration d'Art"}</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              <span className="line-clamp-2">{currentItem.title}</span>
            </h2>
            
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-md text-xs sm:text-sm md:text-[14.5px] mb-5 leading-relaxed line-clamp-3">
              {currentItem.description}
            </p>

            {/* Pagination si l'admin a plusieurs restaurations */}
            {relookings.length > 1 && (
              <div className="flex items-center gap-3 mb-5 bg-[#3B271C]/85 px-3 py-1.5 rounded-full border border-[#E6A635]/35 shadow-md">
                <button
                  type="button"
                  onClick={prevProject}
                  className="size-7 rounded-full bg-[#241812] text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] flex items-center justify-center transition-all cursor-pointer"
                  title="Projet précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[11px] font-semibold text-white/90 tracking-wider">
                  Projet {currentIndex + 1} / {relookings.length}
                </span>
                <button
                  type="button"
                  onClick={nextProject}
                  className="size-7 rounded-full bg-[#241812] text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] flex items-center justify-center transition-all cursor-pointer"
                  title="Projet suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/relooking"
                className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Découvrir la Restauration</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Comparison Slider (7 Cols - Agrandie et Protégée du Swipe Mobile) */}
        <div className="w-full lg:col-span-7 flex flex-col items-center lg:items-end z-20 order-2 mt-2 lg:mt-0">
          <div className="w-full max-w-[560px] lg:max-w-[600px] flex flex-col items-center">
            
            {/* Le conteneur du comparateur */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              // 🛑 e.stopPropagation() empêche le swipe du HeroSlider de zapper la diapositive !
              onTouchStart={(e) => {
                e.stopPropagation()
                setIsDragging(true)
                if (e.touches.length > 0) handleMove(e.touches[0].clientX)
              }}
              onTouchMove={(e) => {
                e.stopPropagation()
                if (e.touches.length > 0) handleMove(e.touches[0].clientX)
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                setIsDragging(false)
              }}
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border-2 border-[#E6A635]/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] cursor-ew-resize select-none bg-[#1A110B]"
            >
              {/* Image APRÈS (Fond complet) */}
              <div className="absolute inset-0">
                <img 
                  src={formatImageUrl(currentItem.imageApresUrl)} 
                  alt="Après Restauration d'Art" 
                  className="size-full object-cover pointer-events-none" 
                />
                <div className="absolute top-3.5 right-3.5 bg-[#3B271C]/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#E6A635]/40 text-[9.5px] uppercase tracking-[0.2em] font-bold text-[#F2BD52] shadow-md z-10 pointer-events-none">
                  ✨ Après Restauration
                </div>
              </div>

              {/* Image AVANT (Découpée selon la position du slider) */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none transition-none"
                style={{ 
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
              >
                <img 
                  src={formatImageUrl(currentItem.imageAvantUrl)} 
                  alt="Avant Restauration" 
                  className="size-full object-cover" 
                />
                <div className="absolute top-3.5 left-3.5 bg-[#1A110B]/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 text-[9.5px] uppercase tracking-[0.2em] font-bold text-white shadow-md z-10 pointer-events-none">
                  État Initial (Avant)
                </div>
              </div>

              {/* Ligne séparatrice & Curseur interactif */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-[#E6A635] shadow-[0_0_12px_#E6A635] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 sm:size-10 rounded-full bg-[#3B271C] border-2 border-[#E6A635] shadow-xl flex items-center justify-center text-[#F2BD52]">
                  <ArrowLeftRight className="size-4" />
                </div>
              </div>

              {/* Guide visuel en bas */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#3B271C]/90 backdrop-blur-md px-4 py-1 rounded-full border border-[#E6A635]/35 text-[9px] sm:text-[9.5px] uppercase tracking-[0.2em] text-[#F2BD52] font-semibold pointer-events-none shadow-md">
                Glisser pour comparer
              </div>
            </motion.div>

            {/* 🌟 Boutons d'accès direct sur Mobile (Permet de voir Avant / 50% / Après en 1 clic sans devoir glisser) */}
            <div 
              className="flex items-center justify-center gap-2 mt-3.5 z-30"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSliderPosition(100)}
                className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                  sliderPosition > 85
                    ? 'bg-white text-[#1A110B] border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-105'
                    : 'bg-[#3B271C]/90 text-white/80 border-white/20 hover:bg-[#3B271C]'
                }`}
              >
                <Eye className="inline size-3 mr-1" /> Voir Avant
              </button>

              <button
                type="button"
                onClick={() => setSliderPosition(50)}
                className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                  sliderPosition >= 40 && sliderPosition <= 60
                    ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] shadow-[0_0_10px_rgba(230,166,53,0.5)] scale-105'
                    : 'bg-[#3B271C]/90 text-white/80 border-[#E6A635]/30 hover:bg-[#3B271C]'
                }`}
              >
                <ArrowLeftRight className="inline size-3 mr-1" /> 50 / 50
              </button>

              <button
                type="button"
                onClick={() => setSliderPosition(0)}
                className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                  sliderPosition < 15
                    ? 'bg-[#F2BD52] text-[#1A110B] border-[#F2BD52] shadow-[0_0_10px_rgba(242,189,82,0.5)] scale-105'
                    : 'bg-[#3B271C]/90 text-white/80 border-white/20 hover:bg-[#3B271C]'
                }`}
              >
                <Wand2 className="inline size-3 mr-1" /> Voir Après
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
