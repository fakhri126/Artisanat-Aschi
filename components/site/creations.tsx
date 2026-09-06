'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, isBijouxOrHandleCategory, isBijouxOrHandleProduct } from '@/lib/utils'
import { Reveal } from './reveal'
import { publicApi, Product } from '@/lib/api'
import Link from 'next/link'
import {
  ShoppingCart, Sparkles, Flame, CheckCircle2, ArrowRight,
  Search, SlidersHorizontal, Maximize2, ZoomIn, X,
  ChevronLeft, ChevronRight, MessageCircle, Truck, ShieldCheck,
  Eye, Compass, RotateCcw, Camera
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'

export function Creations() {
  const { addToCart } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'unique_first'>('newest')
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState<number | null>(null)

  // ── Dedicated Independent Product Sheet Modal State ──
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [detailImgIdx, setDetailImgIdx] = useState(0)

  // Touch swipe support for mobile gallery in detailProduct
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || !detailProduct) return
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 40
    if (diff > minSwipeDistance && (detailProduct.images?.length || 0) > 1) {
      // Swiped Left -> Next angle
      setDetailImgIdx(prev => (prev + 1) % detailProduct.images.length)
    } else if (diff < -minSwipeDistance && (detailProduct.images?.length || 0) > 1) {
      // Swiped Right -> Previous angle
      setDetailImgIdx(prev => (prev - 1 + detailProduct.images.length) % detailProduct.images.length)
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // ── Fullscreen Lightbox State ──
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null)
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0)

  // Keyboard navigation for modals
  useEffect(() => {
    if (!lightboxProduct && !detailProduct) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxProduct) setLightboxProduct(null)
        else if (detailProduct) setDetailProduct(null)
      }
      if (lightboxProduct && (lightboxProduct.images?.length || 0) > 1) {
        if (e.key === 'ArrowRight') setLightboxImgIdx(prev => (prev + 1) % lightboxProduct.images.length)
        if (e.key === 'ArrowLeft') setLightboxImgIdx(prev => (prev - 1 + lightboxProduct.images.length) % lightboxProduct.images.length)
      }
      if (detailProduct && (detailProduct.images?.length || 0) > 1) {
        if (e.key === 'ArrowRight') setDetailImgIdx(prev => (prev + 1) % detailProduct.images.length)
        if (e.key === 'ArrowLeft') setDetailImgIdx(prev => (prev - 1 + detailProduct.images.length) % detailProduct.images.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxProduct, detailProduct])

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodData, catData] = await Promise.all([
          publicApi.getProducts(),
          publicApi.getCategories()
        ])

        // Only keep available furniture pieces in stock (exclude CATALOGUE and exclude ALL handle/bijoux)
        const availableProds = prodData.filter((p) => {
          const isCatalog = p.type === 'CATALOGUE'
          return !isCatalog && !isBijouxOrHandleProduct(p)
        })
        setAllProducts(availableProds)

        // Extract pure furniture categories (NEVER include any Bijoux de Porte, Poignées, Grands Ronds, Ovales, etc.)
        const catNames = new Set<string>()
        catData.forEach(c => {
          if (!isBijouxOrHandleCategory(c.name)) {
            catNames.add(c.name)
          }
        })
        availableProds.forEach(p => {
          if (p.category?.name && !isBijouxOrHandleCategory(p.category.name)) {
            catNames.add(p.category.name)
          }
        })

        const pureCategories = Array.from(catNames).filter(c => !isBijouxOrHandleCategory(c))
        setCategories(['Tout', 'Pièces uniques', ...pureCategories])
      } catch (err) {
        console.error('Error fetching creations data:', err)
        setCategories(['Tout', 'Pièces uniques', 'Buffets', 'Meubles TV', 'Miroirs', 'Portes', 'Coffres', 'Décoration', 'Tables'])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...allProducts]

    // Category filter
    if (selectedCategory === 'Pièces uniques') {
      list = list.filter(p => p.type === 'PIECE_UNIQUE')
    } else if (selectedCategory !== 'Tout') {
      list = list.filter(p => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === 'unique_first') {
      list.sort((a, b) => (a.type === 'PIECE_UNIQUE' ? -1 : 1))
    } else {
      // newest (descending ID)
      list.sort((a, b) => b.id - a.id)
    }

    return list
  }, [allProducts, selectedCategory, searchQuery, sortBy])

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  const getProductWhatsAppUrl = (p: Product) => {
    const priceText = p.price ? `${p.price.toLocaleString('fr-FR')} DT` : 'Tarif sur demande'
    const text = `Bonjour Maison Aschi, je souhaite commander ou réserver cette pièce disponible en stock :

✨ Pièce : ${p.name}
💰 Prix : ${priceText}
🪵 Matière : ${p.materials || 'Noyer noble massif'}
📐 Dimensions : ${p.dimensions || 'Sur mesure'}
🔗 Référence : https://artisanat-aschi.com/produits/${p.id}

Est-elle toujours disponible pour une livraison ou visite au showroom ?`
    return `https://wa.me/21655743760?text=${encodeURIComponent(text)}`
  }

  const openDetailModal = (product: Product, imgIdx = 0) => {
    setDetailProduct(product)
    setDetailImgIdx(imgIdx)
  }

  const openLightbox = (product: Product, imgIdx = 0) => {
    setLightboxProduct(product)
    setLightboxImgIdx(imgIdx)
  }

  return (
    <section id="creations-disponibles" className="relative bg-transparent text-[#F7F4EE] py-4 sm:py-8 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── HEADER ── */}
        <Reveal className="flex flex-col items-center text-center max-w-3xl mx-auto mb-4 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.18em] mb-2 sm:mb-3 shadow-md">
            <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
            <span>Pièces Disponibles • Prêtes à Commander</span>
          </div>
          
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient leading-[1.08] mb-1.5 sm:mb-3 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
            Pièces &amp; Mobilier Disponibles
          </h1>
          
          <p className="text-[#EAE4D9]/90 text-xs sm:text-sm md:text-base font-light leading-snug sm:leading-relaxed max-w-2xl drop-shadow-md">
            Découvrez nos créations sculptées en noyer massif disponibles immédiatement en stock. Chaque meuble d&apos;art est unique, prêt pour une livraison soignée ou un retrait à l&apos;atelier de La Goulette.
          </p>

          {/* ── REASSURANCE PILLS (Refined & Compact on Mobile) ── */}
          <div className="mt-2.5 sm:mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-[9.5px] sm:text-xs text-white/85">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-[#3B271C]/80 border border-[#E6A635]/30 shadow-sm backdrop-blur-sm">
              <Truck className="size-2.5 sm:size-3.5 text-[#F2BD52] shrink-0" />
              <span>Livraison 48-72h</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-[#3B271C]/80 border border-[#E6A635]/30 shadow-sm backdrop-blur-sm">
              <Eye className="size-2.5 sm:size-3.5 text-[#F2BD52] shrink-0" />
              <span>Showroom La Goulette</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-[#3B271C]/80 border border-[#E6A635]/30 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="size-2.5 sm:size-3.5 text-[#F2BD52] shrink-0" />
              <span>100% Noyer noble séché</span>
            </div>
          </div>
        </Reveal>

        {/* ── CONTROLS: CATEGORIES + SEARCH & SORT ── */}
        <Reveal delay={100} className="w-full mb-4 sm:mb-8">
          <div className="flex flex-col gap-2.5 sm:gap-4">
            
            {/* Category Filter Tabs with Horizontal Scroll on Mobile */}
            {!loading && categories.length > 1 && (
              <div className="relative">
                {/* Mobile fade mask on right */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#241812] to-transparent z-10 pointer-events-none sm:hidden" />
                
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-2 scrollbar-none sm:flex-wrap sm:justify-center">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'shrink-0 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap',
                          isActive
                            ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold shadow-[0_0_15px_rgba(230,166,53,0.35)] scale-105'
                            : 'bg-[#3B271C]/85 text-[#EAE4D9]/85 border border-[#E6A635]/30 hover:border-[#E6A635]/70 hover:bg-[#442E20] hover:text-white backdrop-blur-md'
                        )}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 bg-[#3B271C]/80 border border-[#E6A635]/30 backdrop-blur-xl p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#E6A635]/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par meuble, bois, teinte..."
                  className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#241812]/90 border border-[#E6A635]/25 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-[#E6A635] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-white/50 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Counter & Sort selector */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                <span className="text-[10.5px] sm:text-[11px] text-[#F2BD52] font-medium whitespace-nowrap">
                  {filteredProducts.length} {filteredProducts.length > 1 ? 'pièces disponibles' : 'pièce disponible'}
                </span>

                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3 text-[#E6A635] shrink-0" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-[#241812]/90 border border-[#E6A635]/25 text-white text-[11px] sm:text-xs rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1.5 sm:py-2 outline-none focus:border-[#E6A635] cursor-pointer"
                  >
                    <option value="newest">Dernières sorties d&apos;atelier</option>
                    <option value="unique_first">Pièces uniques d&apos;abord</option>
                    <option value="price_asc">Prix : croissant</option>
                    <option value="price_desc">Prix : décroissant</option>
                  </select>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

        {/* ── PRODUCT GRID ── */}
        <div className="mt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="size-10 animate-spin rounded-full border-2 border-[#E6A635] border-t-transparent shadow-lg" />
              <span className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold">Chargement des pièces d&apos;exception...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#EAE4D9]/70 bg-[#3B271C]/60 rounded-3xl border border-[#E6A635]/25 p-8 max-w-xl mx-auto">
              <p className="text-base font-light mb-2 text-white">Aucune pièce disponible avec ces critères.</p>
              <p className="text-xs text-white/60 mb-5 font-light">Toutes nos pièces peuvent être façonnées sur-mesure à vos dimensions exactes.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('Tout'); setSearchQuery('') }}
                  className="px-5 py-2.5 rounded-full border border-[#E6A635]/40 text-[#F2BD52] text-xs font-semibold hover:bg-[#E6A635]/15 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
                <Link href="/custom-creation" className="btn-sheen px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider">
                  Commander au Studio Sur-Mesure
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:gap-5 lg:gap-6 grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((item, i) => {
                const name = item.name
                const image = item.images?.[0]?.imageUrl || '/placeholder.jpg'
                const hasMultipleImages = (item.images?.length || 0) > 1
                const meta = `${item.materials || 'Noyer noble massif'} · ${item.dimensions || 'Dimensions d\'atelier'}`
                const price = item.price ? `${item.price.toLocaleString('fr-FR')} DT` : 'Sur demande'
                const isUnique = item.type === 'PIECE_UNIQUE'
                const isAdded = addedId === item.id

                return (
                  <Reveal key={item.id} delay={Math.min(i * 40, 250)}>
                    <article className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-[#E6A635]/80 hover:bg-[#442E20]/95 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                      
                      {/* Photo Frame — Click to open Independent Product Sheet Modal */}
                      <div 
                        onClick={() => openDetailModal(item, 0)}
                        className="relative aspect-[4/3] overflow-hidden bg-[#241812] cursor-pointer group/img select-none"
                      >
                        <Image
                          src={image}
                          alt={name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3B271C] via-transparent to-transparent opacity-80" />
                        
                        {/* Always visible tactile badge for mobile & desktop */}
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 z-10 flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[8px] sm:text-[10px] font-semibold shadow-md">
                          {hasMultipleImages ? (
                            <>
                              <Camera className="size-2.5 sm:size-3 text-[#E6A635]" />
                              <span>{item.images.length} vues</span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-2.5 sm:size-3 text-[#E6A635]" />
                              <span className="hidden sm:inline">Zoom</span>
                            </>
                          )}
                        </div>

                        {/* Top Badges */}
                        <div className="absolute left-1.5 top-1.5 sm:left-3 sm:top-3 flex flex-col gap-1 z-10">
                          {isUnique ? (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[7.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-white shadow-md ring-1 ring-amber-400/40">
                              <Flame className="size-2 sm:size-2.5 text-yellow-300" />
                              Unique
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-[#241812]/95 border border-[#E6A635]/50 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[7.5px] sm:text-[9.5px] font-semibold uppercase tracking-wider text-[#F2BD52] shadow-sm">
                              <CheckCircle2 className="size-2 sm:size-2.5 text-[#F2BD52]" />
                              En stock
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold truncate">
                              {item.category?.name || 'Mobilier'}
                            </span>
                            <span className="text-[8.5px] sm:text-[10px] text-emerald-400 font-medium shrink-0 hidden sm:flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Dispo
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => openDetailModal(item, 0)}
                            className="text-left w-full cursor-pointer group/title"
                          >
                            <h3 className="font-heading text-xs sm:text-lg font-medium text-[#F7F4EE] group-hover/title:text-[#F2BD52] transition-colors leading-tight line-clamp-1 mb-0.5 sm:mb-1">
                              {name}
                            </h3>
                          </button>
                          
                          <p className="text-[8.5px] sm:text-[11px] font-light text-[#EAE4D9]/80 line-clamp-1 mb-1.5 sm:mb-2.5">
                            {meta}
                          </p>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-1.5 sm:pt-2.5 border-t border-[#E6A635]/25 flex flex-col gap-1.5 sm:gap-2">
                          
                          <div className="flex items-baseline justify-between">
                            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-white/50">Prix :</span>
                            <span className="font-heading text-xs sm:text-lg text-gold-gradient font-bold drop-shadow-sm">
                              {price}
                            </span>
                          </div>
                          
                          {/* Dual Action: WhatsApp Direct + Commander Panier */}
                          <div className="grid grid-cols-2 gap-1 sm:gap-2">
                            
                            {/* WhatsApp Direct */}
                            <a
                              href={getProductWhatsAppUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/30 border border-[#25D366]/50 text-white text-[8.5px] sm:text-[10.5px] font-bold uppercase tracking-wider hover:bg-[#25D366]/30 hover:border-[#25D366] transition-all text-center active:scale-95"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageCircle className="size-2.5 sm:size-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">WhatsApp</span>
                            </a>

                            {/* Commander / Panier */}
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item)}
                              className="btn-sheen inline-flex items-center justify-center gap-1 px-1.5 sm:px-3 py-1 sm:py-2 text-[8.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#1A110B] bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] rounded-lg sm:rounded-xl transition-all shadow-md cursor-pointer text-center active:scale-95"
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle2 className="size-2.5 sm:size-3.5 text-[#1A110B]" />
                                  <span className="truncate">Ajouté ✓</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="size-2.5 sm:size-3.5 text-[#1A110B]" />
                                  <span className="truncate">Commander</span>
                                </>
                              )}
                            </button>

                          </div>

                        </div>

                      </div>

                    </article>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>

        {/* ── BOTTOM GATEWAY: SUR-MESURE ADAPTATION CONSOLE ── */}
        <Reveal delay={150} className="mt-16 sm:mt-20">
          <div className="relative rounded-3xl border-2 border-[#E6A635]/45 bg-[#3B271C]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-center max-w-4xl mx-auto overflow-hidden">
            <div className="absolute top-0 right-0 size-60 rounded-full bg-[#E6A635]/15 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/35 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.16em] mb-3">
                <Compass className="size-3.5 text-[#E6A635]" />
                <span>Dimensions ou finitions sur-mesure</span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-gold-gradient font-light mb-2.5">
                Vous aimez un modèle mais souhaitez d&apos;autres dimensions ?
              </h2>

              <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed max-w-2xl mx-auto mb-6">
                Chaque pièce de notre collection peut être façonnée sur-mesure dans notre atelier : adaptez les dimensions au centimètre près, choisissez la patine du bois (noyer naturel, foncé, cérusé) ou intégrez vos propres motifs de céramique.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/custom-creation"
                  className="btn-sheen w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="size-4" />
                  <span>Concevoir au Studio Sur-Mesure</span>
                </Link>

                <a
                  href="https://wa.me/21655743760?text=Bonjour%20Maison%20Aschi%2C%20je%20souhaite%20adapter%20un%20mod%C3%A8le%20de%20mobilier%20disponible%20%C3%A0%20mes%20propres%20dimensions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="size-4 fill-white/20" />
                  <span>Discuter avec Ismail sur WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        </Reveal>

      </div>

      {/* ── DEDICATED INDEPENDENT QUICK-VIEW PRODUCT SHEET MODAL ── */}
      <AnimatePresence>
        {detailProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
            onClick={() => setDetailProduct(null)}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#3B271C]/98 border-2 border-[#E6A635]/45 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-left my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header with Title & Close */}
              <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E6A635]/25 bg-[#241812]/90 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-[#E6A635]/20 border border-[#E6A635]/50 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-[#F2BD52]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#F2BD52] font-bold block truncate">
                      {detailProduct.category?.name || 'Mobilier d\'art'} • Pièce Disponible en Showroom
                    </span>
                    <h2 className="font-heading text-lg sm:text-2xl text-white font-medium truncate leading-tight">
                      {detailProduct.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setDetailProduct(null)}
                  className="p-2 rounded-full bg-[#241812] border border-[#E6A635]/30 text-white/70 hover:text-white hover:border-[#E6A635] transition-colors shrink-0 cursor-pointer ml-3"
                  aria-label="Fermer la fiche produit"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Body (Scrollable if screen is small) */}
              <div className="p-3.5 sm:p-7 pb-20 sm:pb-7 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
                
                {/* ── LEFT: Multi-Angle Gallery ── */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Main Photo with Touch Swipe and Click to Zoom */}
                  <div 
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => openLightbox(detailProduct, detailImgIdx)}
                    className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-[#241812] border border-[#E6A635]/35 shadow-lg group cursor-zoom-in select-none"
                  >
                    <Image
                      src={detailProduct.images?.[detailImgIdx]?.imageUrl || detailProduct.images?.[0]?.imageUrl || '/placeholder.jpg'}
                      alt={detailProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Zoom Hint */}
                    <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-[10.5px] font-semibold">
                      <ZoomIn className="size-3 sm:size-3.5" />
                      <span>Plein écran HD</span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                      {detailProduct.type === 'PIECE_UNIQUE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                          <Flame className="size-2.5 sm:size-3 text-yellow-300" />
                          Pièce Unique d&apos;Atelier
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#241812]/95 border border-[#E6A635]/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#F2BD52]">
                          <CheckCircle2 className="size-2.5 sm:size-3 text-[#F2BD52]" />
                          Disponible immédiatement
                        </span>
                      )}
                    </div>

                    {/* Mobile Left / Right Chevron Overlay */}
                    {(detailProduct.images?.length || 0) > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDetailImgIdx(prev => (prev - 1 + detailProduct.images.length) % detailProduct.images.length) }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 size-7 sm:size-8 rounded-full bg-black/75 border border-[#E6A635]/50 text-[#F2BD52] flex items-center justify-center backdrop-blur-md active:scale-90 z-20 transition-transform shadow-md"
                          aria-label="Angle précédent"
                        >
                          <ChevronLeft className="size-3.5 sm:size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDetailImgIdx(prev => (prev + 1) % detailProduct.images.length) }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 sm:size-8 rounded-full bg-black/75 border border-[#E6A635]/50 text-[#F2BD52] flex items-center justify-center backdrop-blur-md active:scale-90 z-20 transition-transform shadow-md"
                          aria-label="Angle suivant"
                        >
                          <ChevronRight className="size-3.5 sm:size-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Dots indicator for touch swipe on mobile */}
                  {(detailProduct.images?.length || 0) > 1 && (
                    <div className="flex items-center justify-center gap-1.5 sm:hidden py-0.5">
                      {detailProduct.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDetailImgIdx(idx)}
                          className={`rounded-full transition-all duration-300 ${
                            detailImgIdx === idx ? 'w-4 h-1 bg-[#E6A635]' : 'size-1 bg-white/30'
                          }`}
                          aria-label={`Angle ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Thumbnail Row of Other Angles */}
                  {(detailProduct.images?.length || 0) > 1 ? (
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] text-[#F2BD52] font-semibold mb-1">
                        <span>📸 Angles &amp; Détails ({detailProduct.images.length} photos) :</span>
                        <span className="text-white/40 font-light hidden sm:inline">Glissez ou cliquez</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {detailProduct.images.map((img, idx) => {
                          const isActive = detailImgIdx === idx
                          return (
                            <button
                              key={img.id || idx}
                              type="button"
                              onClick={() => setDetailImgIdx(idx)}
                              className={`relative size-12 sm:size-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                isActive
                                  ? 'border-[#E6A635] shadow-[0_0_12px_rgba(230,166,53,0.4)] scale-105 ring-2 ring-[#E6A635]/30'
                                  : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/60'
                              }`}
                            >
                              <Image src={img.imageUrl} alt={`Angle ${idx + 1}`} fill className="object-cover" sizes="48px" />
                              {img.colorLabel && img.colorLabel !== 'Original' && (
                                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7.5px] sm:text-[8px] text-white text-center py-0.5 truncate font-semibold">
                                  {img.colorLabel}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#241812]/60 border border-white/10 text-[10px] sm:text-[11px] text-white/50 italic text-center font-light">
                      ✦ Photo authentique de la pièce réalisée à l&apos;Atelier Aschi
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Details, Price & Actions ── */}
                <div className="space-y-4 sm:space-y-5">
                  
                  {/* Price & Delivery Notice */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/35 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">Prix Atelier :</span>
                      <span className="font-heading text-2xl sm:text-3xl text-gold-gradient font-bold drop-shadow-sm">
                        {detailProduct.price ? `${detailProduct.price.toLocaleString('fr-FR')} DT` : 'Tarif sur demande'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-400">
                        <Truck className="size-3.5" /> En stock
                      </span>
                      <span className="block text-[9.5px] text-white/50 font-light">Livraison 48-72h</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold mb-1.5">Description de la pièce :</h4>
                    <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed whitespace-pre-line bg-[#241812]/50 p-3.5 rounded-xl border border-white/10">
                      {detailProduct.description || 'Pièce de menuiserie d\'art façonnée à la main dans notre atelier de La Goulette. Alliant le noyer massif séché aux finitions traditionnelles, cet ouvrage reflète le savoir-faire familial de la Maison Aschi depuis 1960.'}
                    </p>
                  </div>

                  {/* Technical Specifications Grid */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold mb-2">Fiche Technique :</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      
                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#241812]/80 border border-[#E6A635]/20">
                        <span className="text-[10px] text-white/40 uppercase font-bold block mb-0.5">Matière &amp; Bois</span>
                        <span className="text-white font-medium">{detailProduct.materials || 'Noyer noble massif'}</span>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#241812]/80 border border-[#E6A635]/20">
                        <span className="text-[10px] text-white/40 uppercase font-bold block mb-0.5">Dimensions réelles</span>
                        <span className="text-white font-medium">{detailProduct.dimensions || 'Dimensions d\'atelier'}</span>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#241812]/80 border border-[#E6A635]/20">
                        <span className="text-[10px] text-white/40 uppercase font-bold block mb-0.5">Finition &amp; Patine</span>
                        <span className="text-white font-medium">{detailProduct.color || 'Noyer ciré naturel'}</span>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#241812]/80 border border-[#E6A635]/20">
                        <span className="text-[10px] text-white/40 uppercase font-bold block mb-0.5">Lieu d&apos;exposition</span>
                        <span className="text-white font-medium">Showroom La Goulette</span>
                      </div>

                    </div>
                  </div>

                  {/* Desktop Action Buttons (Hidden on mobile because of sticky bar) */}
                  <div className="space-y-2.5 pt-1 hidden sm:block">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* WhatsApp Direct */}
                      <a
                        href={getProductWhatsAppUrl(detailProduct)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform text-center cursor-pointer"
                      >
                        <MessageCircle className="size-4 fill-white/20 shrink-0" />
                        <span>Réserver sur WhatsApp</span>
                      </a>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(detailProduct)}
                        className="btn-sheen inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform text-center cursor-pointer"
                      >
                        {addedId === detailProduct.id ? (
                          <>
                            <CheckCircle2 className="size-4 text-[#1A110B]" />
                            <span>Ajouté au Panier ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-4 text-[#1A110B]" />
                            <span>Commander la pièce</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sur-Mesure Link */}
                    <div className="text-center pt-1">
                      <Link
                        href={`/custom-creation?model=${encodeURIComponent(detailProduct.name)}`}
                        className="text-[11px] text-[#F2BD52] hover:underline inline-flex items-center gap-1.5 font-medium"
                      >
                        <Compass className="size-3 text-[#E6A635]" />
                        <span>Vous souhaitez adapter ce modèle à d&apos;autres dimensions ? Cliquez ici</span>
                      </Link>
                    </div>

                  </div>

                </div>

              </div>

              {/* ── MOBILE STICKY BOTTOM CONVERSION BAR ── */}
              <div className="sm:hidden sticky bottom-0 inset-x-0 bg-[#241812]/98 backdrop-blur-xl border-t border-[#E6A635]/40 px-4 py-3 flex items-center justify-between gap-3 z-30 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] shrink-0">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-white/50 block leading-none mb-0.5">Prix Atelier</span>
                  <span className="font-heading text-lg text-gold-gradient font-bold drop-shadow-sm truncate block leading-none">
                    {detailProduct.price ? `${detailProduct.price.toLocaleString('fr-FR')} DT` : 'Sur demande'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getProductWhatsAppUrl(detailProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 text-center"
                  >
                    <MessageCircle className="size-3.5 fill-white/20 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(detailProduct)}
                    className="btn-sheen inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer text-center"
                  >
                    {addedId === detailProduct.id ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-[#1A110B]" />
                        <span>Ajouté ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-3.5 text-[#1A110B]" />
                        <span>Commander</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {lightboxProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setLightboxProduct(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxProduct(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] transition-colors shadow-2xl"
              aria-label="Fermer la vue agrandie"
            >
              <X className="size-6" />
            </button>

            {/* Lightbox Content Window */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            >
              {/* Main Photo View */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden border border-[#E6A635]/40 bg-[#1A110B] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                <Image
                  src={lightboxProduct.images?.[lightboxImgIdx]?.imageUrl || lightboxProduct.images?.[0]?.imageUrl || '/placeholder.jpg'}
                  alt={lightboxProduct.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />

                {/* Navigation Arrows */}
                {(lightboxProduct.images?.length || 0) > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxImgIdx(prev => (prev - 1 + lightboxProduct.images.length) % lightboxProduct.images.length)
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] hover:bg-[#3B271C] transition-colors shadow-lg"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="size-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxImgIdx(prev => (prev + 1) % lightboxProduct.images.length)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] hover:bg-[#3B271C] transition-colors shadow-lg"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Info Bar & Thumbnails */}
              <div className="w-full mt-3 p-4 rounded-2xl bg-[#3B271C]/95 border border-[#E6A635]/35 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                
                <div className="text-left w-full sm:w-auto">
                  <h3 className="font-heading text-lg sm:text-xl text-white font-medium">{lightboxProduct.name}</h3>
                  <p className="text-xs text-[#F2BD52] font-semibold">
                    {lightboxProduct.price ? `${lightboxProduct.price.toLocaleString('fr-FR')} DT` : 'Prix sur demande'} • <span className="text-white/70 font-light">{lightboxProduct.materials}</span>
                  </p>
                </div>

                {/* Thumbnails */}
                {(lightboxProduct.images?.length || 0) > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto max-w-xs py-1">
                    {lightboxProduct.images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setLightboxImgIdx(idx)}
                        className={`relative size-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          lightboxImgIdx === idx ? 'border-[#E6A635] scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image src={img.imageUrl} alt="thumbnail" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Lightbox Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={getProductWhatsAppUrl(lightboxProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="size-3.5 fill-white/20" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(lightboxProduct)
                      setLightboxProduct(null)
                    }}
                    className="btn-sheen inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
                  >
                    <ShoppingCart className="size-3.5" />
                    <span>Commander</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
