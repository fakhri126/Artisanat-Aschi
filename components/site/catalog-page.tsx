'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, MessageCircle, Sparkles, Bot, X, SlidersHorizontal, CheckCircle2, Heart, ChevronLeft, ChevronRight, Grid2X2, GripHorizontal, Tv, Frame, DoorClosed, Archive, LayoutDashboard, List, Pipette, ArrowUpDown } from 'lucide-react'
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
  // If term is long enough, allow 1-2 typos
  if (term.length >= 4) {
    const words = t.split(/[\s,.-]+/);
    // 1 typo for 4-5 chars, 2 typos for 6+ chars
    const maxTypos = term.length >= 6 ? 2 : 1;
    return words.some(w => levenshtein(term, w) <= maxTypos);
  }
  return false;
}

// ─── Mock data fallback ──────────────────────────────────────────────────────

const MOCK_MODELS: Product[] = [
  { 
    id: 5, 
    name: 'Buffet Carthage', 
    category: { id: 1, name: 'Buffets', type: '' }, 
    images: [
      { id: 101, imageUrl: '/buffet-carthage-face-principale.jpg', isPrimary: true, colorLabel: 'Original' },
      { id: 102, imageUrl: '/buffet-carthage-angle-gauche.jpg', isPrimary: false, colorLabel: 'Original' },
      { id: 103, imageUrl: '/buffet-carthage-angle-droit.jpg', isPrimary: false, colorLabel: 'Original' },
      { id: 104, imageUrl: '/buffet-carthage-vue-gauche.jpg', isPrimary: false, colorLabel: 'Original' },
      { id: 105, imageUrl: '/buffet-carthage-vue-droite.jpg', isPrimary: false, colorLabel: 'Original' },
      { id: 106, imageUrl: '/buffet-carthage-plateau-top.jpg', isPrimary: false, colorLabel: 'Original' },
    ], 
    description: "Buffet artisanal d'exception blanc patiné incrusté de carreaux de céramique faits main.", 
    materials: 'Bois massif & Céramique', 
    dimensions: '180 x 50 x 85 cm', 
    color: 'Blanc Patiné', 
    price: 4200, 
    availability: 'Disponible', 
    type: 'CATALOGUE', 
    isFeatured: true 
  },
  { id: 6, name: 'Meuble TV Hammamet', category: { id: 2, name: 'Meubles TV', type: '' }, images: [{ id: 2, imageUrl: '/cat-tv.png', isPrimary: true, colorLabel: 'Blanc Cérusé' }], description: 'Meuble bas tout en élégance.', materials: 'Bois de frêne', dimensions: '160 x 40 x 55 cm', color: 'Blanc Cérusé', price: 2600, availability: 'Disponible', type: 'CATALOGUE', isFeatured: false },
  { id: 4, name: 'Miroir Sidi Bou', category: { id: 3, name: 'Miroirs', type: '' }, images: [{ id: 3, imageUrl: '/creation-model.png', isPrimary: true, colorLabel: 'Or' }], description: "Miroir au cadre sculpté rehaussé de feuille d'or.", materials: "Bois d'olivier", dimensions: '80 x 120 cm', color: 'Or', price: 1900, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: false },
  { id: 3, name: 'Porte Dar El Bey', category: { id: 4, name: 'Portes', type: '' }, images: [{ id: 4, imageUrl: '/cat-door.png', isPrimary: true, colorLabel: 'Noyer' }], description: 'Porte artistique aux gravures géométriques profondes.', materials: 'Chêne', dimensions: '220 x 140 cm', color: 'Noyer', price: null, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: false },
]

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
        hidden: { opacity: 0, y: 25, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
      onHoverStart={() => setHoveredId(model.id)}
      onHoverEnd={() => setHoveredId(null)}
      className="group relative flex flex-col p-3 sm:p-4 rounded-[1.75rem] sm:rounded-[2.25rem] bg-[#FAF8F5] hover:bg-white border border-[#E8DCCB] hover:border-[#C17D59] shadow-[0_4px_20px_rgba(58,42,33,0.05)] hover:shadow-[0_20px_45px_rgba(193,125,89,0.18)] transition-all duration-500 transform hover:-translate-y-1.5"
    >
      {/* MODERN ARTISANAL PHOTO ARCH FRAME */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[1.5rem] sm:rounded-t-[2rem] rounded-b-xl bg-[#FAF7F2] border border-[#E8DCCB]/60 shadow-inner group/img">
        
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
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-violet-600/95 backdrop-blur-md px-3 py-1 shadow-md border border-violet-400/50">
              <Bot className="size-3.5 text-white" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">IA : {variantImage.colorLabel}</span>
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
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </AnimatePresence>
            
            {currentImage && currentImage.id !== primaryImage.id && !isOriginal(currentImage.colorLabel) && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-violet-600/95 backdrop-blur-md px-3 py-1 shadow-md border border-violet-400/50">
                <Bot className="size-3.5 text-white" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">IA : {currentImage.colorLabel}</span>
              </div>
            )}
            
            {model.isFeatured ? (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-[#C17D59] to-[#3A2A21] text-white px-3 py-1 shadow-md backdrop-blur-md border border-amber-300/30">
                <Sparkles className="size-3 text-amber-200" />
                <span className="text-[9px] uppercase tracking-widest font-extrabold">Pièce d'Art</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 shadow-sm border border-[#E8DCCB]">
                <span className="text-[9px] uppercase tracking-wider text-[#3A2A21] font-serif font-bold">
                  🏺 Atelier Signé
                </span>
              </div>
            )}
          </>
        )}

        {/* FLOATING GLASSMORTIC ACTION BUTTONS */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(e, model.id); }}
            className={`size-9 rounded-full backdrop-blur-md transition-all shadow-md flex items-center justify-center active:scale-95 ${
              favorites.includes(model.id)
                ? 'bg-white text-red-500 shadow-md'
                : 'bg-white/85 hover:bg-white text-[#3A2A21] hover:text-red-500 border border-white/80'
            }`}
            title="Ajouter aux favoris"
          >
            <Heart className={`size-4 transition-colors ${favorites.includes(model.id) ? 'fill-red-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            className="size-9 rounded-full bg-white/85 hover:bg-white text-[#3A2A21] hover:text-[#C17D59] backdrop-blur-md border border-white/80 shadow-md transition-all flex items-center justify-center active:scale-95"
            title="Aperçu rapide"
          >
            <Eye className="size-4" />
          </button>
        </div>

        {/* MODERN QUICK VIEW BAR ON HOVER */}
        <div className="absolute bottom-3 inset-x-3 z-20 transition-all duration-300 opacity-0 group-hover/img:opacity-100 translate-y-2 group-hover/img:translate-y-0 hidden sm:block">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(model); setQuickViewImageIndex(0); }}
            className="w-full py-2.5 rounded-xl bg-[#2C1E16]/95 hover:bg-[#C17D59] text-white backdrop-blur-md font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20"
          >
            <Eye className="size-3.5" /> Explorer la création
          </button>
        </div>

        {/* VIEW COUNT BADGE */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-100 border border-white/20 group-hover/img:hidden">
            📷 {model.images.length} vues
          </div>
        )}

        {/* Main Product Link */}
        <Link href={`/produits/${model.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* MULTI-ANGLE THUMBNAILS SELECTOR */}
      {hasMultipleImages && !isAIVariantDisplayed && (
        <div className="pt-2.5 pb-0.5 flex gap-1.5 overflow-x-auto scrollbar-hide z-20 relative pointer-events-auto px-0.5">
          {model.images.map((img: any, idx: number) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImageIndex(idx)
              }}
              className={`relative size-8 sm:size-9 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                idx === activeImageIndex 
                  ? 'border-[#C17D59] opacity-100 scale-105 shadow-md ring-2 ring-[#C17D59]/30' 
                  : 'border-white opacity-60 hover:opacity-100 shadow-xs'
              }`}
            >
              <img src={img.imageUrl} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* MODERN ARTISANAL DETAILS SECTION */}
      <div className="pt-3 px-1 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#C17D59] bg-[#C17D59]/10 px-2.5 py-0.5 rounded-full border border-[#C17D59]/20 truncate">
              {model.category?.name || 'Création Unique'}
            </span>
            <span className="text-[9px] text-[#8C7A6B] font-semibold tracking-wider uppercase opacity-90 truncate max-w-[110px]">
              🪵 {model.materials || 'Bois massif'}
            </span>
          </div>
          
          <h3 className="font-serif text-base sm:text-lg font-medium leading-snug text-[#2C1E16] group-hover:text-[#C17D59] transition-colors truncate">
            {model.name}
          </h3>
        </div>

        <div className="pt-2.5 border-t border-[#E8DCCB]/60 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#8C7A6B] uppercase tracking-wider font-semibold truncate">
            <span className="size-2.5 rounded-full border border-black/10 shrink-0 shadow-inner" style={{ background: getColorHex(displayColor) }} />
            <span className="truncate max-w-[80px]">{displayColor}</span>
          </div>

          <div className="flex items-center gap-1 bg-gradient-to-r from-[#2C1E16] via-[#5C3317] to-[#C17D59] text-white px-3.5 py-1.5 rounded-full shadow-md shrink-0">
            <span className="font-serif text-xs sm:text-sm font-bold tracking-wide">
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
  
  // Dynamic Categories
  const [categories, setCategories] = useState<{ id: string; label: string; icon: any; count: number }[]>([])
  
  // Carousel Ref for auto-centering
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Favorites
  const [favorites, setFavorites] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0)

  // Reset pagination on filter or sort change
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

  // Derive dynamic categories from dbProducts
  useEffect(() => {
    const counts: Record<string, number> = {}
    dbProducts.forEach(p => {
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
      { id: 'Tout', label: 'Tout', icon: Grid2X2, count: dbProducts.length },
      ...dynamicCategories
    ])
  }, [dbProducts])

  // Client-side filtering on database products (fallback to MOCK_MODELS if DB is empty)
  useEffect(() => {
    const source = dbProducts.length > 0 ? dbProducts : (loading ? [] : MOCK_MODELS)
    let filtered = source

    let needsGoldCard = false
    let isAiSearchActive = false

    if (aiQuery.trim() !== '') {
      isAiSearchActive = true
      const q = aiQuery.trim().toLowerCase()
      // Tokenize the query and remove common stop words to support natural language like "je cherche un miroir bleu"
      const stopWords = ['je', 'cherche', 'voudrais', 'veux', 'veut', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'en', 'avec', 'pour', 'et', 'ou', 'est', 'que', 'qui', 'dans', 'sur']
      const keywords = q.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word))
      
      // If no valid keywords found after filtering, fallback to the whole string
      const searchTerms = keywords.length > 0 ? keywords : [q]

      let perfectMatches = filtered.filter(p => {
        // A product matches perfectly if it satisfies ALL search terms (with typo tolerance)
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
        // No perfect match -> Show Gold Card, but fallback to partial matches so grid is not empty
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
        // If partialMatches is also 0, we leave `filtered` as the base source (so it shows all products in current category/color filter)
      }
    }

    if (category !== 'Tout') {
      filtered = filtered.filter(p => p.category?.name === category)
    }
    if (color !== 'Tout') {
      const targetColor = color.trim().toLowerCase()
      filtered = filtered.filter(p => {
        const matchesMain = p.color?.trim().toLowerCase() === targetColor
        const matchesVariant = p.images?.some(img => img.colorLabel?.trim().toLowerCase() === targetColor)
        return matchesMain || matchesVariant
      })
    }
    if (dimension !== 'Tout') {
      filtered = filtered.filter(p => {
        const dim = parseInt(p.dimensions || '0')
        if (dimension === 'Petit (< 80 cm)') return dim < 80
        if (dimension === 'Moyen (80–150 cm)') return dim >= 80 && dim <= 150
        if (dimension === 'Grand (> 150 cm)') return dim > 150
        return true
      })
    }

    // Also trigger gold card if color filter is active but no results found (and we reset to all products in that category)
    if (filtered.length === 0 && color !== 'Tout' && !isAiSearchActive) {
       needsGoldCard = true
       // fallback to products before color filter
       filtered = source.filter(p => category === 'Tout' || p.category?.name === category)
    }

    // Apply Sorting
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
    <section className="min-h-screen bg-[#FAF7F2] py-16 text-[#5A453A] md:py-24 relative">
      
      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#FAF9F5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#E8DCCB] flex flex-col md:flex-row relative max-h-[90vh] my-auto"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all shadow-md transform hover:scale-105"
                title="Fermer"
              >
                <X className="size-5" />
              </button>

              {/* Left Side: Photo Showcase */}
              <div className="w-full md:w-1/2 relative bg-[#FAF7F2] aspect-[4/5] md:aspect-auto h-[320px] md:h-[580px] border-b md:border-b-0 md:border-r border-[#E8DCCB]/60 overflow-hidden">
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
                        transition={{ duration: 0.4 }}
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === 0 ? (quickViewProduct.images?.length || 1) - 1 : i - 1); }}
                          className="p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-md"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(i => i === (quickViewProduct.images?.length || 1) - 1 ? 0 : i + 1); }}
                          className="p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-md"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}

                    {/* Image Thumbnails Strip */}
                    {quickViewProduct.images.length > 1 && (
                      <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2 z-20 overflow-x-auto scrollbar-hide py-1">
                        {quickViewProduct.images.map((img: any, idx: number) => (
                          <button 
                            key={img.id || idx}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setQuickViewImageIndex(idx); }}
                            className={`size-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer shadow-md ${
                              idx === quickViewImageIndex ? 'border-[#C17D59] scale-110 ring-2 ring-[#C17D59]/30' : 'border-white opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={img.imageUrl} alt="" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Non-intrusive active color indicator if AI variant */}
                    {(() => {
                      const currentView = quickViewProduct.images?.[quickViewImageIndex];
                      if (!currentView || isOriginal(currentView.colorLabel)) return null;
                      return (
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 shadow-md border border-white/20 text-white text-[10px] font-bold">
                          <span className="size-2.5 rounded-full border border-white/40" style={{ background: getColorHex(currentView.colorLabel) }} />
                          <span>IA : {currentView.colorLabel}</span>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2]">
                    <span className="text-muted-foreground font-serif">Aucune image disponible</span>
                  </div>
                )}
              </div>

              {/* Right Side: Details & Story */}
              <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#C17D59] bg-[#C17D59]/10 px-3 py-1 rounded-full border border-[#C17D59]/20 inline-block mb-2">
                      {quickViewProduct.category?.name || 'Création d\'Atelier'}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2C1E16] leading-tight">
                      {quickViewProduct.name}
                    </h3>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => toggleFavorite(e, quickViewProduct.id)}
                    className={`p-3 rounded-full border transition-all shadow-sm shrink-0 ${
                      favorites.includes(quickViewProduct.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-white border-[#E8DCCB] text-[#3A2A21] hover:text-red-500'
                    }`}
                    title="Ajouter aux favoris"
                  >
                    <Heart className={`size-5 ${favorites.includes(quickViewProduct.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <p className="text-[#5A453A] font-light text-sm leading-relaxed mb-6">
                  {quickViewProduct.description || "Cette pièce artisanale d'exception est fabriquée à la main dans notre atelier à partir de matériaux nobles. Chaque détail est façonné sur-mesure."}
                </p>

                {/* ELEGANT COLOR VARIANTS SELECTOR IN DETAILS COLUMN (OUTSIDE PHOTO) */}
                {(() => {
                  if (!quickViewProduct.images || quickViewProduct.images.length <= 1) return null;
                  const uniqueVariants: { label: string; idx: number; id: string }[] = [];
                  const seen = new Set();
                  quickViewProduct.images.forEach((img: any, idx: number) => {
                    const label = img.colorLabel || 'Original';
                    if (!seen.has(label)) {
                      seen.add(label);
                      uniqueVariants.push({ label, idx, id: img.id });
                    }
                  });
                  
                  if (uniqueVariants.length <= 1) return null;

                  return (
                    <div className="mb-6 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB]/60">
                      <p className="text-[10px] uppercase tracking-wider text-[#8C7A6B] font-bold mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-[#C17D59]" /> Finitions & Couleurs d'Atelier :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueVariants.map(({ label, idx, id }) => {
                          const currentLabel = quickViewProduct.images[quickViewImageIndex]?.colorLabel || 'Original';
                          const isActive = currentLabel === label;
                          const isOrig = isOriginal(label);
                          
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewImageIndex(idx);
                              }}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                                isActive
                                  ? 'border-[#C17D59] bg-[#C17D59] text-white shadow-md scale-102'
                                  : 'border-[#E8DCCB] bg-white text-[#3A2A21] hover:border-[#C17D59] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              <span className="size-3 rounded-full border border-black/10 shrink-0" style={{ background: getColorHex(label) }} />
                              <span>{label}</span>
                              {isOrig && <span className="text-[9px] opacity-80">(Original)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

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
                    <div className="grid grid-cols-2 gap-3 mb-8 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB]/60">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCB]/40">
                        <p className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold mb-0.5">Dimensions</p>
                        <p className="text-xs font-semibold text-[#2C1E16]">📏 {actualDimension}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCB]/40">
                        <p className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold mb-0.5">Matière</p>
                        <p className="text-xs font-semibold text-[#2C1E16]">🪵 {quickViewProduct.materials || 'Bois massif'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCB]/40">
                        <p className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold mb-0.5">Finition / Teinte</p>
                        <p className="text-xs font-semibold text-[#2C1E16] flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full inline-block border border-black/10 shrink-0" style={{ background: getColorHex(actualColor) }} />
                          <span className="truncate">{actualColor}</span>
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCB]/40">
                        <p className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold mb-0.5">Prix Indicatif</p>
                        <p className="text-xs font-bold text-[#C17D59] font-serif">
                          {quickViewProduct.price ? `${quickViewProduct.price} TND` : 'Sur devis'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/produits/${quickViewProduct.id}?action=devis&color=${encodeURIComponent(
                      (quickViewProduct.images?.[quickViewImageIndex] && !isOriginal(quickViewProduct.images?.[quickViewImageIndex].colorLabel)) 
                        ? quickViewProduct.images?.[quickViewImageIndex].colorLabel! 
                        : (quickViewProduct.color || 'Naturel')
                    )}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#3A2A21] hover:bg-[#C17D59] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="size-4" /> Commander sur-mesure
                  </Link>
                  <Link
                    href={`/produits/${quickViewProduct.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8DCCB] bg-white hover:bg-[#FAF7F2] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#3A2A21] transition-all shadow-sm"
                  >
                    Fiche produit <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header & Favorites floating bar */}
        <div className="relative">
          <FadeIn className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">Catalogue d'inspiration</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-balance font-serif italic text-5xl font-light leading-tight sm:text-6xl md:text-7xl text-[#2C1E16]">
              Nos créations passées, sources d'inspiration
            </h1>
          </FadeIn>

          {/* --- AI VISION PROMPTER --- */}
          <FadeIn delay={0.02} className="mb-14 relative z-10 mx-auto max-w-2xl px-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#C17D59] via-amber-200 to-[#C17D59] opacity-30 blur-md group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative flex items-center bg-white border border-[#E8DCCB] shadow-xl rounded-full px-2 py-2">
                <div className="pl-4 pr-3">
                  <Sparkles className="size-5 text-[#C17D59]" />
                </div>
                <input 
                  type="text"
                  placeholder="Décrivez le meuble de vos rêves (ex: Un grand buffet bleu)..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      window.scrollBy({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  className="w-full bg-transparent border-none text-[#5A453A] text-sm md:text-base focus:outline-none focus:ring-0 placeholder:text-[#8C7A6B]/60 font-medium"
                />
                {aiQuery && (
                  <button onClick={() => setAiQuery('')} className="p-2 text-[#8C7A6B] hover:text-[#C17D59] transition-colors">
                    <X className="size-4" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    // Just scroll down slightly to show results
                    window.scrollBy({ top: 300, behavior: 'smooth' })
                  }}
                  className="ml-2 rounded-full bg-gradient-to-r from-[#C17D59] to-[#3A2A21] hover:from-[#A6694A] hover:to-[#1a120f] transition-all text-white text-[10px] font-bold uppercase tracking-wider px-5 py-3 whitespace-nowrap shadow-md hidden sm:block"
                >
                  Visualiser
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Favorites Widget */}
          <AnimatePresence>
            {mounted && favorites.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 md:absolute md:top-0 md:right-0 md:bottom-auto z-40"
              >
                <Link 
                  href="/contact" 
                  className="flex items-center gap-3 bg-white border border-red-100 shadow-xl shadow-red-900/5 rounded-full px-5 py-3 hover:scale-105 transition-transform group"
                >
                  <div className="relative">
                    <Heart className="size-5 text-red-500 fill-red-500" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold size-4 flex items-center justify-center rounded-full border border-white">
                      {favorites.length}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#2C1E16] hidden sm:block group-hover:text-red-500 transition-colors">Mes favoris</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- CATEGORIES "STORIES" MENU --- */}
        <FadeIn delay={0.05}>
          <div ref={carouselRef} className="mb-12 w-full overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
            <div className="flex gap-4 sm:gap-6 min-w-max px-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id
                
                // Dynamically fetch an image from dbProducts for this category
                let displayImg = '/placeholder.png' // default fallback
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
                      // Auto-center on mobile
                      const btn = e.currentTarget
                      if (carouselRef.current) {
                        const container = carouselRef.current
                        const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2)
                        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
                      }
                    }}
                    className="group flex flex-col items-center gap-3 w-20 sm:w-24 shrink-0 transition-all relative"
                  >
                    <div className={`relative size-16 sm:size-20 rounded-full p-1 transition-all duration-300 ${isSelected ? 'bg-gradient-to-tr from-[#C17D59] to-[#E8DCCB]' : 'bg-transparent hover:bg-[#E8DCCB]/40'}`}>
                      <div className="size-full rounded-full overflow-hidden bg-white relative border-2 border-white shadow-inner">
                        <img src={displayImg} alt={cat.label} className={`size-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'} opacity-80`} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
                        <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-black/10' : 'bg-black/30 group-hover:bg-black/10'}`}>
                          <cat.icon className="size-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                      
                      {/* Product Count Badge */}
                      <div className="absolute -top-1 -right-1 bg-white shadow-md border border-[#E8DCCB] text-[#5A453A] font-bold text-[9px] size-5 sm:size-6 flex items-center justify-center rounded-full z-10 transition-transform group-hover:scale-110">
                        {cat.count}
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center transition-colors ${isSelected ? 'text-[#C17D59]' : 'text-[#8C7A6B] group-hover:text-[#2C1E16]'}`}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* IA Disclaimer banner */}
        <FadeIn delay={0.1}>
          <div className="mb-10 flex items-start gap-4 rounded-2xl border border-[#E8DCCB]/40 bg-white p-5 shadow-sm">
            <div className="p-2 bg-[#FAF7F2] rounded-full">
              <Sparkles className="size-5 text-[#C17D59]" />
            </div>
            <div>
              <span className="font-bold text-[#C17D59] text-sm uppercase tracking-wider">Note Magique — </span>
              <span className="text-sm text-[#5A453A] leading-relaxed">
                Certains modèles de ce catalogue sont générés ou améliorés par notre intelligence artificielle à des fins d'illustration. Ils représentent les possibilités de création sur-mesure de l'Atelier.
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Filter panel */}
        <FadeIn delay={0.15}>
          <div className="mb-10 rounded-3xl border border-[#E8DCCB]/60 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className="flex w-full items-center justify-between px-6 py-5 text-left md:cursor-default"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="size-4 text-[#C17D59]" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#2C1E16]">Filtrer les inspirations</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#C17D59] text-[10px] font-bold text-white shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-[#C17D59] md:hidden">
                {showFilters ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            <div className={cn(
              'border-t border-[#E8DCCB]/20 px-6 py-6 space-y-8 transition-all duration-300 bg-[#FAF7F2]/30',
              'md:block',
              showFilters ? 'block' : 'hidden md:block'
            )}>

              {/* Color swatches */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] font-bold">Couleur du bois</p>
                <div className="flex flex-wrap gap-4">
                  {COLORS.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setColor(c.label)}
                      title={c.label}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={cn(
                          'size-10 rounded-full border-2 transition-all duration-300 shadow-sm',
                          color === c.label
                            ? 'scale-110 border-[#C17D59] ring-2 ring-[#C17D59]/20 ring-offset-2'
                            : 'border-white group-hover:scale-105 group-hover:border-[#E8DCCB]'
                        )}
                        style={c.hex ? { backgroundColor: c.hex } : { background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                      />
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wider transition-colors',
                        color === c.label ? 'text-[#C17D59]' : 'text-[#8C7A6B] group-hover:text-[#2C1E16]'
                      )}>
                        {c.label === 'Tout' ? 'Toutes' : c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension pills */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] font-bold">Dimensions</p>
                  <div className="flex flex-wrap gap-2">
                    {DIMENSIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDimension(d)}
                        className={cn(
                          'rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200',
                          dimension === d
                            ? 'bg-[#E8DCCB]/30 border border-[#C17D59] text-[#C17D59]'
                            : 'border border-[#E8DCCB] bg-white text-[#5A453A] hover:border-[#C17D59] hover:text-[#C17D59]'
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
                    className="ml-auto mt-4 sm:mt-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-500 transition-colors"
                  >
                    <X className="size-4" /> Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results count bar */}
        <FadeIn delay={0.2}>
          <div className="mb-8 flex items-center justify-between border-b border-[#E8DCCB]/40 pb-4">
            <p className="text-sm font-medium text-[#8C7A6B]">
              Affichage de <span className="text-[#2C1E16] font-bold">{Math.min(visibleCount, products.length)}</span> sur <span className="text-[#C17D59] font-bold">{products.length}</span> création{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </FadeIn>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex justify-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="size-10 animate-spin rounded-full border-4 border-[#E8DCCB] border-t-[#C17D59]" />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-[#E8DCCB]/40 col-span-full"
            >
              <div className="p-4 rounded-full bg-[#FAF7F2] mb-4">
                <Sparkles className="size-8 text-[#C17D59]/40" />
              </div>
              <p className="font-serif text-3xl text-[#2C1E16] mb-2">Aucun modèle trouvé</p>
              <p className="text-sm text-[#5A453A]">Essayez d'autres critères ou laissez-nous créer votre idée sur-mesure.</p>
              <Link href="/contact" className="mt-6 rounded-full bg-[#3A2A21] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C17D59] transition-colors">
                Nous contacter
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                key={`${category}-${color}-${dimension}-${aiQuery}-${sortBy}`}
                className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
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

              {/* ARTISANAL LOAD MORE & PROGRESS BAR */}
              {products.length > visibleCount && (
                <div className="mt-16 flex flex-col items-center justify-center gap-5">
                  <div className="w-full max-w-xs space-y-2 text-center">
                    <div className="flex justify-between text-[11px] font-semibold text-[#8C7A6B]">
                      <span>Progression de l'exploration</span>
                      <span className="font-bold text-[#C17D59]">{Math.min(visibleCount, products.length)} / {products.length}</span>
                    </div>
                    <div className="h-2 w-full bg-[#E8DCCB]/40 rounded-full overflow-hidden p-0.5 border border-[#E8DCCB]/60">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#C17D59] via-[#C9A84C] to-[#3A2A21] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(visibleCount, products.length) / products.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#3A2A21] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#C17D59] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>Découvrir d'autres créations</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold text-amber-100">
                      + {Math.min(12, products.length - visibleCount)}
                    </span>
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
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
