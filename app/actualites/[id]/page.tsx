'use client'

import { useState, useEffect, use } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi, News } from '@/lib/api'

export default function ActualiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [article, setArticle] = useState<News | null>(null)
  const [otherNews, setOtherNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await publicApi.getNews()
        const found = data.find(n => n.id.toString() === resolvedParams.id)
        if (found) {
          setArticle(found)
          setOtherNews(data.filter(n => n.id.toString() !== resolvedParams.id))
        } else {
          setArticle(null)
        }
      } catch (err) {
        console.error('Error fetching news detail:', err)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col text-[#3A2A21] justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8DCCB] border-t-transparent"></div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen flex flex-col text-[#3A2A21] justify-center items-center">
        <p className="text-[#3A2A21]/60">Actualité non trouvée.</p>
        <Link href="/#actualites" className="mt-4 text-[#C17D59] hover:underline text-xs uppercase tracking-widest">
          Retour à l&apos;accueil
        </Link>
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
    <main className="min-h-screen flex flex-col text-[#3A2A21]">
      <Navbar />

      <article className="flex-1 pt-28 pb-24 px-5 sm:px-8 max-w-4xl mx-auto w-full text-left">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/#actualites"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C17D59] hover:text-white transition-colors group font-semibold"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Retour aux actualités
          </Link>
        </div>

        {/* Article Category & Meta Header */}
        <Reveal className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-[#C17D59] font-semibold">
            <span className="bg-[#E8DCCB]/10 border border-[#E8DCCB]/20 px-3 py-1 rounded-full text-[10px] text-[#C17D59] inline-flex items-center gap-1.5">
              <Sparkles className="size-3" /> Actualité de l&apos;Atelier
            </span>
            <span className="text-[#C17D59]/40">•</span>
            <span className="flex items-center gap-1.5 text-[#3A2A21]/60">
              <Calendar className="size-3.5 text-[#C17D59]" /> {dateFormatted}
            </span>
            <span className="text-[#C17D59]/40">•</span>
            <span className="flex items-center gap-1.5 text-[#3A2A21]/60">
              <Clock className="size-3.5 text-[#C17D59]" /> Lecture : {readTime}
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white font-medium leading-tight text-balance">
            {article.title}
          </h1>
        </Reveal>

        {/* Featured Image */}
        <Reveal delay={100} className="mb-12">
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[#E8DCCB]/20 shadow-2xl bg-stone-900">
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
          <div className="bg-stone-950/40 p-6 md:p-10 rounded-3xl border border-[#E8DCCB]/15 shadow-xl text-[#3A2A21]/90 leading-relaxed font-light text-base sm:text-lg space-y-6 whitespace-pre-line text-pretty">
            {article.content}
          </div>
        </Reveal>

        {/* Article Footer Signature */}
        <div className="mt-10 pt-6 border-t border-[#E8DCCB]/15 flex items-center">
          <span className="text-xs text-[#3A2A21]/50 uppercase tracking-widest">Maison Artisanat Aschi</span>
        </div>

        {/* Related Articles Section */}
        {otherNews.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8DCCB]/15">
            <h3 className="font-heading text-2xl text-white mb-8">D&apos;autres actualités de l&apos;Atelier</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {otherNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/actualites/${item.id}`}
                  className="bg-stone-950/30 border border-[#E8DCCB]/10 rounded-2xl p-5 hover:border-[#E8DCCB]/30 hover:bg-stone-950/60 transition-all flex gap-4 items-center group"
                >
                  <div className="relative size-20 rounded-xl overflow-hidden shrink-0 bg-stone-900 border border-white/10">
                    <Image
                      src={item.imageUrl || '/news-exposition.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C17D59] uppercase tracking-wider font-semibold">
                      {new Date(item.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <h4 className="font-heading text-lg text-white group-hover:text-[#C17D59] transition-colors line-clamp-2">
                      {item.title}
                    </h4>
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
