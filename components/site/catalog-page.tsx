'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, MessageCircle, Sparkles, Bot, X, SlidersHorizontal, CheckCircle2, Heart, ChevronLeft, ChevronRight, Grid2X2, GripHorizontal, Tv, Frame, DoorClosed, Archive, LayoutDashboard, List, Pipette, ArrowUpDown, ZoomIn, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/motion/fade-in'
import { publicApi, Product } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Filter data ────────────────────────────────────────────────────────────

const COLORS = [
  { label: 'Tout',          hex: null,      border: 'border-border' },
  { label: 'Noyer',         hex: '#5C3317', border: 'border-amber-900' },
  { label: 'Bleu',          hex: '#2D5F8A', border: 'border-blue-700' },
  { label: 'Or',            hex: '#C9A84C', border: 'border-yellow-600' },
  { label: 'Naturel',       hex: '#C4A882', border: 'border-amber-300' },
  { label: 'Blanc Cérusé',  hex: '#F0EDE6', border: 'border-stone-300' },
  { label: 'Vert Olivier',  hex: '#4A5E3A', border: 'border-green-800' },
  { label: 'Bordeaux',      hex: '#7B2D3E', border: 'border-red-900' },
]

const DIMENSIONS = [
  'Tout',
  'Petit (< 80 cm)',
  'Moyen (80–150 cm)',
  'Grand (> 150 cm)',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

import { Folder } from 'lucide-react'

const getCategoryIcon = (name: string) => {
  const norm = name.toLowerCase()
  if (norm.includes('buffet')) return GripHorizontal
  if (norm.includes('tv')) return Tv
  if (norm.includes('miroir')) return Frame
  if (norm.includes('porte')) return DoorClosed
  if (norm.includes('coffre')) return Archive
  if (norm.includes('décoration') || norm.includes('deco')) return Sparkles
  if (norm.includes('table')) return LayoutDashboard
  return Folder
}

const getColorHex = (label: string | null | undefined) => {
  if (!label) return '#cccccc'
  const norm = label.trim().toLowerCase()
  const map: Record<string, string> = {
    'or': '#C9A84C',
    'doré': '#C9A84C',
    'bleu': '#2D5F8A',
    'bleu cérusé': '#2D5F8A',
    'noyer': '#5C3317',
    'noyer foncé': '#5C3317',
    'naturel': '#C4A882',
    'naturel clair': '#C4A882',
    'blanc cérusé': '#F0EDE6',
    'vert olivier': '#4A5E3A',
    'bordeaux': '#7B2D3E',
    'rose': '#e8b4b8',
    'gris': '#8e9aaf',
    'noir': '#2b2d42',
    'blanc': '#ffffff',
    'rouge': '#c1121f',
    'original': '#8C7A6B',
    'multicolore': 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)',
  }
  return map[norm] || '#cccccc'
}

