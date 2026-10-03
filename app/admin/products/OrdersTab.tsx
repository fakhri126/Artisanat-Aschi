'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  Trash2, 
  Clock, 
  MessageCircle,
  Package,
  User,
  CheckCircle2
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'
import { isBijouxOrHandleProduct } from '@/lib/utils'

interface OrdersTabProps {
  onPendingCountChange?: (count: number) => void
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING: { label: '⏳ En attente', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  CONTACTED: { label: '📞 Contacté', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  COMPLETED: { label: '✅ Terminé', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
}

export default function OrdersTab({ onPendingCountChange }: OrdersTabProps) {
  const [orders, setOrders] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const allQuotes = await adminApi.getQuotes()
      const prodOrders = allQuotes.filter((q: QuoteRequest) => {
        const pType = q.product?.type
        const msg = (q.message || '').toLowerCase()
        const isBijoux = q.product ? isBijouxOrHandleProduct(q.product) : false
        const isException = (q.personalizationDetails || '').includes('[ESPACE_EXCEPTION]')
        return !isBijoux && !isException && (pType === 'PIECE_UNIQUE' || pType === 'REPRODUCTIBLE' || msg.includes('panier') || msg.includes('commande pièce'))
      })
      setOrders(prodOrders)
      onPendingCountChange?.(prodOrders.filter((o: QuoteRequest) => o.status === 'PENDING').length)
    } catch (err) {
      console.error('Erreur chargement commandes pièces:', err)
      setOrders([])
      onPendingCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: QuoteRequest['status']) => {
    try {
      await adminApi.updateQuoteStatus(id, status)
      setOrders(prev => {
        const next = prev.map(o => o.id === id ? { ...o, status } : o)
        onPendingCountChange?.(next.filter(o => o.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la mise à jour du statut.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setOrders(prev => {
        const next = prev.filter(o => o.id !== id)
        onPendingCountChange?.(next.filter(o => o.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  const getWaLink = (o: QuoteRequest) => {
    const phone = (o.phoneNumber || '').replace(/[^0-9]/g, '')
    const prodTitle = o.product?.name || 'votre commande de pièce artisanale'
    const msg = `Bonjour ${o.fullName}, c'est Ismail de la Maison Aschi concernant votre réservation pour : "${prodTitle}".`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const s = search.toLowerCase().trim()
      const matchesSearch = !s || (
        o.fullName.toLowerCase().includes(s) ||
        Boolean(o.email?.toLowerCase().includes(s)) ||
        Boolean(o.phoneNumber?.includes(s)) ||
        Boolean(o.product?.name?.toLowerCase().includes(s)) ||
        Boolean(o.message?.toLowerCase().includes(s))
      )
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const counts = useMemo(() => ({
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    CONTACTED: orders.filter(o => o.status === 'CONTACTED').length,
    COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
  }), [orders])

  return (
    <div className="space-y-6 text-left text-[#0F172A]">
      {/* ─── Filtres & Recherche ─── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par client, téléphone, pièce..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'PENDING', label: 'En attente' },
            { id: 'CONTACTED', label: 'Contactés' },
            { id: 'COMPLETED', label: 'Terminés' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#475569] hover:bg-[#EFECE6] border border-[#E2DBD0]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-[#E2DBD0] text-[#0F172A]'
              }`}>
                {counts[tab.id as keyof typeof counts]}
              </span>
            </button>
          ))}

          <button
            onClick={loadOrders}
            className="ml-2 inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#E2DBD0] bg-white transition-colors cursor-pointer shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Liste des Commandes ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des réservations...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
            <ShoppingBag className="size-8" />
          </div>
          <div>
            <p className="text-[#0F172A] text-sm font-bold">Aucune réservation trouvée</p>
            <p className="text-[#64748B] text-xs mt-1">Les réservations effectuées sur les pièces disponibles apparaîtront ici.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8DFD4] text-[11px] uppercase tracking-wider text-[#64748B]">
                  <th className="p-4 pl-6 font-bold">Client</th>
                  <th className="p-4 font-bold">Coordonnées</th>
                  <th className="p-4 font-bold">Pièce demandée</th>
                  <th className="p-4 font-bold">Message client</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4] text-xs">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Client */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] flex items-center justify-center text-[#C17D59] shrink-0 font-bold text-xs">
                          {o.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#0F172A]">{o.fullName}</span>
                      </div>
                    </td>

                    {/* Coordonnées & Actions directes */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${o.phoneNumber}`} className="font-bold text-[#0F172A] hover:text-[#C17D59] hover:underline">
                          {o.phoneNumber}
                        </a>
                        {o.phoneNumber && (
                          <a
                            href={getWaLink(o)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-2xs"
                            title="Ouvrir WhatsApp"
                          >
                            <MessageCircle className="size-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] font-mono truncate max-w-[180px]">{o.email}</p>
                    </td>

                    {/* Pièce */}
                    <td className="p-4">
                      <p className="font-bold text-[#C17D59] text-xs">
                        {o.product?.name || 'Pièce d’artisanat'}
                      </p>
                      {o.product?.price && (
                        <p className="text-[11px] font-semibold text-[#0F172A] mt-0.5">
                          {o.product.price.toLocaleString('fr-FR')} DT
                        </p>
                      )}
                    </td>

                    {/* Message */}
                    <td className="p-4 max-w-xs">
                      {o.message ? (
                        <p className="text-[11.5px] text-[#475569] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DFD4] line-clamp-2 leading-relaxed">
                          {o.message}
                        </p>
                      ) : (
                        <span className="text-[#94A3B8] italic">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-[#64748B] whitespace-nowrap">
                      {new Date(o.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Statut */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${STATUS_CONFIG[o.status]?.badge || STATUS_CONFIG.PENDING.badge}`}>
                        {STATUS_CONFIG[o.status]?.label || o.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                          className="text-[11px] font-semibold bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg px-2 py-1 text-[#0F172A] outline-none cursor-pointer"
                        >
                          <option value="PENDING">⏳ En attente</option>
                          <option value="CONTACTED">📞 Contacté</option>
                          <option value="COMPLETED">✅ Terminé</option>
                        </select>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la réservation"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
