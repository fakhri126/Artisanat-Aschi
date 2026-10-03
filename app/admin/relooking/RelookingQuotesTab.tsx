'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  InboxIcon, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  Trash2, 
  Clock, 
  MessageCircle, 
  CheckCircle2,
  Wrench
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'

interface RelookingQuotesTabProps {
  onPendingCountChange?: (count: number) => void
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING: { label: '⏳ En attente', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  CONTACTED: { label: '📞 Contacté', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  COMPLETED: { label: '✅ Terminé', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
}

export default function RelookingQuotesTab({ onPendingCountChange }: RelookingQuotesTabProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL')

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const allQuotes = await adminApi.getQuotes()
      const relookingQuotes = allQuotes.filter((q: QuoteRequest) => {
        const msg = (q.message || '').toLowerCase()
        const det = (q.personalizationDetails || '').toLowerCase()
        return (
          msg.includes('relooking') ||
          msg.includes('restauration') ||
          msg.includes('rénovation') ||
          det.includes('relooking') ||
          det.includes('restauration')
        )
      })
      setQuotes(relookingQuotes)
      onPendingCountChange?.(relookingQuotes.filter(q => q.status === 'PENDING').length)
    } catch (err) {
      console.error('Erreur chargement devis relooking:', err)
      setQuotes([])
      onPendingCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: QuoteRequest['status']) => {
    try {
      await adminApi.updateQuoteStatus(id, status)
      setQuotes(prev => {
        const next = prev.map(q => q.id === id ? { ...q, status } : q)
        onPendingCountChange?.(next.filter(q => q.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la mise à jour du statut.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette demande de devis ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setQuotes(prev => {
        const next = prev.filter(q => q.id !== id)
        onPendingCountChange?.(next.filter(q => q.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  const getWaLink = (q: QuoteRequest) => {
    const phone = (q.phoneNumber || '').replace(/[^0-9]/g, '')
    const msg = `Bonjour ${q.fullName}, c'est Ismail de la Maison Aschi concernant votre demande de devis pour un projet de relooking ou restauration de mobilier.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const s = search.toLowerCase().trim()
      const matchesSearch = !s || (
        q.fullName.toLowerCase().includes(s) ||
        Boolean(q.email?.toLowerCase().includes(s)) ||
        Boolean(q.phoneNumber?.includes(s)) ||
        Boolean(q.message?.toLowerCase().includes(s))
      )
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [quotes, search, statusFilter])

  const counts = useMemo(() => ({
    ALL: quotes.length,
    PENDING: quotes.filter(q => q.status === 'PENDING').length,
    CONTACTED: quotes.filter(q => q.status === 'CONTACTED').length,
    COMPLETED: quotes.filter(q => q.status === 'COMPLETED').length,
  }), [quotes])

  return (
    <div className="space-y-6 text-left text-[#0F172A]">
      {/* ─── Filtres & Recherche ─── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par client, téléphone, mot-clé..."
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
            onClick={loadQuotes}
            className="ml-2 inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#E2DBD0] bg-white transition-colors cursor-pointer shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Liste des Devis ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des demandes de relooking...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
            <InboxIcon className="size-8" />
          </div>
          <div>
            <p className="text-[#0F172A] text-sm font-bold">Aucune demande de devis trouvée</p>
            <p className="text-[#64748B] text-xs mt-1">
              Les demandes de restauration de meubles soumises sur le site apparaîtront ici.
            </p>
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
                  <th className="p-4 font-bold">Détails du projet</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4] text-xs">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Client */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] flex items-center justify-center text-[#C17D59] shrink-0 font-bold text-xs">
                          {q.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#0F172A]">{q.fullName}</span>
                      </div>
                    </td>

                    {/* Contact & WhatsApp */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${q.phoneNumber}`} className="font-bold text-[#0F172A] hover:text-[#C17D59] hover:underline">
                          {q.phoneNumber}
                        </a>
                        {q.phoneNumber && (
                          <a
                            href={getWaLink(q)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-2xs"
                            title="Ouvrir WhatsApp"
                          >
                            <MessageCircle className="size-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] font-mono truncate max-w-[180px]">{q.email}</p>
                    </td>

                    {/* Message / Projet */}
                    <td className="p-4 max-w-sm">
                      {q.message ? (
                        <p className="text-[11.5px] text-[#475569] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DFD4] line-clamp-2 leading-relaxed">
                          {q.message}
                        </p>
                      ) : (
                        <span className="text-[#94A3B8] italic">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-[#64748B] whitespace-nowrap">
                      {new Date(q.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Statut */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${STATUS_CONFIG[q.status]?.badge || STATUS_CONFIG.PENDING.badge}`}>
                        {STATUS_CONFIG[q.status]?.label || q.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={q.status}
                          onChange={(e) => handleUpdateStatus(q.id, e.target.value as any)}
                          className="text-[11px] font-semibold bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg px-2 py-1 text-[#0F172A] outline-none cursor-pointer"
                        >
                          <option value="PENDING">⏳ En attente</option>
                          <option value="CONTACTED">📞 Contacté</option>
                          <option value="COMPLETED">✅ Terminé</option>
                        </select>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la demande"
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
