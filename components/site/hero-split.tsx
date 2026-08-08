'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, Eye } from 'lucide-react'
import { publicApi, Product } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'
import { ProductModal } from './product-modal'
import { BohoRosace, BohoDoorPanel } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function HeroSplit() {
  const { color: titleColor, isMounted: isColorMounted } = useRandomHeroColor()
  const [latestProduct, setLatestProduct] = useState<Product | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const [isUnveiled, setIsUnveiled] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    publicApi.getProducts()
      .then(products => {
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
        
        // Exclude Bijoux de Porte from the "Nouveautés" slide
        const filtered = products.filter(p => !isHandleProduct(p))
        
        // Sort by ID descending to get the latest
        const sorted = filtered.sort((a, b) => b.id - a.id)
        
        if (sorted.length > 0) {
          setLatestProduct(sorted[0])
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUnveiled(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) return null

  if (!latestProduct) {
    return (
      <div className="relative h-[700px] w-full bg-transparent flex flex-col items-center justify-center">
         <Sparkles className="size-12 text-[#C17D59] mb-6 opacity-50 animate-pulse" />
         <h2 className="font-heading text-4xl md:text-5xl text-[#3A2A21]">Nouvelles Créations</h2>
         <p className="mt-4 text-[#C17D59] tracking-widest uppercase text-xs">En préparation dans notre atelier...</p>
      </div>
    )
  }

  const image = latestProduct.images?.find(img => img.isPrimary)?.imageUrl || latestProduct.images?.[0]?.imageUrl || '/placeholder.jpg'
  const isVideo = image.match(/\.(mp4|webm|ogg|mov)$/i)

  return (
    <div className="relative h-full min-h-[700px] w-full overflow-hidden flex items-center font-sans bg-transparent">
      {/* Intricate Bohemian Motifs */}
      <BohoRosace variant="dark-overlay" color="#D4AF37" monochrome={true} className="absolute top-[10%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-10 pointer-events-none" delay={0.2} />

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-y-0 lg:gap-x-20 pt-16 pb-8 items-center">
        
        {/* Left Side: Text and Actions */}
        <div className="w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 mt-8 lg:mt-0 order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9CEB8] text-[#C17D59] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4 lg:mb-6 shadow-sm">
              <Sparkles className="size-3 md:size-4" />
              Nouveau Produit
            </div>
            
            <h2 
              className="font-heading text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-6 leading-none transition-colors duration-1000"
              style={{ color: isColorMounted ? titleColor : '#87CEEB' }}
            >
              L'Art <br/>
              <span className="text-[#D4AF37] text-4xl md:text-5xl lg:text-6xl italic drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">Marocain</span>
            </h2>
            
            <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium max-w-sm xl:max-w-md text-sm md:text-base xl:text-lg mb-4 leading-relaxed">
              {latestProduct.description || "Découvrez la toute dernière pièce unique tout juste sortie de notre atelier."}
            </p>

            <h3 className="font-heading text-xl md:text-3xl text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] mb-10 italic">
              {latestProduct.name}
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Bouton Acheter */}
              <button
                onClick={() => addToCart(latestProduct)}
                className="group relative inline-flex items-center justify-center bg-gradient-to-r from-[#C17D59] to-[#8C5230] hover:from-[#d4af37] hover:to-[#C17D59] text-white px-7 py-3.5 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#E8DCCB]/30 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  <ShoppingCart className="size-4 text-white" />
                  Acheter
                </span>
              </button>
              
              {/* Bouton Explorer la Collection */}
              <Link
                href="/creations"
                className="group relative inline-flex items-center justify-center bg-white/10 text-white px-6 py-3.5 md:px-7 md:py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-lg border border-white/40 backdrop-blur-sm hover:bg-white/20 transition-all hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Eye className="size-4" /> Explorer la Collection
                </span>
              </Link>
            </div>
          </motion.div>
        </div>

        <div 
          className="w-full relative h-[50vh] lg:h-[65vh] max-h-[750px] cursor-pointer group z-10 order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2"
          onMouseEnter={() => setIsUnveiled(true)}
          onMouseLeave={() => setIsUnveiled(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full relative max-w-[500px] mx-auto"
          >
            {/* Arched Window Frame */}
            <div className="absolute inset-0 rounded-t-full rounded-b-[40px] overflow-hidden border-[12px] border-white shadow-2xl bg-[#3A2A1E]">
              {isVideo ? (
                <video
                  src={image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 object-cover w-full h-full opacity-90 transition-transform duration-[20s] group-hover:scale-110 z-0"
                />
              ) : (
                <Image
                  src={image}
                  alt={latestProduct.name}
                  fill
                  className="absolute inset-0 object-cover transition-transform duration-[20s] group-hover:scale-110 z-0"
                />
              )}

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />

              {/* Sliding Doors */}
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 w-1/2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-r-2 border-black/80 overflow-hidden shadow-[5px_0_20px_rgba(0,0,0,0.6)]",
                  isUnveiled ? "-translate-x-full" : "translate-x-0"
                )}
              >
                <img
                  src="/blue-door.jpg"
                  alt="Porte Bleue"
                  className="absolute inset-0 h-full max-w-none object-cover"
                  style={{ width: '200%', left: '0' }}
                />
              </div>

              <div 
                className={cn(
                  "absolute inset-y-0 right-0 w-1/2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-l-2 border-black/80 overflow-hidden shadow-[-5px_0_20px_rgba(0,0,0,0.6)]",
                  isUnveiled ? "translate-x-full" : "translate-x-0"
                )}
              >
                <img
                  src="/blue-door.jpg"
                  alt="Porte Bleue"
                  className="absolute inset-0 h-full max-w-none object-cover"
                  style={{ width: '200%', left: '-100%' }}
                />
              </div>

            </div>

            {/* Subtle floating badge */}
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-4 rounded-xl shadow-xl border border-[#D9CEB8] flex items-center gap-3 z-30 transition-all duration-500 hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-[#E8DCCB] flex items-center justify-center">
                <Sparkles className="size-5 text-[#C17D59]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#C17D59] mb-1">Nouveau</p>
                <p className="text-sm font-semibold text-[#3A2A1E]">Dans la boutique</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  )
}

