'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Sparkles, Share2, Check, ArrowRight, ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react'
import { Reveal } from './reveal'
import { publicApi, News } from '@/lib/api'
import Image from 'next/image'

const getReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min de lecture`
}

const isRecent = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

const MOCK_NEWS: News[] = [
  {
    id: 0,
    title: 'Nouvelle Création : Armoire aux Céramiques Andalouses',
    content: "Découvrez notre toute dernière création sortie de l'atelier : une magnifique armoire en bois de noyer cérusé, ornée de quatre panneaux décoratifs uniques. Chaque panneau met en valeur notre savoir-faire : incrustations de céramique andalouse peinte à la main, boiseries minutieusement sculptées et cuir repoussé.\n\nCette pièce d'exception aux lignes épurées et aux détails d'art (poignées rondes peintes, entrées de serrure en laiton massif) est désormais disponible dans notre showroom. Une fusion parfaite entre l'héritage artisanal tunisien et le design contemporain.",
    imageUrl: '/images/bg-references.png',
    createdDate: new Date().toISOString()
  },
  {
    id: 1,
    title: 'Exposition Artisanale de Tunis — Le Salon National',
    content: "L'atelier Artisanat Aschi est fier d'annoncer sa participation officielle au Salon National de l'Artisanat au Kram. Venez découvrir nos nouvelles pièces uniques sculptées à la main et échanger avec nos maîtres artisans sculpteurs.\n\nPendant toute la durée de l'exposition, notre stand présentera nos dernières créations en noyer massif, nos miroirs d'époque dorés à la feuille d'or fin ainsi qu'une collection exclusive de poignées en céramique de majolique.\n\n📍 Rendez-vous au Parc des Expositions du Kram — Stand N° 42 (Hall Central).\n🔨 Démonstration de ciselage en direct tous les jours à 15h00 par Adel & Ismail Aschi.",
    imageUrl: '/news-exposition.jpg',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Transmission de Savoir-Faire : Nos Jeunes Compagnons',
    content: "Depuis sa fondation en 1960, la transmission des gestes nobles est au cœur des valeurs de l'Atelier Aschi. Ce mois-ci, nous célébrons le parcours de nos deux nouveaux apprentis sculpteurs.\n\nFormés quotidiennement par les compagnons de la maison, ils apprennent l'art exigeant du traçage au compas, du maniement de la gouge et de la sélection du bois de noyer noble séché au grand air.\n\nUne fierté pour notre maison d'artisanat qui préserve vivante la tradition ébéniste tunisienne.",
    imageUrl: '/news-apprentis.jpg',
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export function NewsSection() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        const [newsData, productsData] = await Promise.all([
          publicApi.getNews().catch(() => null),
          publicApi.getProducts().catch(() => null)
        ])
        
        let finalNews = newsData && newsData.length > 0 
          ? newsData.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          : [...MOCK_NEWS].filter(n => n.id !== 0)

        if (productsData && productsData.length > 0) {
          const availableProds = productsData.filter((p) => {
            const catName = p.category?.name?.toLowerCase() || ''
            const prodName = p.name?.toLowerCase() || ''
            const mat = p.materials?.toLowerCase() || ''

            const isCatalog = p.type === 'CATALOGUE' || catName.includes('catalogue') || catName.includes('inspiration') || prodName.includes('catalogue')
            const isBijoux = catName.includes('bijou') || catName.includes('poignée') || catName.includes('bouton') || catName.includes('porte') || catName.includes('ronds') || catName.includes('ovales') ||
                             prodName.includes('bijou') || prodName.includes('poignée') || prodName.includes('bouton') || prodName.includes('porte') ||
                             mat.includes('céramique') || mat.includes('majolique')
            return !isCatalog && !isBijoux
          })
          if (availableProds.length > 0) {
            const latestProduct = availableProds.sort((a, b) => b.id - a.id)[0]
            
            const productNews: News = {
              id: -latestProduct.id,
              title: `Nouvelle Création : ${latestProduct.name}`,
              content: `${latestProduct.description}\n\n📍 Cette pièce d'art est actuellement visible dans notre atelier.\n📏 Dimensions : ${latestProduct.dimensions || 'Sur-mesure'}\n🔨 Matériaux : ${latestProduct.materials || 'Bois noble massif'}\n\nUne fusion parfaite entre l'héritage artisanal tunisien et le design contemporain.`,
              imageUrl: latestProduct.images?.find((img) => img.isPrimary)?.imageUrl || latestProduct.images?.[0]?.imageUrl || '/placeholder.jpg',
              createdDate: new Date().toISOString()
            }
            
            finalNews = [productNews, ...finalNews]
          }
        }
        
        setNews(finalNews)
      } catch (err) {
        console.error('Error loading dynamic news:', err)
        setNews(MOCK_NEWS)
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [])

  // Autoplay Diaporama (every 7 seconds)
  useEffect(() => {
    if (!autoplay || news.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [autoplay, news.length])

  const nextSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev + 1) % news.length)
  }

  const prevSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <section id="actualites" className="bg-transparent py-12 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-[#E6A635] border-t-transparent mx-auto" />
      </section>
    )
  }

  if (news.length === 0) {
    return null
  }

  const currentItem = news[currentIndex] || news[0]
  const dateStr = new Date(currentItem.createdDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <section id="actualites" className="relative w-full overflow-hidden bg-transparent py-10 sm:py-16 lg:py-20 border-none scroll-mt-20">
      <div className="mx-auto max-w-5xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE (Harmonisé & Centré)                                */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Actualités &amp; Événements</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gold-gradient drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-tight">
              La Vie de Notre Maison d&apos;Art
            </h2>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. DIAPORAMA DES ACTUALITÉS (1 Seul Slide en Hauteur — Ultra-Compact)     */}
        {/* ========================================================================= */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.article 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="group flex flex-col md:flex-row gap-5 sm:gap-7 text-left relative overflow-hidden p-4 sm:p-6 md:p-7 rounded-3xl bg-[#3B271C]/90 backdrop-blur-2xl border-2 border-[#E6A635]/45 shadow-[0_20px_50px_rgba(0,0,0,0.75)] items-stretch md:items-center"
            >
              {/* Photo Thumbnail */}
              <div 
                onClick={() => setSelectedArticle(currentItem)}
                className="relative z-10 w-full md:w-80 aspect-[16/10] overflow-hidden rounded-2xl shrink-0 border-2 border-[#E6A635]/40 shadow-xl group/img cursor-pointer bg-[#241812]"
              >
                <Image
                  src={currentItem.imageUrl || '/news-exposition.jpg'}
                  alt={currentItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/90 via-transparent to-transparent pointer-events-none" />

                {/* Nouveau Badge */}
                {isRecent(currentItem.createdDate) && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles className="size-2.5" /> Nouveau
                    </span>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="relative z-10 flex flex-col justify-between py-1 flex-1 space-y-3">
                <div className="space-y-2">
                  
                  {/* Meta Tags (Date & Read Time) */}
                  <div className="inline-flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#F2BD52] font-semibold bg-[#241812]/90 backdrop-blur-md px-3 py-0.5 rounded-full border border-[#E6A635]/35 shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-[#E6A635]" />
                      {dateStr}
                    </span>
                    <span className="text-[#E6A635]/40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3 text-[#E6A635]" />
                      {getReadTime(currentItem.content)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => setSelectedArticle(currentItem)}
                    className="font-heading text-xl sm:text-2xl font-light text-white group-hover:text-[#F2BD52] drop-shadow transition-colors leading-snug cursor-pointer"
                  >
                    {currentItem.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm font-normal leading-relaxed text-white/90 drop-shadow line-clamp-3">
                    {currentItem.content}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E6A635]/20">
                  <button
                    onClick={() => setSelectedArticle(currentItem)}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#F2BD52] hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    <BookOpen className="size-3.5 text-[#E6A635]" />
                    <span>Lire l&apos;article complet</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-full bg-[#241812]/90 border border-[#E6A635]/35 text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] transition-all cursor-pointer shadow-md"
                    aria-label="Partager cet article"
                    title="Copier le lien"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
                  </button>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Controls Diaporama (Flèches Précédent / Suivant + Puces) */}
          {news.length > 1 && (
            <div className="mt-4 sm:mt-6 flex items-center justify-between px-2">
              
              {/* Counter Indicator */}
              <div className="text-[11px] uppercase tracking-widest text-[#F2BD52] font-semibold">
                <span>0{currentIndex + 1}</span>
                <span className="text-[#E6A635]/40 mx-1.5">/</span>
                <span className="text-white/60">0{news.length}</span>
              </div>

              {/* Dots / Puces */}
              <div className="flex items-center gap-1.5">
                {news.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAutoplay(false)
                      setCurrentIndex(idx)
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 h-1.5 bg-gradient-to-r from-[#F3C45E] to-[#E6A635]'
                        : 'w-1.5 h-1.5 bg-[#E6A635]/30 hover:bg-[#E6A635]/60'
                    }`}
                    aria-label={`Aller à l'actualité ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="size-8 sm:size-9 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] flex items-center justify-center transition-all cursor-pointer shadow-md"
                  aria-label="Actualité précédente"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  onClick={nextSlide}
                  className="size-8 sm:size-9 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] hover:bg-[#E6A635] hover:text-[#1A110B] flex items-center justify-center transition-all cursor-pointer shadow-md"
                  aria-label="Actualité suivante"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Full Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#3B271C] border-2 border-[#E6A635]/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-left"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52]"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>

              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 border border-[#E6A635]/40 bg-black">
                <Image
                  src={selectedArticle.imageUrl || '/news-exposition.jpg'}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-semibold mb-2">
                <Calendar className="size-3 text-[#E6A635]" />
                <span>{new Date(selectedArticle.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <h3 className="font-heading text-2xl text-gold-gradient mb-3">
                {selectedArticle.title}
              </h3>

              <p className="text-white text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line border-t border-[#E6A635]/25 pt-3">
                {selectedArticle.content}
              </p>

              <div className="mt-5 pt-3 border-t border-[#E6A635]/20 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 rounded-full border border-[#E6A635]/40 bg-[#241812] text-xs uppercase tracking-wider text-white hover:text-[#F2BD52]"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
