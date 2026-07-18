'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ArrowRight, Newspaper, Clock, Sparkles } from 'lucide-react'
import { Reveal } from './reveal'
import { publicApi, News } from '@/lib/api'
import Link from 'next/link'

// Helper pour temps de lecture (env. 200 mots/minute)
const getReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

// Helper pour savoir si l'article est récent (< 7 jours)
const isRecent = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

export function NewsSection() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await publicApi.getNews()
        // Sort news by date descending
        const sorted = data.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        setNews(sorted)
      } catch (err) {
        console.error('Error loading news from API, using fallback data:', err)
        // Fallback mock news
        setNews([
          {
            id: 1,
            title: 'Exposition Artisanale de Tunis 2026',
            content: "L'atelier Artisanat Aschi est fier d'annoncer sa participation au Salon National de l'Artisanat au Kram. Venez découvrir nos nouvelles pièces uniques et échanger avec nos maîtres artisans sculpteurs.",
            imageUrl: '/news-exposition.jpg',
            createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            title: 'Transmission de Savoir-Faire : Nos Jeunes Apprentis',
            content: "Depuis 1960, la transmission est au cœur de nos valeurs. Ce mois-ci, nous célébrons le parcours de nos deux nouveaux apprentis qui apprennent l'art ancestral de la sculpture sur noyer.",
            imageUrl: '/news-apprentis.jpg',
            createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [])

  if (loading) {
    return (
      <section id="actualites" className="bg-background py-20 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent mx-auto"></div>
      </section>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <section id="actualites" className="bg-background py-24 md:py-36 border-t border-gold/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-xs uppercase tracking-luxury text-bronze">Actualités & Événements</p>
          <h2 className="mt-5 font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-foreground text-balance max-w-3xl mx-auto">
            La vie de notre maison d&apos;art
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground">
            Suivez les temps forts de l&apos;atelier : expositions nationales, vie des artisans, nouvelles collections et projets d&apos;exception.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {news.map((item, i) => {
            const dateStr = new Date(item.createdDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })

            return (
              <Reveal key={item.id} delay={i * 150}>
                <motion.article 
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="group flex flex-col sm:flex-row gap-6 bg-white/50 backdrop-blur-sm border border-gold/20 rounded-2xl p-5 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(201,168,76,0.15)] hover:border-gold/40 h-full relative overflow-hidden"
                >
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Image container */}
                  <div className="relative w-full sm:w-48 aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl bg-zinc-900 shrink-0 shadow-inner">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.7 }}
                      src={item.imageUrl || '/placeholder.png'}
                      alt={item.title}
                      className="size-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.src = '/creation-unique.png'
                      }}
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    
                    {/* Badges */}
                    {isRecent(item.createdDate) && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-gold text-walnut text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="size-2.5" /> Nouveau
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between py-1 text-left relative z-10">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                        <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full border border-border">
                          <Calendar className="size-3 text-gold" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full border border-border">
                          <Clock className="size-3 text-gold" />
                          {getReadTime(item.content)}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-gold transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">
                        {item.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                      <Link
                        href="/contact?subject=actualite"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold hover:text-bronze transition-colors group/link"
                      >
                        En savoir plus 
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="size-3.5" />
                        </motion.span>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
