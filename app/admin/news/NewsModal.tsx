'use client'

import { useState, useEffect } from 'react'
import { X, Newspaper, RefreshCw } from 'lucide-react'
import { adminApi, News } from '@/lib/api'
import { ImageUploader } from '@/app/admin/components/image-uploader'

interface NewsModalProps {
  isOpen: boolean
  newsItem: News | null
  onClose: () => void
  onSaved: () => void
}

export default function NewsModal({
  isOpen,
  newsItem,
  onClose,
  onSaved,
}: NewsModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (newsItem) {
      setTitle(newsItem.title)
      setContent(newsItem.content)
      setImageUrl(newsItem.imageUrl || '')
    } else {
      setTitle('')
      setContent('')
      setImageUrl('')
    }
  }, [newsItem, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Veuillez saisir un titre pour l’actualité.')
      return
    }
    if (!content.trim()) {
      alert('Veuillez rédiger le contenu de l’article.')
      return
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || '/placeholder.jpg',
    }

    try {
      setSaving(true)
      if (newsItem) {
        await adminApi.updateNews(newsItem.id, payload)
      } else {
        await adminApi.createNews(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement de l’actualité.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border border-[#E8DFD4] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left text-[#0F172A]">
        {/* Header */}
        <div className="p-6 border-b border-[#E8DFD4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
              <Newspaper className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#0F172A]">
                {newsItem ? 'Modifier l’actualité' : 'Publier une actualité'}
              </h2>
              <p className="text-xs text-[#64748B]">
                {newsItem ? 'Mettez à jour les informations de cet article.' : 'Partagez une nouvelle avec les visiteurs de l’atelier.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-[#EFECE6] hover:bg-[#E2DBD0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Titre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
              Titre de l’actualité *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Exposition Artisanale de Paris 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
            />
          </div>

          {/* Image */}
          <div className="rounded-xl border border-[#E8DFD4] bg-[#FAF8F5] p-4">
            <ImageUploader
              label="Photo d’illustration"
              imageUrl={imageUrl}
              onUploaded={(url) => setImageUrl(url)}
              onRemove={() => setImageUrl('')}
              uploading={uploading}
              setUploading={setUploading}
              uploadFn={adminApi.uploadImage}
            />
          </div>

          {/* Contenu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
              Texte de l’article *
            </label>
            <textarea
              required
              rows={7}
              placeholder="Rédigez les détails de l'annonce, l'histoire ou l'événement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-3 text-xs text-[#0F172A] leading-relaxed outline-none focus:border-[#C8960C] transition-colors"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#E8DFD4] flex items-center justify-end gap-3">
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
              <span>{newsItem ? 'Mettre à jour' : 'Publier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
