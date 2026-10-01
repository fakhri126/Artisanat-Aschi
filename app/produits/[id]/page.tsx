'use client'

import { useEffect, useState, use, useMemo, useRef } from 'react'
import Link from 'next/link';
import { publicApi, Product, colorsApi, ColorSwatch } from '@/lib/api'
import { cn, formatImageUrl } from '@/lib/utils'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ArrowLeft, Ruler, Hammer, Sparkles, MessageCircle, AlertCircle, X, ShoppingCart, Bot, Palette, SquareStack, Layers, SlidersHorizontal, Send, CheckCircle2, Check, ZoomIn, ZoomOut, RotateCcw, Move, Maximize2, ChevronLeft, ChevronRight, User, Mail, Phone, ShieldCheck, Clock, Truck } from 'lucide-react'
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
    { id: 'Blanc', label: 'Blanc Pur', hex: '#FFFFFF', desc: 'Patine blanche lumineuse et raffinée' },
    { id: 'Bleu', label: 'Bleu Majorelle / Canard', hex: '#2D5F8A', desc: 'Teinte méditerranéenne profonde et royale' },
    { id: 'Noyer', label: 'Noyer Foncé Noble', hex: '#5C3317', desc: 'Finition bois précieux chaleureuse' },
    { id: 'Vert Olivier', label: 'Vert Olivier d\'Atelier', hex: '#4A5E3A', desc: 'Tons naturels et apaisants de l\'artisanat' },
    { id: 'Noir', label: 'Noir Ébène Ciselé', hex: '#1A1A1A', desc: 'Laque satinée contemporaine et sobre' },
    { id: 'Or', label: 'Doré Antique / Patine Or', hex: '#C9A84C', desc: 'Feuille d\'or ou ciselure patinée' },
    { id: 'Naturel', label: 'Chêne / Bois Naturel', hex: '#C4A882', desc: 'Aspect bois brut huilé et protégé' },
    { id: 'Bordeaux', label: 'Bordeaux Royal', hex: '#7B2D3E', desc: 'Teinte feutrée noble' },
  ]

  // ── Interactive Loupe State (Desktop Magnifier) ──────
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

  // Mobile natural touch swipe to change photos
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchEndX(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || viewsForSelectedVariant.length <= 1) return
    const distance = touchStartX - touchEndX
    if (distance > 45) {
      // Swiped left -> next photo
      const currentIdx = viewsForSelectedVariant.findIndex(v => v.imageUrl === activeImage)
      const nextIdx = currentIdx >= viewsForSelectedVariant.length - 1 ? 0 : currentIdx + 1
      setActiveImage(viewsForSelectedVariant[nextIdx].imageUrl)
    } else if (distance < -45) {
      // Swiped right -> previous photo
      const currentIdx = viewsForSelectedVariant.findIndex(v => v.imageUrl === activeImage)
      const prevIdx = currentIdx <= 0 ? viewsForSelectedVariant.length - 1 : currentIdx - 1
      setActiveImage(viewsForSelectedVariant[prevIdx].imageUrl)
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  // Dynamically generate size options based on product category
  const SIZES = [
    { id: 'original', label: 'Dimensions\noriginales', sub: 'Standard atelier' },
    { id: 'small',    label: 'Petit',                  sub: '< 80 cm' },
    { id: 'medium',   label: 'Moyen',                  sub: '80 – 150 cm' },
    { id: 'large',    label: 'Grand',                  sub: '> 150 cm' },
    { id: 'custom',   label: 'Sur mesure',             sub: 'Au cm près' },
  ]

  // ── Primary 4 Finishes shown in reference mockup ───────────────────────────
  const PRIMARY_FINISHES = [
    {
      id: 'Original',
      label: 'Original Atelier',
      desc: 'Finition de la pièce artisanale',
      isRainbow: true,
      hex: null,
    },
    {
      id: 'Blanc',
      label: 'Blanc Pur',
      desc: 'Patine blanche lumineuse',
      isRainbow: false,
      hex: '#FFFFFF',
    },
    {
      id: 'Noir',
      label: 'Noir Ébène Ciselé',
      desc: 'Laque satinée contemporaine',
      isRainbow: false,
      hex: '#141414',
    },
    {
      id: 'Noyer',
      label: 'Noyer Foncé Noble',
      desc: 'Finition bois précieux ch...',
      isRainbow: false,
      hex: '#5C3317',
    },
  ]

  // ── Configurator state ─────────────────────────────────────────────────────
  const [dynamicPalette, setDynamicPalette] = useState(ATELIER_PALETTE)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedCustomColor, setSelectedCustomColor] = useState<string>('Original')
  const [selectedSize, setSelectedSize] = useState({ id: 'original', label: 'Dimensions\noriginales', sub: 'Standard atelier' })
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [showAllColors, setShowAllColors] = useState(false)
  const [showCustomSize, setShowCustomSize] = useState(false)
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
        const [data, apiColors] = await Promise.all([
          publicApi.getProductById(productId),
          colorsApi.getColors().catch(() => [])
        ])
        setProduct(data)
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].imageUrl)
        }
        if (Array.isArray(apiColors) && apiColors.length > 0) {
          setDynamicPalette([
            { id: 'Original', label: 'Original Atelier', hex: null, desc: 'Finition de la pièce photographiée' },
            ...apiColors.map((c: ColorSwatch) => {
              const label = c.name || c.label
              const matching = ATELIER_PALETTE.find(p => p.id.toLowerCase() === label.toLowerCase())
              return {
                id: label,
                label: matching ? matching.label : label,
                hex: c.hex,
                desc: matching ? matching.desc : 'Finition personnalisée sur-mesure de l’atelier'
              }
            })
          ])
        }
        const allInCategory = await publicApi.getProducts({ category: data.category?.name }).catch(() => [])
        const inCategoryFiltered = (allInCategory || []).filter((p: Product) => p.id !== productId)
        if (inCategoryFiltered.length >= 2) {
          setSimilarProducts(inCategoryFiltered.slice(0, 4))
        } else {
          const generalProducts = await publicApi.getProducts({}).catch(() => [])
          const combined = [
            ...inCategoryFiltered,
            ...(generalProducts || []).filter((p: Product) => p.id !== productId && !inCategoryFiltered.some((cp: Product) => cp.id === p.id))
          ]
          setSimilarProducts(combined.slice(0, 4))
        }
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

      if (action === 'devis' || action === 'commander' || action === 'order') {
        const parts: string[] = []
        const selectedVar = colorVariants[currentIdx]
        if (selectedVar && !selectedVar.isOriginal) {
          parts.push(`Finition souhaitée: ${selectedVar.label}`)
        }
        const summary = parts.join(' | ')
        setMessage(
          summary
            ? `Bonjour, je souhaiterais commander le modèle « ${product.name} » avec les personnalisations suivantes :\n${summary.replace(' | ', '\n')}`
            : `Bonjour, je souhaiterais commander le modèle « ${product.name} ».`
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
        ? `Bonjour Atelier Aschi,\n\nJe souhaite commander le modèle « ${product?.name} » avec ma configuration personnalisée d'atelier :\n• Finition & Patine : ${colorText}\n• Format & Dimensions : ${sizeText}\n\nPourriez-vous me transmettre la confirmation ainsi que le délai de confection ? Merci !`
        : `Bonjour Atelier Aschi,\n\nJe souhaiterais commander le modèle « ${product?.name} ».\nMerci de me recontacter !`
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

  // ── Helper: Format Title with Two-Tone Serif (White Prefix + Gold Model) ─────
  const renderFormattedTitle = () => {
    if (!product) return null
    const name = product.name || 'Modèle 15'
    const cat = product.category?.name || 'Applique'

    if (name.includes('—')) {
      const [prefix, ...rest] = name.split('—')
      return (
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-wide">
          <span className="text-white">{prefix.trim()} — </span>
          <span className="text-[#E6BF68]">{rest.join('—').trim()}</span>
        </h1>
      )
    }
    if (name.includes(' - ')) {
      const [prefix, ...rest] = name.split(' - ')
      return (
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-wide">
          <span className="text-white">{prefix.trim()} — </span>
          <span className="text-[#E6BF68]">{rest.join(' - ').trim()}</span>
        </h1>
      )
    }
    if (!name.toLowerCase().includes(cat.toLowerCase())) {
      return (
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-wide">
          <span className="text-white">{cat} — </span>
          <span className="text-[#E6BF68]">{name}</span>
        </h1>
      )
    }
    const parts = name.split(' ')
    if (parts.length > 1) {
      const first = parts.slice(0, -1).join(' ')
      const last = parts[parts.length - 1]
      return (
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-wide">
          <span className="text-white">{first} — </span>
          <span className="text-[#E6BF68]">{last}</span>
        </h1>
      )
    }
    return (
      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-wide">
        <span className="text-[#E6BF68]">{name}</span>
      </h1>
    )
  }

  // ── Helper: Bottom Action Capsule Bar (Identical on Mobile & Web) ────────────
  const renderActionCapsuleBar = () => (
    <div className="rounded-full border border-[#D4AF37]/60 bg-[#110D0B]/95 backdrop-blur-xl p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
      {/* 1. WHATSAPP */}
      <a
        href={`https://wa.me/21655743760?text=${encodeURIComponent(
          `Bonjour Atelier Aschi, je souhaite commander le modèle « ${product?.name} » (${product?.category?.name || "Pièce d'art"}) en finition ${selectedCustomColor !== 'Original' ? selectedCustomColor : (product?.color || 'Standard')}.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-[#057A3D] hover:bg-[#068F47] text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-full font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
      >
        <svg className="size-4 sm:size-4.5 fill-white shrink-0" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.15c-.24.68-1.2 1.26-1.68 1.32-.47.06-.92.1-3.08-.8-2.6-1.08-4.29-3.72-4.42-3.89-.13-.17-1.06-1.41-1.06-2.69s.67-1.9 1.01-2.25c.34-.35.74-.44.99-.44.25 0 .5.01.71.02.23.01.53-.09.83.63.3.72 1.03 2.51 1.12 2.69.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.36.38-.16.73.21.35.92 1.52 1.98 2.46 1.36 1.21 2.5 1.59 2.86 1.76.36.17.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.8-.18.33.12 2.07.98 2.43 1.16.36.18.6.27.69.42.09.15.09.87-.15 1.55z" />
        </svg>
        <span>WHATSAPP</span>
        <ChevronRight className="size-4 text-white shrink-0" />
      </a>

      {/* 2. PHONE */}
      <a
        href="tel:+21655743760"
        className="size-10 sm:size-11 rounded-full border border-[#D4AF37] bg-[#1A140F] hover:bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer"
        title="Appeler l'atelier (+216 55 743 760)"
        aria-label="Appeler l'atelier"
      >
        <Phone className="size-4 sm:size-4.5 text-[#D4AF37]" />
      </a>

      {/* 3. CONTACT */}
      <button
        type="button"
        onClick={openConfigQuote}
        className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] hover:brightness-105 text-[#1A110B] py-2.5 sm:py-3 px-3 sm:px-4 rounded-full font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 btn-sheen cursor-pointer"
      >
        <Sparkles className="size-3.5 sm:size-4 text-[#1A110B] shrink-0" />
        <span>CONTACT</span>
        <ChevronRight className="size-4 text-[#1A110B] shrink-0" />
      </button>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="bg-[#0E0B09] text-[#E8DCCB] pt-16 pb-28 sm:pt-24 sm:pb-32 md:py-32 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">

          {/* Back button */}
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A89F91] hover:text-[#D4AF37] transition-colors mb-4 sm:mb-8"
          >
            <ArrowLeft className="size-4" /> Retourner au catalogue
          </Link>

          {/* Main grid */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16">

            {/* ── LEFT: Image Visualiser ─────────────────────────────────── */}
            <div ref={imageContainerRef} className="space-y-3 sm:space-y-4 scroll-mt-24">

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

              {/* Main image — desktop loupe, mobile touch swipe */}
              <div 
                ref={zoomContainerRef}
                onMouseEnter={() => setShowZoomLens(true)}
                onMouseLeave={() => setShowZoomLens(false)}
                onMouseMove={handleZoomMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-[4/5] min-h-[360px] sm:min-h-[480px] max-h-[68vh] sm:max-h-[640px] bg-gradient-to-b from-[#1E1712] via-[#140F0C] to-[#0A0705] border-2 border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/25 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(212,175,55,0.35)] overflow-hidden rounded-2xl sm:rounded-3xl sm:cursor-crosshair group select-none flex items-center justify-center p-3 sm:p-5"
              >
                {/* Ambient Blurred Luxury Backdrop (Warm, rich, seamless fit) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-125 pointer-events-none"
                  style={{ backgroundImage: `url(${formatImageUrl(activeImage, '/placeholder.png')})` }}
                />

                {/* Subtle Luxury Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10" />

                {/* Heritage Atelier Badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                  <Sparkles className="size-3 text-[#D4AF37]" />
                  <span>Atelier Aschi • 1960</span>
                </div>

                {/* 100% COMPLETE PHOTO */}
                <motion.img
                  key={activeImage}
                  src={formatImageUrl(activeImage, '/placeholder.png')}
                  alt={product.name}
                  className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-transform duration-700 group-hover:scale-[1.03]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                />

                {/* --- Interactive Loupe Lens (4x Ultra HD - Desktop Only) --- */}
                {showZoomLens && activeImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      top: lensPos.y - 96,
                      left: lensPos.x - 96,
                      backgroundImage: `url(${formatImageUrl(activeImage, '/placeholder.png')})`,
                      backgroundPosition: `${imgPercent.x}% ${imgPercent.y}%`,
                      backgroundSize: '420%',
                    }}
                    className="pointer-events-none absolute size-48 rounded-full border-2 border-amber-400 shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-30 bg-no-repeat overflow-hidden ring-4 ring-black/40 hidden sm:block"
                  />
                )}

                {/* --- Pure Loupe Hint Badge (Desktop Only) --- */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 items-center gap-2 px-4 py-2 rounded-full bg-stone-950/85 backdrop-blur-md border border-[#E8DCCB]/30 text-white shadow-xl opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:flex">
                  <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
                  <span className="text-[11px] font-medium tracking-wide text-amber-100">
                    Loupe Artisanale HD • Survolez pour examiner les détails
                  </span>
                </div>

                {/* Pro Image Navigation Arrows */}
                {viewsForSelectedVariant.length > 1 && (
                  <div 
                    onMouseEnter={() => setShowZoomLens(false)}
                    onMouseLeave={() => setShowZoomLens(true)}
                    className="absolute inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-40"
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
                      className="size-8 sm:size-11 bg-[#16110D]/90 hover:bg-[#D4AF37] hover:text-[#1A110B] text-[#D4AF37] rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-2xl border border-[#D4AF37]/50 hover:scale-110 active:scale-95 group/arrow flex items-center justify-center cursor-pointer"
                      title="Vue précédente"
                    >
                      <ChevronLeft className="size-4 sm:size-5 transition-transform group-hover/arrow:-translate-x-0.5" />
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
                      className="size-8 sm:size-11 bg-[#16110D]/90 hover:bg-[#D4AF37] hover:text-[#1A110B] text-[#D4AF37] rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-2xl border border-[#D4AF37]/50 hover:scale-110 active:scale-95 group/arrow flex items-center justify-center cursor-pointer"
                      title="Vue suivante"
                    >
                      <ChevronRight className="size-4 sm:size-5 transition-transform group-hover/arrow:translate-x-0.5" />
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
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-2 scroll-smooth scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {viewsForSelectedVariant.map((view, i) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveImage(view.imageUrl)}
                      className={`relative size-14 sm:size-20 border rounded-lg sm:rounded-xl overflow-hidden shrink-0 transition-all ${
                        activeImage === view.imageUrl ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 opacity-100 scale-105 shadow-md' : 'border-white/15 opacity-60 hover:opacity-100'
                      }`}
                      title={`${selectedVariant.label} - Vue ${i + 1}`}
                    >
                      <img
                        src={formatImageUrl(view.imageUrl, '/placeholder.png')}
                        alt={`${selectedVariant.label} vue ${i + 1}`}
                        className="size-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
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
            <div className="flex flex-col text-left gap-4 sm:gap-5">

              {/* 1. Category Pill Badge */}
              <div>
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#D4AF37] bg-black/40 text-[#D4AF37] text-xs font-extrabold uppercase tracking-[0.2em] shadow-sm">
                  {product.category?.name || 'APPLIQUE'}
                </div>
              </div>

              {/* 2. Main Title (Two-tone Serif: White Prefix + Gold Model) */}
              <div>
                {renderFormattedTitle()}
              </div>

              {/* 3. Ornamental Divider with Gold Zellij/Floral Motif */}
              <div className="flex items-center gap-3 my-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]/30" />
                <span className="text-[#D4AF37] text-sm leading-none select-none">✤</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]/30" />
              </div>

              {/* 4. Subtitle */}
              <p className="font-heading italic sm:not-italic text-sm sm:text-base text-[#D8CEBF] font-light leading-relaxed whitespace-pre-line">
                L&apos;authenticité de l&apos;artisanat tunisien,
                {"\n"}au service de votre intérieur.
              </p>

              {/* 5. 4 Circular Icon Specifications Grid */}
              <div className="grid grid-cols-4 divide-x divide-[#D4AF37]/20 border-y border-[#D4AF37]/20 py-4 my-1 sm:my-2">
                {/* 1. Dimensions */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="size-10 sm:size-12 rounded-full border border-[#D4AF37]/75 bg-[#1C1611]/80 flex items-center justify-center mb-2 text-[#D4AF37] shadow-sm">
                    <Ruler className="size-4.5 sm:size-5 text-[#D4AF37] -rotate-45" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Dimensions</p>
                  <p className="text-[8.5px] sm:text-[10.5px] text-[#A89F91] leading-tight mt-1 whitespace-pre-line">
                    {selectedSize.id === 'custom'
                      ? `${customWidth || '80'} × ${customHeight || '150'} cm\nSur-mesure`
                      : (selectedSize.id !== 'original'
                        ? `${selectedSize.label.replace('\n', ' ')}\n${selectedSize.sub}`
                        : (product.dimensions || "Moyen (80–150 cm)\nAdaptable sur-mesure"))}
                  </p>
                </div>

                {/* 2. Matériaux nobles */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="size-10 sm:size-12 rounded-full border border-[#D4AF37]/75 bg-[#1C1611]/80 flex items-center justify-center mb-2 text-[#D4AF37] shadow-sm">
                    <Layers className="size-4.5 sm:size-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Matériaux nobles</p>
                  <p className="text-[8.5px] sm:text-[10.5px] text-[#A89F91] leading-tight mt-1 whitespace-pre-line">
                    {product.materials || "Noyer massif &\nCéramique"}
                  </p>
                </div>

                {/* 3. Finition & patine */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="size-10 sm:size-12 rounded-full border border-[#D4AF37]/75 bg-[#1C1611]/80 flex items-center justify-center mb-2 text-[#D4AF37] shadow-sm">
                    <Palette className="size-4.5 sm:size-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Finition &amp; patine</p>
                  <p className="text-[8.5px] sm:text-[10.5px] text-[#A89F91] leading-tight mt-1 whitespace-pre-line">
                    {selectedCustomColor !== 'Original'
                      ? `${selectedCustomColor}\nVernis satiné protecteur`
                      : (product.color ? `${product.color}\nVernis satiné protecteur` : "Naturel\nVernis satiné protecteur")}
                  </p>
                </div>

                {/* 4. Délai */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="size-10 sm:size-12 rounded-full border border-[#D4AF37]/75 bg-[#1C1611]/80 flex items-center justify-center mb-2 text-[#D4AF37] shadow-sm">
                    <Clock className="size-4.5 sm:size-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Délai</p>
                  <p className="text-[8.5px] sm:text-[10.5px] text-[#A89F91] leading-tight mt-1 whitespace-pre-line">
                    2 à 3 semaines{"\n"}Livraison toute Tunisie
                  </p>
                </div>
              </div>

              {/* 6. CONFIGURATEUR & NUANCIER CARD */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#14100D]/95 border border-[#D4AF37]/40 p-4 sm:p-6 shadow-2xl space-y-4">
                {/* Header inside card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 sm:size-4.5 text-[#D4AF37]" />
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                      CONFIGURATEUR &amp; NUANCIER
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomSize(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF37]/70 bg-[#1D1610] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] sm:text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sparkles className="size-3 text-[#D4AF37]" />
                    <span>Sur-mesure</span>
                  </button>
                </div>

                {/* 1. Finition / Couleur */}
                <div>
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#FAF7F2] font-bold mb-2.5">
                    1. FINITION / COULEUR SOUHAITÉE :
                  </p>

                  {/* 2x2 Grid of Finishes matching photo */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {PRIMARY_FINISHES.map((c) => {
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
                            'flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-left',
                            isSelected
                              ? 'border-2 border-[#D4AF37] bg-[#221B14] ring-1 ring-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)] text-white'
                              : 'border border-white/10 bg-[#1A1613] hover:border-[#D4AF37]/40 text-[#E8DCCB]'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {c.isRainbow ? (
                              <div
                                className="size-5 sm:size-6 rounded-full border-2 border-white shrink-0 shadow-xs"
                                style={{ background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                              />
                            ) : (
                              <div
                                className="size-5 sm:size-6 rounded-full border shrink-0 shadow-xs"
                                style={{
                                  backgroundColor: c.hex || '#FFFFFF',
                                  borderColor: c.hex === '#FFFFFF' ? '#A8A29E' : '#57534E',
                                }}
                              />
                            )}
                            <div className="min-w-0">
                              <p className={cn('text-xs font-bold truncate leading-tight', isSelected ? 'text-white' : 'text-[#FAF7F2]')}>
                                {c.label}
                              </p>
                              <p className="text-[10px] text-[#A89F91] truncate leading-tight mt-0.5">
                                {c.desc}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="size-4 sm:size-5 text-[#D4AF37] shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Optional extra finishes expander */}
                  {dynamicPalette.filter(p => !PRIMARY_FINISHES.some(pf => pf.id === p.id)).length > 0 && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => setShowAllColors(prev => !prev)}
                        className="text-[10.5px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>{showAllColors ? 'Masquer les autres teintes' : '+ Voir d’autres finitions d’atelier (Bleu, Vert, Or...)'}</span>
                      </button>

                      <AnimatePresence>
                        {showAllColors && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#D4AF37]/20"
                          >
                            {dynamicPalette.filter(p => !PRIMARY_FINISHES.some(pf => pf.id === p.id)).map((c) => {
                              const isSelected = selectedCustomColor === c.id
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomColor(c.id)
                                    const matchingVariantIdx = colorVariants.findIndex(v =>
                                      v.label.toLowerCase().includes(c.id.toLowerCase()) ||
                                      c.id.toLowerCase().includes(v.label.toLowerCase())
                                    )
                                    if (matchingVariantIdx !== -1) {
                                      setSelectedVariantIdx(matchingVariantIdx)
                                      setActiveImage(colorVariants[matchingVariantIdx].imageUrl)
                                    }
                                  }}
                                  className={cn(
                                    'flex items-center justify-between gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all',
                                    isSelected
                                      ? 'border-2 border-[#D4AF37] bg-[#221B14] text-white shadow-xs'
                                      : 'border border-white/10 bg-[#1A1613] hover:border-[#D4AF37]/40 text-[#E8DCCB]'
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className="size-4.5 rounded-full border border-stone-600 shrink-0 shadow-xs"
                                      style={{ backgroundColor: c.hex || '#C9A84C' }}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-white truncate">{c.label}</p>
                                      <p className="text-[9.5px] text-[#A89F91] truncate">{c.desc}</p>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="size-3.5 text-[#D4AF37] shrink-0" />}
                                </button>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* 2. Dimensions & Sur-mesure Accordion */}
                <AnimatePresence>
                  {(showCustomSize || selectedSize.id !== 'original') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t border-[#D4AF37]/20 space-y-3"
                    >
                      <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#FAF7F2] font-bold">
                        2. DIMENSIONS SOUHAITÉES :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((s) => {
                          const isSizeSelected = selectedSize.id === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSize(s)}
                              className={cn(
                                'flex flex-col items-center px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer',
                                isSizeSelected
                                  ? 'border-2 border-[#D4AF37] bg-[#221B14] text-[#F2BD52] font-bold shadow-xs'
                                  : 'border border-white/10 bg-[#1A1613] hover:border-[#D4AF37]/40 text-[#E8DCCB]'
                              )}
                            >
                              <span className="font-bold leading-tight">{s.label.replace('\n', ' ')}</span>
                              {s.sub && <span className="text-[9.5px] text-[#A89F91] mt-0.5">{s.sub}</span>}
                            </button>
                          )
                        })}
                      </div>

                      {selectedSize.id === 'custom' && (
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="text-[10.5px] uppercase font-bold text-[#FAF7F2] block mb-1">Largeur (cm)</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Ex: 120"
                              value={customWidth}
                              onChange={e => setCustomWidth(e.target.value)}
                              className="w-full bg-[#1A1613] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl p-2 text-xs font-bold text-white placeholder:text-stone-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10.5px] uppercase font-bold text-[#FAF7F2] block mb-1">Hauteur (cm)</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Ex: 80"
                              value={customHeight}
                              onChange={e => setCustomHeight(e.target.value)}
                              className="w-full bg-[#1A1613] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl p-2 text-xs font-bold text-white placeholder:text-stone-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7. Action Capsule Bar for Desktop (Web) */}
              <div className="hidden sm:block pt-1">
                {renderActionCapsuleBar()}
              </div>

              {/* 8. Additional Actions (Cart + Reset) */}
              <div className="flex flex-col gap-2 pt-1">
                {product.type !== 'CATALOGUE' && (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#1A1410] hover:bg-[#241C15] py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#E8DCCB] transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="size-4 text-[#D4AF37]" /> Ajouter au panier
                  </button>
                )}

                {(selectedCustomColor !== 'Original' || selectedSize.id !== 'original') && (
                  <button
                    onClick={() => { 
                      setSelectedCustomColor('Original')
                      setSelectedVariantIdx(0)
                      setSelectedSize(SIZES[0])
                      setActiveImage(product.images?.[0]?.imageUrl || '') 
                    }}
                    className="text-xs text-[#A89F91] hover:text-[#D4AF37] transition-colors text-center underline underline-offset-4 cursor-pointer mt-1"
                  >
                    Réinitialiser la personnalisation
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <section className="mt-16 sm:mt-24 border-t border-[#D4AF37]/25 pt-12 sm:pt-16 text-left">
              {/* Header with clear explanation for the client */}
              <div className="max-w-2xl mb-6 sm:mb-8 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF37]/50 bg-[#1A1410] text-[#D4AF37] text-[10.5px] font-extrabold uppercase tracking-widest shadow-xs">
                  <Sparkles className="size-3 text-[#D4AF37]" />
                  <span>Dans le même esprit d&apos;atelier</span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight">
                  Produits Similaires &amp; Suggestions
                </h3>
                <p className="text-xs sm:text-sm text-[#C5B8A5] font-light leading-relaxed">
                  Ces créations partagent le même savoir-faire d&apos;ébénisterie d&apos;art et les mêmes patines nobles. Tout comme ce modèle, chacune peut être sculptée et personnalisée sur-mesure aux dimensions et finitions de votre choix.
                </p>
              </div>

              {/* 2 Photos side-by-side grid (Deux photos l'une près de l'autre), compact optimized cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {similarProducts.slice(0, 4).map((p) => {
                  const pImage = p.images?.[0]?.imageUrl || '/placeholder.png'
                  return (
                    <Link
                      key={p.id}
                      href={`/produits/${p.id}`}
                      className="group relative rounded-xl sm:rounded-2xl bg-[#14100D] border border-[#D4AF37]/25 hover:border-[#D4AF37]/75 p-2 sm:p-2.5 transition-all duration-300 shadow-lg hover:shadow-[0_8px_25px_rgba(212,175,55,0.15)] flex flex-col justify-between hover:-translate-y-0.5"
                    >
                      {/* Compact Image Container */}
                      <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#0E0B09] border border-white/5">
                        <img
                          src={pImage}
                          alt={p.name}
                          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[8.5px] sm:text-[9.5px] font-bold text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/30">
                          {p.category?.name || 'Atelier'}
                        </span>
                      </div>

                      {/* Compact Details */}
                      <div className="pt-2 px-0.5">
                        <h4 className="font-heading text-xs sm:text-sm font-semibold text-white group-hover:text-[#F2BD52] transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-[10px] sm:text-[11px]">
                          <span className="text-[#A89F91] truncate">{p.dimensions || 'Sur mesure'}</span>
                          <span className="font-mono font-bold text-[#F2BD52] shrink-0">
                            {p.price ? `${p.price} DT` : 'Sur devis'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ═══ MOBILE FLOATING STICKY ACTION BAR (MATCHING REFERENCE DESIGN) ═══ */}
      <div className="fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto sm:hidden">
        {renderActionCapsuleBar()}
      </div>

      {/* ═══ QUOTE MODAL (pre-filled, chic & luxury atelier design) ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#18130F] border-2 border-[#D4AF37]/50 w-full max-w-xl rounded-2xl sm:rounded-[28px] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] text-[#FAF7F2] my-auto"
          >
            {/* Modal Header */}
            <header className="px-4 py-4 sm:px-6 sm:py-5 border-b border-[#D4AF37]/25 bg-gradient-to-b from-[#241C15] via-[#201812] to-[#18130E]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-extrabold uppercase tracking-widest mb-1.5 shadow-xs">
                    <Sparkles className="size-3.5 text-[#F2BD52]" /> Atelier Sur-Mesure • Pièce d&apos;Art
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {isCustomized ? 'Votre Commande Personnalisée' : 'Demande de Confection d\'Atelier'}
                  </h2>
                  <p className="text-xs text-[#C5B8A5] font-medium mt-0.5">
                    Confection artisanale sur-mesure par les maîtres ébénistes d&apos;Atelier Aschi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="size-9 rounded-full bg-[#241812] hover:bg-[#332219] text-[#C5B8A5] hover:text-[#F2BD52] border border-[#D4AF37]/30 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 mt-1"
                  title="Fermer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Product Showcase Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#120E0A] border border-[#D4AF37]/30 flex items-center gap-3.5 shadow-xs">
                <div className="size-14 sm:size-16 rounded-xl overflow-hidden border border-[#D4AF37]/40 shrink-0 bg-black/40 shadow-inner">
                  <img src={activeImage || product.images?.[0]?.imageUrl || '/placeholder.png'} alt={product.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4AF37] block">
                    {product.category?.name || 'Mobilier d\'Art'}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{product.name}</h3>
                  <p className="text-xs text-[#A89F91] font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Fait main au centimètre près • Patine exclusive
                  </p>
                </div>
              </div>
            </header>

            {quoteSent ? (
              <div className="p-10 text-center space-y-4 bg-[#18130F]">
                <div className="size-16 rounded-full bg-emerald-950/80 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="size-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">Demande envoyée avec succès !</h3>
                <p className="text-sm font-medium text-[#C5B8A5] max-w-sm mx-auto leading-relaxed">
                  Votre demande pour « <strong className="text-white">{product.name}</strong> » a été transmise directement à nos maîtres artisans. Nous vous recontacterons avec votre étude personnalisée sous 24h.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mt-4 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-left bg-[#18130F]">
                {quoteError && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm font-bold flex items-center gap-3">
                    <AlertCircle className="size-5 shrink-0 text-red-400" /><p>{quoteError}</p>
                  </div>
                )}

                {/* Chic Configuration Card */}
                <div className="rounded-2xl bg-[#120E0A] border border-[#D4AF37]/50 p-4 text-[#FAF7F2] shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[#F2BD52]" />
                      <span className="text-xs uppercase font-extrabold tracking-wider text-[#F2BD52]">
                        Configuration demandée pour l&apos;atelier
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#F2BD52] bg-white/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40">
                      Sur-mesure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Finition */}
                    <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <div
                        className="size-4.5 rounded-full border-2 border-white shrink-0 shadow-xs"
                        style={{ backgroundColor: ATELIER_PALETTE.find(c => c.id === selectedCustomColor)?.hex || '#8B5E3C' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-[#A89F91] tracking-wider">Teinte &amp; Patine</p>
                        <p className="font-extrabold text-[#FAF7F2] truncate">
                          {selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Originale d\'Atelier')}
                        </p>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <Ruler className="size-4.5 text-[#F2BD52] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-[#A89F91] tracking-wider">Dimensions</p>
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
                    <label className="text-xs uppercase tracking-wider text-[#FAF7F2] font-extrabold flex items-center gap-1.5">
                      <User className="size-3.5 text-[#D4AF37]" />
                      <span>Votre Nom complet</span>
                      <span className="text-red-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sonia Ben Miled"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-[#120E0A] border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl px-4 py-3.5 text-sm font-bold text-white placeholder:text-stone-500 outline-none shadow-xs transition-all"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#FAF7F2] font-extrabold flex items-center gap-1.5">
                        <Mail className="size-3.5 text-[#D4AF37]" />
                        <span>Adresse Email</span>
                        <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#120E0A] border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl px-4 py-3.5 text-sm font-bold text-white placeholder:text-stone-500 outline-none shadow-xs transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#FAF7F2] font-extrabold flex items-center gap-1.5">
                        <Phone className="size-3.5 text-[#D4AF37]" />
                        <span>Numéro de Téléphone</span>
                        <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+216 22 222 222"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-[#120E0A] border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl px-4 py-3.5 text-sm font-bold text-white placeholder:text-stone-500 outline-none shadow-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-[#FAF7F2] font-extrabold flex items-center gap-1.5">
                        <MessageCircle className="size-3.5 text-[#D4AF37]" />
                        <span>Message &amp; Précisions pour les Artisans</span>
                        <span className="text-red-400 font-bold">*</span>
                      </label>
                      <span className="text-[10.5px] text-[#A89F91] font-semibold">Personnalisable</span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full bg-[#120E0A] border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl p-3.5 text-sm font-medium text-white placeholder:text-stone-500 outline-none shadow-xs transition-all resize-none leading-relaxed"
                    />
                    <p className="text-[11px] text-[#A89F91] italic">
                      Indiquez toute particularité : essences de bois souhaitées, teintes de votre intérieur, etc.
                    </p>
                  </div>
                </div>

                {/* Reassurance Ribbon */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D4AF37]/20">
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-[#120E0A] border border-[#D4AF37]/30 shadow-xs">
                    <ShieldCheck className="size-4 text-[#D4AF37] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-white uppercase tracking-wider">Atelier Direct</span>
                    <span className="text-[9.5px] text-[#A89F91]">Sans engagement</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-[#120E0A] border border-[#D4AF37]/30 shadow-xs">
                    <Clock className="size-4 text-[#D4AF37] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-white uppercase tracking-wider">Réponse 24h</span>
                    <span className="text-[9.5px] text-[#A89F91]">Proposition directe</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-[#120E0A] border border-[#D4AF37]/30 shadow-xs">
                    <Truck className="size-4 text-[#D4AF37] mb-1" />
                    <span className="text-[10.5px] font-extrabold text-white uppercase tracking-wider">Livraison Pro</span>
                    <span className="text-[9.5px] text-[#A89F91]">Toute la Tunisie</span>
                  </div>
                </div>

                {/* WhatsApp direct alternative */}
                <div className="pt-1 text-center">
                  <a
                    href={`https://wa.me/21655743760?text=${encodeURIComponent(`Bonjour Atelier Aschi, je souhaite commander le modèle « ${product.name} » en finition ${selectedCustomColor !== 'Original' ? selectedCustomColor : (product.color || 'Standard')}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline cursor-pointer"
                  >
                    <MessageCircle className="size-3.5" />
                    Ou discutez directement sur WhatsApp avec l&apos;Atelier Aschi (+216 55 743 760)
                  </a>
                </div>

                <footer className="pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-full sm:w-auto rounded-full border border-[#D4AF37]/40 bg-[#120E0A] hover:bg-[#1C1611] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#FAF7F2] transition-all cursor-pointer shadow-xs order-2 sm:order-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="btn-sheen w-full sm:w-auto rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] hover:opacity-95 px-8 py-3.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#1A110B] shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer order-1 sm:order-2"
                  >
                    <Send className="size-4" />
                    {submittingQuote ? 'Transmission en cours...' : 'Envoyer ma demande'}
                  </button>
                </footer>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  )
}
