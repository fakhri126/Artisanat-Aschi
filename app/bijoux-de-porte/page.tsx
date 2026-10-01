'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, DoorOpen, Sofa, Palette, Hammer, Shield, CheckCircle2, X, ArrowRight, Phone, MessageCircle, Truck, ZoomIn, Ruler, Send } from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { MobileFloatingVIP } from '@/components/site/mobile-floating-vip'
import { publicApi } from '@/lib/api'
import { formatImageUrl } from '@/lib/utils'

// Types TypeScript
export type MainCategory = 'portes' | 'meubles'
export type DoorHandleType = 'ceramique' | 'sculptee' | 'cache_serrure'
export type FurnitureHandleType = 'ceramique' | 'sculptee'
export type CeramicFurnitureSize = 'all' | 'grand' | 'moyen' | 'ovale'

interface BoardModel {
  id: string
  title: string
  subtitle: string
  category: MainCategory
  subType: string
  sizeCategory?: CeramicFurnitureSize
  image: string
  dimensions?: string
  description: string
  idealFor: string
  tags: string[]
}

const DOOR_TABS = [
  {
    id: 'ceramique' as DoorHandleType,
    label: 'Poignée Céramique',
    icon: Palette,
    description: "Grandes rosaces d'apparat en majolique émaillée peinte main, serties sur embase en bois noble ou fer forgé pour portes d'entrée.",
  },
  {
    id: 'sculptee' as DoorHandleType,
    label: 'Poignée Sculptée',
    icon: Hammer,
    description: "Grands tirants de porte monumentale sculptés dans la masse en noyer massif séché, ciselés à la main selon les motifs traditionnels andalous.",
  },
  {
    id: 'cache_serrure' as DoorHandleType,
    label: 'Cache Serrure',
    icon: Shield,
    description: "Plaques ornementales sculptées à moucharabieh pour habiller et dissimuler élégamment vos serrures d'apparat, sonnettes et visiophones.",
  },
]

const FURNITURE_TABS = [
  { id: 'ceramique' as FurnitureHandleType, label: 'Poignées Céramique', icon: Palette },
  { id: 'sculptee' as FurnitureHandleType, label: 'Poignées Sculptées', icon: Hammer },
]

const CERAMIC_SIZES: { id: CeramicFurnitureSize; label: string }[] = [
  { id: 'all', label: 'Tous les formats' },
  { id: 'grand', label: 'Grand (6 à 7 cm)' },
  { id: 'moyen', label: 'Moyenne (3 à 4 cm)' },
  { id: 'ovale', label: 'Ovale (7 x 4 cm)' },
]

const INITIAL_STUDY_FORM = {
  fullName: '',
  phone: '',
  city: '',
  typeChoice: 'Poignée Céramique de Porte',
  dimensions: '',
  notes: '',
}

