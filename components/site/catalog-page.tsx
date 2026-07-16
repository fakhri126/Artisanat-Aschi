'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, MessageCircle, Sparkles, Bot, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/motion/fade-in'
import { publicApi, Product } from '@/lib/api'
import Link from 'next/link'

// ─── Filter data ────────────────────────────────────────────────────────────

const CATEGORIES = ['Tout', 'Buffets', 'Meubles TV', 'Miroirs', 'Portes', 'Coffres', 'Décoration', 'Tables']

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

// ─── Mock data fallback ──────────────────────────────────────────────────────

const MOCK_MODELS: Product[] = [
  { id: 5, name: 'Buffet Carthage', category: { id: 1, name: 'Buffets', type: '' }, images: [{ id: 1, imageUrl: '/cat-buffet.png', isPrimary: true }], description: "Buffet en noyer massif aux portes finement sculptées.", materials: 'Noyer massif', dimensions: '180 x 50 x 85 cm', color: 'Noyer', price: 4200, availability: 'Disponible', type: 'CATALOGUE', isFeatured: false },
  { id: 6, name: 'Meuble TV Hammamet', category: { id: 2, name: 'Meubles TV', type: '' }, images: [{ id: 2, imageUrl: '/cat-tv.png', isPrimary: true }], description: 'Meuble bas tout en élégance.', materials: 'Bois de frêne', dimensions: '160 x 40 x 55 cm', color: 'Blanc Cérusé', price: 2600, availability: 'Disponible', type: 'CATALOGUE', isFeatured: false },
  { id: 4, name: 'Miroir Sidi Bou', category: { id: 3, name: 'Miroirs', type: '' }, images: [{ id: 3, imageUrl: '/creation-model.png', isPrimary: true }], description: "Miroir au cadre sculpté rehaussé de feuille d'or.", materials: "Bois d'olivier", dimensions: '80 x 120 cm', color: 'Or', price: 1900, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: false },
  { id: 3, name: 'Porte Dar El Bey', category: { id: 4, name: 'Portes', type: '' }, images: [{ id: 4, imageUrl: '/cat-door.png', isPrimary: true }], description: 'Porte artistique aux gravures géométriques profondes.', materials: 'Chêne', dimensions: '220 x 140 cm', color: 'Noyer', price: null, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: false },
  { id: 2, name: 'Coffre Kairouan', category: { id: 5, name: 'Coffres', type: '' }, images: [{ id: 5, imageUrl: '/cat-chest.png', isPrimary: true }], description: 'Coffre en bois sculpté et ferronnerie de laiton.', materials: 'Cèdre', dimensions: '90 x 50 x 55 cm', color: 'Or', price: null, availability: 'Disponible', type: 'CATALOGUE', isFeatured: false },
  { id: 8, name: 'Panneau Médina', category: { id: 6, name: 'Décoration', type: '' }, images: [{ id: 8, imageUrl: '/cat-deco.png', isPrimary: true }], description: 'Panneau mural et console décorative aux ornements arabesques.', materials: 'Chêne', dimensions: '100 x 200 cm', color: 'Bleu', price: null, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: false },
  { id: 9, name: 'Cabinet Kasbah', category: { id: 1, name: 'Buffets', type: '' }, images: [{ id: 9, imageUrl: '/creation-unique.png', isPrimary: true }], description: 'Cabinet en bois noble aux sculptures géométriques.', materials: 'Noyer & Laiton', dimensions: '120 x 45 x 160 cm', color: 'Noyer', price: 6800, availability: 'Sur commande', type: 'CATALOGUE', isFeatured: true },
  { id: 10, name: 'Miroir Atlas', category: { id: 3, name: 'Miroirs', type: '' }, images: [{ id: 10, imageUrl: '/cat-mirror.png', isPrimary: true }], description: 'Grand miroir encadré de bois sculpté naturel.', materials: 'Pin naturel', dimensions: '70 x 110 cm', color: 'Naturel', price: 1400, availability: 'Disponible', type: 'CATALOGUE', isFeatured: false },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function CatalogPage() {
  const [category, setCategory] = useState('Tout')
  const [color, setColor] = useState('Tout')
  const [dimension, setDimension] = useState('Tout')
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await publicApi.getProducts({ type: 'CATALOGUE' })
        setDbProducts(data)
      } catch (err) {
        console.error("Failed to load catalog products:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Client-side filtering on database products (fallback to MOCK_MODELS if DB is empty)
  useEffect(() => {
    const source = dbProducts.length > 0 ? dbProducts : (loading ? [] : MOCK_MODELS)
    let filtered = source

    if (category !== 'Tout') {
      filtered = filtered.filter(p => p.category?.name === category)
    }
    if (color !== 'Tout') {
      filtered = filtered.filter(p => p.color === color)
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

    setProducts(filtered)
  }, [category, color, dimension, dbProducts, loading])

  const activeFilterCount = [
    category !== 'Tout',
    color !== 'Tout',
    dimension !== 'Tout',
  ].filter(Boolean).length

  return (
    <section className="min-h-screen bg-walnut py-16 text-walnut-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header */}
        <FadeIn className="text-center mb-14">
          <p className="text-xs uppercase tracking-luxury text-gold">Catalogue d&apos;inspiration</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-heading text-5xl font-light leading-tight sm:text-6xl md:text-7xl text-ivory">
            Nos créations passées, sources d&apos;inspiration
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-walnut-foreground/65">
            Parcourez les modèles déjà réalisés. Choisissez-en un tel quel, ou
            laissez-le inspirer votre propre création sur-mesure.
          </p>
        </FadeIn>

        {/* IA Disclaimer banner */}
        <FadeIn delay={0.1}>
          <div className="mb-10 flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/5 px-5 py-4 text-sm text-walnut-foreground/70 backdrop-blur-sm">
            <Bot className="mt-0.5 size-5 shrink-0 text-gold" />
            <div>
              <span className="font-semibold text-gold">Note IA — </span>
              Certains modèles de ce catalogue sont générés ou améliorés par intelligence artificielle à des fins d&apos;illustration. Ils peuvent ne pas correspondre à des réalisations physiques existantes. Contactez-nous pour vérifier la disponibilité d&apos;un modèle spécifique.
            </div>
          </div>
        </FadeIn>

        {/* Filter panel */}
        <FadeIn delay={0.15}>
          <div className="mb-10 rounded-3xl border border-gold/15 bg-zinc-950/20 backdrop-blur-sm overflow-hidden">
            {/* Filter header — toggle on mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className="flex w-full items-center justify-between px-6 py-4 text-left md:cursor-default"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="size-4 text-gold" />
                <span className="text-sm font-semibold uppercase tracking-wider text-gold">Filtrer les modèles</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-walnut">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-walnut-foreground/40 md:hidden">
                {showFilters ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            <div className={cn(
              'border-t border-gold/10 px-6 py-6 space-y-7 transition-all duration-300',
              'md:block',
              showFilters ? 'block' : 'hidden md:block'
            )}>

              {/* Category pills */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wider text-gold/70 font-semibold">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200',
                        category === cat
                          ? 'bg-gold text-walnut shadow-md'
                          : 'border border-gold/20 text-walnut-foreground/60 hover:border-gold/50 hover:text-ivory'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color swatches */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wider text-gold/70 font-semibold">Couleur du bois</p>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setColor(c.label)}
                      title={c.label}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={cn(
                          'size-9 rounded-full border-2 transition-all duration-200 shadow-md',
                          color === c.label
                            ? 'scale-110 ring-2 ring-gold ring-offset-2 ring-offset-walnut'
                            : 'group-hover:scale-105',
                          c.hex ? c.border : 'border-gold/40'
                        )}
                        style={c.hex ? { backgroundColor: c.hex } : { background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                      />
                      <span className={cn(
                        'text-[10px] font-medium transition-colors',
                        color === c.label ? 'text-gold' : 'text-walnut-foreground/50 group-hover:text-ivory'
                      )}>
                        {c.label === 'Tout' ? 'Toutes' : c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension pills */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="text-xs uppercase tracking-wider text-gold/70 font-semibold">Dimensions</p>
                <div className="flex flex-wrap gap-2">
                  {DIMENSIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDimension(d)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
                        dimension === d
                          ? 'bg-gold/20 border border-gold text-gold'
                          : 'border border-gold/15 text-walnut-foreground/50 hover:border-gold/40 hover:text-ivory'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setCategory('Tout'); setColor('Tout'); setDimension('Tout') }}
                    className="ml-auto flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="size-3.5" /> Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results count */}
        <FadeIn delay={0.2}>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-walnut-foreground/50">
              <span className="text-ivory font-semibold">{products.length}</span> modèle{products.length !== 1 ? 's' : ''} trouvé{products.length !== 1 ? 's' : ''}
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
              <div className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <p className="font-heading text-2xl text-ivory/40">Aucun modèle trouvé</p>
              <p className="mt-2 text-sm text-walnut-foreground/30">Essayez d&apos;autres critères de filtrage.</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${category}-${color}-${dimension}`}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
            >
              {products.map((model) => {
                const image = model.images?.[0]?.imageUrl || '/placeholder.png'
                const link = `/produits/${model.id}`
                const isHovered = hoveredId === model.id

                return (
                  <motion.article
                    key={model.id}
                    variants={{
                      hidden: { opacity: 0, y: 28, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onHoverStart={() => setHoveredId(model.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    className="group relative overflow-hidden rounded-2xl border border-gold/10"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                      <motion.img
                        src={image}
                        alt={model.name}
                        className="size-full object-cover"
                        animate={{ scale: isHovered ? 1.07 : 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />

                      {/* Dark overlay on hover */}
                      <motion.div
                        className="absolute inset-0 bg-walnut/65 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.35 }}
                      />

                      {/* AI badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
                        <Bot className="size-3 text-gold" />
                        <span className="text-[9px] uppercase tracking-wider text-gold/80 font-medium">IA</span>
                      </div>

                      {/* Color swatch badge */}
                      {model.color && model.color !== 'Tout' && (
                        <div className="absolute top-3 left-3">
                          {(() => {
                            const colorData = COLORS.find(c => c.label === model.color)
                            return colorData?.hex ? (
                              <div
                                className="size-5 rounded-full border-2 border-white/40 shadow-md"
                                style={{ backgroundColor: colorData.hex }}
                                title={model.color}
                              />
                            ) : null
                          })()}
                        </div>
                      )}

                      {/* CTA buttons on hover */}
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-5"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
                        transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0 }}
                      >
                        <Link
                          href={link}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-walnut transition-colors hover:bg-ivory"
                        >
                          <Eye className="size-3.5" /> Voir les détails
                        </Link>
                        <Link
                          href={`${link}?action=devis`}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-ivory/60 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold"
                        >
                          <MessageCircle className="size-3.5" /> Demander ce modèle
                        </Link>
                        <Link
                          href={`${link}?action=personnaliser`}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-ivory/60 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold"
                        >
                          <Sparkles className="size-3.5" /> Personnaliser
                        </Link>
                      </motion.div>
                    </div>

                    {/* Card footer */}
                    <div className="bg-zinc-950/30 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading text-lg font-medium leading-tight text-ivory">
                            {model.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-walnut-foreground/50">{model.materials}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold font-medium">
                          {model.category?.name}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-3">
                        <span className="text-xs text-walnut-foreground/40">{model.dimensions}</span>
                        <span className="text-xs font-semibold text-gold">
                          Sur devis
                        </span>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
