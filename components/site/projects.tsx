'use client'

import { useState, useEffect, useMemo } from 'react'
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
    ? 'sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2 min-h-[22rem] sm:min-h-[26rem] lg:min-h-0'
    : isMoyenne
      ? 'sm:col-span-2 lg:col-span-2 min-h-[16rem] sm:min-h-[17rem] lg:min-h-0'
      : 'sm:col-span-1 lg:col-span-1 min-h-[16rem] sm:min-h-[17rem] lg:min-h-0'

  // Image fixe optimisée (aucun chargement de vidéo lourd sur l'accueil)
  let displayImage = project.imageUrl || '/project-hotel.png'
  if (displayImage.match(/\.(mp4|webm|ogg|mov)$/i)) {
    const fallbackPhoto = project.gallery?.find((g) => !g.match(/\.(mp4|webm|ogg|mov)$/i))
    displayImage = fallbackPhoto || '/project-hotel.png'
  }
  return (
    <Reveal
      delay={index * 90}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer ${spanClass}`}
    >
      <div
        onClick={() => onOpen(project)}
        className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#E6A635]/25 hover:border-[#E6A635]/70 transition-all duration-500 hover:shadow-[0_0_35px_rgba(230,166,53,0.25)] bg-[#1A110B] flex flex-col justify-end"
      >
        {/* Image fixe haute performance */}
        <Image
          src={displayImage}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading={isGrande ? 'eager' : 'lazy'}
        />

        {/* Dégradés d'ombrage pour lisibilité optimale */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#160E0A]/95 via-[#160E0A]/50 to-black/20 transition-opacity duration-500 group-hover:opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />

        {/* Badges & Bouton en haut */}
        <div className="absolute top-3.5 sm:top-5 left-3.5 sm:left-5 right-3.5 sm:right-5 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
              <Sparkles className="size-3 text-[#E6A635]" />
              <span>{project.category}</span>
            </span>
            {project.location && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A110B]/80 border border-white/15 text-white/80 text-[10px] backdrop-blur-md">
                <MapPin className="size-2.5 text-[#E6A635]" />
                <span>{project.location}</span>
              </span>
            )}
          </div>

          <span className="size-8 sm:size-10 rounded-full bg-[#1A110B]/85 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] flex items-center justify-center group-hover:bg-[#E6A635] group-hover:text-[#1A110B] group-hover:rotate-45 transition-all duration-300 shadow-lg">
            <ArrowUpRight className="size-4 sm:size-5" />
          </span>
        </div>

        {/* Contenu textuel en bas */}
        <div className="relative z-10 p-4 sm:p-6 md:p-7 text-left text-white">
          <h3
            className={`font-heading font-light text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:text-[#F2BD52] transition-colors mb-2 ${
              isGrande
                ? 'text-xl sm:text-2xl lg:text-3xl'
                : isMoyenne
                  ? 'text-lg sm:text-xl lg:text-2xl'
                  : 'text-base sm:text-lg'
            }`}
          >
            {project.title}
          </h3>

          <p
            className={`text-white/85 text-xs sm:text-sm font-light leading-relaxed drop-shadow-md line-clamp-2 ${
              isGrande ? 'sm:line-clamp-3 max-w-md' : 'max-w-sm'
            }`}
          >
            {project.description}
          </p>

          {/* Pastilles d'aménagements si présents */}
          {project.detailsList && project.detailsList.length > 0 && (
            <div className="mt-3 hidden sm:flex flex-wrap gap-1.5">
              {project.detailsList.slice(0, isGrande ? 3 : 2).map((detail, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-[#241812]/80 border border-[#E6A635]/25 text-[10px] text-white/90 backdrop-blur-sm"
                >
                  {detail}
                </span>
              ))}
            </div>
          )}

          {/* Indication d'interaction */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-[#F2BD52] font-semibold opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <span>Découvrir le projet</span>
            <ChevronRight className="size-3.5" />
          </div>
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
            return {
              id: p.id,
              title: p.title,
              category: p.category || 'Projets Immobiliers',
              filterType: normCat,
              imageUrl: p.imageUrl || '/project-hotel.png',
              gallery: [p.imageUrl || '/project-hotel.png'],
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

  // Reset gallery index when opening a new project
  useEffect(() => {
    setGalleryIndex(0)
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
        {/* 3-STEP PROCESS: ÉTUDE → FAÇONNAGE → POSE                          */}
        {/* ================================================================= */}
        <Reveal delay={100} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#3B271C]/90 to-[#241812]/95 backdrop-blur-xl border border-[#E6A635]/35 shadow-xl">
            {PROCESS_STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="flex items-start gap-3 sm:gap-4 relative">
                  {/* Step Number */}
                  <div className="relative shrink-0">
                    <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center shadow-md">
                      <Icon className="size-5 sm:size-6 text-[#F2BD52]" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 size-5 sm:size-6 rounded-full bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                      {s.step}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-sm sm:text-base font-medium text-white mb-0.5">
                      {s.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-white/75 font-light leading-snug">
                      {s.desc}
                    </p>
                  </div>
                  {/* Connector arrow (desktop only, not on last) */}
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hidden sm:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="size-4 text-[#E6A635]/50" />
                    </div>
                  )}
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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#3B271C] border-2 border-[#E6A635]/50 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10 p-5 sm:p-7"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 size-9 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors cursor-pointer shadow-lg"
                aria-label="Fermer"
              >
                <X className="size-4.5" />
              </button>

              {/* ── GALLERY CAROUSEL (Click to Zoom) ── */}
              <div 
                onClick={() => setLightboxProject({
                  images: selectedProject.gallery,
                  currentIndex: galleryIndex,
                  title: selectedProject.title
                })}
                className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-[#E6A635]/40 mb-4 bg-black cursor-zoom-in group/img"
              >
                <Image
                  src={selectedProject.gallery[galleryIndex] || selectedProject.imageUrl}
                  alt={selectedProject.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/90 via-transparent to-transparent" />

                {/* Zoom indicator button */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#241812]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-[10px] font-semibold shadow-md pointer-events-none group-hover/img:bg-[#E6A635] group-hover/img:text-[#1A110B] transition-colors">
                  <ZoomIn className="size-3 sm:size-3.5" />
                  <span>Agrandir</span>
                </div>

                {/* Gallery nav arrows */}
                {selectedProject.gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => i === 0 ? selectedProject.gallery.length - 1 : i - 1) }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => i === selectedProject.gallery.length - 1 ? 0 : i + 1) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}

                {/* Gallery dots */}
                {selectedProject.gallery.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {selectedProject.gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setGalleryIndex(i) }}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                          galleryIndex === i
                            ? 'w-5 h-1.5 bg-gradient-to-r from-[#F3C45E] to-[#E6A635] shadow-[0_0_6px_rgba(230,166,53,0.5)]'
                            : 'size-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/95 backdrop-blur-md border border-[#E6A635]/45 text-[#F2BD52] text-[11px] font-bold uppercase tracking-wider shadow-md">
                  {selectedProject.category}
                </div>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl text-gold-gradient mb-2">
                {selectedProject.title}
              </h3>

              <p className="text-white drop-shadow text-xs sm:text-sm font-normal leading-relaxed mb-5">
                {selectedProject.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/35 mb-5 text-left">
                {selectedProject.location && (
                  <div>
                    <span className="text-[10px] uppercase text-[#F2BD52] font-semibold block">Localisation</span>
                    <span className="text-xs text-white font-medium">{selectedProject.location}</span>
                  </div>
                )}
                {selectedProject.year && (
                  <div>
                    <span className="text-[10px] uppercase text-[#F2BD52] font-semibold block">Année de Pose</span>
                    <span className="text-xs text-white font-medium">{selectedProject.year}</span>
                  </div>
                )}
                {selectedProject.materials && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase text-[#F2BD52] font-semibold block">Matériaux Nobles</span>
                    <span className="text-xs text-white font-medium truncate block">{selectedProject.materials}</span>
                  </div>
                )}
              </div>

              {/* ── VIDEO PLAYER (if available) ── */}
              {(selectedProject.video || selectedProject.videoUrl) && (
                <div className="mb-5 space-y-2">
                  <span className="text-[10px] uppercase text-[#F2BD52] font-semibold block text-left flex items-center gap-1.5">
                    <Video className="size-3.5" /> Aperçu Vidéo de la Réalisation
                  </span>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#E6A635]/40 bg-black shadow-inner">
                    <video
                      src={selectedProject.video || selectedProject.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* ── ACTION BUTTONS: WHATSAPP + ÉTUDE ── */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/21655743760?text=${encodeURIComponent(
                    `Bonjour Maison Aschi, j'ai vu votre réalisation "${selectedProject.title}" (${selectedProject.category}) et je souhaite une étude d'aménagement similaire pour mon établissement.\n\nType de projet : \nLocalisation : \nBudget estimé : `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <MessageCircle className="size-4 fill-white/20 text-white" />
                  <span>Demander une Étude sur WhatsApp</span>
                </a>

                <Link
                  href="/espaces-d-exception#demande-projet"
                  className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] shadow-lg transition-all hover:scale-[1.02]"
                >
                  <FileText className="size-3.5 text-[#1A110B]" />
                  <span>Remplir le Formulaire d&apos;Étude</span>
                </Link>
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center justify-center rounded-full border border-[#E6A635]/40 bg-[#241812]/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#3B271C] hover:text-[#F2BD52] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
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
                src={lightboxProject.images[lightboxProject.currentIndex]}
                alt={lightboxProject.title}
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                sizes="100vw"
                priority
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
                {lightboxProject.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxProject(prev => prev ? { ...prev, currentIndex: idx } : null)}
                    className={`relative w-12 sm:w-16 aspect-[16/10] rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      lightboxProject.currentIndex === idx
                        ? 'border-[#E6A635] scale-105 shadow-[0_0_12px_rgba(230,166,53,0.5)]'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="Miniature" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
