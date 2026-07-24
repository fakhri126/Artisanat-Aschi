'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/lib/api'
import { useCart } from '@/lib/cart-context'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart()

  if (!product) return null

  const image = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || '/placeholder.jpg'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-stone-900 border border-gold/20 shadow-2xl overflow-hidden rounded-md pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-gold transition-colors bg-black/20 rounded-full backdrop-blur-sm"
              >
                <X className="size-6" />
              </button>

              {/* Image Section */}
              <div className="relative w-full md:w-1/2 h-[40vh] md:h-[70vh]">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent md:bg-gradient-to-r" />
              </div>

              {/* Content Section */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col justify-center">
                <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4">
                  {product.category?.name || "Pièce d'exception"}
                </p>
                <h2 className="font-heading text-4xl md:text-5xl text-ivory mb-6 leading-tight text-shadow-cinematic">
                  {product.name}
                </h2>
                
                <div className="space-y-6 text-white/80 font-light mb-10 leading-relaxed">
                  <p>{product.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm pt-6 border-t border-white/10">
                    {product.materials && (
                      <div>
                        <span className="block text-gold text-xs tracking-widest uppercase mb-1">Matériaux</span>
                        <span>{product.materials}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="block text-gold text-xs tracking-widest uppercase mb-1">Dimensions</span>
                        <span>{product.dimensions}</span>
                      </div>
                    )}
                    {product.type && (
                      <div>
                        <span className="block text-gold text-xs tracking-widest uppercase mb-1">Type</span>
                        <span>{product.type}</span>
                      </div>
                    )}
                    {product.price && (
                      <div>
                        <span className="block text-gold text-xs tracking-widest uppercase mb-1">Prix</span>
                        <span className="text-lg font-medium text-ivory">{product.price} DT</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  <button
                    onClick={() => {
                      addToCart(product)
                      onClose()
                    }}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gold text-stone-950 font-medium uppercase tracking-[0.2em] text-xs transition-all hover:bg-ivory hover:scale-[1.02] shadow-lg shadow-gold/20"
                  >
                    <ShoppingCart className="size-4" />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
