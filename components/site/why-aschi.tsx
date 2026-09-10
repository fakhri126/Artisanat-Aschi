'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from './reveal'
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Compass, 
  Clock, 
  MessageCircle, 
  FileText, 
  ArrowRight,
  Gem,
  Trees,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Wand2
} from 'lucide-react'

interface StatProps {
  value: number
  suffix: string
  label: string
  sublabel: string
}

function StatNumber({ value, suffix, label, sublabel }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setCount(Math.floor(latest))
      })
      return () => controls.stop()
    }
  }, [isInView, value])

  const formattedCount = value >= 1000 ? count.toLocaleString('fr-FR') : count

  return (
    <div ref={ref} className="text-center p-2 sm:p-3">
      <div className="font-sans font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gold-gradient tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        {formattedCount}
        <span className="text-[#F2BD52] font-sans font-light ml-0.5 text-base sm:text-xl md:text-2xl">{suffix}</span>
      </div>
      <div className="text-[10.5px] sm:text-xs uppercase tracking-[0.14em] text-[#F2BD52] font-bold mt-0.5 sm:mt-1">
        {label}
      </div>
      <div className="text-[9.5px] sm:text-[11px] text-white/85 drop-shadow font-normal mt-0.5 hidden sm:block">
        {sublabel}
      </div>
    </div>
  )
}

const ATELIER_SPECIALTIES = [
  {
    id: 'pieces-disponibles',
    title: 'Pièces Disponibles',
    tag: 'En Stock Atelier',
    desc: 'Mobilier d’art sculpté prêt pour livraison immédiate.',
    cta: 'Voir le Stock',
    href: '/creations',
    image: '/buffet_blanc_face_hd.jpg',
    icon: Sparkles,
  },
  {
    id: 'bijoux-de-porte',
    title: 'Bijoux de Porte',
    tag: 'Céramique & Laiton',
    desc: 'Poignées, boutons & clous d’art peints à la main.',
    cta: 'Découvrir la Collection',
    href: '/bijoux-de-porte',
    image: '/bijoux-de-porte.jpg',
    icon: CircleDot,
  },
  {
    id: 'catalogue',
    title: 'Catalogue Sur-Mesure',
    tag: 'Fabrication Sur Commande',
    desc: '+90 créations sculpturales adaptées à vos dimensions.',
    cta: 'Explorer le Catalogue',
    href: '/catalogue',
    image: '/prod1.jpg',
    icon: Compass,
  },
  {
    id: 'relooking',
    title: 'Relooking d’Art',
    tag: 'Restauration Noble',
    desc: 'Seconde vie et sublimation de vos meubles anciens.',
    cta: 'Découvrir le Relooking',
    href: '/relooking',
    image: '/relooking_service.jpg',
    icon: Wand2,
  },
]

