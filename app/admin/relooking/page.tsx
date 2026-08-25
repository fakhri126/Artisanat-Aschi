'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Relooking, QuoteRequest } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ArrowLeftRight, InboxIcon, Phone, Mail, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

const FALLBACK_RELOOKINGS: Relooking[] = [
  {
    id: 1,
    title: 'Commode de Style Louis XVI',
    description: 'Restauration complète d\'une commode en placage de noyer desséchée. Décapage, comblement des fentes et vernissage traditionnel au tampon.',
    imageAvantUrl: '/relooking-before.jpg',
    imageApresUrl: '/relooking-after.jpg',
    category: 'Meubles Anciens',
    createdDate: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Cadre de Miroir Ottoman',
    description: 'Reconstitution des ornements sculptés endommagés sur un cadre en bois doré d\'époque et dorure fine à la feuille d\'or.',
    imageAvantUrl: '/mirror-before.jpg',
    imageApresUrl: '/mirror-after.jpg',
    category: 'Miroirs & Cadres',
    createdDate: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Porte d\'Entrée de Demeure',
    description: 'Rénovation esthétique et protectrice d\'une porte d\'entrée en bois massif exposée aux intempéries.',
    imageAvantUrl: '/door-before.jpg',
    imageApresUrl: '/door-after.jpg',
    category: 'Portes & Boiseries',
    createdDate: new Date().toISOString()
  }
]

