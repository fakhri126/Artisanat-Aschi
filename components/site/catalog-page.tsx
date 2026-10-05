'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, MessageCircle, Sparkles, Bot, X, SlidersHorizontal, CheckCircle2, Check, ChevronUp, LayoutGrid, Heart, ChevronLeft, ChevronRight, Grid2X2, GripHorizontal, Tv, Frame, DoorClosed, Archive, LayoutDashboard, List, Pipette, ArrowUpDown, ZoomIn, Maximize2, Ruler, ArrowUp, RotateCcw, Columns2, Columns3, Compass, Lamp, Folder, Gem, Palette } from 'lucide-react'
import { cn, formatImageUrl } from '@/lib/utils'
import { FadeIn } from '@/components/motion/fade-in'
import { publicApi, Product, Category, colorsApi, ColorSwatch } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Filter data ────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  { label: 'Tout',          hex: null,      border: 'border-border' },
  { label: 'Blanc',         hex: '#FFFFFF', border: 'border-stone-300' },
  { label: 'Noir',          hex: '#1A1A1A', border: 'border-stone-800' },
  { label: 'Noyer',         hex: '#5C3317', border: 'border-amber-900' },
  { label: 'Bleu',          hex: '#2D5F8A', border: 'border-blue-700' },
  { label: 'Or',            hex: '#C9A84C', border: 'border-yellow-600' },
  { label: 'Naturel',       hex: '#C4A882', border: 'border-amber-300' },
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

const getCategoryIcon = (name: string) => {
  const norm = name.toLowerCase()
  if (norm.includes('buffet')) return GripHorizontal
  if (norm.includes('tv')) return Tv
  if (norm.includes('miroir')) return Frame
  if (norm.includes('porte bijou') || norm.includes('porte-bijou') || norm.includes('porte bijoux') || norm.includes('porte-bijoux')) return Gem
  if (norm.includes('porte')) return DoorClosed
  if (norm.includes('lustre')) return Lamp
  if (norm.includes('lampe') || norm.includes('coffre') || norm.includes('luminaire')) return Lamp
  if (norm.includes('décoration') || norm.includes('deco')) return Sparkles
  if (norm.includes('table')) return LayoutDashboard
  return Folder
}

