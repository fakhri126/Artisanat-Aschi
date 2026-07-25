'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { publicApi, Product } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'
import { ProductModal } from './product-modal'

export function HeroSplit() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()

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
        
        setLatestProducts(sorted.slice(0, 3))
      })
      .catch(console.error)
  }, [])

  if (!isMounted) return null

  if (latestProducts.length === 0) {
    return (
      <div className="relative h-full w-full bg-stone-950 flex flex-col items-center justify-center">
         <Sparkles className="size-12 text-[#C17D59] mb-6 opacity-50 animate-pulse" />
         <h2 className="font-heading text-4xl md:text-5xl text-[#3A2A21]">Nouvelles Créations</h2>
         <p className="mt-4 text-[#C17D59] tracking-widest uppercase text-xs">En préparation dans notre atelier...</p>
      </div>
    )
  }

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center px-6 py-20 bg-[url('/hero-bg.jpg')] bg-cover bg-center">
      {/* Heavy overlay to make cards pop */}
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />

      <div className="relative z-10 text-center mb-12">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#C17D59] text-xs font-semibold tracking-[0.3em] uppercase mb-4"
        >
          Nouveautés Exclusives
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl text-[#3A2A21] text-shadow-cinematic"
        >
          Nos Dernières Créations
        </motion.h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
      >
        {latestProducts.map((product, index) => {
          const image = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || '/placeholder.jpg'
          
          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-stone-900"
            >
              {/* Product Image */}
              {image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video
                  src={image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="object-cover w-full h-full transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
              ) : (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(212,175,55,0)] group-hover:shadow-[inset_0_0_50px_rgba(212,175,55,0.15)] transition-all duration-700 pointer-events-none" />

              {/* Content Box */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                
                {/* Badge for the absolute newest */}
                {index === 0 && (
                  <div className="absolute top-6 right-6 bg-[#E8DCCB] text-stone-950 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    Le plus récent
                  </div>
                )}

                <h3 className="font-heading text-3xl text-[#3A2A21] mb-2 group-hover:text-[#C17D59] transition-colors duration-300">
                  {product.name}
                </h3>
                
                <p className="text-white/70 text-sm font-light line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {product.description || "Une pièce d'exception façonnée avec passion dans notre atelier."}
                </p>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                    }}
                    className="flex-1 text-center py-3 border border-[#E8DCCB]/50 text-[#C17D59] text-xs tracking-widest uppercase hover:bg-[#E8DCCB] hover:text-stone-950 transition-colors"
                  >
                    Découvrir
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product)
                    }}
                    className="w-12 h-12 flex items-center justify-center bg-[#E8DCCB] text-stone-950 hover:bg-ivory transition-colors shadow-lg shadow-gold/20"
                    aria-label="Ajouter au panier"
                  >
                    <ShoppingCart className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  )
}
