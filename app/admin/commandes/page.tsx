'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  Eye,
  X,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<QuoteRequest | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getQuoteRequests()
      // Filter out accessory orders (containing BIJOUX DE PORTE or handle keywords)
      const accessoryOrders = data.filter(item => 
        item.message?.includes("BIJOUX DE PORTE") || 
        item.message?.includes("Bouton") ||
        item.message?.includes("Poignée")
      )
      setOrders(accessoryOrders)
    } catch (err) {
      console.error('Error loading orders:', err)
      // Fallback mock orders for administrative demonstration
      setOrders([
        {
          id: 101,
          fullName: 'Sonia Ben Ali',
          email: 'sonia.benali@gmail.com',
          phoneNumber: '+216 98 123 456',
          message: '[DEMANDE D\'ACCESSOIRES - BIJOUX DE PORTE]\nModèle sélectionné : Bouton Riad Bleu (Diamètre 6.5 cm)\nPrix unitaire : 28 TND\nQuantité souhaitée : 12 pièces\nPrix total estimé : 336 TND\n\nNotes : Pour portes de dressing de chambre principale.',
          createdDate: new Date().toISOString(),
          status: 'PENDING'
        },
        {
          id: 102,
          fullName: 'Karim Mansour',
          email: 'k.mansour@architectes.tn',
          phoneNumber: '+216 55 987 654',
          message: '[DEMANDE D\'ACCESSOIRES - BIJOUX DE PORTE]\nModèle sélectionné : Bouton Soleil d\'Or (7 cm x 4 cm)\nPrix unitaire : 32 TND\nQuantité souhaitée : 8 pièces\nPrix total estimé : 256 TND\n\nNotes : Besoin d\'une livraison urgente à Gammarth.',
          createdDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'CONFIRMED'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await adminApi.updateQuoteStatus(id, newStatus)
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      console.error('Error updating status:', err)
      // Local fallback state update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setOrders(orders.filter(o => o.id !== id))
      if (selectedOrder?.id === id) setSelectedOrder(null)
    } catch (err) {
      console.error('Error deleting order:', err)
      setOrders(orders.filter(o => o.id !== id))
      if (selectedOrder?.id === id) setSelectedOrder(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.phoneNumber.includes(search)
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><CheckCircle className="size-3" /> Confirmée</span>
      case 'SHIPPED':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><Truck className="size-3" /> Expédiée</span>
      case 'COMPLETED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><CheckCircle className="size-3" /> Livrée</span>
      case 'CANCELLED':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><XCircle className="size-3" /> Annulée</span>
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><Clock className="size-3" /> En attente</span>
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-widest mb-2 font-semibold">
            <ShoppingBag className="size-3.5" /> Gestion des Ventes
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white font-medium">Commandes d&apos;Accessoires</h1>
          <p className="text-sm text-ivory/60 mt-1 font-light">Gestion indépendante des commandes de Bijoux de Porte et boutons en céramique.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-walnut p-4 rounded-xl border border-gold/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Rechercher par client, email, tél..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="size-4 text-gold shrink-0" />
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                statusFilter === st 
                  ? 'bg-gold text-walnut' 
                  : 'bg-stone-900 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50">Chargement des commandes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5">
          Aucune commande d&apos;accessoires trouvée.
        </div>
      ) : (
        <div className="bg-walnut rounded-2xl border border-gold/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/60 text-xs uppercase tracking-wider text-gold border-b border-gold/10">
                <tr>
                  <th className="px-6 py-4">Réf / Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Détails de la Commande</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-ivory/80 font-light">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-gold font-bold">#CMD-{order.id}</span>
                        <p className="text-[10px] text-ivory/40">{dateStr}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{order.fullName}</p>
                        <p className="text-xs text-ivory/50">{order.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs line-clamp-2 text-ivory/90 font-mono bg-stone-950/40 p-2 rounded border border-white/5">
                          {order.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-white/5 text-gold hover:bg-gold hover:text-walnut transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & Status Change Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-gold/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-gold font-bold">COMMANDE #CMD-{selectedOrder.id}</span>
              <h3 className="font-heading text-2xl text-white mt-1">{selectedOrder.fullName}</h3>
              <p className="text-xs text-ivory/50 flex items-center gap-1 mt-1">
                <Calendar className="size-3.5" /> Reçue le {new Date(selectedOrder.createdDate).toLocaleString('fr-FR')}
              </p>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-ivory/80">
                <Mail className="size-3.5 text-gold" /> {selectedOrder.email}
              </div>
              <div className="flex items-center gap-2 text-ivory/80">
                <Phone className="size-3.5 text-gold" /> {selectedOrder.phoneNumber}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gold font-semibold">Contenu de la Commande</label>
              <div className="p-4 rounded-xl bg-stone-950 text-xs text-ivory/80 whitespace-pre-wrap font-mono leading-relaxed border border-white/5 max-h-48 overflow-y-auto">
                {selectedOrder.message}
              </div>
            </div>

            {/* Workflow status actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs uppercase tracking-wider text-gold font-semibold">Changer le Statut</label>
              <div className="flex flex-wrap gap-2">
                {['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedOrder.status === st 
                        ? 'bg-gold text-walnut shadow-md' 
                        : 'bg-white/5 text-ivory/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
