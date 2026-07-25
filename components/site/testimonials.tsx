'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X, Star } from 'lucide-react'
import { publicApi, Testimonial } from '@/lib/api'

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    clientName: 'Leïla Ben Ammar',
    clientRole: 'Propriétaire de villa',
    location: 'Gammarth, Tunis',
    content: "Chaque pièce qu'ils ont créée raconte une histoire. Notre maison a désormais une âme qu'aucun catalogue ne pourrait offrir. C'est de l'artisanat vivant.",
    imageUrl: '/testimonial-1.png',
    type: 'TEXT' as const,
    videoUrl: null,
    rating: 5,
  },
  {
    id: 2,
    clientName: 'Karim Trabelsi',
    clientRole: "Directeur d'établissement",
    location: 'Centre-ville, Tunis',
    content: "Un savoir-faire rare et une précision remarquable. Nos clients s'émerveillent devant les boiseries dès l'entrée. Aschi, c'est de l'art au service du quotidien.",
    imageUrl: '/testimonial-2.png',
    type: 'TEXT' as const,
    videoUrl: null,
    rating: 5,
  },
  {
    id: 3,
    clientName: 'Famille Mansour',
    clientRole: 'Restaurateurs',
    location: 'Sidi Bou Saïd',
    content: "Travailler avec Aschi, c'est confier son rêve à des mains expertes et passionnées. Le résultat dépasse toujours les espérances. Une collaboration que je recommande les yeux fermés.",
    imageUrl: '/testimonial-3.png',
    type: 'TEXT' as const,
    videoUrl: null,
    rating: 5,
  },
  {
    id: 4,
    clientName: 'Nadia Gharbi',
    clientRole: 'Architecte d\'intérieur',
    location: 'La Marsa',
    content: "Je collabore avec l'atelier Aschi sur tous mes projets haut de gamme. Leur capacité à interpréter mes plans et à les sublimer en bois est tout simplement exceptionnelle.",
    imageUrl: '/testimonial-1.png',
    type: 'TEXT' as const,
    videoUrl: null,
    rating: 5,
  },
]

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < rating ? 'fill-gold text-[#C17D59]' : 'fill-transparent text-[#C17D59]/30'}`}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [playing, setPlaying] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await publicApi.getTestimonials()
        if (data && data.length > 0) {
          setTestimonials(data.map((t: Testimonial) => ({
            ...t,
            location: t.clientRole,
            rating: 5,
          })))
        } else {
          setTestimonials(MOCK_TESTIMONIALS)
        }
      } catch {
        setTestimonials(MOCK_TESTIMONIALS)
      } finally {
        setLoading(false)
      }
    }
    loadTestimonials()
  }, [])

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length)
    }, 5500)
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length > 1) startAuto()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [testimonials.length, startAuto])

  const goTo = (idx: number) => {
    setActiveIndex(idx)
    startAuto()
  }

  const prev = () => goTo((activeIndex - 1 + testimonials.length) % testimonials.length)
  const next = () => goTo((activeIndex + 1) % testimonials.length)

  if (loading || testimonials.length === 0) return null

  const active = testimonials[activeIndex]

  return (
    <section className="relative overflow-hidden bg-[#1a1109] py-24 md:py-36">
      {/* Decorative gold lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
        <div className="absolute -left-40 top-1/4 size-96 rounded-full bg-[#E8DCCB]/5 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 size-96 rounded-full bg-[#E8DCCB]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#C17D59] font-semibold mb-4">
            ✦ Témoignages ✦
          </p>
          <h2 className="font-heading text-4xl font-light text-[#3A2A21] sm:text-5xl md:text-6xl leading-tight">
            La parole à ceux qui<br className="hidden sm:block" />
            <span className="italic text-[#C17D59]">nous ont fait confiance</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        {/* Main Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16 items-center"
            >
              {/* Left: Portrait */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {/* Gold ring */}
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-gold/60 via-gold/20 to-transparent" />
                  <div className="relative size-40 md:size-52 overflow-hidden rounded-full border-2 border-[#E8DCCB]/30 bg-stone-900">
                    <img
                      src={active.imageUrl || '/client-placeholder.png'}
                      alt={active.clientName}
                      className="size-full object-cover"
                    />
                  </div>
                  {/* Play button for videos */}
                  {active.type === 'VIDEO' && active.videoUrl && (
                    <button
                      onClick={() => setPlaying(active)}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-[#FAF7F2]/60 backdrop-blur-sm transition-all hover:bg-[#FAF7F2]/80"
                    >
                      <span className="flex size-14 items-center justify-center rounded-full bg-[#E8DCCB] text-walnut">
                        <Play className="ml-0.5 size-6 fill-current" />
                      </span>
                    </button>
                  )}
                </div>

                {/* Stars + Name */}
                <div className="text-center">
                  <StarRating rating={active.rating || 5} />
                  <p className="mt-3 font-heading text-xl font-medium text-[#3A2A21]">{active.clientName}</p>
                  <p className="text-xs text-[#C17D59]/80 font-medium uppercase tracking-wider mt-1">{active.clientRole}</p>
                  {active.location && active.location !== active.clientRole && (
                    <p className="text-[11px] text-[#3A2A21]/40 mt-0.5 italic">{active.location}</p>
                  )}
                </div>
              </div>

              {/* Right: Quote */}
              <div className="relative">
                {/* Big decorative quote */}
                <span className="absolute -top-6 -left-4 font-heading text-[120px] leading-none text-[#C17D59]/10 select-none">
                  "
                </span>
                <blockquote className="relative z-10">
                  <p className="font-heading text-2xl md:text-3xl font-light leading-relaxed text-[#3A2A21]/90 italic">
                    "{active.content}"
                  </p>
                  <div className="mt-8 h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
                </blockquote>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button
                onClick={prev}
                className="flex size-11 items-center justify-center rounded-full border border-[#E8DCCB]/20 bg-white/5 text-[#3A2A21]/60 transition-all hover:border-[#E8DCCB] hover:bg-[#E8DCCB]/10 hover:text-[#C17D59]"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="size-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Aller au témoignage ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeIndex
                        ? 'w-8 h-2 bg-[#E8DCCB]'
                        : 'w-2 h-2 bg-[#E8DCCB]/25 hover:bg-[#E8DCCB]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="flex size-11 items-center justify-center rounded-full border border-[#E8DCCB]/20 bg-white/5 text-[#3A2A21]/60 transition-all hover:border-[#E8DCCB] hover:bg-[#E8DCCB]/10 hover:text-[#C17D59]"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}

          {/* Thumbnails strip */}
          {testimonials.length > 1 && (
            <div className="mt-10 flex justify-center gap-3 overflow-x-auto pb-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => goTo(i)}
                  className={`shrink-0 transition-all duration-300 rounded-full overflow-hidden border-2 ${
                    i === activeIndex ? 'border-[#E8DCCB] scale-110' : 'border-transparent opacity-40 hover:opacity-70 hover:scale-105'
                  }`}
                  aria-label={t.clientName}
                >
                  <img
                    src={t.imageUrl || '/client-placeholder.png'}
                    alt={t.clientName}
                    className="size-12 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm"
            onClick={() => setPlaying(null)}
          >
            <button
              onClick={() => setPlaying(null)}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2.5 text-white hover:bg-[#E8DCCB]/40 transition-colors"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl"
              onClick={e => e.stopPropagation()}
            >
              {playing.videoUrl ? (
                <iframe
                  src={playing.videoUrl.replace('watch?v=', 'embed/') + "?mute=1&autoplay=1"}
                  className="aspect-video w-full rounded-xl border border-[#E8DCCB]/20"
                  allowFullScreen
                  title={`Témoignage de ${playing.clientName}`}
                />
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center rounded-xl border border-[#E8DCCB]/20 bg-stone-950 text-center p-8">
                  <Play className="size-12 text-[#C17D59] mb-4" />
                  <p className="font-heading text-2xl font-light text-[#3A2A21]">
                    Témoignage de {playing.clientName}
                  </p>
                  <p className="mt-2 text-sm text-[#3A2A21]/50">La vidéo sera bientôt disponible.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
