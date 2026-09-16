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
    <div className="text-ivory -m-6 md:-m-10">
      {/* Tabs Header */}
      <div className="px-6 md:px-10 pt-8 pb-0 border-b border-gold/10 bg-walnut sticky top-0 z-40">
        <div className="mb-4">
          <h1 className="font-heading text-3xl md:text-4xl text-white font-medium">
            Gestion Bijoux de Porte &amp; Poignées d&apos;Art
          </h1>
          <p className="text-xs text-ivory/60 mt-1">
            Gérez vos 2 univers : Poignées de Portes (Sur-Mesure) et Poignées de Meubles (Planches &amp; Modèles commandables).
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`pb-4 flex items-center gap-2 font-heading tracking-wide transition-colors cursor-pointer ${
              activeTab === 'CATALOG'
                ? 'border-b-2 border-gold text-gold font-bold'
                : 'text-ivory/50 hover:text-ivory'
            }`}
          >
            <Sparkles className="size-4" />
            Catalogue &amp; Planches de Modèles
          </button>
          
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`pb-4 flex items-center gap-2 font-heading tracking-wide transition-colors cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'border-b-2 border-gold text-gold font-bold'
                : 'text-ivory/50 hover:text-ivory'
            }`}
          >
            <ShoppingBag className="size-4" />
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
