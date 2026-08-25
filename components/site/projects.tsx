'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Sparkles, X, FileText, CheckCircle2, MapPin, Calendar, Compass } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Reveal } from './reveal'

export interface ProjectItem {
  id: number
  title: string
  category: string
  imageUrl: string
  span?: string
  description: string
  location?: string
  materials?: string
  year?: string
}

const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: 'Hôtel Dar El Jeld',
    category: 'Palaces & Hôtels 5★',
    imageUrl: '/project-hotel.png',
    span: 'lg:col-span-2 lg:row-span-2',
    description: "Aménagement monumental complet de l'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques d'inspiration andalouse, et mobilier de salon d'exception.",
    location: 'Médina de Tunis',
    materials: 'Noyer massif séché, laiton forgé & céramiques',
    year: '2023'
  },
  {
    id: 2,
    title: "Maison d'Hôtes Dar Said",
    category: "Demeures & Suites de Prestige",
    imageUrl: '/project-guesthouse.png',
    span: '',
    description: "Conception sur-mesure d'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés, commodes incrustées de laiton poli et cadres de miroirs dorés à la feuille d'or.",
    location: 'Sidi Bou Saïd',
    materials: 'Bois noble, dorure à la feuille & fer forgé',
    year: '2024'
  },
  {
    id: 3,
    title: 'Restaurant La Falaise',
    category: 'Espaces Gastronomiques',
    imageUrl: '/project-restaurant.png',
    span: '',
    description: "Conception globale de l'espace bar et de la salle de repas. Comptoir de bar sculpté dans un tronc de chêne massif, tables marquetées et luminaires d'ambiance ajourés.",
    location: 'Gammarth',
    materials: 'Chêne massif, marbre & ferrures d\'art',
    year: '2023'
  },
  {
    id: 4,
    title: "Bureaux Corporate L'Ébène",
    category: "Sièges & Salons d'Honneur",
    imageUrl: '/project-villa.png',
    span: 'lg:col-span-2',
    description: "Aménagement prestigieux de la salle du conseil d'administration et des bureaux de direction. Table de réunion monumentale en chêne d'un seul tenant et habillage acoustique sculpté.",
    location: 'Les Berges du Lac',
    materials: 'Noyer noble, cuir naturel & boiserie acoustique',
    year: '2024'
  },
]

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section id="realisations" className="relative overflow-hidden bg-transparent py-10 sm:py-16 lg:py-22 border-none scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header (Harmonisé & Centré) */}
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

        {/* Mobile Swipe Cue */}
        <div className="flex sm:hidden items-center justify-end gap-1.5 text-[10.5px] text-[#F2BD52] mb-3 px-1">
          <span>Glisser pour explorer</span>
          <ChevronRight className="size-3.5 animate-pulse" />
        </div>

        {/* Projects Grid / Mobile Horizontal Swipe Snap */}
        <div 
          ref={scrollRef}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 sm:auto-rows-[17rem] overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0 no-scrollbar"
        >
          {MOCK_PROJECTS.map((p) => {
            const span = p.span || ''

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer shrink-0 w-[85vw] sm:w-auto snap-center sm:snap-align-none ${span}`}
                onClick={() => setSelectedProject(p)}
              >
                <div 
                  className="w-full h-full min-h-[19rem] sm:min-h-[17rem] relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-[#E6A635]/40 bg-[#3B271C]/90 backdrop-blur-md transition-all duration-500 hover:border-[#E6A635]/85 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] group-hover:-translate-y-1"
                >
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 50vw"
                    className="size-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                  
                  {/* Vignette Sombre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-[#1A110B]/40 to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-90" />
                  
                  {/* Location & Year Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between">
                    {p.location && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-semibold shadow-md">
                        <MapPin className="size-3 text-[#E6A635]" />
                        <span>{p.location}</span>
                      </div>
                    )}
                    
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#3B271C]/90 backdrop-blur-xl border border-[#E6A635]/40 text-[#F2BD52] shadow-md transition-all duration-300 group-hover:bg-[#E6A635] group-hover:text-[#1A110B] group-hover:rotate-45">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white text-left overflow-hidden z-10">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#F2BD52] font-bold drop-shadow-md mb-1">
                      {p.category}
                    </span>
                    
                    <h3 className="font-heading text-xl sm:text-2xl font-normal leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-white group-hover:text-[#F2BD52] transition-colors mb-1.5">
                      {p.title}
                    </h3>
                    
                    <p className="text-xs text-white/90 drop-shadow font-normal line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
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
            <span>Étude Personnalisée &amp; Plans 3D sous 24h</span>
            <span className="text-[#F2BD52]/60 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Fabrication Artisanale &amp; Pose Clé en Main</span>
          </div>
        </Reveal>

      </div>

      {/* Project Detail Modal */}
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

              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-[#E6A635]/40 mb-4 bg-black">
                <Image
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/90 via-transparent to-transparent" />
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#241812]/90 border border-[#E6A635]/35 mb-6 text-left">
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/espaces-d-exception#demande-projet"
                  className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02]"
                >
                  <FileText className="size-3.5 text-[#1A110B]" />
                  <span>Demander une Étude Similaire</span>
                </Link>
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center justify-center rounded-full border border-[#E6A635]/40 bg-[#241812]/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#3B271C] hover:text-[#F2BD52] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
