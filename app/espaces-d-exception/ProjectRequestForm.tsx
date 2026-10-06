'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Hotel,
  Sparkles,
  Home,
  Briefcase,
  Palette,
  Gem,
  Layers,
  DoorOpen,
  Grid,
  Sofa,
  UtensilsCrossed,
  Lamp,
  MessageCircle,
  Phone,
  Mail,
  User,
  MapPin,
  Upload,
  CheckCircle2,
  Check,
  Send,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { publicApi } from '@/lib/api'

export const ESPACE_TYPES = [
  { id: 'immobilier', label: 'Projets Immobiliers', icon: Building2, desc: 'Promotion immobilière, résidence de standing, ensemble...' },
  { id: 'hotel', label: 'Hôtels & Palaces', icon: Hotel, desc: 'Hôtel 5★, palace, établissement hôtelier de prestige...' },
  { id: 'guesthouse', label: "Maisons d'Hôtes", icon: Sparkles, desc: "Maison d'hôtes de charme, riad d'exception, lodge..." },
  { id: 'villa', label: 'Villas & Résidences Privées', icon: Home, desc: 'Villa de maître, demeure privée, riad contemporain...' },
  { id: 'pro_commercial', label: 'Espaces Professionnels & Commerciaux', icon: Briefcase, desc: 'Siège social, bureaux VIP, restaurant, lounge, showroom...' },
]

export const STYLE_TYPES = [
  { id: 'andalou', label: 'Andalou & Arabesque', desc: 'Moucharabiehs & entrelacs géométriques', icon: Sparkles },
  { id: 'mauresque', label: 'Mauresque Contemporain', desc: "Lignes épurées & sculptures d'art", icon: Palette },
  { id: 'baroque', label: 'Classique & Dorure', desc: "Moulures d'apparat & feuille d'or 24k", icon: Gem },
  { id: 'moderne', label: 'Bois Brut & Épuré', desc: 'Veinage naturel noble & formes pures', icon: Layers },
]

export const ELEMENTS_TYPES = [
  { id: 'porte_monumentale', label: 'Porte monumentale extérieure', icon: DoorOpen },
  { id: 'portes_interieures', label: 'Portes intérieures sculptées', icon: DoorOpen },
  { id: 'boiseries', label: "Habillages muraux & Lambris d'art", icon: Layers },
  { id: 'plafonds', label: 'Plafonds à caissons & Moucharabiehs', icon: Grid },
  { id: 'table_maitre', label: "Table de maître & Mobilier d'art", icon: Sofa },
  { id: 'comptoir_bar', label: "Comptoir de bar / Banque d'accueil", icon: UtensilsCrossed },
  { id: 'luminaires', label: 'Luminaires ajourés en laiton', icon: Lamp },
  { id: 'complet', label: 'Aménagement global clé en main', icon: Sparkles },
]

export const MATIERES_TYPES = [
  { id: 'noyer', label: 'Noyer massif séché', desc: 'Bois sombre, noble et dense' },
  { id: 'chene', label: 'Chêne royal massif', desc: 'Grain profond & robustesse' },
  { id: 'olivier', label: "Bois d'olivier de Tunisie", desc: 'Veinage sauvage et précieux' },
  { id: 'laiton', label: 'Incrustations laiton ciselé', desc: 'Détails dorés incrustés' },
  { id: 'dorure', label: "Dorure feuille d'or 24k", desc: 'Finition artisanale royale' },
  { id: 'fer_forge', label: 'Ferronnerie & Clous forgés', desc: "Quincaillerie d'époque" },
]

export const AVANCEMENT_TYPES = [
  { id: 'plans_prets', label: "Plans d'Architecte / Fichiers prêts", desc: 'Je souhaite un chiffrage de fabrication' },
  { id: 'chantier_cours', label: 'Chantier en cours', desc: 'Gros œuvre ou rénovation en cours' },
  { id: 'etude_sur_mesure', label: 'Projet en réflexion', desc: "Besoin d'accompagnement créatif & plans sur-mesure" },
  { id: 'restauration', label: 'Restauration patrimoniale', desc: 'Restauration de boiseries existantes' },
]

