'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import { News } from '@/lib/api'

interface EventModalProps {
  event: News | null
  isOpen: boolean
  onClose: () => void
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null

  const image = event.imageUrl || '/hero-bg.jpg'
  const date = new Date(event.createdDate || Date.now()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

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
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-stone-900 shadow-2xl overflow-hidden rounded-sm pointer-events-auto flex flex-col md:flex-row max-h-[90vh] border border-white/10"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-gold transition-colors bg-black/40 rounded-full backdrop-blur-md"
              >
                <X className="size-6" />
              </button>

              {/* Image Section */}
              <div className="relative w-full md:w-5/12 h-[30vh] md:h-auto">
                <Image
                  src={image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent md:bg-gradient-to-r" />
                
                {/* Decorative Elements */}
                <div className="absolute top-6 left-6 p-3 border border-gold/30 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center rounded-sm">
                  <span className="text-gold font-heading text-2xl leading-none">
                    {new Date(event.createdDate || Date.now()).getDate()}
                  </span>
                  <span className="text-ivory text-[10px] uppercase tracking-widest mt-1">
                    {new Date(event.createdDate || Date.now()).toLocaleString('fr-FR', { month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[10px] uppercase tracking-[0.2em] rounded-sm">
                    Actualité & Événement
                  </span>
                  <span className="flex items-center gap-2 text-white/50 text-xs font-light">
                    <Clock className="size-3" />
                    {date}
                  </span>
                </div>

                <h2 className="font-heading text-3xl md:text-5xl text-ivory mb-8 leading-tight">
                  {event.title}
                </h2>
                
                <div className="prose prose-invert prose-p:text-white/80 prose-p:font-light prose-p:leading-relaxed max-w-none">
                  {/* Split content by newlines to render paragraphs */}
                  {event.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-auto pt-10">
                  <button
                    onClick={onClose}
                    className="w-full py-4 border border-white/20 text-white/80 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors"
                  >
                    Fermer
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
