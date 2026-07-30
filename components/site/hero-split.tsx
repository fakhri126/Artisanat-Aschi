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

export function HeroSplit() {
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
    <div className="relative h-full min-h-[700px] w-full overflow-hidden flex items-center font-sans border-b border-[#D9CEB8] bg-transparent">
      {/* Intricate Bohemian Motifs */}
      <BohoRosace color="#D4AF37" monochrome={true} className="absolute top-[10%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-40 pointer-events-none" delay={0.2} />

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-y-0 lg:gap-x-20 pt-16 pb-8 items-center">
        
        {/* Title and Intro Text */}
        <div className="w-full flex flex-col justify-end order-1 lg:col-start-1 lg:row-start-1 lg:pb-8 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D9CEB8] text-[#C17D59] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <Sparkles className="size-4 animate-pulse" />
              Nouveautés Exclusives
            </div>
            
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#3A2A1E] mb-6 leading-tight">
              Nos Dernières<br/>Créations
            </h2>
            
            <p className="text-[#5A453A] font-light max-w-md text-base md:text-lg leading-relaxed mb-4 lg:mb-0">
              {latestProduct.description || "Découvrez la toute dernière pièce unique tout juste sortie de notre atelier."}
            </p>
          </motion.div>
        </div>

        {/* Details Card */}
        <div className="w-full flex flex-col justify-start order-3 lg:col-start-1 lg:row-start-2 z-30 mt-6 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-[#D9CEB8] shadow-lg max-w-sm md:max-w-md mx-auto lg:mx-0">
              <h3 className="font-heading text-lg md:text-2xl text-[#3A2A1E] mb-3 md:mb-4">{latestProduct.name}</h3>
              
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setSelectedProduct(latestProduct)}
                  className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C59B27] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-[#D4AF37]/50 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Eye className="size-4" /> Découvrir
                  </span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                </button>
                <button
                  onClick={() => addToCart(latestProduct)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-white transition-all text-center flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="size-4" /> Panier
                </button>
              </div>
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
                  "absolute inset-y-0 left-0 w-1/2 bg-[#3A2A1E] transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-r border-black/50 overflow-hidden",
                  isUnveiled ? "-translate-x-full" : "translate-x-0"
                )}
              >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                <BohoDoorPanel className="absolute inset-0 w-[200%] h-full p-2 md:p-4 opacity-70 pointer-events-none" color="#2C1E16" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-md" />
              </div>

              <div 
                className={cn(
                  "absolute inset-y-0 right-0 w-1/2 bg-[#3A2A1E] transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-l border-white/10 overflow-hidden",
                  isUnveiled ? "translate-x-full" : "translate-x-0"
                )}
              >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                <BohoDoorPanel className="absolute inset-0 w-[200%] h-full p-2 md:p-4 opacity-70 pointer-events-none -translate-x-1/2 transform -scale-x-100" color="#2C1E16" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-md" />
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

