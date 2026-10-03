'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { BohoFloralRosette } from './boho-decor'

const MASTERPIECES = [
  {
    id: 'buffet',
    label: "Buffet d'Apparat",
    title: "Buffet d'Apparat Sculpté",
    subtitle: "Noyer Massif, Céramique d'Art & Clous Laiton",
    image: '/buffet.png',
    tag: 'Mobilier Monumental'
  },
  {
    id: 'table',
    label: "Table Basse d'Art",
    title: "Table Basse Majolique & Fer Forgé",
    subtitle: "Bois Massif Sculpté, Majolique & Fer Forgé Ciselé",
    image: '/table-artisanat.jpg',
    tag: "Mobilier d'Exception"
  },
  {
    id: 'miroir',
    label: 'Miroir Sculpté',
    title: "Miroir d'Apparat Majolique",
    subtitle: 'Bois Précieux, Émaux Façonnés & Laiton',
    image: '/miroir.png',
    tag: "Miroiterie d'Art"
  }
]

export function HeroCatalogue() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activePiece = MASTERPIECES[activeIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex((prev) => (prev - 1 + MASTERPIECES.length) % MASTERPIECES.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex((prev) => (prev + 1) % MASTERPIECES.length)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent flex items-center font-sans py-2 sm:py-4">
      
      {/* Decorative Motifs */}
      <BohoFloralRosette className="absolute top-[60%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-[0.06] pointer-events-none" delay={0.2} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-0 lg:gap-x-10 py-2 sm:py-4 z-10 relative items-center">
        
        {/* ========================================================================= */}
        {/* Colonne Gauche (5 Colonnes) : Texte Noble, Étapes Fines & Bouton         */}
        {/* ========================================================================= */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {/* Badge "Création Sur-Mesure" */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 shadow-md backdrop-blur-md">
              <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
              <span>Création Sur-Mesure</span>
            </div>
            
            {/* Titre Principal */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 leading-[1.08] tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Catalogue <br/>
              <span className="italic text-white font-normal text-2xl sm:text-3xl md:text-4xl block mt-0.5">
                d&apos;Inspiration d&apos;Art
              </span>
            </h2>
            
            {/* Paragraphe en Blanc Pur */}
            <p className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-normal text-xs sm:text-sm md:text-[14.5px] mb-4 leading-relaxed">
              Explorez nos créations emblématiques déclinables dans toutes les essences de bois noble, teintes et dimensions pour concevoir votre projet unique.
            </p>

            {/* Ligne Fine des 3 Étapes de Création */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] sm:text-[11px] font-medium text-white/90 bg-[#3B271C]/80 border border-[#E6A635]/30 px-3.5 py-2 rounded-full mb-6 w-fit shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-1">
                <span className="text-[#F2BD52] font-bold font-serif">01.</span>
                <span>Modèle &amp; Essence</span>
              </span>
              <span className="text-[#E6A635]/40">•</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F2BD52] font-bold font-serif">02.</span>
                <span>Étude Sur-Mesure</span>
              </span>
              <span className="text-[#E6A635]/40">•</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F2BD52] font-bold font-serif">03.</span>
                <span>Façonnage</span>
              </span>
            </div>
            
            {/* Bouton d'Action */}
            <div>
              <Link
                href="/catalogue"
                className="btn-sheen group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Explorer le Catalogue</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* Colonne Droite (7 Colonnes) : Grande Photo d'Art + Sélecteur Interactif   */}
        {/* ========================================================================= */}
        <div className="w-full lg:col-span-7 flex flex-col items-center lg:items-end order-2 mt-2 lg:mt-0">
          
          {/* 🖼️ Grand Cadre Photo d'Art Immersif (Affichage TOTAL de la pièce sans recadrage) */}
          <div className="relative w-full max-w-[580px] aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E6A635]/40 bg-gradient-to-b from-[#1C120C] via-[#140C08] to-[#0D0805] shadow-[0_25px_60px_rgba(0,0,0,0.85)] group">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activePiece.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative size-full"
              >
                {/* Fond d'ambiance flouté très doux pour créer de la profondeur sans masquer l'objet */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image
                    src={activePiece.image}
                    alt=""
                    fill
                    className="object-cover blur-2xl opacity-20 scale-110"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[#160E09]/60 backdrop-blur-[2px]" />
                </div>

                {/* Photo Principale : Affichage 100% Intégral (object-contain) sans coupure */}
                <div className="relative size-full p-3 sm:p-4 pb-16 sm:pb-16 flex items-center justify-center">
                  <div className="relative size-full">
                    <Image
                      src={activePiece.image}
                      alt={activePiece.title}
                      fill
                      priority
                      className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Badge Tag en Haut à Droite */}
                <div className="absolute top-3.5 right-3.5 bg-[#2B1B13]/90 backdrop-blur-md border border-[#E6A635]/40 px-3 py-1 rounded-full text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-[#F2BD52] shadow-md z-10">
                  {activePiece.tag}
                </div>

                {/* Flèches de navigation discrètes gauche / droite */}
                <button
                  onClick={handlePrev}
                  aria-label="Pièce précédente"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-[#241711]/80 hover:bg-[#E6A635] text-white hover:text-[#1A110B] border border-[#E6A635]/40 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Pièce suivante"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-[#241711]/80 hover:bg-[#E6A635] text-white hover:text-[#1A110B] border border-[#E6A635]/40 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>

                {/* Étiquette d'Apparat Transparente en Bas (Ne masque pas la pièce) */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/30 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl flex items-center justify-between text-white shadow-lg z-10">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-heading text-xs sm:text-[13px] font-semibold text-white leading-tight truncate">
                      {activePiece.title}
                    </h4>
                    <p className="text-[10px] sm:text-[10.5px] text-[#F2BD52] font-medium mt-0.5 truncate">
                      {activePiece.subtitle}
                    </p>
                  </div>
                  <Link
                    href="/catalogue"
                    className="shrink-0 size-7 sm:size-7.5 rounded-full bg-gradient-to-tr from-[#F3C45E] to-[#C78318] text-[#1A110B] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* 🔘 Sélecteur de Badges Inférieurs : Ultra-Fins, Épurés et Délicats */}
          <div className="w-full max-w-[580px] grid grid-cols-3 gap-2 sm:gap-2.5 mt-2.5">
            {MASTERPIECES.map((piece, idx) => {
              const isActive = activeIndex === idx
              return (
                <button
                  key={piece.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative flex items-center gap-2 px-2.5 py-1.5 sm:py-2 rounded-xl transition-all duration-300 cursor-pointer text-left backdrop-blur-sm ${
                    isActive
                      ? 'bg-[#352116]/95 border border-[#E6A635] shadow-[0_0_12px_rgba(230,166,53,0.3)] ring-1 ring-[#E6A635]/40'
                      : 'bg-[#241711]/60 border border-[#E6A635]/20 hover:border-[#E6A635]/50 hover:bg-[#2E1D14]/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Miniature Fine */}
                  <div className="relative size-7 sm:size-8 rounded-lg overflow-hidden shrink-0 border border-[#E6A635]/30 bg-[#120B07] p-0.5">
                    <Image
                      src={piece.image}
                      alt={piece.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Libellé Fin & Typographie Délicate */}
                  <div className="min-w-0 flex-1">
                    <span className={`block font-heading text-[10.5px] sm:text-[11.5px] font-semibold leading-tight truncate ${
                      isActive ? 'text-[#F2BD52]' : 'text-white/85 group-hover:text-white'
                    }`}>
                      {piece.label}
                    </span>
                    <span className="block text-[8.5px] sm:text-[9px] text-[#D8B98A]/60 truncate font-sans">
                      {idx === 0 ? 'Noyer & Laiton' : idx === 1 ? 'Majolique & Fer' : 'Miroir & Émaux'}
                    </span>
                  </div>

                  {/* Petit point indicateur doré si actif */}
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-[#E6A635] shrink-0 shadow-[0_0_6px_#E6A635]" />
                  )}
                </button>
              )
            })}
          </div>

        </div>

      </div>
    </div>
  )
}
