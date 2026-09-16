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
  Sparkles,
  DoorOpen,
  Sofa,
  MessageCircle,
  MapPin,
  RefreshCw
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'

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
      // Filtrer les commandes et demandes liées aux poignées et bijoux de porte
      const accessoryOrders = data.filter((item: any) => {
        const msg = (item.message || '').toLowerCase()
        const prod = (item.product?.name || '').toLowerCase()
        const det = (item.personalizationDetails || '').toLowerCase()
        return (
          msg.includes('bijoux') || 
          msg.includes('bijou') || 
          msg.includes('poign') || 
          msg.includes('bouton') ||
          msg.includes('porte') ||
          msg.includes('cellule') ||
          msg.includes('serrure') ||
          prod.includes('bijou') ||
          prod.includes('poign') ||
          det.includes('porte') ||
          det.includes('poign')
        )
      })
      setOrders(accessoryOrders)
    } catch (err) {
      console.error('Error loading orders:', err)
      // Données de démonstration si backend hors ligne
      setOrders([
        {
          id: 101,
          fullName: 'M. Mehdi Ben Salem',
          email: 'mehdi.bensalem@gmail.com',
          phoneNumber: '+216 98 123 456',
          message: '[Demande d\'étude sur-mesure - Poignée de Porte]\nType: Poignée Céramique de Porte (Rosace d\'apparat)\nNom: Mehdi Ben Salem\nTél: +216 98 123 456\nVille: La Marsa\nDimensions: Épaisseur 6 cm, porte d\'entrée double battant\nPrécisions: Émaux bleus andalous avec ferronnerie patinée.',
          createdDate: new Date().toISOString(),
          status: 'PENDING',
          product: null,
          personalizationDetails: null
        },
        {
          id: 102,
          fullName: 'Sonia Trabelsi',
          email: 'sonia.trabelsi@architectes.tn',
          phoneNumber: '+216 55 987 654',
          message: '[Commande Poignées de Meubles]\nModèle sélectionné: Boutons Moyens Ronds (3 à 4 cm)\nQuantité souhaitée: 16 pièces\nUsage: Éléments de cuisine vert sauge\nNotes: Besoin d\'une livraison à Gammarth.',
          createdDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'CONTACTED',
          product: null,
          personalizationDetails: null
        },
        {
          id: 103,
          fullName: 'Dr. Karim Karoui',
          email: 'karim.karoui@topnet.tn',
          phoneNumber: '+216 22 456 789',
          message: '[Demande d\'étude sur-mesure - Poignée de Porte]\nType: Cache Serrure Sculpté (Serrure / Visiophone)\nNom: Dr. Karim Karoui\nTél: +216 22 456 789\nVille: Carthage\nDimensions: Gabarit 15 x 10 cm pour interphone\nPrécisions: Noyer sculpté motifs moucharabieh.',
          createdDate: new Date(Date.now() - 172800000).toISOString(),
          status: 'CONFIRMED',
          product: null,
          personalizationDetails: null
        }
      ] as any[])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const status = newStatus as any
    try {
      await adminApi.updateQuoteStatus(id, status)
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return
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

  // Détecter l'univers d'une demande
  const isDoorOrder = (order: QuoteRequest) => {
    const msg = (order.message || '').toLowerCase()
    return (
      msg.includes('porte') || 
      msg.includes('cellule') || 
      msg.includes('serrure') || 
      msg.includes('tirant') || 
      msg.includes('rosace') ||
      msg.includes('sur-mesure')
    )
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (o.email && o.email.toLowerCase().includes(search.toLowerCase())) ||
      (o.phoneNumber && o.phoneNumber.includes(search)) ||
      (o.message && o.message.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter

    let matchesUniverse = true
    if (universeFilter === 'portes') {
      matchesUniverse = isDoorOrder(o)
    } else if (universeFilter === 'meubles') {
      matchesUniverse = !isDoorOrder(o)
    }

    return matchesSearch && matchesStatus && matchesUniverse
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
      case 'CONTACTED':
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><Phone className="size-3" /> Contacté</span>
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1"><Clock className="size-3" /> En attente</span>
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">
      
      {/* ========================================================================= */}
      {/* SÉLECTEUR D'UNIVERS : TOUTES vs PORTES vs MEUBLES                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setUniverseFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            universeFilter === 'ALL'
              ? 'bg-[#3B271C] border-[#E6A635] text-white shadow'
              : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider">Toutes les demandes</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">
              {orders.length}
            </span>
          </div>
          <p className="text-[11px] text-ivory/50 mt-1">Ensemble des études portes et commandes meuble</p>
        </button>

        <button
          type="button"
          onClick={() => setUniverseFilter('portes')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            universeFilter === 'portes'
              ? 'bg-[#3B271C] border-[#E6A635] text-white shadow'
              : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <DoorOpen className="size-3.5 text-[#E6A635]" />
              Poignées de Portes
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">
              {orders.filter(isDoorOrder).length}
            </span>
          </div>
          <p className="text-[11px] text-ivory/50 mt-1">Rosaces céramique, tirants sculptés &amp; caches serrures</p>
        </button>

        <button
          type="button"
          onClick={() => setUniverseFilter('meubles')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            universeFilter === 'meubles'
              ? 'bg-[#3B271C] border-[#E6A635] text-white shadow'
              : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Sofa className="size-3.5 text-[#E6A635]" />
              Poignées de Meubles
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">
              {orders.filter(o => !isDoorOrder(o)).length}
            </span>
          </div>
          <p className="text-[11px] text-ivory/50 mt-1">Boutons céramiques et poignées sculptées à livrer</p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BARRE DE FILTRES : RECHERCHE + STATUT                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-walnut p-4 rounded-xl border border-gold/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Rechercher par nom, tél, ville, détail..."
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
                statusFilter === st 
                  ? 'bg-gold text-walnut' 
                  : 'bg-stone-900 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : st === 'PENDING' ? 'En attente' : st === 'CONTACTED' ? 'Contacté' : st === 'CONFIRMED' ? 'Confirmé' : st === 'COMPLETED' ? 'Livré' : 'Annulé'}
            </button>
          ))}
          <button
            type="button"
            onClick={loadOrders}
            title="Rafraîchir les demandes"
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-ivory/60 hover:text-white"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLEAU DES DEMANDES ET COMMANDES                                        */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50">Chargement des demandes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5">
          Aucune demande trouvée pour cette sélection.
        </div>
      ) : (
        <div className="bg-walnut rounded-2xl border border-gold/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/60 text-xs uppercase tracking-wider text-gold border-b border-gold/10">
                <tr>
                  <th className="px-6 py-4">Réf / Date</th>
                  <th className="px-6 py-4">Univers</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Détails de la Demande</th>
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
                  const isDoor = isDoorOrder(order)
                  const cleanPhone = (order.phoneNumber || '').replace(/\s+/g, '')

                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      {/* Réf & Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-gold font-bold">#REQ-{order.id}</span>
                        <p className="text-[10px] text-ivory/40">{dateStr}</p>
                      </td>

                      {/* Univers */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isDoor ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-[#E6A635]/15 text-[#F2BD52] border border-[#E6A635]/30">
                            <DoorOpen className="size-3" /> Poignée de Porte
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            <Sofa className="size-3" /> Poignée de Meuble
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{order.fullName}</p>
                        <p className="text-xs text-[#F2BD52] font-mono">{order.phoneNumber}</p>
                        {order.email && <p className="text-[10px] text-ivory/40">{order.email}</p>}
                      </td>

                      {/* Détails du Message */}
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <p className="text-xs text-ivory/80 line-clamp-2 leading-relaxed">
                          {order.message}
                        </p>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions Rapides : Appel, WhatsApp, Détail, Suppr */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Appel */}
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="size-8 rounded-lg bg-stone-900 hover:bg-[#E6A635] hover:text-[#1A110B] text-[#F2BD52] border border-white/5 flex items-center justify-center transition-colors"
                              title="Appeler le client"
                            >
                              <Phone className="size-3.5" />
                            </a>
                          )}

                          {/* WhatsApp */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                                `Bonjour ${order.fullName}, c'est Ismail de la Maison Aschi concernant votre demande de poignées (${isDoor ? 'Création de Porte Sur-Mesure' : 'Poignées de Meuble'}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="size-8 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-colors"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageCircle className="size-3.5" />
                            </a>
                          )}

                          {/* Voir / Modifier statut */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="size-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-ivory/70 hover:text-white border border-white/5 flex items-center justify-center transition-colors"
                            title="Examiner la demande"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {/* Supprimer */}
                          <button
                            type="button"
                            onClick={() => handleDelete(order.id)}
                            className="size-8 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors"
                            title="Supprimer la demande"
                          >
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

      {/* ========================================================================= */}
      {/* MODAL DÉTAILS DEMANDE & GESTION STATUT                                    */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-[#E6A635]/40 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-xs text-[#E6A635]">#REQ-{selectedOrder.id}</span>
              <h3 className="font-heading text-2xl text-white mt-1">{selectedOrder.fullName}</h3>
              <p className="text-xs text-ivory/50">
                Reçue le {new Date(selectedOrder.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Coordonnées Client */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-950 border border-white/5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#E6A635]">Téléphone</p>
                <a href={`tel:${selectedOrder.phoneNumber}`} className="text-white font-mono hover:underline block mt-0.5">
                  {selectedOrder.phoneNumber}
                </a>
              </div>
              {selectedOrder.email && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#E6A635]">Email</p>
                  <p className="text-white truncate mt-0.5">{selectedOrder.email}</p>
                </div>
              )}
            </div>

            {/* Contenu de la Demande */}
            <div>
              <p className="text-[10px] uppercase font-bold text-[#E6A635] mb-1.5">Détails de la demande</p>
              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 text-xs text-ivory/90 whitespace-pre-wrap leading-relaxed">
                {selectedOrder.message}
              </div>
            </div>

            {/* Gestion du Statut */}
            <div>
              <p className="text-[10px] uppercase font-bold text-[#E6A635] mb-2">Changer le statut</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'PENDING', label: 'En attente' },
                  { id: 'CONTACTED', label: 'Contacté' },
                  { id: 'CONFIRMED', label: 'Confirmé' },
                  { id: 'COMPLETED', label: 'Livré / Terminé' },
                  { id: 'CANCELLED', label: 'Annulé' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, st.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedOrder.status === st.id
                        ? 'bg-[#E6A635] text-[#1A110B] border-[#E6A635] font-bold'
                        : 'bg-stone-950 text-ivory/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Raccourcis de Contact WhatsApp & Tel */}
            <div className="pt-2 flex gap-3">
              <a
                href={`tel:${(selectedOrder.phoneNumber || '').replace(/\s+/g, '')}`}
                className="flex-1 py-2.5 rounded-xl bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <Phone className="size-4" />
                <span>Appeler</span>
              </a>
              <a
                href={`https://wa.me/${(selectedOrder.phoneNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${selectedOrder.fullName}, c'est Ismail de la Maison Aschi concernant votre demande de poignées.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <MessageCircle className="size-4" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
