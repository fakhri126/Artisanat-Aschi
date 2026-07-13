'use client'

import { useState, useEffect } from 'react'
import { Play, X, Quote } from 'lucide-react'
import { Reveal } from './reveal'
import { publicApi, Testimonial } from '@/lib/api'

const MOCK_VIDEOS = [
  {
    name: 'Leïla Ben Ammar',
    role: 'Propriétaire de villa · Gammarth',
    image: '/testimonial-1.png',
    quote:
      "Chaque pièce qu'ils ont créée raconte une histoire. Notre maison a désormais une âme.",
  },
  {
    name: 'Karim Trabelsi',
    role: "Directeur d'hôtel · Tunis",
    image: '/testimonial-2.png',
    quote:
      "Un savoir-faire rare. Nos clients s'émerveillent devant les boiseries dès l'entrée.",
  },
  {
    name: 'Famille Mansour',
    role: 'Restaurateurs · Sidi Bou Saïd',
    image: '/testimonial-3.png',
    quote:
      "Travailler avec Aschi, c'est confier son rêve à des mains expertes et passionnées.",
  },
]

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [playing, setPlaying] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await publicApi.getTestimonials()
        setTestimonials(data)
      } catch (err) {
        console.error('Error fetching testimonials from API, using fallback data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTestimonials()
  }, [])

  const displayTestimonials = testimonials.length > 0
    ? testimonials.map(t => ({
        name: t.clientName,
        role: t.clientRole,
        image: t.imageUrl,
        quote: t.content,
        videoUrl: t.videoUrl
      }))
    : MOCK_VIDEOS

  return (
    <section className="bg-walnut py-24 text-walnut-foreground md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-luxury text-gold">Témoignages</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-ivory">
            La parole à ceux qui nous ont fait confiance
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
          {displayTestimonials.map((v, i) => (
            <Reveal key={v.name} delay={i * 120}>
              <article className="group relative overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-950/20 border border-gold/5">
                  <img
                    src={v.image || '/placeholder.svg'}
                    alt={v.name}
                    className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut/90 via-walnut/20 to-transparent" />
                  <button
                    type="button"
                    onClick={() => setPlaying(i)}
                    aria-label={`Lire le témoignage de ${v.name}`}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex size-16 items-center justify-center rounded-full bg-gold/90 text-walnut transition-all duration-300 group-hover:scale-110 group-hover:bg-gold">
                      <Play className="ml-0.5 size-6 fill-current" />
                    </span>
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                    <Quote className="size-6 text-gold" />
                    <p className="mt-3 font-heading text-lg font-light italic leading-snug text-ivory">
                      {v.quote}
                    </p>
                    <p className="mt-4 text-sm font-medium text-ivory">{v.name}</p>
                    <p className="text-xs text-ivory/60">{v.role}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {playing !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-walnut/90 p-4 backdrop-blur-sm"
          onClick={() => setPlaying(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setPlaying(null)}
            className="absolute right-6 top-6 rounded-full bg-walnut/60 p-2 text-ivory hover:bg-bronze"
          >
            <X className="size-6" />
          </button>
          <div
            className="flex aspect-video w-full max-w-3xl flex-col items-center justify-center bg-walnut text-center ring-1 ring-gold/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="size-12 text-gold" />
            <p className="mt-4 font-heading text-2xl font-light text-ivory">
              Témoignage de {displayTestimonials[playing].name}
            </p>
            {displayTestimonials[playing].videoUrl ? (
              <p className="mt-2 text-sm text-gold/80 underline font-mono">
                Lien vidéo : {displayTestimonials[playing].videoUrl}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ivory/60">
                La vidéo sera bientôt disponible.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
