'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShoppingBag, Check, Info, X, Mail, Phone, RefreshCw, Layers } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi, Product } from '@/lib/api'

export interface HandleModel {
  id: string
  name: string
  category: 'large' | 'oval' | 'small'
  categoryLabel: string
  dimensions: string
  price: number
  desc: string
  image: string
  ideal: string
}

// 40 Individual models extracted directly from the artisan plaque photo
const ALL_HANDLES: HandleModel[] = [
  // --- GRANDS RONDS (6 - 7 cm) --- 28 TND
  {
    id: 'gr-1',
    name: 'Grand Rond "Riad Bleu & Ombre"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Céramique de majolique traditionnelle avec touches bleu cobalt et terre d\'ombre.',
    image: '/poignees/grand_rond_1.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },
  {
    id: 'gr-2',
    name: 'Grand Rond "Jasmin et Feuillage"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Motifs floraux ton sur ton peints à la main sur émail naturel ivoire.',
    image: '/poignees/grand_rond_2.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },
  {
    id: 'gr-3',
    name: 'Grand Rond "Lignes Ocre & Cobalt"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Décor géométrique aux nuances d\'ocre chaud et ruban bleu méditerranéen.',
    image: '/poignees/grand_rond_3.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },
  {
    id: 'gr-4',
    name: 'Grand Rond "Géométrie Andalouse"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Tracés bleus cobalt géométriques évoquant l\'architecture des palais.',
    image: '/poignees/grand_rond_4.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },
  {
    id: 'gr-5',
    name: 'Grand Rond "Graphisme Ocre & Noir"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Composition contemporaine contrastée sur fond terre cuite émaillée.',
    image: '/poignees/grand_rond_5.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },
  {
    id: 'gr-6',
    name: 'Grand Rond "Rameaux d\'Olivier"',
    category: 'large',
    categoryLabel: 'Grand Format (6-7 cm)',
    dimensions: 'Diamètre 6.5 cm',
    price: 28,
    desc: 'Feuillages verts et dorés stylisés inspirés de la nature méditerranéenne.',
    image: '/poignees/grand_rond_6.png',
    ideal: 'Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.'
  },

  // --- OVALES (7 x 4 cm) --- 32 TND
  {
    id: 'ov-1',
    name: 'Bouton Ovale "Arabesque Cobalt"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Forme galbée ovale avec volutes bleues sur céramique ivoire émaillée.',
    image: '/poignees/ovale_1.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 'ov-2',
    name: 'Bouton Ovale "Soleil d\'Or"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Rayons dorés et touches cobalt, courbes élégantes adaptées aux meubles de caractère.',
    image: '/poignees/ovale_2.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 'ov-3',
    name: 'Bouton Ovale "Frise Zellige"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Frise géométrique répétitive rappelant les carreaux traditionnels de Tunis.',
    image: '/poignees/ovale_3.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 'ov-4',
    name: 'Bouton Ovale "Bouquet Rose & Vert"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Motifs floraux délicats peints aux pigments naturels de rose et vert.',
    image: '/poignees/ovale_4.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 'ov-5',
    name: 'Bouton Ovale "Émail Sablé & Ombre"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Finition artisanale sablée douce aux nuances neutres et naturelles.',
    image: '/poignees/ovale_5.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 6,
    name: 'Bouton Ovale "Dunes Dorées"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Lignes diagonales ocre et bleu intense pour une touche d\'originalité.',
    image: '/poignees/ovale_6.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },
  {
    id: 'ov-7',
    name: 'Bouton Ovale "Bleu Océan"',
    category: 'oval',
    categoryLabel: 'Format Ovale (7x4 cm)',
    dimensions: '7 cm x 4 cm',
    price: 32,
    desc: 'Gouttes et motifs marins peints à la main en dégradé de bleu.',
    image: '/poignees/ovale_7.png',
    ideal: 'Idéal pour les dressings, les bahuts, les éléments de cuisine et portes moyennes.'
  },

  // --- PETITES POIGNÉES (3 - 4 cm) --- 18 TND (27 Modèles)
  ...Array.from({ length: 27 }).map((_, index) => {
    const row = Math.floor(index / 9) + 1
    const col = (index % 9) + 1
    return {
      id: `pt-${row}-${col}`,
      name: `Petite Poignée "Modèle Artisan N°${index + 1}"`,
      category: 'small' as const,
      categoryLabel: 'Petit Format (3-4 cm)',
      dimensions: 'Diamètre 3.5 cm',
      price: 18,
      desc: `Miniature céramique peinte à la main. Pièce d'artisanat unique N°${index + 1}.`,
      image: `/poignees/petite_${row}_${col}.png`,
      ideal: 'Idéal pour les armoires, éléments de cuisine, tables de nuit, bahuts et petites portes.'
    }
  })
]

const CATEGORIES = [
  { id: 'all', label: 'Tous les modèles (40)' },
  { id: 'large', label: 'Grands Ronds (6-7 cm)' },
  { id: 'oval', label: 'Format Ovale (7x4 cm)' },
  { id: 'small', label: 'Petites Poignées (3-4 cm)' }
]

export default function BijouxDePortePage() {
  const [filter, setFilter] = useState('all')
  const [selectedHandle, setSelectedHandle] = useState<HandleModel | null>(null)
  const [showInquiryModal, setShowInquiryModal] = useState(false)

  // Inquiry form states
  const [inquiryData, setInquiryData] = useState({
    qty: 6,
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredHandles = filter === 'all' 
    ? ALL_HANDLES 
    : ALL_HANDLES.filter(h => h.category === filter)

  const openInquiry = (handle: HandleModel) => {
    setSelectedHandle(handle)
    setInquiryData({
      qty: 6,
      fullName: '',
      email: '',
      phone: '',
      notes: ''
    })
    setShowInquiryModal(true)
    setSent(false)
    setError(null)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHandle) return
    setSubmitLoading(true)
    setError(null)

    const formattedMessage = `
[DEMANDE D'ACCESSOIRES - BIJOUX DE PORTE]
Modèle sélectionné : ${selectedHandle.name} (${selectedHandle.dimensions})
Prix unitaire : ${selectedHandle.price} TND
Quantité souhaitée : ${inquiryData.qty} pièces
Prix total estimé : ${selectedHandle.price * inquiryData.qty} TND

Notes ou demandes de teintes particulières :
${inquiryData.notes || 'Aucune note complémentaire.'}
`.trim()

    try {
      await publicApi.submitQuoteRequest({
        fullName: inquiryData.fullName,
        email: inquiryData.email,
        phoneNumber: inquiryData.phone,
        message: formattedMessage
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Une erreur s\'est produite lors de l\'envoi.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-walnut text-ivory">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="size-3.5" /> Collection Exclusive
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Les Bijoux de Porte
          </h1>
          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed font-light text-pretty">
            Chaque meuble d&apos;exception mérite ses ornements. Retrouvez ci-dessous nos <strong>40 modèles uniques</strong> de boutons et poignées en céramique de majolique tunisienne peints à la main.
          </p>
        </div>

        {/* Technical Showcase: Full Board Image & Specs */}
        <div className="grid gap-12 lg:grid-cols-12 items-center mb-20 w-full bg-stone-950/30 rounded-3xl p-6 md:p-10 border border-gold/15">
          {/* Main artisan board photo */}
          <Reveal className="lg:col-span-7 relative aspect-square rounded-2xl overflow-hidden border border-gold/20 shadow-2xl group/guide max-h-[520px]">
            <Image
              src="/bijoux-de-porte.jpg"
              alt="Planche officielle des Bijoux de Porte de l'Atelier Aschi"
              fill
              className="object-contain bg-stone-900"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover/guide:bg-black/0 transition-colors pointer-events-none" />
          </Reveal>

          {/* Tarification & Dimensions summary */}
          <Reveal delay={150} className="lg:col-span-5 text-left space-y-8">
            <div className="space-y-3">
              <h2 className="font-heading text-3xl text-white leading-tight">Guide des Tarifs &amp; Tailles</h2>
              <p className="text-sm text-ivory/70 font-light leading-relaxed">
                Nos créations sont façonnées une à une. Sélectionnez le modèle individuel ci-dessous pour passer votre commande ou demander une adaptation de motifs.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Grands Ronds (6-7 cm)</h4>
                  <p className="text-[11px] text-ivory/60 mt-0.5">Portes monumentales &amp; grands tiroirs</p>
                </div>
                <span className="font-heading text-xl text-gold font-bold">28 TND</span>
              </div>
              
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Format Ovale (7 x 4 cm)</h4>
                  <p className="text-[11px] text-ivory/60 mt-0.5">Dressings, bahuts &amp; cuisines</p>
                </div>
                <span className="font-heading text-xl text-gold font-bold">32 TND</span>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Petites Poignées (3-4 cm)</h4>
                  <p className="text-[11px] text-ivory/60 mt-0.5">Chevet, armoires &amp; tiroirs intimes</p>
                </div>
                <span className="font-heading text-xl text-gold font-bold">18 TND</span>
              </div>
            </div>

            <p className="text-[11px] text-ivory/50 italic">
              * Chaque pièce étant peinte à la main, d&apos;infimes variations de détails attestent de son authenticité artisanale.
            </p>
          </Reveal>
        </div>

        {/* Category filter tabs */}
        <Reveal delay={150} className="w-full flex justify-center mb-12">
          <div className="flex gap-2 p-1.5 bg-stone-950/40 border border-gold/15 rounded-full backdrop-blur-md overflow-x-auto max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                  filter === cat.id
                    ? 'bg-gold text-walnut shadow-md'
                    : 'text-ivory/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* 40 Individual Handle Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full mb-24 text-left">
          {filteredHandles.map((handle, idx) => (
            <motion.div
              key={handle.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (idx % 12) * 0.04 }}
              className="bg-stone-950/30 border border-gold/15 rounded-2xl overflow-hidden hover:border-gold/40 hover:bg-stone-950/60 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Preview Container */}
              <div className="p-4 flex flex-col items-center">
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-stone-900 border border-gold/20 shadow-md group-hover:scale-105 transition-transform duration-500 flex items-center justify-center p-2">
                  <Image
                    src={handle.image}
                    alt={handle.name}
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-white/10 pointer-events-none" />
                </div>

                <div className="mt-4 text-center space-y-1 w-full">
                  <span className="text-[9px] uppercase tracking-widest text-gold/80 bg-gold/10 px-2.5 py-0.5 rounded-full inline-block font-semibold">
                    {handle.dimensions}
                  </span>
                  <h3 className="font-heading text-lg text-white font-medium truncate pt-1">{handle.name}</h3>
                  <p className="text-[11px] text-ivory/60 line-clamp-2 font-light">{handle.desc}</p>
                </div>
              </div>

              {/* Bottom Price & Order action */}
              <div className="px-4 py-3.5 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-heading text-lg text-gold font-bold">{handle.price} TND</span>
                  <span className="text-[8px] text-ivory/40 uppercase tracking-wider">Prix unitaire</span>
                </div>
                
                <button
                  onClick={() => openInquiry(handle)}
                  className="inline-flex items-center gap-1.5 bg-gold text-walnut text-[10px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-full hover:scale-105 transition-all shadow-md"
                >
                  <ShoppingBag className="size-3" /> Commander
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Order Callout */}
        <Reveal delay={200} className="w-full">
          <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-gold/25 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-[0.2em] mb-6">
              <Sparkles className="size-3.5" /> Motif Personnalisé
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 max-w-2xl leading-tight">
              Commandez des motifs sur-mesure
            </h2>
            
            <p className="text-ivory/60 text-sm max-w-xl mb-8 leading-relaxed font-light text-pretty">
              Vous aménagez toute une villa ou un hôtel et souhaitez accorder la couleur exacte de la majolique avec vos tissus et boiseries ? Notre atelier peint vos poignées sur-mesure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact?subject=poignees-sur-mesure"
                className="inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:scale-[1.03]"
              >
                <Mail className="size-3.5" />
                Demander un motif sur-mesure
              </Link>
              
              <a
                href="tel:+21655743760"
                className="inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-white/10"
              >
                <Phone className="size-3.5 text-gold" />
                +216 55 743 760
              </a>
            </div>
          </div>
        </Reveal>

      </div>

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {showInquiryModal && selectedHandle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowInquiryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-stone-900 border border-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left text-ivory"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowInquiryModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/60 border border-gold/25 text-gold hover:bg-gold hover:text-walnut transition-colors"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="relative w-16 h-16 rounded-2xl border border-gold/30 overflow-hidden bg-stone-950 shrink-0 p-1">
                  <Image 
                    src={selectedHandle.image} 
                    alt={selectedHandle.name} 
                    fill 
                    className="object-contain p-1" 
                  />
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-white leading-tight">{selectedHandle.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">{selectedHandle.dimensions}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-xs text-gold font-bold">{selectedHandle.price} TND / pièce</span>
                  </div>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-8 space-y-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center">
                    <Check className="size-6" />
                  </div>
                  <h4 className="font-heading text-xl text-gold">Commande transmise</h4>
                  <p className="text-xs text-ivory/70 leading-relaxed font-light">
                    Nous avons bien enregistré votre demande pour <strong>{inquiryData.qty}x {selectedHandle.name}</strong> (Montant estimé : {selectedHandle.price * inquiryData.qty} TND). L&apos;atelier vous recontactera sous 48h pour confirmer la livraison.
                  </p>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    className="mt-4 rounded-full border border-gold px-6 py-2.5 text-[10px] uppercase tracking-widest text-gold hover:bg-gold hover:text-walnut transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 p-3 rounded-lg">{error}</p>}
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Quantité souhaitée *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={inquiryData.qty}
                        onChange={(e) => setInquiryData({ ...inquiryData, qty: parseInt(e.target.value) || 0 })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 justify-end">
                      <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20 text-right">
                        <span className="text-[9px] uppercase tracking-wider text-ivory/50 block">Total Estimé</span>
                        <span className="font-heading text-lg text-gold font-bold">{selectedHandle.price * inquiryData.qty} TND</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={inquiryData.fullName}
                      onChange={(e) => setInquiryData({ ...inquiryData, fullName: e.target.value })}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Email *</label>
                      <input
                        type="email"
                        required
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Notes ou personnalisation</label>
                    <textarea
                      rows={3}
                      value={inquiryData.notes}
                      onChange={(e) => setInquiryData({ ...inquiryData, notes: e.target.value })}
                      placeholder="Ex: besoin d'adapter le motif en vert émeraude, ou préciser pour quel meuble..."
                      className="resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-gold transition-colors text-xs font-light text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-gold text-walnut py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-2"
                  >
                    {submitLoading ? 'Traitement...' : 'Valider ma commande'}
                  </button>
                </form>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
