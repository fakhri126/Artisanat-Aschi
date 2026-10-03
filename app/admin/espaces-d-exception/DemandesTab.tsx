'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  InboxIcon, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  MapPin, 
  Trash2, 
  RefreshCw, 
  Search,
  MessageCircle,
  Building
} from 'lucide-react'
import { adminApi, QuoteRequest } from '@/lib/api'

interface DemandesTabProps {
  onPendingCountChange?: (count: number) => void
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING: { label: '⏳ En attente', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  CONTACTED: { label: '📞 Contacté', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  COMPLETED: { label: '✅ Terminé', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
}

export default function DemandesTab({ onPendingCountChange }: DemandesTabProps) {
  const [demandes, setDemandes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED'>('ALL')
  const [expandedDemande, setExpandedDemande] = useState<number | null>(null)

  useEffect(() => {
    loadDemandes()
  }, [])

  const loadDemandes = async () => {
    try {
      setLoading(true)
      const all = await adminApi.getQuotes()
      const filtered = all.filter((q: QuoteRequest) =>
        q.personalizationDetails?.includes('[ESPACE_EXCEPTION]')
      )
      setDemandes(filtered)
      onPendingCountChange?.(filtered.filter(d => d.status === 'PENDING').length)
    } catch (err) {
      console.error('Erreur chargement demandes:', err)
      setDemandes([])
      onPendingCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: QuoteRequest['status']) => {
    try {
      await adminApi.updateQuoteStatus(id, status)
      setDemandes(prev => {
        const next = prev.map(d => d.id === id ? { ...d, status } : d)
        onPendingCountChange?.(next.filter(d => d.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la mise à jour du statut.')
    }
  }

  const handleDeleteDemande = async (id: number) => {
    if (!confirm('Supprimer cette demande d\'étude ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setDemandes(prev => {
        const next = prev.filter(d => d.id !== id)
        onPendingCountChange?.(next.filter(d => d.status === 'PENDING').length)
        return next
      })
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  const parseDetails = (details: string | null) => {
    if (!details) return {}
    const result: Record<string, string> = {}
    details.split('|').forEach(part => {
      const [key, ...val] = part.split(':')
      if (key && val.length) result[key.trim()] = val.join(':').trim()
    })
    return result
  }

  const filteredDemandes = useMemo(() => {
    return demandes.filter((demande) => {
      const parsed = parseDetails(demande.personalizationDetails)
      const s = search.toLowerCase().trim()
      const matchesSearch = !s || (
        demande.fullName.toLowerCase().includes(s) ||
        Boolean(demande.phoneNumber?.includes(s)) ||
        Boolean(demande.email?.toLowerCase().includes(s)) ||
        Boolean(demande.message?.toLowerCase().includes(s)) ||
        Boolean(parsed["Type d'espace"]?.toLowerCase().includes(s)) ||
        Boolean(parsed['Ville']?.toLowerCase().includes(s))
      )
      const matchesStatus = statusFilter === 'ALL' || demande.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [demandes, search, statusFilter])

  const counts = useMemo(() => ({
    ALL: demandes.length,
    PENDING: demandes.filter(d => d.status === 'PENDING').length,
    CONTACTED: demandes.filter(d => d.status === 'CONTACTED').length,
    COMPLETED: demandes.filter(d => d.status === 'COMPLETED').length,
  }), [demandes])

  const getWaLink = (d: QuoteRequest, spaceType: string) => {
    const phone = (d.phoneNumber || '').replace(/[^0-9]/g, '')
    const msg = `Bonjour ${d.fullName}, c'est Ismail de la Maison Aschi concernant votre projet d'aménagement (${spaceType}).`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="space-y-6">
      {/* ─── Filtres & Recherche ─── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par client, téléphone, ville, espace..."
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
            onClick={loadDemandes}
            className="ml-2 inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#E2DBD0] bg-white transition-colors cursor-pointer shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Liste des Demandes ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des demandes...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
            <InboxIcon className="size-8" />
          </div>
          <div>
            <p className="text-[#0F172A] text-sm font-bold">Aucune demande trouvée</p>
            <p className="text-[#64748B] text-xs mt-1">Les demandes reçues via le formulaire vitrine apparaîtront ici.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredDemandes.map((demande) => {
            const parsed = parseDetails(demande.personalizationDetails)
            const isExpanded = expandedDemande === demande.id
            const spaceType = parsed["Type d'espace"] || 'Espace d\'Exception'
            const city = parsed['Ville'] && parsed['Ville'] !== 'undefined' ? parsed['Ville'] : null
            const travaux = parsed['Travaux souhaités'] && parsed['Travaux souhaités'] !== 'undefined'
              ? parsed['Travaux souhaités'].split(',').map(t => t.trim()).filter(Boolean)
              : []

            const contactChannels = [
              { label: 'Client', val: demande.fullName, icon: User, iconBg: 'bg-[#FAF0E6] text-[#C17D59]' },
              { 
                label: 'Téléphone / WhatsApp', 
                val: demande.phoneNumber, 
                icon: Phone, 
                iconBg: 'bg-emerald-50 text-emerald-600', 
                href: `tel:${demande.phoneNumber}`,
                actionIcon: MessageCircle,
                actionHref: getWaLink(demande, spaceType),
                actionTitle: 'WhatsApp'
              },
              { 
                label: 'E-mail', 
                val: demande.email, 
                icon: Mail, 
                iconBg: 'bg-sky-50 text-sky-600', 
                href: `mailto:${demande.email}`,
                actionIcon: Mail,
                actionHref: `mailto:${demande.email}`,
                actionTitle: 'Envoyer un e-mail'
              }
            ]

            return (
              <div
                key={demande.id}
                className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs hover:border-[#C8960C]/40 transition-all overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                  onClick={() => setExpandedDemande(isExpanded ? null : demande.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-11 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] flex items-center justify-center shrink-0 text-[#C17D59]">
                      <Building className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-[#0F172A]">{demande.fullName}</span>
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[demande.status]?.badge || STATUS_CONFIG.PENDING.badge}`}>
                          {STATUS_CONFIG[demande.status]?.label || demande.status}
                        </span>
                        <span className="text-xs font-semibold text-[#C17D59] bg-[#FAF0E6] px-2.5 py-0.5 rounded-full border border-[#E8DFD4]">
                          {spaceType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B] flex-wrap">
                        {city && (
                          <span className="flex items-center gap-1 font-medium text-[#0F172A]">
                            <MapPin className="size-3 text-[#C17D59]" /> {city}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Phone className="size-3" /> {demande.phoneNumber}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(demande.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-[#64748B] hidden sm:inline">{isExpanded ? 'Masquer' : 'Détails'}</span>
                    <div className="size-8 rounded-full bg-[#FAF8F5] border border-[#E2DBD0] flex items-center justify-center text-[#64748B]">
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#E8DFD4] p-5 md:p-6 space-y-5 bg-[#FAF8F5]">
                    {/* Contact channels .map */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {contactChannels.map((c, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-[#E8DFD4] shadow-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
                              <c.icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">{c.label}</p>
                              {c.href ? (
                                <a href={c.href} className="text-xs font-bold text-[#0F172A] hover:text-[#C17D59] hover:underline block truncate">
                                  {c.val || '—'}
                                </a>
                              ) : (
                                <p className="text-xs font-bold text-[#0F172A] truncate">{c.val || '—'}</p>
                              )}
                            </div>
                          </div>
                          {c.actionIcon && c.actionHref && (
                            <a
                              href={c.actionHref}
                              target={c.actionTitle === 'WhatsApp' ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="size-8 rounded-lg bg-[#0F172A] hover:bg-[#C8960C] text-white flex items-center justify-center shrink-0 transition-all shadow-xs"
                              title={c.actionTitle}
                            >
                              <c.actionIcon className="size-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Cahier des charges */}
                    <div className="bg-white rounded-xl p-5 border border-[#E8DFD4] shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8DFD4] pb-3">
                        <p className="text-xs uppercase tracking-wider text-[#0F172A] font-bold flex items-center gap-2">
                          <Wrench className="size-4 text-[#C17D59]" /> Cahier des charges du projet
                        </p>
                        {city && <span className="text-xs font-semibold text-[#0F172A]">📍 {city}</span>}
                      </div>

                      {travaux.length > 0 && (
                        <div>
                          <p className="text-[10.5px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">Prestations souhaitées :</p>
                          <div className="flex flex-wrap gap-2">
                            {travaux.map((travail, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                                <CheckCircle2 className="size-3 text-[#C8960C]" /> {travail}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {demande.message && (
                        <div>
                          <p className="text-[10.5px] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Description &amp; Remarques :</p>
                          <div className="text-xs text-[#1E293B] leading-relaxed bg-[#FAF8F5] rounded-xl p-4 border border-[#E8DFD4]">
                            {demande.message}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#64748B]">Statut commercial :</span>
                        {(['PENDING', 'CONTACTED', 'COMPLETED'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(demande.id, s)}
                            className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
                              demande.status === s
                                ? STATUS_CONFIG[s].badge + ' shadow-xs scale-102'
                                : 'border-[#E2DBD0] bg-white text-[#475569] hover:border-[#CBD5E1]'
                            }`}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleDeleteDemande(demande.id)}
                        className="text-xs px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Trash2 className="size-3.5" /> Supprimer la demande
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
