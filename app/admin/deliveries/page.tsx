'use client'

import { useEffect, useState, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Delivery } from '@/lib/api'
import { formatImageUrl } from '@/lib/utils'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Truck, 
  Upload, 
  Calendar, 
  Star 
} from 'lucide-react'

export interface DeliveryForm {
  id?: number
  title: string
  description: string
  images: string[]
  deliveryDate: string
}

const DEFAULT_FORM: DeliveryForm = {
  title: '',
  description: '',
  images: [],
  deliveryDate: new Date().toISOString().split('T')[0]
}

export const parseDeliveryImages = (imageUrl?: string | null): string[] => {
  if (!imageUrl) return []
  return imageUrl.split(',').map(s => s.trim()).filter(Boolean)
}

// ─── MAIN DELIVERIES PAGE COMPONENT ─────────────────────────────────────────
export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<DeliveryForm>(DEFAULT_FORM)

  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDeliveries()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.warn("Erreur chargement livraisons:", err)
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setForm({ ...DEFAULT_FORM, deliveryDate: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  const handleOpenEdit = (delivery: Delivery) => {
    setForm({
      id: delivery.id,
      title: delivery.title,
      description: delivery.description || '',
      images: parseDeliveryImages(delivery.imageUrl),
      deliveryDate: delivery.deliveryDate || new Date().toISOString().split('T')[0]
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer définitivement cette livraison ?")) return
    try {
      await adminApi.deleteDelivery(id)
      setDeliveries(prev => prev.filter(d => d.id !== id))
    } catch (err: any) {
      alert("Erreur lors de la suppression.")
    }
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* ─── Header Banner ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E8DFD4] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C17D59] via-[#C8960C] to-[#E5D7C5]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-[10px] uppercase tracking-widest mb-2 font-semibold">
              <Truck className="size-3 text-[#C8960C]" /> Livraisons de Mobilier &amp; Artisanat
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl text-[#0F172A] font-bold">
              Livraisons de la Semaine
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
              Publiez les photos des pièces d&apos;artisanat livrées et installées chez vos clients.
              <span className="block text-[11px] text-[#8C7A6B] mt-0.5">
                (Section indépendante des Projets Clés en Main / Espaces d&apos;Exception • Photos uniquement).
              </span>
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-[#C8794D] hover:bg-[#B5673C] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>Nouvelle Livraison</span>
          </button>
        </div>
      </div>

      {/* ─── Deliveries Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#64748B]">
            <div className="size-10 animate-spin rounded-full border-2 border-[#C8960C] border-t-transparent mx-auto mb-3" />
            <p className="text-xs font-mono tracking-wider uppercase">Chargement des livraisons...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-16 text-center text-[#64748B] bg-[#FAF8F5]">
            <Truck className="size-10 text-[#C8960C]/60 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0F172A]">Aucune livraison enregistrée</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Ajoutez les premières photos des pièces d&apos;artisanat livrées pour les afficher en vitrine d&apos;accueil.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#C8960C]/40 text-[#996515] text-xs font-bold hover:bg-white transition-all cursor-pointer"
            >
              <Plus className="size-3.5" /> Créer une première fiche
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8DFD4] text-[11px] uppercase tracking-wider text-[#475569]">
                  <th className="p-4 pl-6 font-bold w-28">Photos</th>
                  <th className="p-4 font-bold">Titre &amp; Détails de l&apos;installation</th>
                  <th className="p-4 font-bold w-40">Date de livraison</th>
                  <th className="p-4 pr-6 font-bold text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4]/60 text-xs">
                {deliveries.map(d => (
                  <DeliveryRow
                    key={d.id}
                    delivery={d}
                    onEdit={() => handleOpenEdit(d)}
                    onDelete={() => handleDelete(d.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal ────────────────────────────────────────────────────────── */}
      <DeliveryModal
        open={modalOpen}
        form={form}
        onClose={() => setModalOpen(false)}
        onSaved={loadDeliveries}
      />

    </div>
  )
}

// ─── SUB-COMPONENT: DELIVERY ROW ────────────────────────────────────────────
const DeliveryRow = memo(function DeliveryRow({
  delivery,
  onEdit,
  onDelete
}: {
  delivery: Delivery
  onEdit: () => void
  onDelete: () => void
}) {
  const images = parseDeliveryImages(delivery.imageUrl)
  const coverImage = images[0] || '/images/bg-weekly-delivery-2.jpg'
  const total = images.length

  return (
    <tr className="hover:bg-[#FAF8F5]/80 transition-colors group">
      <td className="p-4 pl-6">
        <div className="relative size-16 rounded-xl overflow-hidden bg-[#241812] border border-[#E8DFD4] shadow-2xs shrink-0 group-hover:border-[#C8794D] transition-colors">
          <img 
            src={formatImageUrl(coverImage, '/images/bg-weekly-delivery-2.jpg')} 
            alt={delivery.title} 
            className="size-full object-cover" 
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/bg-weekly-delivery-2.jpg' }}
          />
          {total > 1 && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-md border border-white/20">
              +{total - 1}
            </span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-[#0F172A] leading-tight group-hover:text-[#C17D59] transition-colors">
            {delivery.title}
          </h3>
          {total > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#8C7A6B] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E2DBD0]">
              <ImageIcon className="size-2.5 text-[#C8960C]" /> {total} {total > 1 ? 'photos' : 'photo'}
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748B] mt-1 line-clamp-2 max-w-xl font-normal leading-relaxed">
          {delivery.description || 'Installation de mobilier artisanal d’art.'}
        </p>
      </td>

      <td className="p-4 text-[#475569] font-mono text-xs whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-[#C8960C]" />
          <span>{new Date(delivery.deliveryDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </td>

      <td className="p-4 pr-6 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            title="Modifier"
          >
            <Edit2 className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  )
})

// ─── SUB-COMPONENT: DELIVERY MODAL ──────────────────────────────────────────
function DeliveryModal({
  open,
  form: initialForm,
  onClose,
  onSaved
}: {
  open: boolean
  form: DeliveryForm
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<DeliveryForm>(initialForm)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm(initialForm)
    setError(null)
  }, [initialForm])

  if (!open) return null

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          throw new Error(`"${file.name}" n'est pas une image. Seules les photos sont autorisées.`)
        }
        setUploadProgress(`Téléversement ${i + 1}/${files.length}...`)
        const res = await adminApi.uploadImage(file)
        if (res?.url) newUrls.push(res.url)
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...newUrls] }))
    } catch (err: any) {
      setError(err.message || "Erreur de téléversement.")
    } finally {
      setUploading(false)
      setUploadProgress('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSetCover = (idx: number) => {
    setForm(prev => ({
      ...prev,
      images: [prev.images[idx], ...prev.images.filter((_, i) => i !== idx)]
    }))
  }

  const handleRemoveImage = (idx: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError("Titre requis."); return; }
    if (!form.deliveryDate) { setError("Date requise."); return; }
    if (form.images.length === 0) { setError("Veuillez ajouter au moins une photo."); return; }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.images.join(','),
        deliveryDate: form.deliveryDate
      }
      if (form.id) await adminApi.updateDelivery(form.id, payload)
      else await adminApi.createDelivery(payload)
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1E1712] border border-[#3A2E24] text-[#F5F0E8] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#3A2E24] bg-[#16120E]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#C8794D] tracking-wider">
              {form.id ? 'Édition de Livraison' : 'Nouvelle Fiche de Livraison'}
            </span>
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Truck className="size-4 text-[#F2BD52]" />
              {form.id ? form.title : 'Ajouter une livraison chez un client'}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs">{error}</div>}

          <form id="delivery-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Gallery Upload */}
            <div className="bg-[#15120F] p-4 rounded-2xl border border-[#3A2E24] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#F2BD52] tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="size-3.5" /> Photos ({form.images.length})
                  </h3>
                  <p className="text-[11px] text-[#D9C8AE]/70">
                    Ajoutez une ou plusieurs photos. La 1ère sera la couverture.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8794D] hover:bg-[#B5673C] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Upload className="size-3.5" />
                  <span>Ajouter</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUploadImages} className="hidden" />
              </div>

              {uploading && (
                <div className="p-2.5 bg-[#211A15] border border-[#C8794D]/40 rounded-xl text-[#F2BD52] flex items-center gap-2">
                  <div className="size-3.5 animate-spin rounded-full border-2 border-[#F2BD52] border-t-transparent" />
                  <span>{uploadProgress || 'Envoi en cours...'}</span>
                </div>
              )}

              {form.images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-7 border-2 border-dashed border-[#3A2E24] hover:border-[#C8794D]/60 rounded-xl text-center cursor-pointer transition-colors bg-[#1A1410]"
                >
                  <ImageIcon className="size-7 mx-auto text-[#D9C8AE]/40 mb-1.5" />
                  <p className="text-xs text-[#F5F0E8] font-semibold">Sélectionnez une ou plusieurs photos</p>
                  <p className="text-[10px] text-[#D9C8AE]/60 mt-0.5">Formats acceptés : JPG, PNG, WEBP (Photos uniquement)</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#241812] border border-[#3A2E24] group shadow-xs">
                      <img src={formatImageUrl(img)} alt="" className="size-full object-cover" />
                      {idx === 0 ? (
                        <div className="absolute top-1.5 left-1.5 bg-[#C8794D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Star className="size-2.5 fill-current" /> Couverture
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-black/80 hover:bg-[#C8794D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                        >
                          En 1er
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Titre de la livraison *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Livraison d'une table basse sculptée à La Marsa"
                    className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0E8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={e => setForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3 py-2.5 text-xs text-[#F5F0E8] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Description &amp; Détails</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objet livré, l'essence de bois, l'intégration chez le client..."
                  className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl p-3 text-xs text-[#F5F0E8] outline-none leading-relaxed"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-[#3A2E24] bg-[#16120E] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || uploading}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#D9C8AE] font-semibold cursor-pointer"
          >
            Annuler
          </button>
          <button
            form="delivery-form"
            type="submit"
            disabled={saving || uploading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C8794D] to-[#B89555] text-white font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Créer la livraison'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
