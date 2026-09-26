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
    subtitle: 'Noyer Massif, Patine Bleue & Clous Laiton',
    image: '/images/buffet-bleu-ciel.jpg',
    objectPosition: 'object-[center_18%]',
    tag: 'Mobilier Monumental'
  },
  {
    id: 'banquette',
    label: "Banquette d'Art",
    title: 'Banquette en Noyer Noble',
    subtitle: 'Sculpture Ciselée à la Main & Finitions Dorées',
    image: '/images/catalog_bench_cropped.jpg',
    objectPosition: 'object-center',
    tag: "Assise d'Exception"
  },
  {
    id: 'miroir',
    label: 'Miroir Sculpté',
    title: "Miroir d'Apparat Barocco",
    subtitle: 'Bois Doré & Ornements Ciselés à la Main',
    image: '/miroir.png',
    objectPosition: 'object-center',
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
          
          {/* 🖼️ Grand Cadre Photo d'Art Immersif (Proportions élégantes et aérées) */}
          <div className="relative w-full max-w-[580px] aspect-[4/3] sm:aspect-[16/12] rounded-3xl overflow-hidden border-2 border-[#E6A635]/50 bg-[#241711] shadow-[0_25px_60px_rgba(0,0,0,0.85)] group">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activePiece.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative size-full"
              >
                <Image
                  src={activePiece.image}
                  alt={activePiece.title}
                  fill
                  priority
                  className={`object-cover ${activePiece.objectPosition || 'object-center'} group-hover:scale-105 transition-transform duration-1000`}
                />

                {/* Voile dégradé subtil en bas pour lisibilité sans étouffer la pièce */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A]/90 via-transparent to-black/20 pointer-events-none" />
                
                {/* Badge Tag en Haut à Droite */}
                <div className="absolute top-3.5 right-3.5 bg-[#2B1B13]/90 backdrop-blur-md border border-[#E6A635]/50 px-3 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider text-[#F2BD52] shadow-md z-10">
                  {activePiece.tag}
                </div>

                {/* Flèches de navigation rapide gauche / droite intégrées au cadre */}
                <button
                  onClick={handlePrev}
                  aria-label="Pièce précédente"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-[#241711]/70 hover:bg-[#E6A635] text-white hover:text-[#1A110B] border border-[#E6A635]/40 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Pièce suivante"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-[#241711]/70 hover:bg-[#E6A635] text-white hover:text-[#1A110B] border border-[#E6A635]/40 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>

                {/* Étiquette d'Apparat Raffinée & Aérée en Bas */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#241711]/85 backdrop-blur-md border border-[#E6A635]/40 px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-white shadow-xl z-10">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-heading text-xs sm:text-sm font-semibold text-white leading-tight truncate">
                      {activePiece.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#F2BD52] font-medium mt-0.5 truncate">
                      {activePiece.subtitle}
                    </p>
                  </div>
                  <Link
                    href="/catalogue"
                    className="shrink-0 size-8 rounded-full bg-gradient-to-tr from-[#F3C45E] to-[#C78318] text-[#1A110B] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* 🔘 Sélecteur de Miniatures Interactif Rehaussé */}
          <div className="w-full max-w-[580px] flex items-center justify-between gap-2 sm:gap-3 mt-3.5">
            {MASTERPIECES.map((piece, idx) => {
              const isActive = activeIndex === idx
              return (
                <button
                  key={piece.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative flex-1 flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3B271C] to-[#2B1B13] border-2 border-[#E6A635] shadow-[0_0_18px_rgba(230,166,53,0.35)] scale-[1.02]'
                      : 'bg-[#2B1B13]/70 border border-[#E6A635]/25 hover:border-[#E6A635]/60 hover:bg-[#3B271C]/90 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Miniature Photo plus grande et valorisée */}
                  <div className="relative size-9 sm:size-11 rounded-xl overflow-hidden shrink-0 border border-[#E6A635]/40 shadow-inner bg-[#1A110B]">
                    <Image
                      src={piece.image}
                      alt={piece.label}
                      fill
                      className={`object-cover ${piece.objectPosition || 'object-center'}`}
                    />
                  </div>
                  
                  {/* Libellé et indicateur */}
                  <div className="min-w-0 pr-1 flex-1">
                    <span className={`block font-heading text-[10.5px] sm:text-xs font-semibold leading-tight truncate ${
                      isActive ? 'text-[#F2BD52]' : 'text-white/90'
                    }`}>
                      {piece.label}
                    </span>
                    <span className="block text-[8.5px] sm:text-[9.5px] text-white/50 truncate font-sans mt-0.5">
                      {idx === 0 ? 'Sculpture & Laiton' : idx === 1 ? 'Noyer d\'Élite' : 'Orfèvrerie & Bois'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

        </div>

      </div>
    </div>
  )
}
