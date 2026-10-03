'use client'

import { useState, useEffect } from 'react'
import { X, ArrowLeftRight, RefreshCw } from 'lucide-react'
import { adminApi, Relooking } from '@/lib/api'
import { ImageUploader } from '@/components/site/image-uploader'

interface RelookingModalProps {
  isOpen: boolean
  relooking: Relooking | null
  onClose: () => void
  onSaved: () => void
}

const CATEGORIES = [
  'Miroirs & Cadres',
  'Mobilier d’Art',
  'Portes & Sculptures',
  'Luminaires & Décoration',
  'Buffets & Commodes',
  'Autre Restauration',
]

export default function RelookingModal({
  isOpen,
  relooking,
  onClose,
  onSaved,
}: RelookingModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageAvantUrl, setImageAvantUrl] = useState('')
  const [imageApresUrl, setImageApresUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (relooking) {
      setTitle(relooking.title)
      setDescription(relooking.description)
      setCategory(relooking.category || '')
      setImageAvantUrl(relooking.imageAvantUrl || '')
      setImageApresUrl(relooking.imageApresUrl || '')
    } else {
      setTitle('')
      setDescription('')
      setCategory('Mobilier d’Art')
      setImageAvantUrl('')
      setImageApresUrl('')
    }
  }, [relooking, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !category || !imageAvantUrl || !imageApresUrl) {
      alert("Tous les champs sont requis, y compris les deux photos (Avant et Après).")
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      imageAvantUrl: imageAvantUrl.trim(),
      imageApresUrl: imageApresUrl.trim(),
    }

    try {
      setSaving(true)
      if (relooking) {
        await adminApi.updateRelooking(relooking.id, payload)
      } else {
        await adminApi.createRelooking(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'enregistrement de la restauration.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm">
      <div className="bg-white border border-[#E8DFD4] w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-left text-[#0F172A]">
        {/* Header */}
        <header className="p-6 border-b border-[#E8DFD4] flex justify-between items-center bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
              <ArrowLeftRight className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#0F172A]">
                {relooking ? 'Modifier la Restauration' : 'Nouvelle Restauration (Avant / Après)'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Mettez en valeur les transformations et le travail de l&apos;ébénisterie d&apos;art.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-[#EFECE6] hover:bg-[#E2DBD0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
              Titre de la restauration *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Restauration d'une commode d'époque en noyer massif"
              className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
              Catégorie de la pièce *
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors cursor-pointer"
            >
              <option value="" disabled>Sélectionnez une catégorie...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
              Description des interventions réalisées *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de l'ébénisterie, décapage, consolidation, dorure, sculpture refaite..."
              className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Photos Avant / Après */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Avant */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD4] space-y-2">
              <span className="inline-block bg-stone-700 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                État d&apos;origine
              </span>
              <ImageUploader
                label="Photo AVANT (Avant restauration)"
                imageUrl={imageAvantUrl}
                onUploaded={setImageAvantUrl}
                onRemove={() => setImageAvantUrl('')}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadImage}
              />
            </div>

            {/* Après */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD4] space-y-2">
              <span className="inline-block bg-[#C17D59] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Restauration terminée
              </span>
              <ImageUploader
                label="Photo APRÈS (Pièce sublimée)"
                imageUrl={imageApresUrl}
                onUploaded={setImageApresUrl}
                onRemove={() => setImageApresUrl('')}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadImage}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DFD4]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#D9D2C7] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#475569] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#C8960C] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="size-3.5 animate-spin" />}
              <span>{relooking ? 'Mettre à jour' : 'Enregistrer la restauration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
