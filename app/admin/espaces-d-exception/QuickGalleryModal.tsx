'use client'

import { useState } from 'react'
import { Upload, X, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { adminApi, Project } from '@/lib/api'

interface QuickGalleryModalProps {
  project: Project
  initialPhotos: string[]
  onClose: () => void
  onPhotosUpdated: (projectId: number, newPhotos: string[]) => void
}

export default function QuickGalleryModal({
  project,
  initialPhotos,
  onClose,
  onPhotosUpdated
}: QuickGalleryModalProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const syncGallery = async (updatedList: string[]) => {
    setPhotos(updatedList)
    const primaryImg = updatedList[0] || '/project-hotel.png'
    const payload = {
      title: project.title,
      description: project.description || '',
      category: project.category || 'hotel',
      location: project.location || '',
      details: project.details || '',
      imageUrl: updatedList.length > 0 ? updatedList.join(',') : primaryImg,
      videoUrl: project.videoUrl || ''
    }

    try {
      await adminApi.updateProject(project.id, payload)
      try {
        localStorage.setItem(`project_gallery_${project.id}`, JSON.stringify(updatedList))
      } catch (_) {}
      onPhotosUpdated(project.id, updatedList)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour de la galerie.')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Envoi photo ${i + 1}/${files.length}...`)
        const res = await adminApi.uploadImage(files[i])
        if (res?.url) newUrls.push(res.url)
      }
      if (newUrls.length > 0) {
        await syncGallery([...photos, ...newUrls])
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi des photos.")
    } finally {
      setUploading(false)
      setUploadProgress('')
      e.target.value = ''
    }
  }

  const handleSetCover = (idx: number) => {
    const selected = photos[idx]
    syncGallery([selected, ...photos.filter((_, i) => i !== idx)])
  }

  const handleRemove = (idx: number) => {
    if (!confirm('Supprimer cette photo de la galerie ?')) return
    syncGallery(photos.filter((_, i) => i !== idx))
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white border border-[#E8DFD4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DFD4] flex items-start justify-between gap-4 bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C17D59] bg-[#FAF0E6] px-2.5 py-1 rounded-full border border-[#E8DFD4]">
              {project.category}
            </span>
            <h2 className="font-heading text-xl sm:text-2xl text-[#0F172A] font-bold mt-2">
              Galerie Photos — {project.title}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Sélectionnez et importez plusieurs photos à la fois pour ce projet clé en main.
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 sm:size-9 rounded-full bg-[#EFECE6] hover:bg-[#E2DBD0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin bg-white">
          <label className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-[#D9D2C7] hover:border-[#C8960C] bg-[#FAF8F5] hover:bg-white rounded-2xl cursor-pointer transition-all group text-center">
            <div className="size-12 sm:size-14 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59] mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Upload className="size-6" />
            </div>
            <span className="text-sm sm:text-base font-bold text-[#0F172A]">
              + Cliquez pour ajouter plusieurs photos à la fois
            </span>
            <span className="text-xs text-[#64748B] mt-1">
              Sélection multiple activée : JPG, PNG, WEBP
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-3 animate-pulse">
              <RefreshCw className="size-4 animate-spin shrink-0 text-amber-600" />
              <span>{uploadProgress || 'Téléchargement en cours...'}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#0F172A] flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-[#C17D59]" />
                <span>Photos ({photos.length})</span>
              </h3>
              <span className="text-[11px] text-[#64748B]">Photo n°1 = Couverture</span>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#E8DFD4] rounded-xl text-xs text-[#94A3B8]">
                Aucune photo dans la galerie. Importez vos photos ci-dessus.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 bg-stone-100 group transition-all shadow-xs ${
                      idx === 0 ? 'border-[#C17D59] ring-2 ring-[#C17D59]/30' : 'border-[#E8DFD4] hover:border-[#C8960C]'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="size-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/project-hotel.png' }}
                    />

                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                      {idx === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#C17D59] text-white text-[9px] font-bold uppercase tracking-wider shadow">
                          Couverture
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="px-2 py-0.5 rounded bg-black/75 hover:bg-[#C17D59] text-white text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow cursor-pointer"
                        >
                          En couverture
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="size-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>

                    <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono z-10">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8DFD4] flex items-center justify-between bg-[#FAF8F5]">
          <span className="text-xs text-[#64748B] font-medium">
            {photos.length} photo{photos.length > 1 ? 's' : ''} au total
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  )
}
