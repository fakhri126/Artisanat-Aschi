'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  FileText,
  MapPin,
  MessageCircle,
  Hammer,
  Truck,
  Ruler,
  ZoomIn,
  Video,
  Film,
  Volume2,
  VolumeX,
  ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Reveal } from './reveal'
import { publicApi } from '@/lib/api'

export interface ProjectItem {
  id: number
  title: string
  category: string
  filterType: string
  imageUrl: string
  gallery: string[]
  span?: string
  description: string
  location?: string
  materials?: string
  year?: string
  videoUrl?: string
  video?: string
  details?: string
  detailsList?: string[]
}

export function normalizeCategory(cat?: string): string {
  if (!cat) return 'autre'
  const c = cat.toLowerCase()
  if (c.includes('hotel') || c.includes('palace') || c.includes('hôtel')) return 'hotel'
  if (c.includes('guest') || c.includes('hôte') || c.includes('riad') || c.includes('lodge')) return 'guesthouse'
  if (c.includes('villa') || c.includes('demeure') || c.includes('résidence privée') || c.includes('residence privee')) return 'villa'
  if (c.includes('immo') || c.includes('promoteur') || c.includes('résidence') || c.includes('batiment')) return 'immobilier'
  if (c.includes('pro') || c.includes('bureau') || c.includes('commercial') || c.includes('restaurant') || c.includes('lounge') || c.includes('showroom')) return 'pro_commercial'
  return 'autre'
}


