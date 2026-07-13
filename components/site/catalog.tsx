'use client'

import { useState, useEffect } from 'react'
import { Eye, MessageCircle, Sparkles, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { publicApi, Product, Category } from '@/lib/api'
import Link from 'next/link'

const FILTERS_CAT = [
  'Tout',
  'Buffets',
  'Meubles TV',
  'Miroirs',
  'Portes',
  'Coffres',
  'Décoration',
  'Tables'
]

const FILTERS_COLOR = [
  'Tout',
  'Noyer',
  'Bleu',
  'Or',
  'Naturel',
  'Blanc Cérusé'
]

const FILTERS_DIM = [
  'Tout',
  '180 x 50 x 85 cm',
  '160 x 40 x 55 cm',
  '80 x 120 cm',
  '120 x 45 x 160 cm',
  '90 x 50 x 55 cm'
]

const MOCK_MODELS = [
  {
    id: 5,
    name: 'Buffet Carthage',
    category: { name: 'Buffets' },
    images: [{ imageUrl: '/cat-buffet.png' }],
    description: "Buffet en noyer massif aux portes finement sculptées de motifs arabesques. Une pièce maîtresse pour salle à manger d'exception.",
    materials: 'Noyer massif',
    dimensions: '180 x 50 x 85 cm',
    color: 'Noyer'
  },
  {
    id: 6,
    name: 'Meuble TV Hammamet',
    category: { name: 'Meubles TV' },
    images: [{ imageUrl: '/cat-tv.png' }],
    description: 'Meuble bas tout en élégance, alliant rangements discrets et sculptures traditionnelles. Disponible en plusieurs dimensions.',
    materials: 'Bois de frêne',
    dimensions: '160 x 40 x 55 cm',
    color: 'Blanc Cérusé'
  },
  {
    id: 4,
    name: 'Miroir Sidi Bou',
    category: { name: 'Miroirs' },
    images: [{ imageUrl: '/creation-model.png' }],
    description: "Miroir au cadre sculpté rehaussé de feuille d'or. Reflète la lumière et la noblesse de l'artisanat tunisien.",
    materials: 'Bois d\'olivier',
    dimensions: '80 x 120 cm',
    color: 'Or'
  },
  {
    id: 3,
    name: 'Porte Dar El Bey',
    category: { name: 'Portes' },
    images: [{ imageUrl: '/cat-door.png' }],
    description: 'Porte artistique aux gravures géométriques profondes. Une entrée qui raconte une histoire dès le premier regard.',
    materials: 'Chêne',
    dimensions: '220 x 140 cm',
    color: 'Noyer'
  },
  {
    id: 2,
    name: 'Coffre Kairouan',
    category: { name: 'Coffres' },
    images: [{ imageUrl: '/cat-chest.png' }],
    description: 'Coffre en bois sculpté et ferronnerie de laiton. Idéal pour conserver vos trésors avec élégance.',
    materials: 'Cèdre',
    dimensions: '90 x 50 x 55 cm',
    color: 'Or'
  },
  {
    id: 8,
    name: 'Panneau Médina',
    category: { name: 'Décoration' },
    images: [{ imageUrl: '/cat-deco.png' }],
    description: 'Panneau mural et console décorative aux ornements arabesques. Sublime un mur ou une entrée.',
    materials: 'Chêne',
    dimensions: '100 x 200 cm',
    color: 'Bleu'
  }
]

export function Catalog() {
  const [category, setCategory] = useState('Tout')
  const [color, setColor] = useState('Tout')
  const [dimensions, setDimensions] = useState('Tout')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFilteredProducts() {
      try {
        setLoading(true)
        const params = {
          category: category === 'Tout' ? undefined : category,
          color: color === 'Tout' ? undefined : color,
          dimensions: dimensions === 'Tout' ? undefined : dimensions,
        }
        const data = await publicApi.getProducts(params)
        setProducts(data)
      } catch (err) {
        console.error('Error querying catalog from API, using fallback data:', err)
        // Client side filtering for fallback
        let filtered = MOCK_MODELS
        if (category !== 'Tout') {
          filtered = filtered.filter(p => p.category.name === category)
        }
        if (color !== 'Tout') {
          filtered = filtered.filter(p => p.color === color)
        }
        if (dimensions !== 'Tout') {
          filtered = filtered.filter(p => p.dimensions.includes(dimensions))
        }
        setProducts(filtered as any)
      } finally {
        setLoading(false)
      }
    }
    loadFilteredProducts()
  }, [category, color, dimensions])

  return (
    <section id="catalogue" className="bg-walnut py-24 text-walnut-foreground md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-luxury text-gold">
            Catalogue d&apos;inspiration
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-ivory">
            Nos créations passées, sources d&apos;inspiration
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-walnut-foreground/70">
            Parcourez les modèles déjà réalisés. Choisissez-en un tel quel, ou
            laissez-le inspirer votre propre création sur-mesure.
          </p>
        </Reveal>

        {/* Dynamic Filters Form */}
        <Reveal delay={120}>
          <div className="mt-12 p-6 rounded-2xl bg-zinc-950/20 border border-gold/15 backdrop-blur-sm max-w-4xl mx-auto space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 text-left">
              {/* Category Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold font-semibold">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-walnut/40 border border-gold/10 focus:border-gold/50 rounded-lg p-2.5 text-xs text-ivory outline-none transition-colors"
                >
                  {FILTERS_CAT.map(c => (
                    <option key={c} value={c} className="bg-walnut text-ivory">{c}</option>
                  ))}
                </select>
              </div>

              {/* Color Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold font-semibold">Couleur</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-walnut/40 border border-gold/10 focus:border-gold/50 rounded-lg p-2.5 text-xs text-ivory outline-none transition-colors"
                >
                  {FILTERS_COLOR.map(c => (
                    <option key={c} value={c} className="bg-walnut text-ivory">{c}</option>
                  ))}
                </select>
              </div>

              {/* Dimensions Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold font-semibold">Dimensions</label>
                <select
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="bg-walnut/40 border border-gold/10 focus:border-gold/50 rounded-lg p-2.5 text-xs text-ivory outline-none transition-colors"
                >
                  {FILTERS_DIM.map(d => (
                    <option key={d} value={d} className="bg-walnut text-ivory">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="pt-2 border-t border-gold/10 flex items-start gap-2 text-[10px] text-walnut-foreground/60 italic text-left leading-normal">
              <AlertCircle className="size-3.5 text-gold shrink-0 mt-0.5" />
              <span>Certaines variantes visuelles sont générées par intelligence artificielle et peuvent ne pas représenter des réalisations existantes.</span>
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground/60">
              Aucun modèle ne correspond à vos critères de filtrage.
            </div>
          ) : (
            products.map((model, i) => {
              const image = model.images?.[0]?.imageUrl || '/placeholder.png'
              const link = `/produits/${model.id}`

              return (
                <Reveal key={model.name} delay={(i % 3) * 100}>
                  <article className="group relative overflow-hidden">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-950/20 border border-gold/5">
                      <img
                        src={image}
                        alt={model.name}
                        className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-walnut/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 opacity-0 transition-all duration-500 group-hover:opacity-100">
                        <Link
                          href={link}
                          className="flex w-48 items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-walnut transition-colors hover:bg-ivory"
                        >
                          <Eye className="size-4" /> Voir les détails
                        </Link>
                        <Link
                          href={`${link}?action=devis`}
                          className="flex w-48 items-center justify-center gap-2 rounded-full border border-ivory/70 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold"
                        >
                          <MessageCircle className="size-4" /> Demander ce modèle
                        </Link>
                        <Link
                          href={`${link}?action=personnaliser`}
                          className="flex w-48 items-center justify-center gap-2 rounded-full border border-ivory/70 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold"
                        >
                          <Sparkles className="size-4" /> Personnaliser
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between py-4 text-left">
                      <div>
                        <h3 className="font-heading text-2xl font-light text-ivory">{model.name}</h3>
                        <p className="text-xs text-walnut-foreground/50 mt-1">{model.materials || 'Bois noble'}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.14em] text-gold font-medium">
                        {model.category?.name}
                      </span>
                    </div>
                  </article>
                </Reveal>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
