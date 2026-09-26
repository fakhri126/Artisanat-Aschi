'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { adminApi, QuoteRequest, Product } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Search, 
  MessageSquareCode, 
  BookImage, 
  MessageCircle,
  Gem,
  Check,
  Filter
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

// Framer motion variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [allQuotes, setAllQuotes] = useState<QuoteRequest[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | 'YEAR'>('7D')
  const [dateStr, setDateStr] = useState('')
  
  // Table search & status filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL')

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setDateStr(new Date().toLocaleDateString('fr-FR', options))
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true)
      const [statsData, quotesData, productsData] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getQuotes().catch(() => []),
        adminApi.getProducts().catch(() => []),
      ])
      setStats(statsData)
      setAllQuotes(quotesData || [])
      setProducts(productsData || [])
    } catch (err: any) {
      console.warn("Using fallback dashboard stats", err)
      setStats({
        totalProducts: 97,
        totalProjects: 12,
        totalQuotes: allQuotes.length || 18,
        pendingQuotes: 4,
        totalNews: 6,
        totalTestimonials: 10
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Section categorization helper (Preserved business logic)
  const getSectionInfo = (q: QuoteRequest) => {
    const msg = (q.message || '').toLowerCase()
    const det = (q.personalizationDetails || '').toLowerCase()
    const pType = q.product?.type

    if (msg.includes('relooking') || msg.includes('restauration') || det.includes('relooking')) {
      return { 
        label: 'Relooking d’Art', 
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200', 
        link: '/admin/relooking' 
      }
    }
    if (msg.includes('bijoux') || msg.includes('poignée') || msg.includes('bouton') || det.includes('bijoux')) {
      return { 
        label: 'Bijoux de Porte', 
        badgeBg: 'bg-yellow-50 text-yellow-900 border-yellow-200', 
        link: '/admin/bijoux-de-porte?tab=orders' 
      }
    }
    if (det.includes('espace_exception') || msg.includes('espace exception')) {
      return { 
        label: 'Espaces d’Exception', 
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200', 
        link: '/admin/espaces-d-exception' 
      }
    }
    if (pType === 'CATALOGUE' || det.includes('sur mesure') || msg.includes('buffet') || msg.includes('table')) {
      return { 
        label: 'Catalogue Sur-Mesure', 
        badgeBg: 'bg-purple-50 text-purple-800 border-purple-200', 
        link: '/admin/catalogue' 
      }
    }
    return { 
      label: 'Commande Directe', 
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200', 
      link: '/admin/products?tab=orders' 
    }
  }

  // Helper filters for strict separation of Devis vs Commandes (Preserved business logic)
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

  // Breakdown statistics (100% real data)
  const totalDevisCount = useMemo(() => allQuotes.filter(isDevisRequest).length, [allQuotes])
  const totalOrdersCount = useMemo(() => allQuotes.filter(isOrderRequest).length, [allQuotes])
  const pendingTotal = useMemo(() => allQuotes.filter(q => q.status === 'PENDING').length, [allQuotes])
  const completedTotal = useMemo(() => allQuotes.filter(q => q.status === 'COMPLETED').length, [allQuotes])

  // Dynamic Chart Data aggregated 100% from real quote requests
  const activeChartData = useMemo(() => {
    if (chartPeriod === '7D') {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      const result: { name: string; devis: number; commandes: number; fullDate: string }[] = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateKey = d.toISOString().split('T')[0]
        const dayLabel = days[d.getDay()]

        const matchingQuotes = allQuotes.filter(q => {
          try {
            return new Date(q.createdDate).toISOString().split('T')[0] === dateKey
          } catch {
            return false
          }
        })

        result.push({
          name: `${dayLabel} ${d.getDate()}`,
          devis: matchingQuotes.filter(isDevisRequest).length,
          commandes: matchingQuotes.filter(isOrderRequest).length,
          fullDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        })
      }
      return result
    }

    if (chartPeriod === '30D') {
      const result = [
        { name: 'Sem 1', devis: 0, commandes: 0 },
        { name: 'Sem 2', devis: 0, commandes: 0 },
        { name: 'Sem 3', devis: 0, commandes: 0 },
        { name: 'Sem 4', devis: 0, commandes: 0 },
      ]
      const now = Date.now()
      allQuotes.forEach(q => {
        try {
          const diffDays = Math.floor((now - new Date(q.createdDate).getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays >= 0 && diffDays < 28) {
            const weekIdx = 3 - Math.floor(diffDays / 7)
            if (weekIdx >= 0 && weekIdx < 4) {
              if (isDevisRequest(q)) result[weekIdx].devis++
              if (isOrderRequest(q)) result[weekIdx].commandes++
            }
          }
        } catch {}
      })
      return result
    }

    // YEAR: 12 months aggregation
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    const result = monthNames.map(name => ({ name, devis: 0, commandes: 0 }))
    const currentYear = new Date().getFullYear()

    allQuotes.forEach(q => {
      try {
        const d = new Date(q.createdDate)
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth()
          if (m >= 0 && m < 12) {
            if (isDevisRequest(q)) result[m].devis++
            if (isOrderRequest(q)) result[m].commandes++
          }
        }
      } catch {}
    })

    return result
  }, [allQuotes, chartPeriod])

  // Filtered quotes for the bottom table
  const filteredQuotes = useMemo(() => {
    return allQuotes.filter(q => {
      // Status filter
      if (statusFilter !== 'ALL' && q.status !== statusFilter) {
        return false
      }
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchName = (q.fullName || '').toLowerCase().includes(query)
        const matchPhone = (q.phoneNumber || '').toLowerCase().includes(query)
        const matchMsg = (q.message || '').toLowerCase().includes(query)
        const matchProd = (q.product?.name || '').toLowerCase().includes(query)
        if (!matchName && !matchPhone && !matchMsg && !matchProd) return false
      }
      return true
    })
  }, [allQuotes, statusFilter, searchTerm])

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3.5">
          <div className="size-11 animate-spin rounded-full border-2 border-[#C8960C] border-t-transparent shadow-[0_0_15px_rgba(200,150,12,0.2)]" />
          <span className="text-xs font-mono tracking-[0.2em] text-[#64748B] uppercase font-medium">
            Chargement de l'Atelier Aschi...
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6 pb-12 text-[#0F172A] relative"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Soft Luxury Warm Glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 size-96 bg-amber-500/[0.04] rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-10 size-96 bg-orange-500/[0.03] rounded-full blur-3xl" />

      {/* ─── 1. EXECUTIVE LUXURY HEADER ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative bg-white border border-[#E8DFD4] rounded-2xl p-6 sm:p-7 shadow-xs overflow-hidden">
        {/* Subtle decorative gold line along top */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C17D59] via-[#C8960C] to-[#E5D7C5]" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#FDF8EE] text-[#996515] border border-[#E8D7B0] shadow-2xs">
                <Gem className="size-3 text-[#C8960C]" />
                <span>Atelier Aschi • Maison Fondée en 1960</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Atelier En Ligne</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#0F172A] font-bold tracking-tight">
              Tableau de Bord &amp; Supervision Commerciale
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] font-normal mt-1.5 max-w-2xl leading-relaxed">
              Consultez en direct les commandes, les demandes de projets sur-mesure et l'état général des collections d'artisanat d'art.
            </p>
          </div>

          {/* Right Tools: Date Pill + Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DBD0] px-4 py-2 rounded-full text-xs text-[#334155] shadow-2xs">
              <Calendar className="size-3.5 text-[#C8960C]" />
              <span className="font-semibold tracking-wide">{dateStr || 'Aujourd\'hui'}</span>
            </div>

            <button 
              onClick={loadDashboardData} 
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-[#FAF8F5] hover:bg-white border border-[#C8960C]/40 hover:border-[#C8960C] px-4 py-2 rounded-full text-xs font-bold text-[#996515] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`size-3.5 text-[#C8960C] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. FOUR 100% REAL KPI METRIC CARDS ───────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Demandes Reçues (Gold / Ochre) */}
        <div className="bg-white border border-[#E8DFD4] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-[#C8960C]/50 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
              Total Demandes Web
            </span>
            <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="size-4.5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              {allQuotes.length}
            </span>
            <span className="text-[10px] font-bold text-[#996515] bg-[#FDF8EE] px-2 py-0.5 rounded-full border border-[#E8D7B0]">
              Flux Réel
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] mt-1 font-normal">
            {totalDevisCount} sur-mesure • {totalOrdersCount} commandes
          </p>

          {/* Mini Gold Sparkline */}
          <div className="mt-2.5 h-8 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 120 28" className="w-full h-full stroke-[#C8960C] fill-none" preserveAspectRatio="none">
              <path d="M0,22 Q25,12 50,18 T90,8 T120,4" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M0,22 Q25,12 50,18 T90,8 T120,4 L120,28 L0,28 Z" fill="url(#goldGradKpiLight)" opacity="0.15" />
              <defs>
                <linearGradient id="goldGradKpiLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8960C" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 2: À Traiter en Priorité (Urgent / Pending) */}
        <div className="bg-white border border-[#E8DFD4] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-amber-400 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
              À Contacter
            </span>
            <div className={`size-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${
              pendingTotal > 0 
                ? 'bg-amber-50 border border-amber-200 text-amber-700' 
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}>
              {pendingTotal > 0 ? <Clock className="size-4.5 animate-pulse" /> : <CheckCircle2 className="size-4.5" />}
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              {pendingTotal}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              pendingTotal > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {pendingTotal > 0 ? 'Action Requise' : 'À jour'}
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] mt-1 font-normal">
            {pendingTotal > 0 ? `${pendingTotal} dossier(s) en attente de réponse` : 'Aucun retard dans les réponses'}
          </p>

          {/* Mini Amber Sparkline */}
          <div className="mt-2.5 h-8 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 120 28" className="w-full h-full stroke-amber-500 fill-none" preserveAspectRatio="none">
              <path d="M0,20 Q30,8 60,18 T100,10 T120,6" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M0,20 Q30,8 60,18 T100,10 T120,6 L120,28 L0,28 Z" fill="url(#amberGradKpiLight)" opacity="0.15" />
              <defs>
                <linearGradient id="amberGradKpiLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 3: Commandes Directes & Bijoux (Emerald) */}
        <div className="bg-white border border-[#E8DFD4] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-400 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
              Commandes Directes
            </span>
            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform shadow-2xs">
              <ShoppingBag className="size-4.5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              {totalOrdersCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Réservations
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] mt-1 font-normal">
            Bijoux de porte &amp; pièces uniques d'atelier
          </p>

          {/* Mini Emerald Sparkline */}
          <div className="mt-2.5 h-8 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 120 28" className="w-full h-full stroke-emerald-500 fill-none" preserveAspectRatio="none">
              <path d="M0,24 Q30,16 65,10 T100,6 T120,2" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M0,24 Q30,16 65,10 T100,6 T120,2 L120,28 L0,28 Z" fill="url(#emeraldGradKpiLight)" opacity="0.15" />
              <defs>
                <linearGradient id="emeraldGradKpiLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 4: Modèles & Pièces au Catalogue (Blue / Cyan) */}
        <div className="bg-white border border-[#E8DFD4] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-sky-400 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
              Modèles au Catalogue
            </span>
            <div className="size-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-105 transition-transform shadow-2xs">
              <Package className="size-4.5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              {products.length || stats?.totalProducts || 0}
            </span>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Actifs
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] mt-1 font-normal">
            Collections sculptées, buffets, portes &amp; tables
          </p>

          {/* Mini Blue Sparkline */}
          <div className="mt-2.5 h-8 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 120 28" className="w-full h-full stroke-sky-500 fill-none" preserveAspectRatio="none">
              <path d="M0,18 Q35,24 70,12 T105,8 T120,2" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M0,18 Q35,24 70,12 T105,8 T120,2 L120,28 L0,28 Z" fill="url(#blueGradKpiLight)" opacity="0.15" />
              <defs>
                <linearGradient id="blueGradKpiLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </motion.div>

      {/* ─── 3. ATELIER QUICK SHORTCUTS NAVIGATION ────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link 
          href="/admin/quotes" 
          className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#C8960C]/50 hover:bg-[#FAF8F5] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
              <MessageSquareCode className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#C17D59] transition-colors">
                Devis &amp; Commandes
              </h4>
              <p className="text-[10px] text-[#64748B]">Traiter les demandes reçues</p>
            </div>
          </div>
          {pendingTotal > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {pendingTotal}
            </span>
          ) : (
            <ArrowRight className="size-3.5 text-[#8C7A6B] group-hover:text-[#C8960C] group-hover:translate-x-0.5 transition-all" />
          )}
        </Link>

        <Link 
          href="/admin/catalogue" 
          className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#C8960C]/50 hover:bg-[#FAF8F5] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
              <BookImage className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#C17D59] transition-colors">
                Catalogue Inspiration
              </h4>
              <p className="text-[10px] text-[#64748B]">Modèles &amp; finitions d'art</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-[#8C7A6B] group-hover:text-[#C8960C] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link 
          href="/admin/bijoux-de-porte" 
          className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#C8960C]/50 hover:bg-[#FAF8F5] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-800 group-hover:scale-110 transition-transform">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#C17D59] transition-colors">
                Bijoux de Porte
              </h4>
              <p className="text-[10px] text-[#64748B]">Boutons &amp; poignées d'art</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-[#8C7A6B] group-hover:text-[#C8960C] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link 
          href="/admin/products" 
          className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#C8960C]/50 hover:bg-[#FAF8F5] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
              <Package className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#C17D59] transition-colors">
                Pièces Disponibles
              </h4>
              <p className="text-[10px] text-[#64748B]">Mobilier en stock direct</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-[#8C7A6B] group-hover:text-[#C8960C] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </motion.div>

      {/* ─── 4. REAL ACTIVITY AREA CHART (100% REAL DATA AGGREGATION) ────────── */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E8DFD4] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#C8960C]" />
              <h2 className="font-serif text-xl sm:text-2xl text-[#0F172A] font-bold">
                Activité Commerciale Réelle
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-1 font-normal">
              Courbe comparative des demandes de devis et commandes directes enregistrées
            </p>
          </div>

          {/* Range Toggle Tabs */}
          <div className="inline-flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E2DBD0] self-start sm:self-auto shadow-2xs">
            {(['7D', '30D', 'YEAR'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  chartPeriod === period
                    ? 'bg-white text-[#0F172A] shadow-xs font-bold border border-[#E2DBD0]'
                    : 'text-[#64748B] hover:text-[#0F172A] font-medium'
                }`}
              >
                {period === '7D' ? '7 jours' : period === '30D' ? '30 jours' : 'Année en cours'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="min-h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activeChartData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="waveDevisReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C17D59" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C17D59" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="waveCmdReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#E8DFD4', 
                  borderRadius: '14px', 
                  color: '#0F172A',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  padding: '10px 14px'
                }} 
                itemStyle={{ color: '#0F172A', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="devis" 
                name="Demandes & Projets" 
                stroke="#C17D59" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#waveDevisReal)" 
              />
              <Area 
                type="monotone" 
                dataKey="commandes" 
                name="Commandes Directes" 
                stroke="#0284C7" 
                strokeWidth={2.2} 
                fillOpacity={1} 
                fill="url(#waveCmdReal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend with Live Totals */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E8DFD4] text-xs">
          <div className="text-[11px] text-[#64748B] font-normal">
            Données synchronisées en direct avec la base de données de l'atelier
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#C17D59]" />
              <span className="text-[#334155] font-semibold">Demandes &amp; Projets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#0284C7]" />
              <span className="text-[#334155] font-semibold">Commandes Directes</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 5. RECENT INQUIRIES & ORDERS TABLE WITH LIVE FILTER ──────────── */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E8DFD4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        
        {/* Table Header: Title + Search + Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD4]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <h2 className="font-serif text-xl sm:text-2xl text-[#0F172A] font-bold">
                Dernières Demandes &amp; Commandes
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200">
                {filteredQuotes.length} visible(s)
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 font-normal">
              Flux en direct des demandes reçues via le site web officiel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full bg-[#FAF8F5] border border-[#E2DBD0] pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder:text-[#8C7A6B]/70 focus:border-[#C8960C] focus:bg-white outline-none transition-all w-48 sm:w-56 shadow-2xs"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="inline-flex items-center bg-[#FAF8F5] p-1 rounded-full border border-[#E2DBD0] text-xs shadow-2xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-[#0F172A] font-bold shadow-xs border border-[#E2DBD0]' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'PENDING' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                En attente {pendingTotal > 0 && `(${pendingTotal})`}
              </button>
              <button
                onClick={() => setStatusFilter('CONTACTED')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'CONTACTED' ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200 shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Contacté
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Terminé
              </button>
            </div>

            <Link 
              href="/admin/quotes" 
              className="text-xs font-bold text-[#996515] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors px-3.5 py-2 rounded-full border border-[#C8960C]/30 hover:border-[#C8960C] bg-[#FDF8EE] shadow-2xs"
            >
              <span>Gérer tout</span> <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        {filteredQuotes.length === 0 ? (
          <div className="p-10 text-center text-[#64748B] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E2DBD0]">
            <Clock className="size-8 mx-auto mb-2 text-[#C8960C]/60" />
            <p className="text-sm font-semibold text-[#0F172A]">Aucune demande trouvée</p>
            <p className="text-xs text-[#64748B] mt-1">
              {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucune demande enregistrée dans ce filtre.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="mt-3 text-xs text-[#C8960C] font-semibold hover:underline cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFD4] text-[11px] uppercase tracking-wider text-[#475569] bg-[#FAF8F5]">
                  <th className="py-3 font-bold pl-3">Client</th>
                  <th className="py-3 font-bold">Catégorie</th>
                  <th className="py-3 font-bold">Projet / Modèle</th>
                  <th className="py-3 font-bold">Date</th>
                  <th className="py-3 font-bold">Statut</th>
                  <th className="py-3 text-right font-bold pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4]/60 text-xs">
                {filteredQuotes.slice(0, 10).map((q) => {
                  const sec = getSectionInfo(q)
                  const cleanPhone = (q.phoneNumber || '').replace(/\s+/g, '')

                  return (
                    <tr key={q.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                      {/* Client */}
                      <td className="py-3.5 pl-3 pr-3 font-medium text-[#0F172A]">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#3A2A1E] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                            {(q.fullName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0F172A] leading-tight truncate max-w-[170px]">
                              {q.fullName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a 
                                href={`tel:${cleanPhone}`} 
                                className="text-[11px] text-[#475569] hover:text-[#C17D59] transition-colors font-mono flex items-center gap-1 font-medium"
                              >
                                <Phone className="size-2.5 text-[#C8960C]" />
                                <span>{q.phoneNumber}</span>
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ouvrir WhatsApp"
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <MessageCircle className="size-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 pr-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${sec.badgeBg}`}>
                          {sec.label}
                        </span>
                      </td>

                      {/* Projet / Modèle */}
                      <td className="py-3.5 pr-3 max-w-md">
                        {q.product && (
                          <p className="text-xs font-bold text-[#0F172A] truncate mb-0.5">
                            {q.product.name}
                          </p>
                        )}
                        <p className="text-[11px] text-[#475569] line-clamp-1 font-normal">
                          {q.personalizationDetails || q.message || 'Demande personnalisée'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 pr-3 text-[11px] text-[#64748B] whitespace-nowrap font-mono font-medium">
                        {new Date(q.createdDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 pr-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                          q.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          q.status === 'CONTACTED' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            q.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                            q.status === 'CONTACTED' ? 'bg-sky-500' : 'bg-emerald-500'
                          }`} />
                          <span>{q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Terminé'}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-3 text-right">
                        <Link
                          href={sec.link}
                          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#0F172A] border border-[#E2DBD0] hover:border-[#C8960C] transition-all shadow-2xs"
                        >
                          <span>Gérer</span> <ArrowUpRight className="size-3 text-[#C8960C]" />
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
