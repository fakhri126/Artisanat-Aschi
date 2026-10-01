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
import { formatImageUrl } from '@/lib/utils'

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
/*  DEFAULT PRESTIGE PROJECTS FALLBACK                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: 'Hôtel Dar El Jeld',
    category: 'Hôtels & Palaces',
    filterType: 'hotel',
    imageUrl: '/project-hotel.png',
    gallery: ['/project-hotel.png', '/gallery-1.png', '/gallery-2.png', '/porte.png'],
    description: 'Aménagement monumental complet de l\'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques d\'inspiration andalouse, et mobilier de salon d\'exception.',
    location: 'Médina de Tunis',
    details: 'Portes monumentales, Boiseries d\'art, Salons de réception, Luminaires',
    detailsList: ['Portes monumentales', 'Boiseries d\'art', 'Salons de réception', 'Luminaires'],
    materials: 'Noyer noble, bois séché & finitions d\'art',
    videoUrl: '/Video.mp4',
    video: '/Video.mp4',
  },
  {
    id: 2,
    title: 'Maison d\'Hôtes Dar Said',
    category: 'Maisons d\'Hôtes',
    filterType: 'guesthouse',
    imageUrl: '/project-guesthouse.png',
    gallery: ['/project-guesthouse.png', '/gallery-3.png', '/gallery-4.png', '/miroir.png'],
    description: 'Conception sur-mesure d\'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés, commodes incrustées de laiton poli et cadres de miroirs dorés à la feuille d\'or.',
    location: 'Sidi Bou Saïd',
    details: 'Mobilier de chambre, Miroirs sculptés, Incrustations laiton, Consoles',
    detailsList: ['Mobilier de chambre', 'Miroirs sculptés', 'Incrustations laiton', 'Consoles'],
    materials: 'Noyer noble, bois séché & finitions d\'art',
    videoUrl: '/test-video.mp4',
    video: '/test-video.mp4',
  },
  {
    id: 3,
    title: 'Villa de Maître Carthage',
    category: 'Villas & Résidences Privées',
    filterType: 'villa',
    imageUrl: '/project-villa.png',
    gallery: ['/project-villa.png', '/gallery-1.png', '/creation-unique.png'],
    description: 'Création intégrale de menuiserie d\'art pour une résidence privée de prestige. Portes monumentales extérieures cloutées, plafonds à caissons en noyer et habillages muraux sculptés.',
    location: 'Carthage',
    details: 'Portes monumentales, Plafonds à caissons, Moucharabiehs, Mobilier de salon',
    detailsList: ['Portes monumentales', 'Plafonds à caissons', 'Moucharabiehs', 'Mobilier de salon'],
    materials: 'Noyer noble, bois séché & finitions d\'art',
    videoUrl: '/Video.mp4',
    video: '/Video.mp4',
  },
  {
    id: 4,
    title: 'Résidence Panorama Marina',
    category: 'Projets Immobiliers',
    filterType: 'immobilier',
    imageUrl: '/creation-model.png',
    gallery: ['/creation-model.png', '/project-hotel.png', '/gallery-2.png'],
    description: 'Conception et fabrication en série sur-mesure pour un programme immobilier de grand standing. Portes palières sculptées, agencements de halls d\'entrée et claustras décoratifs.',
    location: 'Gammarth',
    details: 'Portes de standing, Habillage hall d\'accueil, Claustras et moucharabiehs',
    detailsList: ['Portes de standing', 'Habillage hall d\'accueil', 'Claustras et moucharabiehs'],
    materials: 'Noyer noble, bois séché & finitions d\'art',
    videoUrl: '/test-video.mp4',
    video: '/test-video.mp4',
  },
  {
    id: 5,
    title: 'Bureaux Corporate & Restaurant L\'Ébène',
    category: 'Espaces Professionnels & Commerciaux',
    filterType: 'pro_commercial',
    imageUrl: '/project-restaurant.png',
    gallery: ['/project-restaurant.png', '/gallery-5.png', '/gallery-6.png', '/buffet.png'],
    description: 'Aménagement prestigieux de la salle du conseil d\'administration et de l\'espace restaurant lounge. Table de réunion de 6 mètres en chêne massif et habillage acoustique sculpté.',
    location: 'Les Berges du Lac, Tunis',
    details: 'Table de conférence, Comptoir de bar d\'art, Habillages acoustiques',
    detailsList: ['Table de conférence', 'Comptoir de bar d\'art', 'Habillages acoustiques'],
    materials: 'Noyer noble, bois séché & finitions d\'art',
    videoUrl: '/test-video.mp4',
    video: '/test-video.mp4',
  }
]

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COMPACT PROJECT CARD (Moderne, Côte à Côte, Sans Description)             */
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
  // Image fixe optimisée
  let rawDisplay = (project.gallery && project.gallery[0]) || (project.imageUrl ? project.imageUrl.split(',')[0].trim() : '') || '/project-hotel.png'
  if (rawDisplay.match(/\.(mp4|webm|ogg|mov)$/i)) {
    const fallbackPhoto = project.gallery?.find((g) => !g.match(/\.(mp4|webm|ogg|mov)$/i))
    rawDisplay = (fallbackPhoto ? fallbackPhoto.split(',')[0].trim() : '') || '/project-hotel.png'
  }
  const displayImage = formatImageUrl(rawDisplay, '/project-hotel.png')
  const hasVideo = Boolean(project.videoUrl || project.video)

  return (
    <Reveal
      delay={index * 70}
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer h-full"
    >
      <div
        onClick={() => onOpen(project)}
        className="w-full h-full relative rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.55)] border border-[#E6A635]/30 hover:border-[#E6A635]/85 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(230,166,53,0.25)] bg-gradient-to-b from-[#2A1C14] via-[#1E130D] to-[#140C08] flex flex-col justify-between hover:-translate-y-1"
      >
        {/* Liseré doré supérieur au survol */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#E6A635] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

        {/* ── Cadre Photo de Prestige (Mise en avant de la réalisation) ── */}
        <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#120B08] shrink-0 border-b border-[#E6A635]/20">
          <Image
            src={displayImage}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140C08]/90 via-[#140C08]/20 to-black/20 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />

          {/* Indicateur vidéo subtil et discret */}
          {hasVideo && (
            <div className="absolute top-2 right-2 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A110B]/85 border border-[#E6A635]/40 text-[#F2BD52] text-[9px] font-semibold backdrop-blur-md shadow-md">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Film className="size-2.5 text-[#E6A635]" />
              </span>
            </div>
          )}
        </div>

        {/* ── Contenu épuré : UNIQUEMENT LE NOM DU PROJET ── */}
        <div className="p-2.5 sm:p-4 flex items-center justify-center text-center flex-1">
          <h3 className="font-heading font-medium text-white group-hover:text-[#F2BD52] transition-colors line-clamp-2 text-xs sm:text-base leading-snug tracking-wide">
            {project.title}
          </h3>
        </div>
      </div>
    </Reveal>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxProject, setLightboxProject] = useState<{ images: string[]; currentIndex: number; title: string } | null>(null)
  const [isModalMuted, setIsModalMuted] = useState(true)
  const [modalActiveView, setModalActiveView] = useState<'video' | number>('video')
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
        console.warn('Backend unavailable, using default projects:', err)
      }
    }
    loadDynamicProjects()
  }, [])

  // Sélectionner exactement 4 projets prestigieux pour l'accueil : 1 de chaque type distinct
  const displayProjects = useMemo(() => {
    const TARGET_TYPES = ['hotel', 'guesthouse', 'villa', 'immobilier']
    const selected: ProjectItem[] = []
    const usedIds = new Set<number>()

    // 1. Prendre un projet représentatif de chaque type distinct
    for (const type of TARGET_TYPES) {
      const match = projects.find(p => p.filterType === type && !usedIds.has(p.id))
      if (match) {
        selected.push(match)
        usedIds.add(match.id)
      }
    }

    // 2. Si un type manque, compléter avec les projets restants jusqu'à avoir 4 projets
    if (selected.length < 4) {
      for (const p of projects) {
        if (!usedIds.has(p.id)) {
          selected.push(p)
          usedIds.add(p.id)
          if (selected.length === 4) break
        }
      }
    }

    return selected.slice(0, 4)
  }, [projects])

  // Reset gallery index and video audio state when opening a new project
  useEffect(() => {
    setGalleryIndex(0)
    setIsModalMuted(true)
    if (selectedProject) {
      const hasVid = Boolean(selectedProject.video || selectedProject.videoUrl)
      setModalActiveView(hasVid ? 'video' : 0)
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
        {/* GRILLE PROJETS CLÉS EN MAIN (Côte à côte 2 colonnes sur mobile, 2 à 4 sur écran large) */}
        {/* ================================================================= */}
        {displayProjects.length > 0 && (
          <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
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
              className="relative w-full max-w-5xl bg-gradient-to-br from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/45 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] z-10 flex flex-col md:flex-row max-h-[92vh] overflow-y-auto md:overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 size-8 sm:size-9 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors cursor-pointer shadow-lg"
                aria-label="Fermer"
              >
                <X className="size-4 sm:size-5" />
              </button>

              {/* 📱 EN-TÊTE DU PROJET SUR MOBILE (EN HAUT : Titre & Description avant le média) */}
              <div className="block md:hidden p-4 sm:p-5 pb-2.5 space-y-2 text-left bg-[#1A110B]/90 border-b border-[#E6A635]/25 pr-14">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] uppercase tracking-[0.15em] px-3 py-0.5 rounded-full font-bold shadow-sm">
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

                <h3 className="font-heading text-xl sm:text-2xl text-gold-gradient font-light leading-snug">
                  {selectedProject.title}
                </h3>

                {selectedProject.description ? (
                  <p className="text-xs text-white/80 font-light leading-relaxed">
                    {selectedProject.description}
                  </p>
                ) : (
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    Conception intégrale et aménagements artisanaux d&apos;exception réalisés par l&apos;Atelier Aschi.
                  </p>
                )}
              </div>

              {/* LEFT COLUMN: Grand Écran Média (16:9) + Ruban de Miniatures Interactif (Au milieu sur mobile) */}
              <div className="w-full md:w-[58%] flex flex-col border-b md:border-b-0 md:border-r border-[#E6A635]/25 p-4 sm:p-6 justify-between gap-3 bg-[#1A110B]/60">
                
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

                {/* ── LE GRAND ÉCRAN MAÎTRE CINÉMATIQUE (16:9) ── */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#E6A635]/45 bg-[#120B08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] group/media">
                  {modalActiveView === 'video' && (selectedProject.video || selectedProject.videoUrl) ? (
                    <>
                      <video
                        ref={videoRef}
                        src={selectedProject.video || selectedProject.videoUrl}
                        muted={isModalMuted}
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
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
                      <Image
                        src={formatImageUrl(
                          (selectedProject.gallery && selectedProject.gallery[typeof modalActiveView === 'number' ? modalActiveView : 0]?.split(',')[0]?.trim()) ||
                          (selectedProject.imageUrl ? selectedProject.imageUrl.split(',')[0].trim() : ''),
                          '/project-hotel.png'
                        )}
                        alt={selectedProject.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover/media:scale-105 cursor-zoom-in"
                        onClick={() => setLightboxProject({
                          images: selectedProject.gallery,
                          currentIndex: typeof modalActiveView === 'number' ? modalActiveView : 0,
                          title: selectedProject.title
                        })}
                      />
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
                    {(selectedProject.video || selectedProject.videoUrl) && (
                      <button
                        type="button"
                        onClick={() => setModalActiveView('video')}
                        className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer flex flex-col items-center justify-center bg-black ${
                          modalActiveView === 'video'
                            ? 'border-[#E6A635] shadow-[0_0_14px_rgba(230,166,53,0.5)] scale-[0.98]'
                            : 'border-[#E6A635]/25 opacity-60 hover:opacity-100 hover:border-[#E6A635]/60'
                        }`}
                      >
                        <video
                          src={selectedProject.video || selectedProject.videoUrl}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E6A635] text-[#1A110B] text-[8.5px] font-extrabold uppercase shadow-sm">
                            <Film className="size-2.5 fill-current" /> Vidéo
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Miniatures des Photos */}
                    {selectedProject.gallery && selectedProject.gallery.map((img: string, idx: number) => (
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
                        <Image src={formatImageUrl(img.split(',')[0].trim(), '/project-hotel.png')} alt="Miniature" fill className="object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 text-[8.5px] text-white/90 font-medium">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Détails de Prestige, Spécifications Nobles & CTA */}
              <div className="w-full md:w-[42%] flex flex-col justify-between overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 text-left scrollbar-thin">
                
                {/* En-tête du projet (Desktop uniquement, affiché en haut sur mobile) */}
                <div className="hidden md:block space-y-2.5">
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
                src={formatImageUrl(lightboxProject.images[lightboxProject.currentIndex]?.split(',')[0]?.trim(), '/project-hotel.png')}
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
                    <Image src={formatImageUrl(img.split(',')[0].trim(), '/project-hotel.png')} alt="Miniature" fill className="object-cover" />
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
