'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShoppingBag, Check, Info, X, ChevronRight, Mail, Phone, RefreshCw } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi, Product } from '@/lib/api'

const FALLBACK_MODELS: Product[] = [
  {
    id: 991,
    name: 'Bouton Riad Bleu',
    description: 'Majolique traditionnelle peinte à la main, motifs d\'arabesques bleu de cobalt et traits de terre d\'ombre. Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.',
    dimensions: 'Diamètre 6-7 cm',
    materials: 'Céramique de majolique',
    color: 'Bleu cobalt',
    price: 28,
    availability: 'Disponible',
    type: 'REPRODUCTIBLE',
    isFeatured: true,
    category: { id: 99, name: 'Grands Ronds' },
    images: [{ id: 9911, imageUrl: '/handle-knob.png', isPrimary: true }]
  },
  {
    id: 992,
    name: 'Bouton Soleil d\'Or',
    description: 'Bouton ovale aux courbes généreuses, peint de rayons chauds ocre-jaune et de fines lignes cobalt. Idéal pour les dressings, les bahuts et les portes moyennes.',
    dimensions: '7 cm x 4 cm',
    materials: 'Céramique de majolique',
    color: 'Ocre-jaune',
    price: 32,
    availability: 'Disponible',
    type: 'REPRODUCTIBLE',
    isFeatured: true,
    category: { id: 99, name: 'Ovales' },
    images: [{ id: 9922, imageUrl: '/handle-knob.png', isPrimary: true }]
  },
  {
    id: 993,
    name: 'Bouton Jasmin Sauvage',
    description: 'Miniature délicate peinte à la main de rameaux d\'olivier et de fleurs de jasmin vert et bleu sur un émail ivoire lisse.',
    dimensions: 'Diamètre 3-4 cm',
    materials: 'Céramique de majolique',
    color: 'Ivoire, vert, bleu',
    price: 18,
    availability: 'Disponible',
    type: 'REPRODUCTIBLE',
    isFeatured: true,
    category: { id: 99, name: 'Petites Poignées' },
    images: [{ id: 9933, imageUrl: '/handle-knob.png', isPrimary: true }]
  }
]

const CATEGORIES = [
  { id: 'all', label: 'Toutes les tailles' },
  { id: 'Grands Ronds', label: 'Grand format (6-7 cm)' },
  { id: 'Ovales', label: 'Format Ovale (7x4 cm)' },
  { id: 'Petites Poignées', label: 'Petit format (3-4 cm)' }
]

