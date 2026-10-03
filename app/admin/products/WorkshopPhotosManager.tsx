'use client'

import { useState } from 'react'
import { Plus, Trash2, Camera, CheckCircle2, Upload } from 'lucide-react'
import { ImageVariant } from '@/lib/api'

interface WorkshopPhotosManagerProps {
  variants: ImageVariant[]
  onChange: (variants: ImageVariant[]) => void
  uploadFn: (file: File) => Promise<{ url: string }>
}

const ANGLE_SUGGESTIONS = [
  'Vue de profil',
  'Vue 3/4',
  'Intérieur',
  'Détail sculpture',
  'Vue arrière',
  'Zoom bois'
]

export default function WorkshopPhotosManager({
  variants,
  onChange,
  uploadFn,
}: WorkshopPhotosManagerProps) {
  const [uploading, setUploading] = useState<number | null>(null)

  const addPhoto = () => {
    onChange([...variants, { imageUrl: '', colorLabel: null }])
  }

  const removePhoto = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx))
  }

  const updateUrl = (idx: number, url: string) => {
    const next = [...variants]
    next[idx] = { ...next[idx], imageUrl: url }
    onChange(next)
  }

  const updateAngleLabel = (idx: number, label: string) => {
    const next = [...variants]
    next[idx] = {
      ...next[idx],
      colorLabel: label.trim() === '' ? (idx === 0 ? 'Original' : null) : label,
    }
    onChange(next)
  }

  const handleFileUpload = async (idx: number, file: File) => {
    setUploading(idx)
    try {
      const res = await uploadFn(file)
      if (res?.url) updateUrl(idx, res.url)
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'image.")
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD4] pb-3">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#C17D59] font-bold flex items-center gap-2">
            <Camera className="size-4 text-[#C17D59]" />
            Photos de la Pièce en Atelier (Face &amp; Autres Angles)
          </label>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Ajoutez la photo de face principale ainsi que les photos des autres faces ou détails.
          </p>
        </div>
        <button
          type="button"
          onClick={addPhoto}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-3.5" /> + Autre angle / face
        </button>
      </div>

      {variants.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
          Veuillez ajouter au moins une photo de face de la pièce.
        </div>
      )}

      <div className="space-y-3">
        {variants.map((v, idx) => {
          const isPrimary = idx === 0

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                isPrimary
                  ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200'
                  : 'border-[#E8DFD4] bg-white'
              }`}
            >
              {/* Photo header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPrimary ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="size-3.5" /> Photo Principale (Façade de face)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F172A] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8DFD4]">
                      📸 Angle / Face additionnelle #{idx + 1}
                    </span>
                  )}
                </div>

                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              {/* Angle Label (Optional descriptive tag) */}
              {!isPrimary && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                    Type de prise de vue :
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ANGLE_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => updateAngleLabel(idx, suggestion)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                          v.colorLabel === suggestion
                            ? 'bg-[#C17D59] text-white border-[#C17D59]'
                            : 'bg-[#FAF8F5] text-[#475569] border-[#E8DFD4] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ou écrivez un libellé (ex: Vue de profil, Détail céramique...)"
                    value={v.colorLabel && v.colorLabel !== 'Original' ? v.colorLabel : ''}
                    onChange={(e) => updateAngleLabel(idx, e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E2DBD0] focus:border-[#C8960C] focus:bg-white rounded-lg p-2 text-xs text-[#0F172A] outline-none mt-1"
                  />
                </div>
              )}

              {/* Image Input & Upload */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de l'image ou choisissez un fichier →"
                  value={v.imageUrl}
                  onChange={(e) => updateUrl(idx, e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-[#E2DBD0] focus:border-[#C8960C] focus:bg-white rounded-lg p-2.5 text-xs text-[#0F172A] outline-none"
                />
                <label className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E2DBD0] text-[#0F172A] px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-xs">
                  <Upload className="size-3.5 text-[#C17D59]" />
                  <span>{uploading === idx ? 'Envoi...' : 'Choisir photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading === idx}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Real-time Image Preview */}
              {v.imageUrl && (
                <div className="relative h-28 w-44 rounded-xl overflow-hidden bg-stone-100 border border-[#E8DFD4] shadow-xs">
                  <img
                    src={v.imageUrl}
                    alt=""
                    className="size-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {v.colorLabel && v.colorLabel !== 'Original' && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-semibold">
                      {v.colorLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
