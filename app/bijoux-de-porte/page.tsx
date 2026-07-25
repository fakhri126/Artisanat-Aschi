'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronLeft, ChevronRight, Leaf, Palette, HeartHandshake, Check, X, Mail, Phone, Heart } from 'lucide-react'
import { publicApi, Product } from '@/lib/api'

export interface HandleModel {
  id: string
  name: string
  category: string
  categoryLabel: string
  dimensions: string
  price: number
  desc: string
  image: string
  ideal: string
}

export default function BijouxDePortePage() {
  const [filter, setFilter] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  
  const [apiHandles, setApiHandles] = useState<HandleModel[]>([])
  const [categories, setCategories] = useState<{id: string, label: string}[]>([
    { id: 'all', label: 'Toute la Collection' }
  ])
  const [loading, setLoading] = useState(true)

  // Inquiry Form State
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [selectedHandle, setSelectedHandle] = useState<HandleModel | null>(null)
  const [inquiryData, setInquiryData] = useState({ qty: 6, fullName: '', email: '', phone: '', notes: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const products = await publicApi.getProducts()
        
        const isHandleProduct = (p: Product) => {
          const catName = p.category?.name?.toLowerCase() || ''
          const mat = p.materials?.toLowerCase() || ''
          const name = p.name?.toLowerCase() || ''
          return (
            catName.includes("porte") || 
            catName.includes("ronds") || 
            catName.includes("ovales") || 
            catName.includes("poignée") ||
            mat.includes("céramique") || 
            mat.includes("majolique") ||
            name.includes("bouton") || 
            name.includes("poignée")
          )
        }

        const uniqueCategories = new Map<string, string>()
        uniqueCategories.set('all', 'Toute la Collection')

        const handlesFromApi = products.filter(isHandleProduct).map((p, idx) => {
          const catId = p.category?.id?.toString() || 'default'
          const catName = p.category?.name || 'Poignées'

          if (!uniqueCategories.has(catId)) {
            uniqueCategories.set(catId, catName)
          }

          const woodImage = `/poignees/new_knob_${(idx % 25) + 1}.jpg`

          return {
            id: p.id.toString(),
            name: p.name,
            category: catId,
            categoryLabel: catName,
            dimensions: p.dimensions || "Dimensions standards",
            price: p.price || 0,
            desc: p.description || "Une magnifique création artisanale en céramique Majolique.",
            image: p.image_url && p.image_url.trim() !== '' ? p.image_url : woodImage,
            ideal: p.style || "Idéal pour décorer vos portes et tiroirs."
          }
        })

        const categoryArray = Array.from(uniqueCategories.entries()).map(([id, label]) => ({ id, label }))

        setCategories(categoryArray)
        setApiHandles(handlesFromApi)
      } catch (error) {
        console.error("Erreur lors du chargement des poignées:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredHandles = filter === 'all' ? apiHandles : apiHandles.filter(h => h.category === filter)
  const currentHandle = filteredHandles[activeIndex]

  useEffect(() => {
    setActiveIndex(0)
  }, [filter])

  const nextHandle = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % filteredHandles.length)
  }

  const prevHandle = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + filteredHandles.length) % filteredHandles.length)
  }

  const openInquiry = (handle: HandleModel) => {
    setSelectedHandle(handle)
    setShowInquiryModal(true)
    setSent(false)
    setError(null)
  }

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHandle) return
    setSubmitLoading(true)
    setError(null)
    
    try {
      const message = `[Demande de réservation] Modèle: ${selectedHandle.name}\nCatégorie: ${selectedHandle.categoryLabel}\nQuantité souhaitée: ${inquiryData.qty}\n\nNotes: ${inquiryData.notes}`
      
      await publicApi.submitQuoteRequest({
        fullName: inquiryData.fullName,
        email: inquiryData.email,
        phoneNumber: inquiryData.phone,
        message: message,
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return null

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#3A2A21] font-sans relative overflow-hidden">
      
      {/* Soft Organic Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8DCCB]/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DFD3C3]/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <Navbar />

      {/* Warm Adorable Header */}
      <div className="pt-32 pb-12 flex flex-col items-center text-center px-4 relative z-10">
        <div className="inline-flex items-center justify-center gap-3 mb-6">
          <Leaf className="size-5 text-[#C17D59]" />
          <span className="text-[#C17D59] uppercase tracking-[0.2em] text-xs font-semibold">Artisanat Doux</span>
          <Leaf className="size-5 text-[#C17D59] scale-x-[-1]" />
        </div>
        <h1 className="font-serif italic text-5xl md:text-7xl mb-4 text-[#2C1E16]">
          Bijoux de Porte
        </h1>
        <p className="text-[#5A453A] max-w-lg text-sm md:text-base font-light leading-relaxed">
          Ajoutez une touche de poésie à votre intérieur avec nos poignées façonnées et peintes à la main, un véritable travail d'amour et de patience.
        </p>
      </div>

      {/* Categories (Soft Pills) */}
      <div className="w-full flex justify-center mb-16 px-4 relative z-10">
        <div className="flex gap-3 overflow-x-auto max-w-full pb-4 px-2 snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-[2rem] text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 snap-center shrink-0 border ${
                filter === cat.id
                  ? 'bg-[#C17D59] text-white border-[#C17D59] shadow-[0_5px_15px_rgba(193,125,89,0.3)]'
                  : 'bg-white/60 text-[#5A453A] border-[#E8DCCB] hover:bg-white hover:border-[#C17D59]/50 hover:text-[#C17D59]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Soft Gallery Display */}
      {filteredHandles.length > 0 && currentHandle && (
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[50vh] pb-32 px-4 w-full max-w-6xl mx-auto z-10">
          
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 bg-white/40 p-6 md:p-12 rounded-[3rem] backdrop-blur-sm border border-white/60 shadow-[0_20px_60px_rgba(58,42,33,0.05)]">
            
            {/* Visual (Organic Frame) */}
            <div className="w-full md:w-1/2 flex justify-center relative">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentHandle.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 30 : -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -30 : 30, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] group"
                >
                  {/* Organic irregular blob background effect */}
                  <div className="absolute inset-0 bg-[#E8DCCB] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_20s_linear_infinite] opacity-50 group-hover:bg-[#C17D59]/20 transition-colors duration-1000" />
                  
                  <div className="absolute inset-4 rounded-full overflow-hidden border-[6px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    <Image
                      src={currentHandle.image}
                      alt={currentHandle.name}
                      fill
                      className="object-cover transition-transform duration-[6s] ease-out group-hover:scale-110"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product Details (Soft typography) */}
            <div className="w-full md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHandle.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full flex flex-col gap-6"
                >
                  <div>
                    <h2 className="font-serif text-4xl sm:text-5xl text-[#2C1E16] mb-3">
                      {currentHandle.name}
                    </h2>
                    <p className="text-[#C17D59] font-medium tracking-[0.1em] text-sm uppercase">
                      {currentHandle.categoryLabel}
                    </p>
                  </div>

                  <p className="text-[#5A453A] font-light leading-relaxed">
                    {currentHandle.desc}
                  </p>

                  <div className="flex flex-col gap-3 py-6 border-y border-[#E8DCCB]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#8C7A6B] uppercase tracking-wider text-[10px] font-bold">Dimensions</span>
                      <span className="text-[#2C1E16] font-medium">{currentHandle.dimensions}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#8C7A6B] uppercase tracking-wider text-[10px] font-bold">Prix Unitaire</span>
                      <span className="text-[#2C1E16] font-medium text-lg">{currentHandle.price} DT</span>
                    </div>
                  </div>

                  {/* Trust Badges (Adorable) */}
                  <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-[#E8DCCB]">
                      <Heart className="size-3 text-[#C17D59]" />
                      <span className="text-[10px] font-semibold text-[#5A453A] uppercase tracking-wider">Fait main</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-[#E8DCCB]">
                      <Palette className="size-3 text-[#C17D59]" />
                      <span className="text-[10px] font-semibold text-[#5A453A] uppercase tracking-wider">Peint à la main</span>
                    </div>
                  </div>

                  <div className="pt-4 w-full flex justify-center md:justify-start">
                    <button
                      onClick={() => openInquiry(currentHandle)}
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#2C1E16] text-white rounded-full hover:bg-[#C17D59] transition-colors duration-300 shadow-lg hover:shadow-xl w-full md:w-auto font-medium tracking-wide"
                    >
                      <ShoppingBag className="size-5" />
                      <span>Réserver ma pièce</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>

          {/* Navigation Controls (Cute buttons) */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 w-full flex justify-between px-2 md:px-8 pointer-events-none">
            <button 
              onClick={prevHandle}
              className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white text-[#3A2A21] shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-[#E8DCCB] hover:bg-[#FAF7F2] hover:scale-110 transition-all duration-300"
            >
              <ChevronLeft className="size-6 md:size-8" />
            </button>
            <button 
              onClick={nextHandle}
              className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white text-[#3A2A21] shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-[#E8DCCB] hover:bg-[#FAF7F2] hover:scale-110 transition-all duration-300"
            >
              <ChevronRight className="size-6 md:size-8" />
            </button>
          </div>

        </div>
      )}

      {filteredHandles.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center pb-32">
          <p className="text-[#8C7A6B] font-light text-lg">Aucune création trouvée dans cette catégorie.</p>
        </div>
      )}

      {/* Soft Modal */}
      <AnimatePresence>
        {showInquiryModal && selectedHandle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1E16]/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#FAF7F2] rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#3A2A21] shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="w-full md:w-2/5 h-48 md:h-auto relative bg-[#E8DCCB]">
                <Image src={selectedHandle.image} alt={selectedHandle.name} fill className="object-cover" />
              </div>

              <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto">
                {sent ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <Check className="size-10" />
                    </div>
                    <h3 className="font-serif text-3xl text-[#2C1E16] mb-4">Merveilleux !</h3>
                    <p className="text-[#5A453A] leading-relaxed">
                      Votre demande pour la pièce <strong className="text-[#C17D59]">{selectedHandle.name}</strong> a bien été envoyée à notre atelier. Nous vous contacterons très vite.
                    </p>
                    <button 
                      onClick={() => setShowInquiryModal(false)}
                      className="mt-8 px-8 py-3 bg-[#E8DCCB] text-[#3A2A21] rounded-full hover:bg-[#DFD3C3] transition-colors font-medium"
                    >
                      Retourner à la galerie
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitInquiry} className="flex flex-col gap-6">
                    <div>
                      <h3 className="font-serif text-3xl text-[#2C1E16] mb-2">Réserver cette pièce</h3>
                      <p className="text-[#5A453A] text-sm">
                        Modèle: <span className="font-medium">{selectedHandle.name}</span>
                      </p>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                        <X className="size-4" /> {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C7A6B] ml-1">Nom complet</label>
                        <input 
                          required
                          value={inquiryData.fullName}
                          onChange={e => setInquiryData({...inquiryData, fullName: e.target.value})}
                          className="px-4 py-3 bg-white border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59]"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C7A6B] ml-1">Quantité</label>
                        <input 
                          type="number"
                          min="1"
                          required
                          value={inquiryData.qty}
                          onChange={e => setInquiryData({...inquiryData, qty: Number(e.target.value)})}
                          className="px-4 py-3 bg-white border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C7A6B] ml-1">Email</label>
                        <input 
                          type="email"
                          required
                          value={inquiryData.email}
                          onChange={e => setInquiryData({...inquiryData, email: e.target.value})}
                          className="px-4 py-3 bg-white border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59]"
                          placeholder="jean@email.com"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-[#8C7A6B] ml-1">Téléphone</label>
                        <input 
                          required
                          value={inquiryData.phone}
                          onChange={e => setInquiryData({...inquiryData, phone: e.target.value})}
                          className="px-4 py-3 bg-white border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59]"
                          placeholder="+216 ..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-[#8C7A6B] ml-1">Un petit mot (optionnel)</label>
                      <textarea 
                        rows={3}
                        value={inquiryData.notes}
                        onChange={e => setInquiryData({...inquiryData, notes: e.target.value})}
                        className="px-4 py-3 bg-white border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59] resize-none"
                        placeholder="Précisez une couleur ou un détail..."
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={submitLoading}
                      className="w-full py-4 mt-2 bg-[#C17D59] text-white font-medium rounded-xl hover:bg-[#A66645] transition-colors disabled:opacity-50"
                    >
                      {submitLoading ? "Envoi..." : "Envoyer ma demande"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