export default function BijouxDePortePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
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

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await publicApi.getProducts()
        // Filter handle products (matching category name)
        const handles = data.filter(p => 
          p.category.name === "Bijoux de Porte" || 
          p.category.name === "Grands Ronds" || 
          p.category.name === "Ovales" || 
          p.category.name === "Petites Poignées"
        )
        if (handles.length > 0) {
          setProducts(handles)
        } else {
          setProducts(FALLBACK_MODELS)
        }
      } catch (err) {
        console.error('Error fetching handles, loading fallbacks:', err)
        setProducts(FALLBACK_MODELS)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category.name === filter)

  const openInquiry = (product: Product) => {
    setSelectedProduct(product)
    setInquiryData({
      qty: 6,
      fullName: '',
      email: '',
      phone: '',
      notes: ''
    })
    setSent(false)
    setError(null)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    setSubmitLoading(true)
    setError(null)

    const formattedMessage = `
[DEMANDE D'ACCESSOIRES - BIJOUX DE PORTE]
Modèle : ${selectedProduct.name}
Dimensions : ${selectedProduct.dimensions}
Matériaux : ${selectedProduct.materials}
Quantité souhaitée : ${inquiryData.qty} pièces

Notes complémentaires :
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
            <Sparkles className="size-3.5" /> Les Bijoux de Porte
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Les Bijoux de Porte
          </h1>
          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed font-light text-pretty">
            Chaque meuble d&apos;exception mérite ses ornements. Façonnés en relief et peints un à un à la main, nos boutons et poignées en céramique de majolique tunisienne apportent la touche finale d&apos;art et de couleur à vos pièces de menuiserie.
          </p>
        </div>

        {/* Technical Showcase: Image & Specs */}
        <div className="grid gap-12 lg:grid-cols-12 items-center mb-24 w-full bg-stone-950/20 rounded-3xl p-6 md:p-10 border border-gold/10">
          {/* Large layout image */}
          <Reveal className="lg:col-span-7 relative aspect-square rounded-2xl overflow-hidden border border-gold/15 shadow-2xl group/guide max-h-[500px]">
            <Image
              src="/bijoux-de-porte.jpg"
              alt="Catalogue de poignées artisanales en céramique"
              fill
              className="object-contain bg-stone-900"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover/guide:bg-black/0 transition-colors pointer-events-none" />
          </Reveal>

          {/* Description list */}
          <Reveal delay={150} className="lg:col-span-5 text-left space-y-8">
            <div className="space-y-3">
              <h2 className="font-heading text-3xl text-white leading-tight">L&apos;Ornement Signature</h2>
              <p className="text-sm text-ivory/70 font-light leading-relaxed">
                Nos modèles s&apos;organisent en trois calibres précis. Chacun est conçu pour s&apos;ajuster harmonieusement à l&apos;échelle de vos tiroirs, dressings ou grandes portes de demeure.
              </p>
            </div>

            <div className="space-y-5 border-t border-white/10 pt-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Les Grands Ronds (6-7 cm)</h4>
                  <p className="text-xs text-ivory/60 mt-1 font-light leading-relaxed">Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Les Ovales (7 x 4 cm)</h4>
                  <p className="text-xs text-ivory/60 mt-1 font-light leading-relaxed">Idéal pour les dressings, les bahuts, les éléments de cuisine ainsi que les petites et moyennes portes.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Les Petites Poignées (3-4 cm)</h4>
                  <p className="text-xs text-ivory/60 mt-1 font-light leading-relaxed">Idéal pour les armoires, les éléments de cuisine, les tables de nuit et les petites portes.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Filter categories tabs */}
        <Reveal delay={150} className="w-full flex justify-center mb-10">
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

        {/* Product listing cards */}
        {loading ? (
          <div className="py-20 flex justify-center w-full">
            <RefreshCw className="size-8 animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full mb-24 text-left">
            {filteredProducts.map((model, idx) => (
              <Reveal key={model.id} delay={idx * 100}>
                <div className="bg-stone-950/20 border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:bg-stone-950/30 transition-all duration-300 flex flex-col h-full justify-between">
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Circle visual mockup of the knob patterns */}
                      <div className="relative w-28 h-28 mx-auto rounded-full border-2 border-gold/30 overflow-hidden shadow-lg bg-stone-900 group cursor-pointer">
                        <Image
                          src={model.images[0]?.imageUrl || '/handle-knob.png'}
                          alt={model.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/15 via-transparent to-white/10 pointer-events-none" />
                      </div>

                      <div className="space-y-1.5 text-center">
                        <h3 className="font-heading text-xl text-white font-medium">{model.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider text-gold/80 bg-gold/10 px-3 py-0.5 rounded-full inline-block font-semibold">
                          {model.dimensions}
                        </span>
                      </div>

                      <p className="text-xs text-ivory/70 leading-relaxed font-light text-center pt-2">
                        {model.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="font-heading text-lg text-gold font-semibold">
                      {model.price ? `${model.price} TND` : 'Sur Devis'}
                      <span className="text-[9px] text-ivory/50 font-sans ml-1">/ pièce</span>
                    </span>
                    <button
                      onClick={() => openInquiry(model)}
                      className="inline-flex items-center gap-1.5 bg-gold text-walnut text-[10px] font-bold uppercase tracking-widest px-4.5 py-2.5 rounded-full hover:scale-105 transition-all shadow-md"
                    >
                      <ShoppingBag className="size-3.5" /> Commander
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Dynamic CTA at the bottom */}
        <Reveal delay={200} className="w-full">
          <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-gold/25 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-gold/5 blur-[120px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-[0.2em] mb-6">
              <Sparkles className="size-3.5" /> Conception Unique
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 max-w-2xl leading-tight">
              Personnalisez vos boutons et décors
            </h2>
            
            <p className="text-ivory/60 text-sm max-w-xl mb-8 leading-relaxed font-light text-pretty">
              Vous avez un projet de cuisine, de dressing ou de portes entières et souhaitez accorder les teintes et motifs de la céramique avec vos boiseries ? Nos artisans créent des motifs sur-mesure pour votre projet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact?subject=bijoux-porte-sur-mesure"
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
        {showInquiryModal && selectedProduct && (
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

              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="relative w-14 h-14 rounded-full border border-gold/30 overflow-hidden bg-stone-950 shrink-0">
                  <Image 
                    src={selectedProduct.images[0]?.imageUrl || '/handle-knob.png'} 
                    alt={selectedProduct.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-white">{selectedProduct.name}</h3>
                  <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">{selectedProduct.dimensions}</p>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-8 space-y-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center">
                    <Check className="size-6" />
                  </div>
                  <h4 className="font-heading text-xl text-gold">Demande de prix transmise</h4>
                  <p className="text-xs text-ivory/70 leading-relaxed font-light">
                    Nous avons bien reçu votre intérêt pour le modèle <strong>{selectedProduct.name}</strong>. Nos artisans vous recontacteront par e-mail ou téléphone sous 48h pour valider votre commande.
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
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Quantité souhaitée *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={inquiryData.qty}
                      onChange={(e) => setInquiryData({ ...inquiryData, qty: parseInt(e.target.value) || 0 })}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-gold transition-colors text-white"
                    />
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
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Téléphone</label>
                      <input
                        type="tel"
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Notes ou couleurs sur-mesure</label>
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
                    {submitLoading ? 'Traitement...' : 'Soumettre ma demande'}
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
