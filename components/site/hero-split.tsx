'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { publicApi, Product } from '@/lib/api'
import { BohoRosace } from './boho-decor'
import { cn } from '@/lib/utils'

const DEFAULT_PRODUCT: Product = {
  id: 0,
  name: "Buffet d'Apparat Andalou",
  description: "Découvrez la toute dernière pièce unique façonnée à la main par nos maîtres ébénistes.",
  dimensions: "180 x 90 x 45 cm",
  materials: "Noyer massif & Laiton",
  color: "Noyer & Bleu",
  price: null,
  availability: "DISPONIBLE",
  type: "PIECE_UNIQUE",
  isFeatured: true,
  category: { id: 1, name: "Buffets", type: "CREATION" },
  images: [{ id: 1, imageUrl: "/images/bg-brass-cabinet-catalogue.jpg", isPrimary: true, colorLabel: "Original" }]
}

export function HeroSplit() {
  const [latestProduct, setLatestProduct] = useState<Product>(DEFAULT_PRODUCT)
  const [isUnveiled, setIsUnveiled] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    async function loadLatestProduct() {
      try {
        const prodData = await publicApi.getProducts()
        if (prodData && prodData.length > 0) {
          // Filtrer les créations / produits disponibles (hors catalogue sur commande et bijoux)
          const availableProds = prodData.filter((p) => {
            const isCatalog = p.type === 'CATALOGUE'
            const catName = p.category?.name?.toLowerCase() || ''
            const prodName = p.name?.toLowerCase() || ''
            const mat = p.materials?.toLowerCase() || ''
            const isBijoux = catName.includes('bijou') || catName.includes('poignée') || catName.includes('bouton') || catName.includes('porte') || catName.includes('ronds') || catName.includes('ovales') ||
                             prodName.includes('bijou') || prodName.includes('poignée') || prodName.includes('bouton') ||
                             mat.includes('céramique') || mat.includes('majolique')
            return !isCatalog && !isBijoux
          })

          // Trier par ID décroissant pour obtenir exactement le DERNIER meuble ajouté dans les pièces disponibles
          const sorted = (availableProds.length > 0 ? availableProds : prodData).sort((a, b) => b.id - a.id)
          if (sorted.length > 0) {
            setLatestProduct(sorted[0])
          }
        }
      } catch (err) {
        console.warn('Failed to fetch latest product, using default')
      }
    }
    loadLatestProduct()
  }, [])

  const addToCart = (product: Product) => {
    const primaryImg = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || '/placeholder.jpg'
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImg,
      category: product.category?.name || 'Mobilier',
      woodType: product.woodType || undefined
    })
  }

  const image = latestProduct.images?.find(img => img.isPrimary)?.imageUrl || latestProduct.images?.[0]?.imageUrl || '/placeholder.jpg'
  const isVideo = image.match(/\.(mp4|webm|ogg|mov)$/i)

  return (
    <div className="relative h-full w-full overflow-hidden flex items-center font-sans bg-transparent py-2 sm:py-4">
      {/* Delicate Rosace Background Motif */}
      <BohoRosace variant="dark-overlay" color="#E6A635" monochrome={true} className="absolute top-[10%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-[0.07] pointer-events-none" delay={0.2} />

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-0 lg:gap-x-10 py-2 sm:py-4 items-center">
        
        {/* Left Side (5.5 Cols): Text and Actions */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-20 order-1">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            {/* Nouveau Badge Prestidigieux */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 shadow-md">
              <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
              <span>Nouvelle Création d&apos;Art</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Sculpture d&apos;Art <br/>
              <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl block mt-0.5">
                &amp; Noyer Noble
              </span>
            </h2>
            
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal max-w-sm xl:max-w-md text-xs sm:text-sm md:text-base mb-4 leading-relaxed">
              {latestProduct.description || "Découvrez la toute dernière pièce unique façonnée à la main par nos maîtres sculpteurs."}
            </p>

            <div className="inline-block px-4 py-1.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 text-[#F2BD52] text-xs md:text-sm font-serif italic mb-5 shadow-sm">
              « {latestProduct.name} »
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Button: Order / Reserve */}
              <button
                onClick={() => addToCart(latestProduct)}
                className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ShoppingCart className="size-3.5 text-[#1A110B]" />
                <span>Acquérir cette pièce</span>
              </button>
              
              {/* Button: Explore Creations */}
              <Link
                href="/creations"
                className="group relative inline-flex items-center justify-center gap-2 bg-[#3B271C]/90 text-white px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] shadow-md border border-[#E6A635]/35 backdrop-blur-md hover:bg-[#4E3425] hover:text-[#F2BD52] transition-all"
              >
                <Eye className="size-3.5 text-[#F2BD52]" />
                <span>Voir la Collection</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Side (6.5 Cols): Arched Exhibition Frame with Door Reveal */}
        <div 
          className="w-full lg:col-span-7 relative h-[45vh] sm:h-[50vh] lg:h-[58vh] max-h-[580px] cursor-pointer group z-10 order-2 flex justify-center lg:justify-end mt-2 lg:mt-0"
          onMouseEnter={() => setIsUnveiled(true)}
          onMouseLeave={() => setIsUnveiled(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full relative max-w-[480px] mx-auto lg:mr-0"
          >
            {/* Arched Luxury Beveled Frame */}
            <div className="absolute inset-0 rounded-t-full rounded-b-[36px] overflow-hidden border-[3px] sm:border-[4px] border-[#E6A635]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#3B271C]">
              {isVideo ? (
                <video
                  src={image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 object-cover w-full h-full opacity-90 transition-transform duration-[15s] group-hover:scale-105 z-0"
                />
              ) : (
                <Image
                  src={image}
                  alt={latestProduct.name}
                  fill
                  className="absolute inset-0 object-cover transition-transform duration-[15s] group-hover:scale-105 z-0"
                />
              )}

              {/* Silk Soft Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 pointer-events-none" />

              {/* Sliding Doors */}
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 w-1/2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-r border-[#E6A635]/50 overflow-hidden shadow-[5px_0_20px_rgba(0,0,0,0.8)]",
                  isUnveiled ? "-translate-x-full" : "translate-x-0"
                )}
              >
                <img
                  src="/blue-door.jpg"
                  alt="Porte artisanale gauche"
                  className="absolute inset-y-0 left-0 max-w-none h-full object-cover object-left"
                  style={{ width: '200%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60 pointer-events-none" />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 size-7 sm:size-8 rounded-full border border-[#E6A635]/70 bg-[#3B271C]/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <div className="size-2 rounded-full bg-[#E6A635] shadow-[0_0_8px_#E6A635]" />
                </div>
              </div>

              <div 
                className={cn(
                  "absolute inset-y-0 right-0 w-1/2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 border-l border-[#E6A635]/50 overflow-hidden shadow-[-5px_0_20px_rgba(0,0,0,0.8)]",
                  isUnveiled ? "translate-x-full" : "translate-x-0"
                )}
              >
                <img
                  src="/blue-door.jpg"
                  alt="Porte artisanale droite"
                  className="absolute inset-y-0 right-0 max-w-none h-full object-cover object-right"
                  style={{ width: '200%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/60 pointer-events-none" />
                <div className="absolute top-1/2 left-3 -translate-y-1/2 size-7 sm:size-8 rounded-full border border-[#E6A635]/70 bg-[#3B271C]/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <div className="size-2 rounded-full bg-[#E6A635] shadow-[0_0_8px_#E6A635]" />
                </div>
              </div>

              {/* Reveal Guide Overlay */}
              <div 
                className={cn(
                  "absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-500 pointer-events-none",
                  isUnveiled ? "opacity-0" : "opacity-100"
                )}
              >
                <div className="bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/60 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-white">
                  <Sparkles className="size-3.5 text-[#E6A635] animate-pulse" />
                  <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#F2BD52]">
                    Survolez pour dévoiler
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
