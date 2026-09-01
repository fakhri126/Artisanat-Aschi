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
  'Lampes Coffres',
  'Lustres',
  'Porte Bijoux',
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

export function Catalog() {
  const [category, setCategory] = useState('Tout')
  const [color, setColor] = useState('Tout')
  const [dimensions, setDimensions] = useState('Tout')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true)
      try {
        const queryParams: any = { type: 'CATALOGUE' }
        if (category !== 'Tout') queryParams.category = category
        if (color !== 'Tout') queryParams.color = color
        if (dimensions !== 'Tout') queryParams.dimensions = dimensions

        const data = await publicApi.getProducts(queryParams)
        setProducts(data || [])
      } catch (err) {
        console.error('Error querying catalog from API:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadFilteredProducts()
  }, [category, color, dimensions])

  return (
    <section id="catalogue" className="bg-transparent py-10 text-[#F7F4EE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Filters Form */}
        <Reveal delay={80}>
          <div className="p-5 sm:p-6 rounded-3xl bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl max-w-4xl mx-auto space-y-4 shadow-xl">
            <div className="grid gap-3 sm:grid-cols-3 text-left">
              {/* Category Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#241812] border border-[#E6A635]/30 focus:border-[#E6A635] rounded-xl p-2.5 text-xs text-[#F7F4EE] outline-none transition-colors"
                >
                  {FILTERS_CAT.map(c => (
                    <option key={c} value={c} className="bg-[#241812] text-[#F7F4EE]">{c}</option>
                  ))}
                </select>
              </div>

              {/* Color Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">Finition / Couleur</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-[#241812] border border-[#E6A635]/30 focus:border-[#E6A635] rounded-xl p-2.5 text-xs text-[#F7F4EE] outline-none transition-colors"
                >
                  {FILTERS_COLOR.map(c => (
                    <option key={c} value={c} className="bg-[#241812] text-[#F7F4EE]">{c}</option>
                  ))}
                </select>
              </div>

              {/* Dimensions Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">Dimensions</label>
                <select
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="bg-[#241812] border border-[#E6A635]/30 focus:border-[#E6A635] rounded-xl p-2.5 text-xs text-[#F7F4EE] outline-none transition-colors"
                >
                  {FILTERS_DIM.map(d => (
                    <option key={d} value={d} className="bg-[#241812] text-[#F7F4EE]">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="pt-2 border-t border-[#E6A635]/20 flex items-start gap-2 text-[10px] text-[#EAE4D9]/70 italic text-left leading-normal">
              <AlertCircle className="size-3.5 text-[#F2BD52] shrink-0 mt-0.5" />
              <span>Certaines variantes visuelles sont générées par modélisation 3D pour illustrer les possibilités de personnalisation.</span>
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#EAE4D9]/60">
              Aucun modèle ne correspond à vos critères de filtrage.
            </div>
          ) : (
            products.map((model, i) => {
              const image = model.images?.[0]?.imageUrl || '/placeholder.png'
              const link = model.id >= 100 ? '/contact' : `/produits/${model.id}`

              return (
                <Reveal key={model.name} delay={(i % 3) * 80}>
                  <article className="group relative rounded-3xl bg-[#3B271C]/90 border border-[#E6A635]/35 p-3.5 hover:border-[#E6A635]/80 hover:bg-[#452E21]/95 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#241812] border border-[#E6A635]/25">
                      <img
                        src={image}
                        alt={model.name}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[#241812]/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Link
                          href={link}
                          className="btn-sheen flex w-44 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A110B] shadow-md"
                        >
                          <Eye className="size-3.5" /> Voir les détails
                        </Link>
                        <Link
                          href={`${link}?action=devis`}
                          className="flex w-44 items-center justify-center gap-2 rounded-full border border-[#E6A635]/50 bg-[#241812]/90 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F7F4EE] hover:bg-[#241812] transition-colors"
                        >
                          <MessageCircle className="size-3.5" /> Devis Modèle
                        </Link>
                        <Link
                          href="/custom-creation"
                          className="flex w-44 items-center justify-center gap-2 rounded-full border border-[#E6A635]/50 bg-[#241812]/90 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F7F4EE] hover:bg-[#241812] transition-colors"
                        >
                          <Sparkles className="size-3.5 text-[#F2BD52]" /> Créer Sur-Mesure
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-3 pb-1 px-1 text-left">
                      <div>
                        <h3 className="font-heading text-lg font-light text-[#F7F4EE] group-hover:text-[#F2BD52] transition-colors">{model.name}</h3>
                        <p className="text-xs text-[#EAE4D9]/70 font-light mt-0.5">{model.materials || 'Bois noble'}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold bg-[#241812] px-2.5 py-0.5 rounded-full border border-[#E6A635]/30">
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
