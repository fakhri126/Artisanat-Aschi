'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { publicApi, Product } from '@/lib/api'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

type Category = 'uniques' | 'modeles'

const MOCK_ITEMS: Record<Category, any[]> = {
  uniques: [
    {
      id: 1,
      name: 'Cabinet « Médina »',
      meta: 'Noyer massif · Pièce unique sculptée main',
      price: 'Sur demande',
      image: '/creation-unique.png',
    },
    {
      id: 2,
      name: 'Coffre « Kairouan »',
      meta: 'Bois & laiton · Édition unique',
      price: 'Sur demande',
      image: '/cat-chest.png',
    },
    {
      id: 3,
      name: "Porte d'apparat « Dar »",
      meta: 'Sculpture monumentale · Sur-mesure',
      price: 'Sur demande',
      image: '/cat-door.png',
    },
  ],
  modeles: [
    {
      id: 4,
      name: 'Miroir « Sidi Bou »',
      meta: 'Cadre sculpté · Reproductible',
      price: 'À partir de 1 900 DT',
      image: '/creation-model.png',
    },
    {
      id: 5,
      name: 'Buffet « Carthage »',
      meta: 'Noyer · Modèle signature',
      price: 'À partir de 4 200 DT',
      image: '/cat-buffet.png',
    },
    {
      id: 6,
      name: 'Meuble TV « Hammamet »',
      meta: 'Noyer sculpté · Reproductible',
      price: 'À partir de 2 600 DT',
      image: '/cat-tv.png',
    },
  ],
}

export function Creations() {
  const { addToCart } = useCart()
  const [tab, setTab] = useState<Category>('uniques')
  const [uniques, setUniques] = useState<Product[]>([])
  const [modeles, setModeles] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCreations() {
      try {
        const data = await publicApi.getProducts()
        setUniques(data.filter((p) => p.type === 'PIECE_UNIQUE'))
        setModeles(data.filter((p) => p.type === 'REPRODUCTIBLE'))
      } catch (err) {
        console.error('Error fetching creations from API, using fallback mock data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCreations()
  }, [])

  const currentItems = tab === 'uniques' ? uniques : modeles
  const fallbackItems = MOCK_ITEMS[tab]

  // Render items (dynamic or fallback)
  const displayItems = currentItems.length > 0 ? currentItems : fallbackItems

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

          <div className="mt-10 inline-flex rounded-full border border-border bg-background p-1.5">
            {(
              [
                { id: 'uniques', label: 'Pièces uniques' },
                { id: 'modeles', label: 'Modèles reproductibles' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300',
                  tab === t.id
                    ? 'bg-walnut text-walnut-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
          {displayItems.map((item, i) => {
            const isDynamic = 'id' in item && 'images' in item
            const name = item.name
            const image = isDynamic ? (item.images[0]?.imageUrl || '/placeholder.png') : item.image
            const meta = isDynamic ? `${item.materials || 'Bois noble'} · ${item.dimensions || 'Dimensions sur-mesure'}` : item.meta
            const price = isDynamic ? (item.price ? `${item.price.toLocaleString('fr-FR')} DT` : 'Sur demande') : item.price
            const link = isDynamic ? `/produits/${item.id}` : '#contact'

            return (
              <Reveal key={name} delay={i * 120}>
                <article className="group relative overflow-hidden bg-background">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={image || '/placeholder.svg'}
                      alt={name}
                      className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-walnut/80 via-transparent to-transparent opacity-70" />
                    {tab === 'uniques' && (
                      <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-walnut">
                        Pièce unique
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory text-left">
                    <h3 className="font-heading text-2xl font-medium">{name}</h3>
                    <p className="mt-1 text-sm font-light text-ivory/75">{meta}</p>
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
                            const productObj = isDynamic ? item : {
                              id: item.id,
                              name: item.name,
                              description: item.meta,
                              dimensions: '',
                              materials: '',
                              color: '',
                              price: tab === 'uniques' ? null : (item.id === 4 ? 1900 : item.id === 5 ? 4200 : 2600),
                              availability: tab === 'uniques' ? 'Disponible' : 'Sur commande',
                              type: tab === 'uniques' ? 'PIECE_UNIQUE' : 'REPRODUCTIBLE',
                              isFeatured: true,
                              category: { id: item.id, name: tab === 'uniques' ? 'Pièces uniques' : 'Modèles reproductibles', type: 'MOBILIER' },
                              images: [{ id: 1, imageUrl: item.image, isPrimary: true }]
                            }
                            addToCart(productObj as any)
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
      </div>
    </section>
  )
}