export default function AdminRelookingPage() {
  const [activeTab, setActiveTab] = useState<'RELOOKINGS' | 'QUOTES'>('RELOOKINGS')
  const [relookings, setRelookings] = useState<Relooking[]>(FALLBACK_RELOOKINGS)
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRelooking, setEditingRelooking] = useState<Relooking | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageAvantUrl, setImageAvantUrl] = useState('')
  const [imageApresUrl, setImageApresUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadRelookings()
    loadQuotes()
  }, [])

  const loadRelookings = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getRelookings()
      if (data && data.length > 0) {
        setRelookings(data)
      } else {
        setRelookings(FALLBACK_RELOOKINGS)
      }
    } catch (err: any) {
      console.warn("Backend inaccessible, utilisation des relookings modèles par défaut.", err)
      setRelookings(FALLBACK_RELOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  const loadQuotes = async () => {
    try {
      setLoadingQuotes(true)
      const allQuotes = await adminApi.getQuotes()
      // Filter quote requests relating to Relooking / Restauration
      const relookingQuotes = allQuotes.filter(q => {
        const msg = (q.message || '').toLowerCase()
        const det = (q.personalizationDetails || '').toLowerCase()
        return msg.includes('relooking') || msg.includes('restauration') || msg.includes('rénovation') || det.includes('relooking') || det.includes('restauration')
      })
      setQuotes(relookingQuotes)
    } catch (err) {
      console.error('Failed to load relooking quotes:', err)
      setQuotes([])
    } finally {
      setLoadingQuotes(false)
    }
  }

  const handleUpdateQuoteStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateQuoteStatus(id, status as any)
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: status as any } : q))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteQuote = async (id: number) => {
    if (!confirm('Supprimer cette demande de devis ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setQuotes(quotes.filter(q => q.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const openModal = (relooking?: Relooking) => {
    if (relooking) {
      setEditingRelooking(relooking)
      setTitle(relooking.title)
      setDescription(relooking.description)
      setCategory(relooking.category || '')
      setImageAvantUrl(relooking.imageAvantUrl)
      setImageApresUrl(relooking.imageApresUrl)
    } else {
      setEditingRelooking(null)
      setTitle('')
      setDescription('')
      setCategory('')
      setImageAvantUrl('')
      setImageApresUrl('')
    }
    setError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRelooking(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !category || !imageAvantUrl || !imageApresUrl) {
      setError("Tous les champs sont requis, y compris la catégorie et les deux images.")
      return
    }

    try {
      setUploading(true)
      const data = { title, description, category, imageAvantUrl, imageApresUrl }

      if (editingRelooking) {
        await adminApi.updateRelooking(editingRelooking.id, data)
      } else {
        await adminApi.createRelooking(data)
      }

      await loadRelookings()
      closeModal()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette restauration ?")) return

    try {
      await adminApi.deleteRelooking(id)
      await loadRelookings()
    } catch (err: any) {
      console.error(err)
      alert("Erreur lors de la suppression")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-stone-800">Gestion des Relookings</h1>
          <p className="text-stone-500 mt-1">Gérez les projets Avant / Après et les demandes de devis de restauration.</p>
        </div>
        {activeTab === 'RELOOKINGS' && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-md hover:bg-stone-800 transition-colors"
          >
            <Plus className="size-4" />
            Nouveau Relooking
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('RELOOKINGS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'RELOOKINGS'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <ArrowLeftRight className="size-4" /> Mes Restauration (Avant / Après)
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'QUOTES'
              ? 'bg-[#C17D59] text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <InboxIcon className="size-4" /> Demandes de Devis Relooking
          {quotes.filter(q => q.status === 'PENDING').length > 0 && (
            <span className="bg-white text-[#C17D59] text-[10px] font-black rounded-full px-2 py-0.5 ml-1">
              {quotes.filter(q => q.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT 2: DEMANDES DE DEVIS RELOOKING */}
      {activeTab === 'QUOTES' && (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-stone-800 font-semibold">Demandes de Devis - Relooking & Restauration</h2>
            <button onClick={loadQuotes} className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
              <RefreshCw className="size-3.5" /> Actualiser
            </button>
          </div>

          {loadingQuotes ? (
            <div className="p-8 text-center text-stone-500">Chargement des devis...</div>
          ) : quotes.length === 0 ? (
            <div className="p-12 text-center text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <InboxIcon className="size-10 mx-auto mb-2 opacity-40 text-stone-400" />
              <p>Aucune demande de devis reçue spécifiquement pour le Relooking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b text-xs uppercase tracking-wider text-stone-600">
                    <th className="p-4">Client</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Message / Détails</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-semibold text-stone-800">{q.fullName}</td>
                      <td className="p-4 text-xs text-stone-600 space-y-1">
                        <p className="flex items-center gap-1"><Mail className="size-3 text-[#C17D59]" /> {q.email}</p>
                        <p className="flex items-center gap-1"><Phone className="size-3 text-[#C17D59]" /> {q.phoneNumber}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-stone-700 bg-stone-100 p-2.5 rounded-lg border border-stone-200 leading-relaxed">{q.message}</p>
                      </td>
                      <td className="p-4 text-xs text-stone-500">
                        {new Date(q.createdDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          q.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          q.status === 'CONTACTED' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Terminé'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateQuoteStatus(q.id, 'CONTACTED')}
                          className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium"
                        >
                          Contacté
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 1: RELOOKINGS LIST */}
      {activeTab === 'RELOOKINGS' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Chargement...</div>
        ) : relookings.length === 0 ? (
          <div className="p-8 text-center text-stone-500">Aucun relooking trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b">
                  <th className="p-4 font-medium text-stone-600 w-24">Avant</th>
                  <th className="p-4 font-medium text-stone-600 w-24">Après</th>
                  <th className="p-4 font-medium text-stone-600">Titre</th>
                  <th className="p-4 font-medium text-stone-600">Catégorie</th>
                  <th className="p-4 font-medium text-stone-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {relookings.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 relative border border-stone-200">
                        {r.imageAvantUrl ? (
                          <img src={r.imageAvantUrl} alt="Avant" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-stone-400 size-6" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/50 text-white text-[8px] text-center font-bold">AVANT</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 relative border border-[#E8DCCB]/30">
                        {r.imageApresUrl ? (
                          <img src={r.imageApresUrl} alt="Après" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-stone-400 size-6" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-[#E8DCCB] text-black text-[8px] text-center font-bold">APRÈS</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-stone-800">{r.title}</div>
                      <div className="text-sm text-stone-500 mt-1 line-clamp-1">{r.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-md border border-stone-200">
                        {r.category || 'Général'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(r)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
        )}
      </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#FAF7F2] border border-[#E8DCCB]/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-[#E8DCCB]/10 flex justify-between items-center">
              <h2 className="text-xl font-heading text-[#3A2A21] flex items-center gap-2">
                <ArrowLeftRight className="size-5 text-[#C17D59]" />
                {editingRelooking ? "Modifier le relooking" : 'Ajouter un relooking'}
              </h2>
              <button onClick={closeModal} className="text-[#3A2A21]/50 hover:text-[#3A2A21]">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-950/40 border border-red-500/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A2A21]/60 font-semibold mb-1">Titre de la restauration</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/20 border border-[#E8DCCB]/10 focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-[#3A2A21] outline-none shadow-inner transition-colors"
                    placeholder="Ex: Restauration d'une commode d'époque"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A2A21]/60 font-semibold mb-1">Catégorie</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/20 border border-[#E8DCCB]/10 focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-[#3A2A21] outline-none shadow-inner transition-colors appearance-none"
                  >
                    <option value="" disabled>Sélectionnez une catégorie...</option>
                    <option value="Miroirs & Cadres">Miroirs & Cadres</option>
                    <option value="Mobilier d'Art">Mobilier d'Art</option>
                    <option value="Portes & Sculptures">Portes & Sculptures</option>
                    <option value="Luminaires & Décoration">Luminaires & Décoration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3A2A21]/60 font-semibold mb-1">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white/20 border border-[#E8DCCB]/10 focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-[#3A2A21] outline-none resize-none shadow-inner transition-colors"
                    placeholder="Détails du travail effectué..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E8DCCB]/10">
                  <div className="bg-white/10 p-4 rounded-xl border border-[#E8DCCB]/5">
                    <label className="block text-sm font-bold text-stone-700 mb-2">Photo AVANT (État d'origine)</label>
                    <ImageUploader
                      label="Image Avant"
                      imageUrl={imageAvantUrl}
                      onUploaded={setImageAvantUrl}
                      onRemove={() => setImageAvantUrl('')}
                      uploading={uploading}
                      setUploading={setUploading}
                      uploadFn={adminApi.uploadImage}
                    />
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-[#E8DCCB]/5">
                    <label className="block text-xs uppercase tracking-wider text-[#C17D59] font-semibold mb-2">Photo APRÈS (Restauré)</label>
                    <ImageUploader
                      label="Image Après"
                      imageUrl={imageApresUrl}
                      onUploaded={setImageApresUrl}
                      onRemove={() => setImageApresUrl('')}
                      uploading={uploading}
                      setUploading={setUploading}
                      uploadFn={adminApi.uploadImage}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E8DCCB]/10 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[#E8DCCB]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#3A2A21] hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/90 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow-[0_0_10px_rgba(201,168,76,0.2)] disabled:opacity-50"
                >
                  {uploading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
