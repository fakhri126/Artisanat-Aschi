'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Building, Hotel, UtensilsCrossed, Sparkles, MapPin, ChevronRight, X, Play, Star, MessageSquare } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'

const FILTER_TYPES = [
  { id: 'all', label: 'Tous les espaces', icon: null },
  { id: 'hotel', label: 'Hôtels', icon: Hotel },
  { id: 'guesthouse', label: 'Maisons d\'Hôtes', icon: Sparkles },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'entreprise', label: 'Entreprises', icon: Building }
]

const PROJECTS = [
  {
    id: 1,
    title: 'Hôtel Dar El Jeld',
    location: 'Médina de Tunis',
    type: 'hotel',
    image: '/project-hotel.png',
    description: 'Aménagement monumental complet de l\'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques d\'inspiration andalouse, et mobilier de salon d\'exception.',
    details: ['Portes monumentales', 'Boiseries d\'art', 'Salons de réception', 'Luminaires'],
    gallery: ['/project-hotel.png', '/gallery-1.png', '/gallery-2.png', '/porte.png'],
    video: '/Video.mp4',
    review: {
      author: 'M. Habib',
      role: 'Directeur Général, Dar El Jeld',
      rating: 5,
      comment: 'L\'Atelier Aschi a su capturer l\'essence historique de notre hôtel. Les portes sculptées sont devenues de véritables attractions pour nos clients. Un travail d\'ébénisterie d\'art d\'une précision chirurgicale.'
    }
  },
  {
    id: 2,
    title: 'Maison d\'Hôtes Dar Said',
    location: 'Sidi Bou Saïd',
    type: 'guesthouse',
    image: '/project-guesthouse.png',
    description: 'Conception sur-mesure d\'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés, commodes incrustées de laiton poli et cadres de miroirs dorés à la feuille d\'or.',
    details: ['Mobilier de chambre', 'Miroirs sculptés', 'Incrustations laiton', 'Consoles'],
    gallery: ['/project-guesthouse.png', '/gallery-3.png', '/gallery-4.png', '/miroir.png'],
    video: '/test-video.mp4',
    review: {
      author: 'Mme Amel',
      role: 'Fondatrice, Dar Said',
      rating: 5,
      comment: 'Un raffinement exceptionnel. Le mobilier en olivier et les cadres dorés apportent une chaleur et une authenticité inégalées à nos suites de prestige. La finition est irréprochable.'
    }
  },
  {
    id: 3,
    title: 'Restaurant La Falaise',
    location: 'La Marsa',
    type: 'restaurant',
    image: '/project-restaurant.png',
    description: 'Conception globale de l\'espace bar et de la salle de repas. Comptoir de bar sculpté dans un tronc de chêne massif, tables marquetées et luminaires d\'ambiance ajourés.',
    details: ['Comptoir de bar d\'art', 'Tables de repas', 'Luminaires ajourés', 'Panneaux décoratifs'],
    gallery: ['/project-restaurant.png', '/gallery-5.png', '/gallery-6.png', '/buffet.png'],
    video: '/Video.mp4',
    review: {
      author: 'Chef Slim',
      role: 'Propriétaire, La Falaise',
      rating: 5,
      comment: 'Le bar sculpté est la pièce maîtresse de notre salle. Nos clients sont impressionnés par les détails de sculpture géométrique. Livraison et pose impeccables dans les délais.'
    }
  },
  {
    id: 4,
    title: 'Bureaux Corporate L\'Ébène',
    location: 'Les Berges du Lac, Tunis',
    type: 'entreprise',
    image: '/project-villa.png',
    description: 'Aménagement prestigieux de la salle du conseil d\'administration et des bureaux de direction. Table de réunion de 6 mètres de long en chêne d\'un seul tenant, et habillage acoustique sculpté.',
    details: ['Table de conférence', 'Habillages acoustiques', 'Bureaux de direction', 'Portes de bureaux'],
    gallery: ['/project-villa.png', '/creation-model.png', '/creation-unique.png'],
    video: '/test-video.mp4',
    review: {
      author: 'M. Adel',
      role: 'CEO, L\'Ébène',
      rating: 5,
      comment: 'La table de conférence monumentale a transformé notre salle du conseil. C\'est une pièce de caractère qui impose le respect. Le service sur-mesure de l\'Atelier Aschi est parfait pour les professionnels.'
    }
  }
]

