'use client'

import { useEffect, useState } from 'react'
import { adminApi, QuoteRequest } from '@/lib/api'
import { Trash2, Phone, Mail, Clock, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react'

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Selection details modal
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getQuotes()
      setQuotes(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des devis.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: 'PENDING' | 'CONTACTED' | 'COMPLETED') => {
    try {
      const updated = await adminApi.updateQuoteStatus(id, status)
      setQuotes(quotes.map(q => q.id === id ? updated : q))
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(updated)
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de devis ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setQuotes(quotes.filter(q => q.id !== id))
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(null)
      }
    } catch (err: any) {
      alert(err.message || 'Erreur de suppression.')
    }
  }

  if (loading && quotes.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-foreground text-left">Demandes de Devis</h1>
        <p className="mt-1 text-sm text-muted-foreground text-left">Traitez les demandes de devis et de personnalisation envoyées par les clients.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Quote Requests Table */}
      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4 pl-6">Client</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Produit Concerné</th>
                <th className="p-4">Date de réception</th>
                <th className="p-4">Statut</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Aucune demande de devis reçue.</td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <p className="font-semibold text-foreground">{quote.fullName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{quote.message}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5"><Mail className="size-3" /> {quote.email}</p>
                        <p className="flex items-center gap-1.5"><Phone className="size-3" /> {quote.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {quote.product ? (
                        <div>
                          <p className="font-medium text-gold">{quote.product.name}</p>
                          {quote.personalizationDetails && (
                            <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-1.5 py-0.5 rounded uppercase font-mono font-medium">Personnalisé</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Demande Générale</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(quote.createdDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        quote.status === 'PENDING' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                        quote.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                      }`}>
                        {quote.status === 'PENDING' ? 'En attente' :
                         quote.status === 'CONTACTED' ? 'Contacté' :
                         'Terminé'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedQuote(quote)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-border hover:border-gold rounded-full text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors"
                        >
                          Détails <ChevronRight className="size-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Details Drawer/Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-medium text-foreground">Détails de la demande</h2>
                <p className="text-xs text-muted-foreground">Reçue le {new Date(selectedQuote.createdDate).toLocaleString('fr-FR')}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Client Card */}
              <div className="p-4 bg-secondary/50 border border-border rounded-xl space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Informations Client</h3>
                <div className="text-sm">
                  <p className="font-semibold text-foreground text-base">{selectedQuote.fullName}</p>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2"><Mail className="size-4 text-gold" /> {selectedQuote.email}</p>
                    <p className="flex items-center gap-2"><Phone className="size-4 text-gold" /> {selectedQuote.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Product Reference */}
              {selectedQuote.product && (
                <div className="p-4 border border-gold/15 bg-gold/5 rounded-xl flex items-center gap-4">
                  <div className="size-16 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-border">
                    <img 
                      src={selectedQuote.product.images[0]?.imageUrl || '/placeholder.png'} 
                      alt={selectedQuote.product.name} 
                      className="size-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gold">Produit Référencé</span>
                    <h4 className="font-heading text-lg font-medium text-foreground">{selectedQuote.product.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedQuote.product.materials} · {selectedQuote.product.dimensions}</p>
                  </div>
                </div>
              )}

              {/* Custom Personalization Details */}
              {selectedQuote.personalizationDetails && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <AlertCircle className="size-4 text-gold" /> Demande de personnalisation
                  </h3>
                  <div className="p-4 border border-border bg-secondary/20 rounded-xl text-sm font-light leading-relaxed text-foreground whitespace-pre-line">
                    {selectedQuote.personalizationDetails}
                  </div>
                </div>
              )}

              {/* Main Message */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Message</h3>
                <div className="p-4 border border-border bg-secondary/20 rounded-xl text-sm font-light leading-relaxed text-foreground whitespace-pre-line">
                  {selectedQuote.message}
                </div>
              </div>

              {/* Status Update Options */}
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Mettre à jour le statut</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedQuote.id, 'PENDING')}
                    className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-full transition-all ${
                      selectedQuote.status === 'PENDING'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-border text-muted-foreground hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Clock className="size-3.5" /> En attente
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedQuote.id, 'CONTACTED')}
                    className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-full transition-all ${
                      selectedQuote.status === 'CONTACTED'
                        ? 'bg-amber-500 text-walnut border-amber-500'
                        : 'border-border text-muted-foreground hover:border-amber-500 hover:text-amber-500'
                    }`}
                  >
                    <Clock className="size-3.5" /> Contacté
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedQuote.id, 'COMPLETED')}
                    className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-full transition-all ${
                      selectedQuote.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" /> Terminé
                  </button>
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-border flex items-center justify-end bg-secondary/20">
              <button
                onClick={() => setSelectedQuote(null)}
                className="rounded-full bg-walnut text-ivory hover:bg-bronze px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Fermer
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
