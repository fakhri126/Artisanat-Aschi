'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Reveal } from '@/components/site/reveal'
import { MobileFloatingVIP } from '@/components/site/mobile-floating-vip'
import { publicApi } from '@/lib/api'
import { FILTER_TYPES, normalizeCategory, PROJECTS } from './constants'
import ProjectRequestForm from './ProjectRequestForm'
import TurnkeyProjectCard from './TurnkeyProjectCard'
import ProjectLightbox, { LightboxData } from './ProjectLightbox'
import ProjectDetailsModal from './ProjectDetailsModal'

export default function TurnkeyProjectsPage() {
  const [filter, setFilter] = useState('all')
  const [formEspace, setFormEspace] = useState('')
  const [liveProjects, setLiveProjects] = useState<any[]>(PROJECTS)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [lightboxProject, setLightboxProject] = useState<LightboxData | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await publicApi.getProjects()
        if (Array.isArray(data)) {
          const mapped = data.map((p) => {
            const normType = normalizeCategory(p.category)
            let galleryImgs: string[] = []
            if (Array.isArray(p.gallery) && p.gallery.length > 0) {
              galleryImgs = p.gallery
            } else if (typeof p.gallery === 'string' && (p.gallery as string).trim()) {
              galleryImgs = (p.gallery as string).split(',').map((s: string) => s.trim()).filter(Boolean)
            } else if (Array.isArray(p.images) && p.images.length > 0) {
              galleryImgs = p.images.map((im: any) => typeof im === 'string' ? im : (im.imageUrl || '')).filter(Boolean)
            } else if (p.imageUrl) {
              galleryImgs = p.imageUrl.split(',').map((s: string) => s.trim()).filter(Boolean)
            }
            try {
              const localImgs = typeof window !== 'undefined' ? localStorage.getItem(`project_gallery_${p.id}`) : null
              if (localImgs) {
                const parsed = JSON.parse(localImgs)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  galleryImgs = Array.from(new Set([...galleryImgs, ...parsed]))
                }
              }
            } catch (_) {}

            if (galleryImgs.length === 0) {
              galleryImgs = ['/project-hotel.png']
            }

            return {
              id: p.id,
              title: p.title,
              location: p.location || 'Tunisie',
              type: normType,
              category: p.category || 'Projet Clé en Main',
              image: galleryImgs[0] || p.imageUrl || '/project-hotel.png',
              description: p.description || '',
              details: p.details ? p.details.split(',').map(d => d.trim()).filter(Boolean) : ["Aménagement d'artisanat d'art"],
              gallery: galleryImgs,
              video: p.videoUrl || p.video || '',
              review: null
            }
          })
          setLiveProjects(mapped)
        }
      } catch (err) {
        console.error('Error fetching dynamic projects:', err)
      }
    }
    fetchProjects()
  }, [])

  // Compteurs dynamiques par catégorie
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: liveProjects.length }
    liveProjects.forEach((p) => {
      const norm = normalizeCategory(p.type || p.category)
      counts[norm] = (counts[norm] || 0) + 1
    })
    return counts
  }, [liveProjects])

  // Projets filtrés
  const filteredProjects = useMemo(() => {
    if (filter === 'all') return liveProjects
    return liveProjects.filter(project => {
      const norm = normalizeCategory(project.type || project.category)
      return norm === filter
    })
  }, [liveProjects, filter])

  const handleOpenProject = (project: any) => {
    setSelectedProject(project)
  }

  const handleCloseProject = () => {
    setSelectedProject(null)
    setLightboxProject(null)
  }

  const handleSelectSimilarQuote = () => {
    handleCloseProject()
    setTimeout(() => {
      document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  // Auto-open project if specified in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('projectId')
    if (projectId) {
      const proj = liveProjects.find(p => p.id === parseInt(projectId))
      if (proj) {
        handleOpenProject(proj)
      }
    }
  }, [liveProjects])

  // Prevent background scroll when modal or lightbox is open
  useEffect(() => {
    if (selectedProject || lightboxProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProject, lightboxProject])

  return (
    <main className="min-h-screen flex flex-col relative text-[#F7F4EE] overflow-hidden bg-[#241812]">
      {/* 🌟 Fond d'ambiance noble défilant */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-espace-exception.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-7xl mx-auto w-full">

          {/* En-tête de la page */}
          <div className="text-center mb-8 sm:mb-12 max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] mb-4 font-bold shadow-md">
                <Briefcase className="size-3.5 text-[#E6A635]" />
                <span>Projets Clés en Main • Espaces d&apos;Exception</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.08] text-gold-gradient mb-4 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight">
                Projets Clés en Main
                <span className="font-serif italic text-white font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl block mt-1 opacity-90">
                  L&apos;Art de l&apos;Aménagement d&apos;Exception
                </span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed text-pretty font-light drop-shadow-md max-w-2xl mx-auto">
                De l&apos;étude technique et la conception sur-mesure à l&apos;installation finale sur site : nous orchestrons l&apos;habillage monumental complet en menuiserie d&apos;art pour les palaces, hôtels 5★, restaurants et demeures de prestige.
              </p>
            </Reveal>
          </div>

          {/* Barre de Filtres avec Compteurs Dynamiques */}
          <Reveal delay={100} className="w-full mb-10 sm:mb-14">
            <div className="relative max-w-5xl mx-auto">
              <div className="flex justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-1.5 sm:gap-2 p-1.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl shrink-0 shadow-xl">
                  {FILTER_TYPES.map((type) => {
                    const Icon = type.icon
                    const count = categoryCounts[type.id] ?? 0
                    const isActive = filter === type.id
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFilter(type.id)}
                        className={`relative inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer whitespace-nowrap z-10 ${
                          isActive
                            ? 'text-[#1A110B]'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeFilterPillTurnkey"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] shadow-[0_4px_16px_rgba(230,166,53,0.4)] -z-10"
                          />
                        )}
                        {Icon && <Icon className={`size-3 sm:size-3.5 shrink-0 ${isActive ? 'text-[#1A110B]' : 'text-[#E6A635]'}`} />}
                        <span>{type.label}</span>
                        <span
                          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isActive
                              ? 'bg-[#1A110B]/20 text-[#1A110B]'
                              : 'bg-[#241812] text-[#F2BD52] border border-[#E6A635]/30'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Grille des Réalisations */}
          <div className="w-full mb-20 sm:mb-28">
            <AnimatePresence mode="wait">
              {filteredProjects.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-white/50 text-sm bg-[#241812]/80 rounded-3xl border border-[#E6A635]/25 p-8 max-w-xl mx-auto"
                >
                  <p className="text-base text-white/80 mb-2 font-medium">Aucune réalisation trouvée pour cette catégorie.</p>
                  <p className="text-xs text-white/50 mb-5">Notre atelier façonne régulièrement des pièces sur-mesure pour ce type d&apos;espace.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormEspace(filter)
                      document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="btn-sheen inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Lancer une étude sur-mesure</span>
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                    >
                      <TurnkeyProjectCard
                        project={project}
                        onOpen={handleOpenProject}
                        filterTypes={FILTER_TYPES}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Formulaire Intelligent de Demande de Projet Clé en Main */}
          <Reveal delay={200} className="w-full">
            <div id="demande-projet" className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E6A635]/40 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              {/* Form Header */}
              <div className="bg-gradient-to-br from-[#3B271C] to-[#241812] px-6 sm:px-8 md:px-12 py-8 sm:py-10 text-center relative overflow-hidden border-b border-[#E6A635]/25">
                <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-[#E6A635]/8 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-[#C78318]/8 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/35 text-[#F2BD52] text-[10px] sm:text-xs uppercase tracking-[0.18em] mb-4 font-bold">
                    <Sparkles className="size-3.5 text-[#E6A635] animate-pulse" /> Parlez-nous de votre projet
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-gold-gradient mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Donnez vie à votre espace d&apos;exception
                  </h2>
                  <p className="text-white/65 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-light">
                    Ismail se déplace chez vous pour une consultation gratuite. Remplissez le formulaire ci-dessous et recevez une proposition sur-mesure sous 48h.
                  </p>
                </div>
              </div>
              {/* Form Body */}
              <div className="bg-gradient-to-b from-[#2A1C14] to-[#241812] px-6 sm:px-8 md:px-12 py-8 sm:py-10">
                <ProjectRequestForm preselectedEspace={formEspace} />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Modal Immersif du Projet */}
        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={handleCloseProject}
            onOpenLightbox={(data) => setLightboxProject(data)}
            onSelectSimilarQuote={handleSelectSimilarQuote}
            filterTypes={FILTER_TYPES}
          />
        )}

        {/* Lightbox / Zoom Plein Écran */}
        <ProjectLightbox
          lightbox={lightboxProject}
          onClose={() => setLightboxProject(null)}
          onNavigate={(idx) => setLightboxProject(prev => prev ? { ...prev, currentIndex: idx } : null)}
        />

        <MobileFloatingVIP />
        <Footer />
      </div>
    </main>
  )
}
