'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface LightboxData {
  images: string[]
  currentIndex: number
  title: string
}

interface ProjectLightboxProps {
  lightbox: LightboxData | null
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ProjectLightbox({
  lightbox,
  onClose,
  onNavigate,
}: ProjectLightboxProps) {
  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightbox) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        const prev = lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1
        onNavigate(prev)
      } else if (e.key === 'ArrowRight') {
        const next = lightbox.currentIndex === lightbox.images.length - 1 ? 0 : lightbox.currentIndex + 1
        onNavigate(next)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, onClose, onNavigate])

  return (
    <AnimatePresence>
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          {/* Top Bar */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-xs font-semibold shadow-md">
                {lightbox.title}
              </span>
              {lightbox.images.length > 1 && (
                <span className="text-white/70 text-xs font-mono bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                  {lightbox.currentIndex + 1} / {lightbox.images.length}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="size-10 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] hover:bg-[#3B271C] transition-all flex items-center justify-center cursor-pointer shadow-lg"
              aria-label="Fermer le plein écran"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Enlarged Image container */}
          <motion.div
            key={lightbox.currentIndex}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-5xl h-[70vh] sm:h-[78vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.currentIndex]}
              alt={lightbox.title}
              fill
              unoptimized
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
              sizes="100vw"
              priority
              onError={(e) => {
                const cur = lightbox.images[lightbox.currentIndex]
                const filename = cur?.split('/').pop()?.split('#')[0]
                if (filename && cur?.startsWith('http')) {
                  e.currentTarget.src = `/uploads/${filename}`
                } else {
                  e.currentTarget.src = '/project-hotel.png'
                }
              }}
            />
          </motion.div>

          {/* Navigation Arrows */}
          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const prev = lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1
                  onNavigate(prev)
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:scale-110 transition-all cursor-pointer shadow-xl"
                aria-label="Image précédente"
              >
                <ChevronLeft className="size-5 sm:size-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const next = lightbox.currentIndex === lightbox.images.length - 1 ? 0 : lightbox.currentIndex + 1
                  onNavigate(next)
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:scale-110 transition-all cursor-pointer shadow-xl"
                aria-label="Image suivante"
              >
                <ChevronRight className="size-5 sm:size-6" />
              </button>
            </>
          )}

          {/* Bottom Thumbnails */}
          {lightbox.images.length > 1 && (
            <div 
              className="absolute bottom-3 sm:bottom-4 inset-x-4 flex justify-center gap-2 overflow-x-auto py-2 z-20 scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.map((img, idx) => {
                const cleanImg = img.split(',')[0].trim()
                return (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`relative w-12 sm:w-16 aspect-[16/10] rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      lightbox.currentIndex === idx
                        ? 'border-[#E6A635] scale-105 shadow-[0_0_12px_rgba(230,166,53,0.5)]'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={cleanImg}
                      alt="Miniature"
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        const filename = cleanImg.split('/').pop()?.split('#')[0]
                        if (filename && cleanImg.startsWith('http')) {
                          e.currentTarget.src = `/uploads/${filename}`
                        } else {
                          e.currentTarget.src = '/project-hotel.png'
                        }
                      }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
