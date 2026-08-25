'use client'

import { useState, useEffect, useMemo } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Palette, 
  Hammer, 
  Shield, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Filter,
  Plus,
  Ruler,
  Layers,
  Eye,
  Camera,
  Maximize2,
  Search,
  SlidersHorizontal,
  PhoneCall,
  Truck,
  Award,
  Wrench,
  Check,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { publicApi, Product } from '@/lib/api'

export type HandleType = 'ceramique' | 'sculptee' | 'cuivre'
export type HandleSize = 'all' | 'petit' | 'moyen' | 'grand'
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc'

export interface HandleModel {
  id: string
  name: string
  type: HandleType
  typeLabel: string
  size: 'petit' | 'moyen' | 'grand'
  sizeLabel: string
  dimensions: string
  price: number
  desc: string
  image: string
  inSituImage?: string
}

export default function BijouxDePortePage() {
  // Main Category Filter
  const [selectedType, setSelectedType] = useState<HandleType | null>(null)
  
  // Secondary Size Filter
  const [selectedSize, setSelectedSize] = useState<HandleSize>('all')

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')

  const [products, setProducts] = useState<HandleModel[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Image Zoom State for in-situ preview
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Inquiry Form Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [selectedHandle, setSelectedHandle] = useState<HandleModel | null>(null)
  const [inquiryData, setInquiryData] = useState({ 
    qty: 4, 
    fullName: '', 
    email: '', 
    phone: '', 
    notes: '',
    length: '15 cm',
    finish: 'Blanc Cérusé'
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const apiProducts = await publicApi.getProducts().catch(() => [])
        
        const isHandleProduct = (p: Product) => {
          const catName = (p.category?.name || '').toLowerCase()
          const catType = (p.category?.type || '').toLowerCase()
          const mat = (p.materials || '').toLowerCase()
          const name = (p.name || '').toLowerCase()
          const pType = (p.type || '').toLowerCase()
          return (
            catName.includes('porte') || 
            catName.includes('bijou') || 
            catName.includes('poign') || 
            catName.includes('bouton') || 
            catName.includes('tirant') || 
            catName.includes('rond') || 
            catName.includes('ovale') ||
            catType.includes('bijou') ||
            pType.includes('bijou') ||
            pType.includes('poign') ||
            name.includes('bouton') || 
            name.includes('tirant') || 
            name.includes('poignée') ||
            name.includes('poignee')
          )
        }

        const validHandles = apiProducts.filter(isHandleProduct).map((p, idx) => {
          const catName = (p.category?.name || '').toLowerCase()
          const mat = (p.materials || '').toLowerCase()
          const name = (p.name || '').toLowerCase()
          const desc = (p.description || '').toLowerCase()
          const dims = (p.dimensions || '').toLowerCase()
          const style = (p.style || '').toLowerCase()

          // 1. Determine Exact Category (Céramique, Sculptée, Cuivre)
          let type: HandleType = 'ceramique'
          if (
            catName.includes('cuivre') || 
            catName.includes('laiton') || 
            catName.includes('bronze') || 
            mat.includes('cuivre') || 
            mat.includes('laiton') || 
            mat.includes('bronze') || 
            name.includes('cuivre') || 
            name.includes('laiton')
          ) {
            type = 'cuivre'
          } else if (
            catName.includes('sculptee') || 
            catName.includes('sculptée') || 
            name.includes('tirant') ||
            (catName.includes('sculpt') && !name.includes('bouton') && !mat.includes('céramique') && !mat.includes('ceramique') && !mat.includes('faïence') && !desc.includes('céramique'))
          ) {
            type = 'sculptee'
          } else {
            type = 'ceramique'
          }

          // 2. Determine Exact Size (Petit, Moyen, Grand)
          let size: 'petit' | 'moyen' | 'grand' = 'moyen'
          if (
            dims.includes('petit') || 
            style.includes('petit') || 
            name.includes('petit') || 
            desc.includes('petit') ||
            dims.startsWith('4') ||
            dims.startsWith('5') ||
            dims.includes('10')
          ) {
            size = 'petit'
          } else if (
            dims.includes('grand') || 
            style.includes('grand') || 
            name.includes('grand') || 
            desc.includes('grand') ||
            dims.startsWith('8') ||
            dims.startsWith('9') ||
            dims.includes('25') ||
            dims.includes('30')
          ) {
            size = 'grand'
          } else {
            size = 'moyen'
          }

          const typeLabel = 
            type === 'ceramique' ? 'Poignée Céramique' : 
            type === 'sculptee' ? 'Poignée Sculptée' : 
            'Poignée en Cuivre'

          const sizeLabel = 
            size === 'petit' ? 'Petit' : 
            size === 'moyen' ? 'Moyen' : 
            'Grand'

          // Use the exact real image uploaded in the dashboard
          const realImage = 
            p.images?.find(img => img.isPrimary)?.imageUrl || 
            p.images?.[0]?.imageUrl || 
            (p as any).image_url || 
            (p as any).imageUrl || 
            (p as any).imageUrls?.[0] || 
            ''

          return {
            id: p.id.toString(),
            name: p.name,
            type,
            typeLabel,
            size,
            sizeLabel,
            dimensions: p.dimensions || sizeLabel,
            price: p.price || 0,
            desc: p.description || '',
            image: realImage
          }
        })

        setProducts(validHandles)
      } catch (err) {
        console.error('Erreur chargement produits dashboard:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter & Sort handles according to selected category, size, search and sort criteria
  const filteredProducts = useMemo(() => {
    let result = products.filter(item => {
      const matchType = selectedType === null || item.type === selectedType
      // Size filter is ignored for sculpted handles (lengths from 10 to 30 cm)
      const matchSize = selectedType === 'sculptee' || selectedSize === 'all' || item.size === selectedSize
      
      const query = searchQuery.trim().toLowerCase()
      const matchSearch = query === '' || 
        item.name.toLowerCase().includes(query) || 
        item.desc.toLowerCase().includes(query) || 
        item.typeLabel.toLowerCase().includes(query) ||
        item.dimensions.toLowerCase().includes(query)

      return matchType && matchSize && matchSearch
    })

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [products, selectedType, selectedSize, searchQuery, sortBy])

  // =========================================================================
  // 12 PIÈCES PAR PAGE (PAGINATION HAUTE PERFORMANCE)
  // =========================================================================
  const ITEMS_PER_PAGE = 12
  const [currentPage, setCurrentPage] = useState(1)

  // Reset pagination to page 1 on any filter/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedType, selectedSize, searchQuery, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  // Real-time counts from dashboard products
  const counts = useMemo(() => {
    return {
      all: products.length,
      ceramique: products.filter(h => h.type === 'ceramique').length,
      sculptee: products.filter(h => h.type === 'sculptee').length,
      cuivre: products.filter(h => h.type === 'cuivre').length,
    }
  }, [products])

  const sizeCounts = useMemo(() => {
    const currentPool = selectedType === null ? products : products.filter(h => h.type === selectedType)
    return {
      all: currentPool.length,
      petit: currentPool.filter(h => h.size === 'petit').length,
      moyen: currentPool.filter(h => h.size === 'moyen').length,
      grand: currentPool.filter(h => h.size === 'grand').length,
    }
  }, [products, selectedType])

  const handleCategoryClick = (type: HandleType) => {
    if (selectedType === type) {
      setSelectedType(null)
      setSelectedSize('all')
    } else {
      setSelectedType(type)
      setSelectedSize('all')
    }
  }

  const openInquiry = (handle: HandleModel) => {
    setSelectedHandle(handle)
    const initialFinish = handle.name.includes('Bleu') ? 'Bleu Majolique' :
      handle.name.includes('Vert') ? 'Vert Sauge' :
      handle.name.includes('Ocre') ? 'Ocre Safran' : 'Blanc Cérusé'

    setInquiryData({
      qty: 4,
      fullName: '',
      email: '',
      phone: '',
      notes: '',
      length: '15 cm',
      finish: initialFinish
    })
    setShowInquiryModal(true)
    setSent(false)
    setError(null)
  }

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHandle) return
    setSubmitLoading(true)
    setError(null)
    
    try {
      const extraDetails = selectedHandle.type === 'sculptee'
        ? `\nLongueur sélectionnée: ${inquiryData.length}\nFinition/Patine: ${inquiryData.finish}`
        : ''

      const unitPrice = selectedHandle.price > 0 ? selectedHandle.price : 24
      const totalPrice = unitPrice * inquiryData.qty

      const message = `[Demande de réservation Bijou de Porte]\nModèle: ${selectedHandle.name}\nCatégorie: ${selectedHandle.typeLabel}\nTaille/Longueur: ${selectedHandle.sizeLabel}${extraDetails}\nQuantité: ${inquiryData.qty} pièce(s)\nTotal estimé: ${totalPrice} TND\n\nNotes client: ${inquiryData.notes}`
      
      await publicApi.submitQuoteRequest({
        fullName: inquiryData.fullName,
        email: inquiryData.email,
        phoneNumber: inquiryData.phone,
        message: message,
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col text-[#F7F4EE] font-sans relative overflow-hidden bg-[#241812]">
      
      {/* Background Texture & Atmospheric Lighting */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-bijoux-de-porte.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/85 via-black/35 to-[#241812]/95 pointer-events-none z-0" />

      {/* Layered Golden Ambient Halos */}
      <div className="absolute top-[10%] left-1/4 size-[350px] sm:size-[550px] rounded-full bg-[#E6A635]/15 blur-[120px] sm:blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[45%] right-1/4 size-[300px] sm:size-[500px] rounded-full bg-[#C78318]/12 blur-[100px] sm:blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] left-1/3 size-[350px] sm:size-[550px] rounded-full bg-[#E6A635]/12 blur-[120px] sm:blur-[160px] pointer-events-none z-0" />

      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION STATUTAIRE : HAUTE BIJOUTERIE DE PORTE (COMPACT MOBILE)      */}
      {/* ========================================================================= */}
      <section className="pt-24 sm:pt-36 pb-4 sm:pb-8 flex flex-col items-center text-center px-3.5 sm:px-4 relative z-10">
        
        {/* Prestige Badge */}
        <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9px] sm:text-[10.5px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] mb-2.5 sm:mb-4 shadow-xl">
          <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
          <span>Haute Bijouterie de Meubles</span>
        </div>

        {/* Grand Title */}
        <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient leading-tight mb-1.5 sm:mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          Les Bijoux de Porte
        </h1>

        {/* Subtitle */}
        <p className="text-white/90 drop-shadow max-w-xl text-[11px] sm:text-sm md:text-base font-light leading-relaxed px-2">
          Pièces uniques sculptées en noyer noble, ornées de faïence émaillée ou forgées en cuivre d&apos;apparat.
        </p>

        {/* Reassurance Micro-Pills */}
        <div className="mt-3 sm:mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-[8.5px] sm:text-xs text-white/80">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 border border-[#E6A635]/25 backdrop-blur-sm">
            <Check className="size-2.5 sm:size-3 text-[#E6A635]" /> Noyer &amp; Faïence d&apos;Époque
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 border border-[#E6A635]/25 backdrop-blur-sm">
            <Wrench className="size-2.5 sm:size-3 text-[#E6A635]" /> Fixation Inox Universelle
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 border border-[#E6A635]/25 backdrop-blur-sm">
            <Award className="size-2.5 sm:size-3 text-[#E6A635]" /> 100% Artisanal
          </span>
        </div>

        <div className="mt-4 sm:mt-6 h-px w-20 sm:w-28 bg-gradient-to-r from-transparent via-[#E6A635]/70 to-transparent" />
      </section>

      {/* ========================================================================= */}
      {/* 1. LES 3 PILIERS DE CATÉGORIES (COMPACT 1 LIGNE SUR MOBILE)               */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-4 relative z-10 mb-4 sm:mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
          
          {/* 1. POIGNÉE CÉRAMIQUE */}
          <button
            onClick={() => handleCategoryClick('ceramique')}
            className={`group relative p-2.5 sm:p-5 rounded-xl sm:rounded-3xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden shadow-lg cursor-pointer ${
              selectedType === 'ceramique'
                ? 'bg-gradient-to-b from-[#4A3224] to-[#301F15] border-[#E6A635] shadow-[0_8px_25px_rgba(230,166,53,0.35)] scale-[1.02]'
                : 'bg-[#3B271C]/80 backdrop-blur-md border-[#E6A635]/30 hover:border-[#E6A635]/70 hover:bg-[#452D1F]'
            }`}
          >
            {selectedType === 'ceramique' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318]" />
            )}

            <div className={`size-9 sm:size-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-3 border transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              selectedType === 'ceramique'
                ? 'bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] border-[#E6A635]'
                : 'bg-[#241812] text-[#F2BD52] border-[#E6A635]/40'
            }`}>
              <Palette className="size-4 sm:size-6" />
            </div>

            <h3 className="font-heading text-[10.5px] sm:text-xl font-normal text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1">
              Céramique
            </h3>
            
            <p className="hidden sm:block text-[11px] text-white/70 font-light mt-1 line-clamp-1">
              Émaux peints main • Boutons
            </p>
            
            <span className={`text-[7.5px] sm:text-[9.5px] uppercase font-bold tracking-wider mt-1 sm:mt-2.5 px-1.5 sm:px-3 py-0.5 rounded-full border truncate max-w-full ${
              selectedType === 'ceramique'
                ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] font-extrabold shadow'
                : 'bg-[#241812]/90 text-[#F2BD52] border-[#E6A635]/30'
            }`}>
              {counts.ceramique} <span className="hidden sm:inline">modèles</span>
            </span>
          </button>

          {/* 2. POIGNÉE SCULPTÉE */}
          <button
            onClick={() => handleCategoryClick('sculptee')}
            className={`group relative p-2.5 sm:p-5 rounded-xl sm:rounded-3xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden shadow-lg cursor-pointer ${
              selectedType === 'sculptee'
                ? 'bg-gradient-to-b from-[#4A3224] to-[#301F15] border-[#E6A635] shadow-[0_8px_25px_rgba(230,166,53,0.35)] scale-[1.02]'
                : 'bg-[#3B271C]/80 backdrop-blur-md border-[#E6A635]/30 hover:border-[#E6A635]/70 hover:bg-[#452D1F]'
            }`}
          >
            {selectedType === 'sculptee' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318]" />
            )}

            <div className={`size-9 sm:size-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-3 border transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              selectedType === 'sculptee'
                ? 'bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] border-[#E6A635]'
                : 'bg-[#241812] text-[#F2BD52] border-[#E6A635]/40'
            }`}>
              <Hammer className="size-4 sm:size-6" />
            </div>

            <h3 className="font-heading text-[10.5px] sm:text-xl font-normal text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1">
              Sculptée
            </h3>

            <p className="hidden sm:block text-[11px] text-white/70 font-light mt-1 line-clamp-1">
              Noyer massif • Tirants 10-30cm
            </p>

            <span className={`text-[7.5px] sm:text-[9.5px] uppercase font-bold tracking-wider mt-1 sm:mt-2.5 px-1.5 sm:px-3 py-0.5 rounded-full border truncate max-w-full ${
              selectedType === 'sculptee'
                ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] font-extrabold shadow'
                : 'bg-[#241812]/90 text-[#F2BD52] border-[#E6A635]/30'
            }`}>
              {counts.sculptee} <span className="hidden sm:inline">finitions</span>
            </span>
          </button>

          {/* 3. POIGNÉE EN CUIVRE */}
          <button
            onClick={() => handleCategoryClick('cuivre')}
            className={`group relative p-2.5 sm:p-5 rounded-xl sm:rounded-3xl border transition-all duration-300 flex flex-col items-center text-center overflow-hidden shadow-lg cursor-pointer ${
              selectedType === 'cuivre'
                ? 'bg-gradient-to-b from-[#4A3224] to-[#301F15] border-[#E6A635] shadow-[0_8px_25px_rgba(230,166,53,0.35)] scale-[1.02]'
                : 'bg-[#3B271C]/80 backdrop-blur-md border-[#E6A635]/30 hover:border-[#E6A635]/70 hover:bg-[#452D1F]'
            }`}
          >
            {selectedType === 'cuivre' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318]" />
            )}

            <div className={`size-9 sm:size-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-3 border transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              selectedType === 'cuivre'
                ? 'bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] border-[#E6A635]'
                : 'bg-[#241812] text-[#F2BD52] border-[#E6A635]/40'
            }`}>
              <Shield className="size-4 sm:size-6" />
            </div>

            <h3 className="font-heading text-[10.5px] sm:text-xl font-normal text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1">
              Cuivre
            </h3>

            <p className="hidden sm:block text-[11px] text-white/70 font-light mt-1 line-clamp-1">
              Ferronnerie • Laiton d&apos;art
            </p>

            <span className={`text-[7.5px] sm:text-[9.5px] uppercase font-bold tracking-wider mt-1 sm:mt-2.5 px-1.5 sm:px-3 py-0.5 rounded-full border truncate max-w-full ${
              selectedType === 'cuivre'
                ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] font-extrabold shadow'
                : 'bg-[#241812]/90 text-[#F2BD52] border-[#E6A635]/30'
            }`}>
              {counts.cuivre} <span className="hidden sm:inline">pièces</span>
            </span>
          </button>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BARRE D'OUTILS HAUTE LISIBILITÉ : RECHERCHE + FILTRE DE TAILLE + TRI   */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 relative z-10 mb-6 sm:mb-8">
        <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#3B271C]/90 backdrop-blur-xl border border-[#E6A635]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#F2BD52]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, couleur..."
              className="w-full pl-8 pr-8 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/35 text-[11px] sm:text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6A635] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Controls row on mobile: Size Filters + Sort */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto overflow-x-auto pb-0.5 md:pb-0">
            
            {/* Size Filter (Only for Ceramic & Copper) */}
            {selectedType !== 'sculptee' && (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#F2BD52] font-bold shrink-0 flex items-center gap-1 mr-0.5">
                  <Ruler className="size-3 text-[#E6A635]" />
                  <span className="hidden sm:inline">Taille :</span>
                </span>

                {(['all', 'petit', 'moyen', 'grand'] as HandleSize[]).map((sz) => {
                  const label = sz === 'all' ? `Tous (${sizeCounts.all})` : 
                    sz === 'petit' ? `Petit (${sizeCounts.petit})` :
                    sz === 'moyen' ? `Moyen (${sizeCounts.moyen})` : `Grand (${sizeCounts.grand})`

                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
                        selectedSize === sz
                          ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] shadow-sm font-extrabold'
                          : 'bg-[#241812] text-white/90 border border-[#E6A635]/30 hover:border-[#E6A635] hover:text-[#F2BD52]'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#F2BD52] font-bold shrink-0 hidden sm:flex items-center gap-1">
                <SlidersHorizontal className="size-3 text-[#E6A635]" />
                <span>Tri :</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/35 text-[10px] sm:text-xs text-white focus:outline-none focus:border-[#E6A635] cursor-pointer"
              >
                <option value="default">Tri par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name-asc">Nom A à Z</option>
              </select>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SHOWROOM & GALERIE D'INSPIRATION RÉELLE (POIGNÉES CÉRAMIQUES)           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedType === 'ceramique' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-7xl mx-auto px-3 sm:px-6 mb-8 sm:mb-12 relative z-10"
          >
            {/* Header Title Section */}
            <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-sm">
                <Camera className="size-2.5 text-[#E6A635]" />
                <span>Showroom • Pose &amp; Emplacements</span>
              </div>
              <h2 className="font-heading text-xl sm:text-3xl text-white font-normal drop-shadow">
                Idées d&apos;emplacements en situation réelle
              </h2>
              <p className="text-[11px] sm:text-sm text-white/80 font-light mt-0.5">
                Cuisines contemporaines, placards bois, commodes et tiroirs.
              </p>
            </div>

            {/* 4 Real Life Showcase Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              
              {/* Inspiration 1: Cuisine Complète */}
              <div 
                onClick={() => setPreviewImage('/poignees/ceramique_in_situ_cuisine_complete.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/ceramique_in_situ_cuisine_complete.jpg"
                    alt="Cuisine équipée de poignées céramiques"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Cuisine &amp; Tiroirs
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Cuisine Contemporaine
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Boutons ronds et ovales sur façades et tiroirs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspiration 2: Placards & Portes en Bois */}
              <div 
                onClick={() => setPreviewImage('/poignees/ceramique_in_situ_placard_bois.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/ceramique_in_situ_placard_bois.jpg"
                    alt="Boutons céramique sur portes de placard en bois"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Placards &amp; Dressings
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Duo sur Portes Battantes
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Faïence bleue cobalt sur portes en bois clair.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspiration 3: Poignée Cuvette Encastrée */}
              <div 
                onClick={() => setPreviewImage('/poignees/ceramique_in_situ_cuvette_ovale.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/ceramique_in_situ_cuvette_ovale.jpg"
                    alt="Poignée cuvette encastrée avec faïence centrale"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Portes de Meubles
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Cuvette Ovale Encastrée
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Noyer massif enserrant un médaillon d&apos;art.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspiration 4: Système de Fixation & Tige Filetée */}
              <div 
                onClick={() => setPreviewImage('/poignees/ceramique_fixation_details.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/ceramique_fixation_details.jpg"
                    alt="Détails de fixation tige filetée et variété de formes"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Fixation &amp; Formes
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Fixation Inox Universelle
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Tige filetée prête à poser adaptée au bois 18-40mm.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. SHOWROOM & GALERIE D'INSPIRATION RÉELLE (POIGNÉES SCULPTÉES)           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedType === 'sculptee' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-7xl mx-auto px-3 sm:px-6 mb-8 sm:mb-12 relative z-10"
          >
            {/* Header Title Section */}
            <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-sm">
                <Camera className="size-2.5 text-[#E6A635]" />
                <span>Showroom • En Situation Réelle</span>
              </div>
              <h2 className="font-heading text-xl sm:text-3xl text-white font-normal drop-shadow">
                Sublimez vos meubles d&apos;art
              </h2>
              <p className="text-[11px] sm:text-sm text-white/80 font-light mt-0.5">
                Dressing monumental blanc et buffet d&apos;art à céramiques.
              </p>
            </div>

            {/* 3 Real Life Showcase Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
              
              {/* Inspiration 1: Dressing Blanc */}
              <div 
                onClick={() => setPreviewImage('/poignees/sculptee_in_situ_dressing_blanc.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/sculptee_in_situ_dressing_blanc.jpg"
                    alt="Poignée sculptée blanche posée sur dressing"
                    className="size-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Dressing &amp; Armoire
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Harmonie Ton sur Ton
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Tirants de 25 à 30 cm sculptés dans l&apos;esprit du dressing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspiration 2: Buffet Vert & Céramiques */}
              <div 
                onClick={() => setPreviewImage('/poignees/sculptee_in_situ_buffet_vert.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/sculptee_in_situ_buffet_vert.jpg"
                    alt="Poignées sculptées ocre posées sur buffet vert"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Buffet &amp; Enfilade
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Contraste Ocre &amp; Noyer
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Poignées 15 à 20 cm en ocre safran sur buffet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspiration 3: Prise en Main & Ergonomie */}
              <div 
                onClick={() => setPreviewImage('/poignees/sculptee_in_situ_main_porte.jpg')}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#3B271C] border border-[#E6A635]/40 shadow-lg hover:border-[#E6A635] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#241812]">
                  <img
                    src="/poignees/sculptee_in_situ_main_porte.jpg"
                    alt="Prise en main ergonomique de la poignée sculptée"
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52]">
                    Ergonomie &amp; Confort
                  </span>

                  <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-3" />
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="font-heading text-sm sm:text-lg text-white font-medium drop-shadow">
                      Prise en Main Parfaite
                    </h3>
                    <p className="text-[10px] text-white/85 font-light line-clamp-1">
                      Gorge arrière sculptée pour une ouverture fluide.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. GRILLE DES CARTES : ÉCRIN JOAILLIER HAUT DE GAMME (COMPACT MOBILE)     */}
      {/* ========================================================================= */}
      <section id="catalogue-section" className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 mb-16 sm:mb-20 relative z-10 scroll-mt-20">
        
        {/* Results Header Status */}
        <div className="flex items-center justify-between pb-2.5 mb-4 sm:mb-6 border-b border-[#E6A635]/25 text-[11px] sm:text-xs text-white/85">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#F2BD52] font-bold">
              {filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''}
            </span>
            <span>•</span>
            <span className="capitalize font-medium text-white truncate max-w-[130px] sm:max-w-none">
              {selectedType === null 
                ? 'Toutes les créations' 
                : selectedType === 'ceramique' ? 'Céramique' 
                : selectedType === 'sculptee' ? 'Sculptée' 
                : 'Cuivre'}
            </span>
            {selectedSize !== 'all' && selectedType !== 'sculptee' && (
              <>
                <span>•</span>
                <span className="text-[#F2BD52] capitalize hidden sm:inline">Taille : {selectedSize}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(selectedType !== null || selectedSize !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedType(null)
                  setSelectedSize('all')
                  setSearchQuery('')
                }}
                className="text-[10px] sm:text-[11px] uppercase font-bold text-[#F2BD52] hover:underline cursor-pointer"
              >
                Tout voir
              </button>
            )}
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#E6A635]/80">
              Page {currentPage}/{totalPages}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="size-8 sm:size-10 border-2 border-[#E6A635] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[11px] uppercase tracking-widest text-white/70">Chargement...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Grid of 12 items max (More compact, airy and jewel-like) */}
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-3.5"
            >
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((handle) => {
                  const isSculpted = handle.type === 'sculptee'

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      key={handle.id}
                      onClick={() => openInquiry(handle)}
                      className="group relative flex flex-col justify-between bg-[#241710]/45 hover:bg-[#301D14]/65 backdrop-blur-md p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-[#E6A635]/20 hover:border-[#E6A635]/65 shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.7)] transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                    >
                      {/* Delicate Gold Ambient Sheen on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#E6A635]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Top Minimalist Micro-Header */}
                      <div className="flex items-center justify-between gap-1 mb-1 relative z-10">
                        <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.14em] font-bold text-[#F2BD52] truncate">
                          {handle.typeLabel}
                        </span>

                        <span className="text-[7px] sm:text-[8px] uppercase tracking-wider font-medium text-white/50 shrink-0 px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                          {isSculpted ? '10-30 cm' : handle.sizeLabel}
                        </span>
                      </div>

                      {/* Compact Floating Stage with Soft Halo */}
                      <div className="relative mx-auto my-0.5 h-24 sm:h-28 md:h-32 w-full flex items-center justify-center p-1">
                        {/* Soft Gold Spotlight Pedestal */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(230,166,53,0.12)_0%,transparent_65%)] pointer-events-none" />

                        {handle.image ? (
                          <div className="relative size-full flex items-center justify-center">
                            <img
                              src={handle.image}
                              alt={handle.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter contrast-105 group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-500 ease-out"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-1 text-white/40 text-xs">
                            <Sparkles className="size-3 text-[#E6A635]/50 mb-0.5" />
                            <span>Aschi</span>
                          </div>
                        )}
                      </div>

                      {/* Clean Typography & Details */}
                      <div className="mt-0.5 text-center relative z-10 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-heading text-[10.5px] sm:text-xs md:text-[13px] font-normal text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1 drop-shadow h-3.5 sm:h-4 tracking-wide">
                            {handle.name}
                          </h3>
                          
                          <p className="text-[8.5px] sm:text-[9.5px] text-white/55 font-light mt-0.5 line-clamp-1 italic h-3 sm:h-3.5 leading-tight">
                            {handle.desc || 'Création artisanale faite main.'}
                          </p>
                        </div>

                        {/* Fine Price & Minimalist Action Button */}
                        <div className="mt-1 pt-1.5 border-t border-[#E6A635]/15 flex items-center justify-between">
                          <span className="font-heading text-[10.5px] sm:text-xs font-medium text-[#F2BD52] tracking-tight">
                            {isSculpted ? `Dès ${handle.price} TND` : handle.price > 0 ? `${handle.price} TND` : 'Sur Devis'}
                          </span>

                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] uppercase tracking-wider font-bold border border-[#E6A635]/40 bg-[#E6A635]/15 text-[#F2BD52] group-hover:bg-gradient-to-r group-hover:from-[#F3C45E] group-hover:to-[#C78318] group-hover:text-[#1A110B] group-hover:border-transparent transition-all shadow-sm">
                            <span>{isSculpted ? 'Configurer' : 'Réserver'}</span>
                            <ArrowRight className="size-1.5" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* High-End Luxury Pagination Bar */}
            {totalPages > 1 && (
              <div className="mt-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#3B271C]/90 backdrop-blur-xl border border-[#E6A635]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Status Indicator */}
                <div className="text-[11px] sm:text-xs text-white/75 font-light text-center sm:text-left">
                  Affichage <span className="text-[#F2BD52] font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> sur <span className="text-[#F2BD52] font-bold">{filteredProducts.length}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-1.5">
                  
                  {/* Previous */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1))
                      document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-[#241812] text-white border-[#E6A635]/30 hover:border-[#E6A635] hover:text-[#F2BD52]"
                  >
                    <ChevronLeft className="size-3 text-[#E6A635]" />
                    <span className="hidden sm:inline">Précédent</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum)
                          document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className={`size-7 sm:size-8 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] shadow-md font-extrabold scale-105'
                            : 'bg-[#241812] text-white/80 border border-[#E6A635]/30 hover:border-[#E6A635] hover:text-[#F2BD52]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-[#241812] text-white border-[#E6A635]/30 hover:border-[#E6A635] hover:text-[#F2BD52]"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="size-3 text-[#E6A635]" />
                  </button>

                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-[#3B271C]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[#E6A635]/35 max-w-xl mx-auto shadow-xl">
            <Sparkles className="size-8 text-[#E6A635] mb-3 animate-pulse" />
            <h3 className="font-heading text-lg sm:text-2xl text-white mb-1.5">Aucun modèle trouvé</h3>
            <p className="text-xs text-white/85 font-light leading-relaxed mb-4 max-w-sm">
              Nos maîtres artisans façonnent vos poignées sur-mesure selon vos croquis.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedType(null)
                  setSelectedSize('all')
                  setSearchQuery('')
                }}
                className="px-4 py-2 rounded-full bg-[#241812] text-white text-[10px] font-bold uppercase tracking-widest border border-[#E6A635]/40 hover:border-[#E6A635] transition-all cursor-pointer"
              >
                Voir tout
              </button>
              <Link
                href="/custom-creation"
                className="btn-sheen px-4 py-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[10px] font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                Sur-Mesure
              </Link>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION RÉASSURANCE & ENGAGEMENT DE L'ATELIER (COMPACT MOBILE)          */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24 relative z-10">
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#3B271C]/90 to-[#241812]/95 backdrop-blur-xl border border-[#E6A635]/35 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            
            {/* Pillar 1 */}
            <div className="flex items-start gap-2.5">
              <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shrink-0 shadow-sm">
                <Hammer className="size-4 sm:size-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs sm:text-base font-normal text-white mb-0.5">
                  Artisanat Pur
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-white/70 font-light leading-tight">
                  Noyer massif &amp; faïence d&apos;époque.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-2.5">
              <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shrink-0 shadow-sm">
                <Wrench className="size-4 sm:size-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs sm:text-base font-normal text-white mb-0.5">
                  Fixation Inox
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-white/70 font-light leading-tight">
                  Visserie fournie (bois 18-40 mm).
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-2.5">
              <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shrink-0 shadow-sm">
                <Award className="size-4 sm:size-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs sm:text-base font-normal text-white mb-0.5">
                  Sur-Mesure
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-white/70 font-light leading-tight">
                  Création sur plan et séries d&apos;architecte.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-2.5">
              <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shrink-0 shadow-sm">
                <Truck className="size-4 sm:size-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs sm:text-base font-normal text-white mb-0.5">
                  Livraison Soignée
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-white/70 font-light leading-tight">
                  Colis sécurisé Tunisie &amp; Export.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MODALE DE RÉSERVATION / CONFIGURATEUR SUR-MESURE                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showInquiryModal && selectedHandle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-[#3B271C] border-2 border-[#E6A635]/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[94vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInquiryModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 size-7 sm:size-8 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors cursor-pointer"
              >
                <X className="size-3.5 sm:size-4" />
              </button>

              {sent ? (
                <div className="text-center py-6 sm:py-8 flex flex-col items-center">
                  <div className="size-12 sm:size-14 rounded-full bg-[#E6A635]/20 border-2 border-[#E6A635] flex items-center justify-center mb-3 sm:mb-4 shadow-[0_0_20px_rgba(230,166,53,0.4)]">
                    <CheckCircle2 className="size-6 sm:size-7 text-[#F2BD52]" />
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl text-white mb-1.5">Demande Reçue avec Succès</h3>
                  <p className="text-[11px] sm:text-xs text-white/90 font-light leading-relaxed max-w-sm mb-5">
                    Merci pour votre réservation pour le modèle <strong>{selectedHandle.name}</strong>. Nos maîtres artisans vous contacteront sous 24h ouvrées.
                  </p>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    className="btn-sheen px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={submitInquiry} className="space-y-3 sm:space-y-4 text-left">
                  
                  {/* Selected Item Summary Card */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#241812]/90 border border-[#E6A635]/35">
                    {/* Floating mini handle with spotlight */}
                    <div className="size-12 sm:size-16 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/40 p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,166,53,0.25)_0%,transparent_70%)]" />
                      {selectedHandle.image ? (
                        <img src={selectedHandle.image} alt="" className="size-full object-contain relative z-10" />
                      ) : (
                        <Sparkles className="size-4 text-[#E6A635]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-bold block truncate">
                        {selectedHandle.typeLabel}
                      </span>
                      <h3 className="font-heading text-sm sm:text-lg font-normal text-white truncate">
                        {selectedHandle.name}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                        <span className="text-[11px] sm:text-xs font-bold text-[#F2BD52]">
                          {selectedHandle.type === 'sculptee' ? 'Dès 28 TND' : `${selectedHandle.price || 24} TND`}
                        </span>
                        <span className="text-[9px] text-white/50">•</span>
                        <span className="text-[9.5px] sm:text-[10px] text-white/70">
                          Total : <strong className="text-white font-bold">{((selectedHandle.price || 24) * inquiryData.qty)} TND</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Options Spécifiques aux Poignées Sculptées (Longueur & Finition) */}
                  {selectedHandle.type === 'sculptee' && (
                    <div className="space-y-2.5 p-2.5 sm:p-3.5 bg-[#241812]/90 rounded-xl sm:rounded-2xl border border-[#E6A635]/35">
                      {/* Choix Longueur */}
                      <div>
                        <label className="block text-[9.5px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1 flex items-center gap-1">
                          <Ruler className="size-2.5 sm:size-3 text-[#E6A635]" />
                          <span>Longueur Souhaitée :</span>
                        </label>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {['10 cm', '15 cm', '20 cm', '25 cm', '30 cm', 'Sur-mesure'].map((len) => (
                            <button
                              key={len}
                              type="button"
                              onClick={() => setInquiryData({ ...inquiryData, length: len })}
                              className={`px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                                inquiryData.length === len
                                  ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] shadow-sm font-extrabold'
                                  : 'bg-[#18130E] text-white border-[#E6A635]/30 hover:border-[#E6A635]'
                              }`}
                            >
                              {len}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Choix Finition */}
                      <div>
                        <label className="block text-[9.5px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1 flex items-center gap-1">
                          <Palette className="size-2.5 sm:size-3 text-[#E6A635]" />
                          <span>Patine &amp; Finition :</span>
                        </label>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {[
                            { name: 'Blanc Cérusé', color: '#F0EDE6' },
                            { name: 'Bleu Majolique', color: '#4682B4' },
                            { name: 'Vert Sauge', color: '#8FBC8F' },
                            { name: 'Ocre Safran', color: '#DAA520' }
                          ].map((f) => (
                            <button
                              key={f.name}
                              type="button"
                              onClick={() => setInquiryData({ ...inquiryData, finish: f.name })}
                              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                                inquiryData.finish === f.name
                                  ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] shadow-sm font-bold'
                                  : 'bg-[#18130E] text-white border-[#E6A635]/30 hover:border-[#E6A635]'
                              }`}
                            >
                              <span className="size-2 rounded-full border border-black/40" style={{ backgroundColor: f.color }} />
                              <span>{f.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                      Nombre de pièces souhaité
                    </label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {[2, 4, 6, 8, 12].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setInquiryData({ ...inquiryData, qty })}
                          className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                            inquiryData.qty === qty
                              ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] shadow-sm font-extrabold'
                              : 'bg-[#241812]/80 text-white border-[#E6A635]/30 hover:border-[#E6A635]'
                          }`}
                        >
                          {qty}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="1"
                        value={inquiryData.qty}
                        onChange={(e) => setInquiryData({ ...inquiryData, qty: parseInt(e.target.value) || 1 })}
                        className="w-14 sm:w-16 px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/40 text-white text-[11px] sm:text-xs text-center focus:outline-none focus:border-[#E6A635] font-bold"
                      />
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">
                        Nom &amp; Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryData.fullName}
                        onChange={(e) => setInquiryData({ ...inquiryData, fullName: e.target.value })}
                        placeholder="Ex: Mohamed Ben Salem"
                        className="w-full px-3 py-2 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                        placeholder="Ex: +216 98 000 000"
                        className="w-full px-3 py-2 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">
                      Email (Optionnel)
                    </label>
                    <input
                      type="email"
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      placeholder="contact@exemple.com"
                      className="w-full px-3 py-2 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5">
                      Précisions (Optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={inquiryData.notes}
                      onChange={(e) => setInquiryData({ ...inquiryData, notes: e.target.value })}
                      placeholder="Type de meuble, cuisine, dressing..."
                      className="w-full px-3 py-1.5 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="btn-sheen w-full py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {submitLoading ? (
                        <>
                          <div className="size-3.5 border-2 border-[#1A110B] border-t-transparent rounded-full animate-spin" />
                          <span>Transmission...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3 text-[#1A110B]" />
                          <span>Confirmer Ma Réservation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. LIGHTBOX / ZOOM PHOTO EN SITUATION RÉELLE                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewImage && (
          <div 
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/60 shadow-[0_30px_90px_rgba(0,0,0,0.95)] bg-[#1A110B]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 size-8 sm:size-10 rounded-full bg-black/70 border border-[#E6A635]/50 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer"
              >
                <X className="size-4 sm:size-5" />
              </button>
              <img
                src={previewImage}
                alt="Aperçu meuble"
                className="max-h-[85vh] w-auto object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
