'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Building, Building2, Hotel, UtensilsCrossed, Sparkles, MapPin, ChevronRight, ChevronLeft, X, Play, Pause, Volume2, VolumeX, Image as ImageIcon, ArrowUpRight, Star, MessageCircle, Home, Lamp, DoorOpen, Sofa, Palette, CheckCircle2, Send, Phone, Mail, User, Hammer, Truck, Ruler, Eye, ZoomIn, Maximize2, Gem, Layers, Grid, Check, Compass, ShieldCheck, FileText, ArrowRight, Upload, Film } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { publicApi } from '@/lib/api'
import { MobileFloatingVIP } from '@/components/site/mobile-floating-vip'

const FILTER_TYPES = [
  { id: 'all', label: 'Tous les espaces', icon: Sparkles },
  { id: 'immobilier', label: 'Projets Immobiliers', icon: Building2 },
  { id: 'hotel', label: 'Hôtels & Palaces', icon: Hotel },
  { id: 'guesthouse', label: 'Maisons d\'Hôtes', icon: Sparkles },
  { id: 'villa', label: 'Villas & Résidences Privées', icon: Home },
  { id: 'pro_commercial', label: 'Espaces Professionnels & Commerciaux', icon: Briefcase }
]

const ESPACE_TYPES = [
  { id: 'immobilier', label: 'Projets Immobiliers', icon: Building2, desc: 'Promotion immobilière, résidence de standing, ensemble...' },
  { id: 'hotel', label: 'Hôtels & Palaces', icon: Hotel, desc: 'Hôtel 5★, palace, établissement hôtelier de prestige...' },
  { id: 'guesthouse', label: 'Maisons d\'Hôtes', icon: Sparkles, desc: 'Maison d\'hôtes de charme, riad d\'exception, lodge...' },
  { id: 'villa', label: 'Villas & Résidences Privées', icon: Home, desc: 'Villa de maître, demeure privée, riad contemporain...' },
  { id: 'pro_commercial', label: 'Espaces Professionnels & Commerciaux', icon: Briefcase, desc: 'Siège social, bureaux VIP, restaurant, lounge, showroom...' },
]

const STYLE_TYPES = [
  { id: 'andalou', label: 'Andalou & Arabesque', desc: 'Moucharabiehs & entrelacs géométriques', icon: Sparkles },
  { id: 'mauresque', label: 'Mauresque Contemporain', desc: 'Lignes épurées & sculptures d\'art', icon: Palette },
  { id: 'baroque', label: 'Classique & Dorure', desc: 'Moulures d\'apparat & feuille d\'or 24k', icon: Gem },
  { id: 'moderne', label: 'Moderne & Bois Brut', desc: 'Veinage naturel noble & formes pures', icon: Layers },
]

const ELEMENTS_TYPES = [
  { id: 'porte_monumentale', label: 'Porte monumentale extérieure', icon: DoorOpen },
  { id: 'portes_interieures', label: 'Portes intérieures sculptées', icon: DoorOpen },
  { id: 'boiseries', label: 'Habillages muraux & Lambris d\'art', icon: Layers },
  { id: 'plafonds', label: 'Plafonds à caissons & Moucharabiehs', icon: Grid },
  { id: 'table_maitre', label: 'Table de maître & Mobilier d\'art', icon: Sofa },
  { id: 'comptoir_bar', label: 'Comptoir de bar / Banque d\'accueil', icon: UtensilsCrossed },
  { id: 'luminaires', label: 'Luminaires ajourés en laiton', icon: Lamp },
  { id: 'complet', label: 'Aménagement global clé en main', icon: Sparkles },
]

const MATIERES_TYPES = [
  { id: 'noyer', label: 'Noyer massif séché', desc: 'Bois sombre, noble et dense' },
  { id: 'chene', label: 'Chêne royal massif', desc: 'Grain profond & robustesse' },
  { id: 'olivier', label: 'Bois d\'olivier de Tunisie', desc: 'Veinage sauvage et précieux' },
  { id: 'laiton', label: 'Incrustations laiton ciselé', desc: 'Détails dorés incrustés' },
  { id: 'dorure', label: 'Dorure feuille d\'or 24k', desc: 'Finition artisanale royale' },
  { id: 'fer_forge', label: 'Ferronnerie & Clous forgés', desc: 'Quincaillerie d\'époque' },
]

const AVANCEMENT_TYPES = [
  { id: 'plans_prets', label: 'Plans d\'Architecte / Fichiers prêts', desc: 'Je souhaite un chiffrage de fabrication' },
  { id: 'chantier_cours', label: 'Chantier en cours', desc: 'Gros œuvre ou rénovation en cours' },
  { id: 'etude_sur_mesure', label: 'Projet en réflexion', desc: 'Besoin d\'accompagnement créatif & plans sur-mesure' },
  { id: 'restauration', label: 'Restauration patrimoniale', desc: 'Restauration de boiseries existantes' },
]

