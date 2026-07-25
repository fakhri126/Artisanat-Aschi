'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Delivery } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Truck } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDeliveries()
      setDeliveries(data)
    } catch (err: any) {
      console.warn("Backend inaccessible, utilisation de données fictives (mock) pour les livraisons.", err)
      setDeliveries([
        {
          id: 1,
          title: "Livraison Table Louis XVI à Tunis",
          description: "Une magnifique table sculptée livrée chez notre client.",
          imageUrl: "/placeholder.jpg",
          deliveryDate: new Date().toISOString().split('T')[0]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const openModal = (delivery?: Delivery) => {
    if (delivery) {
      setEditingDelivery(delivery)
      setTitle(delivery.title)
      setDescription(delivery.description)
      setImageUrl(delivery.imageUrl)
      setDeliveryDate(delivery.deliveryDate || new Date().toISOString().split('T')[0])
    } else {
      setEditingDelivery(null)
      setTitle('')
      setDescription('')
      setImageUrl('')
      setDeliveryDate(new Date().toISOString().split('T')[0])
    }
    setError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingDelivery(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !imageUrl || !deliveryDate) {
      setError("Tous les champs sont requis, y compris la photo.")
      return
    }

    try {
      setUploading(true)
      const data = { title, description, imageUrl, deliveryDate }

      if (editingDelivery) {
        await adminApi.updateDelivery(editingDelivery.id, data)
      } else {
        await adminApi.createDelivery(data)
      }

      await loadDeliveries()
      closeModal()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")) return

    try {
      await adminApi.deleteDelivery(id)
      await loadDeliveries()
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
          <h1 className="text-3xl font-heading text-stone-800">Livraisons de la Semaine</h1>
          <p className="text-stone-500 mt-1">Ajoutez vos livraisons pour les afficher sur la page d'accueil</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-md hover:bg-stone-800 transition-colors"
        >
          <Plus className="size-4" />
          Nouvelle Livraison
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Chargement...</div>
        ) : deliveries.length === 0 ? (
          <div className="p-8 text-center text-stone-500">Aucune livraison trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b">
                  <th className="p-4 font-medium text-stone-600 w-24">Photo</th>
                  <th className="p-4 font-medium text-stone-600">Titre</th>
                  <th className="p-4 font-medium text-stone-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 relative border border-stone-200">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt="Livraison" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-stone-400 size-6" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-stone-800">{d.title}</div>
                      <div className="text-sm text-stone-500 mt-1 line-clamp-1">{d.description}</div>
                      <div className="text-xs text-stone-400 mt-1">Date: {d.deliveryDate}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(d)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
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
            className="bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-800">
              <h2 className="text-2xl font-heading text-white flex items-center gap-2">
                <Truck className="size-5 text-[#C17D59]" />
                {editingDelivery ? 'Modifier la livraison' : 'Nouvelle livraison'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form id="delivery-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Images Upload Section */}
                <div className="bg-stone-950/50 p-6 rounded-xl border border-[#E8DCCB]/10">
                  <h3 className="text-sm font-bold text-[#C17D59] mb-4 uppercase tracking-wider">Photo de la livraison</h3>
                  
                  <div>
                    <ImageUploader
                      imageUrl={imageUrl}
                      onUploaded={(url) => setImageUrl(url)}
                      onRemove={() => setImageUrl('')}
                      uploading={uploading}
                      setUploading={setUploading}
                      uploadFn={adminApi.uploadImage}
                      acceptVideo={true}
                    />
                  </div>
                </div>

                {/* Texts */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Titre de la livraison</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Livraison d'une table basse à Carthage"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8DCCB]/50 focus:ring-1 focus:ring-gold/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Date de livraison</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8DCCB]/50 focus:ring-1 focus:ring-gold/50 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez l'objet livré, l'installation chez le client..."
                      rows={4}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8DCCB]/50 focus:ring-1 focus:ring-gold/50 transition-all resize-none"
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-stone-800 flex justify-end gap-3 bg-stone-900">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                disabled={uploading}
              >
                Annuler
              </button>
              <button
                form="delivery-form"
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 rounded-lg bg-[#E8DCCB] text-stone-900 font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>Patientez...</>
                ) : (
                  <>Enregistrer</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
