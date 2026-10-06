'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  MapPin,
  Film,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react'

interface TurnkeyProjectCardProps {
  project: any
  onOpen: (p: any) => void
  filterTypes: { id: string; label: string }[]
}

export default function TurnkeyProjectCard({
  project,
  onOpen,
  filterTypes,
}: TurnkeyProjectCardProps) {
  const hasVideo = Boolean(project.video || project.videoUrl)

  // Extraire toutes les photos de manière propre et dédoublonnée (exclure les vidéos)
  const allPhotos: string[] = useMemo(() => {
    let list: string[] = []
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      list = project.gallery
    } else if (typeof project.gallery === 'string' && project.gallery.trim()) {
      list = project.gallery.split(',').map((s: string) => s.trim()).filter(Boolean)
    } else if (project.image) {
      list = project.image.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    const cleaned = list.flatMap((s: string) => s.split(',').map((x: string) => x.trim())).filter(Boolean)
    // Ne garder STRICTEMENT que les images (exclure les fichiers vidéos)
    const photosOnly = cleaned.filter((s: string) => !/\.(mp4|webm|ogg|mov)$/i.test(s.split('?')[0].split('#')[0]))
    return photosOnly.length > 0 ? photosOnly : ['/placeholder.jpg']
  }, [project])

  const coverPhotoSrc = allPhotos[0] || '/placeholder.jpg'
  const [imgSrc, setImgSrc] = useState(coverPhotoSrc)

  useEffect(() => {
    setImgSrc(coverPhotoSrc)
  }, [coverPhotoSrc])

  const categoryLabel = filterTypes.find(t => t.id === project.type)?.label || project.type

  return (
    <div
      onClick={() => onOpen(project)}
      className="group relative flex flex-col h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#342318]/95 via-[#2A1C14]/95 to-[#1F140E]/98 border border-[#E6A635]/30 hover:border-[#E6A635]/80 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_22px_55px_rgba(230,166,53,0.25)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5"
    >
      {/* ── Cadre Couverture Photo (Exclusif Photo — Pas de vidéo sur l'extérieur) ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#160E0A] shrink-0 border-b border-[#E6A635]/20">
        <Image
          src={imgSrc}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => {
            const filename = coverPhotoSrc.split('/').pop()?.split('#')[0]
            if (filename && imgSrc.startsWith('http')) {
              // Repli transparent sur la copie locale ultra-rapide si le réseau Supabase traîne
              setImgSrc(`/uploads/${filename}`)
            } else if (imgSrc !== '/placeholder.jpg') {
              setImgSrc('/placeholder.jpg')
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F140E] via-[#1F140E]/20 to-transparent opacity-85 group-hover:opacity-50 transition-opacity" />

        {/* Badges Flottants Haut */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {project.location ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-semibold backdrop-blur-md shadow-md">
              <MapPin className="size-3 text-[#E6A635]" />
              <span>{project.location}</span>
            </div>
          ) : <div />}

          {/* Badge discret si vidéo disponible à l'intérieur */}
          {hasVideo && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/95 border border-[#E6A635]/50 text-[#F2BD52] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
              <Film className="size-3 text-[#E6A635]" />
              <span>Vidéo incluse</span>
            </div>
          )}
        </div>

        {/* Badge nombre de photos en bas à droite */}
        <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-white/20 text-white/90 text-[10px] font-medium backdrop-blur-md shadow-sm">
          <ImageIcon className="size-3 text-[#E6A635]" />
          <span>{allPhotos.length} photo{allPhotos.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Corps de la carte extérieure ── */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 text-left">
        <div>
          {/* Tag Catégorie */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#241812] border border-[#E6A635]/35 text-[#F2BD52] text-[9.5px] uppercase tracking-wider font-bold">
              <Sparkles className="size-2.5 text-[#E6A635]" />
              <span>{categoryLabel}</span>
            </span>
          </div>

          {/* Titre */}
          <h3 className="font-heading text-lg sm:text-xl text-white font-medium leading-snug group-hover:text-[#F2BD52] transition-colors mb-2 line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-white/80 text-xs sm:text-[13px] font-light leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Aménagements réalisés (Pills) */}
          {project.details && project.details.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {project.details.slice(0, 3).map((detail: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-[#241812]/90 border border-[#E6A635]/20 text-[10px] text-white/80 font-light truncate max-w-[200px]"
                >
                  {detail}
                </span>
              ))}
              {project.details.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-[#241812]/60 text-[10px] text-[#F2BD52] font-semibold">
                  +{project.details.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-[#E6A635]/20 flex items-center justify-between text-xs text-[#F2BD52] font-semibold mt-auto">
          <span className="inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Explorer le projet</span>
            <ArrowRight className="size-3.5" />
          </span>
          <span className="size-8 rounded-full bg-[#241812] border border-[#E6A635]/35 flex items-center justify-center text-[#F2BD52] group-hover:bg-[#E6A635] group-hover:text-[#1A110B] group-hover:scale-110 transition-all shadow-md">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  )
}