const CONTACT_PREF_TYPES = [
  { id: 'whatsapp', label: 'WhatsApp direct', icon: MessageCircle },
  { id: 'phone', label: 'Appel téléphonique', icon: Phone },
  { id: 'email', label: 'Par e-mail', icon: Mail },
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
    title: 'Villa de Maître Carthage',
    location: 'Carthage',
    type: 'villa',
    image: '/project-villa.png',
    description: 'Création intégrale de menuiserie d\'art pour une résidence privée de prestige. Portes monumentales extérieures cloutées, plafonds à caissons en noyer et habillages muraux sculptés.',
    details: ['Portes monumentales', 'Plafonds à caissons', 'Moucharabiehs', 'Mobilier de salon'],
    gallery: ['/project-villa.png', '/gallery-1.png', '/creation-unique.png'],
    video: '/Video.mp4',
    review: {
      author: 'Dr. Karoui',
      role: 'Propriétaire',
      rating: 5,
      comment: 'L\'expertise et la précision de l\'Atelier Aschi ont sublimé notre demeure. Chaque détail sculpté reflète la noblesse de l\'artisanat tunisien authentique.'
    }
  },
  {
    id: 4,
    title: 'Résidence Panorama Marina',
    location: 'Gammarth',
    type: 'immobilier',
    image: '/creation-model.png',
    description: 'Conception et fabrication en série sur-mesure pour un programme immobilier de grand standing. Portes palières sculptées, agencements de halls d\'entrée et claustras décoratifs.',
    details: ['Portes de standing', 'Habillage hall d\'accueil', 'Claustras et moucharabiehs', 'Boiseries nobles'],
    gallery: ['/creation-model.png', '/project-hotel.png', '/gallery-2.png'],
    video: '/test-video.mp4',
    review: {
      author: 'M. Ben Salem',
      role: 'Promoteur Immobilier',
      rating: 5,
      comment: 'Une capacité de production industrielle alliée à une finition d\'ébénisterie d\'art artisanale. Respect strict des délais de livraison sur notre chantier.'
    }
  },
  {
    id: 5,
    title: 'Bureaux Corporate & Restaurant L\'Ébène',
    location: 'Les Berges du Lac, Tunis',
    type: 'pro_commercial',
    image: '/project-restaurant.png',
    description: 'Aménagement prestigieux de la salle du conseil d\'administration et de l\'espace restaurant lounge. Table de réunion de 6 mètres en chêne massif et habillage acoustique sculpté.',
    details: ['Table de conférence', 'Comptoir de bar d\'art', 'Habillages acoustiques', 'Bureaux de direction'],
    gallery: ['/project-restaurant.png', '/gallery-5.png', '/gallery-6.png', '/buffet.png'],
    video: '/test-video.mp4',
    review: {
      author: 'M. Adel',
      role: 'CEO, L\'Ébène',
      rating: 5,
      comment: 'La table de conférence monumentale et le bar sculpté ont transformé notre espace. Le service sur-mesure de l\'Atelier Aschi est parfait pour les professionnels.'
    }
  }
]

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SMART ENRICHED PROJECT FORM — OPTIMIZED STEPPER WIZARD (WALNUT & GOLD)    */
/* ═══════════════════════════════════════════════════════════════════════════ */
const FORM_STEPS = [
  { id: 1, title: 'Espace & Style', shortTitle: 'Espace' },
  { id: 2, title: 'Boiseries & Matières', shortTitle: 'Boiseries' },
  { id: 3, title: 'Chantier & Projet', shortTitle: 'Chantier' },
  { id: 4, title: 'Vos Coordonnées', shortTitle: 'Contact' },
]