function CategoryIcon({ name, isSelected, className = "size-3.5" }: { name: string; isSelected: boolean; className?: string }) {
  const norm = name.toLowerCase()
  const strokeClass = isSelected ? "text-[#1A110B]" : "text-[#F2BD52]"

  if (norm === 'tout') {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }

  if (norm.includes('miroir')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="9" rx="5" ry="7" />
        <path d="M12 16v5M9 21h6" />
      </svg>
    )
  }

  if (norm.includes('décoration') || norm.includes('deco')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 3v3c0 1.5-2 3-2 6a4 4 0 0 0 8 0c0-3-2-4.5-2-6V3M8 21h8" />
      </svg>
    )
  }

  if (norm.includes('buffet')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="1" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="12" y1="9" x2="12" y2="17" />
        <line x1="6" y1="17" x2="5" y2="20" />
        <line x1="18" y1="17" x2="19" y2="20" />
      </svg>
    )
  }

  if (norm.includes('applique')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 13l2.5-7h5l2.5 7H7z" />
        <path d="M12 13v4M12 17h4" />
        <line x1="16" y1="14" x2="16" y2="20" />
      </svg>
    )
  }

  if (norm.includes('chaise')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12v9H6z" />
        <path d="M4 12h16v2H4z" />
        <path d="M6 14v7M18 14v7" />
      </svg>
    )
  }

  if (norm.includes('lampe') || norm.includes('luminaire')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12l2.5-7h5l2.5 7H7z" />
        <path d="M12 12v7M8 19h8" />
      </svg>
    )
  }

  if (norm.includes('lustre')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M7 7c0 2 2 3 5 3s5-1 5-3" />
        <path d="M6 13c0 2 2.5 3 6 3s6-1 6-3" />
        <path d="M9 22h6" />
      </svg>
    )
  }

  if (norm.includes('tv')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 20l2-3h4l2 3" />
      </svg>
    )
  }

  if (norm.includes('porte') && !norm.includes('bijou')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <circle cx="9" cy="12" r="0.8" fill="currentColor" />
        <circle cx="15" cy="12" r="0.8" fill="currentColor" />
      </svg>
    )
  }

  if (norm.includes('table')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16v2H4z" />
        <path d="M12 8v10M7 18h10" />
      </svg>
    )
  }

  if (norm.includes('commode')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="14" rx="1" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="14" x2="15" y2="14" />
        <line x1="6" y1="18" x2="5" y2="21" />
        <line x1="18" y1="18" x2="19" y2="21" />
      </svg>
    )
  }

  if (norm.includes('bureau')) {
    return (
      <svg className={cn(className, strokeClass, "shrink-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="6" rx="1" />
        <line x1="7" y1="9" x2="11" y2="9" />
        <path d="M5 12v8M19 12v8M14 12v8M14 16h5" />
      </svg>
    )
  }

  return <Sparkles className={cn(className, strokeClass, "shrink-0")} />
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

const renderDimensionGauge = (dim: string | null | undefined) => {
  if (!dim) return null
  const d = dim.toLowerCase()
  let level = 2
  let label = 'Moyen'
  let range = '80–150 cm'

  if (d.includes('petit')) {
    level = 1
    label = 'Petit'
    range = '< 80 cm'
  } else if (d.includes('grand')) {
    level = 3
    label = 'Grand'
    range = '> 150 cm'
  } else if (!d.includes('moyen')) {
    label = dim
    range = ''
    level = 0
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-[#241812]/95 border border-[#E6A635]/40 px-2 py-0.5 rounded-md shadow-sm shrink-0 whitespace-nowrap" title={`Format ${label} ${range ? `(${range})` : ''}`}>
      {level > 0 ? (
        <div className="flex items-end gap-[2px] h-3 shrink-0" aria-hidden="true">
          <span className={`w-[3px] rounded-xs transition-all ${level >= 1 ? 'h-1.5 bg-[#F2BD52]' : 'h-1.5 bg-[#E6A635]/25'}`} />
          <span className={`w-[3px] rounded-xs transition-all ${level >= 2 ? 'h-2.5 bg-[#F2BD52]' : 'h-2.5 bg-[#E6A635]/25'}`} />
          <span className={`w-[3px] rounded-xs transition-all ${level >= 3 ? 'h-3.5 bg-[#F2BD52]' : 'h-3.5 bg-[#E6A635]/25'}`} />
        </div>
      ) : (
        <Ruler className="size-3 text-[#F2BD52] stroke-[2.4]" />
      )}
      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#F7F4EE]">{label}</span>
      {range && (
        <span className="text-[8.5px] text-[#D8C7B4] font-medium border-l border-[#E6A635]/30 pl-1 ml-0.5 lowercase font-mono">
          {range}
        </span>
      )}
    </div>
  )
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
  const words = t.split(/[\s,.'’"()/-]+/).map(w => w.trim()).filter(Boolean);

  // For short terms (<= 3 chars, e.g. "or", "tv", "bois"), enforce exact whole-word match
  if (term.length <= 3) {
    return words.includes(term) || t === term;
  }

  if (t.includes(term)) return true;

  // If term is long enough, allow 1-2 typos
  if (term.length >= 4) {
    const maxTypos = term.length >= 6 ? 2 : 1;
    return words.some(w => levenshtein(term, w) <= maxTypos);
  }
  return false;
}

function matchColorFlexible(target: string, itemColor: string | null | undefined): boolean {
  if (!itemColor || !target) return false
  const t = target.trim().toLowerCase()
  const c = itemColor.trim().toLowerCase()
  
  if (t === 'tout' || !t) return true
  if (c === 'original') return false // "Original" is a view label, not a color

  // Extract distinct words from target and color
  const tWords = t.split(/[\s,.'’"()/-]+/).map(w => w.trim()).filter(Boolean)
  const cWords = c.split(/[\s,.'’"()/-]+/).map(w => w.trim()).filter(Boolean)

  // 1. White group
  const isWhiteTarget = tWords.some(w => ['blanc', 'blanche', 'ceruse', 'cérusé', 'white'].includes(w))
  const isWhiteItem = cWords.some(w => ['blanc', 'blanche', 'ceruse', 'cérusé', 'white'].includes(w))
  if (isWhiteTarget) return isWhiteItem

  // 2. Gold group
  const isGoldTarget = tWords.some(w => ['or', 'doré', 'dore', 'gold', 'jaune'].includes(w))
  const isGoldItem = cWords.some(w => ['or', 'doré', 'dore', 'gold', 'jaune'].includes(w))
  if (isGoldTarget) return isGoldItem

  // 3. Blue group
  const isBlueTarget = tWords.some(w => ['bleu', 'bleue', 'blue', 'cyan', 'cobalt'].includes(w))
  const isBlueItem = cWords.some(w => ['bleu', 'bleue', 'blue', 'cyan', 'cobalt'].includes(w))
  if (isBlueTarget) return isBlueItem

  // 4. Walnut / Wood / Natural group
  const isWoodTarget = tWords.some(w => ['noyer', 'bois', 'naturel', 'marron', 'brun', 'chêne'].includes(w))
  const isWoodItem = cWords.some(w => ['noyer', 'bois', 'naturel', 'marron', 'brun', 'chêne'].includes(w))
  if (isWoodTarget) return isWoodItem

  // 5. Green group
  const isGreenTarget = tWords.some(w => ['vert', 'verte', 'green', 'olivier'].includes(w))
  const isGreenItem = cWords.some(w => ['vert', 'verte', 'green', 'olivier'].includes(w))
  if (isGreenTarget) return isGreenItem

  // 6. Bordeaux / Red group
  const isBordeauxTarget = tWords.some(w => ['bordeaux', 'rouge', 'red'].includes(w))
  const isBordeauxItem = cWords.some(w => ['bordeaux', 'rouge', 'red'].includes(w))
  if (isBordeauxTarget) return isBordeauxItem

  // 7. Black group
  const isBlackTarget = tWords.some(w => ['noir', 'noire', 'black'].includes(w))
  const isBlackItem = cWords.some(w => ['noir', 'noire', 'black'].includes(w))
  if (isBlackTarget) return isBlackItem

  // Direct exact match
  if (c === t) return true

  return false
}

// ─── Mock data fallback ──────────────────────────────────────────────────────

const MOCK_MODELS: Product[] = []

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

  // Mobile Touch Swipe Handler for multi-angle pictures
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || !hasMultipleImages) return
    const diff = touchStartX - touchEndX
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped left -> Next image
        setActiveImageIndex((i: number) => (i === model.images.length - 1 ? 0 : i + 1))
      } else {
        // Swiped right -> Previous image
        setActiveImageIndex((i: number) => (i === 0 ? model.images.length - 1 : i - 1))
      }
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

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
       
       if (targetColor && matchColorFlexible(targetColor, label)) {
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
    
  const image = formatImageUrl(currentImage?.imageUrl, '/placeholder.png')
  const variantImageUrl = variantImage ? formatImageUrl(variantImage.imageUrl, '/placeholder.png') : image
  const displayColor = isAIVariantDisplayed && variantImage ? variantImage.colorLabel : (hasMultipleImages ? currentImage.colorLabel : model.color)

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
      }}
      onHoverStart={() => setHoveredId(model.id)}
      onHoverEnd={() => setHoveredId(null)}
      className="group relative flex flex-col p-2 sm:p-4 rounded-[1.25rem] sm:rounded-[2rem] bg-[#3B271C]/90 hover:bg-[#452E21]/95 border border-[#E6A635]/35 hover:border-[#E6A635]/80 shadow-[0_12px_30px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_45px_rgba(230,166,53,0.25)] backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* MODERN ARTISANAL PHOTO ARCH FRAME */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[1.1rem] sm:rounded-t-[1.8rem] rounded-b-xl bg-[#2C1E16]/5 border border-[#E8DCCB]/60 shadow-inner group/img flex items-center justify-center select-none"
      >
        
        {/* Ambient Blurred Luxury Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-125"
          style={{ backgroundImage: `url(${image})` }}
        />

        {/* Main photo / AI Variant */}
        {isAIVariantDisplayed && variantImage ? (
          <>
            <motion.img
              src={variantImageUrl}
              alt={model.name}
              className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
            />
            <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#E6A635]/95 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-md border border-[#F2BD52]">
              <Bot className="size-2.5 sm:size-3 text-[#1A110B]" />
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#1A110B]">IA : {variantImage.colorLabel}</span>
            </div>
          </>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={image}
                src={image}
                alt={model.name}
                className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
              />
            </AnimatePresence>
          </>
        )}

        {/* BADGES */}
        {isAIVariantDisplayed && (
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-[#E6A635] to-amber-600 px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-md backdrop-blur-md border border-white/20">
            <Sparkles className="size-2.5 sm:size-3 text-[#1A110B]" />
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#1A110B]">IA : {displayColor}</span>
          </div>
        )}
        {!isAIVariantDisplayed && currentImage && currentImage.id !== primaryImage?.id && !isOriginal(currentImage.colorLabel) && (
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#E6A635]/95 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-md border border-[#F2BD52]">
            <Bot className="size-2.5 sm:size-3 text-[#1A110B]" />
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#1A110B]">IA : {currentImage.colorLabel}</span>
          </div>
        )}

        {/* FLOATING ACTION BUTTONS */}
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(e, model.id); }}
            aria-label={favorites.includes(model.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`size-7.5 sm:size-9 rounded-full backdrop-blur-md transition-all shadow-md flex items-center justify-center active:scale-95 cursor-pointer ${
              favorites.includes(model.id)
                ? 'bg-[#241812] text-red-400 border border-red-500/60 ring-2 ring-red-500/20'
                : 'bg-[#241812]/90 hover:bg-[#3B271C] text-[#EAE4D9] hover:text-red-400 border border-[#E6A635]/40'
            }`}
            title="Ajouter aux favoris"
          >
            <Heart className={`size-3.5 sm:size-4 transition-colors ${favorites.includes(model.id) ? 'fill-red-400' : ''}`} />
          </button>

          {/* Loupe button: Desktop only, hidden on mobile */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            aria-label="Aperçu rapide du modèle (Loupe)"
            className="size-7.5 sm:size-9 rounded-full bg-[#241812]/95 hover:bg-[#3B271C] text-[#F2BD52] hover:text-white backdrop-blur-md border border-[#E6A635]/50 shadow-lg transition-all items-center justify-center active:scale-90 cursor-pointer hidden sm:flex"
            title="Aperçu rapide (Loupe)"
          >
            <ZoomIn className="size-3.5 sm:size-4 text-[#F2BD52]" />
          </button>
        </div>

        {/* HOVER EXPLORE BUTTON */}
        <div className="absolute bottom-3 inset-x-3 z-20 transition-all duration-300 opacity-0 group-hover/img:opacity-100 translate-y-2 group-hover/img:translate-y-0 hidden sm:block">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            className="btn-sheen w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ZoomIn className="size-3.5" /> Explorer l&apos;inspiration
          </button>
        </div>

        {/* PRO CARD NAVIGATION ARROWS */}
        {hasMultipleImages && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImageIndex((i: number) => i === 0 ? model.images.length - 1 : i - 1)
              }}
              className="size-8 rounded-full bg-[#2C1E16]/90 hover:bg-[#E6A635] hover:text-[#1A110B] text-white backdrop-blur-md transition-all pointer-events-auto shadow-lg flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 group/arrow"
              title="Photo précédente"
            >
              <ChevronLeft className="size-4 transition-transform group-hover/arrow:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImageIndex((i: number) => i === model.images.length - 1 ? 0 : i + 1)
              }}
              className="size-8 rounded-full bg-[#2C1E16]/90 hover:bg-[#E6A635] hover:text-[#1A110B] text-white backdrop-blur-md transition-all pointer-events-auto shadow-lg flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 group/arrow"
              title="Photo suivante"
            >
              <ChevronRight className="size-4 transition-transform group-hover/arrow:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* PHOTO PROGRESS DOTS / COUNTER */}
        {hasMultipleImages && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md">
            {model.images.map((_: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImageIndex(idx)
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === activeImageIndex
                    ? 'w-3.5 h-1.5 bg-[#F2BD52]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
                title={`Vue ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* VIEW COUNT BADGE - Desktop only */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-20 px-2.5 py-0.5 rounded-full bg-[#241812]/85 backdrop-blur-md text-[8.5px] font-bold text-[#F2BD52] border border-[#E6A635]/30 group-hover/img:hidden hidden sm:block">
            📷 {model.images.length} vues
          </div>
        )}

        {/* Main Product Link */}
        <Link href={`/produits/${model.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* MULTI-ANGLE THUMBNAILS SELECTOR - Desktop only */}
      {hasMultipleImages && !isAIVariantDisplayed && (
        <div className="pt-2 pb-0.5 hidden sm:flex gap-1.5 overflow-x-auto z-20 relative pointer-events-auto px-0.5 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {model.images.map((img: any, idx: number) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImageIndex(idx)
              }}
              className={`relative size-7 sm:size-8 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                idx === activeImageIndex 
                  ? 'border-[#F2BD52] opacity-100 scale-105 shadow-md ring-2 ring-[#F2BD52]/40' 
                  : 'border-white/30 opacity-60 hover:opacity-100 shadow-xs'
              }`}
            >
              <img
                src={formatImageUrl(img.imageUrl, '/placeholder.png')}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* DETAILS SECTION */}
      <div className="pt-2.5 sm:pt-3 px-0.5 sm:px-1 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3 text-left">
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.2em] font-extrabold text-[#F2BD52] truncate min-w-0">
              {model.category?.name || 'Création Unique'}
            </span>
            {!model.category?.name?.toLowerCase().includes('lustre') && renderDimensionGauge(model.dimensions)}
          </div>
          
          <Link href={`/produits/${model.id}`} className="block group/link">
            <h3 className="font-serif text-[13px] sm:text-base md:text-lg font-bold leading-snug text-[#F7F4EE] group-hover/link:text-[#F2BD52] transition-colors line-clamp-1" title={model.name}>
              {model.name ? model.name.replace(/--+/g, '—').trim() : 'Création Exclusive'}
            </h3>
          </Link>

          <p className="text-[10px] sm:text-[11.5px] text-[#D8C7B4]/80 font-medium tracking-wide line-clamp-1 mt-0.5">
            {model.materials || 'Bois massif noble & Céramique artisanale'}
          </p>
        </div>

        <div className="pt-2 sm:pt-2.5 border-t border-[#E6A635]/25 flex items-center justify-between gap-1.5">
          {displayColor && displayColor.toLowerCase() !== 'original' && displayColor.toLowerCase() !== 'non spécifié' && !model.category?.name?.toLowerCase().includes('lustre') ? (
            <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[11px] text-[#EAE4D9] font-bold uppercase tracking-wider truncate">
              <span className="size-2.5 sm:size-3 rounded-full border border-black/20 shrink-0 shadow-sm" style={{ background: getColorHex(displayColor) }} />
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{displayColor}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#F2BD52]/80 font-semibold tracking-wider uppercase truncate">
              <span>✦ Sur-mesure</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-md shrink-0">
            <span className="font-serif text-[11px] sm:text-xs md:text-sm font-extrabold tracking-wide whitespace-nowrap">
              {model.price ? `${model.price} TND` : 'Sur demande'}
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
  const [availableColors, setAvailableColors] = useState<{ label: string; hex: string | null; border?: string }[]>(DEFAULT_COLORS)
  const [aiQuery, setAiQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [viewDensity, setViewDensity] = useState<'standard' | 'spacious'>('standard')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const [showGoldCard, setShowGoldCard] = useState(false)
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [catFilterOpen, setCatFilterOpen] = useState(true)
  const [colorFilterOpen, setColorFilterOpen] = useState(true)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  
  const [categories, setCategories] = useState<{ id: string; label: string; icon: any; count: number }[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)
  const thumbCarouselRef = useRef<HTMLDivElement>(null)
  const gridTopRef = useRef<HTMLDivElement>(null)

  const scrollToGridTop = () => {
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const el = document.getElementById('catalog-grid-start')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    scrollToGridTop()
  }

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

  // Quick View Touch Swipe
  const [qvTouchStart, setQvTouchStart] = useState<number | null>(null)
  const [qvTouchEnd, setQvTouchEnd] = useState<number | null>(null)

  const handleQvTouchStart = (e: React.TouchEvent) => {
    setQvTouchStart(e.targetTouches[0].clientX)
  }
  const handleQvTouchMove = (e: React.TouchEvent) => {
    setQvTouchEnd(e.targetTouches[0].clientX)
  }
  const handleQvTouchEnd = () => {
    if (qvTouchStart === null || qvTouchEnd === null || !quickViewProduct) return
    const diff = qvTouchStart - qvTouchEnd
    const total = quickViewProduct.images?.length || 0
    if (Math.abs(diff) > 35 && total > 1) {
      if (diff > 0) {
        setQuickViewImageIndex(i => (i === total - 1 ? 0 : i + 1))
      } else {
        setQuickViewImageIndex(i => (i === 0 ? total - 1 : i - 1))
      }
    }
    setQvTouchStart(null)
    setQvTouchEnd(null)
  }

  // Smooth Category Navigation
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkCategoryScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 8)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8)
    }
  }

  useEffect(() => {
    checkCategoryScroll()
    const el = carouselRef.current
    if (el) {
      el.addEventListener('scroll', checkCategoryScroll, { passive: true })
      window.addEventListener('resize', checkCategoryScroll)
      return () => {
        el.removeEventListener('scroll', checkCategoryScroll)
        window.removeEventListener('resize', checkCategoryScroll)
      }
    }
  }, [categories])

  const scrollCategories = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -280 : 280
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      setTimeout(checkCategoryScroll, 350)
    }
  }

  const handleCategorySelect = (catId: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    setCategory(catId)
    if (e && carouselRef.current) {
      const btn = e.currentTarget
      const container = carouselRef.current
      const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2)
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
    }
  }

  // Scroll To Top Floating Trigger
  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
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

  const [dbCategories, setDbCategories] = useState<Category[]>([])

  const isHandleProduct = (p: Product) => {
    const catName = p.category?.name?.toLowerCase() || ''
    const name = p.name?.toLowerCase() || ''
    if (catName.includes("porte bijou") || catName.includes("porte-bijou") || catName.includes("porte bijoux") || name.includes("porte bijou") || name.includes("porte-bijou") || name.includes("porte bijoux")) {
      return false
    }
    return (
      catName.includes("bijoux de porte") || 
      catName.includes("ronds") || 
      catName.includes("ovales") || 
      catName.includes("poignée") ||
      catName.includes("poignee") ||
      name.includes("bouton majolique") || 
      name.includes("petite poignée") ||
      name.includes("grand rond") ||
      name.includes("bouton ovale")
    )
  }

  async function loadData(retryCount = 0) {
    setLoading(true)
    setLoadError(false)
    try {
      console.log(`[Catalog] Chargement des créations (tentative ${retryCount + 1})...`)
      
      // Fetch products, categories, colors in parallel but with individual fallbacks
      const [prodData, catData, colorData] = await Promise.all([
        publicApi.getProducts({ type: 'CATALOGUE' })
          .catch(async (err) => {
            console.warn('[Catalog] Filtre CATALOGUE a échoué, essai avec fallback global:', err)
            return publicApi.getProducts().catch(() => [])
          }),
        publicApi.getCategories().catch(err => {
          console.warn('[Catalog] getCategories a échoué:', err)
          return [] as Category[]
        }),
        colorsApi.getColors().catch(() => [])
      ])

      const validProds = Array.isArray(prodData) ? prodData : []
      
      // If empty on first attempt and retryCount < 2, auto-retry in 2s (in case backend is waking up on Render)
      if (validProds.length === 0 && retryCount < 2) {
        console.log(`[Catalog] Réponse vide, nouvelle tentative dans 2.5s (${retryCount + 1}/3)...`)
        setTimeout(() => loadData(retryCount + 1), 2500)
        return
      }

      if (validProds.length === 0) {
        setLoadError(true)
      } else {
        const catalogItems = validProds.filter(p => !isHandleProduct(p))
        setDbProducts(catalogItems.length > 0 ? catalogItems : validProds)
        setLoadError(false)
      }

      if (Array.isArray(colorData) && colorData.length > 0) {
        setAvailableColors([
          { label: 'Tout', hex: null, border: 'border-border' },
          ...colorData.map((c: ColorSwatch) => ({
            label: c.name || c.label,
            hex: c.hex,
            border: (c.name || c.label).toLowerCase().includes('blanc') ? 'border-stone-300' : 'border-border'
          }))
        ])
      }

      const validCats = Array.isArray(catData) ? catData : []
      const isHandleCat = (c: Category) => {
        const catName = c.name?.toLowerCase() || ''
        if (catName.includes("porte bijou") || catName.includes("porte-bijou") || catName.includes("porte bijoux")) {
          return false
        }
        return (
          catName.includes("bijoux de porte") || 
          catName.includes("ronds") || 
          catName.includes("ovales") || 
          catName.includes("poignée") ||
          catName.includes("poignee")
        )
      }
      const rawCats = validCats.filter(c => !isHandleCat(c))
      if (!rawCats.some(c => c.name.toLowerCase().includes('lustre'))) {
        rawCats.push({ id: 999, name: 'Lustres', description: 'Lustres et suspensions artisanales' } as any)
      }
      if (!rawCats.some(c => c.name.toLowerCase().includes('porte bijou') || c.name.toLowerCase().includes('porte bijoux'))) {
        rawCats.push({ id: 998, name: 'Porte Bijoux', description: 'Porte-bijoux et présentoirs artisanaux' } as any)
      }
      setDbCategories(rawCats)
    } catch (err) {
      console.error("[Catalog] Erreur lors du chargement des créations:", err)
      if (retryCount < 2) {
        setTimeout(() => loadData(retryCount + 1), 2500)
        return
      }
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Derive dynamic categories purely from actual products & DB categories
  useEffect(() => {
    const allProducts = dbProducts
    const counts: Record<string, number> = {}

    // Count products per actual category
    allProducts.forEach(p => {
      const catName = p.category?.name?.trim()
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1
      }
    })

    // Only display categories that actually contain creations in the catalogue
    // This ensures renamed or deleted categories (e.g., 'Lampes Coffres') never ghost
    const activeCatNames = Object.keys(counts).filter(catName => counts[catName] > 0)

    const dynamicCategories = activeCatNames.map(catName => ({
      id: catName,
      label: catName,
      icon: getCategoryIcon(catName),
      count: counts[catName]
    }))

    setCategories([
      { id: 'Tout', label: 'Tout', icon: Grid2X2, count: allProducts.length },
      ...dynamicCategories
    ])
  }, [dbProducts, dbCategories])

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
        // No perfect match -> Show Gold Card, but fallback to partial matches if color matches
        needsGoldCard = true
        
        // If a specific color keyword is in the query (e.g. "blanc"), enforce that returned products MUST match that color!
        const colorWords = ['blanc', 'blanche', 'or', 'doré', 'dore', 'bleu', 'bleue', 'noyer', 'naturel', 'vert', 'verte', 'bordeaux', 'rose', 'gris', 'grise', 'noir', 'noire', 'rouge']
        const typedColor = searchTerms.find(term => colorWords.includes(term))

        let partialMatches = filtered.filter(p => {
          if (typedColor) {
            const matchesColor = isFuzzyMatch(typedColor, p.color) || p.images?.some(img => isFuzzyMatch(typedColor, img.colorLabel))
            if (!matchesColor) return false
          }
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
        } else {
          filtered = []
        }
      }
    }

    if (category !== 'Tout') {
      filtered = filtered.filter(p => p.category?.name?.toLowerCase() === category.toLowerCase())
    }
    if (color !== 'Tout') {
      const targetColor = color.trim().toLowerCase()
      filtered = filtered.filter(p => {
        const matchesMain = matchColorFlexible(targetColor, p.color)
        const matchesVariant = p.images?.some(img => matchColorFlexible(targetColor, img.colorLabel))
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

    // Trigger gold custom creation card if color or dimension filter is active but no matching items exist
    if (filtered.length === 0 && (color !== 'Tout' || dimension !== 'Tout') && !isAiSearchActive) {
       needsGoldCard = true
    }

    let sorted = [...filtered]

    const getColorRank = (p: Product) => {
      const c = (p.color || '').toLowerCase()
      const n = (p.name || '').toLowerCase()
      if (c.includes('blanc') || c.includes('cérusé') || n.includes('blanc')) return 1
      if (c.includes('or') || c.includes('doré') || c.includes('dore') || c.includes('jaune') || n.includes(' or ') || n.includes('doré') || n.startsWith('buffet or')) return 2
      if (c.includes('noyer') || c.includes('naturel') || c.includes('bois') || n.includes('noyer')) return 3
      if (c.includes('bleu') || n.includes('bleu')) return 4
      return 5
    }

    const getSizeRank = (p: Product) => {
      const d = (p.dimensions || '').toLowerCase()
      const n = (p.name || '').toLowerCase()
      if (d.includes('petit') || n.includes('petit')) return 1
      if (d.includes('moyen') || n.includes('moyen')) return 2
      if (d.includes('grand') || n.includes('grand')) return 3
      return 4
    }

    const getModelNum = (p: Product) => {
      const match = (p.name || '').match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      return match ? parseInt(match[1], 10) : 999999
    }

    if (sortBy === 'featured') {
      sorted.sort((a, b) => {
        // Group by category if viewing all
        const catA = (a.category?.name || '').toLowerCase()
        const catB = (b.category?.name || '').toLowerCase()
        if (category === 'Tout' && catA !== catB) {
          return catA.localeCompare(catB)
        }

        // Within the same category: order strictly by Model number (Modèle 01, 02, 03... N)
        const numA = getModelNum(a)
        const numB = getModelNum(b)
        if (numA !== numB) return numA - numB

        const sizeDiff = getSizeRank(a) - getSizeRank(b)
        if (sizeDiff !== 0) return sizeDiff

        return (Number(a.id) || 0) - (Number(b.id) || 0)
      })
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const numA = getModelNum(a)
        const numB = getModelNum(b)
        const baseA = (a.name || '').replace(/(?:Modèle|Modele|N°|#)\s*\d+/i, '').trim().toLowerCase()
        const baseB = (b.name || '').replace(/(?:Modèle|Modele|N°|#)\s*\d+/i, '').trim().toLowerCase()
        if (baseA === baseB && numA !== numB) {
          return numA - numB
        }
        return (a.name || '').localeCompare(b.name || '', 'fr', { numeric: true })
      })
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
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden sm:overflow-y-auto"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#3B271C] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border-t sm:border border-[#E6A635]/40 flex flex-col md:flex-row relative max-h-[90dvh] sm:max-h-[90vh] my-0 sm:my-auto text-[#F7F4EE]"
            >
              {/* Mobile Drag Indicator Bar */}
              <div 
                onClick={() => setQuickViewProduct(null)}
                className="md:hidden flex justify-center py-2.5 cursor-pointer bg-[#241812]/60 shrink-0 border-b border-[#E6A635]/20"
              >
                <div className="w-12 h-1 bg-[#E6A635]/40 rounded-full" />
              </div>

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 p-2 sm:p-2.5 bg-[#241812]/85 hover:bg-[#241812] text-[#F7F4EE] rounded-full backdrop-blur-md border border-[#E6A635]/35 transition-all shadow-md cursor-pointer"
                title="Fermer"
              >
                <X className="size-4 sm:size-5" />
              </button>

              {/* Left Side: Photo Showcase (Mobile Touch Swipeable) */}
              <div 
                onTouchStart={handleQvTouchStart}
                onTouchMove={handleQvTouchMove}
                onTouchEnd={handleQvTouchEnd}
                className="w-full md:w-1/2 relative bg-[#2C1E16]/30 aspect-[16/10] sm:aspect-[4/5] md:aspect-auto h-[220px] sm:h-[320px] md:h-[560px] border-b md:border-b-0 md:border-r border-[#E6A635]/25 overflow-hidden group select-none flex items-center justify-center p-2 sm:p-4 shrink-0"
              >
                {/* Ambient Blurred Luxury Backdrop */}
                {quickViewProduct.images && quickViewProduct.images[quickViewImageIndex] && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125"
                    style={{ backgroundImage: `url(${formatImageUrl(quickViewProduct.images[quickViewImageIndex]?.imageUrl)})` }}
                  />
                )}

                {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={quickViewImageIndex}
                        src={formatImageUrl(quickViewProduct.images[quickViewImageIndex]?.imageUrl, '/placeholder.png')} 
                        alt={quickViewProduct.name}
                        className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-md rounded-xl"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                    </AnimatePresence>

                    {/* Photo Counter Pill */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#2C1E16]/80 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-md border border-white/20 text-white text-[9.5px] sm:text-[10px] font-bold">
                        <span>📷 Photo {quickViewImageIndex + 1} / {quickViewProduct.images.length}</span>
                      </div>
                    )}

                    {/* Pro Navigation Arrows */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === 0 ? (quickViewProduct.images?.length || 1) - 1 : i - 1); }}
                          className="p-2 sm:p-2.5 bg-[#3A2A21]/80 hover:bg-[#C17D59] text-white rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-xl border border-white/20 hover:scale-110 active:scale-95 group/arrow"
                          title="Image précédente"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === (quickViewProduct.images?.length || 1) - 1 ? 0 : i + 1); }}
                          className="p-2 sm:p-2.5 bg-[#3A2A21]/80 hover:bg-[#C17D59] text-white rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-xl border border-white/20 hover:scale-110 active:scale-95 group/arrow"
                          title="Image suivante"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}

                    {/* Image Thumbnails Strip */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute bottom-2.5 sm:bottom-4 inset-x-3 flex justify-center z-20">
                        <div 
                          ref={thumbCarouselRef}
                          className="flex gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth py-1 px-2 max-w-full scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-black/45 backdrop-blur-md border border-white/20"
                        >
                          {quickViewProduct.images.map((img: any, idx: number) => (
                            <button 
                              key={img.id || idx}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(idx); }}
                              className={`size-9 sm:size-11 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer shadow-md ${
                                idx === quickViewImageIndex ? 'border-[#F2BD52] scale-105 ring-2 ring-[#F2BD52]/40 opacity-100' : 'border-white/50 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={formatImageUrl(img.imageUrl, '/placeholder.png')}
                                alt=""
                                className="size-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#241812]">
                    <span className="text-[#EAE4D9]/60 font-light text-xs">Aucune image disponible</span>
                  </div>
                )}
              </div>

              {/* Right Side: Details & Actions */}
              <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0 overflow-hidden text-[#F7F4EE]">
                {/* Scrollable details container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-7 text-left space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#F2BD52] bg-[#241812]/90 px-2.5 py-0.5 rounded-full border border-[#E6A635]/35 inline-block mb-1.5">
                        {quickViewProduct.category?.name || 'Création d\'Atelier'}
                      </span>
                      <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-light text-gold-gradient leading-tight">
                        {quickViewProduct.name}
                      </h3>
                    </div>

                    <button 
                      type="button"
                      onClick={(e) => toggleFavorite(e, quickViewProduct.id)}
                      className={`p-2 rounded-full border transition-all shadow-sm shrink-0 cursor-pointer ${
                        favorites.includes(quickViewProduct.id)
                          ? 'bg-[#241812] border-red-500/50 text-red-400'
                          : 'bg-[#241812]/90 border-[#E6A635]/35 text-[#EAE4D9] hover:text-red-400'
                      }`}
                      title="Ajouter aux favoris"
                    >
                      <Heart className={`size-4 ${favorites.includes(quickViewProduct.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <p className="text-[#EAE4D9]/85 font-light text-xs sm:text-sm leading-relaxed">
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
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/30">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                          <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Dimensions</p>
                          <p className="text-xs font-semibold text-[#F7F4EE] truncate">📏 {actualDimension}</p>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                          <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Matière</p>
                          <p className="text-xs font-semibold text-[#F7F4EE] truncate">🪵 {quickViewProduct.materials || 'Bois massif'}</p>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                          <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Finition / Teinte</p>
                          <p className="text-xs font-semibold text-[#F7F4EE] flex items-center gap-1.5 truncate">
                            <span className="size-2.5 rounded-full inline-block border border-black/10 shrink-0" style={{ background: getColorHex(actualColor) }} />
                            <span className="truncate">{actualColor}</span>
                          </p>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#3B271C] border border-[#E6A635]/25">
                          <p className="text-[8.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">Prix Indicatif</p>
                          <p className="text-xs font-bold text-[#F2BD52] font-heading truncate">
                            {quickViewProduct.price ? `${quickViewProduct.price} TND` : 'Prix sur demande'}
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Artisan Trust Callout */}
                  <div className="p-3 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/35 text-[11px] text-[#FAF7F2] space-y-1 shadow-sm">
                    <div className="flex items-center gap-2 text-[#F2BD52] font-bold">
                      <Palette className="size-3.5" />
                      <span>Personnalisation d&apos;Atelier</span>
                    </div>
                    <p className="text-[#EAE4D9]/80 text-[10.5px] leading-relaxed">
                      Chaque création est façonnée à la main. Vous pouvez nous demander ce modèle dans d&apos;autres essences de bois, teintes ou dimensions sur-mesure.
                    </p>
                  </div>
                </div>

                {/* Sticky CTAs Footer (Mobile & Desktop) */}
                <div className="p-3 sm:p-5 bg-[#241812]/95 sm:bg-[#241812]/80 backdrop-blur-md border-t border-[#E6A635]/25 flex flex-col sm:flex-row gap-2 sm:gap-2.5 shrink-0">
                  <a
                    href={`https://wa.me/21698338166?text=${encodeURIComponent("Bonjour Atelier Aschi, je souhaite commander le modèle : " + quickViewProduct.name + " (" + (quickViewProduct.category?.name || "Mobilier d'art") + ")")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-4 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
                  >
                    <MessageCircle className="size-4 text-[#1A110B]" /> Commander sur WhatsApp
                  </a>
                  <Link
                    href={`/produits/${quickViewProduct.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E6A635]/50 bg-[#241812]/90 hover:bg-[#3B271C] px-4 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EE] transition-all active:scale-95"
                  >
                    <span>Fiche Produit</span>
                    <ChevronRight className="size-3.5" />
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
                  placeholder="Rechercher un modèle, style, teinte..."
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

        {/* CATEGORIES "STORIES" MENU - MODERN & LUXURY WITHOUT ARROWS TRACK & WITHOUT ICONS */}
        <FadeIn delay={0.08}>
          <div className="relative group/catbar mb-6 sm:mb-8">
            {/* Left Floating Nav Arrow (Desktop only, smooth gradient edge) */}
            {canScrollLeft && (
              <div className="absolute left-0 inset-y-0 z-20 hidden md:flex items-center pl-1 pr-6 bg-gradient-to-r from-[#241812] via-[#241812]/80 to-transparent pointer-events-none transition-opacity duration-300">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  aria-label="Catégories précédentes"
                  className="pointer-events-auto size-10 rounded-full bg-[#241812]/95 hover:bg-[#3B271C] text-[#F2BD52] hover:text-white border border-[#E6A635]/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer -ml-1"
                >
                  <ChevronLeft className="size-5" />
                </button>
              </div>
            )}

            {/* Right Floating Nav Arrow (Desktop only, smooth gradient edge) */}
            {canScrollRight && (
              <div className="absolute right-0 inset-y-0 z-20 hidden md:flex items-center pr-1 pl-6 bg-gradient-to-l from-[#241812] via-[#241812]/80 to-transparent pointer-events-none transition-opacity duration-300">
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  aria-label="Catégories suivantes"
                  className="pointer-events-auto size-10 rounded-full bg-[#241812]/95 hover:bg-[#3B271C] text-[#F2BD52] hover:text-white border border-[#E6A635]/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer -mr-1"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}

            {/* Smooth Categories Carousel (Snap scrolling & Hidden Scrollbar on All Devices) */}
            <div
              ref={carouselRef}
              onScroll={checkCategoryScroll}
              className="w-full overflow-x-auto py-2.5 px-3 sm:px-1 scroll-smooth overscroll-x-contain touch-pan-x snap-x snap-proximity [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex gap-3 sm:gap-4 md:gap-5"
            >
              {categories.map((cat) => {
                const isSelected = category === cat.id
                let displayImg = '/placeholder.png'
                if (dbProducts && dbProducts.length > 0) {
                  if (cat.id === 'Tout') {
                    const heroProd = dbProducts.find(p => p.isFeatured && p.images && p.images.length > 0) || dbProducts.find(p => p.images && p.images.length > 0)
                    if (heroProd && heroProd.images?.[0]) displayImg = formatImageUrl(heroProd.images[0].imageUrl, '/placeholder.png')
                  } else {
                    const catProd = dbProducts.find(p => p.category?.name?.toLowerCase() === cat.id.toLowerCase() && p.isFeatured && p.images && p.images.length > 0)
                      || dbProducts.find(p => p.category?.name?.toLowerCase() === cat.id.toLowerCase() && p.images && p.images.length > 0)
                    if (catProd && catProd.images?.[0]) displayImg = formatImageUrl(catProd.images[0].imageUrl, '/placeholder.png')
                  }
                }

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => handleCategorySelect(cat.id, e)}
                    className="group flex flex-col items-center gap-2 w-16 sm:w-20 md:w-22 shrink-0 transition-all relative cursor-pointer select-none snap-center active:scale-95"
                  >
                    {/* Circle Image without any logo overlay */}
                    <div className={`relative size-14 sm:size-17 md:size-19 rounded-full p-[2.5px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#F3C45E] via-[#E6A635] to-[#C78318] ring-2 ring-[#F2BD52] ring-offset-2 ring-offset-[#241812] shadow-[0_0_20px_rgba(242,189,82,0.45)] scale-105'
                        : 'bg-[#241812] border border-[#E6A635]/35 hover:border-[#E6A635]/80 hover:scale-105 shadow-md'
                    }`}>
                      <div className="size-full rounded-full overflow-hidden bg-[#1A110B] relative">
                        <img
                          src={displayImg}
                          alt={cat.label}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                        />
                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/25 pointer-events-none" />
                      </div>

                      {/* Count badge */}
                      <div className={`absolute -top-1 -right-1 shadow-md font-bold text-[8.5px] sm:text-[9.5px] size-5 sm:size-5.5 flex items-center justify-center rounded-full z-10 transition-transform ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#F3C45E] to-[#E6A635] text-[#1A110B] border border-white/40 ring-1 ring-[#F2BD52] scale-105'
                          : 'bg-[#241812] text-[#F2BD52] border border-[#E6A635]/45 group-hover:border-[#E6A635]'
                      }`}>
                        {cat.count}
                      </div>
                    </div>

                    {/* Label */}
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center transition-colors line-clamp-1 max-w-full ${
                      isSelected ? 'text-[#F2BD52]' : 'text-[#EAE4D9]/80 group-hover:text-[#F7F4EE]'
                    }`}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* RESPONSIVE FILTER & CONTROLS TOOLBAR (Mobile only, hidden on PC) */}
        <FadeIn delay={0.09} className="md:hidden">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-[#3B271C]/75 backdrop-blur-md px-4 py-3 sm:py-3.5 rounded-2xl border border-[#E6A635]/35 shadow-lg">
            {/* Active Category Title & Count */}
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="font-heading text-base sm:text-lg font-light text-gold-gradient truncate">
                {category === 'Tout' ? 'Toutes nos créations' : category}
              </h2>
              <span className="shrink-0 text-[10.5px] font-bold text-[#F2BD52] bg-[#241812] px-2.5 py-0.5 rounded-full border border-[#E6A635]/35">
                {products.length} {products.length > 1 ? 'modèles' : 'modèle'}
              </span>
            </div>

            {/* Controls Bar: Mobile Filter Button, Sort Dropdown & Grid View Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F3C45E]/20 via-[#E6A635]/25 to-[#C78318]/20 hover:from-[#F3C45E]/30 hover:to-[#C78318]/30 border border-[#E6A635]/60 text-[#F2BD52] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="size-4.5 rounded-full bg-[#E6A635] text-[#1A110B] text-[9.5px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Selector (Hidden on mobile) */}
              <div className="relative hidden sm:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Trier par"
                  className="bg-[#241812] border border-[#E6A635]/35 text-[#EAE4D9] text-xs font-semibold rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:border-[#F2BD52] transition-colors cursor-pointer"
                >
                  <option value="featured">N° Modèle (Ordonné)</option>
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A → Z</option>
                </select>
                <ArrowUpDown className="size-3 text-[#F2BD52] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Grid Density Toggle (Available on mobile and desktop) */}
              <button
                type="button"
                onClick={() => setViewDensity(d => d === 'standard' ? 'spacious' : 'standard')}
                className="p-2 rounded-xl bg-[#241812] border border-[#E6A635]/35 text-[#EAE4D9] hover:text-[#F2BD52] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                title={viewDensity === 'standard' ? 'Affichage grand format (1 colonne)' : 'Affichage compact (2 colonnes)'}
                aria-label="Changer la densité d'affichage"
              >
                {viewDensity === 'standard' ? <Columns2 className="size-4 text-[#F2BD52]" /> : <Grid2X2 className="size-4 text-[#F2BD52]" />}
                <span className="text-[10.5px] font-bold text-[#EAE4D9] sm:hidden">
                  {viewDensity === 'standard' ? '2 cols' : '1 col'}
                </span>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* ACTIVE FILTER CHIPS */}
        {(color !== 'Tout' || dimension !== 'Tout' || aiQuery !== '') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#EAE4D9]/60 font-medium">Filtres actifs :</span>
            {color !== 'Tout' && (
              <button
                type="button"
                onClick={() => setColor('Tout')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/50 text-[#F2BD52] text-xs font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: getColorHex(color) }} />
                <span>Teinte : {color}</span>
                <X className="size-3 text-white/70" />
              </button>
            )}
            {dimension !== 'Tout' && (
              <button
                type="button"
                onClick={() => setDimension('Tout')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/50 text-[#F2BD52] text-xs font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <Ruler className="size-3" />
                <span>Format : {dimension}</span>
                <X className="size-3 text-white/70" />
              </button>
            )}
            {aiQuery !== '' && (
              <button
                type="button"
                onClick={() => setAiQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/50 text-[#F2BD52] text-xs font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <Sparkles className="size-3" />
                <span>Recherche : « {aiQuery} »</span>
                <X className="size-3 text-white/70" />
              </button>
            )}
            <button
              type="button"
              onClick={() => { setColor('Tout'); setDimension('Tout'); setAiQuery(''); }}
              className="text-xs text-[#EAE4D9]/70 hover:text-[#F2BD52] underline ml-1 cursor-pointer"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* DESKTOP DIRECT FILTERS: TEINTES & DIMENSIONS (Hidden on mobile for clean UI) */}
        <FadeIn delay={0.1}>
          <div className="hidden md:flex flex-col items-center gap-2.5 mb-8">
            {/* 1. TEINTES DE COULEURS */}
            <div className="w-full flex items-center justify-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none px-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/30 text-[#F2BD52] text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 shadow-sm">
                <Palette className="size-3.5 text-[#F2BD52]" />
                <span>Teintes :</span>
              </div>
              {availableColors.map((c) => {
                const isActive = color === c.label
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setColor(c.label)}
                    className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F3C45E]/20 to-[#E6A635]/30 text-[#F2BD52] border border-[#E6A635] ring-2 ring-[#E6A635]/40 scale-105'
                        : 'bg-[#241812]/80 hover:bg-[#3B271C] text-[#EAE4D9]/85 border border-[#E6A635]/25 hover:border-[#E6A635]/50'
                    }`}
                  >
                    {c.hex ? (
                      <span
                        className={`size-3 rounded-full shrink-0 shadow-sm border ${
                          c.label.toLowerCase().includes('blanc')
                            ? 'border-stone-400'
                            : 'border-white/30'
                        } ${isActive ? 'ring-2 ring-[#F2BD52]' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ) : (
                      <Sparkles className={`size-3 shrink-0 ${isActive ? 'text-[#F2BD52]' : 'text-[#E6A635]/70'}`} />
                    )}
                    <span className="text-xs whitespace-nowrap">{c.label}</span>
                  </button>
                )
              })}
              {color !== 'Tout' && (
                <button
                  type="button"
                  onClick={() => setColor('Tout')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-[#EAE4D9]/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-1"
                  title="Effacer le filtre couleur"
                >
                  <RotateCcw className="size-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {/* 2. DIMENSIONS (PETIT, MOYEN, GRAND) */}
            <div className="w-full flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/30 text-[#F2BD52] text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 shadow-sm">
                <Ruler className="size-3.5 text-[#F2BD52]" />
                <span>Dimensions :</span>
              </div>
              {[
                { label: 'Toutes les tailles', value: 'Tout', range: '' },
                { label: 'Petit', value: 'Petit (< 80 cm)', range: '< 80 cm' },
                { label: 'Moyen', value: 'Moyen (80–150 cm)', range: '80–150 cm' },
                { label: 'Grand', value: 'Grand (> 150 cm)', range: '> 150 cm' },
              ].map((d) => {
                const isActive = dimension === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDimension(d.value)}
                    className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F3C45E]/20 to-[#E6A635]/30 text-[#F2BD52] border border-[#E6A635] ring-2 ring-[#E6A635]/40 scale-105'
                        : 'bg-[#241812]/80 hover:bg-[#3B271C] text-[#EAE4D9]/85 border border-[#E6A635]/25 hover:border-[#E6A635]/50'
                    }`}
                  >
                    <span>{d.label}</span>
                    {d.range && (
                      <span className={`text-[10px] ${isActive ? 'text-[#F7F4EE]' : 'text-[#EAE4D9]/60'} font-normal border-l border-white/20 pl-1.5`}>
                        {d.range}
                      </span>
                    )}
                  </button>
                )
              })}
              {dimension !== 'Tout' && (
                <button
                  type="button"
                  onClick={() => setDimension('Tout')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-[#EAE4D9]/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-1"
                  title="Effacer le filtre dimension"
                >
                  <RotateCcw className="size-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* MOBILE FILTER BOTTOM SHEET (DRAWER) */}
        <AnimatePresence>
          {showFilters && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              />

              {/* Sheet Container */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-lg bg-[#190E08]/98 rounded-t-[2.2rem] border-t border-x border-[#E6A635]/40 max-h-[88vh] flex flex-col shadow-[0_-15px_40px_rgba(0,0,0,0.85)] overflow-hidden text-[#F7F4EE]"
              >
                {/* Drag handle */}
                <div className="pt-3 pb-1.5 flex justify-center cursor-pointer" onClick={() => setShowFilters(false)}>
                  <div className="w-12 h-1 rounded-full bg-[#E6A635]/40" />
                </div>

                {/* Sheet Header */}
                <div className="px-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="size-5 text-[#F2BD52]" />
                    <h3 className="font-heading text-2xl text-[#F7F4EE] font-light tracking-wide">Filtres</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="size-8 rounded-full bg-[#251710] border border-[#E6A635]/35 text-[#F2BD52] hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                    title="Fermer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Sheet Content with relative z-10 and floral watermark background */}
                <div className="px-4 py-3 overflow-y-auto space-y-5 text-left relative flex-1">
                  
                  {/* Floral Arabesque Watermark in bottom right matching photo */}
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 opacity-15 pointer-events-none select-none z-0">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#E6A635" strokeWidth="1.2">
                      <circle cx="50" cy="50" r="14" />
                      <circle cx="50" cy="50" r="28" strokeDasharray="3 3" />
                      <path d="M50 20 C55 35, 65 45, 80 50 C65 55, 55 65, 50 80 C45 65, 35 55, 20 50 C35 45, 45 35, 50 20 Z" />
                      <path d="M29 29 C40 40, 60 40, 71 29 C60 50, 60 50, 71 71 C50 60, 50 60, 29 71 C40 60, 40 40, 29 29 Z" />
                    </svg>
                  </div>

                  {/* 1. Catégorie */}
                  <div className="relative z-10">
                    <div
                      className="flex items-center justify-between gap-2.5 mb-3 cursor-pointer select-none"
                      onClick={() => setCatFilterOpen(!catFilterOpen)}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <LayoutGrid className="size-4 text-[#F2BD52]" />
                        <span className="font-heading text-lg text-[#F7F4EE] font-normal">Catégorie</span>
                      </div>
                      <div className="h-px bg-[#E6A635]/25 flex-1 mx-2" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-[#E6A635]/80 font-light">
                          {categories.find(c => c.id === 'Tout')?.count || dbProducts.length} produits
                        </span>
                        <ChevronUp
                          className={cn(
                            "size-4 text-[#F2BD52] transition-transform duration-200",
                            !catFilterOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {catFilterOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {categories.map((cat) => {
                              const isSelected = category === cat.id
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setCategory(cat.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[11px] transition-all active:scale-95 cursor-pointer select-none",
                                    isSelected
                                      ? "bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold border border-[#F3C45E] shadow-[0_0_15px_rgba(230,166,53,0.5)]"
                                      : "bg-[#251710]/90 hover:bg-[#342217] text-[#EAE4D9] border border-[#E6A635]/30 hover:border-[#E6A635]/60 shadow-sm"
                                  )}
                                >
                                  <CategoryIcon name={cat.label} isSelected={isSelected} className="size-3.5" />
                                  <span className="truncate">{cat.label}</span>
                                  <span
                                    className={cn(
                                      "text-[10px] shrink-0",
                                      isSelected ? "text-[#1A110B]/85 font-extrabold" : "text-[#EAE4D9]/60 font-light"
                                    )}
                                  >
                                    ({cat.count})
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Couleur */}
                  <div className="relative z-10">
                    <div
                      className="flex items-center justify-between gap-2.5 mb-3 cursor-pointer select-none"
                      onClick={() => setColorFilterOpen(!colorFilterOpen)}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <Palette className="size-4 text-[#F2BD52]" />
                        <span className="font-heading text-lg text-[#F7F4EE] font-normal">Couleur</span>
                      </div>
                      <div className="h-px bg-[#E6A635]/25 flex-1 mx-2" />
                      <ChevronUp
                        className={cn(
                          "size-4 text-[#F2BD52] shrink-0 transition-transform duration-200",
                          !colorFilterOpen && "rotate-180"
                        )}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {colorFilterOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            {/* "Tout" Color Option */}
                            {(() => {
                              const isSelected = color === 'Tout'
                              return (
                                <button
                                  type="button"
                                  onClick={() => setColor('Tout')}
                                  className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all active:scale-95 cursor-pointer shadow-sm select-none",
                                    isSelected
                                      ? "border-2 border-[#E6A635] bg-[#2A1C14] text-[#F7F4EE] font-semibold shadow-[0_0_12px_rgba(230,166,53,0.35)]"
                                      : "border border-[#E6A635]/30 bg-[#251710]/90 text-[#EAE4D9] hover:border-[#E6A635]/60"
                                  )}
                                >
                                  {isSelected ? (
                                    <div className="size-5 rounded-full bg-[#F2BD52] flex items-center justify-center text-[#1A110B] shrink-0 font-bold">
                                      <Check className="size-3 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="size-5 rounded-full border border-[#E6A635]/40 flex items-center justify-center text-[#E6A635] shrink-0" />
                                  )}
                                  <span className="truncate">Tout</span>
                                </button>
                              )
                            })()}

                            {/* Other Specific Colors */}
                            {availableColors
                              .filter(c => c.label !== 'Tout')
                              .map((c) => {
                                const isSelected = color === c.label
                                return (
                                  <button
                                    key={c.label}
                                    type="button"
                                    onClick={() => setColor(c.label)}
                                    className={cn(
                                      "flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all active:scale-95 cursor-pointer shadow-sm select-none",
                                      isSelected
                                        ? "border-2 border-[#E6A635] bg-[#2A1C14] text-[#F7F4EE] font-semibold shadow-[0_0_12px_rgba(230,166,53,0.35)]"
                                        : "border border-[#E6A635]/30 bg-[#251710]/90 text-[#EAE4D9] hover:border-[#E6A635]/60"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "size-5 rounded-full shrink-0 relative flex items-center justify-center shadow-sm",
                                        c.label.toLowerCase().includes('blanc') ? 'border border-stone-300' : 'border border-black/30'
                                      )}
                                      style={{ backgroundColor: c.hex || '#cccccc' }}
                                    >
                                      {isSelected && (
                                        <Check
                                          className={cn(
                                            "size-3 stroke-[3]",
                                            c.label.toLowerCase().includes('blanc') || c.label.toLowerCase().includes('or')
                                              ? "text-[#1A110B]"
                                              : "text-white"
                                          )}
                                        />
                                      )}
                                    </div>
                                    <span className="truncate">{c.label}</span>
                                  </button>
                                )
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Dimension */}
                  <div className="relative z-10 pt-1">
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <Ruler className="size-4 text-[#F2BD52]" />
                        <span className="font-heading text-lg text-[#F7F4EE] font-normal">Dimensions</span>
                      </div>
                      <div className="h-px bg-[#E6A635]/25 flex-1 mx-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Toutes tailles', value: 'Tout' },
                        { label: 'Petit (< 80 cm)', value: 'Petit (< 80 cm)' },
                        { label: 'Moyen (80–150 cm)', value: 'Moyen (80–150 cm)' },
                        { label: 'Grand (> 150 cm)', value: 'Grand (> 150 cm)' },
                      ].map((d) => {
                        const isSelected = dimension === d.value
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setDimension(d.value)}
                            className={cn(
                              "flex items-center justify-center px-3 py-2 rounded-full text-xs transition-all active:scale-95 cursor-pointer shadow-sm select-none",
                              isSelected
                                ? "border-2 border-[#E6A635] bg-[#2A1C14] text-[#F7F4EE] font-semibold shadow-[0_0_12px_rgba(230,166,53,0.35)]"
                                : "border border-[#E6A635]/30 bg-[#251710]/90 text-[#EAE4D9] hover:border-[#E6A635]/60"
                            )}
                          >
                            <span>{d.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* Sheet Footer */}
                <div className="p-4 border-t border-[#E6A635]/25 bg-[#20150F]/95 backdrop-blur-md flex items-center gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => { setCategory('Tout'); setColor('Tout'); setDimension('Tout'); }}
                    className="px-4 py-3 rounded-full border border-[#E6A635]/30 text-xs text-[#EAE4D9] hover:text-white hover:border-[#E6A635] cursor-pointer transition-colors active:scale-95"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFilters(false)
                      setTimeout(() => {
                        scrollToGridTop()
                      }, 120)
                    }}
                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
                  >
                    <span>OK</span>
                    <span>•</span>
                    <span>Voir les {products.length} {products.length > 1 ? 'modèles' : 'modèle'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Grid / Empty State */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="size-10 animate-spin rounded-full border-4 border-[#E6A635]/20 border-t-[#E6A635]" />
              <p className="text-xs text-[#EAE4D9]/80 font-light tracking-wide">Chargement de nos créations d&apos;art...</p>
            </div>
          ) : products.length === 0 ? (
            loadError ? (
              <motion.div
                key="load-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-[#3B271C]/90 rounded-3xl border border-[#E6A635]/35 col-span-full shadow-xl p-8"
              >
                <div className="p-3.5 rounded-full bg-[#241812] border border-[#E6A635]/30 mb-3">
                  <Sparkles className="size-6 text-[#F2BD52]" />
                </div>
                <p className="font-heading text-2xl text-[#F7F4EE] mb-2">Connexion à l&apos;Atelier Aschi</p>
                <p className="text-xs text-[#EAE4D9]/80 max-w-md">Le serveur se réveille après une période d&apos;inactivité. Cliquez ci-dessous pour charger immédiatement le catalogue.</p>
                <button
                  type="button"
                  onClick={() => loadData(0)}
                  className="btn-sheen mt-5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
                >
                  Charger le catalogue
                </button>
              </motion.div>
            ) : (
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
                <Link href="/contact" className="btn-sheen mt-5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md">
                  Contacter nos artisans
                </Link>
              </motion.div>
            )
          ) : (
            <>
              {/* Anchor for smooth scroll back to top */}
              <div ref={gridTopRef} id="catalog-grid-start" className="scroll-mt-36 -mb-2" />

              <motion.div
                key={`${category}-${color}-${dimension}-${aiQuery}-${sortBy}-${viewDensity}-${currentPage}`}
                className={`grid gap-4 sm:gap-6 ${
                  viewDensity === 'spacious'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                }`}
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
              >
                {/* ELEGANT ALTERNATIVE BANNER */}
                {showGoldCard && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                    }}
                    className="col-span-full mb-8 relative overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB] p-8 sm:p-10 flex flex-col md:flex-row gap-6 items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="size-5 text-[#C17D59]" />
                        <h2 className="font-serif text-2xl sm:text-3xl text-[#2C1E16]">Découvrez nos alternatives</h2>
                      </div>
                      <p className="text-[#5A453A] text-lg font-light leading-relaxed max-w-2xl">
                        Il semble que nous n'ayons pas encore créé exactement ce que vous cherchez <strong className="text-[#C17D59]">« {aiQuery || color} »</strong>. 
                        Cependant, voici nos créations qui s'en rapprochent le plus. 
                        <br className="hidden sm:block" />
                        Vous pouvez également nous demander de créer votre idée sur-mesure.
                      </p>
                    </div>
                    
                    <Link
                      href={`/contact?message=${encodeURIComponent("Bonjour, j'aimerais commander ce modèle sur-mesure : " + (aiQuery || color))}`}
                      className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A68735] hover:scale-105 transition-transform text-white text-sm font-bold uppercase tracking-wider px-8 py-4 shadow-lg"
                    >
                      <Bot className="size-5" /> Créer sur-mesure avec l'IA
                    </Link>
                  </motion.div>
                )}

                {paginatedProducts.map((model) => (
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

              {/* LUXURY RESPONSIVE PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-14 flex flex-col items-center justify-center gap-4">
                  {/* Mobile Compact Pagination (< sm) */}
                  <div className="flex sm:hidden items-center justify-between w-full max-w-xs gap-3">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2.5 rounded-full border border-[#E6A635]/40 bg-[#241812] text-xs font-bold text-[#F2BD52] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-md cursor-pointer"
                    >
                      ← Précédent
                    </button>
                    <span className="text-xs text-[#EAE4D9] font-medium tracking-wide">
                      Page <strong className="text-[#F2BD52]">{currentPage}</strong> sur {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2.5 rounded-full border border-[#E6A635]/40 bg-[#241812] text-xs font-bold text-[#F2BD52] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-md cursor-pointer"
                    >
                      Suivant →
                    </button>
                  </div>

                  {/* Desktop Numbered Pagination (>= sm) */}
                  <div className="hidden sm:flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="size-10 rounded-full border border-[#E6A635]/40 bg-[#241812] hover:bg-[#3B271C] text-[#F2BD52] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                      title="Page précédente"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`size-10 rounded-full text-xs font-serif font-bold transition-all duration-200 shadow-sm cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#F3C45E] to-[#E6A635] text-[#1A110B] ring-2 ring-[#F2BD52] scale-110 shadow-md font-extrabold'
                              : 'bg-[#241812] hover:bg-[#3B271C] text-[#EAE4D9] hover:text-[#F2BD52] border border-[#E6A635]/30'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="size-10 rounded-full border border-[#E6A635]/40 bg-[#241812] hover:bg-[#3B271C] text-[#F2BD52] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                      title="Page suivante"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Subtle Page Counter */}
                  <p className="text-xs text-[#D8C7B4]/70 font-medium tracking-wide">
                    Page <span className="text-[#F2BD52] font-bold">{currentPage}</span> sur <span className="text-[#F2BD52] font-bold">{totalPages}</span> — <span className="text-[#E6A635] font-semibold">{products.length} créations</span>
                  </p>
                </div>
              )}

              {/* FLOATING SCROLL TO TOP BUTTON */}
              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={scrollToGridTop}
                    aria-label="Retour au début du catalogue"
                    className="fixed bottom-6 right-6 z-40 size-11 rounded-full bg-[#241812]/95 hover:bg-[#3B271C] text-[#F2BD52] hover:text-white border border-[#E6A635]/50 shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="size-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
