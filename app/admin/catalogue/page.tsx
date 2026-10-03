'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShoppingBag, BookOpen } from 'lucide-react'
import CatalogTab from './CatalogTab'
import OrdersTab from './OrdersTab'

export default function AdminCataloguePage() {
  const [activeTab, setActiveTab] = useState<'MODELS' | 'ORDERS'>('MODELS')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab === 'orders' || tab === 'quotes') {
        setActiveTab('ORDERS')
      }
    }
  }, [])

  return (
    <div className="space-y-6 text-[#F5F0E8]">
      {/* ─── Top Header Section — Luxury Showroom Aesthetic ──────────────── */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-[#3A2E24]">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211A15] border border-[#3A2E24] text-[#C8794D] text-[10.5px] uppercase tracking-widest mb-2 font-semibold">
            <Sparkles className="size-3" /> Catalogue d&apos;inspiration
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#F5F0E8] tracking-tight">
            Nos créations artisanales
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#D9C8AE]/80 max-w-2xl leading-relaxed">
            Découvrez notre collection de meubles et objets artisanaux, conçus avec passion et savoir-faire pour sublimer vos espaces.
          </p>
        </motion.div>

        {/* ─── Tab Switcher ─────────────────────────────────────────────────── */}
        <div className="flex bg-[#211A15] p-1.5 rounded-2xl border border-[#3A2E24] gap-1 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('MODELS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'MODELS'
                ? 'bg-[#E5D7C5] text-[#15120F] font-bold shadow-xs'
                : 'text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8]'
            }`}
          >
            <BookOpen className="size-3.5 text-[#C8794D]" />
            <span>Catalogue &amp; Modèles</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'bg-[#E5D7C5] text-[#15120F] font-bold shadow-xs'
                : 'text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8]'
            }`}
          >
            <ShoppingBag className="size-3.5 text-[#C8794D]" />
            <span>Demandes &amp; Sur-Mesure</span>
          </button>
        </div>
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────────────── */}
      <div>
        {activeTab === 'MODELS' && <CatalogTab />}
        {activeTab === 'ORDERS' && <OrdersTab />}
      </div>
    </div>
  )
}
