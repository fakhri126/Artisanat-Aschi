'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Film,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Hammer,
  Ruler,
  Truck,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import { formatImageUrl } from '@/lib/utils'

interface ProjectDetailsModalProps {
  project: any | null
  onClose: () => void
  onOpenLightbox: (data: { images: string[]; currentIndex: number; title: string }) => void
  onSelectSimilarQuote: () => void
  filterTypes: { id: string; label: string }[]
}

export default function ProjectDetailsModal({
  project,
  onClose,
  onOpenLightbox,
  onSelectSimilarQuote,
  filterTypes,
}: ProjectDetailsModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isModalMuted, setIsModalMuted] = useState(true)
  const hasVid = Boolean(project?.video || project?.videoUrl)
  const [modalActiveView, setModalActiveView] = useState<'video' | number>(hasVid ? 'video' : 0)
  const [isVideoBuffering, setIsVideoBuffering] = useState(false)

  // Réinitialiser la vue lors du changement de projet
  useEffect(() => {
    setModalActiveView(hasVid ? 'video' : 0)
    setIsVideoBuffering(false)
  }, [project?.id, hasVid])

  if (!project) return null

  const toggleModalMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isModalMuted
    setIsModalMuted(!isModalMuted)
  }

  const categoryLabel = filterTypes.find(t => t.id === project.type)?.label || project.category || project.type || 'Espace d\'Exception'

  // Résolution vidéo propre
  const rawVideoUrl = (() => {
    const v = (project.video || project.videoUrl || '').trim()
    if (!v) return ''
    const match = v.match(/\/media\/([^/?#]+\.mp4)/i)
    if (match && match[1]) {
      return `/uploads/${match[1]}`
    }
    return v
  })()

  // Extraire et dédoublonner les photos (exclure vidéos)
  const galleryPhotos: string[] = (() => {
    let list: string[] = []
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      list = project.gallery
    } else if (typeof project.gallery === 'string' && project.gallery.trim()) {
      list = project.gallery.split(',').map((s: string) => s.trim()).filter(Boolean)
    } else if (project.image) {
      list = project.image.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    const cleanList = list.flatMap((s: string) => s.split(',').map((x: string) => x.trim())).filter(Boolean)
    const photosOnly = cleanList.filter((s: string) => !/\.(mp4|webm|ogg|mov)$/i.test(s.split('?')[0].split('#')[0]))
    return photosOnly.length > 0 ? photosOnly : ['/project-hotel.png']
  })()

  const posterUrl = galleryPhotos[0] || (project.image ? project.image.split(',')[0]?.trim() : '') || '/project-hotel.png'
  const activePhotoIndex = typeof modalActiveView === 'number' ? modalActiveView : 0
  const activePhotoSrc = formatImageUrl(galleryPhotos[activePhotoIndex] || galleryPhotos[0], '/project-hotel.png')

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextIdx = activePhotoIndex === 0 ? galleryPhotos.length - 1 : activePhotoIndex - 1
    setModalActiveView(nextIdx)
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextIdx = activePhotoIndex === galleryPhotos.length - 1 ? 0 : activePhotoIndex + 1
    setModalActiveView(nextIdx)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1550px] bg-gradient-to-br from-[#352217] via-[#2A1A11] to-[#1C110B] border-2 border-[#E6A635]/50 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] flex flex-col lg:flex-row max-h-[94vh] lg:h-[90vh] overflow-y-auto lg:overflow-hidden scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton Fermer flottant en haut à droite */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 size-8 sm:size-9 rounded-full bg-[#1A110B]/95 border border-[#E6A635]/50 text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors flex items-center justify-center cursor-pointer shadow-xl backdrop-blur-md"
            aria-label="Fermer la vue"
          >
            <X className="size-4 sm:size-5" />
          </button>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION MÉDIA (GAUCHE SUR DESKTOP / HAUT SUR MOBILE)            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[64%] xl:w-[67%] flex flex-col shrink-0 lg:shrink border-b lg:border-b-0 lg:border-r border-[#E6A635]/25 p-3.5 sm:p-5 lg:p-6 gap-3 sm:gap-4 bg-[#140C07]/85 min-h-0">
            
            {/* Barre supérieure : Badges du média et contrôles */}
            <div className="flex items-center justify-between pr-10 sm:pr-12 lg:pr-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="size-2.5" />
                  <span>{categoryLabel}</span>
                </span>

                {modalActiveView === 'video' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#241812] border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-xs font-bold uppercase tracking-wider">
                    <Film className="size-3 text-[#E6A635]" />
                    <span>Vidéo du Projet</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#241812] border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-xs font-bold uppercase tracking-wider">
                    <ImageIcon className="size-3 text-[#E6A635]" />
                    <span>Photo {activePhotoIndex + 1} / {galleryPhotos.length}</span>
                  </span>
                )}
              </div>

              {/* Contrôle son ou zoom */}
              <div className="flex items-center gap-1.5">
                {modalActiveView === 'video' ? (
                  <button
                    type="button"
                    onClick={toggleModalMute}
                    className="size-7 sm:size-8 rounded-full bg-[#241812]/95 border border-[#E6A635]/40 text-[#F2BD52] flex items-center justify-center hover:bg-[#E6A635] hover:text-[#1A110B] transition-colors shadow-sm cursor-pointer"
                    title={isModalMuted ? "Activer le son" : "Couper le son"}
                  >
                    {isModalMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenLightbox({
                      images: galleryPhotos,
                      currentIndex: activePhotoIndex,
                      title: project.title
                    })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#241812]/95 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-semibold hover:bg-[#E6A635] hover:text-[#1A110B] transition-colors cursor-pointer shadow-sm"
                  >
                    <ZoomIn className="size-3" />
                    <span className="hidden sm:inline">Agrandir</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative w-full aspect-video min-h-[220px] sm:min-h-[320px] lg:min-h-[440px] xl:min-h-[500px] lg:flex-1 rounded-xl sm:rounded-2xl overflow-hidden border border-[#E6A635]/45 bg-[#0D0805] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group/media shrink-0">
              {modalActiveView === 'video' && hasVid ? (
                <>
                  <video
                    ref={videoRef}
                    key={rawVideoUrl}
                    src={rawVideoUrl}
                    poster={posterUrl}
                    muted={isModalMuted}
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                    onWaiting={() => setIsVideoBuffering(true)}
                    onPlaying={() => setIsVideoBuffering(false)}
                    onPlay={() => setIsVideoBuffering(false)}
                    onTimeUpdate={() => setIsVideoBuffering(false)}
                    onCanPlay={() => setIsVideoBuffering(false)}
                    onLoadedData={() => setIsVideoBuffering(false)}
                  />

                  {isVideoBuffering && (
                    <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                      <div className="size-10 rounded-full border-2 border-[#E6A635]/30 border-t-[#E6A635] animate-spin shadow-[0_0_15px_rgba(230,166,53,0.4)]" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Badge HD */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/50 text-[#F2BD52] text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md pointer-events-none">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Vidéo HD</span>
                  </div>

                  {/* Contrôle du Son en bas à droite */}
                  <div className="absolute bottom-3 right-3 z-20">
                    <button
                      type="button"
                      onClick={toggleModalMute}
                      className="size-8 rounded-full bg-[#1A110B]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/40 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md"
                      title={isModalMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isModalMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={activePhotoSrc}
                    alt={project.title}
                    fill
                    unoptimized
                    className="object-contain sm:object-cover transition-transform duration-700 ease-out group-hover/media:scale-105 cursor-zoom-in"
                    onClick={() => onOpenLightbox({
                      images: galleryPhotos,
                      currentIndex: activePhotoIndex,
                      title: project.title
                    })}
                    onError={(e) => {
                      const filename = activePhotoSrc.split('/').pop()?.split('#')[0]
                      if (filename && activePhotoSrc.startsWith('http')) {
                        e.currentTarget.src = `/uploads/${filename}`
                      } else {
                        e.currentTarget.src = '/placeholder.jpg'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Flèches de navigation photo */}
                  {galleryPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/85 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer shadow-md"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/85 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer shadow-md"
                        aria-label="Image suivante"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── RUBAN DE MINIATURES INTERACTIF (VIDÉO + PHOTOS) ── */}
            <div className="w-full shrink-0 pt-1 pb-0.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#F2BD52] font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-2.5 text-[#E6A635]" />
                  <span>Sélectionnez un aperçu :</span>
                </span>
                <span className="text-white/50 text-[10px] sm:text-xs font-normal">
                  {(hasVid ? 1 : 0) + galleryPhotos.length} médias disponibles
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin items-center">
                {/* Miniature Vidéo si disponible */}
                {hasVid && (() => {
                  const thumbPoster = galleryPhotos[0] || posterUrl
                  const isActive = modalActiveView === 'video'
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setModalActiveView('video')
                        setIsVideoBuffering(false)
                      }}
                      className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer flex flex-col items-center justify-center bg-black group/vidthumb ${
                        isActive
                          ? 'border-[#E6A635] shadow-[0_0_14px_rgba(230,166,53,0.55)] scale-[0.98] ring-1 ring-[#E6A635]'
                          : 'border-[#E6A635]/25 opacity-70 hover:opacity-100 hover:border-[#E6A635]/60'
                      }`}
                    >
                      <Image
                        src={thumbPoster}
                        alt="Aperçu vidéo"
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover/vidthumb:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E6A635] text-[#1A110B] text-[8.5px] font-extrabold uppercase shadow-sm">
                          <Film className="size-2.5 fill-current" /> Vidéo
                        </span>
                      </div>
                    </button>
                  )
                })()}

                {/* Miniatures des Photos */}
                {galleryPhotos.map((img: string, idx: number) => {
                  const thumbUrl = formatImageUrl(img, '/placeholder.jpg')
                  const isActive = modalActiveView === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalActiveView(idx)}
                      className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] shadow-[0_0_14px_rgba(230,166,53,0.55)] scale-[0.98] ring-1 ring-[#E6A635]'
                          : 'border-[#E6A635]/25 opacity-70 hover:opacity-100 hover:border-[#E6A635]/60'
                      }`}
                    >
                      <Image
                        src={thumbUrl}
                        alt={`Miniature ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          const filename = thumbUrl.split('/').pop()?.split('#')[0]
                          if (filename && thumbUrl.startsWith('http')) {
                            e.currentTarget.src = `/uploads/${filename}`
                          } else {
                            e.currentTarget.src = '/placeholder.jpg'
                          }
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[8.5px] text-white/95 font-semibold">
                        {idx + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION DÉTAILS (DROITE SUR DESKTOP / SUITE SUR MOBILE)         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[36%] xl:w-[33%] flex flex-col justify-between p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 text-left lg:overflow-y-auto scrollbar-thin bg-gradient-to-b from-[#241812]/50 to-[#1A110B]/85">
            
            {/* En-tête du projet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full font-bold shadow-sm">
                  <Sparkles className="size-2.5" />
                  {categoryLabel}
                </span>
                {project.location && (
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#F2BD52] font-medium">
                    <MapPin className="size-3 text-[#E6A635]" />
                    <span>{project.location}</span>
                  </div>
                )}
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl lg:text-3xl text-gold-gradient font-light leading-snug drop-shadow-sm pt-1">
                {project.title}
              </h3>

              {project.description ? (
                <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed">
                  {project.description}
                </p>
              ) : (
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Conception intégrale et aménagements artisanaux d&apos;exception réalisés par l&apos;Atelier Aschi.
                </p>
              )}
            </div>

            {/* Spécifications Haute Couture (Grille 2x2) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 py-0.5">
              <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25 hover:border-[#E6A635]/50 transition-colors shadow-sm">
                <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold flex items-center gap-1.5">
                  <Hammer className="size-3 text-[#E6A635]" /> Aménagement
                </span>
                <span className="text-xs text-white font-medium block mt-1 truncate">
                  {categoryLabel || 'Sur-Mesure'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25 hover:border-[#E6A635]/50 transition-colors shadow-sm">
                <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3 text-[#E6A635]" /> Essences Nobles
                </span>
                <span className="text-xs text-white font-medium block mt-1 truncate">
                  {project.materials || "Noyer Massif & Bois d'Art"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25 hover:border-[#E6A635]/50 transition-colors shadow-sm">
                <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold flex items-center gap-1.5">
                  <Ruler className="size-3 text-[#E6A635]" /> Bureau d&apos;Étude
                </span>
                <span className="text-xs text-white font-medium block mt-1 truncate">
                  Plans 3D sous 48h
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25 hover:border-[#E6A635]/50 transition-colors shadow-sm">
                <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold flex items-center gap-1.5">
                  <Truck className="size-3 text-[#E6A635]" /> Exécution
                </span>
                <span className="text-xs text-white font-medium block mt-1 truncate">
                  Pose Clé en Main Tunisie
                </span>
              </div>
            </div>

            {/* Réalisations incluses */}
            {project.details && project.details.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] text-[#F2BD52]/90 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-[#E6A635]" /> Réalisations d&apos;art incluses
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.details.map((detail: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-[#241812] border border-[#E6A635]/30 px-2.5 py-1 rounded-lg text-[10px] sm:text-[10.5px] text-white/90 font-medium shadow-sm"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sceau d'authenticité Atelier Aschi */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#241812] via-[#2F1E14] to-[#241812] border border-[#E6A635]/35 flex items-center gap-3 shadow-inner">
              <div className="size-8 rounded-lg bg-[#E6A635]/15 border border-[#E6A635]/40 flex items-center justify-center shrink-0">
                <Sparkles className="size-4 text-[#F2BD52]" />
              </div>
              <p className="text-[10px] sm:text-[10.5px] text-white/85 font-light leading-snug">
                <strong className="text-[#F2BD52] font-semibold">Excellence Aschi :</strong> Façonnage artisanal dans notre atelier et pose millimétrique garantie.
              </p>
            </div>

            {/* Témoignage client si présent */}
            {project.review && (
              <div className="p-3 rounded-xl bg-[#241812]/80 border border-[#E6A635]/25 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1 text-[#F2BD52]">
                  {[...Array(project.review.rating || 5)].map((_, i) => (
                    <span key={i} className="text-xs">★</span>
                  ))}
                  <span className="text-[10px] text-white/70 ml-1.5 font-sans">
                    {project.review.author} • {project.review.role}
                  </span>
                </div>
                <p className="text-[10.5px] text-white/85 italic font-light leading-relaxed">
                  &ldquo;{project.review.comment}&rdquo;
                </p>
              </div>
            )}

            {/* Boutons d'Action (CTAs) */}
            <div className="pt-3 border-t border-[#E6A635]/25 space-y-2.5">
              <a
                href={`https://wa.me/21655743760?text=${encodeURIComponent(
                  `Bonjour Maison Aschi, j'ai vu votre réalisation "${project.title}" (${categoryLabel}) et je souhaite une étude d'aménagement similaire pour mon projet.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <MessageCircle className="size-4 fill-white/20" />
                <span>Demander une Étude sur WhatsApp</span>
              </a>

              <button
                onClick={onSelectSimilarQuote}
                className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Je veux un projet similaire</span>
                <ChevronRight className="size-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center rounded-full border border-[#E6A635]/40 bg-[#241812]/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 hover:bg-[#3B271C] hover:text-[#F2BD52] transition-colors cursor-pointer"
              >
                Fermer la vue détaillée
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
