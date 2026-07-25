'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/fade-in'
import { publicApi, Delivery } from '@/lib/api'
import { Truck, MapPin, Calendar, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export function WeeklyDelivery() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    publicApi.getDeliveries()
      .then(data => {
        if (data && data.length > 0) {
          // Sort by highest ID (newest added)
          const sorted = data.sort((a, b) => b.id - a.id)
          setDeliveries(sorted)
        }
      })
      .catch(console.error)
  }, [])

  if (!isMounted || deliveries.length === 0) return null

  return (
    <section id="livraison-semaine" className="bg-stone-50 py-24 md:py-36 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-100/50 -skew-x-12 transform origin-top-right z-0" />
      
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200/80 text-stone-600 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <Truck className="size-4" />
            Directement chez vous
          </div>
          <h2 className="font-heading text-4xl md:text-6xl text-stone-900 font-light tracking-tight mb-6">
            La Livraison de la Semaine
          </h2>
          <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
            Découvrez nos dernières créations tout juste sorties de l'atelier et installées dans leurs nouvelles demeures d'exception.
          </p>
        </FadeIn>

        <div className="flex flex-col gap-24">
          {deliveries.slice(0, 3).map((delivery, idx) => {
            const isVideo = delivery.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i)
            return (
              <div key={delivery.id} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Visual */}
                <motion.div 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full md:w-1/2 relative group"
                >
                  <div className="relative aspect-[4/5] md:aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/10">
                    {isVideo ? (
                      <video
                        src={delivery.imageUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={delivery.imageUrl || '/placeholder.jpg'}
                        alt={delivery.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors duration-500" />
                  </div>
                  
                  {/* Floating Date Badge */}
                  <div className={`absolute top-8 ${idx % 2 === 0 ? '-right-6' : '-left-6'} bg-white p-4 rounded-xl shadow-xl border border-stone-100 hidden md:flex flex-col items-center justify-center min-w-[100px]`}>
                    <span className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Date</span>
                    <span className="font-heading text-xl text-stone-800">
                      {new Date(delivery.deliveryDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="w-full md:w-1/2"
                >
                  <h3 className="font-heading text-3xl md:text-5xl text-stone-900 mb-6 leading-tight">
                    {delivery.title}
                  </h3>
                  
                  <div className="w-12 h-1 bg-[#E8DCCB]/50 mb-8 rounded-full" />
                  
                  <p className="text-stone-600 font-light text-lg leading-relaxed mb-8">
                    {delivery.description}
                  </p>

                  <div className="flex flex-col gap-4 text-stone-500 text-sm font-medium tracking-wide">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#C17D59]" />
                      <span>Livraison VIP - Installation sur mesure</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#C17D59]" />
                      <span>{new Date(delivery.deliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