const PROCESS_STEPS = [
  {
    step: '01',
    icon: Ruler,
    title: 'Étude & Plans Sur-Mesure',
    desc: 'Modélisation personnalisée sous 48h selon vos plans architecturaux.',
  },
  {
    step: '02',
    icon: Hammer,
    title: 'Façonnage en Atelier',
    desc: 'Noyer massif, dorure à la feuille & ferronnerie d\'art traditionnelle.',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Pose Clé en Main',
    desc: 'Équipe de maîtres artisans sur votre chantier, partout en Tunisie.',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  BENTO PROJECT CARD (1 Grande, 1 Moyenne, 2 Petites)                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function BentoProjectCard({
  project,
  index,
  onOpen,
}: {
  project: ProjectItem
  index: number
  onOpen: (p: ProjectItem) => void
}) {
  const isGrande = index === 0
  const isMoyenne = index === 3

  // Disposition Bento géométrique :
  // - Index 0 (Grande)  : 2 colonnes x 2 lignes sur lg, 2 colonnes x 2 lignes sur sm
  // - Index 1 (Petite)  : 1 colonne x 1 ligne
  // - Index 2 (Petite)  : 1 colonne x 1 ligne
  // - Index 3 (Moyenne) : 2 colonnes x 1 ligne
  const spanClass = isGrande
    ? 'sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2 min-h-[24rem] sm:min-h-[28rem] lg:min-h-0'
    : isMoyenne
      ? 'sm:col-span-2 lg:col-span-2 min-h-[16rem] sm:min-h-[18rem] lg:min-h-0'
      : 'sm:col-span-1 lg:col-span-1 min-h-[16rem] sm:min-h-[18rem] lg:min-h-0'

  // Image et vidéo
  let displayImage = (project.gallery && project.gallery[0]) || (project.imageUrl ? project.imageUrl.split(',')[0].trim() : '') || '/project-hotel.png'
  if (displayImage.match(/\.(mp4|webm|ogg|mov)$/i)) {
    const fallbackPhoto = project.gallery?.find((g) => !g.match(/\.(mp4|webm|ogg|mov)$/i))
    displayImage = (fallbackPhoto ? fallbackPhoto.split(',')[0].trim() : '') || '/project-hotel.png'
  }

  return (
    <Reveal
      delay={index * 90}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer ${spanClass}`}
    >
      <div
        onClick={() => onOpen(project)}
        className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#E6A635]/30 hover:border-[#E6A635]/80 transition-all duration-500 hover:shadow-[0_0_40px_rgba(230,166,53,0.3)] bg-[#1A110B] flex flex-col justify-end"
      >
        {/* Photo de couverture exclusive sur l'extérieur (pas de vidéo en extérieur) */}
        <Image
          src={displayImage}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading={isGrande ? 'eager' : 'lazy'}
          onError={(e) => {
            const filename = displayImage.split('/').pop()?.split('#')[0]
            if (filename && displayImage.startsWith('http')) {
              e.currentTarget.src = `/uploads/${filename}`
            } else {
              e.currentTarget.src = '/project-hotel.png'
            }
          }}
        />

        {/* Voile d'ambiance ultra-doux préservant la pleine clarté et luminosité de la photo d'art */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Bouton flèche en haut à droite transparent et discret */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 pointer-events-none">
          <span className="size-8 sm:size-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-[#F2BD52] flex items-center justify-center group-hover:bg-[#E6A635] group-hover:text-[#1A110B] group-hover:rotate-45 transition-all duration-300 shadow-md">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        {/* Contenu textuel 100% transparent : Ne masque pas l'image */}
        <div className="relative z-10 p-4 sm:p-6 text-left bg-transparent">
          {/* Ligne de sur-titre discret */}
          <div className="flex items-center gap-1.5 mb-1.5 text-[9.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.16em] text-[#F2BD52] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            <span className="size-1.5 rounded-full bg-[#E6A635] shadow-[0_0_6px_#E6A635]" />
            <span>{project.location ? `${project.category} • ${project.location}` : project.category}</span>
          </div>

          {/* Titre Noble */}
          <h3
            className={`font-heading font-medium text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] group-hover:text-[#F2BD52] transition-colors truncate ${
              isGrande
                ? 'text-xl sm:text-2xl lg:text-3xl'
                : isMoyenne
                  ? 'text-lg sm:text-xl lg:text-2xl'
                  : 'text-base sm:text-lg'
            }`}
          >
            {project.title}
          </h3>

          {/* Liseré or discret animé au survol */}
          <div className="mt-2 h-[1px] w-6 bg-[#E6A635]/60 group-hover:w-14 group-hover:bg-[#E6A635] transition-all duration-500 drop-shadow-md" />
        </div>
      </div>
    </Reveal>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxProject, setLightboxProject] = useState<{ images: string[]; currentIndex: number; title: string } | null>(null)
  const [isModalMuted, setIsModalMuted] = useState(true)
  const [modalActiveView, setModalActiveView] = useState<'video' | number>('video')
  const [isVideoBuffering, setIsVideoBuffering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleModalMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsModalMuted(videoRef.current.muted)
    } else {
      setIsModalMuted(!isModalMuted)
    }
  }

  // Chargement dynamique des projets depuis l'API publique (ceux ajoutés dans l'admin)
  useEffect(() => {
    async function loadDynamicProjects() {
      try {
        const data = await publicApi.getProjects()
        if (data && Array.isArray(data)) {
          const mapped: ProjectItem[] = data.map((p) => {
            const normCat = normalizeCategory(p.category)
            const detailsList = p.details
              ? p.details.split(',').map((d) => d.trim()).filter(Boolean)
              : []

            let galleryImgs: string[] = []
            if (Array.isArray(p.gallery) && p.gallery.length > 0) {
              galleryImgs = p.gallery
            } else if (typeof p.gallery === 'string' && (p.gallery as string).trim()) {
              galleryImgs = (p.gallery as string).split(',').map(s => s.trim()).filter(Boolean)
            } else if (Array.isArray(p.images) && p.images.length > 0) {
              galleryImgs = p.images.map((im: any) => typeof im === 'string' ? im : (im.imageUrl || '')).filter(Boolean)
            } else if (p.imageUrl) {
              galleryImgs = p.imageUrl.split(',').map(s => s.trim()).filter(Boolean)
            }

            try {
              if (typeof window !== 'undefined') {
                const local = localStorage.getItem(`project_gallery_${p.id}`)
                if (local) {
                  const parsed = JSON.parse(local)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    galleryImgs = Array.from(new Set([...galleryImgs, ...parsed]))
                  }
                }
              }
            } catch (_) {}

            const primaryImg = galleryImgs[0] || (p.imageUrl ? p.imageUrl.split(',')[0].trim() : '') || '/project-hotel.png'
            if (galleryImgs.length === 0) {
              galleryImgs = [primaryImg]
            }

            return {
              id: p.id,
              title: p.title,
              category: p.category || 'Projets Immobiliers',
              filterType: normCat,
              imageUrl: primaryImg,
              gallery: galleryImgs,
              description: p.description || '',
              location: p.location || 'Tunisie',
              details: p.details || '',
              detailsList,
              materials: 'Noyer noble, bois séché & finitions d\'art',
              videoUrl: p.videoUrl || p.video || undefined,
              video: p.videoUrl || p.video || undefined,
            }
          })
          setProjects(mapped)
        }
      } catch (err) {
        console.warn('Backend unavailable:', err)
        setProjects([])
      }
    }
    loadDynamicProjects()
  }, [])

  // Exactement jusqu'à 4 projets affichés sur l'accueil dans la disposition Bento
  const displayProjects = useMemo(() => {
    return projects.slice(0, 4)
  }, [projects])

  // Reset gallery index and video audio state when opening a new project
  useEffect(() => {
    setGalleryIndex(0)
    setIsModalMuted(true)
    if (selectedProject) {
      const hasVid = Boolean(selectedProject.video || selectedProject.videoUrl)
      setModalActiveView(hasVid ? 'video' : 0)
      setIsVideoBuffering(false)
    }
  }, [selectedProject])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxProject) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxProject(null)
      } else if (e.key === 'ArrowLeft') {
        setLightboxProject(prev => prev ? {
          ...prev,
          currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
        } : null)
      } else if (e.key === 'ArrowRight') {
        setLightboxProject(prev => prev ? {
          ...prev,
          currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
        } : null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxProject])

  return (
    <section id="realisations" className="relative overflow-hidden bg-transparent py-10 sm:py-16 lg:py-22 border-none scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 sm:mb-3.5 shadow-md">
              <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
              <span>Projets Clés en Main • Espaces d&apos;Exception</span>
            </div>
          </Reveal>
          
          <Reveal delay={80}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2.5">
              Des Lieux d&apos;Exception <br />
              <span className="font-serif italic text-white font-normal text-xl sm:text-3xl md:text-4xl lg:text-5xl block mt-0.5">
                Clés en Main
              </span>
            </h2>
          </Reveal>
          
          <Reveal delay={120}>
            <p className="max-w-2xl mx-auto text-pretty text-xs sm:text-sm md:text-base font-normal leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              De l&apos;étude architecturale à la pose finale : nous orchestrons des aménagements monumentaux complets pour palaces, hôtels 5★, riads et demeures de maître.
            </p>
          </Reveal>
        </div>

        {/* ================================================================= */}
        {/* DISPOSITION BENTO : 1 GRANDE, 2 PETITES, 1 MOYENNE (4 PROJETS)    */}
        {/* ================================================================= */}
        {displayProjects.length > 0 && (
          <div className="mt-8 sm:mt-12 grid auto-rows-[16rem] sm:auto-rows-[18rem] lg:auto-rows-[19rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProjects.map((p, idx) => (
              <BentoProjectCard
                key={p.id || idx}
                project={p}
                index={idx}
                onOpen={(proj) => setSelectedProject(proj)}
              />
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3-STEP PROCESS: ÉTUDE → FAÇONNAGE → POSE (3 Cartes Flottantes)    */}
        {/* ================================================================= */}
        <Reveal delay={100} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
            {PROCESS_STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#281810]/75 to-[#160E09]/85 backdrop-blur-md border border-[#E6A635]/25 hover:border-[#E6A635]/60 hover:bg-[#321E14]/90 transition-all duration-300 shadow-xl hover:shadow-[0_12px_32px_rgba(230,166,53,0.18)] flex flex-col justify-between overflow-hidden"
                >
                  {/* Filigrane discret du grand chiffre en arrière-plan */}
                  <span className="absolute -bottom-3 -right-1 font-heading text-6xl sm:text-7xl font-light text-[#E6A635]/[0.06] pointer-events-none select-none group-hover:text-[#E6A635]/[0.12] transition-colors">
                    {s.step}
                  </span>

                  <div>
                    {/* En-tête : Badge Étape + Icône Fine */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-bold tracking-wider font-heading">
                        ÉTAPE {s.step}
                      </span>
                      <div className="size-8 rounded-xl bg-[#20140E] border border-[#E6A635]/30 flex items-center justify-center text-[#F2BD52] group-hover:bg-[#E6A635] group-hover:text-[#1A110B] transition-colors shadow-sm">
                        <Icon className="size-4" />
                      </div>
                    </div>

                    {/* Titre Noble */}
                    <h4 className="font-heading text-base sm:text-lg font-medium text-white tracking-wide group-hover:text-[#F2BD52] transition-colors mb-2">
                      {s.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs sm:text-[12.5px] text-white/70 font-light leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Liseré fin inférieur de prestige */}
                  <div className="mt-5 pt-3 border-t border-[#E6A635]/15 flex items-center justify-between text-[10px] text-[#E6A635]/70 font-medium">
                    <span>Maison Aschi</span>
                    <span className="size-1 rounded-full bg-[#E6A635]/60" />
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
        
        {/* Dual Conversion CTA Section */}
        <Reveal delay={150} className="w-full flex flex-col items-center justify-center mt-8 sm:mt-12 z-10 relative">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto">
            
            <Link
              href="/espaces-d-exception#demande-projet"
              className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-7 sm:px-10 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#1A110B] transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(230,166,53,0.35)] transform hover:scale-[1.03] cursor-pointer text-center w-full sm:w-auto"
            >
              <Sparkles className="size-4 text-[#1A110B] animate-pulse" />
              <span>Démarrer Votre Projet d&apos;Exception</span>
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/espaces-d-exception"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E6A635]/45 bg-[#3B271C]/90 hover:bg-[#4E3425] hover:border-[#E6A635] hover:text-[#F2BD52] backdrop-blur-md px-6 sm:px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all transform hover:-translate-y-0.5 shadow-lg text-center w-full sm:w-auto"
            >
              <span>Voir Tous les Projets Clés en Main</span>
              <ArrowUpRight className="size-3.5 text-[#F2BD52]" />
            </Link>

          </div>

          <div className="mt-3.5 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-white/85 font-light">
            <span className="text-[#F2BD52] font-semibold">✦</span>
            <span>Étude Personnalisée &amp; Plans Sur-Mesure sous 24h</span>
            <span className="text-[#F2BD52]/60 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Fabrication Artisanale &amp; Pose Clé en Main</span>
          </div>
        </Reveal>

      </div>

      {/* ================================================================= */}
      {/* PROJECT DETAIL MODAL WITH GALLERY & WHATSAPP                      */}
      {/* ================================================================= */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1550px] bg-gradient-to-br from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/45 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] z-10 flex flex-col lg:flex-row max-h-[94vh] h-[92vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 size-8 sm:size-9 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors cursor-pointer shadow-lg"
                aria-label="Fermer"
              >
                <X className="size-4 sm:size-5" />
              </button>

              {/* LEFT COLUMN: Grand Écran Média Cinématique Agrandie + Ruban de Miniatures */}
              <div className="w-full lg:w-[68%] xl:w-[70%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#E6A635]/25 p-4 sm:p-6 justify-between gap-3 bg-[#1A110B]/70 min-h-0">
                
                {/* Barre supérieure d'état du média */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {modalActiveView === 'video' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <Film className="size-3.5 text-[#E6A635]" />
                        <span>Vidéo du Projet &amp; Réalisation</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812] border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <ImageIcon className="size-3.5 text-[#E6A635]" />
                        <span>Photo {(typeof modalActiveView === 'number' ? modalActiveView : 0) + 1} / {selectedProject.gallery?.length || 1}</span>
                      </span>
                    )}
                  </div>

                  {modalActiveView === 'video' ? (
                    <button
                      type="button"
                      onClick={toggleModalMute}
                      className="size-7 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-[#F2BD52] flex items-center justify-center hover:bg-[#E6A635] hover:text-[#1A110B] transition-colors shadow-sm cursor-pointer"
                      title={isModalMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isModalMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLightboxProject({
                        images: selectedProject.gallery,
                        currentIndex: typeof modalActiveView === 'number' ? modalActiveView : 0,
                        title: selectedProject.title
                      })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-semibold hover:bg-[#E6A635] hover:text-[#1A110B] transition-colors cursor-pointer shadow-sm"
                    >
                      <ZoomIn className="size-3" />
                      <span>Agrandir</span>
                    </button>
                  )}
                </div>

                {/* ── LE GRAND ÉCRAN MAÎTRE CINÉMATIQUE AGRANDI ── */}
                <div className="relative w-full flex-1 aspect-[16/9] min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] xl:min-h-[580px] rounded-2xl overflow-hidden border-2 border-[#E6A635]/45 bg-[#0D0805] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group/media">
                  {modalActiveView === 'video' && (selectedProject.video || selectedProject.videoUrl) ? (
                    <>
                      {(() => {
                        const rawVideoUrl = (() => {
                          const v = (selectedProject.video || selectedProject.videoUrl || '').trim()
                          if (!v) return ''
                          // Mapper les URLs distantes Supabase vers le fichier local équivalent pour un streaming 0ms
                          const match = v.match(/\/media\/([^/?#]+\.mp4)/i)
                          if (match && match[1]) {
                            return `/uploads/${match[1]}`
                          }
                          return v
                        })()
                        const posterUrl = (selectedProject.gallery && selectedProject.gallery[0]?.split(',')[0]?.trim()) ||
                          (selectedProject.imageUrl ? selectedProject.imageUrl.split(',')[0]?.trim() : '') ||
                          '/project-hotel.png'

                        return (
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
                            className="w-full h-full object-contain sm:object-cover bg-black"
                            onWaiting={() => setIsVideoBuffering(true)}
                            onPlaying={() => setIsVideoBuffering(false)}
                            onPlay={() => setIsVideoBuffering(false)}
                            onTimeUpdate={() => setIsVideoBuffering(false)}
                            onCanPlay={() => setIsVideoBuffering(false)}
                            onLoadedData={() => setIsVideoBuffering(false)}
                          />
                        )
                      })()}

                      {/* Spinner discret uniquement en cas de chargement réel, sans texte bloquant */}
                      {isVideoBuffering && (
                        <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                          <div className="size-10 rounded-full border-2 border-[#E6A635]/30 border-t-[#E6A635] animate-spin shadow-[0_0_15px_rgba(230,166,53,0.4)]" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Badge HD discret en haut à droite */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/50 text-[#F2BD52] text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md pointer-events-none">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Vidéo HD</span>
                      </div>

                      {/* Contrôle du Son en bas à droite (Bouton Start 100% MASQUÉ) */}
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
                      {(() => {
                        const modalImg = (selectedProject.gallery && selectedProject.gallery[typeof modalActiveView === 'number' ? modalActiveView : 0]?.split(',')[0]?.trim()) ||
                          (selectedProject.imageUrl ? selectedProject.imageUrl.split(',')[0].trim() : '') ||
                          '/project-hotel.png'
                        return (
                          <Image
                            src={modalImg}
                            alt={selectedProject.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 ease-out group-hover/media:scale-105 cursor-zoom-in"
                            onClick={() => setLightboxProject({
                              images: selectedProject.gallery,
                              currentIndex: typeof modalActiveView === 'number' ? modalActiveView : 0,
                              title: selectedProject.title
                            })}
                            onError={(e) => {
                              const filename = modalImg.split('/').pop()?.split('#')[0]
                              if (filename && modalImg.startsWith('http')) {
                                e.currentTarget.src = `/uploads/${filename}`
                              } else {
                                e.currentTarget.src = '/project-hotel.png'
                              }
                            }}
                          />
                        )
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                      {/* Flèches de navigation photo */}
                      {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const cur = typeof modalActiveView === 'number' ? modalActiveView : 0
                              const next = cur === 0 ? selectedProject.gallery.length - 1 : cur - 1
                              setModalActiveView(next)
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer shadow-md"
                            aria-label="Image précédente"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const cur = typeof modalActiveView === 'number' ? modalActiveView : 0
                              const next = cur === selectedProject.gallery.length - 1 ? 0 : cur + 1
                              setModalActiveView(next)
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer shadow-md"
                            aria-label="Image suivante"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* ── RUBAN DE MINIATURES INTERACTIF (VIDÉO + TOUTES LES PHOTOS) ── */}
                <div className="pt-1">
                  <p className="text-[9.5px] uppercase tracking-wider text-[#F2BD52]/70 font-semibold mb-2 flex items-center justify-between">
                    <span>Sélectionnez un aperçu :</span>
                    <span className="text-white/40 font-normal">
                      {(Boolean(selectedProject.video || selectedProject.videoUrl) ? 1 : 0) + (selectedProject.gallery?.length || 0)} médias disponibles
                    </span>
                  </p>

                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin items-center">
                    {/* Miniature Vidéo si disponible */}
                    {(selectedProject.video || selectedProject.videoUrl) && (() => {
                      const thumbPoster = (selectedProject.gallery && selectedProject.gallery[0]?.split(',')[0]?.trim()) ||
                        (selectedProject.imageUrl ? selectedProject.imageUrl.split(',')[0]?.trim() : '') ||
                        '/project-hotel.png'
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setModalActiveView('video')
                            setIsVideoBuffering(false)
                          }}
                          className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer flex flex-col items-center justify-center bg-black group/vidthumb ${
                            modalActiveView === 'video'
                              ? 'border-[#E6A635] shadow-[0_0_14px_rgba(230,166,53,0.5)] scale-[0.98]'
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
                    {selectedProject.gallery && selectedProject.gallery.map((img: string, idx: number) => {
                      const thumbUrl = img.split(',')[0].trim()
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setModalActiveView(idx)}
                          className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            modalActiveView === idx
                              ? 'border-[#E6A635] shadow-[0_0_14px_rgba(230,166,53,0.5)] scale-[0.98]'
                              : 'border-[#E6A635]/25 opacity-60 hover:opacity-100 hover:border-[#E6A635]/60'
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
                                e.currentTarget.src = '/project-hotel.png'
                              }
                            }}
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 text-[8.5px] text-white/90 font-medium">
                            {idx + 1}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Détails de Prestige, Spécifications Nobles & CTA */}
              <div className="w-full lg:w-[32%] xl:w-[30%] flex flex-col justify-between overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 text-left scrollbar-thin">
                
                {/* En-tête du projet */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full font-bold shadow-sm">
                      <Sparkles className="size-2.5" />
                      {selectedProject.category}
                    </span>
                    {selectedProject.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#F2BD52] font-medium">
                        <MapPin className="size-3 text-[#E6A635]" />
                        <span>{selectedProject.location}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl text-gold-gradient font-light leading-snug">
                    {selectedProject.title}
                  </h3>

                  {selectedProject.description ? (
                    <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                      {selectedProject.description}
                    </p>
                  ) : (
                    <p className="text-xs text-white/70 font-light leading-relaxed">
                      Conception intégrale et aménagements artisanaux d&apos;exception réalisés par l&apos;Atelier Aschi.
                    </p>
                  )}
                </div>

                {/* ── NOUVELLE GRILLE DE SPÉCIFICATIONS HAUTE COUTURE (COMBLE LE VIDE) ── */}
                <div className="grid grid-cols-2 gap-2.5 py-1">
                  <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25">
                    <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold block flex items-center gap-1.5">
                      <Hammer className="size-3 text-[#E6A635]" /> Aménagement
                    </span>
                    <span className="text-xs text-white font-medium block mt-1 truncate">
                      {selectedProject.category || 'Sur-Mesure'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25">
                    <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold block flex items-center gap-1.5">
                      <Sparkles className="size-3 text-[#E6A635]" /> Essences Nobles
                    </span>
                    <span className="text-xs text-white font-medium block mt-1 truncate">
                      {selectedProject.materials || 'Noyer Massif & Bois d\'Art'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25">
                    <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold block flex items-center gap-1.5">
                      <Ruler className="size-3 text-[#E6A635]" /> Bureau d&apos;Étude
                    </span>
                    <span className="text-xs text-white font-medium block mt-1 truncate">
                      Plans 3D sous 48h
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#241812]/90 border border-[#E6A635]/25">
                    <span className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-semibold block flex items-center gap-1.5">
                      <Truck className="size-3 text-[#E6A635]" /> Exécution
                    </span>
                    <span className="text-xs text-white font-medium block mt-1 truncate">
                      Pose Clé en Main Tunisie
                    </span>
                  </div>
                </div>

                {/* Sceau d'authenticité Atelier Aschi */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#241812] via-[#2F1E14] to-[#241812] border border-[#E6A635]/30 flex items-center gap-3 shadow-inner">
                  <div className="size-8 rounded-lg bg-[#E6A635]/15 border border-[#E6A635]/40 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-[#F2BD52]" />
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] text-white/85 font-light leading-snug">
                    <strong className="text-[#F2BD52] font-semibold">Excellence Aschi :</strong> Façonnage artisanal dans notre atelier et pose millimétrique garantie.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-[#E6A635]/20 space-y-2.5">
                  <a
                    href={`https://wa.me/21655743760?text=${encodeURIComponent(
                      `Bonjour Maison Aschi, j'ai vu votre réalisation "${selectedProject.title}" (${selectedProject.category}) et je souhaite une étude d'aménagement similaire pour mon établissement.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <MessageCircle className="size-4 fill-white/20" />
                    <span>Demander une Étude sur WhatsApp</span>
                  </a>

                  <Link
                    href="/espaces-d-exception#demande-projet"
                    className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <FileText className="size-3.5 text-[#1A110B]" />
                    <span>Remplir le Formulaire d&apos;Étude</span>
                  </Link>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-full inline-flex items-center justify-center rounded-full border border-[#E6A635]/40 bg-[#241812]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#3B271C] hover:text-[#F2BD52] transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN IMAGE LIGHTBOX / ZOOM ── */}
      <AnimatePresence>
        {lightboxProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6"
            onClick={() => setLightboxProject(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-xs font-semibold shadow-md">
                  {lightboxProject.title}
                </span>
                {lightboxProject.images.length > 1 && (
                  <span className="text-white/70 text-xs font-mono bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                    {lightboxProject.currentIndex + 1} / {lightboxProject.images.length}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxProject(null)
                }}
                className="size-10 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] hover:bg-[#3B271C] transition-all flex items-center justify-center cursor-pointer shadow-lg"
                aria-label="Fermer le plein écran"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Enlarged Image container */}
            <motion.div
              key={lightboxProject.currentIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-5xl h-[70vh] sm:h-[78vh] flex items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxProject.images[lightboxProject.currentIndex]?.split(',')[0]?.trim() || '/project-hotel.png'}
                alt={lightboxProject.title}
                fill
                unoptimized
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                sizes="100vw"
                priority
                onError={(e) => {
                  const cur = lightboxProject.images[lightboxProject.currentIndex]?.split(',')[0]?.trim()
                  const filename = cur?.split('/').pop()?.split('#')[0]
                  if (filename && cur?.startsWith('http')) {
                    e.currentTarget.src = `/uploads/${filename}`
                  } else {
                    e.currentTarget.src = '/project-hotel.png'
                  }
                }}
              />
            </motion.div>

            {/* Navigation Arrows */}
            {lightboxProject.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxProject(prev => prev ? {
                      ...prev,
                      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
                    } : null)
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:scale-110 transition-all cursor-pointer shadow-xl"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="size-5 sm:size-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxProject(prev => prev ? {
                      ...prev,
                      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
                    } : null)
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:scale-110 transition-all cursor-pointer shadow-xl"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="size-5 sm:size-6" />
                </button>
              </>
            )}

            {/* Bottom Thumbnails */}
            {lightboxProject.images.length > 1 && (
              <div 
                className="absolute bottom-3 sm:bottom-4 inset-x-4 flex justify-center gap-2 overflow-x-auto py-2 z-20 scrollbar-thin"
                onClick={(e) => e.stopPropagation()}
              >
                {lightboxProject.images.map((img, idx) => {
                  const cleanImg = img.split(',')[0].trim()
                  return (
                    <button
                      key={idx}
                      onClick={() => setLightboxProject(prev => prev ? { ...prev, currentIndex: idx } : null)}
                      className={`relative w-12 sm:w-16 aspect-[16/10] rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        lightboxProject.currentIndex === idx
                          ? 'border-[#E6A635] scale-105 shadow-[0_0_12px_rgba(230,166,53,0.5)]'
                          : 'border-white/20 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={cleanImg}
                        alt="Miniature"
                        fill
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          const filename = cleanImg.split('/').pop()?.split('#')[0]
                          if (filename && cleanImg.startsWith('http')) {
                            e.currentTarget.src = `/uploads/${filename}`
                          } else {
                            e.currentTarget.src = '/project-hotel.png'
                          }
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
