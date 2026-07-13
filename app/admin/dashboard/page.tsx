'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, QuoteRequest } from '@/lib/api'
import { 
  Package, 
  FolderGit, 
  MessageSquareCode, 
  MessageSquare, 
  Newspaper, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react'

interface Stats {
  totalProducts: number
  totalProjects: number
  totalQuotes: number
  pendingQuotes: number
  totalNews: number
  totalTestimonials: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        const statsData = await adminApi.getStats()
        setStats(statsData)

        const productsData = await adminApi.getProducts()
        setProducts(productsData)

        const quotesData = await adminApi.getQuotes()
        setRecentQuotes(quotesData.slice(0, 5)) // show top 5 recent
      } catch (err: any) {
        setError(err.message || "Impossible de charger les données du tableau de bord.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400">
        <p className="font-semibold">Erreur de chargement</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  const creationsCount = products.filter(p => p.type === 'PIECE_UNIQUE' || p.type === 'REPRODUCTIBLE').length
  const catalogueCount = products.filter(p => p.type === 'CATALOGUE').length

  const statCards = [
    {
      title: 'Créations Disponibles',
      value: creationsCount,
      icon: Package,
      link: '/admin/products',
      color: 'from-blue-600/10 to-cyan-600/10 border-blue-500/10 text-blue-500',
    },
    {
      title: 'Catalogue d\'Inspiration',
      value: catalogueCount,
      icon: Package,
      link: '/admin/catalogue',
      color: 'from-cyan-600/10 to-emerald-600/10 border-emerald-500/10 text-teal-500',
    },
    {
      title: 'Réalisations',
      value: stats?.totalProjects ?? 0,
      icon: FolderGit,
      link: '/admin/projects',
      color: 'from-amber-600/10 to-orange-600/10 border-orange-500/10 text-amber-500',
    },
    {
      title: 'Devis Totaux',
      value: stats?.totalQuotes ?? 0,
      icon: MessageSquareCode,
      link: '/admin/quotes',
      color: 'from-purple-600/10 to-indigo-600/10 border-indigo-500/10 text-indigo-500',
    },
    {
      title: 'Devis en Attente',
      value: stats?.pendingQuotes ?? 0,
      icon: Clock,
      link: '/admin/quotes',
      color: 'from-rose-600/10 to-red-600/10 border-red-500/25 text-red-500',
      badge: stats?.pendingQuotes && stats.pendingQuotes > 0 ? 'Urgent' : null,
    },
    {
      title: 'Actualités',
      value: stats?.totalNews ?? 0,
      icon: Newspaper,
      link: '/admin/news',
      color: 'from-pink-600/10 to-rose-600/10 border-pink-500/10 text-pink-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-light text-foreground">Vue d&apos;ensemble</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bienvenue dans votre espace d&apos;administration. Gérez vos produits, vos actualités et suivez vos demandes de devis.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className={`group relative overflow-hidden bg-gradient-to-br ${card.color} bg-background border p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{card.title}</p>
                <p className="mt-4 font-heading text-4xl font-light text-foreground">{card.value}</p>
              </div>
              <div className="p-3 bg-background border border-border rounded-xl">
                <card.icon className="size-6" />
              </div>
            </div>
            {card.badge && (
              <span className="absolute top-4 right-20 bg-red-500 text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                {card.badge}
              </span>
            )}
            <Link 
              href={card.link}
              className="mt-6 flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-gold transition-colors pt-4 border-t border-border"
            >
              Gérer la section <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Quotes List */}
        <div className="lg:col-span-2 bg-background border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="font-heading text-xl font-medium text-foreground">Demandes de devis récentes</h2>
              <Link href="/admin/quotes" className="text-xs font-medium text-gold hover:underline">Voir tout</Link>
            </div>
            <div className="mt-4 space-y-4">
              {recentQuotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune demande de devis reçue pour le moment.</p>
              ) : (
                recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary/40 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{quote.fullName}</p>
                      <p className="text-xs text-muted-foreground">{quote.email} · {quote.phoneNumber}</p>
                      {quote.product && (
                        <p className="text-xs text-gold/80 font-medium">Concerne : {quote.product.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date(quote.createdDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        quote.status === 'PENDING' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                        quote.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                      }`}>
                        {quote.status === 'PENDING' ? 'En attente' :
                         quote.status === 'CONTACTED' ? 'Contacté' :
                         'Terminé'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-walnut text-ivory border border-gold/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-xl font-medium text-gold pb-4 border-b border-gold/10">Actions rapides</h2>
            <div className="mt-6 space-y-4">
              <Link 
                href="/admin/products"
                className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-gold/10 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">Ajouter un produit</p>
                  <p className="text-[10px] text-ivory/60">Ajouter une pièce unique ou un modèle</p>
                </div>
                <ArrowUpRight className="size-4 text-gold" />
              </Link>

              <Link 
                href="/admin/projects"
                className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-gold/10 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">Nouvelle réalisation</p>
                  <p className="text-[10px] text-ivory/60">Publier un projet hôtelier ou villa de luxe</p>
                </div>
                <ArrowUpRight className="size-4 text-gold" />
              </Link>

              <Link 
                href="/admin/news"
                className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-gold/10 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">Publier une actualité</p>
                  <p className="text-[10px] text-ivory/60">Informer sur les expositions ou ateliers</p>
                </div>
                <ArrowUpRight className="size-4 text-gold" />
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-[10px] text-gold/60 uppercase tracking-widest font-mono pt-4 border-t border-gold/10">
            Artisanat Aschi depuis 1960
          </div>
        </div>
      </div>
    </div>
  )
}
