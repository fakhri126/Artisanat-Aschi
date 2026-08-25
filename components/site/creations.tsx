'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { publicApi, Product } from '@/lib/api'
import Link from 'next/link'
import { ShoppingCart, Sparkles, Flame, CheckCircle2, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'

export function Creations() {
  const { addToCart } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodData, catData] = await Promise.all([
          publicApi.getProducts(),
          publicApi.getCategories()
        ])

        // Only keep available products (not inspiration ones) and exclude Bijoux de Porte
        const availableProds = prodData.filter((p) => {
          const isCatalog = p.type === 'CATALOGUE'
          const catName = p.category?.name?.toLowerCase() || ''
          const prodName = p.name?.toLowerCase() || ''
          const mat = p.materials?.toLowerCase() || ''
          const isBijoux = catName.includes('bijou') || catName.includes('poignée') || catName.includes('bouton') || catName.includes('porte') || catName.includes('ronds') || catName.includes('ovales') ||
                           prodName.includes('bijou') || prodName.includes('poignée') || prodName.includes('bouton') ||
                           mat.includes('céramique') || mat.includes('majolique')
          return !isCatalog && !isBijoux
        })
        setAllProducts(availableProds)

        const catNames = new Set<string>()
        catData.forEach(c => catNames.add(c.name))
        availableProds.forEach(p => {
          if (p.category?.name) catNames.add(p.category.name)
        })

        setCategories(['Tout', 'Pièces uniques', ...Array.from(catNames)])
      } catch (err) {
        console.error('Error fetching creations data:', err)
        setCategories(['Tout', 'Pièces uniques', 'Buffets', 'Meubles TV', 'Miroirs', 'Portes', 'Coffres', 'Décoration', 'Tables'])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = selectedCategory === 'Tout'
    ? allProducts
    : selectedCategory === 'Pièces uniques'
      ? allProducts.filter(p => p.type === 'PIECE_UNIQUE')
      : allProducts.filter(p => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <section id="creations-disponibles" className="relative bg-transparent text-[#F7F4EE] py-10 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <Reveal className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 shadow-md">
            <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
            <span>Pièces Disponibles • Prêtes à Commander</span>
          </div>
          
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient leading-[1.08] mb-3 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
            Pièces &amp; Mobilier Disponibles
          </h1>
          
          <p className="text-[#EAE4D9]/90 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-2xl drop-shadow-md">
            Découvrez nos œuvres d&apos;art sculptées en noyer massif disponibles immédiatement à l&apos;achat. Chaque pièce est unique, façonnée à la main dans notre atelier historique en Tunisie.
          </p>

          {/* Category Filter Tabs */}
          {!loading && categories.length > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-4xl">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'rounded-full px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer',
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
          )}
        </Reveal>

        {/* Product Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-[#E6A635] border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#EAE4D9]/70 bg-[#3B271C]/60 rounded-3xl border border-[#E6A635]/25 p-8">
              <p className="text-base font-light mb-3">Aucune pièce disponible dans cette catégorie pour le moment.</p>
              <Link href="/custom-creation" className="btn-sheen px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider">
                Commander sur-mesure
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((item, i) => {
                const name = item.name
                const image = item.images?.[0]?.imageUrl || '/placeholder.jpg'
                const meta = `${item.materials || 'Noyer noble massif'} · ${item.dimensions || 'Dimensions sur-mesure'}`
                const price = item.price ? `${item.price.toLocaleString('fr-FR')} DT` : 'Sur demande'
                const link = `/produits/${item.id}`
                const isUnique = item.type === 'PIECE_UNIQUE'

                return (
                  <Reveal key={item.id} delay={i * 60}>
                    <article className="group relative overflow-hidden rounded-2xl bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-[#E6A635]/80 hover:bg-[#442E20]/95 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                      
                      {/* Photo Frame */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#241812]">
                        <Image
                          src={image}
                          alt={name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3B271C] via-transparent to-transparent opacity-80" />
                        
                        {/* Badges */}
                        {isUnique ? (
                          <span className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white shadow-md ring-1 ring-amber-400/40">
                            <Flame className="size-2.5 text-yellow-300" />
                            Pièce unique
                          </span>
                        ) : (
                          <span className="absolute left-3.5 top-3.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 px-2.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#F2BD52]">
                            Disponible
                          </span>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[9.5px] uppercase tracking-[0.18em] text-[#F2BD52] font-semibold block mb-1">
                            {item.category?.name || 'Mobilier d\'art'}
                          </span>
                          
                          <h3 className="font-heading text-lg sm:text-xl font-normal text-[#F7F4EE] group-hover:text-white transition-colors leading-tight mb-1">
                            {name}
                          </h3>
                          
                          <p className="text-[11.5px] font-light text-[#EAE4D9]/85 line-clamp-1 mb-3">
                            {meta}
                          </p>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-3 border-t border-[#E6A635]/25 flex items-center justify-between gap-2">
                          <span className="font-heading text-base sm:text-lg text-gold-gradient font-medium">
                            {price}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Link
                              href={link}
                              className="text-[11px] font-semibold uppercase tracking-wider text-[#EAE4D9] hover:text-[#F2BD52] transition-colors"
                            >
                              Détails
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                addToCart(item)
                              }}
                              className="btn-sheen rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A110B] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <ShoppingCart className="size-3" />
                              <span>Commander</span>
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

      </div>
    </section>
  )
}
