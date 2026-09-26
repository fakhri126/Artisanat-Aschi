'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ShoppingBag, DoorOpen } from 'lucide-react'
import CatalogTab from './CatalogTab'
import OrdersTab from './OrdersTab'

export default function AdminBijouxDePorteContainer() {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ORDERS'>('CATALOG')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('tab') === 'orders') {
        setActiveTab('ORDERS')
      }
    }
  }, [])

  return (
    <div className="text-[#0F172A] -m-6 md:-m-10">
      {/* Tabs Header */}
      <div className="px-6 md:px-10 pt-6 pb-0 border-b border-[#E8DFD4] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-[10px] uppercase tracking-widest mb-2 font-semibold">
            <Sparkles className="size-3" /> Quincaillerie Décorative d&apos;Art
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-[#0F172A] font-bold">
            Gestion Bijoux de Porte &amp; Poignées d&apos;Art
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Gérez vos 2 univers : Poignées de Portes (Sur-Mesure) et Poignées de Meubles (Planches &amp; Modèles commandables).
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`pb-3 flex items-center gap-2 font-heading tracking-wide transition-colors cursor-pointer text-xs uppercase ${
              activeTab === 'CATALOG'
                ? 'border-b-2 border-[#C8960C] text-[#0F172A] font-bold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="size-3.5 text-[#C8960C]" />
            Catalogue &amp; Planches de Modèles
          </button>
          
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`pb-3 flex items-center gap-2 font-heading tracking-wide transition-colors cursor-pointer text-xs uppercase ${
              activeTab === 'ORDERS'
                ? 'border-b-2 border-[#C8960C] text-[#0F172A] font-bold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShoppingBag className="size-3.5 text-[#C8960C]" />
            Demandes d&apos;Études &amp; Commandes
          </button>
        </div>
      </div>

      <div className="mt-0">
        {activeTab === 'CATALOG' && <CatalogTab />}
        {activeTab === 'ORDERS' && <OrdersTab />}
      </div>
    </div>
  )
}
