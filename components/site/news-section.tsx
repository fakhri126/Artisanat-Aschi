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

        <div className="flex flex-col gap-10 divide-y divide-gold/20">
          {news.map((item, i) => {
            const dateStr = new Date(item.createdDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })

            return (
              <Reveal key={item.id} delay={i * 150}>
                <motion.article 
                  className="group flex flex-col md:flex-row gap-8 pt-10 first:pt-0 pb-2 text-left relative overflow-hidden"
                >
                  {/* Image container */}
                  <div className="relative w-full md:w-64 aspect-[16/10] overflow-hidden rounded-xl bg-stone-900 shrink-0 border border-gold/15 shadow-md">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                      src={item.imageUrl || '/placeholder.png'}
                      alt={item.title}
                      className="size-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.src = '/creation-unique.png'
                      }}
                    />
                    
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
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-gold font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-gold" />
                          {dateStr}
                        </span>
                        <span className="text-gold/30">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-gold" />
                          {getReadTime(item.content)}
                        </span>
                      </div>
                      
                      <h3 className="font-heading text-2xl sm:text-3xl font-light text-foreground group-hover:text-gold transition-colors duration-300 leading-tight text-balance">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm font-light leading-relaxed text-muted-foreground max-w-3xl text-pretty">
                        {item.content}
                      </p>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/contact?subject=actualite"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-bronze transition-colors group/link"
                      >
                        En savoir plus 
                        <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-1" />
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
