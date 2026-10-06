'use client'

import { useState } from 'react'
import { X, RefreshCw, Video, Film } from 'lucide-react'
import { adminApi, Project } from '@/lib/api'
import { MultiImageUploader } from '@/app/admin/components/image-uploader'

interface ProjectModalProps {
  project: Project | null
  initialPhotos: string[]
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({
  project,
  initialPhotos,
  onClose,
  onSaved
}: ProjectModalProps) {
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'hotel',
    location: project?.location || '',
    details: project?.details || 'Portes monumentales, Boiseries d\'art',
    imageUrl: initialPhotos[0] || project?.imageUrl || '',
    videoUrl: project?.videoUrl || (project as any)?.video || '',
    gallery: initialPhotos
  })

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const MAX_VIDEO_SIZE = 300 * 1024 * 1024

    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      alert(`⚠️ Vidéo trop volumineuse (${sizeMb} Mo). La taille maximale est de 300 Mo.`)
      e.target.value = ''
      return
    }

    try {
      setUploadingVideo(true)
      const res = await adminApi.uploadVideo(file)
      setFormData(prev => ({ ...prev, videoUrl: res.url }))
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléchargement de la vidéo.')
    } finally {
      setUploadingVideo(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim()) {
      alert('Veuillez saisir un titre pour le projet.')
      return
    }

    const primaryImg = galleryUrls[0] || formData.imageUrl || ''
    const cleanPayload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      category: formData.category || 'hotel',
      location: formData.location?.trim() || '',
      details: formData.details?.trim() || '',
      imageUrl: galleryUrls.length > 0 ? galleryUrls.join(',') : primaryImg,
      videoUrl: formData.videoUrl?.trim() || ''
    }

    try {
      if (project) {
        await adminApi.updateProject(project.id, cleanPayload)
        try {
          localStorage.setItem(`project_gallery_${project.id}`, JSON.stringify(galleryUrls))
        } catch (_) {}
      } else {
        const created = await adminApi.createProject(cleanPayload)
        if (created?.id) {
          try {
            localStorage.setItem(`project_gallery_${created.id}`, JSON.stringify(galleryUrls))
          } catch (_) {}
        }
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement du projet.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD4] rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="border-b border-[#E8DFD4] pb-3">
          <h3 className="font-heading text-2xl text-[#0F172A] font-bold">
            {project ? 'Modifier le Projet' : 'Nouveau Projet d\'Exception'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Titre du Projet *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Hôtel Dar El Jeld"
              className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Type d&apos;Établissement *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs cursor-pointer"
              >
                <option value="immobilier">Projets Immobiliers</option>
                <option value="hotel">Hôtels &amp; Palaces</option>
                <option value="guesthouse">Maisons d&apos;Hôtes</option>
                <option value="villa">Villas &amp; Résidences Privées</option>
                <option value="pro_commercial">Espaces Professionnels &amp; Commerciaux</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Localisation *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Médina de Tunis"
                className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Détails &amp; Tags</label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Portes monumentales, Boiseries d'art, Salons"
              className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
            />
          </div>

          {/* Galerie Photos */}
          <div className="rounded-xl border border-[#E8DFD4] bg-[#FAF8F5] p-4">
            <MultiImageUploader
              label="Photos du projet (La 1ère image sera la couverture principale)"
              imageUrls={galleryUrls}
              onAdd={(url) => {
                setGalleryUrls(prev => [...prev, url])
                if (!formData.imageUrl) {
                  setFormData(prev => ({ ...prev, imageUrl: url }))
                }
              }}
              onRemove={(idx) => {
                setGalleryUrls(prev => {
                  const next = prev.filter((_, i) => i !== idx)
                  setFormData(f => ({ ...f, imageUrl: next[0] || '' }))
                  return next
                })
              }}
              uploading={uploading}
              setUploading={setUploading}
              uploadFn={adminApi.uploadImage}
            />
          </div>

          {/* Vidéo du projet */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                <Film className="size-3.5" /> Vidéo du projet (Atelier / Visite 3D / Chantier)
              </label>
              {formData.videoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrl: '' })}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Supprimer la vidéo
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="Ex: /Video.mp4 ou importer..."
                className="flex-1 rounded-lg border border-amber-200 bg-white px-4 py-2 text-xs outline-none focus:border-amber-500 text-[#0F172A] font-mono"
              />
              <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                uploadingVideo 
                  ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs'
              }`}>
                {uploadingVideo ? <RefreshCw className="size-3.5 animate-spin" /> : <Video className="size-3.5" />}
                {uploadingVideo ? 'Envoi...' : 'Importer'}
                <input 
                  type="file" 
                  accept="video/mp4,video/webm,video/quicktime" 
                  className="hidden" 
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                />
              </label>
            </div>

            {formData.videoUrl && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-amber-300 bg-black mt-2">
                <video src={formData.videoUrl} controls className="w-full h-full object-contain" />
              </div>
            )}
            <p className="text-[10px] text-amber-800/70">MP4, WEBM, MOV (Taille max : 300 Mo)</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Description du Projet</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez l'intervention de l'atelier..."
              className="resize-none rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2 outline-none focus:border-[#C8960C] text-xs text-[#0F172A]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all mt-2 shadow-md cursor-pointer"
          >
            {project ? 'Enregistrer les modifications' : 'Créer le projet'}
          </button>
        </form>
      </div>
    </div>
  )
}
