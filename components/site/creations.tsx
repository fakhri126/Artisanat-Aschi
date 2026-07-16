'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { publicApi, Product, Category } from '@/lib/api'
import Link from 'next/link'
import { ShoppingCart, Sparkles, Flame } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function Creations() {
  const { addToCart } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products and categories
        const [prodData, catData] = await Promise.all([
          publicApi.getProducts(),
          publicApi.getCategories()
        ])

        // Only keep available products (not catalog/inspiration ones)
        const availableProds = prodData.filter((p) => p.type !== 'CATALOGUE')
        setAllProducts(availableProds)

        // Get unique category names from both DB categories and existing products
        const catNames = new Set<string>()
        catData.forEach(c => catNames.add(c.name))
        availableProds.forEach(p => {
          if (p.category?.name) catNames.add(p.category.name)
        })

        setCategories(['Tout', 'Pièces uniques', ...Array.from(catNames)])
      } catch (err) {
        console.error('Error fetching creations data:', err)
        // Fallback categories if API fails
        setCategories(['Tout', 'Pièces uniques', 'Buffets', 'Meubles TV', 'Miroirs', 'Portes', 'Coffres', 'Décoration', 'Tables'])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'Tout'
    ? allProducts
    : selectedCategory === 'Pièces uniques'
      ? allProducts.filter(p => p.type === 'PIECE_UNIQUE')
      : allProducts.filter(p => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <section id="creations" className="bg-secondary py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-luxury text-bronze">
            Créations disponibles
          </p>
          <h2 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
            Des œuvres prêtes à rejoindre votre demeure
          </h2>

          {/* Category Tabs */}
          {!loading && categories.length > 1 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-4xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300 border',
                    selectedCategory === cat
                      ? 'bg-walnut text-walnut-foreground border-walnut shadow-md'
                      : 'bg-background/50 border-border text-muted-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </Reveal>

        <div className="mt-16">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <p className="text-lg">Aucun produit disponible dans cette catégorie pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {filteredProducts.map((item, i) => {
                const name = item.name
                const image = item.images?.[0]?.imageUrl || '/placeholder.png'
                const meta = `${item.materials || 'Bois noble'} · ${item.dimensions || 'Dimensions sur-mesure'}`
                const price = item.price ? `${item.price.toLocaleString('fr-FR')} DT` : 'Sur demande'
                const link = `/produits/${item.id}`
                const isUnique = item.type === 'PIECE_UNIQUE'

                return (
                  <Reveal key={item.id} delay={i * 100}>
                    <article className={cn(
                      "group relative overflow-hidden bg-background rounded-sm shadow-sm transition-all duration-500 border",
                      isUnique 
                        ? "border-orange-500/40 hover:border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] z-10 hover:z-20 transform hover:-translate-y-1" 
                        : "border-border hover:border-muted hover:-translate-y-1 transition-transform"
                    )}>
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={image}
                          alt={name}
                          className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-walnut/80 via-transparent to-transparent opacity-70" />
                        
                        {isUnique && (
                          <>
                            {/* Cadre incandescent façon feu */}
                            <div className="absolute inset-2.5 border-[1.5px] border-orange-500/30 pointer-events-none transition-all duration-700 ease-out group-hover:inset-1.5 group-hover:border-orange-500/80 z-10 shadow-[inset_0_0_15px_rgba(249,115,22,0.2)] group-hover:shadow-[inset_0_0_30px_rgba(249,115,22,0.6)] mix-blend-screen" />
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-red-500/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 mix-blend-overlay pointer-events-none z-10" />
                          </>
                        )}
                        
                        {isUnique && (
                          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] ring-1 ring-orange-400/50 z-20 transition-transform duration-500 group-hover:scale-105">
                            <Flame className="size-3 animate-pulse text-yellow-300" />
                            Pièce unique
                          </span>
                        )}
                        {item.type === 'REPRODUCTIBLE' && (
                          <span className="absolute left-4 top-4 rounded-full bg-sand px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-walnut">
                            Modèle reproductible
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory text-left">
                        <span className="text-[10px] uppercase tracking-widest text-gold/80 block mb-1">
                          {item.category?.name || 'Création'}
                        </span>
                        <h3 className="font-heading text-2xl font-medium">{name}</h3>
                        <p className="mt-1 text-sm font-light text-ivory/75">{meta}</p>
                        
                        {isUnique && (
                          <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-2.5 flex items-center gap-1.5 bg-gradient-to-r from-orange-900/40 to-red-900/20 px-2 py-1.5 rounded border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                            <Flame className="size-3 text-orange-500 animate-pulse shrink-0" />
                            Grande opportunité · À saisir !
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between border-t border-ivory/20 pt-4">
                          <span className="text-sm tracking-wide text-gold">{price}</span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={link}
                              className="text-xs uppercase tracking-[0.16em] text-ivory underline-offset-4 transition-colors hover:text-gold hover:underline font-semibold"
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
                              className="rounded-full bg-gold/10 hover:bg-gold border border-gold/30 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold hover:text-walnut transition-all flex items-center gap-1.5"
                            >
                              <ShoppingCart className="size-3" /> Acheter
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
