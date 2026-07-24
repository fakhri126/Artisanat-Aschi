'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { Reveal } from './reveal'
import { publicApi, Project } from '@/lib/api'

const MOCK_PROJECTS = [
  {
    title: 'Villa privée — Gammarth',
    category: 'Villas',
    imageUrl: '/project-villa.png',
    span: 'lg:col-span-2 lg:row-span-2',
    description: "Boiseries sur-mesure, portes sculptées et mobilier intégré pour une demeure d'exception en bord de mer.",
  },
  {
    title: 'Hôtel de charme — Tunis',
    category: 'Hôtels',
    imageUrl: '/project-hotel.png',
    span: '',
    description: 'Habillage du hall et claustras décoratifs.',
  },
  {
    title: 'Restaurant gastronomique — Sidi Bou Saïd',
    category: 'Restaurants',
    imageUrl: '/project-restaurant.png',
    span: '',
    description: 'Cloisons sculptées et ambiance chaleureuse.',
  },
  {
    title: "Maison d'hôtes — Hammamet",
    category: "Maisons d'hôtes",
    imageUrl: '/project-guesthouse.png',
    span: 'lg:col-span-2',
    description: 'Portes traditionnelles et mobilier de patio pour un dar authentique.',
  },
]

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await publicApi.getProjects()
        setProjects(data)
      } catch (err) {
        console.error('Error fetching projects from API, using fallback data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  // Map dynamic spans or fallbacks
  const displayProjects = projects.length > 0 
    ? projects.map((p, idx) => ({
        ...p,
        span: idx === 0 ? 'lg:col-span-2 lg:row-span-2' : idx === 3 ? 'lg:col-span-2' : ''
      }))
    : MOCK_PROJECTS

  return (
    <section id="realisations" className="bg-secondary py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="text-left">
            <p className="text-xs uppercase tracking-luxury text-bronze">
              Projets & réalisations
            </p>
            <h2 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
              Des lieux d&apos;exception signés Aschi
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-base font-light leading-relaxed text-muted-foreground text-left">
            Villas, maisons d&apos;hôtes, hôtels, restaurants et résidences
            privées : nous façonnons des décors qui traversent le temps.
          </p>
        </Reveal>

        <div className="mt-14 grid auto-rows-[16rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayProjects.map((p, i) => {
            const title = p.title
            const category = 'category' in p ? p.category : (p as any).category
            const image = 'imageUrl' in p ? p.imageUrl : (p as any).imageUrl
            const desc = p.description
            const span = (p as any).span || ''

            return (
              <Reveal
                key={title}
                delay={(i % 2) * 120}
                className={`group relative overflow-hidden ${span} cursor-pointer`}
              >
                <div 
                  className="w-full h-full"
                  onClick={() => setSelectedProject(p)}
                >
                  {image?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video
                      src={image}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={image || '/placeholder.svg'}
                      alt={title}
                      className="size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut/90 via-walnut/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-ivory text-left">
                    <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gold font-semibold">
                      {category}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-medium leading-tight md:text-3xl">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm font-light text-ivory/0 transition-all duration-500 group-hover:text-ivory/80">
                      {desc}
                    </p>
                  </div>
                  <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-ivory/40 text-ivory opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-stone-800"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-colors"
              >
                <X className="size-6" />
              </button>

              <div className="w-full md:w-2/3 h-[40vh] md:h-auto bg-stone-900 relative">
                {(() => {
                  const image = 'imageUrl' in selectedProject ? selectedProject.imageUrl : selectedProject.imageUrl;
                  if (image?.match(/\.(mp4|webm|ogg|mov)$/i)) {
                    return (
                      <video
                        src={image}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    );
                  }
                  return (
                    <img
                      src={image || '/placeholder.svg'}
                      alt={selectedProject.title}
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
              </div>
              
              <div className="w-full md:w-1/3 p-8 flex flex-col justify-center bg-stone-950 border-l border-stone-800 overflow-y-auto">
                <span className="text-xs uppercase tracking-[0.2em] text-gold mb-2 block font-semibold">
                  {'category' in selectedProject ? selectedProject.category : selectedProject.category}
                </span>
                <h2 className="font-heading text-3xl text-white mb-6">
                  {selectedProject.title}
                </h2>
                <p className="text-stone-400 font-light leading-relaxed">
                  {selectedProject.description}
                </p>
                <div className="mt-8 pt-8 border-t border-stone-800">
                  <p className="text-xs text-stone-500 uppercase tracking-widest text-center">Artisanat Aschi</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
