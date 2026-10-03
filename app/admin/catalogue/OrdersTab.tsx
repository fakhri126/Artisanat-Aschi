'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  RefreshCw, 
  Bot, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Mail, 
  ExternalLink, 
  SlidersHorizontal, 
  FileText, 
  Trash2, 
  X, 
  Printer 
} from 'lucide-react'
import Link from 'next/link'
import { adminApi, QuoteRequest } from '@/lib/api'

export default function OrdersTab() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [selectedQuoteForInspection, setSelectedQuoteForInspection] = useState<QuoteRequest | null>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoadingQuotes(true)
      const data = await adminApi.getQuotes()
      setQuotes(data || [])
    } catch (err) {
      console.error("Failed to load quotes:", err)
      setQuotes([])
    } finally {
      setLoadingQuotes(false)
    }
  }

  // Filtrer uniquement les devis provenant du Catalogue (Sur-mesure / personnalisation)
  const catalogQuotes = useMemo(() => {
    return quotes.filter(q => {
      if (q.product?.type === 'CATALOGUE') return true
      const details = (q.personalizationDetails || q.message || '').toLowerCase()
      const pName = (q.product?.name || '').toLowerCase()
      const isShopOrder = details.includes('panier') || details.includes('commande produit') || details.includes('achat direct')
      const isBijoux = details.includes('bijoux de porte') || details.includes('accessoires') || details.includes('bouton majolique')
      const isEspace = details.includes('espace_exception') || details.includes('résidence')
      if (isShopOrder || isBijoux || isEspace) return false
      return pName.includes('modèle') || pName.includes('modele') || details.includes('finition') || details.includes('catalogue')
    })
  }, [quotes])

  const handleUpdateQuoteStatus = async (quoteId: number, newStatus: string) => {
    try {
      await adminApi.updateQuoteStatus(quoteId, newStatus)
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus as any } : q))
    } catch (err) {
      console.error("Failed to update quote status:", err)
      alert("Erreur lors de la mise à jour du statut.")
    }
  }

  const handleDeleteQuote = async (quoteId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement cette fiche devis ?")) return
    try {
      await adminApi.deleteQuoteRequest(quoteId)
      setQuotes(prev => prev.filter(q => q.id !== quoteId))
      if (selectedQuoteForInspection?.id === quoteId) {
        setSelectedQuoteForInspection(null)
      }
    } catch (err) {
      console.error("Failed to delete quote:", err)
      alert("Erreur lors de la suppression de la fiche devis.")
    }
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Header & Stats Bar */}
      <div className="bg-[#2E2018]/95 p-5 rounded-3xl border border-[#E6A635]/25 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6A635]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C] border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="size-3" />
              <span>Demandes Personnalisées d&apos;Atelier</span>
            </div>
            <h2 className="font-heading text-2xl text-[#FAF7F2] font-semibold">
              Fiches Devis &amp; Commandes Sur-Mesure
            </h2>
            <p className="text-xs text-[#EAE4D9]/80 mt-1">
              Demandes spécifiques envoyées par les clients depuis le configurateur et le nuancier du catalogue en ligne.
            </p>
          </div>

          <button 
            onClick={loadQuotes} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A110B] border border-[#E6A635]/40 text-[#F2BD52] text-xs font-bold uppercase tracking-wider hover:bg-[#3B271C] transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <RefreshCw className={`size-3.5 ${loadingQuotes ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-[#E6A635]/20 flex items-center justify-between">
            <span className="text-[#EAE4D9]/70">Total Demandes :</span>
            <span className="font-bold text-[#F2BD52] text-sm">{catalogQuotes.length}</span>
          </div>
          <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <span className="text-amber-300/80">En attente :</span>
            <span className="font-bold text-amber-400 text-sm">
              {catalogQuotes.filter(q => q.status === 'PENDING').length}
            </span>
          </div>
          <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-blue-500/30 flex items-center justify-between">
            <span className="text-blue-300/80">Contacté :</span>
            <span className="font-bold text-blue-400 text-sm">
              {catalogQuotes.filter(q => q.status === 'CONTACTED').length}
            </span>
          </div>
          <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <span className="text-emerald-300/80">Confirmé :</span>
            <span className="font-bold text-emerald-400 text-sm">
              {catalogQuotes.filter(q => q.status === 'COMPLETED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Quotes List / Cards */}
      {loadingQuotes ? (
        <div className="p-16 text-center text-[#EAE4D9]/70 bg-[#2E2018]/50 rounded-3xl border border-[#E6A635]/20">
          <div className="size-10 animate-spin rounded-full border-4 border-[#E6A635] border-t-transparent mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold">Chargement des fiches devis...</p>
        </div>
      ) : catalogQuotes.length === 0 ? (
        <div className="p-16 text-center text-[#EAE4D9]/60 bg-[#2E2018]/60 rounded-3xl border border-dashed border-[#E6A635]/30">
          <Bot className="size-12 mx-auto mb-3 text-[#E6A635]/40" />
          <h3 className="font-heading text-lg text-[#FAF7F2] font-medium">Aucune demande de devis catalogue pour le moment</h3>
          <p className="text-xs text-[#EAE4D9]/60 max-w-sm mx-auto mt-1">
            Les demandes formulées par les visiteurs depuis les modèles du catalogue apparaîtront ici avec toutes leurs spécifications sur-mesure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {catalogQuotes.map((q) => {
            const prod = q.product
            const prodImage = prod?.images?.[0]?.imageUrl || '/placeholder.png'
            const cleanPhone = (q.phoneNumber || '').replace(/[^0-9+]/g, '')
            const waGreeting = encodeURIComponent(`Bonjour ${q.fullName}, suite à votre demande sur notre catalogue Artisanat Aschi concernant le modèle « ${prod?.name || 'Mobilier sur-mesure'} », nos maîtres artisans ont examiné votre projet et nous serions ravis d'en discuter avec vous...`)
            const waLink = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('216') ? cleanPhone : '216' + cleanPhone}?text=${waGreeting}`

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2E2018]/95 border border-[#E6A635]/25 hover:border-[#E6A635]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
              >
                {/* Top Identity Header */}
                <div className="p-4 sm:p-5 border-b border-[#E6A635]/15 bg-[#1A110B]/60 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#C78318] to-[#F3C45E] text-[#1A110B] font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                      {q.fullName ? q.fullName.slice(0, 2).toUpperCase() : 'CL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-bold text-[#FAF7F2]">{q.fullName}</h3>
                        <span className="font-mono text-[10px] text-[#F2BD52] bg-[#3B271C] px-1.5 py-0.5 rounded border border-[#E6A635]/30">
                          #DEV-{q.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#EAE4D9]/70 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-[#E6A635]" />
                          {new Date(q.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border shadow-xs ${
                    q.status === 'PENDING' 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' 
                      : q.status === 'CONTACTED' 
                        ? 'bg-blue-950/80 text-blue-300 border-blue-500/40' 
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Confirmé / Confection'}
                  </span>
                </div>

                {/* Middle Card Content */}
                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  
                  {/* Quick Communication Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {q.phoneNumber && (
                      <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <MessageCircle className="size-3.5" /> WhatsApp direct
                      </a>
                    )}
                    {q.phoneNumber && (
                      <a 
                        href={`tel:${q.phoneNumber}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A110B] hover:bg-[#3B271C] border border-[#E6A635]/30 text-[#F2BD52] text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Phone className="size-3.5" /> {q.phoneNumber}
                      </a>
                    )}
                    {q.email && (
                      <a 
                        href={`mailto:${q.email}?subject=Devis Artisanat Aschi - Modèle ${prod?.name || 'Catalogue'}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A110B] hover:bg-[#3B271C] border border-[#E6A635]/30 text-[#EAE4D9] text-xs transition-all cursor-pointer"
                      >
                        <Mail className="size-3.5 text-[#F2BD52]" /> {q.email}
                      </a>
                    )}
                  </div>

                  {/* Product Card Highlight */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A110B]/70 border border-[#E6A635]/25">
                    <div className="size-16 rounded-xl overflow-hidden bg-black/50 border border-[#E6A635]/30 shrink-0">
                      <img 
                        src={prodImage} 
                        alt={prod?.name || 'Modèle catalogue'} 
                        className="size-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2BD52]">
                          {prod?.category?.name || 'Modèle Catalogue'}
                        </span>
                        {prod?.id && (
                          <Link 
                            href={`/produits/${prod.id}`} 
                            target="_blank" 
                            className="text-[10.5px] text-[#F2BD52] hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Fiche public <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                      <h4 className="font-heading text-sm font-bold text-[#FAF7F2] truncate mt-0.5">
                        {prod?.name || 'Modèle du Catalogue'}
                      </h4>
                      <p className="text-[11px] text-[#EAE4D9]/70 truncate">
                        {prod?.materials || 'Bois noble & Faïence artisanale'}
                      </p>
                    </div>
                  </div>

                  {/* Customization Details Block */}
                  <div className="space-y-2 bg-[#241812]/90 p-3.5 rounded-2xl border border-[#E6A635]/20 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2BD52] flex items-center gap-1">
                      <SlidersHorizontal className="size-3" /> Spécifications Demandées :
                    </span>
                    
                    <div className="text-[#FAF7F2] leading-relaxed whitespace-pre-line font-sans text-xs bg-[#1A110B]/60 p-2.5 rounded-xl border border-white/5">
                      {q.personalizationDetails || q.message || 'Aucune note complémentaire.'}
                    </div>
                  </div>

                </div>

                {/* Bottom Status & Management Actions */}
                <div className="p-4 border-t border-[#E6A635]/20 bg-[#1A110B]/80 flex items-center justify-between gap-2 flex-wrap">
                  {/* Status switcher */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#EAE4D9]/60 mr-1">Statut :</span>
                    <button
                      onClick={() => handleUpdateQuoteStatus(q.id, 'PENDING')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        q.status === 'PENDING' ? 'bg-amber-500 text-[#1A110B]' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => handleUpdateQuoteStatus(q.id, 'CONTACTED')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        q.status === 'CONTACTED' ? 'bg-blue-500 text-white' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                      }`}
                    >
                      Contacté
                    </button>
                    <button
                      onClick={() => handleUpdateQuoteStatus(q.id, 'COMPLETED')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        q.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                      }`}
                    >
                      Validé
                    </button>
                  </div>

                  {/* Modal view & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedQuoteForInspection(q)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3B271C] hover:bg-[#4A3224] border border-[#E6A635]/40 text-[#F2BD52] text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <FileText className="size-3.5" /> Fiche complète
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Supprimer cette demande"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>
      )}

      {/* Inspection Modal for Quote Details */}
      {selectedQuoteForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#211A15] border border-[#3A2E24] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#F5F0E8] max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[#C8794D]/20 border border-[#C8794D]/30 text-[#C8794D] flex items-center justify-center font-bold">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#F5F0E8]">
                    Fiche Complète de Devis Atelier #{selectedQuoteForInspection.id}
                  </h3>
                  <p className="text-xs text-[#D9C8AE]/70">
                    Date de réception : {new Date(selectedQuoteForInspection.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedQuoteForInspection(null)}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#D9C8AE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#C8794D]">Nom du client</p>
                  <p className="font-semibold text-[#F5F0E8] mt-0.5">{selectedQuoteForInspection.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#C8794D]">Téléphone</p>
                  <p className="font-semibold text-[#F5F0E8] mt-0.5">{selectedQuoteForInspection.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#C8794D]">Email</p>
                  <p className="font-semibold text-[#F5F0E8] mt-0.5 truncate">{selectedQuoteForInspection.email}</p>
                </div>
              </div>

              {/* Product Highlight */}
              {selectedQuoteForInspection.product && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24]">
                  <div className="size-20 rounded-xl overflow-hidden bg-black/60 border border-[#3A2E24] shrink-0">
                    <img 
                      src={selectedQuoteForInspection.product.images?.[0]?.imageUrl || '/placeholder.png'} 
                      alt={selectedQuoteForInspection.product.name} 
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8794D]">
                      {selectedQuoteForInspection.product.category?.name || 'Catalogue'}
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#F5F0E8]">
                      {selectedQuoteForInspection.product.name}
                    </h4>
                    <p className="text-xs text-[#D9C8AE]/70 mt-0.5">
                      {selectedQuoteForInspection.product.materials || 'Bois noble & Faïence d’art'}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-[#C8794D] tracking-wider">
                  Détails de Personnalisation &amp; Notes
                </h4>
                <div className="p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24] text-sm leading-relaxed text-[#F5F0E8] whitespace-pre-line">
                  {selectedQuoteForInspection.personalizationDetails || selectedQuoteForInspection.message}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
              <button 
                onClick={() => window.print()} 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#D9C8AE] cursor-pointer"
              >
                <Printer className="size-3.5" /> Imprimer la fiche
              </button>
              <button 
                onClick={() => setSelectedQuoteForInspection(null)} 
                className="px-5 py-2 rounded-full bg-[#C8794D] hover:bg-[#B5673C] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
