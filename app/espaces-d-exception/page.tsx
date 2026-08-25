'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Building, Hotel, UtensilsCrossed, Sparkles, MapPin, ChevronRight, X, Play, Star, MessageSquare, Home, Lamp, DoorOpen, Sofa, Palette, CheckCircle2, Send, Phone, Mail, User, ChevronDown } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi } from '@/lib/api'

const FILTER_TYPES = [
  { id: 'all', label: 'Tous les espaces', icon: null },
  { id: 'hotel', label: 'Hôtels', icon: Hotel },
  { id: 'guesthouse', label: 'Maisons d\'Hôtes', icon: Sparkles },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'entreprise', label: 'Entreprises', icon: Building }
]

const ESPACE_TYPES = [
  { id: 'villa', label: 'Résidence Privée', icon: Home, desc: 'Villa, appartement, maison...' },
  { id: 'hotel', label: 'Hôtel & Riad', icon: Hotel, desc: 'Établissement hôtelier de prestige...' },
  { id: 'restaurant', label: 'Restaurant & Café', icon: UtensilsCrossed, desc: 'Espace de restauration...' },
  { id: 'entreprise', label: 'Entreprise & Bureau', icon: Building, desc: 'Espace corporate, siège social...' },
]

const TRAVAUX_TYPES = [
  { id: 'portes', label: 'Portes & Boiseries', icon: DoorOpen },
  { id: 'mobilier', label: 'Mobilier sur mesure', icon: Sofa },
  { id: 'luminaires', label: 'Luminaires artisanaux', icon: Lamp },
  { id: 'sculptures', label: 'Sculptures & Décoration', icon: Palette },
  { id: 'complet', label: 'Aménagement complet clé en main', icon: Sparkles },
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

// --- Smart Project Form Component ---
function ProjectRequestForm() {
  const [step, setStep] = useState(1)
  const [selectedEspace, setSelectedEspace] = useState('')
  const [selectedTravaux, setSelectedTravaux] = useState<string[]>([])
  const [ville, setVille] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const toggleTravail = (id: string) => {
    setSelectedTravaux(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !email) {
      setError('Veuillez remplir tous vos coordonnées.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const espaceLabel = ESPACE_TYPES.find(e => e.id === selectedEspace)?.label || selectedEspace
      const travauxLabels = selectedTravaux.map(t => TRAVAUX_TYPES.find(tt => tt.id === t)?.label).join(', ')
      const personalizationDetails = `[ESPACE_EXCEPTION] | Type d'espace: ${espaceLabel} | Ville: ${ville} | Travaux souhaités: ${travauxLabels}`
      const message = projectDesc || 'Demande de projet clé en main via la page Espaces d\'Exception.'

      await publicApi.submitQuoteRequest({
        fullName,
        phoneNumber: phone,
        email,
        personalizationDetails,
        message,
      })
      setSubmitted(true)
    } catch (err: any) {
      setError('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-[#C17D59]/20 border-2 border-[#C17D59] flex items-center justify-center">
          <CheckCircle2 className="size-10 text-[#C17D59]" />
        </div>
        <div>
          <h3 className="font-heading text-3xl text-stone-900 mb-3">Demande envoyée !</h3>
          <p className="text-stone-600 text-base leading-relaxed max-w-md">
            Ismail et son équipe vont étudier votre projet et vous contacteront sous <strong>24-48h</strong> pour une première consultation.
          </p>
        </div>
        <a href="tel:+21655743760" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C17D59] text-white text-sm font-semibold hover:bg-[#C17D59]/90 transition-colors">
          <Phone className="size-4" /> Appel immédiat : +216 55 743 760
        </a>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* STEP 1 — Type d'espace */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#C17D59] text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
          <h3 className="text-stone-800 font-semibold text-base uppercase tracking-wider">Quel est votre type d'espace ?</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ESPACE_TYPES.map(({ id, label, icon: Icon, desc }) => {
            const isActive = selectedEspace === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEspace(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#C17D59] bg-[#C17D59]/10 shadow-md'
                    : 'border-stone-200 bg-white hover:border-[#C17D59]/40 hover:bg-[#C17D59]/5'
                }`}
              >
                <Icon className={`size-7 ${isActive ? 'text-[#C17D59]' : 'text-stone-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider leading-tight ${isActive ? 'text-[#C17D59]' : 'text-stone-600'}`}>{label}</span>
                <span className="text-[10px] text-stone-400 leading-tight hidden md:block">{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 2 — Types de travaux */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#C17D59] text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
          <h3 className="text-stone-800 font-semibold text-base uppercase tracking-wider">Quels travaux souhaitez-vous ?</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {TRAVAUX_TYPES.map(({ id, label, icon: Icon }) => {
            const isActive = selectedTravaux.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleTravail(id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#C17D59] bg-[#C17D59] text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-[#C17D59]/50'
                }`}
              >
                <Icon className="size-4" />
                {label}
                {isActive && <CheckCircle2 className="size-4" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 3 — Votre espace */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#C17D59] text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
          <h3 className="text-stone-800 font-semibold text-base uppercase tracking-wider">Décrivez votre projet</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">Ville / Région</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                placeholder="Ex: Tunis, Hammamet, Sfax..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:border-[#C17D59] transition-colors"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">Description de votre projet (optionnel)</label>
            <textarea
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              rows={3}
              placeholder="Décrivez votre vision, vos goûts, la surface à aménager..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:border-[#C17D59] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* STEP 4 — Coordonnées */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-[#C17D59] text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
          <h3 className="text-stone-800 font-semibold text-base uppercase tracking-wider">Vos coordonnées</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nom complet"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:border-[#C17D59] transition-colors"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:border-[#C17D59] transition-colors"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:border-[#C17D59] transition-colors"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-[#C17D59] text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-[#a86948] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer ma demande de projet'}
          <Send className="size-4" />
        </button>
        <p className="text-xs text-stone-400 mt-3">Réponse garantie sous 24-48h par Ismail et son équipe.</p>
      </div>
    </form>
  )
}

// --- Main Page ---
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

  // Auto-open project if specified in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('projectId')
    if (projectId) {
      const proj = PROJECTS.find(p => p.id === parseInt(projectId))
      if (proj) {
        handleOpenProject(proj)
      }
    }
  }, [])

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
    <main className="min-h-screen flex flex-col relative text-[#F7F4EE] overflow-hidden bg-[#241812]">
      {/* Unified Background */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-espace-exception.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />
      
      {/* Amber Glow Halos */}
      <div className="absolute top-1/4 left-1/4 size-[450px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="text-center mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] uppercase tracking-[0.2em] mb-3.5 font-bold shadow-md">
              <Briefcase className="size-3.5 text-[#E6A635]" />
              <span>Projets Clés en Main • Espaces d&apos;Exception</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gold-gradient mb-3 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Projets Clés en Main
            </h1>
            <p className="text-[#EAE4D9]/90 text-xs sm:text-sm md:text-base leading-relaxed text-pretty font-light drop-shadow-md">
              De l&apos;étude technique et la modélisation 3D à l&apos;installation finale sur site : nous orchestrons l&apos;habillage monumental complet en menuiserie d&apos;art et le mobilier pour les palaces, hôtels 5★, restaurants et demeures de prestige.
            </p>
          </div>
          
        {/* Filter Bar */}
        <Reveal delay={100} className="w-full flex justify-center mb-10 overflow-x-auto pb-3 scrollbar-thin">
          <div className="flex gap-2 p-1.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-md shrink-0 shadow-lg">
            {FILTER_TYPES.map((type) => {
              const Icon = type.icon
              const isActive = filter === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setFilter(type.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold shadow-[0_0_15px_rgba(230,166,53,0.35)] scale-105'
                      : 'text-[#EAE4D9]/80 hover:text-white hover:bg-white/10'
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
                className="text-center py-16 text-[#3A2A21]/50"
              >
                Aucune réalisation trouvée pour cette catégorie.
              </motion.div>
            ) : (
              <div className="grid gap-8 lg:gap-10">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.08 }}
                    onClick={() => handleOpenProject(project)}
                    className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center bg-[#3B271C]/90 rounded-3xl p-5 sm:p-7 md:p-8 border border-[#E6A635]/35 hover:border-[#E6A635]/80 hover:bg-[#452E21]/95 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.65)] transition-all duration-300 cursor-pointer group"
                  >
                    {/* Visual image */}
                    <div className="relative w-full lg:w-[45%] aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-[#E6A635]/30 shrink-0 bg-[#241812]">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#241812]/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="btn-sheen bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                          <MessageSquare className="size-4" /> Voir le projet
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col justify-between items-start text-left flex-1 py-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#F2BD52] font-semibold">
                          <MapPin className="size-3.5 text-[#E6A635]" />
                          {project.location}
                        </div>
                        {/* Type badge */}
                        <span className="inline-block text-[9.5px] uppercase tracking-wider bg-[#241812]/90 border border-[#E6A635]/40 text-[#F2BD52] font-bold px-3 py-1 rounded-full">
                          {FILTER_TYPES.find(t => t.id === project.type)?.label || project.type}
                        </span>

                        <h3 className="font-heading text-2xl sm:text-3xl text-[#F7F4EE] font-light leading-tight group-hover:text-[#F2BD52] transition-colors duration-300">
                          {project.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-light leading-relaxed text-[#EAE4D9]/90 text-pretty">
                          {project.description}
                        </p>
                      </div>

                      {/* Works Done pills */}
                      <div className="mt-4">
                        <p className="text-[9.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-2">Aménagements réalisés :</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.details.map((detail, idx) => (
                            <span
                              key={idx}
                              className="bg-[#241812]/90 border border-[#E6A635]/25 px-2.5 py-0.5 rounded-md text-[10.5px] text-[#EAE4D9] font-light"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mini client review */}
                      {project.review && (
                        <div className="mt-5 flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                          <div className="shrink-0">
                            <div className="flex gap-0.5">
                              {[...Array(project.review.rating)].map((_, i) => (
                                <Star key={i} className="size-3 fill-[#C17D59] text-[#C17D59]" />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#3A2A21]/60 italic leading-relaxed line-clamp-2">
                              &quot;{project.review.comment}&quot;
                            </p>
                            <p className="text-[10px] text-[#C17D59] font-semibold mt-1">{project.review.author} — {project.review.role}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SMART PROJECT REQUEST FORM SECTION */}
        <Reveal delay={200} className="w-full">
          <div id="demande-projet" className="w-full bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-stone-900 px-8 md:px-12 py-10 text-center relative overflow-hidden">
              <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-[#C17D59]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-[#C17D59]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17D59]/20 border border-[#C17D59]/30 text-[#C17D59] text-xs uppercase tracking-[0.2em] mb-4">
                  <Sparkles className="size-3.5" /> Parlez-nous de votre projet
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl text-white mb-3">
                  Donnez vie à votre espace d&apos;exception
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed max-w-xl mx-auto font-light">
                  Ismail se déplace chez vous pour une consultation gratuite. Remplissez le formulaire ci-dessous et recevez une proposition sur-mesure sous 48h.
                </p>
              </div>
            </div>
            {/* Form Body */}
            <div className="px-8 md:px-12 py-10">
              <ProjectRequestForm />
            </div>
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
            className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            onClick={handleCloseProject}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-stone-900 border border-[#E8DCCB]/30 rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseProject}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-stone-950/60 border border-[#E8DCCB]/25 text-[#C17D59] hover:bg-[#E8DCCB] hover:text-walnut transition-colors"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>

              {/* LEFT COLUMN: Media */}
              <div className="w-full md:w-[55%] flex flex-col border-b md:border-b-0 md:border-r border-[#E8DCCB]/15 overflow-y-auto p-6 space-y-6 scrollbar-thin">

                {/* Main Large Image */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#E8DCCB]/10 bg-stone-950">
                  <Image
                    src={selectedProject.gallery[activeImageIdx]}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {selectedProject.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 aspect-[16/10] rounded-lg overflow-hidden border shrink-0 transition-all ${
                        activeImageIdx === idx ? 'border-[#E8DCCB] scale-95 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="Miniature" fill className="object-cover" />
                    </button>
                  ))}
                </div>

                {/* Video Player */}
                {selectedProject.video && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C17D59] font-semibold text-left">Aperçu Vidéo de l&apos;Atelier</h4>
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#E8DCCB]/15 bg-stone-950 shadow-inner group/video">
                      <video
                        ref={videoRef}
                        src={selectedProject.video}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div
                        onClick={togglePlay}
                        className="absolute inset-0 bg-white/35 flex items-center justify-center cursor-pointer group-hover/video:bg-white/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#E8DCCB]/90 text-walnut flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                          {isPlaying ? (
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-[#FAF7F2] rounded-full" />
                              <div className="w-1 h-4 bg-[#FAF7F2] rounded-full" />
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

              {/* RIGHT COLUMN: Details, Review, CTA */}
              <div className="w-full md:w-[45%] flex flex-col justify-between overflow-y-auto p-6 md:p-8 space-y-6 text-left scrollbar-thin">

                {/* Meta */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-[#C17D59] text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                      {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || selectedProject.type}
                    </span>
                  </div>

                  <h3 className="font-heading text-3xl text-white font-medium">
                    {selectedProject.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#C17D59]/80">
                    <MapPin className="size-3.5" />
                    {selectedProject.location}
                  </div>

                  <p className="text-sm text-[#3A2A21]/80 font-light leading-relaxed pt-2">
                    {selectedProject.description}
                  </p>

                  {/* Works pills */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Réalisations incluses</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.details.map((detail, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-[#3A2A21]/80 font-medium">
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                {selectedProject.review && (
                  <div className="bg-white/5 border border-[#E8DCCB]/15 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex gap-1">
                      {[...Array(selectedProject.review.rating)].map((_, i) => (
                        <Star key={i} className="size-3.5 fill-[#C17D59] text-[#C17D59]" />
                      ))}
                    </div>
                    <p className="text-xs text-[#3A2A21]/70 italic leading-relaxed">
                      &quot;{selectedProject.review.comment}&quot;
                    </p>
                    <div className="border-t border-white/10 pt-2 flex flex-col">
                      <span className="text-xs font-semibold text-white">{selectedProject.review.author}</span>
                      <span className="text-[10px] text-[#3A2A21]/50">{selectedProject.review.role}</span>
                    </div>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      handleCloseProject()
                      setTimeout(() => {
                        document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 300)
                    }}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E8DCCB] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
                  >
                    Je veux un projet similaire
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      </div>
    </main>
  )
}