function ProjectRequestForm({ preselectedEspace }: { preselectedEspace?: string }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedEspace, setSelectedEspace] = useState(preselectedEspace || '')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([])
  const [selectedAvancement, setSelectedAvancement] = useState('')
  const [demandeVisite, setDemandeVisite] = useState(false)
  const [contactPref, setContactPref] = useState('whatsapp')
  const [ville, setVille] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  // React to preselectedEspace if user clicked from a domain card
  useEffect(() => {
    if (preselectedEspace) {
      setSelectedEspace(preselectedEspace)
      setCurrentStep(1)
    }
  }, [preselectedEspace])

  const toggleElement = (id: string) => {
    setSelectedElements(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const toggleMatiere = (id: string) => {
    setSelectedMatieres(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const scrollToFormTop = () => {
    const el = document.getElementById('demande-projet')
    if (el) {
      const yOffset = -70
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    setStepError('')
    if (currentStep === 1) {
      if (!selectedEspace) {
        setStepError('Veuillez sélectionner votre type d\'espace pour continuer.')
        return
      }
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      scrollToFormTop()
    }
  }

  const handlePrev = () => {
    setStepError('')
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      scrollToFormTop()
    }
  }

  const goToStep = (step: number) => {
    setStepError('')
    if (step > currentStep && currentStep === 1 && !selectedEspace) {
      setStepError('Veuillez sélectionner votre type d\'espace pour continuer.')
      return
    }
    setCurrentStep(step)
    scrollToFormTop()
  }

  const getWhatsAppUrl = () => {
    const espaceLabel = ESPACE_TYPES.find(e => e.id === selectedEspace)?.label || '(non spécifié)'
    const styleLabel = STYLE_TYPES.find(s => s.id === selectedStyle)?.label || '(non spécifié)'
    const elementsLabels = selectedElements.map(el => ELEMENTS_TYPES.find(t => t.id === el)?.label).filter(Boolean).join(', ') || '(non spécifié)'
    const matieresLabels = selectedMatieres.map(m => MATIERES_TYPES.find(t => t.id === m)?.label).filter(Boolean).join(', ') || '(non spécifié)'
    const avancementLabel = AVANCEMENT_TYPES.find(a => a.id === selectedAvancement)?.label || '(non spécifié)'
    const visiteText = demandeVisite ? 'OUI (Visite diagnostic sur site demandée)' : 'Non'
    const contactLabel = CONTACT_PREF_TYPES.find(c => c.id === contactPref)?.label || 'WhatsApp'

    const text = `Bonjour Maison Aschi, je souhaite une étude pour un projet d'aménagement d'exception :

🏛️ Type d'espace : ${espaceLabel}
✨ Style architectural : ${styleLabel}
🚪 Éléments souhaités : ${elementsLabels}
🪵 Matières & Finitions : ${matieresLabels}
📐 État d'avancement : ${avancementLabel}
📍 Visite sur chantier : ${visiteText}
📍 Ville / Région : ${ville || '(à préciser)'}

👤 Nom : ${fullName || '(à préciser)'}
📞 Téléphone : ${phone || '(à préciser)'}
✉️ Email : ${email || '(à préciser)'}
📱 Canal préféré : ${contactLabel}

${projectDesc ? `📝 Précisions du projet : ${projectDesc}` : ''}`

    return `https://wa.me/21655743760?text=${encodeURIComponent(text)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !email) {
      setError('Veuillez renseigner votre nom, numéro de téléphone et adresse e-mail.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const espaceLabel = ESPACE_TYPES.find(e => e.id === selectedEspace)?.label || selectedEspace || 'Non spécifié'
      const styleLabel = STYLE_TYPES.find(s => s.id === selectedStyle)?.label || 'Non spécifié'
      const elementsLabels = selectedElements.map(t => ELEMENTS_TYPES.find(tt => tt.id === t)?.label).join(', ') || 'Non spécifié'
      const matieresLabels = selectedMatieres.map(t => MATIERES_TYPES.find(tt => tt.id === t)?.label).join(', ') || 'Non spécifié'
      const avancementLabel = AVANCEMENT_TYPES.find(a => a.id === selectedAvancement)?.label || 'Non spécifié'
      const visiteLabel = demandeVisite ? 'OUI (Visite sur site requise)' : 'NON'
      const contactPrefLabel = CONTACT_PREF_TYPES.find(c => c.id === contactPref)?.label || 'WhatsApp'

      const personalizationDetails = `[ESPACE_EXCEPTION] | Espace: ${espaceLabel} | Style: ${styleLabel} | Éléments: ${elementsLabels} | Matières: ${matieresLabels} | Avancement: ${avancementLabel} | Visite chantier: ${visiteLabel} | Contact: ${contactPrefLabel} | Ville: ${ville || 'Non spécifiée'}`
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
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter directement via WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-5"
      >
        <div className="size-16 sm:size-20 rounded-full bg-[#E6A635]/20 border-2 border-[#E6A635] flex items-center justify-center shadow-[0_0_25px_rgba(230,166,53,0.35)]">
          <CheckCircle2 className="size-8 sm:size-10 text-[#F2BD52]" />
        </div>
        <div>
          <h3 className="font-heading text-2xl sm:text-3xl text-white mb-2">Votre dossier a été transmis avec succès !</h3>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-lg font-light mx-auto">
            Ismail et l&apos;équipe de maîtrise d&apos;art vont étudier vos éléments et vous contacteront sous <strong className="text-[#F2BD52] font-semibold">24-48h</strong> pour un premier échange technique et étude de plans sur-mesure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-md">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
          >
            <MessageCircle className="size-4 fill-white/20" />
            <span>Transmettre mes plans sur WhatsApp</span>
          </a>

          <a
            href="tel:+21655743760"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
          >
            <Phone className="size-4" />
            <span>Appel direct : +216 55 743 760</span>
          </a>
        </div>
      </motion.div>
    )
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl sm:rounded-2xl bg-[#241812]/90 border border-[#E6A635]/25 text-white placeholder:text-white/35 text-xs sm:text-sm focus:outline-none focus:border-[#E6A635] focus:shadow-[0_0_12px_rgba(230,166,53,0.15)] transition-all"
  const inputWithIconClasses = "w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl bg-[#241812]/90 border border-[#E6A635]/25 text-white placeholder:text-white/35 text-xs sm:text-sm focus:outline-none focus:border-[#E6A635] focus:shadow-[0_0_12px_rgba(230,166,53,0.15)] transition-all"

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

      {/* ── STEPPER HEADER & PROGRESS BAR ── */}
      <div className="mb-4 sm:mb-6">
        {/* Desktop Step Tabs */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-2 mb-3">
          {FORM_STEPS.map((step) => {
            const isCurrent = currentStep === step.id
            const isPassed = currentStep > step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#E6A635] bg-[#E6A635]/15 text-[#F2BD52] shadow-sm ring-1 ring-[#E6A635]/50'
                    : isPassed
                    ? 'border-[#E6A635]/35 bg-[#241812]/90 text-white/90 hover:bg-[#3B271C]/70'
                    : 'border-[#E6A635]/15 bg-[#241812]/50 text-white/45 hover:border-[#E6A635]/30'
                }`}
              >
                <div className={`size-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-[#E6A635] text-[#1A110B]'
                    : isPassed
                    ? 'bg-[#E6A635]/20 text-[#F2BD52]'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {isPassed ? <Check className="size-3.5" /> : step.id}
                </div>
                <span className="text-xs font-semibold truncate">{step.title}</span>
              </button>
            )
          })}
        </div>

        {/* Mobile Compact Progress Bar & Quick Step Dots */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E6A635]/20 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-bold uppercase tracking-wider">
                Étape {currentStep}/4
              </span>
              <span className="text-white text-xs font-semibold">
                {FORM_STEPS[currentStep - 1].title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {FORM_STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`transition-all rounded-full ${
                    currentStep === step.id
                      ? 'w-5 h-2 bg-[#E6A635]'
                      : currentStep > step.id
                      ? 'size-2 bg-[#F2BD52]/60'
                      : 'size-2 bg-white/20'
                  }`}
                  aria-label={`Étape ${step.id}`}
                />
              ))}
            </div>
          </div>
          {/* Animated Gold Bar */}
          <div className="w-full h-1.5 bg-[#241812] rounded-full overflow-hidden border border-[#E6A635]/25">
            <div
              className="h-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT AREA ── */}
      <AnimatePresence mode="wait">
        
        {/* ── ÉTAPE 1 : Type d'Espace & Style d'Art ── */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Typologie */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-heading text-sm sm:text-base font-medium flex items-center gap-2">
                  <span>Quel est votre type d&apos;espace ?</span>
                  <span className="text-[#E6A635] text-xs font-normal">*</span>
                </h3>
                <span className="text-[10px] text-[#F2BD52]/80 uppercase tracking-wider font-semibold">1 choix</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ESPACE_TYPES.map(({ id, label, icon: Icon, desc }) => {
                  const isActive = selectedEspace === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedEspace(id)
                        setStepError('')
                      }}
                      className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-gradient-to-r from-[#E6A635]/20 to-[#3B271C]/90 text-[#F2BD52] shadow-[0_2px_15px_rgba(230,166,53,0.25)] ring-1 ring-[#E6A635]/50'
                          : 'border-[#E6A635]/20 bg-[#241812]/80 text-white/90 hover:border-[#E6A635]/50 hover:bg-[#3B271C]/50'
                      }`}
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-[#E6A635] text-[#1A110B] shadow-sm' : 'bg-[#3B271C] text-[#E6A635] border border-[#E6A635]/30'
                      }`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-bold leading-tight block truncate ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>{label}</span>
                        <span className="text-[10px] text-white/50 font-light truncate block mt-0.5">{desc}</span>
                      </div>
                      {isActive && <Check className="size-4 text-[#F2BD52] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Style Architectural */}
            <div className="pt-2 border-t border-[#E6A635]/20">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-heading text-sm sm:text-base font-medium">
                  Quel style &amp; ambiance recherchez-vous ?
                </h3>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">Optionnel</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {STYLE_TYPES.map(({ id, label, icon: Icon, desc }) => {
                  const isActive = selectedStyle === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedStyle(isActive ? '' : id)}
                      className={`flex flex-col items-start gap-1 p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 text-[#F2BD52] shadow-[0_2px_15px_rgba(230,166,53,0.25)] ring-1 ring-[#E6A635]/50'
                          : 'border-[#E6A635]/20 bg-[#241812]/80 text-white/80 hover:border-[#E6A635]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`size-4 ${isActive ? 'text-[#F2BD52]' : 'text-white/40'}`} />
                        {isActive && <Check className="size-3.5 text-[#F2BD52]" />}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold leading-tight block ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>{label}</span>
                      <span className="text-[9.5px] text-white/50 font-light leading-tight line-clamp-1">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ÉTAPE 2 : Boiseries & Essences Nobles ── */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Boiseries */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-heading text-sm sm:text-base font-medium">
                  Quels éléments &amp; boiseries souhaitez-vous façonner ?
                </h3>
                <span className="text-[10px] text-[#F2BD52]/80 uppercase tracking-wider font-semibold">Multi-choix</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {ELEMENTS_TYPES.map(({ id, label, icon: Icon }) => {
                  const isActive = selectedElements.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleElement(id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/20 text-[#F2BD52] shadow-sm font-bold'
                          : 'border-[#E6A635]/20 bg-[#241812]/80 text-white/75 hover:border-[#E6A635]/50 hover:text-white'
                      }`}
                    >
                      <Icon className="size-3.5 sm:size-4 shrink-0 text-[#E6A635]" />
                      <span className="flex-1 leading-snug line-clamp-2">{label}</span>
                      {isActive && <CheckCircle2 className="size-3.5 shrink-0 text-[#F2BD52]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Matières */}
            <div className="pt-2 border-t border-[#E6A635]/20">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-heading text-sm sm:text-base font-medium">
                  Essences de bois &amp; matières nobles
                </h3>
                <span className="text-[10px] text-[#F2BD52]/80 uppercase tracking-wider font-semibold">Multi-choix</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {MATIERES_TYPES.map(({ id, label, desc }) => {
                  const isActive = selectedMatieres.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleMatiere(id)}
                      className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 text-[#F2BD52] shadow-sm'
                          : 'border-[#E6A635]/20 bg-[#241812]/80 text-white/80 hover:border-[#E6A635]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[11px] sm:text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>{label}</span>
                        {isActive && <CheckCircle2 className="size-3.5 text-[#F2BD52] shrink-0" />}
                      </div>
                      <span className="text-[9.5px] text-white/50 font-light truncate w-full">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ÉTAPE 3 : Chantier, Visite VIP & Localisation ── */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Avancement */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-white font-heading text-sm sm:text-base font-medium">
                  Où en est votre projet ?
                </h3>
                <span className="text-[10px] text-[#F2BD52]/80 uppercase tracking-wider font-semibold">1 choix</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {AVANCEMENT_TYPES.map(({ id, label, desc }) => {
                  const isActive = selectedAvancement === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedAvancement(id)}
                      className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 text-[#F2BD52] shadow-sm'
                          : 'border-[#E6A635]/20 bg-[#241812]/80 text-white/80 hover:border-[#E6A635]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>{label}</span>
                        {isActive && <Check className="size-3.5 text-[#F2BD52] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-white/50 font-light leading-tight mt-0.5">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Prestation VIP Visite Chantier */}
            <div
              onClick={() => setDemandeVisite(!demandeVisite)}
              className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                demandeVisite
                  ? 'border-[#E6A635] bg-gradient-to-r from-[#3B271C] to-[#241812] shadow-[0_2px_15px_rgba(230,166,53,0.25)]'
                  : 'border-[#E6A635]/25 bg-[#241812]/80 hover:border-[#E6A635]/60'
              }`}
            >
              <div className={`size-5 sm:size-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                demandeVisite ? 'bg-[#E6A635] border-[#E6A635] text-[#1A110B]' : 'border-[#E6A635]/40 bg-[#1A110B]'
              }`}>
                {demandeVisite && <Check className="size-3.5 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-white">Demander une visite d&apos;Ismail sur mon chantier</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E6A635]/20 text-[#F2BD52] text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider">Prestation VIP</span>
                </div>
                <p className="text-[10px] sm:text-xs text-white/60 font-light leading-tight mt-0.5">
                  Prise de cotes, examen hygrométrique des lieux et conseil en sélection des essences.
                </p>
              </div>
            </div>

            {/* Ville & Précisions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                <input
                  type="text"
                  value={ville}
                  onChange={e => setVille(e.target.value)}
                  placeholder="Ville / Gouvernorat (ex: Tunis, Sidi Bou Saïd...)"
                  className={inputWithIconClasses}
                />
              </div>

              <div className="relative">
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  rows={1}
                  placeholder="Précisions supplémentaires, délais, volume... (facultatif)"
                  className={`${inputClasses} resize-none min-h-[42px] py-2.5`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ÉTAPE 4 : Vos Coordonnées & Envoi ── */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Summary capsule */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#1A110B]/80 border border-[#E6A635]/30 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[#F2BD52] font-semibold flex items-center gap-1 text-[11px]">
                <Sparkles className="size-3 text-[#E6A635]" /> Votre projet :
              </span>
              {selectedEspace && (
                <span className="px-2 py-0.5 rounded-full bg-[#3B271C] border border-[#E6A635]/30 text-white text-[10px]">
                  {ESPACE_TYPES.find(e => e.id === selectedEspace)?.label}
                </span>
              )}
              {selectedStyle && (
                <span className="px-2 py-0.5 rounded-full bg-[#3B271C] border border-[#E6A635]/30 text-white text-[10px]">
                  Style {STYLE_TYPES.find(s => s.id === selectedStyle)?.label}
                </span>
              )}
              {selectedElements.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#3B271C] border border-[#E6A635]/30 text-white text-[10px]">
                  {selectedElements.length} boiserie{selectedElements.length > 1 ? 's' : ''}
                </span>
              )}
              {ville && (
                <span className="px-2 py-0.5 rounded-full bg-[#3B271C] border border-[#E6A635]/30 text-white text-[10px]">
                  📍 {ville}
                </span>
              )}
              {demandeVisite && (
                <span className="px-2 py-0.5 rounded-full bg-[#E6A635]/20 border border-[#E6A635]/50 text-[#F2BD52] text-[10px] font-bold">
                  ✦ Visite VIP
                </span>
              )}
            </div>

            {/* Inputs Coordonnées */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Nom complet / Établissement *"
                    className={inputWithIconClasses}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Numéro de téléphone *"
                    className={inputWithIconClasses}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Adresse e-mail *"
                    className={inputWithIconClasses}
                  />
                </div>
              </div>

              {/* Canal de rappel */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="text-[10.5px] text-white/60">Canal privilégié :</span>
                {CONTACT_PREF_TYPES.map(({ id, label, icon: Icon }) => {
                  const isActive = contactPref === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setContactPref(id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/20 text-[#F2BD52]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon className="size-2.5 text-[#E6A635]" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-950/50 border border-red-500/30 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Submit Action Buttons */}
            <div className="pt-2 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold uppercase tracking-wider text-xs shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 cursor-pointer text-center"
                >
                  {submitting ? (
                    <>
                      <div className="size-4 border-2 border-[#1A110B] border-t-transparent rounded-full animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Envoyer Ma Demande de Projet</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all cursor-pointer text-center"
                >
                  <MessageCircle className="size-4 fill-white/20" />
                  <span>Envoyer sur WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-white/50 font-light text-center">
                <span className="text-[#F2BD52]">✦</span>
                <span>Étude d&apos;implantation &amp; Plans 3D sous 24-48h</span>
                <span className="text-[#F2BD52] hidden sm:inline">•</span>
                <span className="hidden sm:inline">Déplacement sur toute la Tunisie</span>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── STEPPER NAVIGATION (PRÉCÉDENT / CONTINUER) ── */}
      <div className="pt-3 border-t border-[#E6A635]/20 flex items-center justify-between gap-3">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E6A635]/35 bg-[#241812]/90 hover:bg-[#3B271C] text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
            <span>Précédent</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-sheen inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all cursor-pointer ml-auto"
          >
            <span>Continuer</span>
            <ChevronRight className="size-3.5" />
          </button>
        ) : null}
      </div>

      {stepError && (
        <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-2 text-center">
          {stepError}
        </p>
      )}

      {/* Direct WhatsApp Concierge Shortcut */}
      <div className="pt-1 text-center">
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#F2BD52]/80 hover:text-[#F2BD52] transition-colors"
        >
          <MessageCircle className="size-3 text-[#25D366]" />
          <span>Échanger directement avec Ismail sur WhatsApp</span>
        </a>
      </div>

    </form>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CATEGORY NORMALIZATION HELPER                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function normalizeCategory(cat?: string): string {
  if (!cat) return 'autre'
  const c = cat.toLowerCase()
  if (c.includes('hotel') || c.includes('palace') || c.includes('hôtel')) return 'hotel'
  if (c.includes('guest') || c.includes('hôte') || c.includes('riad') || c.includes('lodge')) return 'guesthouse'
  if (c.includes('villa') || c.includes('demeure') || c.includes('résidence privée') || c.includes('residence privee')) return 'villa'
  if (c.includes('immo') || c.includes('promoteur') || c.includes('résidence') || c.includes('batiment')) return 'immobilier'
  if (c.includes('pro') || c.includes('bureau') || c.includes('commercial') || c.includes('restaurant') || c.includes('lounge') || c.includes('showroom')) return 'pro_commercial'
  return 'autre'
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MODERN TURNKEY PROJECT CARD (Interactive Photo / Video)                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function TurnkeyProjectCard({
  project,
  onOpen,
  filterTypes,
}: {
  project: any
  onOpen: (p: any) => void
  filterTypes: { id: string; label: string }[]
}) {
  const hasVideo = Boolean(project.video || project.videoUrl)

  // Extraire toutes les photos de manière propre et dédoublonnée
  const allPhotos: string[] = useMemo(() => {
    let list: string[] = []
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      list = project.gallery
    } else if (typeof project.gallery === 'string' && project.gallery.trim()) {
      list = project.gallery.split(',').map((s: string) => s.trim()).filter(Boolean)
    } else if (project.image) {
      list = project.image.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    const cleaned = list.flatMap((s: string) => s.split(',').map(x => x.trim())).filter(Boolean)
    return cleaned.length > 0 ? cleaned : ['/project-hotel.png']
  }, [project])

  const coverPhotoSrc = allPhotos[0] || (project.image ? project.image.split(',')[0].trim() : '') || '/project-hotel.png'

  return (
    <div
      onClick={() => onOpen(project)}
      className="group relative flex flex-col h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-[#2A1C14] via-[#1E130D] to-[#140C08] border border-[#E6A635]/30 hover:border-[#E6A635]/85 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_30px_rgba(230,166,53,0.25)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
<<<<<<< HEAD
      {/* Liseré doré subtil au survol */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#E6A635] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* ── Cadre Photo de Prestige (Mise en avant de la réalisation) ── */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#120B08] shrink-0 border-b border-[#E6A635]/20">
=======
      {/* ── Cadre Couverture Photo (Exclusif Photo — Pas de vidéo sur l'extérieur) ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#160E0A] shrink-0 border-b border-[#E6A635]/20">
>>>>>>> a5eb1a6e1094ae581b449686d120dedf3cd3aaa0
        <Image
          src={coverPhotoSrc}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140C08]/90 via-[#140C08]/20 to-black/20 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />

<<<<<<< HEAD
        {/* Indicateur vidéo subtil si le projet contient une vidéo */}
        {hasVideo && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A110B]/85 border border-[#E6A635]/40 text-[#F2BD52] text-[9px] font-semibold backdrop-blur-md shadow-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Film className="size-2.5 text-[#E6A635]" />
=======
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
>>>>>>> a5eb1a6e1094ae581b449686d120dedf3cd3aaa0
            </span>
          </div>
        )}
      </div>

      {/* ── CORPS DE LA CARTE: UNIQUEMENT LE NOM DU PROJET ── */}
      <div className="p-2.5 sm:p-4 flex items-center justify-center text-center flex-1">
        <h3 className="font-heading text-xs sm:text-base font-medium text-white leading-snug group-hover:text-[#F2BD52] transition-colors line-clamp-2 tracking-wide">
          {project.title}
        </h3>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function TurnkeyProjectsPage() {
  const [filter, setFilter] = useState('all')
  const [formEspace, setFormEspace] = useState('')
  const [liveProjects, setLiveProjects] = useState<any[]>(PROJECTS)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightboxProject, setLightboxProject] = useState<{ images: string[]; currentIndex: number; title: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isModalMuted, setIsModalMuted] = useState(true)
  const [modalActiveView, setModalActiveView] = useState<'video' | number>('video')
  const [currentPage, setCurrentPage] = useState(1)
  const PROJECTS_PER_PAGE = 4

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
              details: p.details ? p.details.split(',').map(d => d.trim()).filter(Boolean) : ['Aménagement d\'artisanat d\'art'],
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

  // Réinitialiser à la première page lors d'un changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Pagination calculée (4 projets par page pour un affichage aéré et prestigieux)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE))
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE)
  }, [filteredProjects, currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    const el = document.getElementById('projects-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleOpenProject = (project: any) => {
    setSelectedProject(project)
    setActiveImageIdx(0)
    setIsPlaying(false)
    setIsModalMuted(true)
    const hasVid = Boolean(project.video || project.videoUrl)
    setModalActiveView(hasVid ? 'video' : 0)
  }

  const handleCloseProject = () => {
    setSelectedProject(null)
    setLightboxProject(null)
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

  const toggleModalMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isModalMuted
    setIsModalMuted(!isModalMuted)
  }

  const handleSelectDomainAndQuote = (sectorId: string) => {
    setFormEspace(sectorId)
    setTimeout(() => {
      document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
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

  // Prevent scroll when modal or lightbox is open
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
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME (Luminosité constante sur toute la page, sans dégradé) */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-espace-exception.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Voile d'ombrage plat et uniforme (100% même luminosité de haut en bas, aucun dégradé) */}
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-7xl mx-auto w-full">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  PAGE HEADER — REFINED TYPOGRAPHY                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  FILTER BAR — CATÉGORIES ORIGINALES AVEC COMPTEURS DYNAMIQUES */}
          {/* ═══════════════════════════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  PROJECT CARDS — MODERN RESPONSIVE GRID                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div id="projects-section" className="w-full mb-16 sm:mb-24 scroll-mt-28">
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
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
                    {paginatedProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35, delay: index * 0.06 }}
                      >
                        <TurnkeyProjectCard
                          project={project}
                          onOpen={handleOpenProject}
                          filterTypes={FILTER_TYPES}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* ── PAGINATION HAUT DE GAMME & MODERNE ── */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2A1C14]/90 via-[#231710]/95 to-[#1A110B]/90 border border-[#E6A635]/30 backdrop-blur-md shadow-xl"
                    >
                      {/* Compteur d'affichage des réalisations */}
                      <div className="text-xs text-white/75 font-light flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#E6A635] animate-pulse" />
                        <span>
                          Affichage de <strong className="text-[#F2BD52] font-semibold">{(currentPage - 1) * PROJECTS_PER_PAGE + 1}</strong> à <strong className="text-[#F2BD52] font-semibold">{Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length)}</strong> sur <strong className="text-white font-medium">{filteredProjects.length}</strong> projets
                        </span>
                      </div>

                      {/* Boutons de pagination */}
                      <div className="flex items-center gap-2">
                        {/* Bouton Précédent */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#241812] border-[#E6A635]/30 text-white hover:text-[#F2BD52] hover:border-[#E6A635]/70 shadow-sm"
                        >
                          <ChevronLeft className="size-4" />
                          <span className="hidden sm:inline">Précédent</span>
                        </button>

                        {/* Numéros de page */}
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const isActive = pageNum === currentPage
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => handlePageChange(pageNum)}
                                className={`size-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                  isActive
                                    ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] shadow-[0_0_15px_rgba(230,166,53,0.45)] scale-105'
                                    : 'bg-[#241812] border border-[#E6A635]/25 text-white/80 hover:text-white hover:border-[#E6A635]/60 hover:bg-[#342318]'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        {/* Bouton Suivant */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#241812] border-[#E6A635]/30 text-white hover:text-[#F2BD52] hover:border-[#E6A635]/70 shadow-sm"
                        >
                          <span className="hidden sm:inline">Suivant</span>
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  SMART PROJECT REQUEST FORM — WALNUT & GOLD DESIGN            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  IMMERSIVE PROJECT MODAL                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
              onClick={handleCloseProject}
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
<<<<<<< HEAD
                className="relative w-full max-w-5xl bg-gradient-to-br from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/45 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row max-h-[92vh] overflow-y-auto md:overflow-hidden"
=======
                className="relative w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1550px] bg-gradient-to-br from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/45 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] flex flex-col lg:flex-row max-h-[94vh] h-[92vh] overflow-hidden"
>>>>>>> a5eb1a6e1094ae581b449686d120dedf3cd3aaa0
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseProject}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 size-8 sm:size-9 rounded-full bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#F2BD52] hover:bg-[#4E3425] transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="size-4 sm:size-5" />
                </button>

<<<<<<< HEAD
                {/* 📱 EN-TÊTE DU PROJET SUR MOBILE (EN HAUT : Titre & Description avant le média) */}
                <div className="block md:hidden p-4 sm:p-5 pb-2.5 space-y-2 text-left bg-[#1A110B]/90 border-b border-[#E6A635]/25 pr-14">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] uppercase tracking-[0.15em] px-3 py-0.5 rounded-full font-bold shadow-sm">
                      <Sparkles className="size-2.5" />
                      {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || selectedProject.type}
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
=======
                {/* LEFT COLUMN: Grand Écran Média Cinématique Agrandie + Ruban de Miniatures */}
                <div className="w-full lg:w-[68%] xl:w-[70%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#E6A635]/25 p-4 sm:p-6 justify-between gap-3 bg-[#1A110B]/70 min-h-0">
>>>>>>> a5eb1a6e1094ae581b449686d120dedf3cd3aaa0
                  
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
                        <video
                          ref={videoRef}
                          src={selectedProject.video || selectedProject.videoUrl}
                          muted={isModalMuted}
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-contain sm:object-cover bg-black"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Badge HD discret en haut à droite */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/50 text-[#F2BD52] text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md pointer-events-none">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Vidéo HD</span>
                        </div>

                        {/* Contrôle du Son en bas à droite (Bouton Start central 100% MASQUÉ) */}
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
                          src={
                            (selectedProject.gallery && selectedProject.gallery[typeof modalActiveView === 'number' ? modalActiveView : 0]?.split(',')[0]?.trim()) ||
                            (selectedProject.image ? selectedProject.image.split(',')[0].trim() : '') ||
                            '/project-hotel.png'
                          }
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
                          <Image src={img.split(',')[0].trim()} alt="Miniature" fill className="object-cover" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 text-[8.5px] text-white/90 font-medium">
                            {idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Détails de Prestige, Spécifications Nobles & CTA */}
                <div className="w-full lg:w-[32%] xl:w-[30%] flex flex-col justify-between overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 text-left scrollbar-thin">
                  
                  {/* En-tête du projet (Desktop uniquement, affiché en haut sur mobile) */}
                  <div className="hidden md:block space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full font-bold shadow-sm">
                        <Sparkles className="size-2.5" />
                        {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || selectedProject.type}
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
                        {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || 'Aménagement Sur-Mesure'}
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

                  {/* Réalisations incluses */}
                  {selectedProject.details && selectedProject.details.length > 0 && (
                    <div>
                      <p className="text-[9.5px] uppercase tracking-[0.14em] text-[#F2BD52]/80 font-bold mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-[#E6A635]" /> Réalisations d&apos;art incluses
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.details.map((detail: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-[#241812] border border-[#E6A635]/30 px-2.5 py-1 rounded-lg text-[10px] text-white/90 font-medium shadow-sm"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                        `Bonjour Maison Aschi, j'ai vu votre réalisation "${selectedProject.title}" et je souhaite une étude d'aménagement similaire pour mon établissement.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <MessageCircle className="size-4 fill-white/20" />
                      <span>Demander une Étude sur WhatsApp</span>
                    </a>
                    <button
                      onClick={() => {
                        handleCloseProject()
                        setTimeout(() => {
                          document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 300)
                      }}
                      className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Je veux un projet similaire</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  FULLSCREEN IMAGE LIGHTBOX / ZOOM                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
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
                      <Image src={img.split(',')[0].trim()} alt="Miniature" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <MobileFloatingVIP />
        <Footer />
      </div>
    </main>
  )
}