export function WhyAschi() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const statsList = [
    { value: 65, suffix: ' Ans', label: "D'Expérience", sublabel: "Atelier familial depuis 1960" },
    { value: 1500, suffix: '+', label: 'Espaces Aménagés', sublabel: "Villas, hôtels & bureaux" },
    { value: 3000, suffix: '+', label: 'Créations Uniques', sublabel: "Portes, salons & mobilier d'art" },
    { value: 100, suffix: '%', label: 'Bois Massif Garanti', sublabel: "Noyer noble séché à cœur" }
  ]

  const engagements = [
    {
      id: 1,
      tag: "01 • Le Matériau",
      tabTitle: "100% Noyer Massif",
      title: "Du Vrai Bois de Noyer Massif",
      desc: "Nous utilisons uniquement du bois de noyer noble bien séché à cœur. Vos meubles ne bougent pas avec le temps, résistent à l'humidité et durent toute une vie.",
      image: "/images/raw-sculptures.jpg",
      icon: <Trees className="size-4 text-[#F2BD52]" />
    },
    {
      id: 2,
      tag: "02 • Le Travail Manuel",
      tabTitle: "Sculpté à la Main",
      title: "100% Fait Main depuis 1960",
      desc: "Chaque motif, arabesque et détail est sculpté à la main par nos maîtres artisans. C'est ce travail d'artisan qui donne à chaque pièce son âme et son authenticité.",
      image: "/news-exposition.jpg",
      icon: <Award className="size-4 text-[#F2BD52]" />
    },
    {
      id: 3,
      tag: "03 • Le Sur-Mesure",
      tabTitle: "Plans 3D Gratuits",
      title: "Meubles Sur-Mesure avec Plan 3D sous 24h",
      desc: "Vous choisissez vos dimensions, vos formes et vos couleurs. Nous réalisons un plan 3D réaliste pour que vous puissiez voir votre futur meuble avant sa fabrication.",
      image: "/project-villa.png",
      icon: <Compass className="size-4 text-[#F2BD52]" />
    },
    {
      id: 4,
      tag: "04 • Les Finitions",
      tabTitle: "Finitions d'Art",
      title: "Cuivre, Céramique & Poignées d'Art",
      desc: "Nous sublimons nos meubles avec de superbes finitions : poignées en céramique peintes à la main, ferronneries en cuivre martelé et touches dorées raffinées.",
      image: "/images/luminaire-cuivre-bois.jpg",
      icon: <Gem className="size-4 text-[#F2BD52]" />
    }
  ]

  // Autoplay (every 5 seconds)
  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % engagements.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay, engagements.length])

  const nextSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev + 1) % engagements.length)
  }

  const prevSlide = () => {
    setAutoplay(false)
    setCurrentIndex((prev) => (prev - 1 + engagements.length) % engagements.length)
  }

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const currentItem = engagements[currentIndex]

  return (
    <section id="pourquoi-aschi" className="relative overflow-hidden bg-transparent py-10 sm:py-16 lg:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE CLAIR & COMPRÉHENSIBLE                                         */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B271C]/95 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Pourquoi Choisir Artisanat Aschi ?</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light leading-tight text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight">
              L&apos;Art du Vrai Bois Massif <br className="hidden sm:inline" />
              <span className="font-serif italic text-white font-normal text-xl sm:text-3xl md:text-4xl block sm:inline mt-0.5 sm:mt-0">
                &amp; du Meuble Sur-Mesure
              </span>
            </h2>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATISTIQUES EN HAUT (Espaces Aménagés & Créations Uniques)             */}
        {/* ========================================================================= */}
        <Reveal delay={100} className="mb-6 sm:mb-8">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/40 bg-[#3B271C]/95 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6A635]/20">
              {statsList.map((stat, i) => (
                <StatNumber
                  key={i}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  sublabel={stat.sublabel}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* ========================================================================= */}
        {/* 3. CARROUSEL : Grande Image & Textes Simples                              */}
        {/* ========================================================================= */}
        <div className="relative mb-6 sm:mb-8">
          
          {/* Onglets rapides sur Desktop/Tablette */}
          <div className="hidden sm:grid grid-cols-4 gap-2.5 mb-4">
            {engagements.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setAutoplay(false)
                  setCurrentIndex(idx)
                }}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[#3B271C] border-[#E6A635] text-[#F2BD52] shadow-lg scale-[1.02]'
                    : 'bg-[#241812]/90 border-[#E6A635]/25 text-white/75 hover:bg-[#3B271C]/80 hover:text-white'
                }`}
              >
                <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  idx === currentIndex ? 'bg-[#241812] border-[#E6A635]' : 'bg-[#1A110B] border-[#E6A635]/20'
                }`}>
                  {item.icon}
                </div>
                <div className="truncate">
                  <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#F2BD52] block">
                    0{item.id}
                  </span>
                  <span className="text-xs font-heading font-medium truncate block">
                    {item.tabTitle}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Diapositive Active */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E6A635]/50 bg-[#241812] shadow-[0_20px_60px_rgba(0,0,0,0.85)] group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative h-[380px] sm:h-[430px] md:h-[480px] w-full flex flex-col justify-between p-4 sm:p-7 md:p-9"
              >
                {/* Background Image */}
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/98 via-[#1A110B]/70 to-[#1A110B]/30 z-10 pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="relative z-20 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241812]/95 backdrop-blur-md border border-[#E6A635]/50 text-[#F2BD52] text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] shadow-lg">
                    {currentItem.icon}
                    <span>{currentItem.tag}</span>
                  </div>

                  <div className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold bg-[#241812]/90 px-3 py-1 rounded-full border border-[#E6A635]/30">
                    <span>0{currentIndex + 1}</span>
                    <span className="text-white/40 mx-1">/</span>
                    <span className="text-white/60">0{engagements.length}</span>
                  </div>
                </div>

                {/* Bottom Integrated Content */}
                <div className="relative z-20 text-white max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.16em] text-[#F2BD52] mb-1.5">
                    <ShieldCheck className="size-3.5 text-[#E6A635]" />
                    <span>Garantie Qualité Maison Aschi</span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-3xl md:text-4xl font-light text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mb-2 group-hover:text-[#F2BD52] transition-colors">
                    {currentItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal leading-relaxed">
                    {currentItem.desc}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Flèches de navigation sur l'image */}
            <button
              onClick={prevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Précédent"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-[#241812]/85 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] border border-[#E6A635]/50 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer"
              aria-label="Suivant"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Dots / Puces de progression en bas */}
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            {engagements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAutoplay(false)
                  setCurrentIndex(idx)
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 sm:w-8 h-1.5 bg-gradient-to-r from-[#F3C45E] to-[#E6A635]'
                    : 'w-1.5 h-1.5 bg-[#E6A635]/30 hover:bg-[#E6A635]/70'
                }`}
                aria-label={`Voir l'engagement ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. LES 4 SAVOIR-FAIRE DE L'ATELIER (4 LOGOS RONDS CTA & PRÉSENTATION)     */}
        {/* ========================================================================= */}
        <Reveal delay={140}>
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/45 bg-gradient-to-b from-[#3B271C]/95 via-[#2C1C13]/95 to-[#241812]/95 backdrop-blur-2xl p-5 sm:p-7 md:p-9 shadow-2xl">
            {/* Halo doré d'ambiance en arrière-plan */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-[#E6A635]/12 blur-3xl pointer-events-none" />

            {/* Message bien formulé d'introduction de l'Atelier */}
            <div className="relative z-10 text-center max-w-2xl mx-auto mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] sm:text-xs uppercase tracking-[0.18em] font-semibold mb-2.5 shadow-sm">
                <Sparkles className="size-3.5 text-[#F2BD52]" />
                <span>Excellence Artisanale Depuis 1960</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl text-gold-gradient font-light leading-tight">
                Voici Tout Ce Que Façonne Notre Atelier
              </h3>
              <p className="text-white/85 text-xs sm:text-sm md:text-base font-normal mt-2 leading-relaxed">
                De la création sur-mesure aux pièces d&apos;art prêtes à emporter, jusqu&apos;à la métamorphose de votre mobilier d&apos;héritage : explorez nos 4 grands métiers d&apos;art façonnés à la main.
              </p>
            </div>

            {/* Grille des 4 Logos Ronds Cliquables Pro (Call to Action) */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
              {ATELIER_SPECIALTIES.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-[#241812]/65 hover:bg-[#3B271C]/70 border border-[#E6A635]/25 hover:border-[#E6A635]/70 transition-all duration-300 shadow-md hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer"
                  >
                    {/* Logo Rond Médaillon */}
                    <div className="relative mb-3">
                      <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#E6A635]/0 via-[#E6A635]/25 to-[#FFE08A]/0 opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 pointer-events-none" />
                      
                      <div className="relative size-24 sm:size-28 md:size-32 rounded-full p-[2.5px] sm:p-[3px] bg-gradient-to-b from-[#F3C45E] via-[#E6A635] to-[#7A4B10] shadow-[0_6px_20px_rgba(0,0,0,0.65)] group-hover:shadow-[0_0_28px_rgba(242,189,82,0.7)] group-hover:scale-105 transition-all duration-500">
                        <div className="relative size-full rounded-full overflow-hidden border-2 border-[#1A110B] bg-[#1A110B]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100px, 140px"
                            className="object-cover object-center group-hover:scale-115 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:from-black/55 transition-colors duration-500" />
                          
                          {/* Pastille icône au centre */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="size-8 sm:size-9 md:size-10 rounded-full bg-[#1A110B]/85 border border-[#E6A635]/75 text-[#F2BD52] flex items-center justify-center shadow-lg backdrop-blur-md group-hover:bg-gradient-to-tr group-hover:from-[#D89B28] group-hover:via-[#F2BD52] group-hover:to-[#FFE08A] group-hover:text-[#1A110B] group-hover:border-white/80 group-hover:scale-110 transition-all duration-300">
                              <Icon className="size-4 sm:size-4.5 md:size-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tag */}
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#E6A635]">
                      {item.tag}
                    </span>

                    {/* Titre */}
                    <h4 className="font-heading text-xs sm:text-sm md:text-base font-medium text-white group-hover:text-[#F2BD52] transition-colors duration-300 mt-1 leading-snug">
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p className="text-[10.5px] sm:text-[11.5px] text-white/70 font-normal mt-1 leading-relaxed max-w-[200px] hidden sm:block">
                      {item.desc}
                    </p>

                    {/* Bouton CTA Pilule Pro */}
                    <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-[11px] font-bold uppercase tracking-[0.12em] bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] group-hover:bg-gradient-to-r group-hover:from-[#F3C45E] group-hover:via-[#E6A635] group-hover:to-[#C78318] group-hover:text-[#1A110B] group-hover:border-transparent group-hover:shadow-[0_4px_16px_rgba(230,166,53,0.45)] transition-all duration-300">
                      <span>{item.cta}</span>
                      <ArrowRight className="size-2.5 sm:size-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Barre de contact rapide en bas */}
            <div className="relative z-10 mt-6 pt-5 border-t border-[#E6A635]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#F2BD52]">
                  Vous avez un projet sur-mesure ou une idée spécifique ?
                </span>
                <p className="text-[11px] sm:text-xs text-white/70 font-normal">
                  Devis gratuit et modélisation 3D sous 24h par nos maîtres ébénistes.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Link
                  href="/custom-creation"
                  className="btn-sheen inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] shadow-md transition-all hover:scale-105 text-center"
                >
                  <FileText className="size-3 text-[#1A110B]" />
                  <span>Devis 3D</span>
                </Link>

                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E6A635]/45 bg-[#241812]/95 hover:bg-[#4E3425] hover:text-[#F2BD52] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all shadow-md text-center"
                >
                  <MessageCircle className="size-3 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  )
}
