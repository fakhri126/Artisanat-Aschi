'use client'

import { useState, useEffect, use } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Share2, Sparkles, Newspaper, Bookmark, Check } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi, News } from '@/lib/api'

const FALLBACK_NEWS: News[] = [
  {
    id: 1,
    title: 'Exposition Artisanale de Tunis 2026',
    content: `L'Atelier Artisanat Aschi a le plaisir d'annoncer sa participation officielle au Salon National de l'Artisanat au Kram.

Pendant dix jours, notre maison présentera une sélection exclusive de ses plus belles pièces sculptées à la main. Vous pourrez y admirer des commodes en noyer massif aux arabesques ciselées, des miroirs Ottomans dorés à la feuille d'or fin, ainsi qu'une avant-première de notre nouvelle ligne de céramiques de majolique.

Démonstrations en direct :
Chaque jour à 15h, nos maîtres artisans Adel et Ismail Aschi animeront des ateliers de démonstration publique. Vous découvrirez les techniques ancestrales du traçage au compas de laiton, de la taille à la gouge et du polissage à la cire d'abeille naturelle.

Informations Pratiques :
• Lieu : Parc des Expositions du Kram, Stand N° 42
• Dates : Du 10 au 20 Avril 2026
• Horaires : De 10h00 à 19h00`,
    imageUrl: '/news-exposition.jpg',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Transmission de Savoir-Faire : Nos Jeunes Apprentis',
    content: `Depuis sa fondation en 1960 par Hechmi Aschi à Bab Jdid, la transmission des gestes nobles est le véritable cœur battant de notre maison d'art.

Ce mois-ci, nous mettons à l'honneur Youssef et Malek, nos deux nouveaux apprentis ébénistes sculpteurs qui ont rejoint l'atelier de La Goulette après deux ans de sélection rigoureuse.

Un Apprentissage Exigeant :
Pendant trois années, sous la tutelle directe des frères Aschi, ils apprennent la patience du travail du bois de noyer noble : comprendre la fibre du bois, sélectionner les meilleures pièces séchées naturellement au bord de la mer, affûter les ciseaux d'ébéniste et maîtriser l'équilibre des volumes.

"Transmettre, ce n'est pas simplement enseigner une technique, c'est léguer une passion et le respect du travail bien fait." — Adel Aschi`,
    imageUrl: '/news-apprentis.jpg',
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function ActualiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [article, setArticle] = useState<News | null>(null)
  const [otherNews, setOtherNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await publicApi.getNews()
        const found = data.find(n => n.id.toString() === resolvedParams.id)
        if (found) {
          setArticle(found)
          setOtherNews(data.filter(n => n.id.toString() !== resolvedParams.id))
        } else {
          // Fallback to static news item
          const fallbackFound = FALLBACK_NEWS.find(n => n.id.toString() === resolvedParams.id) || FALLBACK_NEWS[0]
          setArticle(fallbackFound)
          setOtherNews(FALLBACK_NEWS.filter(n => n.id !== fallbackFound.id))
        }
      } catch (err) {
        console.error('Error fetching news detail:', err)
        const fallbackFound = FALLBACK_NEWS.find(n => n.id.toString() === resolvedParams.id) || FALLBACK_NEWS[0]
        setArticle(fallbackFound)
        setOtherNews(FALLBACK_NEWS.filter(n => n.id !== fallbackFound.id))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resolvedParams.id])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-walnut text-ivory justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen flex flex-col bg-walnut text-ivory justify-center items-center">
        <p className="text-ivory/60">Actualité non trouvée.</p>
        <Link href="/#actualites" className="mt-4 text-gold hover:underline text-xs uppercase tracking-widest">Retour à l&apos;accueil</Link>
      </main>
    )
  }

  const dateFormatted = new Date(article.createdDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const words = article.content.trim().split(/\s+/).length
  const readTime = `${Math.max(1, Math.ceil(words / 200))} min`

  return (
    <main className="min-h-screen flex flex-col bg-walnut text-ivory">
      <Navbar />

      <article className="flex-1 pt-28 pb-24 px-5 sm:px-8 max-w-4xl mx-auto w-full text-left">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/#actualites"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold hover:text-white transition-colors group font-semibold"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Retour aux actualités
          </Link>
        </div>

        {/* Article Category & Meta Header */}
        <Reveal className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-gold font-semibold">
            <span className="bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-[10px] text-gold inline-flex items-center gap-1.5">
              <Sparkles className="size-3" /> Actualité de l&apos;Atelier
            </span>
            <span className="text-gold/40">•</span>
            <span className="flex items-center gap-1.5 text-ivory/60">
              <Calendar className="size-3.5 text-gold" /> {dateFormatted}
            </span>
            <span className="text-gold/40">•</span>
            <span className="flex items-center gap-1.5 text-ivory/60">
              <Clock className="size-3.5 text-gold" /> Lecture : {readTime}
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white font-medium leading-tight text-balance">
            {article.title}
          </h1>
        </Reveal>

        {/* Featured Image */}
        <Reveal delay={100} className="mb-12">
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-gold/20 shadow-2xl bg-stone-900">
            <Image
              src={article.imageUrl || '/news-exposition.jpg'}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-walnut/60 via-transparent to-black/20" />
          </div>
        </Reveal>

        {/* Article Body Content */}
        <Reveal delay={150} className="prose prose-invert max-w-none space-y-6">
          <div className="bg-stone-950/40 p-6 md:p-10 rounded-3xl border border-gold/15 shadow-xl text-ivory/90 leading-relaxed font-light text-base sm:text-lg space-y-6 whitespace-pre-line text-pretty">
            {article.content}
          </div>
        </Reveal>

        {/* Article Actions & Share */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ivory/50 uppercase tracking-widest">Maison Artisanat Aschi</span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-walnut transition-all"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-400" /> Lien copié !
              </>
            ) : (
              <>
                <Share2 className="size-3.5" /> Partager cet article
              </>
            )}
          </button>
        </div>

        {/* Related Articles Section */}
        {otherNews.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gold/15">
            <h3 className="font-heading text-2xl text-white mb-8">D&apos;autres actualités de l&apos;Atelier</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {otherNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/actualites/${item.id}`}
                  className="bg-stone-950/30 border border-gold/10 rounded-2xl p-5 hover:border-gold/30 hover:bg-stone-950/60 transition-all flex gap-4 items-center group"
                >
                  <div className="relative size-20 rounded-xl overflow-hidden shrink-0 bg-stone-900 border border-white/10">
                    <Image src={item.imageUrl || '/news-exposition.jpg'} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                      {new Date(item.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <h4 className="font-heading text-lg text-white group-hover:text-gold transition-colors line-clamp-2">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  )
}