const isOriginal = (label: string | null | undefined) => {
  return !label || label.trim().toLowerCase() === 'original'
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function isFuzzyMatch(term: string, target: string | null | undefined): boolean {
  if (!target) return false;
  const t = target.toLowerCase();
  if (t.includes(term)) return true;
  if (term.length >= 4) {
    const words = t.split(/[\s,.-]+/);
    const maxTypos = term.length >= 6 ? 2 : 1;
    return words.some(w => levenshtein(term, w) <= maxTypos);
  }
  return false;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CatalogProductCard = ({
  model,
  colorFilter,
  aiQuery,
  hoveredId,
  setHoveredId,
  favorites,
  toggleFavorite,
  setQuickViewProduct,
  setQuickViewImageIndex,
}: any) => {
  const isHovered = hoveredId === model.id

  const initialIndex = model.images?.findIndex((img: any) => img.isPrimary)
  const [activeImageIndex, setActiveImageIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
  const primaryImage = model.images?.find((img: any) => img.isPrimary) || model.images?.[0]
  let variantImage: any = null
  let isAIVariantDisplayed = false

  const hasMultipleImages = model.images && model.images.length > 1

  if (colorFilter !== 'Tout' || aiQuery.trim() !== '') {
    const targetColor = colorFilter !== 'Tout' ? colorFilter.trim().toLowerCase() : ''
    const query = aiQuery.trim().toLowerCase()
    const stopWords = ['je', 'cherche', 'voudrais', 'veux', 'veut', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'en', 'avec', 'pour', 'et', 'ou', 'est', 'que', 'qui', 'dans', 'sur']
    const keywords = query.split(/\s+/).filter((word: string) => word.length > 2 && !stopWords.includes(word))
    const searchTerms = keywords.length > 0 ? keywords : [query]
    
    let bestVariant: any = null
    let bestScore = Infinity
    
    model.images?.forEach((img: any) => {
       const label = img.colorLabel?.trim().toLowerCase() || ''
       if (!label) return
       
       if (targetColor && label === targetColor) {
         bestVariant = img
         bestScore = -1
         return
       }
       
       if (query) {
         searchTerms.forEach((term: string) => {
           if (label.includes(term)) {
             if (0 < bestScore) {
               bestVariant = img
               bestScore = 0
             }
           } else if (isFuzzyMatch(term, label)) {
             if (1 < bestScore) {
                bestVariant = img
                bestScore = 1
             }
           }
         })
       }
    })
    
    const matchingVariant = bestVariant
    
    if (matchingVariant && matchingVariant.id !== primaryImage.id) {
      variantImage = matchingVariant
      isAIVariantDisplayed = true
    }
  }

  const currentImage = hasMultipleImages && !isAIVariantDisplayed 
    ? model.images[activeImageIndex] 
    : primaryImage
    
  const image = currentImage?.imageUrl || '/placeholder.png'
  const displayColor = isAIVariantDisplayed && variantImage ? variantImage.colorLabel : (hasMultipleImages ? currentImage.colorLabel : model.color)

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
      }}
      onHoverStart={() => setHoveredId(model.id)}
      onHoverEnd={() => setHoveredId(null)}
      className="group relative flex flex-col p-3 sm:p-4 rounded-[1.75rem] sm:rounded-[2rem] bg-[#3B271C]/90 hover:bg-[#452E21]/95 border border-[#E6A635]/35 hover:border-[#E6A635]/80 shadow-[0_15px_35px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_45px_rgba(230,166,53,0.25)] backdrop-blur-xl transition-all duration-400 transform hover:-translate-y-1"
    >
      {/* ARCH FRAME */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[1.35rem] sm:rounded-t-[1.75rem] rounded-b-xl bg-[#241812] border border-[#E6A635]/30 shadow-inner group/img">
        
        {/* Main photo / AI Variant */}
        {isAIVariantDisplayed && variantImage ? (
          <>
            <motion.img
              src={variantImage.imageUrl}
              alt={model.name}
              className="size-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#E6A635]/95 backdrop-blur-md px-3 py-1 shadow-md border border-[#F2BD52]">
              <Bot className="size-3 text-[#1A110B]" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#1A110B]">IA : {variantImage.colorLabel}</span>
            </div>
          </>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={image}
                src={image}
                alt={model.name}
                className="absolute inset-0 size-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </AnimatePresence>
            
            {currentImage && currentImage.id !== primaryImage.id && !isOriginal(currentImage.colorLabel) && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#E6A635]/95 backdrop-blur-md px-3 py-1 shadow-md border border-[#F2BD52]">
                <Bot className="size-3 text-[#1A110B]" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#1A110B]">IA : {currentImage.colorLabel}</span>
              </div>
            )}
            
            {model.isFeatured ? (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-3 py-1 shadow-md backdrop-blur-md border border-[#F2BD52]/50">
                <Sparkles className="size-3 text-[#1A110B]" />
                <span className="text-[9px] uppercase tracking-widest font-extrabold">Pièce d&apos;Art</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md px-3 py-1 shadow-sm border border-[#E6A635]/40">
                <span className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-serif font-bold">
                  🏺 Atelier Signé
                </span>
              </div>
            )}
          </>
        )}

        {/* FLOATING ACTION BUTTONS */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(e, model.id); }}
            className={`size-8 rounded-full backdrop-blur-md transition-all shadow-md flex items-center justify-center active:scale-95 cursor-pointer ${
              favorites.includes(model.id)
                ? 'bg-[#241812] text-red-400 border border-red-500/50'
                : 'bg-[#241812]/90 hover:bg-[#3B271C] text-[#EAE4D9] hover:text-red-400 border border-[#E6A635]/35'
            }`}
            title="Ajouter aux favoris"
          >
            <Heart className={`size-3.5 transition-colors ${favorites.includes(model.id) ? 'fill-red-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            className="size-8 rounded-full bg-[#241812]/90 hover:bg-[#3B271C] text-[#EAE4D9] hover:text-[#F2BD52] backdrop-blur-md border border-[#E6A635]/35 shadow-md transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Aperçu rapide"
          >
            <Eye className="size-3.5" />
          </button>
        </div>

        {/* HOVER EXPLORE BUTTON */}
        <div className="absolute bottom-3 inset-x-3 z-20 transition-all duration-300 opacity-0 group-hover/img:opacity-100 translate-y-2 group-hover/img:translate-y-0 hidden sm:block">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            className="btn-sheen w-full py-2 rounded-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="size-3.5" /> Explorer l&apos;inspiration
          </button>
        </div>

        {/* VIEW COUNT BADGE */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-20 px-2.5 py-0.5 rounded-full bg-[#241812]/80 backdrop-blur-md text-[8.5px] font-bold text-[#F2BD52] border border-[#E6A635]/30 group-hover/img:hidden">
            📷 {model.images.length} vues
          </div>
        )}

        {/* Main Product Link */}
        <Link href={`/produits/${model.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* MULTI-ANGLE THUMBNAILS SELECTOR */}
      {hasMultipleImages && !isAIVariantDisplayed && (
        <div className="pt-2 pb-0.5 flex gap-1.5 overflow-x-auto scrollbar-hide z-20 relative pointer-events-auto px-0.5">
          {model.images.map((img: any, idx: number) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImageIndex(idx)
              }}
              className={`relative size-8 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                idx === activeImageIndex 
                  ? 'border-[#E6A635] opacity-100 scale-105 shadow-md ring-1 ring-[#E6A635]' 
                  : 'border-[#E6A635]/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.imageUrl} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* DETAILS SECTION */}
      <div className="pt-2.5 px-0.5 flex flex-col flex-1 justify-between gap-2 text-left">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] uppercase tracking-[0.18em] font-extrabold text-[#F2BD52] bg-[#241812]/90 px-2.5 py-0.5 rounded-full border border-[#E6A635]/30 truncate">
              {model.category?.name || 'Inspiration'}
            </span>
            <span className="text-[9px] text-[#EAE4D9]/80 font-light tracking-wider uppercase opacity-90 truncate max-w-[110px]">
              🪵 {model.materials || 'Bois massif'}
            </span>
          </div>
          
          <h3 className="font-heading text-sm sm:text-base font-light leading-snug text-[#F7F4EE] group-hover:text-[#F2BD52] transition-colors truncate">
            {model.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-[#E6A635]/20 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[9px] text-[#EAE4D9]/80 uppercase tracking-wider font-light truncate">
            <span className="size-2 rounded-full border border-black/10 shrink-0 shadow-inner" style={{ background: getColorHex(displayColor) }} />
            <span className="truncate max-w-[80px]">{displayColor}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#241812]/90 border border-[#E6A635]/40 text-[#F2BD52] px-3 py-1 rounded-full shadow-sm shrink-0">
            <span className="font-heading text-[11px] font-bold tracking-wide">
              {model.price ? `${model.price} TND` : 'Sur devis'}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function CatalogPage() {
  const router = useRouter()
  
  const [category, setCategory] = useState('Tout')
  const [color, setColor] = useState('Tout')
  const [dimension, setDimension] = useState('Tout')
  const [aiQuery, setAiQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [visibleCount, setVisibleCount] = useState(12)
  const [showGoldCard, setShowGoldCard] = useState(false)
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  
  const [categories, setCategories] = useState<{ id: string; label: string; icon: any; count: number }[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)
  const thumbCarouselRef = useRef<HTMLDivElement>(null)

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbCarouselRef.current) {
      const amount = direction === 'left' ? -180 : 180
      thumbCarouselRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }
  
  const [favorites, setFavorites] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0)

  useEffect(() => {
    setVisibleCount(12)
  }, [category, color, dimension, aiQuery, sortBy])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('aschi_favorites')
    if (saved) {
      try { setFavorites(JSON.parse(saved)) } catch(e){}
    }
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('aschi_favorites', JSON.stringify(favorites))
  }, [favorites, mounted])

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await publicApi.getProducts({ type: 'CATALOGUE' })
        const isHandleProduct = (p: Product) => {
          const catName = p.category?.name?.toLowerCase() || ''
          const mat = p.materials?.toLowerCase() || ''
          const name = p.name?.toLowerCase() || ''
          return (
            catName.includes("bijoux de porte") || 
            catName.includes("ronds") || 
            catName.includes("ovales") || 
            catName.includes("poignée") ||
            mat.includes("céramique") || 
            mat.includes("majolique") ||
            name.includes("bouton") || 
            name.includes("poignée")
          )
        }
        setDbProducts(data.filter(p => !isHandleProduct(p)))
      } catch (err) {
        console.error("Failed to load catalog products:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const allProducts = dbProducts
    const counts: Record<string, number> = {}
    allProducts.forEach(p => {
      const catName = p.category?.name || 'Autre'
      counts[catName] = (counts[catName] || 0) + 1
    })

    const dynamicCategories = Object.keys(counts).map(catName => ({
      id: catName,
      label: catName,
      icon: getCategoryIcon(catName),
      count: counts[catName]
    })).sort((a, b) => a.label.localeCompare(b.label))

    setCategories([
      { id: 'Tout', label: 'Tout', icon: Grid2X2, count: allProducts.length },
      ...dynamicCategories
    ])
  }, [dbProducts])

  useEffect(() => {
    const source = dbProducts
    let filtered = source
    let needsGoldCard = false
    let isAiSearchActive = false

    if (aiQuery.trim() !== '') {
      isAiSearchActive = true
      const q = aiQuery.trim().toLowerCase()
      const stopWords = ['je', 'cherche', 'voudrais', 'veux', 'veut', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'en', 'avec', 'pour', 'et', 'ou', 'est', 'que', 'qui', 'dans', 'sur']
      const keywords = q.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word))
      const searchTerms = keywords.length > 0 ? keywords : [q]

      let perfectMatches = filtered.filter(p => {
        return searchTerms.every(term => {
          const matchesName = isFuzzyMatch(term, p.name)
          const matchesDesc = isFuzzyMatch(term, p.description)
          const matchesCat = isFuzzyMatch(term, p.category?.name)
          const matchesColor = isFuzzyMatch(term, p.color)
          const matchesVariant = p.images?.some(img => isFuzzyMatch(term, img.colorLabel))
          return matchesName || matchesDesc || matchesCat || matchesColor || matchesVariant
        })
      })

      if (perfectMatches.length > 0) {
        filtered = perfectMatches
        needsGoldCard = false
      } else {
        needsGoldCard = true
        let partialMatches = filtered.filter(p => {
          return searchTerms.some(term => {
            const matchesName = isFuzzyMatch(term, p.name)
            const matchesDesc = isFuzzyMatch(term, p.description)
            const matchesCat = isFuzzyMatch(term, p.category?.name)
            const matchesColor = isFuzzyMatch(term, p.color)
            const matchesVariant = p.images?.some(img => isFuzzyMatch(term, img.colorLabel))
            return matchesName || matchesDesc || matchesCat || matchesColor || matchesVariant
          })
        })

        if (partialMatches.length > 0) {
          filtered = partialMatches
        }
      }
    }

    if (category !== 'Tout') {
      filtered = filtered.filter(p => p.category?.name?.toLowerCase() === category.toLowerCase())
    }
    if (color !== 'Tout') {
      const targetColor = color.trim().toLowerCase()
      filtered = filtered.filter(p => {
        const mainColor = p.color?.trim().toLowerCase() || ''
        const matchesMain = mainColor.includes(targetColor) || targetColor.includes(mainColor) || isFuzzyMatch(targetColor, mainColor)
        const matchesVariant = p.images?.some(img => {
          const vLabel = img.colorLabel?.trim().toLowerCase() || ''
          return vLabel.includes(targetColor) || targetColor.includes(vLabel) || isFuzzyMatch(targetColor, vLabel)
        })
        return matchesMain || matchesVariant
      })
    }
    if (dimension !== 'Tout') {
      filtered = filtered.filter(p => {
        const dimStr = (p.dimensions || '').toLowerCase()
        const targetDim = dimension.toLowerCase()
        if (targetDim.includes('petit') && dimStr.includes('petit')) return true
        if (targetDim.includes('moyen') && dimStr.includes('moyen')) return true
        if (targetDim.includes('grand') && dimStr.includes('grand')) return true

        const hasVariantDim = p.images?.some(img => {
          const label = (img.colorLabel || '').toLowerCase()
          return (targetDim.includes('petit') && label.includes('petit')) ||
                 (targetDim.includes('moyen') && label.includes('moyen')) ||
                 (targetDim.includes('grand') && label.includes('grand'))
        })
        if (hasVariantDim) return true

        const numbers = dimStr.match(/\d+/g)
        if (numbers && numbers.length > 0) {
          const mainVal = parseInt(numbers[0])
          if (targetDim.includes('petit')) return mainVal > 0 && mainVal < 80
          if (targetDim.includes('moyen')) return mainVal >= 80 && mainVal <= 150
          if (targetDim.includes('grand')) return mainVal > 150
        }
        return false
      })
    }

    if (filtered.length === 0 && color !== 'Tout' && !isAiSearchActive) {
       needsGoldCard = true
       filtered = source.filter(p => category === 'Tout' || p.category?.name === category)
    }

    let sorted = [...filtered]
    if (sortBy === 'newest') {
      sorted.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'featured') {
      sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    setShowGoldCard(needsGoldCard)
    setProducts(sorted)
  }, [category, color, dimension, aiQuery, sortBy, dbProducts, loading])

  const activeFilterCount = [
    category !== 'Tout',
    color !== 'Tout',
    dimension !== 'Tout',
    aiQuery !== '',
  ].filter(Boolean).length

  return (
    <section className="min-h-screen bg-transparent py-8 md:py-14 text-[#F7F4EE] relative">
      
      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#3B271C] rounded-[2rem] overflow-hidden shadow-2xl border border-[#E6A635]/40 flex flex-col md:flex-row relative max-h-[90vh] my-auto text-[#F7F4EE]"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-[#241812]/80 hover:bg-[#241812] text-[#F7F4EE] rounded-full backdrop-blur-md border border-[#E6A635]/35 transition-all shadow-md cursor-pointer"
                title="Fermer"
              >
                <X className="size-5" />
              </button>

              {/* Left Side: Photo Showcase */}
              <div className="w-full md:w-1/2 relative bg-[#241812] aspect-[4/5] md:aspect-auto h-[300px] md:h-[540px] border-b md:border-b-0 md:border-r border-[#E6A635]/30 overflow-hidden group select-none">
                {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={quickViewImageIndex}
                        src={quickViewProduct.images[quickViewImageIndex]?.imageUrl} 
                        alt={quickViewProduct.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                      />
                    </AnimatePresence>

                    {/* Pro Navigation Arrows */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === 0 ? (quickViewProduct.images?.length || 1) - 1 : i - 1); }}
                          className="p-3 bg-[#241812]/90 hover:bg-[#E6A635] hover:text-[#1A110B] text-[#F7F4EE] rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-xl border border-[#E6A635]/40 hover:scale-105 active:scale-95 cursor-pointer"
                          title="Image précédente"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === (quickViewProduct.images?.length || 1) - 1 ? 0 : i + 1); }}
                          className="p-3 bg-[#241812]/90 hover:bg-[#E6A635] hover:text-[#1A110B] text-[#F7F4EE] rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-xl border border-[#E6A635]/40 hover:scale-105 active:scale-95 cursor-pointer"
                          title="Image suivante"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}

                    {/* Image Thumbnails Strip */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute bottom-4 inset-x-3 z-20 flex items-center justify-center gap-1.5">
                        <div 
                          ref={thumbCarouselRef}
                          className="flex gap-2 overflow-x-auto scroll-smooth py-1 px-1 max-w-[85%] scrollbar-none"
                        >
                          {quickViewProduct.images.map((img: any, idx: number) => (
                            <button 
                              key={img.id || idx}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(idx); }}
                              className={`size-11 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer shadow-md ${
                                idx === quickViewImageIndex ? 'border-[#E6A635] scale-105 ring-1 ring-[#E6A635] opacity-100' : 'border-[#E6A635]/30 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img.imageUrl} alt="" className="size-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#241812]">
                    <span className="text-[#EAE4D9]/60 font-light">Aucune image disponible</span>
                  </div>
                )}
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto text-left">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#F2BD52] bg-[#241812]/90 px-3 py-1 rounded-full border border-[#E6A635]/35 inline-block mb-2">
                      {quickViewProduct.category?.name || 'Création d\'Atelier'}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-light text-gold-gradient leading-tight">
                      {quickViewProduct.name}
                    </h3>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => toggleFavorite(e, quickViewProduct.id)}
                    className={`p-2.5 rounded-full border transition-all shadow-sm shrink-0 cursor-pointer ${
                      favorites.includes(quickViewProduct.id)
                        ? 'bg-[#241812] border-red-500/50 text-red-400'
                        : 'bg-[#241812]/90 border-[#E6A635]/35 text-[#EAE4D9] hover:text-red-400'
                    }`}
                    title="Ajouter aux favoris"
                  >
                    <Heart className={`size-4 ${favorites.includes(quickViewProduct.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <p className="text-[#EAE4D9]/85 font-light text-xs sm:text-sm leading-relaxed mb-6">
                  {quickViewProduct.description || "Cette pièce artisanale d'exception est fabriquée à la main dans notre atelier à partir de matériaux nobles. Chaque détail est façonné sur-mesure."}
                </p>

                {/* Specs Grid */}
                {(() => {
                  const currentViewedImage = quickViewProduct.images?.[quickViewImageIndex]
                  const rawVariantLabel = (currentViewedImage && !isOriginal(currentViewedImage.colorLabel)) 
                    ? currentViewedImage.colorLabel!
                    : null
                    
                  const isDimensionVariant = rawVariantLabel ? ['Petit', 'Moyen', 'Grand'].includes(rawVariantLabel) : false
                  
                  const actualColor = isDimensionVariant 
                    ? (quickViewProduct.color || 'Naturel') 
                    : (rawVariantLabel || quickViewProduct.color || 'Naturel')
                    
                  const actualDimension = isDimensionVariant 
                    ? rawVariantLabel 
                    : (quickViewProduct.dimensions || 'Sur mesure')

                  return (
                    <div className="grid grid-cols-2 gap-2.5 mb-6 p-4 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/30">
                      <div className="p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                        <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Dimensions</p>
                        <p className="text-xs font-semibold text-[#F7F4EE]">📏 {actualDimension}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                        <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Matière</p>
                        <p className="text-xs font-semibold text-[#F7F4EE]">🪵 {quickViewProduct.materials || 'Bois massif'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                        <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Finition / Teinte</p>
                        <p className="text-xs font-semibold text-[#F7F4EE] flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full inline-block border border-black/10 shrink-0" style={{ background: getColorHex(actualColor) }} />
                          <span className="truncate">{actualColor}</span>
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                        <p className="text-[9px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Prix Indicatif</p>
                        <p className="text-xs font-bold text-[#F2BD52] font-heading">
                          {quickViewProduct.price ? `${quickViewProduct.price} TND` : 'Sur devis'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <Link
                    href={`/custom-creation?model=${encodeURIComponent(quickViewProduct.name)}`}
                    className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    <MessageCircle className="size-4" /> Devis Sur-Mesure 3D
                  </Link>
                  <Link
                    href={`/produits/${quickViewProduct.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/35 bg-[#241812]/90 hover:bg-[#241812] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EE] transition-all"
                  >
                    Fiche détaillée <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative text-center mb-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] uppercase tracking-[0.2em] mb-3 font-bold shadow-md">
              <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
              <span>Création Sur-Mesure • Galerie d&apos;Inspiration</span>
            </div>
            <h1 className="mx-auto mt-2 max-w-3xl font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Modèles &amp; Sources d&apos;Inspiration
            </h1>
            <p className="text-[#EAE4D9]/90 max-w-xl mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed mt-2.5 drop-shadow-md">
              Explorez nos créations passées. Choisissez un modèle pour le personnaliser ou demandez une création 100% sur-mesure à nos maîtres artisans.
            </p>
          </FadeIn>

          {/* AI VISION PROMPTER */}
          <FadeIn delay={0.05} className="mt-8 mb-8 relative z-10 mx-auto max-w-2xl px-2">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#E6A635] via-amber-300 to-[#C78318] opacity-25 blur-md group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-[#3B271C]/90 border border-[#E6A635]/40 shadow-xl rounded-full px-2 py-1.5 backdrop-blur-md">
                <div className="pl-3.5 pr-2.5">
                  <Sparkles className="size-4 text-[#F2BD52]" />
                </div>
                <input 
                  type="text"
                  placeholder="Décrivez le meuble de vos rêves (ex: Un buffet sculpté noyer avec miroirs)..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-[#F7F4EE] text-xs sm:text-sm focus:outline-none focus:ring-0 placeholder:text-[#EAE4D9]/40 font-light"
                />
                {aiQuery && (
                  <button onClick={() => setAiQuery('')} className="p-2 text-[#EAE4D9] hover:text-[#F2BD52] transition-colors cursor-pointer">
                    <X className="size-4" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    window.scrollBy({ top: 300, behavior: 'smooth' })
                  }}
                  className="btn-sheen ml-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 whitespace-nowrap shadow-md hidden sm:block cursor-pointer"
                >
                  Visualiser
                </button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* CATEGORIES "STORIES" MENU */}
        <FadeIn delay={0.08}>
          <div ref={carouselRef} className="mb-8 w-full overflow-x-auto pb-3 scrollbar-thin scroll-smooth">
            <div className="flex gap-3 sm:gap-4 min-w-max px-1">
              {categories.map((cat) => {
                const isSelected = category === cat.id
                let displayImg = '/placeholder.png'
                if (dbProducts && dbProducts.length > 0) {
                  if (cat.id === 'Tout') {
                    const firstProd = dbProducts.find(p => p.images && p.images.length > 0)
                    if (firstProd) displayImg = firstProd.images[0].imageUrl
                  } else {
                    const catProd = dbProducts.find(p => p.category?.name?.toLowerCase() === cat.id.toLowerCase() && p.images && p.images.length > 0)
                    if (catProd) displayImg = catProd.images[0].imageUrl
                  }
                }

                return (
                  <button
                    key={cat.id}
                    onClick={(e) => {
                      setCategory(cat.id)
                      const btn = e.currentTarget
                      if (carouselRef.current) {
                        const container = carouselRef.current
                        const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2)
                        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
                      }
                    }}
                    className="group flex flex-col items-center gap-2 w-18 sm:w-22 shrink-0 transition-all relative cursor-pointer"
                  >
                    <div className={`relative size-14 sm:size-16 rounded-full p-0.5 transition-all duration-300 ${isSelected ? 'bg-gradient-to-tr from-[#F3C45E] to-[#E6A635] ring-2 ring-[#E6A635]' : 'bg-transparent hover:bg-[#3B271C]'}`}>
                      <div className="size-full rounded-full overflow-hidden bg-[#241812] relative border border-[#E6A635]/30">
                        <img src={displayImg} alt={cat.label} className={`size-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'} opacity-80`} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
                        <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-black/10' : 'bg-black/40 group-hover:bg-black/20'}`}>
                          <cat.icon className="size-5 text-[#F7F4EE] drop-shadow-md" />
                        </div>
                      </div>
                      
                      <div className="absolute -top-1 -right-1 bg-[#241812] shadow-md border border-[#E6A635]/40 text-[#F2BD52] font-bold text-[8.5px] size-5 flex items-center justify-center rounded-full z-10">
                        {cat.count}
                      </div>
                    </div>
                    <span className={`text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-center transition-colors ${isSelected ? 'text-[#F2BD52]' : 'text-[#EAE4D9]/80 group-hover:text-[#F7F4EE]'}`}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Filter panel */}
        <FadeIn delay={0.12}>
          <div className="mb-8 rounded-3xl border border-[#E6A635]/35 bg-[#3B271C]/90 backdrop-blur-xl shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="size-4 text-[#F2BD52]" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#F7F4EE]">Filtrer les inspirations</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-[#E6A635] text-[9.5px] font-bold text-[#1A110B] shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-[#F2BD52]">
                {showFilters ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            <div className={cn(
              'border-t border-[#E6A635]/20 px-5 py-5 space-y-6 transition-all duration-300 bg-[#241812]/90',
              showFilters ? 'block' : 'hidden'
            )}>

              {/* Color swatches */}
              <div>
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#F2BD52] font-bold">Teinte / Finition</p>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setColor(c.label)}
                      title={c.label}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer"
                    >
                      <div
                        className={cn(
                          'size-8 rounded-full border transition-all duration-300 shadow-sm',
                          color === c.label
                            ? 'scale-110 border-[#E6A635] ring-2 ring-[#E6A635]/50'
                            : 'border-white/30 group-hover:scale-105 group-hover:border-[#E6A635]'
                        )}
                        style={c.hex ? { backgroundColor: c.hex } : { background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                      />
                      <span className={cn(
                        'text-[9.5px] font-semibold uppercase tracking-wider transition-colors',
                        color === c.label ? 'text-[#F2BD52]' : 'text-[#EAE4D9]/70 group-hover:text-[#F7F4EE]'
                      )}>
                        {c.label === 'Tout' ? 'Toutes' : c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension pills */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#F2BD52] font-bold">Dimensions</p>
                  <div className="flex flex-wrap gap-2">
                    {DIMENSIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDimension(d)}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                          dimension === d
                            ? 'bg-[#E6A635] text-[#1A110B] font-bold shadow-md'
                            : 'border border-[#E6A635]/30 bg-[#3B271C] text-[#EAE4D9] hover:border-[#E6A635]'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setCategory('Tout'); setColor('Tout'); setDimension('Tout'); setAiQuery(''); }}
                    className="ml-auto flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" /> Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results count bar */}
        <FadeIn delay={0.15}>
          <div className="mb-6 flex items-center justify-between border-b border-[#E6A635]/20 pb-3">
            <p className="text-xs font-light text-[#EAE4D9]/80">
              Affichage de <span className="text-[#F7F4EE] font-bold">{Math.min(visibleCount, products.length)}</span> sur <span className="text-[#F2BD52] font-bold">{products.length}</span> création{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </FadeIn>

        {/* Grid / Empty State */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="size-10 animate-spin rounded-full border-4 border-[#E6A635]/20 border-t-[#E6A635]" />
            </div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-[#3B271C]/90 rounded-3xl border border-[#E6A635]/35 col-span-full shadow-xl p-8"
            >
              <div className="p-3.5 rounded-full bg-[#241812] border border-[#E6A635]/30 mb-3">
                <Sparkles className="size-6 text-[#F2BD52]" />
              </div>
              <p className="font-heading text-2xl text-[#F7F4EE] mb-2">Aucun modèle trouvé</p>
              <p className="text-xs text-[#EAE4D9]/80 max-w-md">Essayez d&apos;autres critères ou transmettez-nous directement votre idée pour une étude sur-mesure.</p>
              <Link href="/custom-creation" className="btn-sheen mt-5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md">
                Studio Sur-Mesure 3D
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                key={`${category}-${color}-${dimension}-${aiQuery}-${sortBy}`}
                className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
              >
                {products.slice(0, visibleCount).map((model) => (
                  <CatalogProductCard 
                    key={model.id}
                    model={model}
                    colorFilter={color}
                    aiQuery={aiQuery}
                    hoveredId={hoveredId}
                    setHoveredId={setHoveredId}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    setQuickViewProduct={setQuickViewProduct}
                    setQuickViewImageIndex={setQuickViewImageIndex}
                  />
                ))}
              </motion.div>

              {/* LOAD MORE BUTTON */}
              {products.length > visibleCount && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="btn-sheen inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <span>Découvrir d&apos;autres créations</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A110B]/20 text-[10px] font-extrabold text-[#1A110B]">
                      + {Math.min(12, products.length - visibleCount)}
                    </span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
