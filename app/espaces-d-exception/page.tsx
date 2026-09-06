'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Building, Building2, Hotel, UtensilsCrossed, Sparkles, MapPin, ChevronRight, ChevronLeft, X, Play, Pause, Volume2, VolumeX, Image as ImageIcon, ArrowUpRight, Star, MessageCircle, Home, Lamp, DoorOpen, Sofa, Palette, CheckCircle2, Send, Phone, Mail, User, Hammer, Truck, Ruler, Eye, ZoomIn, Maximize2, Gem, Layers, Grid, Check, Compass, ShieldCheck, FileText, ArrowRight, Upload } from 'lucide-react'
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
/*  SMART ENRICHED PROJECT FORM — UNIFIED WALNUT & GOLD DESIGN               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ProjectRequestForm({ preselectedEspace }: { preselectedEspace?: string }) {
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
  const formRef = useRef<HTMLFormElement>(null)
  const submitAreaRef = useRef<HTMLDivElement>(null)
  const [showStickySubmit, setShowStickySubmit] = useState(false)

  // React to preselectedEspace if user clicked from a domain card
  useEffect(() => {
    if (preselectedEspace) {
      setSelectedEspace(preselectedEspace)
    }
  }, [preselectedEspace])

  // Track if the submit button area is visible — if not, show sticky bar
  useEffect(() => {
    if (submitted) return
    const el = submitAreaRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickySubmit(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [submitted])

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

      {/* ── STEP 1 — Type d'espace ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">1</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Quel est votre type d&apos;espace ?</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Sélectionnez la typologie de votre établissement ou résidence.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {ESPACE_TYPES.map(({ id, label, icon: Icon, desc }) => {
            const isActive = selectedEspace === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEspace(id)}
                className={`flex flex-col items-start gap-2.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'border-[#E6A635] bg-gradient-to-b from-[#E6A635]/20 to-[#3B271C]/90 shadow-[0_4px_20px_rgba(230,166,53,0.3)] ring-1 ring-[#E6A635]/50'
                    : 'border-[#E6A635]/20 bg-[#241812]/80 hover:border-[#E6A635]/60 hover:bg-[#3B271C]/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#E6A635] text-[#1A110B] shadow-md' : 'bg-[#3B271C] text-[#E6A635] border border-[#E6A635]/30'
                  }`}>
                    <Icon className="size-4.5" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[#F2BD52] bg-[#241812] px-2 py-0.5 rounded-full border border-[#E6A635]/50">
                      <Check className="size-3" /> Choisi
                    </span>
                  ) : null}
                </div>
                <div>
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight block ${isActive ? 'text-[#F2BD52]' : 'text-white/90'} transition-colors`}>{label}</span>
                  <span className="text-[9.5px] sm:text-[10px] text-white/50 font-light leading-snug mt-1 block line-clamp-2">{desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 2 — Style & Inspiration Architecturale ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">2</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Quel style &amp; inspiration architecturale recherchez-vous ?</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">L&apos;identité visuelle et l&apos;ambiance artistique souhaitée.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {STYLE_TYPES.map(({ id, label, icon: Icon, desc }) => {
            const isActive = selectedStyle === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedStyle(id)}
                className={`flex flex-col items-start gap-1.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_4px_20px_rgba(230,166,53,0.25)]'
                    : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`size-5 sm:size-6 ${isActive ? 'text-[#F2BD52]' : 'text-white/40'} transition-colors`} />
                  {isActive && <Check className="size-4 text-[#F2BD52]" />}
                </div>
                <span className={`text-[11px] sm:text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'} transition-colors mt-1`}>{label}</span>
                <span className="text-[9.5px] sm:text-[10px] text-white/50 font-light leading-tight">{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 3 — Éléments & Boiseries Souhaités ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">3</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Quels éléments &amp; boiseries souhaitez-vous façonner ?</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Sélectionnez tous les éléments applicables à votre aménagement.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
          {ELEMENTS_TYPES.map(({ id, label, icon: Icon }) => {
            const isActive = selectedElements.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleElement(id)}
                className={`inline-flex items-center gap-2 p-3 rounded-xl sm:rounded-2xl border-2 text-[11px] sm:text-xs font-semibold transition-all duration-300 cursor-pointer text-left ${
                  isActive
                    ? 'border-[#E6A635] bg-gradient-to-r from-[#F3C45E]/15 to-[#E6A635]/25 text-[#F2BD52] shadow-[0_2px_12px_rgba(230,166,53,0.2)] font-bold'
                    : 'border-[#E6A635]/20 bg-[#241812]/60 text-white/70 hover:border-[#E6A635]/50 hover:text-white'
                }`}
              >
                <Icon className="size-4 shrink-0 text-[#E6A635]" />
                <span className="flex-1 leading-snug">{label}</span>
                {isActive && <CheckCircle2 className="size-3.5 shrink-0 text-[#F2BD52]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 4 — Essences de Bois & Matières Nobles ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">4</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Quelles essences de bois &amp; finitions nobles préférez-vous ?</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Multi-sélection selon vos sensibilités de matières.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {MATIERES_TYPES.map(({ id, label, desc }) => {
            const isActive = selectedMatieres.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleMatiere(id)}
                className={`flex flex-col items-start gap-1 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_2px_15px_rgba(230,166,53,0.2)]'
                    : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'}`}>{label}</span>
                  {isActive && <CheckCircle2 className="size-3.5 text-[#F2BD52] shrink-0" />}
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-white/50 font-light leading-tight">{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 5 — État d'avancement & Option Déplacement ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">5</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Où en est votre projet ?</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Pour calibrer notre accompagnement technique et artistique.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          {AVANCEMENT_TYPES.map(({ id, label, desc }) => {
            const isActive = selectedAvancement === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedAvancement(id)}
                className={`flex flex-col items-start gap-1 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[#E6A635] bg-[#E6A635]/15 shadow-[0_2px_15px_rgba(230,166,53,0.2)]'
                    : 'border-[#E6A635]/20 bg-[#241812]/60 hover:border-[#E6A635]/50 hover:bg-[#241812]/90'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight ${isActive ? 'text-[#F2BD52]' : 'text-white/80'}`}>{label}</span>
                  {isActive && <Check className="size-4 text-[#F2BD52] shrink-0" />}
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-white/50 font-light leading-tight">{desc}</span>
              </button>
            )
          })}
        </div>

        {/* Option VIP Déplacement sur site */}
        <div 
          onClick={() => setDemandeVisite(!demandeVisite)}
          className={`p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start sm:items-center gap-3.5 ${
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
      </div>

      {/* ── STEP 6 — Localisation & Précisions ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">6</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Localisation &amp; Précisions du projet</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Indiquez la ville et les particularités de votre chantier.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#E6A635]/60" />
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                placeholder="Ville / Gouvernorat (ex: Tunis, Sidi Bou Saïd, Hammamet, Sousse...)"
                className={inputWithIconClasses}
              />
            </div>

            {/* Transmettre plans notice */}
            <div className="p-3.5 rounded-xl bg-[#241812]/80 border border-[#E6A635]/25 flex items-center gap-3">
              <Upload className="size-4 text-[#F2BD52] shrink-0" />
              <p className="text-[10.5px] sm:text-xs text-white/70 font-light leading-snug">
                <strong className="text-white font-medium">Plans ou photos disponibles ?</strong> Vous pourrez les transmettre directement par WhatsApp en un clic après l&apos;envoi.
              </p>
            </div>
          </div>

          <div className="md:col-span-1">
            <textarea
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              rows={3}
              placeholder="Précisez votre vision, vos contraintes architecturales ou les inspirations souhaitées..."
              className={`${inputClasses} resize-none h-full min-h-[95px]`}
            />
          </div>
        </div>
      </div>

      {/* ── STEP 7 — Vos Coordonnées & Canal Préféré ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#F3C45E] to-[#C78318] text-[#1A110B] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md">7</div>
          <div>
            <h3 className="text-white font-heading text-base sm:text-lg font-medium">Vos coordonnées de contact</h3>
            <p className="text-white/50 text-[10.5px] sm:text-xs font-light">Pour vous adresser votre étude et convenir d&apos;un échange.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
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

        {/* Canal de rappel préféré */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] sm:text-xs text-white/60 font-light mr-1">Canal de contact privilégié :</span>
          {CONTACT_PREF_TYPES.map(({ id, label, icon: Icon }) => {
            const isActive = contactPref === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setContactPref(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] sm:text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#E6A635] bg-[#E6A635]/20 text-[#F2BD52]'
                    : 'border-[#E6A635]/20 bg-[#241812]/60 text-white/60 hover:text-white'
                }`}
              >
                <Icon className="size-3 text-[#E6A635]" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-950/50 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* ── SUBMIT & WHATSAPP ACTION BUTTONS ── */}
      <div ref={submitAreaRef} className="pt-2 space-y-3">
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
                <span>Envoyer Ma Demande de Projet d&apos;Exception</span>
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

      {/* ── STICKY MOBILE SUBMIT BAR ── */}
      <AnimatePresence>
        {showStickySubmit && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-40 sm:hidden p-3 bg-gradient-to-t from-[#241812] via-[#241812]/98 to-[#241812]/90 backdrop-blur-xl border-t border-[#E6A635]/30 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
          >
            <button
              type="submit"
              disabled={submitting}
              className="btn-sheen w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] font-bold uppercase tracking-wider text-xs shadow-lg cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="size-4 border-2 border-[#1A110B] border-t-transparent rounded-full animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Envoyer Ma Demande</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const hasVideo = Boolean(project.video || project.videoUrl)
  const videoSrc = project.video || project.videoUrl || ''

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const categoryLabel = filterTypes.find(t => t.id === project.type)?.label || project.type

  return (
    <div
      onClick={() => onOpen(project)}
      className="group relative flex flex-col h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#342318]/95 via-[#2A1C14]/95 to-[#1F140E]/98 border border-[#E6A635]/30 hover:border-[#E6A635]/80 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_22px_55px_rgba(0,0,0,0.85)] transition-all duration-500 cursor-pointer hover:-translate-y-1.5"
    >
      {/* ── Cadre Média 16:10 ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#160E0A] shrink-0">
        {activeMedia === 'video' && hasVideo ? (
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <video
              ref={videoRef}
              src={videoSrc}
              muted={isMuted}
              autoPlay
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
            {/* Commandes Vidéo Inline */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
              <button
                type="button"
                onClick={toggleVideoPlay}
                className="size-8 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/50 text-[#F2BD52] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                aria-label={isPlaying ? "Pause" : "Lecture"}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current ml-0.5" />}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="size-8 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/50 text-[#F2BD52] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMedia('image')}
                  className="px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[10px] uppercase font-bold text-white hover:text-[#F2BD52] transition-colors"
                >
                  Photo
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={project.image || (project.gallery && project.gallery[0]) || '/project-hotel.png'}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F140E] via-[#1F140E]/25 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

            {/* Badges Flottants Haut */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              {project.location ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A110B]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] font-semibold backdrop-blur-md shadow-md">
                  <MapPin className="size-3 text-[#E6A635]" />
                  <span>{project.location}</span>
                </div>
              ) : <div />}

              {/* Bouton switcher vidéo si disponible */}
              {hasVideo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMedia('video')
                  }}
                  className="pointer-events-auto group/vid inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A110B]/95 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-105"
                >
                  <Play className="size-3 fill-current" />
                  <span>Aperçu Vidéo</span>
                </button>
              )}
            </div>

            {/* Pastille nombre de photos si galerie multiple */}
            {project.gallery && project.gallery.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A110B]/85 border border-white/20 text-white/85 text-[10px] font-medium backdrop-blur-md">
                <ImageIcon className="size-3 text-[#E6A635]" />
                <span>{project.gallery.length} photos</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Corps de la Carte ── */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 text-left">
        <div>
          {/* Tag Catégorie */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#241812] border border-[#E6A635]/35 text-[#F2BD52] text-[9.5px] uppercase tracking-wider font-bold">
              <Sparkles className="size-2.5 text-[#E6A635]" />
              <span>{categoryLabel}</span>
            </span>
          </div>

          {/* Titre */}
          <h3 className="font-heading text-lg sm:text-xl text-white font-normal leading-snug group-hover:text-[#F2BD52] transition-colors mb-2 line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-white/80 text-xs sm:text-[13px] font-light leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Aménagements réalisés (Pills) */}
          {project.details && project.details.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {project.details.slice(0, 3).map((detail: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-[#241812]/90 border border-[#E6A635]/20 text-[10px] text-white/80 font-light truncate max-w-[200px]"
                >
                  {detail}
                </span>
              ))}
              {project.details.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-[#241812]/60 text-[10px] text-[#F2BD52] font-semibold">
                  +{project.details.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-[#E6A635]/20 flex items-center justify-between text-xs text-[#F2BD52] font-semibold mt-auto">
          <span className="inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Explorer le projet</span>
            <ArrowRight className="size-3.5" />
          </span>
          <span className="size-7 rounded-full bg-[#241812] border border-[#E6A635]/35 flex items-center justify-center text-[#F2BD52] group-hover:bg-[#E6A635] group-hover:text-[#1A110B] group-hover:rotate-45 transition-all">
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await publicApi.getProjects()
        if (data && data.length > 0) {
          const mapped = data.map((p) => {
            const normType = normalizeCategory(p.category)
            return {
              id: p.id,
              title: p.title,
              location: p.location || 'Tunisie',
              type: normType,
              category: p.category || 'Projet Clé en Main',
              image: p.imageUrl || '/project-hotel.png',
              description: p.description || '',
              details: p.details ? p.details.split(',').map(d => d.trim()).filter(Boolean) : ['Aménagement d\'artisanat d\'art'],
              gallery: [p.imageUrl || '/project-hotel.png'],
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
    setActiveImageIdx(0)
    setIsPlaying(false)
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
      {/* Unified Background */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-espace-exception.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />
      
      {/* Amber Glow Halos */}
      <div className="absolute top-1/4 left-1/4 size-[450px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

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
                className="relative w-full max-w-5xl bg-gradient-to-br from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/45 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row max-h-[92vh] overflow-hidden"
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

                {/* LEFT COLUMN: Media */}
                <div className="w-full md:w-[55%] flex flex-col border-b md:border-b-0 md:border-r border-[#E6A635]/20 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-thin">

                  {/* Main Large Image — Click to zoom */}
                  <div
                    onClick={() => setLightboxProject({
                      images: selectedProject.gallery,
                      currentIndex: activeImageIdx,
                      title: selectedProject.title
                    })}
                    className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E6A635]/30 bg-[#1A110B] cursor-zoom-in group/img"
                  >
                    <Image
                      src={selectedProject.gallery[activeImageIdx]}
                      alt={selectedProject.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover/img:scale-105"
                    />
                    
                    {/* Zoom indicator badge */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#241812]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-[10px] font-semibold shadow-md pointer-events-none group-hover/img:bg-[#E6A635] group-hover/img:text-[#1A110B] transition-colors">
                      <ZoomIn className="size-3 sm:size-3.5" />
                      <span>Agrandir</span>
                    </div>

                    {/* Gallery nav arrows */}
                    {selectedProject.gallery.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIdx(i => i === 0 ? selectedProject.gallery.length - 1 : i - 1)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIdx(i => i === selectedProject.gallery.length - 1 ? 0 : i + 1)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-[#241812]/80 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-white hover:text-[#F2BD52] transition-colors cursor-pointer"
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {selectedProject.gallery.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 sm:w-20 aspect-[16/10] rounded-lg sm:rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIdx === idx ? 'border-[#E6A635] shadow-[0_0_10px_rgba(230,166,53,0.3)] scale-[0.97]' : 'border-[#E6A635]/20 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <Image src={img} alt="Miniature" fill className="object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Video Player — displayed on all screens including mobile */}
                  {(selectedProject.video || selectedProject.videoUrl) && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] text-[#F2BD52]/70 font-bold text-left">Aperçu Vidéo de l&apos;Atelier</h4>
                      <div className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E6A635]/20 bg-[#1A110B] shadow-inner group/video">
                        <video
                          ref={videoRef}
                          src={selectedProject.video || selectedProject.videoUrl}
                          muted
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div
                          onClick={togglePlay}
                          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group-hover/video:bg-black/40 transition-colors"
                        >
                          <div className="size-11 sm:size-12 rounded-full bg-[#E6A635]/90 text-[#1A110B] flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                            {isPlaying ? (
                              <div className="flex gap-1">
                                <div className="w-1 h-4 bg-[#1A110B] rounded-full" />
                                <div className="w-1 h-4 bg-[#1A110B] rounded-full" />
                              </div>
                            ) : (
                              <Play className="size-5 fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Details, Review, CTA */}
                <div className="w-full md:w-[45%] flex flex-col justify-between overflow-y-auto p-4 sm:p-6 md:p-7 space-y-5 text-left scrollbar-thin">

                  {/* Meta */}
                  <div className="space-y-3 sm:space-y-4">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] text-[9.5px] sm:text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full font-bold shadow-sm">
                      <Sparkles className="size-2.5" />
                      {FILTER_TYPES.find(t => t.id === selectedProject.type)?.label || selectedProject.type}
                    </span>

                    <h3 className="font-heading text-2xl sm:text-3xl text-gold-gradient font-light leading-tight">
                      {selectedProject.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#F2BD52]/80">
                      <MapPin className="size-3.5 text-[#E6A635]" />
                      {selectedProject.location}
                    </div>

                    <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed">
                      {selectedProject.description}
                    </p>

                    {/* Works pills */}
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-[#F2BD52]/60 font-bold mb-2">Réalisations incluses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.details.map((detail: string, idx: number) => (
                          <span key={idx} className="bg-[#241812] border border-[#E6A635]/20 px-2.5 py-1 rounded-lg text-[10px] text-white/75 font-light">
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Testimonial — hidden on mobile */}
                  {selectedProject.review && (
                    <div className="hidden sm:block bg-[#241812]/80 border border-[#E6A635]/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5">
                      <div className="flex gap-0.5">
                        {[...Array(selectedProject.review.rating)].map((_, i) => (
                          <Star key={i} className="size-3 sm:size-3.5 fill-[#E6A635] text-[#E6A635]" />
                        ))}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/60 italic leading-relaxed">
                        &quot;{selectedProject.review.comment}&quot;
                      </p>
                      <div className="border-t border-[#E6A635]/15 pt-2 flex flex-col">
                        <span className="text-xs font-semibold text-white">{selectedProject.review.author}</span>
                        <span className="text-[10px] text-white/40">{selectedProject.review.role}</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-[#E6A635]/15 space-y-2.5">
                    <a
                      href={`https://wa.me/21655743760?text=${encodeURIComponent(
                        `Bonjour Maison Aschi, j'ai vu votre réalisation "${selectedProject.title}" et je souhaite une étude d'aménagement similaire pour mon établissement.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white px-6 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <MessageCircle className="size-4 fill-white/20" />
                      Demander une Étude sur WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        handleCloseProject()
                        setTimeout(() => {
                          document.getElementById('demande-projet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 300)
                      }}
                      className="btn-sheen w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-6 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
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
                      <Image src={img} alt="Miniature" fill className="object-cover" />
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
