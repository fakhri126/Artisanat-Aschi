'use client'

import { useEffect, useState, use, useMemo, useRef } from 'react'
import Link from 'next/link';
import { publicApi, Product } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ArrowLeft, Ruler, Hammer, Sparkles, MessageCircle, AlertCircle, X, ShoppingCart, Bot, Palette, SquareStack, Send, CheckCircle2, Check, ZoomIn, ZoomOut, RotateCcw, Move, Maximize2, ChevronLeft, ChevronRight, User, Mail, Phone, ShieldCheck, Clock, Truck } from 'lucide-react'
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

  // ── Workshop Atelier Finishes Palette ───────────────────────────────────────
  const ATELIER_PALETTE = [
    { id: 'Original', label: 'Original Atelier', hex: null, desc: 'Finition de la pièce photographiée' },
    { id: 'Blanc', label: 'Blanc Pur / Cérusé', hex: '#FFFFFF', desc: 'Patine blanche lumineuse et raffinée' },
    { id: 'Bleu', label: 'Bleu Majorelle / Canard', hex: '#2D5F8A', desc: 'Teinte méditerranéenne profonde et royale' },
    { id: 'Noyer', label: 'Noyer Foncé Noble', hex: '#5C3317', desc: 'Finition bois précieux chaleureuse' },
    { id: 'Vert Olivier', label: 'Vert Olivier d\'Atelier', hex: '#4A5E3A', desc: 'Tons naturels et apaisants de l\'artisanat' },
    { id: 'Noir', label: 'Noir Ébène Ciselé', hex: '#1A1A1A', desc: 'Laque satinée contemporaine et sobre' },
    { id: 'Or', label: 'Doré Antique / Patine Or', hex: '#C9A84C', desc: 'Feuille d\'or ou ciselure patinée' },
    { id: 'Naturel', label: 'Chêne / Bois Naturel', hex: '#C4A882', desc: 'Aspect bois brut huilé et protégé' },
    { id: 'Bordeaux', label: 'Bordeaux Royal', hex: '#7B2D3E', desc: 'Teinte feutrée noble' },
  ]

  // ── Interactive Loupe State (Pure Magnifier, No Annoying Click Modal) ──────
  const [showZoomLens, setShowZoomLens] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [imgPercent, setImgPercent] = useState({ x: 50, y: 50 })
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  const handleZoomInteraction = (clientX: number, clientY: number) => {
    if (!zoomContainerRef.current) return
    const rect = zoomContainerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const px = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const py = Math.max(0, Math.min(100, (y / rect.height) * 100))
    setLensPos({ x, y })
    setImgPercent({ x: px, y: py })
  }

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleZoomInteraction(e.clientX, e.clientY)
  }

  const handleZoomTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      handleZoomInteraction(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  // Dynamically generate size options based on product category
  const SIZES = [
    { id: 'original', label: 'Dimensions\noriginales', sub: 'Standard atelier' },
    { id: 'small',    label: 'Petit',                  sub: '< 80 cm' },
    { id: 'medium',   label: 'Moyen',                  sub: '80 – 150 cm' },
    { id: 'large',    label: 'Grand',                  sub: '> 150 cm' },
    { id: 'custom',   label: 'Sur mesure',             sub: 'Au cm près' },
  ]

  // ── Configurator state ─────────────────────────────────────────────────────
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedCustomColor, setSelectedCustomColor] = useState<string>('Original')
  const [selectedSize, setSelectedSize] = useState({ id: 'original', label: 'Dimensions\noriginales', sub: 'Standard atelier' })
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

  // ── Build UNIQUE colorVariants strictly from product images configured in admin ─────────
  const colorVariants = useMemo(() => {
    if (!product) return []
    const variantsMap = new Map()
    
    const mainImg = product.images && product.images.length > 0 ? product.images[0].imageUrl : '/placeholder.png'
    
    // 1. Original real photo
    variantsMap.set('Original', {
      label: 'Original',
      imageUrl: mainImg,
      isOriginal: true,
    })

    // 2. Real product image variants uploaded from admin
    if (product.images && product.images.length > 1) {
      product.images.forEach(img => {
        const label = img.colorLabel || 'Variante'
        if (!variantsMap.has(label)) {
          variantsMap.set(label, {
            label,
            imageUrl: img.imageUrl,
            isOriginal: label === 'Original',
          })
        }
      })
    }
    
    return Array.from(variantsMap.values())
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
    if (selectedCustomColor && selectedCustomColor !== 'Original') {
      parts.push(`Finition / Teinte personnalisée : ${selectedCustomColor} (Fabrication sur-mesure en atelier)`)
    } else {
      const selectedVariant = colorVariants[selectedVariantIdx]
      if (selectedVariant && !selectedVariant.isOriginal) {
        parts.push(`Finition souhaitée : ${selectedVariant.label}`)
      }
    }
    if (selectedSize.id !== 'original') {
      if (selectedSize.id === 'custom') {
        parts.push(`Dimensions sur mesure : ${customWidth || '?'} cm (L) × ${customHeight || '?'} cm (H)`)
      } else {
        parts.push(`Taille souhaitée : ${selectedSize.label} (${selectedSize.sub})`)
      }
    }
    return parts.join(' | ')
  }

  const openConfigQuote = () => {
    const summary = buildConfigSummary()
    const colorText = selectedCustomColor !== 'Original' ? selectedCustomColor : (product?.color || 'Atelier Standard')
    const sizeText = selectedSize.id === 'custom' 
      ? `Sur-mesure (${customWidth || '?'} cm × ${customHeight || '?'} cm)` 
      : `${selectedSize.label.replace('\n', ' ')} (${selectedSize.sub})`

    setMessage(
      summary
        ? `Bonjour Atelier Aschi,\n\nJe souhaite commander le modèle « ${product?.name} » avec ma configuration personnalisée d'atelier :\n• Finition & Patine : ${colorText}\n• Format & Dimensions : ${sizeText}\n\nPourriez-vous me transmettre une estimation de devis ainsi que le délai de confection ? Merci !`
        : `Bonjour Atelier Aschi,\n\nJe souhaiterais obtenir un devis personnalisé pour le modèle « ${product?.name} ».\nMerci de me recontacter !`
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
  const isCustomized = selectedCustomColor !== 'Original' || (selectedVariant ? !selectedVariant.isOriginal : false) || selectedSize.id !== 'original'
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

              {/* Main image — real photo from admin with Pure High Precision Interactive Loupe (No click modal) */}
              <div 
                ref={zoomContainerRef}
                onMouseEnter={() => setShowZoomLens(true)}
                onMouseLeave={() => setShowZoomLens(false)}
                onMouseMove={handleZoomMouseMove}
                onTouchStart={(e) => {
                  setShowZoomLens(true)
                  if (e.touches && e.touches[0]) handleZoomInteraction(e.touches[0].clientX, e.touches[0].clientY)
                }}
                onTouchMove={handleZoomTouchMove}
                onTouchEnd={() => setShowZoomLens(false)}
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

                {/* --- Pure Loupe Hint Badge --- */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-stone-950/85 backdrop-blur-md border border-[#E8DCCB]/30 text-white shadow-xl opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
                  <span className="text-[11px] font-medium tracking-wide text-amber-100">
                    Loupe Artisanale HD • Survolez ou touchez pour examiner les détails
                  </span>
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
                <span className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">
                  {product.category?.name}
                </span>
                <h1 className="mt-2 font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight">
                  {product.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-border py-4">
                  <p className="font-mono text-xl sm:text-2xl text-[#C17D59] font-bold">
                    {product.type !== 'CATALOGUE'
                      ? (product.price ? `${product.price.toLocaleString('fr-FR')} DT` : 'Prix sur demande')
                      : 'Prix sur devis personnalisé'}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    product.availability === 'Disponible' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                    product.availability === 'Sur commande' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                    'bg-red-500/10 text-red-500 border border-red-500/10'
                  }`}>
                    {product.availability}
                  </span>
                </div>
                <p className="mt-4 font-normal leading-relaxed text-[#4A3728] text-sm sm:text-base text-pretty">
                  {product.description || "Cette pièce artisanale d'exception est fabriquée à la main dans notre atelier à partir de matériaux nobles. Chaque détail de sculpture et d'assemblage est façonné avec passion."}
                </p>
              </div>

              {/* ═══ PRO BESPOKE ATELIER BANNER (CLEAR CUSTOM COLOR REALIZATION) ═══ */}
              <div className="rounded-3xl bg-gradient-to-br from-[#241812] via-[#3B271C] to-[#241812] border-2 border-[#E6A635]/60 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#E6A635] via-[#F2BD52] to-[#C78318] flex items-center justify-center text-[#1A110B] shrink-0 shadow-lg">
                    <Palette className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6A635]/25 border border-[#E6A635]/50 text-[#F2BD52] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-2">
                      <Sparkles className="size-3.5" /> Confection Sur-Mesure en Atelier
                    </div>
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-[#FAF7F2] leading-snug">
                      Vous aimez ce modèle ? Choisissez la couleur de vos rêves !
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#EAE4D9]/90 font-light leading-relaxed">
                      Même si ce meuble est présenté ici en <strong className="text-[#FAF7F2] font-semibold">{product.color || 'cette teinte'}</strong>, nos maîtres artisans peuvent le réaliser et le patiner pour vous en <span className="text-[#F2BD52] font-semibold">Bleu Majorelle, Noyer noble, Vert Olivier, Noir profond, Patine Or</span> ou selon vos dimensions exactes, <strong>même si la photo n&apos;existe pas encore au catalogue !</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* ═══ PRO TECHNICAL SPECIFICATIONS & CRAFTSMANSHIP GRID ═══ */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#D8C7B4] pb-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#A26235] font-extrabold flex items-center gap-2">
                    <Hammer className="size-4" /> Caractéristiques &amp; Savoir-Faire d&apos;Atelier
                  </span>
                  <span className="text-[10px] text-[#2C1E16] bg-[#E8DCCB] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-extrabold border border-[#D8C7B4]">100% Fait Main</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Dimensions */}
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#D8C7B4] flex items-start gap-3 shadow-xs">
                    <Ruler className="size-4.5 text-[#A26235] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10.5px] uppercase font-extrabold text-[#A26235] tracking-wider">Dimensions de base</p>
                      <p className="text-xs sm:text-sm font-bold text-[#2C1E16] mt-0.5">{product.dimensions || 'Sur mesure'}</p>
                      <p className="text-[11px] font-semibold text-[#5C4535] mt-0.5">Adaptable au centimètre près selon votre espace</p>
                    </div>
                  </div>

                  {/* 2. Matériaux */}
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#D8C7B4] flex items-start gap-3 shadow-xs">
                    <Hammer className="size-4.5 text-[#A26235] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10.5px] uppercase font-extrabold text-[#A26235] tracking-wider">Matériaux Nobles</p>
                      <p className="text-xs sm:text-sm font-bold text-[#2C1E16] mt-0.5">{product.materials || 'Bois noble massif'}</p>
                      <p className="text-[11px] font-semibold text-[#5C4535] mt-0.5">Sélectionné &amp; stabilisé pour durer des décennies</p>
                    </div>
                  </div>

                  {/* 3. Teinte & Finition */}
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#D8C7B4] flex items-start gap-3 shadow-xs">
                    <Palette className="size-4.5 text-[#A26235] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10.5px] uppercase font-extrabold text-[#A26235] tracking-wider">Finition &amp; Patine</p>
                      <p className="text-xs sm:text-sm font-bold text-[#2C1E16] mt-0.5">
                        {selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Au choix de l\'atelier')}
                      </p>
                      <p className="text-[11px] font-semibold text-[#5C4535] mt-0.5">Vernis satiné/mat haute protection hydrofuge</p>
                    </div>
                  </div>

                  {/* 4. Délais & Livraison */}
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#D8C7B4] flex items-start gap-3 shadow-xs">
                    <Sparkles className="size-4.5 text-[#A26235] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10.5px] uppercase font-extrabold text-[#A26235] tracking-wider">Délai &amp; Expédition</p>
                      <p className="text-xs sm:text-sm font-bold text-[#2C1E16] mt-0.5">2 à 3 semaines de confection</p>
                      <p className="text-[11px] font-semibold text-[#5C4535] mt-0.5">Livraison sécurisée partout en Tunisie</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ CONFIGURATOR: INTERACTIVE ATELIER PALETTE & DIMENSIONS ═══ */}
              <div className="rounded-3xl border-2 border-[#D8C7B4] bg-[#FAF8F5] p-5 sm:p-7 space-y-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Palette className="size-5 text-[#A26235]" />
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#2C1E16]">
                      Configurateur &amp; Nuancier de l&apos;Atelier
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-[#F2BD52] bg-[#241812] px-3.5 py-1 rounded-full border border-[#E6A635]/50 shadow-xs">
                    Toutes teintes possibles
                  </span>
                </div>

                {/* ── 1. NUANCIER DES COULEURS D'ATELIER (TOUJOURS DISPONIBLE) ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold">
                      1. Finition / Couleur souhaitée pour ce meuble :
                    </p>
                    <span className="text-xs font-extrabold text-[#2C1E16] bg-[#E8DCCB] px-3 py-1 rounded-lg border border-[#D8C7B4]">
                      {selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Original')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ATELIER_PALETTE.map((c) => {
                      const isSelected = selectedCustomColor === c.id || (selectedCustomColor === 'Original' && c.id === 'Original')
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomColor(c.id)
                            if (c.id === 'Original') {
                              setSelectedVariantIdx(0)
                              setActiveImage(product.images?.[0]?.imageUrl || '/placeholder.png')
                            } else {
                              const matchingVariantIdx = colorVariants.findIndex(v => 
                                v.label.toLowerCase().includes(c.id.toLowerCase()) || 
                                c.id.toLowerCase().includes(v.label.toLowerCase())
                              )
                              if (matchingVariantIdx !== -1) {
                                setSelectedVariantIdx(matchingVariantIdx)
                                setActiveImage(colorVariants[matchingVariantIdx].imageUrl)
                              } else {
                                setActiveImage(product.images?.[0]?.imageUrl || '/placeholder.png')
                              }
                            }
                          }}
                          className={cn(
                            'flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer shadow-xs active:scale-95',
                            isSelected
                              ? 'border-[#E6A635] bg-[#241812] text-[#FAF7F2] ring-2 ring-[#E6A635]/60 shadow-md'
                              : 'border-[#D8C7B4] bg-white hover:bg-[#FAF7F2] hover:border-[#A26235] text-[#2C1E16]'
                          )}
                        >
                          <div
                            className={cn(
                              'size-5 rounded-full border-2 shrink-0 transition-transform shadow-xs',
                              isSelected ? 'scale-110 border-white ring-2 ring-[#E6A635]' : (c.hex === '#FFFFFF' ? 'border-stone-400 bg-white' : 'border-stone-300')
                            )}
                            style={c.hex ? { backgroundColor: c.hex } : { background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              'text-xs font-extrabold truncate leading-tight',
                              isSelected ? 'text-[#F2BD52]' : 'text-[#2C1E16]'
                            )}>
                              {c.label}
                            </p>
                            <p className={cn(
                              'text-[10.5px] truncate mt-0.5',
                              isSelected ? 'text-[#FAF7F2] font-medium' : 'text-[#5C4535] font-semibold'
                            )}>
                              {c.desc}
                            </p>
                          </div>
                          {isSelected && <Check className="size-4 text-[#F2BD52] shrink-0" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Dynamic Reassurance Alert for Custom Colors */}
                  {selectedCustomColor !== 'Original' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3.5 p-4 rounded-2xl bg-[#241812] border-2 border-[#E6A635]/50 text-xs text-[#FAF7F2] flex items-start gap-3 shadow-md"
                    >
                      <Sparkles className="size-4.5 text-[#F2BD52] shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-[#FAF7F2]">
                        <strong className="text-[#F2BD52] font-bold">Fabrication personnalisée :</strong> Ce meuble sera confectionné pour vous dans la finition <strong className="text-[#F2BD52] font-bold">&laquo; {selectedCustomColor} &raquo;</strong> par nos ébénistes. Même si la photo actuelle présente une autre teinte, nous appliquerons votre patine sur-mesure !
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* ── 2. DIMENSIONS ── */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold mb-3">
                    2. Dimensions souhaitées :
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {SIZES.map((s) => {
                      const isSizeSelected = selectedSize.id === s.id
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSize(s)}
                          className={cn(
                            'flex flex-col items-center px-4 py-2.5 rounded-xl border-2 text-xs transition-all duration-200 cursor-pointer shadow-xs',
                            isSizeSelected
                              ? 'border-[#E6A635] bg-[#241812] text-[#F2BD52] ring-2 ring-[#E6A635]/60 shadow-md font-bold'
                              : 'border-[#D8C7B4] bg-white hover:bg-[#FAF7F2] hover:border-[#A26235] text-[#2C1E16]'
                          )}
                        >
                          <span className={cn(
                            'font-extrabold whitespace-pre-line text-center leading-tight',
                            isSizeSelected ? 'text-[#F2BD52]' : 'text-[#2C1E16]'
                          )}>
                            {s.label}
                          </span>
                          {s.sub && (
                            <span className={cn(
                              'text-[10px] mt-0.5',
                              isSizeSelected ? 'text-[#FAF7F2] font-medium' : 'text-[#5C4535] font-semibold'
                            )}>
                              {s.sub}
                            </span>
                          )}
                        </button>
                      )
                    })}
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
                          <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-bold mb-1.5 block">Largeur (cm)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 180"
                            value={customWidth}
                            onChange={e => setCustomWidth(e.target.value)}
                            className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] rounded-xl p-2.5 text-sm font-bold text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-bold mb-1.5 block">Hauteur (cm)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 90"
                            value={customHeight}
                            onChange={e => setCustomHeight(e.target.value)}
                            className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] rounded-xl p-2.5 text-sm font-bold text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Live config recap */}
                <AnimatePresence>
                  {(selectedCustomColor !== 'Original' || selectedSize.id !== 'original') && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="rounded-2xl bg-[#241812] border-2 border-[#E6A635]/50 p-4 space-y-2.5 text-[#FAF7F2] shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <SquareStack className="size-4.5 text-[#F2BD52]" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[#F2BD52]">Votre Configuration Sur-Mesure</p>
                      </div>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#D8C7B4] font-medium">Modèle :</span>
                          <span className="text-white font-bold">{product.name}</span>
                        </div>
                        {selectedCustomColor !== 'Original' && (
                          <div className="flex justify-between items-center">
                            <span className="text-[#D8C7B4] font-medium">Finition choisie :</span>
                            <span className="font-bold text-[#F2BD52] flex items-center gap-1.5">
                              <span className="size-2.5 rounded-full inline-block bg-[#F2BD52]" />
                              {selectedCustomColor}
                            </span>
                          </div>
                        )}
                        {selectedSize.id !== 'original' && (
                          <div className="flex justify-between">
                            <span className="text-[#D8C7B4] font-medium">Dimensions :</span>
                            <span className="font-bold text-[#F2BD52]">
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
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 py-4 text-xs font-bold uppercase tracking-[0.16em] text-walnut transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="size-4" /> Ajouter au panier
                  </button>
                )}

                <button
                  onClick={openConfigQuote}
                  className="btn-sheen w-full flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-wider transition-all shadow-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] cursor-pointer hover:scale-[1.01] active:scale-98"
                >
                  <MessageCircle className="size-4 text-[#1A110B]" />
                  {selectedCustomColor !== 'Original'
                    ? `Demander ce modèle en ${selectedCustomColor} (Devis Gratuit)`
                    : `Demander un Devis Sur-Mesure 3D`}
                </button>

                <a
                  href={`https://wa.me/21698338166?text=${encodeURIComponent(`Bonjour Atelier Aschi, je souhaite des informations pour commander le modèle « ${product.name} » en finition ${selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Standard')}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/15 hover:bg-[#25D366]/25 py-3.5 text-xs font-bold uppercase tracking-wider text-[#25D366] transition-all cursor-pointer"
                >
                  <MessageCircle className="size-4" /> Discuter directement sur WhatsApp
                </a>

                {(selectedCustomColor !== 'Original' || selectedSize.id !== 'original') && (
                  <button
                    onClick={() => { 
                      setSelectedCustomColor('Original')
                      setSelectedVariantIdx(0)
                      setSelectedSize(SIZES[0])
                      setActiveImage(product.images?.[0]?.imageUrl || '') 
                    }}
                    className="text-xs text-muted-foreground hover:text-[#C17D59] transition-colors text-center underline underline-offset-4 cursor-pointer mt-1"
                  >
                    Réinitialiser la personnalisation
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

      {/* ═══ QUOTE MODAL (pre-filled, chic & luxury atelier design) ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#FDFBF7] border-2 border-[#D8C7B4] w-full max-w-xl rounded-[28px] overflow-hidden shadow-[0_30px_70px_-15px_rgba(26,17,11,0.4)] flex flex-col max-h-[92vh] text-[#2C1E16] my-auto"
          >
            {/* Modal Header */}
            <header className="px-6 py-5 border-b-2 border-[#E8DCCB] bg-gradient-to-b from-white via-white to-[#FAF7F2]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#8F562B] text-[10.5px] font-extrabold uppercase tracking-widest mb-1.5 shadow-xs">
                    <Sparkles className="size-3.5 text-[#C17D59]" /> Atelier Sur-Mesure • Pièce d&apos;Art
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#2C1E16] tracking-tight">
                    {isCustomized ? 'Votre Devis Personnalisé' : 'Demande de Devis d\'Atelier'}
                  </h2>
                  <p className="text-xs text-[#7A6250] font-medium mt-0.5">
                    Confection artisanale sur-mesure par les maîtres ébénistes d&apos;Atelier Aschi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="size-9 rounded-full bg-stone-100 hover:bg-[#241812] text-[#5C4535] hover:text-[#F2BD52] flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 mt-1"
                  title="Fermer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Product Showcase Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-white border-2 border-[#E8DCCB] flex items-center gap-3.5 shadow-xs">
                <div className="size-14 sm:size-16 rounded-xl overflow-hidden border border-[#D8C7B4] shrink-0 bg-stone-100 shadow-inner">
                  <img src={activeImage || product.images?.[0]?.imageUrl || '/placeholder.png'} alt={product.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#A26235] block">
                    {product.category?.name || 'Mobilier d\'Art'}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C1E16] truncate">{product.name}</h3>
                  <p className="text-xs text-[#665040] font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Fait main au centimètre près • Patine exclusive
                  </p>
                </div>
              </div>
            </header>

            {quoteSent ? (
              <div className="p-10 text-center space-y-4 bg-white">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="size-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#2C1E16]">Demande envoyée avec succès !</h3>
                <p className="text-sm font-medium text-[#5C4535] max-w-sm mx-auto leading-relaxed">
                  Votre demande pour « <strong className="text-[#2C1E16]">{product.name}</strong> » a été transmise directement à nos maîtres artisans. Nous vous recontacterons avec votre étude personnalisée sous 24h.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mt-4 rounded-full bg-[#241812] text-[#FAF7F2] hover:bg-[#3A2A1E] px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-left bg-[#FDFBF7]">
                {quoteError && (
                  <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-sm font-bold flex items-center gap-3">
                    <AlertCircle className="size-5 shrink-0 text-red-600" /><p>{quoteError}</p>
                  </div>
                )}

                {/* Chic Configuration Card */}
                <div className="rounded-2xl bg-[#241812] border-2 border-[#E6A635]/60 p-4 text-[#FAF7F2] shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E6A635]/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[#F2BD52]" />
                      <span className="text-xs uppercase font-extrabold tracking-wider text-[#F2BD52]">
                        Configuration demandée pour l&apos;atelier
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#F2BD52] bg-white/10 px-2.5 py-0.5 rounded-full border border-[#E6A635]/40">
                      Sur-mesure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Finition */}
                    <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div
                        className="size-4.5 rounded-full border-2 border-white shrink-0 shadow-xs"
                        style={{ backgroundColor: ATELIER_PALETTE.find(c => c.id === selectedCustomColor)?.hex || '#8B5E3C' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-[#D8C7B4] tracking-wider">Teinte &amp; Patine</p>
                        <p className="font-extrabold text-[#FAF7F2] truncate">
                          {selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Originale d\'Atelier')}
                        </p>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <Ruler className="size-4.5 text-[#F2BD52] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-[#D8C7B4] tracking-wider">Dimensions</p>
                        <p className="font-extrabold text-[#FAF7F2] truncate">
                          {selectedSize.id === 'custom'
                            ? `${customWidth || '?'} × ${customHeight || '?'} cm`
                            : `${selectedSize.label.replace('\n', ' ')} (${selectedSize.sub})`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Info Fields */}
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold flex items-center gap-1.5">
                      <User className="size-3.5 text-[#A26235]" />
                      <span>Votre Nom complet</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sonia Ben Miled"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] focus:ring-4 focus:ring-[#A26235]/15 rounded-xl px-4 py-3.5 text-sm font-bold text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs transition-all"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold flex items-center gap-1.5">
                        <Mail className="size-3.5 text-[#A26235]" />
                        <span>Adresse Email</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] focus:ring-4 focus:ring-[#A26235]/15 rounded-xl px-4 py-3.5 text-sm font-bold text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold flex items-center gap-1.5">
                        <Phone className="size-3.5 text-[#A26235]" />
                        <span>Numéro de Téléphone</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+216 22 222 222"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] focus:ring-4 focus:ring-[#A26235]/15 rounded-xl px-4 py-3.5 text-sm font-bold text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-[#2C1E16] font-extrabold flex items-center gap-1.5">
                        <MessageCircle className="size-3.5 text-[#A26235]" />
                        <span>Message &amp; Précisions pour les Artisans</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[10.5px] text-[#7A6250] font-semibold">Personnalisable</span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full bg-white border-2 border-[#D8C7B4] focus:border-[#A26235] focus:ring-4 focus:ring-[#A26235]/15 rounded-xl p-3.5 text-sm font-medium text-[#2C1E16] placeholder:text-stone-400 outline-none shadow-xs transition-all resize-none leading-relaxed"
                    />
                    <p className="text-[11px] text-[#7A6250] italic">
                      Indiquez toute particularité : essences de bois souhaitées, teintes de votre intérieur, etc.
                    </p>
                  </div>
                </div>

                {/* Reassurance Ribbon */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D8C7B4]">
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#D8C7B4]/70 shadow-xs">
                    <ShieldCheck className="size-4 text-[#C17D59] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-[#2C1E16] uppercase tracking-wider">Devis Gratuit</span>
                    <span className="text-[9.5px] text-[#7A6250]">Sans engagement</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#D8C7B4]/70 shadow-xs">
                    <Clock className="size-4 text-[#C17D59] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-[#2C1E16] uppercase tracking-wider">Réponse 24h</span>
                    <span className="text-[9.5px] text-[#7A6250]">Proposition directe</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#D8C7B4]/70 shadow-xs">
                    <Truck className="size-4 text-[#C17D59] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-[#2C1E16] uppercase tracking-wider">Livraison Pro</span>
                    <span className="text-[9.5px] text-[#7A6250]">Toute la Tunisie</span>
                  </div>
                </div>

                {/* WhatsApp direct alternative */}
                <div className="pt-1 text-center">
                  <a
                    href={`https://wa.me/21698338166?text=${encodeURIComponent(`Bonjour Atelier Aschi, je souhaite commander le modèle « ${product.name} » en finition ${selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Standard')}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E7E34] hover:text-[#155724] underline underline-offset-4 cursor-pointer"
                  >
                    <MessageCircle className="size-3.5" />
                    Ou discutez directement sur WhatsApp avec Ismail Aschi (+216 98 338 166)
                  </a>
                </div>

                <footer className="pt-4 border-t-2 border-[#D8C7B4] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-full sm:w-auto rounded-full border-2 border-[#D8C7B4] bg-white hover:bg-stone-100 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#2C1E16] transition-all cursor-pointer shadow-xs order-2 sm:order-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="btn-sheen w-full sm:w-auto rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] hover:opacity-95 px-8 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#1A110B] shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer order-1 sm:order-2"
                  >
                    <Send className="size-4" />
                    {submittingQuote ? 'Transmission en cours...' : 'Envoyer ma demande de devis'}
                  </button>
                </footer>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* ── STICKY MOBILE BOTTOM BAR (Optimisation Mobile Maximale) ────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-[#241812]/95 backdrop-blur-xl border-t border-[#E6A635]/35 p-3.5 z-40 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="size-11 rounded-xl overflow-hidden bg-black/40 border border-[#E6A635]/40 shrink-0">
            <img src={activeImage || '/placeholder.png'} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#F7F4EE] truncate leading-tight">{product.name}</p>
            <p className="text-[10px] text-[#F2BD52] truncate font-semibold mt-0.5">
              Teinte : {selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Finition Atelier')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://wa.me/21698338166?text=${encodeURIComponent(`Bonjour Atelier Aschi, je souhaite commander le modèle « ${product.name} » en finition ${selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Standard')}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="size-10 rounded-full bg-[#25D366] text-[#1A110B] flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="WhatsApp"
          >
            <MessageCircle className="size-5" />
          </a>
          <button
            type="button"
            onClick={openConfigQuote}
            className="btn-sheen rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="size-3.5" /> Devis
          </button>
        </div>
      </div>

      <Footer />
    </>
  )
}