export default function TurnkeyProjectsPage() {
  const [filter, setFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const filteredProjects = filter === 'all' 
    ? PROJECTS 
    : PROJECTS.filter(project => project.type === filter)

  const handleOpenProject = (project: typeof PROJECTS[0]) => {
    setSelectedProject(project)
    setActiveImageIdx(0)
    setIsPlaying(false)
  }

  const handleCloseProject = () => {
    setSelectedProject(null)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Prevent scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProject])

  return (
    <main className="min-h-screen flex flex-col bg-walnut text-ivory">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-[0.2em] mb-4">
            <Briefcase className="size-3.5" /> Espaces d&apos;Exception
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Espaces d&apos;Exception
          </h1>
          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed text-pretty font-light">
            De l&apos;étude de plans à l&apos;installation finale, l&apos;Atelier Aschi prend en charge l&apos;habillage complet en menuiserie d&apos;art et le mobilier pour les hôtels, restaurants, maisons d&apos;hôtes de prestige et espaces de direction d&apos;entreprises.
          </p>
        </div>

        {/* Filter Bar */}
        <Reveal delay={100} className="w-full flex justify-center mb-16 overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-2 p-1.5 rounded-full bg-stone-950/40 border border-gold/15 backdrop-blur-md shrink-0">
            {FILTER_TYPES.map((type) => {
              const Icon = type.icon
              const isActive = filter === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setFilter(type.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gold text-walnut shadow-[0_4px_12px_rgba(212,175,55,0.2)]'
                      : 'text-ivory/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {type.label}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* Projects List/Gallery */}
        <div className="w-full flex flex-col gap-16 mb-24">
          <AnimatePresence mode="wait">
            {filteredProjects.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-ivory/50"
              >
                Aucune réalisation trouvée pour cette catégorie.
              </motion.div>
            ) : (
              <div className="grid gap-12 lg:gap-16">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
                    onClick={() => handleOpenProject(project)}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-stone-950/20 rounded-3xl p-6 md:p-8 border border-gold/10 hover:border-gold/30 hover:bg-stone-950/30 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Visual image */}
                    <div className="relative w-full lg:w-[45%] aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gold/15 shrink-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                      {/* Click overlay prompt */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-gold text-walnut text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                          <MessageSquare className="size-4" /> Explorer l&apos;espace
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col justify-between items-start text-left flex-1 py-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
                          <MapPin className="size-3.5 text-gold/80" />
                          {project.location}
                        </div>
                        
                        <h3 className="font-heading text-3xl sm:text-4xl text-white font-medium leading-tight group-hover:text-gold transition-colors duration-300">
                          {project.title}
                        </h3>
                        
                        <p className="text-sm font-light leading-relaxed text-ivory/70 text-pretty">
                          {project.description}
                        </p>
                      </div>

                      {/* Technical/Artisanal Details Tag pills */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.details.map((detail, idx) => (
                          <span
                            key={idx}
                            className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-ivory/80 font-medium"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Section: Démarrer votre projet */}
        <Reveal delay={200} className="w-full">
          <div className="w-full bg-gradient-to-b from-stone-950 to-stone-950/60 border border-gold/25 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Background design */}
            <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-[0.2em] mb-6">
              <Sparkles className="size-3.5" /> Projet de Grande Envergure
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white mb-6 max-w-2xl leading-tight">
              Donnez vie à vos espaces d&apos;exception
            </h2>
            
            <p className="text-ivory/60 text-sm sm:text-base font-light leading-relaxed max-w-xl mb-10 text-pretty">
              Architectes, décorateurs d&apos;intérieur ou propriétaires, confiez-nous vos plans et exigences. Notre bureau d&apos;étude et nos artisans sauront façonner l&apos;excellence.
            </p>

            <Link
              href="/contact?subject=espaces-exception"
              className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4.5 text-xs font-semibold uppercase tracking-[0.2em] text-walnut transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.35)]"
            >
              Démarrer votre projet
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Immersive Overlay Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            onClick={handleCloseProject}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-stone-900 border border-gold/30 rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseProject}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-stone-950/60 border border-gold/25 text-gold hover:bg-gold hover:text-walnut transition-colors"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>

              {/* LEFT COLUMN: Media (Gallery & Video) */}
              <div className="w-full md:w-[55%] flex flex-col border-b md:border-b-0 md:border-r border-gold/15 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* Main Large Image Display */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-gold/10 bg-stone-950">
                  <Image
                    src={selectedProject.gallery[activeImageIdx]}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails list */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {selectedProject.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 aspect-[16/10] rounded-lg overflow-hidden border shrink-0 transition-all ${
                        activeImageIdx === idx ? 'border-gold scale-95 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt="Miniature"
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Video Player */}
                {selectedProject.video && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest text-gold font-semibold text-left">Aperçu Vidéo de l&apos;Atelier</h4>
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold/15 bg-stone-950 shadow-inner group/video">
                      <video
                        ref={videoRef}
                        src={selectedProject.video}
                        loop
                        muted
                        playsInline
                        className="size-full object-cover"
                      />
                      {/* Play/Pause custom overlay */}
                      <div 
                        onClick={togglePlay}
                        className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer group-hover/video:bg-black/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gold/90 text-walnut flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                          {isPlaying ? (
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-walnut rounded-full" />
                              <div className="w-1 h-4 bg-walnut rounded-full" />
                            </div>
                          ) : (
                            <Play className="size-5 fill-current ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Project Details, Client Review & CTA */}
              <div className="w-full md:w-[45%] flex flex-col justify-between overflow-y-auto p-6 md:p-8 space-y-6 text-left scrollbar-thin">
                
                {/* Meta details */}
                <div className="space-y-4">
                  <span className="inline-block bg-gold/15 border border-gold/25 text-gold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold">
                    {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || selectedProject.type}
                  </span>
                  
                  <h3 className="font-heading text-3xl text-white font-medium">
                    {selectedProject.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gold/80">
                    <MapPin className="size-3.5" />
                    {selectedProject.location}
                  </div>

                  <p className="text-sm text-ivory/80 font-light leading-relaxed pt-2">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Testimonial Box */}
                {selectedProject.review && (
                  <div className="bg-white/5 border border-gold/15 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex gap-1">
                      {[...Array(selectedProject.review.rating)].map((_, i) => (
                        <Star key={i} className="size-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    
                    <p className="text-xs text-ivory/70 italic leading-relaxed">
                      &quot;{selectedProject.review.comment}&quot;
                    </p>
                    
                    <div className="border-t border-white/10 pt-2 flex flex-col">
                      <span className="text-xs font-semibold text-white">{selectedProject.review.author}</span>
                      <span className="text-[10px] text-ivory/50">{selectedProject.review.role}</span>
                    </div>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={`/contact?subject=similaire-${selectedProject.title.replace(/\s+/g, '-').toLowerCase()}`}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-gold px-6 py-4.5 text-xs font-semibold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
                  >
                    Demander un projet similaire
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
