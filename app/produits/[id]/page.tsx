'use client'

import { useEffect, useState, use, useMemo, useRef } from 'react'
import Link from 'next/link';
import { publicApi, Product } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ArrowLeft, Ruler, Hammer, Sparkles, MessageCircle, AlertCircle, X, ShoppingCart, Bot, Palette, SquareStack, Send, CheckCircle2, Check, ZoomIn, ZoomOut, RotateCcw, Move, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { motion, AnimatePresence } from 'framer-motion'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const productId = parseInt(resolvedParams.id)
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState('')

  // ── Interactive Loupe & Lightbox Zoom State ──────────────────────────────
  const [showZoomLens, setShowZoomLens] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [imgPercent, setImgPercent] = useState({ x: 50, y: 50 })
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false)
  const [modalZoomScale, setModalZoomScale] = useState(1)
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return
    const rect = zoomContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const py = Math.max(0, Math.min(100, (y / rect.height) * 100))
    setLensPos({ x, y })
    setImgPercent({ x: px, y: py })
  }

  // Dynamically generate size options based on product category
  const isAIDimensionCategory = product ? ['buffet', 'tv', 'porte'].some(k => product.category?.name.toLowerCase().includes(k)) : false
  const SIZES = [
    { id: 'original', label: 'Dimensions\noriginales', sub: '' },
    { id: 'small',    label: 'Petit',          sub: isAIDimensionCategory ? 'Variante IA' : '< 80 cm' },
    { id: 'medium',   label: 'Moyen',          sub: isAIDimensionCategory ? 'Variante IA' : '80 – 150 cm' },
    { id: 'large',    label: 'Grand',          sub: isAIDimensionCategory ? 'Variante IA' : '> 150 cm' },
    { id: 'custom',   label: 'Sur mesure',     sub: 'Entrez vos cm' },
  ]

  // ── Configurator state ─────────────────────────────────────────────────────
  // selectedVariantIdx: index into the colorVariants array (built from product images with colorLabel)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState({ id: 'original', label: 'Dimensions\noriginales', sub: '' })
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const hasInitializedFromUrl = useRef(false)

  // ── Quote modal state ──────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [quoteSent, setQuoteSent] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true)
        const data = await publicApi.getProductById(productId)
        setProduct(data)
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].imageUrl)
        }
        const allInCategory = await publicApi.getProducts({ category: data.category.name })
        setSimilarProducts(allInCategory.filter(p => p.id !== productId).slice(0, 3))
      } catch (err: any) {
        setError(err.message || 'Impossible de charger ce produit.')
      } finally {
        setLoading(false)
      }
    }
    if (productId) loadProductData()
  }, [productId])

  // Reset variant selection when product changes
  useEffect(() => {
    setSelectedVariantIdx(0)
  }, [product?.id])

  // ── Build UNIQUE colorVariants from product images ─────────
  const colorVariants = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) return []
    const variantsMap = new Map()
    
    product.images.forEach(img => {
      const label = img.colorLabel || 'Original'
      if (!variantsMap.has(label)) {
        variantsMap.set(label, {
          label,
          imageUrl: img.imageUrl,
          isOriginal: label === 'Original',
        })
      }
    })
    
    // Ensure "Original" is always first if it exists
    const variantsArray = Array.from(variantsMap.values())
    const originalIdx = variantsArray.findIndex(v => v.isOriginal)
    if (originalIdx > 0) {
      const original = variantsArray.splice(originalIdx, 1)[0]
      variantsArray.unshift(original)
    }
    return variantsArray
  }, [product])

  // Initialize from URL parameters (auto-select variant & open modal)
  useEffect(() => {
    if (hasInitializedFromUrl.current || !product || colorVariants.length === 0) return
    hasInitializedFromUrl.current = true

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const initialColor = params.get('color')
      const action = params.get('action')
      
      let currentIdx = 0

      if (initialColor) {
        const idx = colorVariants.findIndex(v => v.label.toLowerCase() === initialColor.toLowerCase())
        if (idx !== -1) {
          setSelectedVariantIdx(idx)
          setActiveImage(colorVariants[idx].imageUrl)
          currentIdx = idx
        }
      }

      if (action === 'devis') {
        const parts: string[] = []
        const selectedVar = colorVariants[currentIdx]
        if (selectedVar && !selectedVar.isOriginal) {
          parts.push(`Finition souhaitée: ${selectedVar.label}`)
        }
        const summary = parts.join(' | ')
        setMessage(
          summary
            ? `Bonjour, je souhaiterais commander le modèle « ${product.name} » avec les personnalisations suivantes :\n${summary.replace(' | ', '\n')}`
            : `Bonjour, je souhaiterais obtenir un devis pour le modèle « ${product.name} ».`
        )
        setModalOpen(true)
      }
    }
  }, [product, colorVariants])

  // Build pre-filled personalization summary for the quote form
  const buildConfigSummary = () => {
    const parts: string[] = []
    const selectedVariant = colorVariants[selectedVariantIdx]

    if (selectedVariant && !selectedVariant.isOriginal) {
      parts.push(`Finition souhaitée: ${selectedVariant.label}`)
    }
    if (selectedSize.id !== 'original') {
      if (selectedSize.id === 'custom') {
        parts.push(`Dimensions sur mesure: ${customWidth || '?'} cm (L) × ${customHeight || '?'} cm (H)`)
      } else {
        parts.push(`Taille souhaitée: ${selectedSize.label} (${selectedSize.sub})`)
      }
    }
    return parts.join(' | ')
  }

  const openConfigQuote = () => {
    const summary = buildConfigSummary()
    setMessage(
      summary
        ? `Bonjour, je souhaiterais commander le modèle « ${product?.name} » avec les personnalisations suivantes :\n${summary.replace(' | ', '\n')}`
        : `Bonjour, je souhaiterais obtenir un devis pour le modèle « ${product?.name} ».`
    )
    setQuoteSent(false)
    setQuoteError(null)
    setModalOpen(true)
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingQuote(true)
    setQuoteError(null)
    try {
      await publicApi.submitQuoteRequest({
        fullName,
        email,
        phoneNumber: phone,
        productId: product?.id,
        personalizationDetails: buildConfigSummary() || undefined,
        message,
      })
      setQuoteSent(true)
    } catch (err: any) {
      setQuoteError(err.message || "Une erreur s'est produite.")
    } finally {
      setSubmittingQuote(false)
    }
  }

  const selectedVariant = colorVariants[selectedVariantIdx] ?? colorVariants[0]
  const isCustomized = selectedVariant ? (!selectedVariant.isOriginal || selectedSize.id !== 'original') : false
  const configSummary = buildConfigSummary()

  // Get all views (images) for the currently selected variant
  const viewsForSelectedVariant = useMemo(() => {
    if (!product || !product.images || !selectedVariant) return []
    return product.images.filter(img => (img.colorLabel || 'Original') === selectedVariant.label)
  }, [product, selectedVariant])

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen items-center justify-center bg-[#FAF7F2] text-[#3A2A21]">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8DCCB] border-t-transparent mx-auto" />
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#C17D59] font-light">Chargement de la création...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] bg-secondary flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="size-16 text-red-500 mb-4" />
          <h1 className="font-heading text-3xl font-light text-foreground">Création introuvable</h1>
          <p className="mt-3 text-muted-foreground max-w-md">{error || "Le produit recherché n'existe pas ou a été retiré."}</p>
          <Link href="/#catalogue" className="mt-8 rounded-full bg-[#FAF7F2] text-[#3A2A21] hover:bg-bronze px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all">
            Retourner au catalogue
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIdx(idx)
    setActiveImage(colorVariants[idx].imageUrl)
    
    // Auto-select size if the variant label matches a size label
    const sizeMatch = SIZES.find(s => s.label.replace('\n', ' ') === colorVariants[idx].label || s.label === colorVariants[idx].label)
    if (sizeMatch) {
      setSelectedSize(sizeMatch)
    }

    if (window.innerWidth < 1024) {
      imageContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSelectSize = (s: typeof SIZES[0]) => {
    setSelectedSize(s)
    
    // Auto-select variant image if a variant matches this size
    const variantIdx = colorVariants.findIndex(v => v.label === s.label || v.label === s.label.replace('\n', ' '))
    if (variantIdx !== -1) {
      setSelectedVariantIdx(variantIdx)
      setActiveImage(colorVariants[variantIdx].imageUrl)
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-secondary py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          {/* Back button */}
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-[#C17D59] transition-colors mb-10"
          >
            <ArrowLeft className="size-4" /> Retourner au catalogue
          </Link>

          {/* Main grid */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ── LEFT: Image Visualiser ─────────────────────────────────── */}
            <div ref={imageContainerRef} className="space-y-4 scroll-mt-24">

              {/* Status badge */}
              <div className="flex items-center gap-3">
                {isCustomized ? (
                  <motion.div
                    key="ia-badge"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-400 text-xs font-bold uppercase tracking-widest"
                  >
                    <Bot className="size-3.5" /> Variante IA — L&apos;atelier peut le créer
                  </motion.div>
                ) : (
                  <motion.div
                    key="real-badge"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-widest"
                  >
                    <CheckCircle2 className="size-3.5" /> Photo réelle — Réalisé par l&apos;Atelier Aschi
                  </motion.div>
                )}
              </div>

              {/* Main image — real photo from admin with Interactive Loupe & Fullscreen Zoom */}
              <div 
                ref={zoomContainerRef}
                onMouseEnter={() => setShowZoomLens(true)}
                onMouseLeave={() => setShowZoomLens(false)}
                onMouseMove={handleZoomMouseMove}
                onClick={() => setIsFullscreenZoom(true)}
                className="relative aspect-[4/5] bg-[#2C1E16]/5 border border-[#E8DCCB] overflow-hidden rounded-2xl shadow-xl cursor-crosshair group select-none flex items-center justify-center"
              >
                {/* Ambient Blurred Luxury Backdrop (Eliminates white empty bars seamlessly) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125"
                  style={{ backgroundImage: `url(${activeImage || '/placeholder.png'})` }}
                />

                {/* 100% COMPLETE PHOTO (Fully visible from top to bottom) */}
                <motion.img
                  key={activeImage}
                  src={activeImage || '/placeholder.png'}
                  alt={product.name}
                  className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />

                {/* --- Interactive Loupe Lens (4x Ultra HD) --- */}
                {showZoomLens && activeImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      top: lensPos.y - 96,
                      left: lensPos.x - 96,
                      backgroundImage: `url(${activeImage})`,
                      backgroundPosition: `${imgPercent.x}% ${imgPercent.y}%`,
                      backgroundSize: '420%',
                    }}
                    className="pointer-events-none absolute size-48 rounded-full border-2 border-amber-400 shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-30 bg-no-repeat overflow-hidden ring-4 ring-black/40"
                  />
                )}

                {/* --- Shimmering Zoom Hint Badge --- */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/85 backdrop-blur-md border border-[#E8DCCB]/30 text-white shadow-xl opacity-90 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
                  <span className="text-[11px] font-medium tracking-wide text-amber-100">
                    Survolez pour la loupe HD • Cliquez pour agrandir
                  </span>
                  <Maximize2 className="size-3.5 text-amber-200 ml-1" />
                </div>

                {/* Pro Image Navigation Arrows */}
                {viewsForSelectedVariant.length > 1 && (
                  <div 
                    onMouseEnter={() => setShowZoomLens(false)}
                    onMouseLeave={() => setShowZoomLens(true)}
                    className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-40"
                  >
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const currentIdx = viewsForSelectedVariant.findIndex(v => v.imageUrl === activeImage)
                        const prevIdx = currentIdx <= 0 ? viewsForSelectedVariant.length - 1 : currentIdx - 1
                        setActiveImage(viewsForSelectedVariant[prevIdx].imageUrl)
                      }}
                      onMouseEnter={() => setShowZoomLens(false)}
                      className="p-3.5 bg-[#3A2A21]/90 hover:bg-[#C17D59] text-white rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-2xl border-2 border-white/40 hover:scale-115 active:scale-95 group/arrow cursor-pointer"
                      title="Vue précédente"
                    >
                      <ChevronLeft className="size-5 transition-transform group-hover/arrow:-translate-x-0.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const currentIdx = viewsForSelectedVariant.findIndex(v => v.imageUrl === activeImage)
                        const nextIdx = currentIdx >= viewsForSelectedVariant.length - 1 ? 0 : currentIdx + 1
                        setActiveImage(viewsForSelectedVariant[nextIdx].imageUrl)
                      }}
                      onMouseEnter={() => setShowZoomLens(false)}
                      className="p-3.5 bg-[#3A2A21]/90 hover:bg-[#C17D59] text-white rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-2xl border-2 border-white/40 hover:scale-115 active:scale-95 group/arrow cursor-pointer"
                      title="Vue suivante"
                    >
                      <ChevronRight className="size-5 transition-transform group-hover/arrow:translate-x-0.5" />
                    </button>
                  </div>
                )}

                {/* IA watermark overlay when a variant is selected */}
                <AnimatePresence>
                  {isCustomized && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-violet-400/30"
                    >
                      <Sparkles className="size-3.5 text-violet-400" />
                      <span className="text-[10px] text-violet-300 font-semibold uppercase tracking-wider">Variante IA</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {product.type === 'PIECE_UNIQUE' && (
                  <span className="absolute left-4 top-4 z-20 rounded-full bg-[#E8DCCB] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-walnut shadow-md">
                    Pièce unique
                  </span>
                )}
              </div>

              {/* Thumbnail strip — shows all views of the selected variant without native scrollbars */}
              {viewsForSelectedVariant.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {viewsForSelectedVariant.map((view, i) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveImage(view.imageUrl)}
                      className={`relative size-20 border rounded-xl overflow-hidden shrink-0 transition-all ${
                        activeImage === view.imageUrl ? 'border-[#C17D59] ring-2 ring-[#C17D59]/40 opacity-100 scale-105 shadow-md' : 'border-border opacity-60 hover:opacity-100'
                      }`}
                      title={`${selectedVariant.label} - Vue ${i + 1}`}
                    >
                      <img src={view.imageUrl} alt={`${selectedVariant.label} vue ${i + 1}`} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* IA disclaimer under image */}
              {isCustomized && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-violet-400/70 text-center leading-relaxed"
                >
                  Photo de la variante <strong className="text-violet-300">{selectedVariant.label}</strong> — préparée par l&apos;atelier pour vous inspirer. <br />
                  L&apos;atelier Aschi peut réaliser ce produit dans cette finition sur commande.
                </motion.p>
              )}
            </div>

            {/* ── RIGHT: Info + Configurator ────────────────────────────── */}
            <div className="flex flex-col text-left gap-6">

              {/* Product header */}
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-semibold">
                  {product.category?.name}
                </span>
                <h1 className="mt-2 font-heading text-4xl font-light text-foreground sm:text-5xl leading-tight">
                  {product.name}
                </h1>
                <div className="mt-4 flex items-center gap-4 border-y border-border py-4">
                  <p className="font-mono text-xl text-[#C17D59] font-medium">
                    {product.type !== 'CATALOGUE'
                      ? (product.price ? `${product.price.toLocaleString('fr-FR')} DT` : 'Prix sur demande')
                      : 'Prix sur devis'}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    product.availability === 'Disponible' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                    product.availability === 'Sur commande' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                    'bg-red-500/10 text-red-500 border border-red-500/10'
                  }`}>
                    {product.availability}
                  </span>
                </div>
                <p className="mt-4 font-light leading-relaxed text-muted-foreground text-pretty">
                  {product.description || "Aucune description détaillée n'a été spécifiée pour cette création."}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="size-5 text-[#C17D59] shrink-0" />
                  <p className="font-light text-muted-foreground">
                    <strong className="font-semibold text-foreground">Dimensions originales :</strong> {product.dimensions || 'Sur-mesure'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hammer className="size-5 text-[#C17D59] shrink-0" />
                  <p className="font-light text-muted-foreground">
                    <strong className="font-semibold text-foreground">Matériaux :</strong> {product.materials || 'Bois noble'}
                  </p>
                </div>
              </div>

              {/* ═══ CONFIGURATOR ═══ */}
              <div className="rounded-2xl border border-[#E8DCCB]/20 bg-[#FAF7F2]/5 p-5 space-y-6">
                <div className="flex items-center gap-2">
                  <Palette className="size-5 text-[#C17D59]" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#C17D59]">
                    Configurateur — Personnalisez ce modèle
                  </h2>
                </div>

                {/* ── COLOUR & DIMENSION SWATCHES from admin-uploaded variants ── */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    {isAIDimensionCategory ? "1. Variantes en images (Couleur ou Dimension)" : "1. Finition / Couleur du bois"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectVariant(i)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 group transition-all',
                        )}
                      >
                        {/* Thumbnail swatch */}
                        <div className={cn(
                          'w-14 h-14 rounded-xl border-2 overflow-hidden transition-all duration-200 shadow-md',
                          selectedVariantIdx === i
                            ? v.isOriginal
                              ? 'scale-110 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1a1208] border-emerald-400'
                              : 'scale-110 ring-2 ring-violet-400 ring-offset-2 ring-offset-[#1a1208] border-violet-400'
                            : 'border-border opacity-70 hover:opacity-100 hover:scale-105'
                        )}>
                          <img src={v.imageUrl} alt={v.label} className="size-full object-cover" />
                        </div>
                        <span className={cn(
                          'text-[9px] uppercase tracking-wider font-semibold leading-tight text-center max-w-[56px]',
                          selectedVariantIdx === i
                            ? v.isOriginal ? 'text-emerald-400' : 'text-violet-400'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}>
                          {v.isOriginal ? '✓ Original' : v.label}
                        </span>
                      </button>
                    ))}
                  </div>

                    {colorVariants.length <= 1 && (
                      <p className="text-xs text-muted-foreground/50 mt-2 italic">
                        Aucune variante en image disponible pour ce produit.
                      </p>
                    )}
                </div>

                {/* Dimensions */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    2. Dimensions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSize(s)}
                        className={cn(
                          'flex flex-col items-center px-4 py-2 rounded-xl border text-xs transition-all duration-200',
                          selectedSize.id === s.id
                            ? 'border-[#C17D59] bg-[#C17D59]/10 text-[#C17D59] shadow-sm'
                            : 'border-border text-muted-foreground hover:border-[#E8DCCB]/50 hover:text-foreground'
                        )}
                      >
                        <span className="font-bold whitespace-pre-line text-center leading-tight">{s.label}</span>
                        {s.sub && <span className="text-[9px] opacity-70 mt-0.5">{s.sub}</span>}
                      </button>
                    ))}
                  </div>

                  {/* Custom dimension inputs */}
                  <AnimatePresence>
                    {selectedSize.id === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 grid grid-cols-2 gap-3 overflow-hidden"
                      >
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Largeur (cm)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 180"
                            value={customWidth}
                            onChange={e => setCustomWidth(e.target.value)}
                            className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-2.5 text-sm text-foreground outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Hauteur (cm)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 90"
                            value={customHeight}
                            onChange={e => setCustomHeight(e.target.value)}
                            className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-2.5 text-sm text-foreground outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Live config recap */}
                <AnimatePresence>
                  {isCustomized && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="rounded-xl bg-violet-500/10 border border-violet-400/20 p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <SquareStack className="size-4 text-violet-400" />
                        <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Votre Configuration</p>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modèle :</span>
                          <span className="text-foreground font-semibold">{product.name}</span>
                        </div>
                        {!selectedVariant.isOriginal && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Finition :</span>
                            <span className="flex items-center gap-2 font-semibold text-violet-300">
                              <div className="size-3.5 rounded-xl overflow-hidden border border-white/20">
                                <img src={selectedVariant.imageUrl} alt="" className="size-full object-cover" />
                              </div>
                              {selectedVariant.label}
                            </span>
                          </div>
                        )}
                        {selectedSize.id !== 'original' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions :</span>
                            <span className="font-semibold text-violet-300">
                              {selectedSize.id === 'custom'
                                ? `${customWidth || '?'} × ${customHeight || '?'} cm`
                                : `${selectedSize.label} (${selectedSize.sub})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ ACTION BUTTONS ═══ */}
              <div className="flex flex-col gap-3 pt-1">
                {product.type !== 'CATALOGUE' && (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 py-4 text-xs font-bold uppercase tracking-[0.16em] text-walnut transition-all shadow"
                  >
                    <ShoppingCart className="size-4" /> Ajouter au panier
                  </button>
                )}

                <button
                  onClick={openConfigQuote}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-wider transition-all shadow",
                    isCustomized
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : "bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 text-walnut"
                  )}
                >
                  {isCustomized ? (
                    <><Sparkles className="size-4" /> Demander cette configuration</>
                  ) : (
                    <><MessageCircle className="size-4" /> Demander un devis</>
                  )}
                </button>

                {isCustomized && (
                  <button
                    onClick={() => { setSelectedVariantIdx(0); setSelectedSize(SIZES[0]); setActiveImage(product.images[0]?.imageUrl || '') }}
                    className="text-xs text-muted-foreground hover:text-[#C17D59] transition-colors text-center underline underline-offset-4"
                  >
                    Réinitialiser la configuration
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="mt-24 border-t border-border pt-16 text-left">
              <h3 className="font-heading text-3xl font-light text-foreground mb-8">Créations similaires</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {similarProducts.map((p) => (
                  <Link key={p.id} href={`/produits/${p.id}`} className="group block space-y-3">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900 border border-border">
                      <img
                        src={p.images[0]?.imageUrl || '/placeholder.png'}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-heading text-lg font-medium text-foreground group-hover:text-[#C17D59] transition-colors">{p.name}</h4>
                      <span className="text-xs uppercase tracking-wider text-[#C17D59]">{p.category?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ═══ QUOTE MODAL (pre-filled) ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-background border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <header className="p-6 border-b border-border flex items-center justify-between">
              <div className="text-left">
                <h2 className="font-heading text-xl font-medium text-foreground">
                  {isCustomized ? 'Demander cette configuration' : 'Demander un devis'}
                </h2>
                <p className="text-xs text-[#C17D59] font-medium mt-0.5">Pour : {product.name}</p>
                {isCustomized && configSummary && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {configSummary.split(' | ').map((part, i) => (
                      <span key={i} className="inline-block bg-violet-500/15 border border-violet-400/25 text-violet-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        {part}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>

            {quoteSent ? (
              <div className="p-10 text-center space-y-4">
                <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Check className="size-8" />
                </div>
                <h3 className="font-heading text-2xl text-foreground">Demande envoyée !</h3>
                <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
                  Votre demande pour « {product.name} » {isCustomized ? 'avec vos personnalisations' : ''} a été transmise. Ismail vous contactera sous 24-48h.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-4 rounded-full bg-[#FAF7F2] text-[#3A2A21] hover:bg-bronze px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
                {quoteError && (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm flex gap-2">
                    <AlertCircle className="size-5 shrink-0" /><p>{quoteError}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom complet</label>
                  <input type="text" required placeholder="Ex: Sonia Ben Miled" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
                    <input type="email" required placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Téléphone</label>
                    <input type="tel" required placeholder="+216 22 222 222" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Message</label>
                  <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none resize-none" />
                </div>

                <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all">
                    Annuler
                  </button>
                  <button type="submit" disabled={submittingQuote}
                    className="rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all disabled:opacity-50 flex items-center gap-2">
                    <Send className="size-3.5" />
                    {submittingQuote ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </footer>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* --- Fullscreen Lightbox HD Zoom Modal with Controls & Pan --- */}
      <AnimatePresence>
        {isFullscreenZoom && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="absolute top-6 inset-x-6 flex items-center justify-between z-50 pointer-events-none">
              <div className="inline-flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-[#E8DCCB]/30 text-amber-100 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider shadow-2xl pointer-events-auto">
                <Sparkles className="size-4 text-amber-300 animate-pulse" />
                <span>Inspection Ultra-HD • {product?.name || 'Détails Artisanats'}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setModalZoomScale(s => Math.min(4, s + 0.5))}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl"
                  title="Zoomer +"
                >
                  <ZoomIn className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalZoomScale(s => Math.max(1, s - 0.5))}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl"
                  title="Dézoomer -"
                >
                  <ZoomOut className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalZoomScale(1)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl"
                  title="Taille réelle (1x)"
                >
                  <RotateCcw className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFullscreenZoom(false)
                    setModalZoomScale(1)
                  }}
                  className="p-3 rounded-full bg-white/15 hover:bg-red-500/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl ml-2"
                  title="Fermer"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            {/* Draggable/Pannable Image Canvas */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <motion.img
                drag={modalZoomScale > 1}
                dragConstraints={{ left: -600, right: 600, top: -400, bottom: 400 }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: modalZoomScale, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={activeImage}
                alt={product?.name || 'Zoom Produit HD'}
                className={`max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/15 ${
                  modalZoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                }`}
                onClick={() => {
                  if (modalZoomScale === 1) setModalZoomScale(2)
                  else if (modalZoomScale === 2) setModalZoomScale(3.5)
                  else setModalZoomScale(1)
                }}
              />
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-6 inset-x-6 flex justify-center z-50 pointer-events-none">
              <div className="inline-flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-xs font-medium tracking-wider shadow-2xl">
                <Move className="size-3.5 text-amber-300" />
                <span>
                  {modalZoomScale > 1
                    ? 'Glissez la souris pour vous déplacer dans les détails'
                    : 'Cliquez sur l\'image ou utilisez les boutons en haut pour zoomer jusqu\'à 4x'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}
