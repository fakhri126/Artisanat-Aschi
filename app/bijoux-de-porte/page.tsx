'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Sparkles, ShoppingBag, Check, X, Mail, Phone, ChevronLeft, ChevronRight, ShieldCheck, Hand, Heart } from 'lucide-react'
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

  // 3D Parallax logic for knob
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

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

          // Force wooden background images (cycle through the 25 uploaded ones)
          const woodImage = `/poignees/new_knob_${(idx % 25) + 1}.jpg`

          return {
            id: p.id.toString(),
            name: p.name,
            category: catId,
            categoryLabel: catName,
            dimensions: p.dimensions || 'Non spécifié',
            price: p.price || 25,
            desc: p.description || 'Une pièce artisanale unique peinte à la main.',
            image: woodImage, // Forced wooden background
            ideal: 'Idéal pour décorer vos portes et meubles.'
          }
        })

        if (handlesFromApi.length > 0) {
          setApiHandles(handlesFromApi)
          setCategories(Array.from(uniqueCategories.entries()).map(([id, label]) => ({ id, label })))
        } else {
          // Provide 25 fallback handles if admin is empty
          const mockHandles: HandleModel[] = Array.from({ length: 25 }).map((_, i) => {
            let catId = 'small'
            let catLabel = 'Petites Poignées'
            if (i < 8) { catId = 'large'; catLabel = 'Grands Ronds' }
            else if (i < 16) { catId = 'oval'; catLabel = 'Format Ovale' }
            
            return {
              id: `mock-${i + 1}`,
              name: `Poignée Céramique N°${i + 1}`,
              category: catId,
              categoryLabel: catLabel,
              dimensions: catId === 'large' ? '6-7 cm' : catId === 'oval' ? '7x4 cm' : '3-4 cm',
              price: catId === 'large' ? 28 : catId === 'oval' ? 32 : 18,
              desc: 'Poignée artisanale peinte à la main sur fond de bois, un véritable bijou pour vos meubles.',
              image: `/poignees/new_knob_${i + 1}.jpg`,
              ideal: 'Parfait pour commodes, tiroirs et portes de placards.'
            }
          })
          setApiHandles(mockHandles)
          setCategories([
            { id: 'all', label: 'Toute la Collection' },
            { id: 'large', label: 'Grands Ronds' },
            { id: 'oval', label: 'Format Ovale' },
            { id: 'small', label: 'Petites Poignées' }
          ])
        }
      } catch (err) {
        console.error("Erreur API", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredHandles = filter === 'all' 
    ? apiHandles 
    : apiHandles.filter(h => h.category === filter)

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0)
  }, [filter])

  const nextSlide = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev === filteredHandles.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev === 0 ? filteredHandles.length - 1 : prev - 1))
  }

  const currentHandle = filteredHandles[activeIndex]

  const openInquiry = (handle: HandleModel) => {
    setSelectedHandle(handle)
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
Notes : ${inquiryData.notes || 'Aucune'}
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
      setError(err.message || 'Erreur lors de l\'envoi.')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return null

  return (
    <main className="min-h-screen flex flex-col bg-[#110e0c] text-ivory font-sans overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-20" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      {/* Chic Header */}
      <div className="pt-40 pb-12 flex flex-col items-center text-center px-4 relative z-10">
        <div className="inline-flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <Sparkles className="size-4 text-[#D4AF37]" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
        <h1 className="font-serif italic text-6xl md:text-8xl text-white mb-6 drop-shadow-2xl">
          Bijoux <span className="text-[#D4AF37] not-italic font-light">de Porte</span>
        </h1>
        <p className="text-ivory/60 max-w-xl text-xs md:text-sm uppercase tracking-[0.4em] font-light">
          L'art de la céramique tunisienne sur fond de bois noble
        </p>
      </div>

      {/* Categories */}
      <div className="w-full flex justify-center mb-16 px-4 relative z-10">
        <div className="flex gap-2 p-1.5 bg-black/40 border border-[#D4AF37]/20 rounded-full backdrop-blur-md overflow-x-auto max-w-full shadow-2xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500 shrink-0 ${
                filter === cat.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#b38a22] text-[#1a1512] shadow-[0_0_30px_rgba(212,175,55,0.3)] scale-105'
                  : 'text-ivory/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Gallery Slider */}
      {filteredHandles.length > 0 && currentHandle && (
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[60vh] pb-32 px-4 w-full max-w-7xl mx-auto z-10">
          
          <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
            
            {/* Visual with 3D Parallax */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative perspective-[1200px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentHandle.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 80 : -80, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -80 : 80, scale: 0.9 }}
                  transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ rotateX, rotateY }}
                  className="relative w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] rounded-full overflow-hidden border-[4px] border-[#D4AF37]/30 shadow-[0_0_80px_rgba(212,175,55,0.2)] group cursor-crosshair"
                >
                  <Image
                    src={currentHandle.image}
                    alt={currentHandle.name}
                    fill
                    className="object-cover transition-transform duration-[8s] ease-out group-hover:scale-125"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/30 pointer-events-none rounded-full" />
                  
                  {/* Subtle inner gold ring */}
                  <div className="absolute inset-3 border border-[#D4AF37]/40 rounded-full pointer-events-none transition-all duration-500 group-hover:scale-95 group-hover:border-[#D4AF37]/60" />
                </motion.div>
              </AnimatePresence>
              
              {/* Elegant Pedestal Shadow */}
              <div className="w-4/5 h-16 mt-6 bg-black/80 blur-2xl rounded-[100%]" />
              <div className="w-1/2 h-3 -mt-10 bg-[#D4AF37]/40 blur-xl rounded-[100%]" />
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${currentHandle.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="w-full"
                >
                  <div className="inline-flex items-center justify-center md:justify-start gap-3 mb-6 w-full">
                    <div className="w-12 h-px bg-[#D4AF37]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">
                      {currentHandle.categoryLabel}
                    </span>
                  </div>
                  
                  <h2 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-tight drop-shadow-xl w-full">
                    {currentHandle.name}
                  </h2>
                  
                  <p className="text-ivory/60 font-light leading-relaxed mb-10 max-w-md mx-auto md:mx-0 text-base md:text-lg">
                    {currentHandle.desc}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-8 md:gap-12 mb-12 w-full">
                    <div className="flex flex-col items-center md:items-start group">
                      <span className="text-[10px] text-ivory/40 uppercase tracking-[0.2em] mb-2 group-hover:text-[#D4AF37] transition-colors">Dimensions</span>
                      <span className="text-white font-serif text-xl md:text-2xl">{currentHandle.dimensions}</span>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />
                    <div className="flex flex-col items-center md:items-start group">
                      <span className="text-[10px] text-ivory/40 uppercase tracking-[0.2em] mb-2 group-hover:text-[#D4AF37] transition-colors">Prix unitaire</span>
                      <span className="text-[#D4AF37] font-serif text-3xl md:text-4xl font-bold">{currentHandle.price} <span className="text-sm font-sans font-normal text-ivory/60">TND</span></span>
                    </div>
                  </div>

                  <div className="w-full flex justify-center md:justify-start mt-4">
                    <button
                      onClick={() => openInquiry(currentHandle)}
                      className="group relative overflow-hidden inline-flex items-center justify-center gap-4 px-12 py-6 bg-gradient-to-r from-[#D4AF37] via-[#f9e596] to-[#D4AF37] text-black rounded-full hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] w-full md:w-auto font-bold"
                    >
                      <ShoppingBag className="size-6 relative z-10" />
                      <span className="uppercase tracking-[0.3em] text-sm relative z-10">Réserver cette pièce</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 pt-8 border-t border-white/10 w-full">
                    <div className="flex items-center gap-2 text-ivory/60">
                      <Hand className="size-4 text-[#D4AF37]" />
                      <span className="text-[10px] uppercase tracking-widest font-semibold">100% Fait Main</span>
                    </div>
                    <div className="flex items-center gap-2 text-ivory/60">
                      <Heart className="size-4 text-[#D4AF37]" />
                      <span className="text-[10px] uppercase tracking-widest font-semibold">Pièce Unique</span>
                    </div>
                    <div className="flex items-center gap-2 text-ivory/60">
                      <ShieldCheck className="size-4 text-[#D4AF37]" />
                      <span className="text-[10px] uppercase tracking-widest font-semibold">Qualité Majolique</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls - Floating below */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
            <button onClick={prevSlide} className="group p-4 rounded-full bg-black/60 border border-[#D4AF37]/20 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <ChevronLeft className="size-6 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3 px-6 py-2 bg-black/40 border border-white/5 rounded-full backdrop-blur-sm">
              <span className="text-[#D4AF37] font-serif text-2xl font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="text-white/20 text-xl font-light">/</span>
              <span className="text-white/50 font-serif text-lg">{String(filteredHandles.length).padStart(2, '0')}</span>
            </div>
            <button onClick={nextSlide} className="group p-4 rounded-full bg-black/60 border border-[#D4AF37]/20 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <ChevronRight className="size-6 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      )}

      {/* Background Ambient Text */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none opacity-[0.03]">
        <h1 className="font-serif italic text-[10rem] md:text-[20rem] leading-none text-white whitespace-nowrap">Galerie</h1>
      </div>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {showInquiryModal && selectedHandle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowInquiryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#110e0c] border border-[#D4AF37]/30 rounded-3xl p-8 relative text-left text-ivory shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowInquiryModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-[#D4AF37] hover:bg-white/10 transition-colors z-10">
                <X className="size-5" />
              </button>

              <div className="text-center mb-8 border-b border-white/5 pb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold block mb-2">Devis Rapide</span>
                <h3 className="font-serif text-4xl text-white mb-2 pr-8 mx-auto">{selectedHandle.name}</h3>
                <p className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs">{selectedHandle.price} TND / Pièce</p>
              </div>

              {sent ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto mb-6 bg-[#D4AF37]/10">
                    <Check className="size-10" />
                  </div>
                  <h4 className="font-serif text-2xl text-white mb-2">Demande Transmise</h4>
                  <p className="text-white/60 font-light max-w-sm mx-auto">Votre demande a été envoyée avec succès. Notre atelier vous contactera sous peu.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">Quantité</label>
                      <input type="number" required min={1} value={inquiryData.qty} onChange={(e) => setInquiryData({...inquiryData, qty: parseInt(e.target.value)||0})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">Total Estimé</label>
                      <div className="w-full bg-black border border-[#D4AF37]/30 rounded-xl p-4 text-[#D4AF37] font-bold text-center text-lg">
                        {selectedHandle.price * inquiryData.qty} TND
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">Nom Complet</label>
                    <input type="text" required value={inquiryData.fullName} onChange={(e) => setInquiryData({...inquiryData, fullName: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">Email</label>
                      <input type="email" required value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">Téléphone</label>
                      <input type="tel" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitLoading} className="w-full py-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8a6308] text-black font-bold uppercase tracking-widest text-xs mt-6 hover:opacity-90 transition-opacity shadow-lg">
                    {submitLoading ? 'Envoi...' : 'Confirmer la Demande'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