export default function BijouxDePortePage() {
  // Planches et modèles synchronisés avec le Dashboard
  const [boards, setBoards] = useState<BoardModel[]>([])

  // 1. Univers et filtres
  const [mainCat, setMainCat] = useState<MainCategory>('portes')
  const [doorType, setDoorType] = useState<DoorHandleType>('ceramique')
  const [furnitureType, setFurnitureType] = useState<FurnitureHandleType>('ceramique')
  const [ceramicSize, setCeramicSize] = useState<CeramicFurnitureSize>('all')

  // 2. Modales (Zoom plein écran & Étude sur-mesure)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)
  const [showDoorStudyModal, setShowDoorStudyModal] = useState(false)
  const [doorStudyData, setDoorStudyData] = useState(INITIAL_STUDY_FORM)
  const [doorStudySent, setDoorStudySent] = useState(false)
  const [doorStudyLoading, setDoorStudyLoading] = useState(false)

  const [loading, setLoading] = useState(true)

  // Synchronisation initiale URL & Supabase
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    if (hash === '#meubles' || params.get('cat') === 'meubles') setMainCat('meubles')
    else if (hash === '#portes' || params.get('cat') === 'portes') setMainCat('portes')

    async function fetchBoards() {
      try {
        setLoading(true)
        const res = await fetch('/api/bijoux-de-porte')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            // Détection si l'utilisateur a des images personnalisées placées dans son localStorage
            try {
              const localSaved = localStorage.getItem('aschi_bijoux_boards_user_v1') || localStorage.getItem('aschi_bijoux_boards')
              if (localSaved) {
                const parsed = JSON.parse(localSaved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const hasCustomImages = parsed.some(lb => {
                    const sb = data.find(d => d.id === lb.id)
                    return sb && sb.image !== lb.image
                  })
                  if (hasCustomImages) {
                    console.log('🔄 Images personnalisées détectées dans le navigateur : mise à jour de Supabase en cours...')
                    setBoards(parsed)
                    // Synchronisation vers Supabase en arrière-plan pour écraser les anciennes images
                    for (const lb of parsed) {
                      fetch('/api/bijoux-de-porte', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(lb)
                      }).catch(() => {})
                    }
                    return
                  }
                }
              }
            } catch (e) {
              console.error('Erreur lecture localStorage:', e)
            }

            setBoards(data)
            return
          }
        }
      } catch (err) {
        console.error('Erreur chargement Supabase bijoux-de-porte:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBoards()
  }, [])

  // Fermeture des modales via Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null)
        setShowDoorStudyModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filtrage optimisé et mémoïsé (évite les recalculs inutiles lors de la saisie)
  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      if (board.category !== mainCat) return false
      if (mainCat === 'portes') {
        return board.subType === doorType || (doorType === 'cache_serrure' && board.subType === 'cache_cellule')
      }
      if (board.subType !== furnitureType) return false
      return furnitureType !== 'ceramique' || ceramicSize === 'all' || board.sizeCategory === ceramicSize || board.sizeCategory === 'all'
    })
  }, [boards, mainCat, doorType, furnitureType, ceramicSize])

  // Fonctions de formulaire
  const handleStudyInput = (field: keyof typeof INITIAL_STUDY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setDoorStudyData(prev => ({ ...prev, [field]: e.target.value }))

  const closeStudyModal = () => {
    setShowDoorStudyModal(false)
    setDoorStudySent(false)
  }

  const handleDoorStudySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setDoorStudyLoading(true)
    try {
      const message = `[Demande d'étude sur-mesure - Poignée de Porte]\nType: ${doorStudyData.typeChoice}\nNom: ${doorStudyData.fullName}\nTél: ${doorStudyData.phone}\nVille: ${doorStudyData.city || 'Non spécifiée'}\nDimensions: ${doorStudyData.dimensions || 'À définir'}\nPrécisions: ${doorStudyData.notes || 'Aucune'}`

      await publicApi.submitQuoteRequest({
        fullName: doorStudyData.fullName,
        phoneNumber: doorStudyData.phone,
        email: 'etude-porte@artisanat-aschi.com',
        message,
      })
      setDoorStudySent(true)
    } catch (err) {
      console.error('Transmission locale de l\'étude porte:', err)
      setDoorStudySent(true)
    } finally {
      setDoorStudyLoading(false)
    }
  }, [doorStudyData])

  return (
    <main className="min-h-screen flex flex-col text-[#F7F4EE] font-sans relative overflow-hidden bg-[#241812]">
      {/* 🌟 FOND MAÎTRE SCROLLABLE UNIFORME (Luminosité constante sur toute la page, sans dégradé) */}
      <div className="absolute inset-0 z-0 opacity-75 brightness-80 pointer-events-none bg-[url('/images/bg-bijoux-porte-sculptee.jpg')] bg-[length:260px_auto] sm:bg-[length:320px_auto] md:bg-[length:360px_auto] lg:bg-[length:400px_auto] bg-top bg-repeat bg-performance-layer transform-gpu" />
      {/* Voile d'ombrage plat et uniforme (100% même luminosité de haut en bas, aucun dégradé) */}
      <div className="absolute inset-0 bg-[#241812]/65 pointer-events-none z-0" />

      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center pt-24 sm:pt-36 pb-14 sm:pb-20 px-3 sm:px-6 max-w-7xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* EN-TÊTE PRINCIPAL : L'ARTISANAT DU BIJOU DE PORTE & MEUBLE                 */}
        {/* ========================================================================= */}
        <section className="text-center max-w-3xl mx-auto mb-6 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#E6A635]/15 border border-[#E6A635]/35 text-[#F2BD52] text-[9.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] mb-2.5 sm:mb-4 font-bold shadow-sm">
            <Sparkles className="size-3 sm:size-3.5 text-[#E6A635] animate-pulse" />
            Atelier d&apos;Artisanat d&apos;Art Aschi
          </div>

          <h1 className="font-heading text-2xl sm:text-5xl lg:text-6xl text-gold-gradient mb-2 sm:mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] font-normal sm:font-light tracking-tight sm:tracking-normal">
            Bijoux de Portes &amp; Poignées
          </h1>

          <p className="text-white/75 text-[11.5px] sm:text-sm md:text-base leading-relaxed font-light max-w-xl sm:max-w-2xl mx-auto px-2">
            Façonnées à la main par nos maîtres artisans : céramique majolique émaillée et bois noble sculpté. 
            Découvrez nos collections d&apos;artisanat d&apos;art pour portes monumentales et poignées de meuble.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* SÉLECTEUR MAÎTRE NIVEAU 1 : 2 GRANDS TYPES (PORTES vs MEUBLES)           */}
        {/* ========================================================================= */}
        <section className="w-full max-w-4xl mx-auto mb-8 sm:mb-16">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
            
            {/* Type 1 : Poignées de Portes */}
            <button
              type="button"
              onClick={() => setMainCat('portes')}
              className={`group relative flex flex-col text-left rounded-xl sm:rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                mainCat === 'portes'
                  ? 'ring-2 ring-[#E6A635] shadow-[0_12px_40px_rgba(230,166,53,0.35)] bg-gradient-to-b from-[#3B271C] via-[#2A1C14] to-[#1A110B] scale-[1.01]'
                  : 'border border-white/10 hover:border-[#E6A635]/60 hover:shadow-xl bg-[#241812]/85 opacity-80 hover:opacity-100 hover:scale-[1.005]'
              }`}
            >
              {/* Image Visuelle */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#1A110B]">
                <Image
                  src="/poignees/type_poignee_porte.jpg"
                  alt="Poignées de Portes"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241812] via-transparent to-black/30" />
                
                {/* Badge d'état Actif / Découvrir */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                  {mainCat === 'portes' ? (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[8.5px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-lg">
                      <CheckCircle2 className="size-2.5 sm:size-3.5 shrink-0" />
                      <span className="hidden sm:inline">Univers Sélectionné</span>
                      <span className="sm:hidden">Choisi</span>
                    </span>
                  ) : (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#1A110B]/85 border border-white/20 text-white/80 text-[8.5px] sm:text-[11px] font-medium flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm group-hover:border-[#E6A635] group-hover:text-[#F2BD52] transition-colors">
                      <span>Découvrir</span>
                      <ArrowRight className="size-2 sm:size-3 shrink-0" />
                    </span>
                  )}
                </div>
              </div>

              {/* Contenu Texte */}
              <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-1 sm:space-y-2.5">
                <div>
                  <h2 className="font-heading text-xs sm:text-2xl text-white group-hover:text-[#F2BD52] transition-colors flex items-center gap-1.5 sm:gap-2.5 font-medium leading-tight">
                    <DoorOpen className={`size-3.5 sm:size-6 shrink-0 ${mainCat === 'portes' ? 'text-[#E6A635]' : 'text-white/60 group-hover:text-[#E6A635]'}`} />
                    <span>Poignées de Portes</span>
                  </h2>
                  <p className="text-[9.5px] sm:text-sm text-white/70 font-light mt-0.5 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                    Rosaces monumentales en majolique, tirants sculptés &amp; caches serrures d&apos;apparat.
                  </p>
                </div>

                <div className="hidden sm:flex flex-wrap items-center gap-1 sm:gap-1.5 pt-2 sm:pt-3 border-t border-white/10 text-[9.5px] sm:text-[10.5px]">
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                    Céramique
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                    Sculptée
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                    Cache Serrure
                  </span>
                </div>
              </div>
            </button>

            {/* Type 2 : Poignées de Meubles */}
            <button
              type="button"
              onClick={() => setMainCat('meubles')}
              className={`group relative flex flex-col text-left rounded-xl sm:rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                mainCat === 'meubles'
                  ? 'ring-2 ring-[#E6A635] shadow-[0_12px_40px_rgba(230,166,53,0.35)] bg-gradient-to-b from-[#3B271C] via-[#2A1C14] to-[#1A110B] scale-[1.01]'
                  : 'border border-white/10 hover:border-[#E6A635]/60 hover:shadow-xl bg-[#241812]/85 opacity-80 hover:opacity-100 hover:scale-[1.005]'
              }`}
            >
              {/* Image Visuelle */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#1A110B]">
                <Image
                  src="/poignees/type_poignee_meuble.jpg"
                  alt="Poignées de Meubles"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241812] via-transparent to-black/30" />
                
                {/* Badge d'état Actif / Découvrir */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                  {mainCat === 'meubles' ? (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[8.5px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-lg">
                      <CheckCircle2 className="size-2.5 sm:size-3.5 shrink-0" />
                      <span className="hidden sm:inline">Univers Sélectionné</span>
                      <span className="sm:hidden">Choisi</span>
                    </span>
                  ) : (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#1A110B]/85 border border-white/20 text-white/80 text-[8.5px] sm:text-[11px] font-medium flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm group-hover:border-[#E6A635] group-hover:text-[#F2BD52] transition-colors">
                      <span>Découvrir</span>
                      <ArrowRight className="size-2 sm:size-3 shrink-0" />
                    </span>
                  )}
                </div>
              </div>

              {/* Contenu Texte */}
              <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-1 sm:space-y-2.5">
                <div>
                  <h2 className="font-heading text-xs sm:text-2xl text-white group-hover:text-[#F2BD52] transition-colors flex items-center gap-1.5 sm:gap-2.5 font-medium leading-tight">
                    <Sofa className={`size-3.5 sm:size-6 shrink-0 ${mainCat === 'meubles' ? 'text-[#E6A635]' : 'text-white/60 group-hover:text-[#E6A635]'}`} />
                    <span>Poignées de Meubles</span>
                  </h2>
                  <p className="text-[9.5px] sm:text-sm text-white/70 font-light mt-0.5 sm:mt-1.5 leading-snug sm:leading-relaxed line-clamp-2">
                    Boutons ronds &amp; ovales en céramique peinte main, et poignées sculptées en bois noble.
                  </p>
                </div>

                <div className="hidden sm:flex flex-wrap items-center gap-1 sm:gap-1.5 pt-2 sm:pt-3 border-t border-white/10 text-[9.5px] sm:text-[10.5px]">
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                    Céramique (3 Formats)
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                    Bois Sculpté (5 Tailles)
                  </span>
                </div>
              </div>
            </button>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* UNIVERS 1 : POIGNÉES DE PORTES                                            */}
        {/* ========================================================================= */}
        {mainCat === 'portes' && (
          <section className="w-full space-y-5 sm:space-y-8 animate-fadeIn">

            {/* Onglets Sous-Catégories Poignées de Portes : Céramique, Sculpté, Cache Serrure */}
            <div className="flex justify-center">
              <div className="inline-flex gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl shadow-xl overflow-x-auto max-w-full">
                {DOOR_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDoorType(tab.id)}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        doorType === tab.id
                          ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] shadow'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="size-3 sm:size-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description du type sélectionné */}
            <div className="text-center max-w-xl mx-auto px-2">
              <p className="text-[11px] sm:text-sm text-[#F2BD52] font-medium leading-snug sm:leading-normal">
                {DOOR_TABS.find((t) => t.id === doorType)?.description}
              </p>
            </div>

            {/* Grille des planches et inspirations pour les portes */}
            {filteredBoards.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-white/60 text-xs sm:text-sm font-light border border-[#E6A635]/20 rounded-xl sm:rounded-2xl bg-[#2A1C14]/40 px-4">
                Aucun modèle de poignée de porte enregistré pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
              {filteredBoards.map((board) => (
                <div 
                  key={board.id}
                  className="rounded-xl sm:rounded-3xl bg-[#2A1C14] border border-[#E6A635]/35 overflow-hidden shadow-xl sm:shadow-2xl flex flex-col group hover:border-[#E6A635] transition-all"
                >
                  {/* Galerie Photo Haute Définition avec cadrage équilibré mobile/desktop */}
                  <div 
                    onClick={() => setLightboxImage({ url: board.image, title: board.title, subtitle: board.subtitle })}
                    className="relative w-full aspect-[4/3] sm:aspect-[3/4] bg-[#140C07] overflow-hidden cursor-zoom-in group/img"
                  >
                    {/* Fond d'ambiance harmonisé (halo doux flouté) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <Image
                        src={formatImageUrl(board.image, '/placeholder.png')}
                        alt=""
                        fill
                        className="object-cover scale-125 blur-3xl opacity-35 brightness-75"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1A110B]/60 via-transparent to-[#1A110B]/85" />
                    </div>

                    {/* Cadre de mise en valeur de la pièce d'artisanat */}
                    <div className="relative w-full h-full p-1.5 sm:p-3.5 flex items-center justify-center">
                      <div className="relative w-full h-full rounded-lg sm:rounded-2xl overflow-hidden border border-[#E6A635]/30 shadow-[0_8px_24px_rgba(0,0,0,0.7)] bg-[#140C07] group-hover:border-[#E6A635]/80 transition-all duration-500">
                        <Image
                          src={formatImageUrl(board.image, '/placeholder.png')}
                          alt={board.title}
                          fill
                          className={`transition-transform duration-700 ease-out group-hover:scale-105 ${
                            board.id === 'porte-cache-serrure' || board.id === 'porte-cache-cellule'
                              ? 'object-contain p-1.5 sm:p-3'
                              : board.id === 'porte-ceramique-rameaux-verts'
                              ? 'object-cover object-[80%_center]'
                              : 'object-cover object-center'
                          }`}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 opacity-60 group-hover:opacity-25 transition-opacity pointer-events-none" />
                      </div>
                    </div>

                    {/* Badge Agrandir HD en verre dépoli */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#E6A635]/50 text-[#F2BD52] text-[8px] sm:text-[10.5px] font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg group-hover:bg-[#E6A635] group-hover:text-[#1A110B] transition-all">
                      <ZoomIn className="size-2 sm:size-3" />
                      <span>Zoom HD</span>
                    </div>

                    {/* Badge d'authenticité Atelier Aschi (Desktop uniquement) */}
                    <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-10 hidden sm:block">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 sm:gap-1.5">
                        <span className="size-1.5 rounded-full bg-[#E6A635] animate-pulse" />
                        Atelier Aschi
                      </span>
                    </div>
                  </div>

                  {/* Fiche descriptive & actions */}
                  <div className="p-2.5 sm:p-6 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-4">
                    <div>
                      <h4 className="font-heading text-xs sm:text-xl text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">
                        {board.title}
                      </h4>
                      <p className="text-[9px] sm:text-xs text-[#F2BD52] font-medium mt-0.5 sm:mt-1 truncate">{board.subtitle}</p>
                      
                      {board.dimensions && (
                        <div className="mt-1 sm:mt-2.5 inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg bg-[#E6A635]/10 border border-[#E6A635]/25 text-[#F2BD52] text-[8.5px] sm:text-[11px] font-medium">
                          <Ruler className="size-2 sm:size-3 text-[#E6A635]" />
                          <span>{board.dimensions}</span>
                        </div>
                      )}

                      <p className="hidden sm:block text-[11px] sm:text-sm text-white/70 font-light mt-2 sm:mt-3 leading-relaxed">
                        {board.description}
                      </p>

                      <div className="hidden sm:block mt-2 sm:mt-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1A110B]/60 border border-white/5 text-[10px] sm:text-[11px] text-white/80">
                        <span className="font-bold text-[#E6A635]">Usage idéal : </span>{board.idealFor}
                      </div>
                    </div>

                    <div className="pt-1.5 sm:pt-3 border-t border-white/10 flex flex-col gap-1.5 sm:gap-3">
                      <div className="hidden sm:flex flex-wrap gap-1 sm:gap-1.5">
                        {board.tags.map((tag, idx) => (
                          <span key={idx} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 pt-0.5 sm:pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDoorStudyData(prev => ({ ...prev, typeChoice: board.title }))
                            setShowDoorStudyModal(true)
                          }}
                          className="flex-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] hover:brightness-110 text-[9px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow cursor-pointer"
                        >
                          <span>Étudier</span>
                          <ArrowRight className="size-2.5 sm:size-3.5" />
                        </button>

                        <a
                          href={`https://wa.me/21655743760?text=${encodeURIComponent(
                            `Bonjour Maison Aschi, je m'intéresse au modèle de porte : "${board.title}" (${board.subtitle}). Pouvez-vous me conseiller sur les dimensions et la faisabilité ?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#241812] border border-[#E6A635]/30 hover:border-[#25D366] hover:bg-[#25D366]/15 text-white/80 hover:text-[#25D366] transition-all cursor-pointer shrink-0"
                          title="Discuter sur WhatsApp"
                        >
                          <MessageCircle className="size-3 sm:size-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Bannière de contact direct WhatsApp & Téléphone pour les portes */}
            <div className="p-4 sm:p-8 rounded-xl sm:rounded-3xl bg-gradient-to-b from-[#3B271C] to-[#241812] border-2 border-[#E6A635]/40 shadow-2xl text-center space-y-2.5 sm:space-y-4 max-w-2xl mx-auto">
              <h4 className="font-heading text-base sm:text-2xl text-gold-gradient">
                Vous avez un projet de porte ou un modèle en tête ?
              </h4>
              <p className="text-[11px] sm:text-sm text-white/70 font-light max-w-lg mx-auto leading-relaxed">
                Ismail Aschi vous conseille directement par téléphone ou WhatsApp pour définir les cotes exactes, l&apos;essence de bois et les émaux de majolique.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-2">
                <a
                  href="https://wa.me/21655743760?text=Bonjour%20Maison%20Aschi%2C%20je%20souhaite%20des%20informations%20pour%20une%20cr%C3%A9ation%20sur-mesure%20de%20poign%C3%A9es%20de%20porte."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sheen w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
                >
                  <MessageCircle className="size-3.5 sm:size-4" />
                  <span>Échanger sur WhatsApp</span>
                </a>
                <a
                  href="tel:+21655743760"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#1A110B] border border-[#E6A635]/50 hover:bg-[#E6A635] hover:text-[#1A110B] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md"
                >
                  <Phone className="size-3.5 sm:size-4" />
                  <span>+216 55 743 760</span>
                </a>
              </div>
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* UNIVERS 2 : POIGNÉES DE MEUBLES (DISPONIBLES À LA COMMANDE)                */}
        {/* ========================================================================= */}
        {mainCat === 'meubles' && (
          <section className="w-full space-y-5 sm:space-y-8 animate-fadeIn">
            {/* Onglets 2 Grandes Familles de Meuble : Céramique vs Sculpté */}
            <div className="flex flex-col items-center gap-2.5 sm:gap-4">
              <div className="inline-flex gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl shadow-xl">
                {FURNITURE_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFurnitureType(tab.id)}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        furnitureType === tab.id
                          ? 'bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] shadow font-extrabold'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="size-3 sm:size-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Sous-filtres de Format pour la Céramique (Grand, Moyenne, Ovale) */}
              {furnitureType === 'ceramique' && (
                <div className="inline-flex items-center gap-1 p-0.5 sm:p-1 rounded-full bg-[#241812]/90 border border-[#E6A635]/30 overflow-x-auto max-w-full">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#E6A635] px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1">
                    <Ruler className="size-2.5 sm:size-3" /> Formats :
                  </span>

                  {CERAMIC_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setCeramicSize(size.id)}
                      className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                        ceramicSize === size.id
                          ? 'bg-[#E6A635] text-[#1A110B] shadow font-extrabold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grille des planches de modèles et photos de meuble */}
            {filteredBoards.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-white/60 text-xs sm:text-sm font-light border border-[#E6A635]/20 rounded-xl sm:rounded-2xl bg-[#2A1C14]/40 px-4">
                Aucun modèle de poignée de meuble enregistré pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
              {filteredBoards.map((board) => (
                <div 
                  key={board.id}
                  className="rounded-xl sm:rounded-3xl bg-[#2A1C14] border border-[#E6A635]/30 overflow-hidden shadow-xl flex flex-col group hover:border-[#E6A635] transition-all"
                >
                  {/* Image Planche avec Zoom Cliquable & Galerie d'Exception */}
                  <div 
                    onClick={() => setLightboxImage({ url: board.image, title: board.title, subtitle: board.subtitle })}
                    className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-[#140C07] overflow-hidden cursor-zoom-in group/img"
                  >
                    {/* Fond d'ambiance harmonisé flouté */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <Image
                        src={formatImageUrl(board.image, '/placeholder.png')}
                        alt=""
                        fill
                        className="object-cover scale-125 blur-2xl opacity-30 brightness-75"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1A110B]/50 via-transparent to-[#1A110B]/80" />
                    </div>

                    {/* Cadre de mise en valeur de la pièce */}
                    <div className="relative w-full h-full p-1.5 sm:p-2.5 flex items-center justify-center">
                      <div className="relative w-full h-full rounded-lg sm:rounded-2xl overflow-hidden border border-[#E6A635]/25 shadow-[0_6px_20px_rgba(0,0,0,0.6)] bg-[#140C07] group-hover:border-[#E6A635]/70 transition-all duration-500">
                        <Image
                          src={formatImageUrl(board.image, '/placeholder.png')}
                          alt={board.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-50 group-hover:opacity-20 transition-opacity pointer-events-none" />
                      </div>
                    </div>

                    {/* Badge Zoom HD en verre dépoli */}
                    <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[8px] sm:text-[10px] font-bold flex items-center gap-1 shadow group-hover:bg-[#E6A635] group-hover:text-[#1A110B] transition-all">
                      <ZoomIn className="size-2 sm:size-3" />
                      <span>Zoom HD</span>
                    </div>

                    {board.dimensions && (
                      <div className="absolute bottom-2 left-2 sm:bottom-3.5 sm:left-3.5 z-10">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#E6A635]/30 text-[#F2BD52] text-[8px] sm:text-[9.5px] font-medium shadow">
                          {board.dimensions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fiche d'information */}
                  <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-3">
                    <div>
                      <h4 className="font-heading text-xs sm:text-lg text-white group-hover:text-[#F2BD52] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">
                        {board.title}
                      </h4>
                      <p className="text-[9px] sm:text-[11px] text-[#F2BD52] font-medium mt-0.5 truncate">{board.subtitle}</p>
                      
                      <p className="hidden sm:block text-[11px] sm:text-xs text-white/70 font-light mt-1.5 leading-relaxed">
                        {board.description}
                      </p>

                      <div className="hidden sm:block mt-1.5 sm:mt-2.5 p-1.5 sm:p-2 rounded-lg bg-[#1A110B]/60 border border-white/5 text-[9.5px] sm:text-[10.5px] text-white/80">
                        <span className="font-bold text-[#E6A635]">Recommandé pour : </span>
                        {board.idealFor}
                      </div>
                    </div>

                    {/* Boutons d'Appel / Commande par Téléphone */}
                    <div className="pt-1.5 sm:pt-3 border-t border-white/10 flex items-center gap-1 sm:gap-2">
                      <a
                        href="tel:+21655743760"
                        className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-[#E6A635] text-[#1A110B] hover:bg-[#F3C45E] text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shadow"
                      >
                        <Phone className="size-2.5 sm:size-3" />
                        <span>Commander</span>
                      </a>

                      <a
                        href={`https://wa.me/21655743760?text=${encodeURIComponent(
                          `Bonjour Maison Aschi, je souhaite commander des poignées de meuble du modèle : "${board.title}" (${board.subtitle}). Pouvez-vous me confirmer les disponibilités et tarifs ?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366] hover:text-white text-[9.5px] sm:text-[11px] font-bold flex items-center justify-center transition-colors shrink-0"
                        title="Commander par WhatsApp"
                      >
                        <MessageCircle className="size-3 sm:size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Bannière d'appel d'action pour la commande téléphonique */}
            <div className="p-4 sm:p-8 rounded-xl sm:rounded-3xl bg-gradient-to-br from-[#3B271C] via-[#2A1C14] to-[#241812] border-2 border-[#E6A635]/40 shadow-2xl text-center space-y-2.5 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#E6A635]/20 text-[#F2BD52] text-[9.5px] sm:text-xs font-bold uppercase tracking-wider">
                <Truck className="size-3 sm:size-3.5 text-[#E6A635]" />
                Livraison express sécurisée dans tous les gouvernorats de Tunisie
              </div>

              <h4 className="font-heading text-base sm:text-2xl lg:text-3xl text-gold-gradient">
                Vous avez repéré votre modèle ? Passez commande en 2 minutes.
              </h4>

              <p className="text-[11px] sm:text-sm text-white/70 font-light max-w-xl mx-auto leading-relaxed">
                Appelez notre atelier au <strong className="text-white font-bold">+216 55 743 760</strong> ou envoyez-nous simplement une capture d&apos;écran du motif souhaité par WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-3">
                <a
                  href="tel:+21655743760"
                  className="btn-sheen w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl"
                >
                  <Phone className="size-3.5 sm:size-4" />
                  <span>Appeler l&apos;Atelier : +216 55 743 760</span>
                </a>

                <a
                  href="https://wa.me/21655743760?text=Bonjour%20Maison%20Aschi%2C%20je%20souhaite%20commander%20des%20poign%C3%A9es%20de%20meuble."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-lg"
                >
                  <MessageCircle className="size-3.5 sm:size-4" />
                  <span>Commander sur WhatsApp</span>
                </a>
              </div>
            </div>

          </section>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL ZOOM PLEIN ÉCRAN / LIGHTBOX HD                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/90 backdrop-blur-xl cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl max-h-[92vh] w-full rounded-xl sm:rounded-3xl overflow-hidden border border-[#E6A635]/60 shadow-[0_30px_90px_rgba(0,0,0,0.95)] bg-[#1A110B] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-2.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#241812]/90">
                <div>
                  <h4 className="font-heading text-sm sm:text-xl text-white">{lightboxImage.title}</h4>
                  <p className="text-[10.5px] sm:text-xs text-[#F2BD52]">{lightboxImage.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="size-7 sm:size-9 rounded-full bg-white/10 hover:bg-[#E6A635] hover:text-[#1A110B] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-3.5 sm:size-5" />
                </button>
              </div>

              {/* Image en grand */}
              <div className="relative flex-1 min-h-[40vh] sm:min-h-[70vh] bg-black/40 flex items-center justify-center p-2">
                <img
                  src={formatImageUrl(lightboxImage.url, '/placeholder.png')}
                  alt={lightboxImage.title}
                  className="max-h-[60vh] sm:max-h-[75vh] w-auto object-contain rounded-lg mx-auto"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                />
              </div>

              {/* Footer Modal avec Boutons de Commande */}
              <div className="p-2.5 sm:p-4 bg-[#241812] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                <p className="text-[10px] sm:text-[11px] text-white/60 text-center sm:text-left">
                  Ce modèle vous plaît ? Contactez directement l&apos;atelier pour le commander.
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="tel:+21655743760"
                    className="flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#E6A635] text-[#1A110B] text-[10.5px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="size-3 sm:size-3.5" />
                    <span>Appeler l&apos;Atelier</span>
                  </a>
                  <a
                    href={`https://wa.me/21655743760?text=${encodeURIComponent(
                      `Bonjour Maison Aschi, je regarde le modèle "${lightboxImage.title}" (${lightboxImage.subtitle}). Est-il disponible ?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#25D366] text-white text-[10.5px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <MessageCircle className="size-3 sm:size-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL ÉTUDE SUR-MESURE POUR POIGNÉES DE PORTES                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDoorStudyModal && (
          <div 
            onClick={closeStudyModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full rounded-xl sm:rounded-3xl overflow-hidden border border-[#E6A635]/60 shadow-2xl bg-[#241812] p-4 sm:p-7 text-left max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeStudyModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 size-7 sm:size-8 rounded-full bg-white/10 hover:bg-[#E6A635] hover:text-[#1A110B] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-3.5 sm:size-4" />
              </button>

              <div className="mb-3 sm:mb-4 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#E6A635]/15 text-[#F2BD52] text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mb-1.5 sm:mb-2">
                  <Sparkles className="size-2.5 sm:size-3 text-[#E6A635]" /> Étude Gratuite &amp; Devis
                </div>
                <h3 className="font-heading text-lg sm:text-2xl text-white leading-snug">
                  Concevoir votre poignée de porte sur-mesure
                </h3>
                <p className="text-[10.5px] sm:text-xs text-white/70 font-light mt-0.5 sm:mt-1">
                  Transmettez-nous votre besoin, nos artisans vous répondent sous 24h.
                </p>
              </div>

              {doorStudySent ? (
                <div className="py-6 sm:py-8 text-center space-y-2.5 sm:space-y-3">
                  <div className="size-10 sm:size-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-5 sm:size-6" />
                  </div>
                  <h4 className="font-heading text-base sm:text-lg text-white">Demande d&apos;étude transmise !</h4>
                  <p className="text-[11px] sm:text-xs text-white/70">
                    Merci. Ismail prendra contact avec vous rapidement pour finaliser les dimensions et options techniques.
                  </p>
                  <button
                    type="button"
                    onClick={closeStudyModal}
                    className="mt-3 sm:mt-4 px-5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#E6A635] text-[#1A110B] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDoorStudySubmit} className="space-y-2.5 sm:space-y-3 text-xs">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                      Type de réalisation souhaitée
                    </label>
                    <select
                      value={doorStudyData.typeChoice}
                      onChange={handleStudyInput('typeChoice')}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                    >
                      <option value="Poignée Céramique de Porte">Poignée Céramique de Porte (Rosace d&apos;apparat)</option>
                      <option value="Poignée Sculptée de Porte">Poignée Sculptée de Porte (Tirant noyer/chêne)</option>
                      <option value="Cache Serrure Sculpté">Cache Serrure Sculpté (Serrure / Visiophone)</option>
                      <option value="Ensemble complet pour porte d'entrée">Ensemble complet pour porte d&apos;entrée</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                        Nom &amp; Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={doorStudyData.fullName}
                        onChange={handleStudyInput('fullName')}
                        placeholder="Ex: M. Ben Salem"
                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={doorStudyData.phone}
                        onChange={handleStudyInput('phone')}
                        placeholder="Ex: 55 743 760"
                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                        Ville / Localisation
                      </label>
                      <input
                        type="text"
                        value={doorStudyData.city}
                        onChange={handleStudyInput('city')}
                        placeholder="Ex: Tunis, La Marsa, Sousse..."
                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                        Dimensions de porte (ou épaisseur)
                      </label>
                      <input
                        type="text"
                        value={doorStudyData.dimensions}
                        onChange={handleStudyInput('dimensions')}
                        placeholder="Ex: Épaisseur 5 cm, hauteur 2m40"
                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-0.5 sm:mb-1">
                      Détails de votre demande (Optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={doorStudyData.notes}
                      onChange={handleStudyInput('notes')}
                      placeholder="Style souhaité, essence de bois, coloris des émaux..."
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1A110B] border border-[#E6A635]/30 text-white placeholder:text-white/40 text-[11.5px] sm:text-xs focus:outline-none focus:border-[#E6A635]"
                    />
                  </div>

                  <div className="pt-1.5 sm:pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={doorStudyLoading}
                      className="btn-sheen w-full py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                    >
                      {doorStudyLoading ? (
                        <span>Envoi en cours...</span>
                      ) : (
                        <>
                          <Send className="size-3 sm:size-3.5" />
                          <span>Transmettre ma demande d&apos;étude</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/21655743760?text=${encodeURIComponent(
                        `Bonjour Maison Aschi, je souhaite une étude sur-mesure pour : ${doorStudyData.typeChoice}.\nNom: ${doorStudyData.fullName || 'Client'}\nTél: ${doorStudyData.phone || ''}\nVille: ${doorStudyData.city || ''}\nPrécisions: ${doorStudyData.notes || 'À discuter ensemble'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 sm:py-2.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white text-[10.5px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
                    >
                      <MessageCircle className="size-3.5 sm:size-4" />
                      <span>Envoyer directement par WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MobileFloatingVIP />
      <Footer />
    </main>
  )
}
