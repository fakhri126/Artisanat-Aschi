'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Relooking } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ArrowLeftRight } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

const FALLBACK_RELOOKINGS: Relooking[] = [
  {
    id: 1,
    title: 'Commode de Style Louis XVI',
    description: 'Restauration complète d\'une commode en placage de noyer desséchée. Décapage, comblement des fentes et vernissage traditionnel au tampon.',
    imageAvantUrl: '/relooking-before.jpg',
    imageApresUrl: '/relooking-after.jpg',
    createdDate: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Cadre de Miroir Ottoman',
    description: 'Reconstitution des ornements sculptés endommagés sur un cadre en bois doré d\'époque et dorure fine à la feuille d\'or.',
    imageAvantUrl: '/mirror-before.jpg',
    imageApresUrl: '/mirror-after.jpg',
    createdDate: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Porte d\'Entrée de Demeure',
    description: 'Rénovation esthétique et protectrice d\'une porte d\'entrée en bois massif exposée aux intempéries.',
    imageAvantUrl: '/door-before.jpg',
    imageApresUrl: '/door-after.jpg',
    createdDate: new Date().toISOString()
  }
]

export default function AdminRelookingPage() {
  const [relookings, setRelookings] = useState<Relooking[]>(FALLBACK_RELOOKINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRelooking, setEditingRelooking] = useState<Relooking | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageAvantUrl, setImageAvantUrl] = useState('')
  const [imageApresUrl, setImageApresUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadRelookings()
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

  const openModal = (relooking?: Relooking) => {
    if (relooking) {
      setEditingRelooking(relooking)
      setTitle(relooking.title)
      setDescription(relooking.description)
      setImageAvantUrl(relooking.imageAvantUrl)
      setImageApresUrl(relooking.imageApresUrl)
    } else {
      setEditingRelooking(null)
      setTitle('')
      setDescription('')
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
    
    if (!title || !description || !imageAvantUrl || !imageApresUrl) {
      setError("Tous les champs sont requis, y compris les deux images.")
      return
    }

    try {
      setUploading(true)
      const data = { title, description, imageAvantUrl, imageApresUrl }

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
          <p className="text-stone-500 mt-1">Ajoutez vos projets Avant / Après</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-md hover:bg-stone-800 transition-colors"
        >
          <Plus className="size-4" />
          Nouveau Relooking
        </button>
      </div>

      {/* List */}
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