export const CONTACT_PREF_TYPES = [
  { id: 'whatsapp', label: 'WhatsApp direct', icon: MessageCircle },
  { id: 'phone', label: 'Appel téléphonique', icon: Phone },
  { id: 'email', label: 'Par e-mail', icon: Mail },
]

const STEP_TITLES = [
  "Typologie d'espace",
  'Style architectural',
  "Éléments d'artisanat",
  'Matières nobles & finitions',
  'État du chantier & visite VIP',
  'Localisation & précisions',
  'Coordonnées & validation'
]

const STEP_SHORT_LABELS = [
  'Espace',
  'Style',
  'Éléments',
  'Matières',
  'Avancement',
  'Projet',
  'Contact'
]

interface ProjectRequestFormProps {
  preselectedEspace?: string
}

export default function ProjectRequestForm({ preselectedEspace }: ProjectRequestFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)

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

  const formTopRef = useRef<HTMLDivElement>(null)

  // React to preselectedEspace if user clicked from a domain card
  useEffect(() => {
    if (preselectedEspace) {
      setSelectedEspace(preselectedEspace)
    }
  }, [preselectedEspace])

  const scrollToTop = () => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

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

  const handleNext = () => {
    setStepError('')
    if (currentStep === 1) {
      if (!selectedEspace) {
        setStepError("Veuillez sélectionner votre type d'espace avant de continuer.")
        return
      }
    } else if (currentStep === 2) {
      if (!selectedStyle) {
        setStepError("Veuillez sélectionner un style architectural avant de continuer.")
        return
      }
    } else if (currentStep === 5) {
      if (!selectedAvancement) {
        setStepError("Veuillez indiquer l'état d'avancement de votre projet.")
        return
      }
    }

    if (currentStep < 7) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
      scrollToTop()
    }
  }

  const handlePrev = () => {
    setStepError('')
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
      scrollToTop()
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setStepError('')
      setDirection(-1)
      setCurrentStep(step)
      scrollToTop()
    }
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
      const message = projectDesc || "Demande de projet clé en main via la page Espaces d'Exception."

      await publicApi.submitQuoteRequest({
        fullName,
        phoneNumber: phone,
        email,
        personalizationDetails,
        message,
      })
      setSubmitted(true)
    } catch {
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
        className="flex flex-col items-center justify-center py-14 sm:py-16 text-center gap-5"
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

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
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

  const inputClasses = "w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#241812]/90 border border-[#E6A635]/25 text-white placeholder:text-white/35 text-xs sm:text-sm focus:outline-none focus:border-[#E6A635] focus:shadow-[0_0_12px_rgba(230,166,53,0.15)] transition-all"
  const inputWithIconClasses = "w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#241812]/90 border border-[#E6A635]/25 text-white placeholder:text-white/35 text-xs sm:text-sm focus:outline-none focus:border-[#E6A635] focus:shadow-[0_0_12px_rgba(230,166,53,0.15)] transition-all"

  // Motion variants for step change
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 35 : -35,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -35 : 35,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.2, ease: 'easeIn' as const }
    })
  }

  return (
    <div ref={formTopRef} className="space-y-6 sm:space-y-8">
      {/* ── STEPPER PROGRESS HEADER ── */}
      <div className="space-y-3 pb-2 border-b border-[#E6A635]/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/35 text-[#F2BD52] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Question {String(currentStep).padStart(2, '0')} / 07
            </span>
            <span className="text-white/60 text-xs font-light hidden sm:inline">
              — {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <span className="text-xs text-[#E6A635] font-semibold">
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>

        {/* Gold progress bar */}
        <div className="w-full h-2 rounded-full bg-black/40 border border-[#E6A635]/20 overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] shadow-[0_0_12px_rgba(230,166,53,0.4)]"
            initial={false}
            animate={{ width: `${(currentStep / 7) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>

        {/* Step dots navigation */}
        <div className="flex items-center justify-between pt-1">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => {
            const isPast = s < currentStep
            const isCurrent = s === currentStep
            return (
              <button
                key={s}
                type="button"
                onClick={() => goToStep(s)}
                disabled={s >= currentStep}
                className={`group flex items-center gap-1.5 transition-all ${
                  isPast ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-35'
                }`}
                title={isPast ? `Revenir à : ${STEP_TITLES[s - 1]}` : STEP_TITLES[s - 1]}
              >
                <div
                  className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] ring-2 ring-[#F3C45E]/40 shadow-[0_0_10px_rgba(230,166,53,0.35)] scale-110'
                      : isPast
                      ? 'bg-[#E6A635]/20 border border-[#E6A635]/40 text-[#F2BD52] group-hover:bg-[#E6A635]/35'
                      : 'bg-black/30 border border-white/10 text-white/40'
                  }`}
                >
                  {isPast ? <Check className="size-3 stroke-[3]" /> : s}
                </div>
                <span className={`text-[11px] hidden md:inline font-medium ${
                  isCurrent ? 'text-[#F2BD52]' : isPast ? 'text-white/70' : 'text-white/30'
                }`}>
                  {STEP_SHORT_LABELS[s - 1]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── QUESTION BODY (ANIMATED TRANSITION) ── */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── QUESTION 1 — Type d'espace ── */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  1
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Quel est votre type d&apos;espace ?
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Sélectionnez la typologie de votre établissement ou résidence.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_4px_20px_rgba(230,166,53,0.25)] scale-[1.01]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-2.5 rounded-xl ${isActive ? 'bg-[#E6A635] text-[#1A110B]' : 'bg-[#E6A635]/10 text-[#F2BD52]'}`}>
                          <Icon className="size-4" />
                        </span>
                        {isActive && <CheckCircle2 className="size-4 text-[#F2BD52]" />}
                      </div>
                      <span className={`text-xs font-bold leading-tight mt-1 ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>
                        {label}
                      </span>
                      <span className="text-[10.5px] text-white/50 font-light leading-tight">
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 2 — Style Architectural ── */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  2
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Quel style architectural recherchez-vous ?
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    L&apos;identité visuelle qui guidera la sculpture et l&apos;ébénisterie.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {STYLE_TYPES.map(({ id, label, desc, icon: Icon }) => {
                  const isActive = selectedStyle === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedStyle(id)
                        setStepError('')
                      }}
                      className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_4px_20px_rgba(230,166,53,0.25)] scale-[1.01]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-2.5 rounded-xl ${isActive ? 'bg-[#E6A635] text-[#1A110B]' : 'bg-[#E6A635]/10 text-[#F2BD52]'}`}>
                          <Icon className="size-4" />
                        </span>
                        {isActive && <CheckCircle2 className="size-4 text-[#F2BD52]" />}
                      </div>
                      <span className={`text-xs font-bold leading-tight mt-1 ${isActive ? 'text-[#F2BD52]' : 'text-white'}`}>
                        {label}
                      </span>
                      <span className="text-[10.5px] text-white/50 font-light leading-tight">
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 3 — Éléments d'art souhaités (Multi-sélection) ── */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  3
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Quels éléments d&apos;art souhaitez-vous intégrer ?
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Sélectionnez un ou plusieurs éléments pour votre projet (choix multiple).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {ELEMENTS_TYPES.map(({ id, label, icon: Icon }) => {
                  const isActive = selectedElements.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleElement(id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_2px_15px_rgba(230,166,53,0.2)]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                      }`}
                    >
                      <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-[#E6A635] border-[#E6A635] text-[#1A110B]' : 'border-[#E6A635]/40 bg-[#1A110B]'
                      }`}>
                        {isActive ? <Check className="size-3.5 stroke-[3]" /> : <Icon className="size-3 text-[#E6A635]/60" />}
                      </div>
                      <span className={`text-xs font-medium leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'}`}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className="text-[11px] text-[#F2BD52]/80 italic">
                {selectedElements.length > 0
                  ? `✓ ${selectedElements.length} élément(s) sélectionné(s)`
                  : 'Vous pouvez sélectionner plusieurs éléments ou continuer pour passer.'}
              </p>
            </motion.div>
          )}

          {/* ── QUESTION 4 — Matières & Finitions (Multi-sélection) ── */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  4
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Matières premières &amp; Finitions d&apos;art
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Le bois noble et les ornements au cœur de vos boiseries (choix multiple).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MATIERES_TYPES.map(({ id, label, desc }) => {
                  const isActive = selectedMatieres.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleMatiere(id)}
                      className={`flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_2px_15px_rgba(230,166,53,0.2)]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'}`}>
                          {label}
                        </span>
                        {isActive && <CheckCircle2 className="size-4 text-[#F2BD52] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-white/50 font-light leading-tight">
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className="text-[11px] text-[#F2BD52]/80 italic">
                {selectedMatieres.length > 0
                  ? `✓ ${selectedMatieres.length} matière(s) & finition(s) choisie(s)`
                  : 'Sélectionnez les matières souhaitées ou continuez vers l’étape suivante.'}
              </p>
            </motion.div>
          )}

          {/* ── QUESTION 5 — État d'avancement & Option Déplacement VIP ── */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  5
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Où en est votre projet ?
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Pour calibrer notre accompagnement technique et artistique.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVANCEMENT_TYPES.map(({ id, label, desc }) => {
                  const isActive = selectedAvancement === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedAvancement(id)
                        setStepError('')
                      }}
                      className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_2px_15px_rgba(230,166,53,0.2)]'
                          : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'}`}>
                          {label}
                        </span>
                        {isActive && <Check className="size-4 text-[#F2BD52] shrink-0 stroke-[3]" />}
                      </div>
                      <span className="text-[10.5px] text-white/50 font-light leading-tight">
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Option VIP Déplacement sur site */}
              <div
                onClick={() => setDemandeVisite(!demandeVisite)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start sm:items-center gap-3.5 ${
                  demandeVisite
                    ? 'border-[#E6A635] bg-gradient-to-r from-[#3B271C] to-[#241812] shadow-[0_4px_20px_rgba(230,166,53,0.25)]'
                    : 'border-[#E6A635]/25 bg-[#241812]/70 hover:border-[#E6A635]/60'
                }`}
              >
                <div className={`size-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                  demandeVisite ? 'bg-[#E6A635] border-[#E6A635] text-[#1A110B]' : 'border-[#E6A635]/40 bg-[#1A110B]'
                }`}>
                  {demandeVisite && <Check className="size-4 stroke-[3]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">Demander une visite d&apos;Ismail sur mon chantier</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6A635]/20 text-[#F2BD52] text-[9.5px] font-bold uppercase tracking-wider hidden sm:inline">Prestation VIP</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-white/60 font-light leading-tight mt-0.5">
                    Déplacement pour prise de cotes, examen hygrométrique des lieux et conseil en sélection des essences.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 6 — Localisation & Précisions ── */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  6
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Localisation &amp; Précisions du projet
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Indiquez la ville et les particularités de votre chantier.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-white/80">
                    Ville / Gouvernorat
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                    <input
                      type="text"
                      value={ville}
                      onChange={e => setVille(e.target.value)}
                      placeholder="Ex: Tunis, Sidi Bou Saïd, Hammamet, Sousse, Djerba..."
                      className={inputWithIconClasses}
                    />
                  </div>

                  {/* Transmettre plans notice */}
                  <div className="p-3.5 rounded-xl bg-[#241812]/80 border border-[#E6A635]/25 flex items-center gap-3 mt-2">
                    <Upload className="size-4 text-[#F2BD52] shrink-0" />
                    <p className="text-[10.5px] sm:text-xs text-white/70 font-light leading-snug">
                      <strong className="text-white font-medium">Plans ou photos disponibles ?</strong> Vous pourrez les transmettre directement par WhatsApp en un clic après validation.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-medium text-white/80">
                    Précisions &amp; Souhaits particuliers (facultatif)
                  </label>
                  <textarea
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                    rows={4}
                    placeholder="Précisez votre vision, dimensions approximatives, délais ou contraintes spécifiques..."
                    className={`${inputClasses} resize-none min-h-[120px]`}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION 7 — Vos Coordonnées & Validation Finale ── */}
          {currentStep === 7 && (
            <motion.div
              key="step-7"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  7
                </div>
                <div>
                  <h3 className="text-white font-heading text-lg sm:text-xl font-medium">
                    Vos coordonnées de contact
                  </h3>
                  <p className="text-white/50 text-xs font-light">
                    Pour vous adresser votre étude chiffrée et convenir d&apos;un échange technique.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-white/70 font-medium">
                    Nom complet ou Société *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="M. ou Mme Nom..."
                      className={inputWithIconClasses}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] text-white/70 font-medium">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+216 -- --- ---"
                      className={inputWithIconClasses}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] text-white/70 font-medium">
                    Adresse e-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contact@exemple.com"
                      className={inputWithIconClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Canal de rappel préféré */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-white/70 font-medium">Canal de contact privilégié :</span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {CONTACT_PREF_TYPES.map(({ id, label, icon: Icon }) => {
                    const isActive = contactPref === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setContactPref(id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#E6A635] bg-[#E6A635]/20 text-[#F2BD52] shadow-[0_0_10px_rgba(230,166,53,0.2)]'
                            : 'border-[#E6A635]/20 bg-[#241812]/60 text-white/60 hover:text-white'
                        }`}
                      >
                        <Icon className="size-3.5 text-[#E6A635]" />
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── ACTION DE SOUMISSION FINALE ── */}
              <div className="pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-sheen flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold uppercase tracking-wider text-xs shadow-[0_8px_25px_rgba(230,166,53,0.35)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 cursor-pointer text-center"
                  >
                    {submitting ? (
                      <>
                        <div className="size-4 border-2 border-[#1A110B] border-t-transparent rounded-full animate-spin" />
                        <span>Transmission de votre dossier...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Transmettre mon dossier clé en main</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-center"
                  >
                    <MessageCircle className="size-4 fill-white/20" />
                    <span>Transmettre sur WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10.5px] sm:text-xs text-white/50 font-light pt-1 text-center">
                  <span className="text-[#F2BD52]">✦</span>
                  <span>Étude d&apos;implantation &amp; Plans Sur-Mesure sous 24-48h</span>
                  <span className="text-[#F2BD52] hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Déplacement sur toute la Tunisie</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message d'erreur d'étape */}
        {stepError && (
          <p className="mt-4 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-xl px-4 py-2.5">
            ⚠️ {stepError}
          </p>
        )}

        {/* Message d'erreur de soumission */}
        {error && (
          <p className="mt-4 text-xs text-red-300 bg-red-950/50 border border-red-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* ── BOUTONS DE NAVIGATION PRÉCÉDENT / CONTINUER (ÉTAPES 1 À 6) ── */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#E6A635]/15 mt-8 gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#E6A635]/30 bg-[#241812]/80 hover:bg-[#241812] text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer hover:border-[#E6A635]/60"
              >
                <ArrowLeft className="size-3.5" />
                <span>Précédent</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(230,166,53,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* Bouton Retour rapide pour l'étape 7 */}
        {currentStep === 7 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E6A635]/30 bg-[#241812]/60 hover:bg-[#241812] text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Modifier les étapes précédentes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
