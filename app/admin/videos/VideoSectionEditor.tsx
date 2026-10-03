'use client'

import { Video, Film, Upload, RefreshCw } from 'lucide-react'

interface VideoSectionEditorProps {
  title: string
  icon: any
  hasBadge?: boolean
  hasPoster?: boolean
  videoUrl: string
  badge?: string
  mainTitle: string
  subtitle: string
  description: string
  poster?: string
  uploading: boolean
  uploadingPoster?: boolean
  onVideoUpload: (file: File) => void
  onPosterUpload?: (file: File) => void
  onChangeField: (field: 'videoUrl' | 'badge' | 'title' | 'subtitle' | 'description' | 'poster', value: string) => void
  subtitleLabel?: string
  descriptionLabel?: string
  importButtonLabel?: string
  urlPlaceholder?: string
}

export default function VideoSectionEditor({
  title,
  icon: Icon,
  hasBadge = false,
  hasPoster = false,
  videoUrl,
  badge = '',
  mainTitle,
  subtitle,
  description,
  poster = '',
  uploading,
  uploadingPoster = false,
  onVideoUpload,
  onPosterUpload,
  onChangeField,
  subtitleLabel = 'Sous-Titre :',
  descriptionLabel = 'Description :',
  importButtonLabel = 'Importer un fichier vidéo MP4',
  urlPlaceholder = '/Video.mp4 ou https://...'
}: VideoSectionEditorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left text-[#0F172A]">
      {/* Colonne Gauche : Lecteur & Import Vidéo */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Icon className="size-4 text-[#C17D59]" />
            {title}
          </h3>

          {/* Lecteur Vidéo */}
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#E8DFD4] flex items-center justify-center shadow-inner">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <RefreshCw className="size-8 animate-spin text-[#C8960C]" />
                <span className="text-xs uppercase tracking-wider font-bold">
                  Importation de la vidéo en cours...
                </span>
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                poster={hasPoster ? poster : undefined}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="text-center p-4 text-white/50">
                <Film className="size-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Aucune vidéo sélectionnée</p>
              </div>
            )}
          </div>

          {/* Bouton d'upload et Champ URL */}
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#FAF8F5] border border-dashed border-[#C8960C]/60 hover:bg-[#FAF0E6] text-[#0F172A] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
              <Upload className="size-4 text-[#C8960C]" />
              <span>{importButtonLabel}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onVideoUpload(file)
                  e.target.value = ''
                }}
              />
            </label>

            <div>
              <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
                Ou URL directe du fichier vidéo (MP4) :
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => onChangeField('videoUrl', e.target.value)}
                placeholder={urlPlaceholder}
                className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] focus:bg-white transition-all font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Colonne Droite : Textes & Métadonnées */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-[#0F172A]">
            Textes de Présentation &amp; Diffusion
          </h3>

          {/* Badge optionnel */}
          {hasBadge && (
            <div>
              <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
                Badge Supérieur :
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => onChangeField('badge', e.target.value)}
                placeholder="Ex: Témoignage & Gestes d'Atelier"
                className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Titre Principal */}
          <div>
            <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
              Titre Principal :
            </label>
            <input
              type="text"
              value={mainTitle}
              onChange={(e) => onChangeField('title', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
            />
          </div>

          {/* Sous-Titre */}
          <div>
            <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
              {subtitleLabel}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onChangeField('subtitle', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
              {descriptionLabel}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => onChangeField('description', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] focus:bg-white transition-all leading-relaxed resize-none"
            />
          </div>

          {/* Image Poster optionnelle */}
          {hasPoster && onPosterUpload && (
            <div>
              <label className="text-[10.5px] uppercase font-bold text-[#64748B] block mb-1">
                Image Affiche / Couverture (Poster) :
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={poster}
                  onChange={(e) => onChangeField('poster', e.target.value)}
                  placeholder="/images/about-atelier-stand.jpg"
                  className="flex-1 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] outline-none font-mono"
                />
                <label className="px-4 py-2 bg-[#FAF0E6] hover:bg-[#FAF8F5] border border-[#E8DFD4] rounded-xl text-xs font-bold text-[#C17D59] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="size-3.5" />
                  <span>{uploadingPoster ? 'Envoi...' : 'Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPoster}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onPosterUpload(file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
