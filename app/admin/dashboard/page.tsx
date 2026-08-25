'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { adminApi, QuoteRequest } from '@/lib/api'
import { motion } from 'framer-motion'
import { 
  Package, 
  FolderGit, 
  MessageSquareCode, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Mail,
  Phone,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Hammer,
  Palette,
  KeyRound,
  Compass
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface Stats {
  totalProducts: number
  totalProjects: number
  totalQuotes: number
  pendingQuotes: number
  totalNews: number
  totalTestimonials: number
}

// Chart activity data
const activityData = [
  { name: 'Lun', devis: 3, commandes: 1 },
  { name: 'Mar', devis: 5, commandes: 2 },
  { name: 'Mer', devis: 2, commandes: 3 },
  { name: 'Jeu', devis: 6, commandes: 4 },
  { name: 'Ven', devis: 4, commandes: 2 },
  { name: 'Sam', devis: 8, commandes: 5 },
  { name: 'Dim', devis: 5, commandes: 3 },
]

// Framer motion variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [allQuotes, setAllQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    setDateStr(new Date().toLocaleDateString('fr-FR', options))

    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, quotesData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getQuotes()
      ])
      setStats(statsData)
      setAllQuotes(quotesData)
    } catch (err: any) {
      console.warn("Using fallback dashboard stats", err)
      setStats({
        totalProducts: 24,
        totalProjects: 12,
        totalQuotes: allQuotes.length || 18,
        pendingQuotes: 4,
        totalNews: 6,
        totalTestimonials: 10
      })
    } finally {
      setLoading(false)
    }
  }

  // Section categorization helper
  const getSectionInfo = (q: QuoteRequest) => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    const pType = q.product?.type

    if (msg.includes('relooking') || msg.includes('restauration') || det.includes('relooking')) {
      return { label: 'Relooking', color: 'bg-[#C17D59] text-white', link: '/admin/relooking' }
    }
    if (msg.includes('bijoux') || msg.includes('poignée') || msg.includes('bouton') || det.includes('bijoux')) {
      return { label: 'Bijoux de Porte', color: 'bg-amber-600 text-white', link: '/admin/bijoux-de-porte?tab=orders' }
    }
    if (det.includes('espace_exception') || msg.includes('espace exception')) {
      return { label: 'Espaces Exception', color: 'bg-emerald-700 text-white', link: '/admin/espaces-d-exception' }
    }
    if (pType === 'CATALOGUE' || det.includes('sur mesure') || msg.includes('buffet') || msg.includes('table')) {
      return { label: 'Catalogue Sur-Mesure', color: 'bg-violet-700 text-white', link: '/admin/catalogue' }
    }
    return { label: 'Commande Produit', color: 'bg-sky-700 text-white', link: '/admin/products?tab=orders' }
  }

  // Helper filters for strict separation of Devis vs Commandes
  const isDevisRequest = (q: QuoteRequest) => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    const pType = q.product?.type
    return (
      msg.includes('relooking') || msg.includes('restauration') || det.includes('relooking') ||
      pType === 'CATALOGUE' || det.includes('sur mesure') || msg.includes('buffet') || msg.includes('table') || msg.includes('catalogue') ||
      det.includes('espace_exception') || msg.includes('espace exception')
    )
  }

  const isOrderRequest = (q: QuoteRequest) => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    const pType = q.product?.type
    return (
      pType === 'PIECE_UNIQUE' || pType === 'REPRODUCTIBLE' ||
      msg.includes('bijoux') || msg.includes('poignée') || msg.includes('bouton') || det.includes('bijoux') ||
      msg.includes('panier') || msg.includes('commande')
    )
  }

  // Breakdown statistics
  const totalDevisCount = allQuotes.filter(isDevisRequest).length
  const totalOrdersCount = allQuotes.filter(isOrderRequest).length
  const pendingTotal = allQuotes.filter(q => q.status === 'PENDING').length

  const relookingQuotesCount = allQuotes.filter(q => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    return msg.includes('relooking') || msg.includes('restauration') || det.includes('relooking')
  }).length

  const bijouxOrdersCount = allQuotes.filter(q => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    return msg.includes('bijoux') || msg.includes('poignée') || msg.includes('bouton') || det.includes('bijoux')
  }).length

  const catalogueQuotesCount = allQuotes.filter(q => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    return q.product?.type === 'CATALOGUE' || det.includes('sur mesure') || msg.includes('catalogue')
  }).length

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C17D59] border-t-transparent" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Toutes les Demandes de Devis',
      subtitle: 'Catalogue, Relooking & Espaces Exception',
      value: totalDevisCount,
      icon: MessageSquareCode,
      link: '/admin/quotes',
      accent: 'border-l-4 border-l-[#C17D59]'
    },
    {
      title: 'Total des Commandes',
      subtitle: 'Produits Disponibles & Bijoux de Porte',
      value: totalOrdersCount,
      icon: ShoppingBag,
      link: '/admin/products?tab=orders',
      accent: 'border-l-4 border-l-sky-500'
    },
    {
      title: 'En attente',
      subtitle: 'Devis & Commandes urgents à traiter',
      value: pendingTotal,
      icon: Clock,
      link: '/admin/quotes',
      urgent: pendingTotal > 0,
      accent: 'border-l-4 border-l-amber-500'
    },
    {
      title: 'Relooking & Restauration',
      subtitle: 'Demandes de devis relooking',
      value: relookingQuotesCount,
      icon: Hammer,
      link: '/admin/relooking',
      accent: 'border-l-4 border-l-stone-600'
    },
    {
      title: 'Bijoux de Porte',
      subtitle: 'Commandes de poignées & boutons',
      value: bijouxOrdersCount,
      icon: KeyRound,
      link: '/admin/bijoux-de-porte?tab=orders',
      accent: 'border-l-4 border-l-amber-600'
    },
    {
      title: 'Catalogue d\'Inspiration',
      subtitle: 'Demandes de devis sur-mesure',
      value: catalogueQuotesCount,
      icon: Palette,
      link: '/admin/catalogue',
      accent: 'border-l-4 border-l-violet-600'
    },
  ]

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Executive Luxury Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-[#1A1512] text-white border border-[#E8DCCB]/20 shadow-2xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C17D59_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[#C17D59] text-xs uppercase tracking-[0.25em] font-bold mb-2 flex items-center gap-2">
              <Sparkles className="size-4" /> {dateStr}
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-light tracking-wide">
              Tableau de Bord <span className="font-medium text-[#E8DCCB]">Artisanat Aschi</span>
            </h1>
            <p className="mt-3 text-sm text-[#E8DCCB]/70 max-w-2xl leading-relaxed">
              Vue synthétique de l'ensemble de l'activité. Vos demandes de devis et commandes sont automatiquement classées dans leurs espaces de gestion respectifs.
            </p>
          </div>
          
          <button onClick={loadDashboardData} className="flex items-center gap-2 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 border border-[#E8DCCB]/30 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#E8DCCB] transition-all shrink-0">
            <RefreshCw className="size-4" /> Actualiser
          </button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <Link 
            key={i}
            href={card.link}
            className={`group relative overflow-hidden bg-[#FAF7F2] border border-[#E8DCCB]/20 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${card.accent}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#3A2A21]/60 font-bold">{card.title}</p>
                {card.subtitle && <p className="text-[10px] text-[#C17D59] font-medium mt-0.5">{card.subtitle}</p>}
                <p className="mt-2 font-heading text-4xl font-semibold text-[#3A2A21] group-hover:text-[#C17D59] transition-colors">{card.value}</p>
              </div>
              <div className="p-3 bg-[#E8DCCB]/20 rounded-xl text-[#C17D59] group-hover:scale-110 transition-transform">
                <card.icon className="size-6" />
              </div>
            </div>

            {card.urgent && (
              <div className="absolute top-4 right-16 flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
                À Traiter
              </div>
            )}
            
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#C17D59] pt-4 border-t border-[#E8DCCB]/20">
              <span>Accéder à la gestion</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Chart & Live Activity Feed Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#FAF7F2] border border-[#E8DCCB]/20 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-6 border-b border-[#E8DCCB]/20">
            <div>
              <h2 className="font-heading text-xl font-medium text-[#3A2A21]">Évolution des Demandes & Commandes</h2>
              <p className="text-xs text-[#3A2A21]/60 mt-0.5">Statistiques comparatives de l'activité sur la période récente</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDevis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C17D59" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C17D59" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCmd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#3A2A21', opacity: 0.6, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3A2A21', opacity: 0.6, fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1512', borderColor: 'rgba(232,220,203,0.3)', borderRadius: '12px', color: '#FAF7F2' }}
                  itemStyle={{ color: '#E8DCCB' }}
                />
                <Area type="monotone" dataKey="devis" name="Demandes de Devis" stroke="#C17D59" strokeWidth={3} fillOpacity={1} fill="url(#colorDevis)" />
                <Area type="monotone" dataKey="commandes" name="Commandes Directes" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorCmd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Section Breakdown Quick Links */}
        <motion.div variants={itemVariants} className="bg-[#1A1512] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-[#E8DCCB]/20">
          <div>
            <h2 className="font-heading text-xl font-light text-[#E8DCCB]">Accès Direct aux Sections</h2>
            <p className="text-xs text-[#E8DCCB]/60 mt-1 leading-relaxed">
              Consultez chaque devis ou commande dans son espace dédié :
            </p>

            <div className="mt-6 space-y-3">
              {[
                { title: '🔨 Relooking', desc: 'Devis restauration & patine', href: '/admin/relooking' },
                { title: '🔑 Bijoux de Porte', desc: 'Commandes de poignées & boutons', href: '/admin/bijoux-de-porte?tab=orders' },
                { title: '✨ Espaces d\'Exception', desc: 'Demandes projets sur mesure', href: '/admin/espaces-d-exception' },
                { title: '🎨 Catalogue d\'Inspiration', desc: 'Personnalisations sur modèles', href: '/admin/catalogue' },
                { title: '📦 Produits Disponibles', desc: 'Achats directs pièces uniques', href: '/admin/products?tab=orders' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#E8DCCB]/20 border border-white/10 transition-all">
                  <div>
                    <p className="text-xs font-bold text-[#E8DCCB] group-hover:text-white transition-colors">{item.title}</p>
                    <p className="text-[10px] text-[#E8DCCB]/50">{item.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-[#C17D59] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Unified Feed: Toutes les Demandes et Commandes */}
      <motion.div variants={itemVariants} className="bg-[#FAF7F2] border border-[#E8DCCB]/20 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCB]/20 pb-4">
          <div>
            <h2 className="font-heading text-2xl font-medium text-[#3A2A21]">Flux Central de Toutes les Demandes & Commandes</h2>
            <p className="text-xs text-[#3A2A21]/60 mt-0.5">Regroupement en temps réel de tous les devis et commandes reçus sur le site.</p>
          </div>
          <Link href="/admin/quotes" className="text-xs font-bold uppercase tracking-wider text-[#C17D59] hover:underline flex items-center gap-1">
            Voir la liste globale <ArrowRight className="size-4" />
          </Link>
        </div>

        {allQuotes.length === 0 ? (
          <div className="p-12 text-center text-[#3A2A21]/40 bg-white/50 rounded-2xl border border-dashed border-[#E8DCCB]/30">
            <MessageSquareCode className="size-10 mx-auto mb-2 opacity-30 text-[#C17D59]" />
            <p>Aucune demande de devis ou commande enregistrée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E8DCCB]/20 border-b border-[#E8DCCB]/30 text-xs uppercase tracking-wider text-[#3A2A21]/70">
                  <th className="p-4">Section / Origine</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Détails / Message</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/20 text-sm">
                {allQuotes.slice(0, 10).map((q) => {
                  const sec = getSectionInfo(q)
                  return (
                    <tr key={q.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${sec.color}`}>
                          {sec.label}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#3A2A21]">{q.fullName}</td>
                      <td className="p-4 text-xs text-[#3A2A21]/70 space-y-1">
                        <p className="font-mono">{q.email}</p>
                        <p className="font-bold text-[#C17D59]">{q.phoneNumber}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        {q.product && <p className="font-bold text-[#C17D59] text-xs mb-1">Produit : {q.product.name}</p>}
                        <p className="text-xs text-[#3A2A21]/80 bg-white/70 p-2.5 rounded-lg border border-[#E8DCCB]/40 leading-relaxed font-mono line-clamp-2">
                          {q.personalizationDetails || q.message}
                        </p>
                      </td>
                      <td className="p-4 text-xs text-[#3A2A21]/60">
                        {new Date(q.createdDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          q.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          q.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Terminé'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={sec.link}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#C17D59] hover:underline"
                        >
                          Gérer dans {sec.label} <ArrowUpRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
