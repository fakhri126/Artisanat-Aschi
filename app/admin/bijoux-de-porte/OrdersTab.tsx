'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, Filter, Trash2, CheckCircle, Clock, Truck, XCircle, 
  Eye, X, Phone, DoorOpen, Sofa, MessageCircle, RefreshCw 
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'

// Configuration unique des statuts (badges & actions modale)
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PENDING:   { label: 'En attente', icon: Clock,       color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CONTACTED: { label: 'Contacté',   icon: Phone,       color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  CONFIRMED: { label: 'Confirmé',   icon: CheckCircle, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  SHIPPED:   { label: 'Expédiée',   icon: Truck,       color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  COMPLETED: { label: 'Livrée',     icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Annulée',    icon: XCircle,     color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const isDoorOrder = (order: QuoteRequest) =>
  /porte|cellule|serrure|tirant|rosace|sur-mesure/i.test(order.message || '')

export default function OrdersTab() {
  const [orders, setOrders] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [universeFilter, setUniverseFilter] = useState<'ALL' | 'portes' | 'meubles'>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<QuoteRequest | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getQuotes()
      const regex = /bijoux?|poign|bouton|porte|cellule|serrure/i
      setOrders(data.filter((item: any) => 
        regex.test(`${item.message || ''} ${item.product?.name || ''} ${item.personalizationDetails || ''}`)
      ))
    } catch (err) {
      console.error('Error loading orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: any) => {
    try {
      await adminApi.updateQuoteStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null)
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement cette demande ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setOrders(prev => prev.filter(o => o.id !== id))
      if (selectedOrder?.id === id) setSelectedOrder(null)
    } catch (err) {
      alert('Erreur lors de la suppression.')
    }
  }

  const filteredOrders = useMemo(() => orders.filter(o => {
    const s = search.toLowerCase()
    const matchSearch = o.fullName.toLowerCase().includes(s) || 
      Boolean(o.email && o.email.toLowerCase().includes(s)) || 
      Boolean(o.phoneNumber && o.phoneNumber.includes(s)) || 
      Boolean(o.message && o.message.toLowerCase().includes(s))
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    const matchUniverse = universeFilter === 'ALL' ? true : universeFilter === 'portes' ? isDoorOrder(o) : !isDoorOrder(o)
    return matchSearch && matchStatus && matchUniverse
  }), [orders, search, statusFilter, universeFilter])

  const getWaLink = (order: QuoteRequest) => {
    const phone = (order.phoneNumber || '').replace(/[^0-9]/g, '')
    const msg = `Bonjour ${order.fullName}, c'est Ismail de la Maison Aschi concernant votre demande de poignées (${isDoorOrder(order) ? 'Porte' : 'Meuble'}).`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">
      
      {/* 1. Univers : Toutes / Portes / Meubles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'ALL', label: 'Toutes les demandes', count: orders.length, desc: 'Toutes les études et commandes', icon: null },
          { id: 'portes', label: 'Poignées de Portes', count: orders.filter(isDoorOrder).length, desc: 'Rosaces, tirants & serrures', icon: DoorOpen },
          { id: 'meubles', label: 'Poignées de Meubles', count: orders.filter(o => !isDoorOrder(o)).length, desc: 'Boutons et modèles meuble', icon: Sofa },
        ].map(u => (
          <button
            key={u.id}
            type="button"
            onClick={() => setUniverseFilter(u.id as any)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              universeFilter === u.id ? 'bg-[#3B271C] border-[#E6A635] text-white shadow' : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                {u.icon && <u.icon className="size-3.5 text-[#E6A635]" />} {u.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">{u.count}</span>
            </div>
            <p className="text-[11px] text-ivory/50 mt-1">{u.desc}</p>
          </button>
        ))}
      </div>

      {/* 2. Filtres & Recherche */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-walnut p-4 rounded-xl border border-gold/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Rechercher par nom, tél, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="size-4 text-gold shrink-0" />
          {['ALL', 'PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                statusFilter === st ? 'bg-gold text-walnut' : 'bg-stone-900 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : STATUS_CONFIG[st]?.label || st}
            </button>
          ))}
          <button type="button" onClick={loadOrders} title="Rafraîchir" className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-ivory/60 cursor-pointer">
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Tableau des commandes */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50">Chargement des demandes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5">Aucune demande trouvée.</div>
      ) : (
        <div className="bg-walnut rounded-2xl border border-gold/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/60 text-xs uppercase tracking-wider text-gold border-b border-gold/10">
                <tr>
                  <th className="px-6 py-4">Réf / Date</th>
                  <th className="px-6 py-4">Univers</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Détails</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-ivory/80 font-light">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                  const isDoor = isDoorOrder(order)
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                  const Icon = st.icon

                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-gold font-bold">#REQ-{order.id}</span>
                        <p className="text-[10px] text-ivory/40">{dateStr}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${isDoor ? 'bg-[#E6A635]/15 text-[#F2BD52] border-[#E6A635]/30' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'}`}>
                          {isDoor ? <DoorOpen className="size-3" /> : <Sofa className="size-3" />}
                          {isDoor ? 'Porte' : 'Meuble'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{order.fullName}</p>
                        <p className="text-xs text-[#F2BD52] font-mono">{order.phoneNumber}</p>
                        {order.email && <p className="text-[10px] text-ivory/40">{order.email}</p>}
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <p className="text-xs text-ivory/80 line-clamp-2 leading-relaxed">{order.message}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`border px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 ${st.color}`}>
                          <Icon className="size-3" /> {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.phoneNumber && (
                            <>
                              <a href={`tel:${order.phoneNumber.replace(/\s+/g, '')}`} className="size-8 rounded-lg bg-stone-900 hover:bg-[#E6A635] hover:text-[#1A110B] text-[#F2BD52] border border-white/5 flex items-center justify-center transition-colors" title="Appeler">
                                <Phone className="size-3.5" />
                              </a>
                              <a href={getWaLink(order)} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-colors" title="WhatsApp">
                                <MessageCircle className="size-3.5" />
                              </a>
                            </>
                          )}
                          <button type="button" onClick={() => setSelectedOrder(order)} className="size-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-ivory/70 hover:text-white border border-white/5 flex items-center justify-center transition-colors cursor-pointer" title="Détails">
                            <Eye className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDelete(order.id)} className="size-8 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer" title="Supprimer">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Modale Détails & Changement de statut */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-[#E6A635]/40 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            <button type="button" onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
              <X className="size-4" />
            </button>
            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-xs text-[#E6A635]">#REQ-{selectedOrder.id}</span>
              <h3 className="font-heading text-2xl text-white mt-1">{selectedOrder.fullName}</h3>
              <p className="text-xs text-ivory/50">Reçue le {new Date(selectedOrder.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-950 border border-white/5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#E6A635]">Téléphone</p>
                <a href={`tel:${selectedOrder.phoneNumber}`} className="text-white font-mono hover:underline block mt-0.5">{selectedOrder.phoneNumber}</a>
              </div>
              {selectedOrder.email && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#E6A635]">Email</p>
                  <p className="text-white truncate mt-0.5">{selectedOrder.email}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#E6A635] mb-1.5">Détails de la demande</p>
              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 text-xs text-ivory/90 whitespace-pre-wrap leading-relaxed">{selectedOrder.message}</div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#E6A635] mb-2">Changer le statut</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(STATUS_CONFIG).map(([stId, cfg]) => (
                  <button
                    key={stId}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, stId)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedOrder.status === stId ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] font-bold' : 'bg-stone-950 text-ivory/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <a href={`tel:${(selectedOrder.phoneNumber || '').replace(/\s+/g, '')}`} className="flex-1 py-2.5 rounded-xl bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                <Phone className="size-4" /> Appeler
              </a>
              <a href={getWaLink(selectedOrder)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
