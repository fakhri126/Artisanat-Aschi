'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ArrowRight, Clock, Sparkles, X, Feather, Share2, Check, MapPin } from 'lucide-react'
import { Reveal } from './reveal'
import { publicApi, News } from '@/lib/api'

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
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await publicApi.getNews()
        const sorted = data.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        setNews(sorted)
      } catch (err) {
        console.error('Error loading news from API, using fallback data:', err)
        setNews([
          {
            id: 1,
            title: 'Exposition Artisanale de Tunis 2026',
            content: "L'atelier Artisanat Aschi est fier d'annoncer sa participation officielle au Salon National de l'Artisanat au Kram. Venez découvrir nos nouvelles pièces uniques sculptées à la main et échanger avec nos maîtres artisans sculpteurs.\n\nPendant toute la durée de l'exposition, notre stand présentera nos dernières créations en noyer massif, nos miroirs d'époque dorés à la feuille d'or fin ainsi qu'une collection exclusive de poignées en céramique de majolique.\n\n📍 Rendez-vous au Parc des Expositions du Kram — Stand N° 42 (Hall Central).\n🔨 Démonstration de ciselage en direct tous les jours à 15h00 par Adel & Ismail Aschi.",
            imageUrl: '/news-exposition.jpg',
            createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            title: 'Transmission de Savoir-Faire : Nos Jeunes Apprentis',
            content: "Depuis sa fondation en 1960 à Bab Jdid, la transmission des gestes nobles est au cœur des valeurs de l'Atelier Aschi. Ce mois-ci, nous célébrons le parcours de nos deux nouveaux apprentis sculpteurs.\n\nFormés quotidiennement par les compagnons de la maison, Youssef et Malek apprennent l'art exigeant du traçage au compas, du maniement de la gouge et de la sélection du bois de noyer noble séché au grand air de La Goulette.\n\nUne fierté pour notre maison d'artisanat qui préserve vivante la tradition ébéniste tunisienne.",
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <section id="actualites" className="bg-[#1a1512] py-20 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent mx-auto"></div>
      </section>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <section id="actualites" className="bg-[#1a1512] py-24 md:py-36 border-t border-gold/15 relative overflow-hidden text-ivory">
      {/* Background ambient gold lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-gold/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
        {/* Section Title */}
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-[0.2em] mb-4 font-semibold shadow-sm">
            <Feather className="size-3.5" /> Actualités &amp; Événements
          </div>
          <h2 className="font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-white text-balance max-w-3xl mx-auto">
            La vie de notre maison d&apos;art
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-ivory/70">
            Suivez les temps forts de l&apos;atelier : expositions nationales, vie des artisans, nouvelles collections et projets d&apos;exception.
          </p>
        </Reveal>

        {/* List of News */}
        <div className="flex flex-col gap-10 divide-y divide-gold/20">
          {news.map((item, i) => {
            const dateStr = new Date(item.createdDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })

            const isExpanded = selectedNews?.id === item.id;

            return (
              <Reveal key={item.id} delay={i * 150}>
                <motion.article 
                  layout
                  className="group flex flex-col md:flex-row gap-8 pt-10 first:pt-0 pb-2 text-left relative overflow-hidden"
                >
                  {/* Photo thumbnail */}
                  <div 
                    onClick={() => setSelectedNews(isExpanded ? null : item)}
                    className="relative w-full md:w-72 aspect-[16/10] overflow-hidden rounded-2xl bg-stone-950 shrink-0 border border-gold/25 shadow-xl group cursor-pointer"
                  >
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.7 }}
                      src={item.imageUrl || '/news-exposition.jpg'}
                      alt={item.title}
                      className="size-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.src = '/news-exposition.jpg'
                      }}
                    />
                    
                    {isRecent(item.createdDate) && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-gold text-walnut text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="size-2.5" /> Nouveau
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary & Expanded content */}
                  <div className="flex flex-col justify-between py-1 flex-1 space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-gold font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-gold" />
                          {dateStr}
                        </span>
                        <span className="text-gold/40">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-gold" />
                          {getReadTime(item.content)}
                        </span>
                      </div>

                      <h3 
                        onClick={() => setSelectedNews(isExpanded ? null : item)}
                        className="font-heading text-2xl sm:text-3xl font-light text-white group-hover:text-gold transition-colors duration-300 leading-tight text-balance cursor-pointer"
                      >
                        {item.title}
                      </h3>

                      <AnimatePresence mode="wait">
                        {!isExpanded ? (
                          <motion.p
                            key="excerpt"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm font-light leading-relaxed text-ivory/70 max-w-3xl text-pretty line-clamp-3"
                          >
                            {item.content}
                          </motion.p>
                        ) : (
                          <motion.div
                            key="fullcontent"
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 bg-[#f4ead5] text-stone-900 p-6 md:p-8 rounded-tr-3xl rounded-bl-3xl border border-[#d4af37]/40 shadow-inner relative">
                              <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
                                <Feather className="size-10 text-[#8b5a2b]" />
                              </div>
                              
                              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8b5a2b] mb-4 flex items-center gap-2">
                                ⚜️ Le Carnet de l&apos;Atelier
                              </h4>
                              
                              <div className="prose prose-sm md:prose-base prose-stone max-w-none relative z-10">
                                <p className="font-serif text-[15px] md:text-base leading-relaxed whitespace-pre-line text-[#3e2723]">
                                  {item.content}
                                </p>
                              </div>
                              
                              <div className="mt-6 flex justify-between items-center border-t border-[#8b5a2b]/20 pt-4 relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5a2b]/80">
                                  Maison Artisanat Aschi
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare();
                                  }}
                                  className="text-[10px] uppercase tracking-wider text-[#8b5a2b] hover:text-[#5c3a21] flex items-center gap-1.5 transition-colors font-bold bg-[#8b5a2b]/10 px-3 py-1.5 rounded-full"
                                >
                                  {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
                                  {copied ? "Lien copié" : "Partager"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => setSelectedNews(isExpanded ? null : item)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold hover:text-white bg-gold/10 hover:bg-gold/20 border border-gold/30 px-5 py-2.5 rounded-full transition-all shadow-md group/btn cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            Fermer le carnet <X className="size-3.5 transition-transform group-hover/btn:rotate-90" />
                          </>
                        ) : (
                          <>
                            En savoir plus <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </>
                        )}
                      </button>
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
