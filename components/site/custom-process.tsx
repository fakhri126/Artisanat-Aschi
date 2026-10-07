'use client'

import { Lightbulb, Phone, PenTool, FileText, Hammer, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    icon: Lightbulb,
    title: "Choisir l'inspiration",
    text: 'Parcourez notre catalogue ou apportez votre propre vision, croquis ou modèle de référence.',
  },
  {
    step: '02',
    icon: Phone,
    title: 'Contacter Aschi',
    text: 'Échangez directement avec nos artisans pour donner vie et forme à votre idée.',
  },
  {
    step: '03',
    icon: PenTool,
    title: 'Discuter les modifications',
    text: 'Dimensions, essences de bois nobles, motifs sculptés et teintes : tout est ajustable.',
  },
  {
    step: '04',
    icon: FileText,
    title: 'Validation du projet',
    text: 'Une proposition claire et détaillée avec devis transparent pour lancer la confection.',
  },
  {
    step: '05',
    icon: Hammer,
    title: 'Création de la pièce',
    text: 'Nos mains façonnent votre pièce unique au sein de l’atelier, jusqu’à la livraison.',
  },
]

export function CustomProcess() {
  return (
    <section id="sur-mesure" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* EN-TÊTE DE SECTION */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold shadow-md">
            <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
            <span>Création Sur-Mesure • Atelier Aschi</span>
          </div>

          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
            Votre vision, sculptée à la main
          </h2>

          <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-xs sm:text-sm md:text-base font-light leading-relaxed text-[#EAE4D9]/85 drop-shadow-md">
            Un accompagnement d&apos;exception, du premier croquis à la livraison.
            Cinq étapes pour transformer une inspiration en héritage.
          </p>
        </div>

        {/* ─── VERSION DESKTOP : GRILLE 5 CARTES HORIZONTALES (lg+) ─── */}
        <div className="hidden lg:grid mt-16 grid-cols-5 gap-4 xl:gap-5 relative">
          {/* Ligne directrice dorée en arrière-plan reliant les étapes */}
          <div className="absolute top-11 left-12 right-12 h-[2px] bg-gradient-to-r from-[#E6A635]/20 via-[#E6A635]/60 to-[#E6A635]/20 z-0 pointer-events-none" />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative z-10 flex flex-col h-full rounded-2xl bg-[#3B271C]/85 hover:bg-[#452E21]/95 border border-[#E6A635]/35 hover:border-[#E6A635]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.65)] hover:shadow-[0_16px_40px_rgba(230,166,53,0.2)] backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1.5"
              >
                {/* Pastille Icone + Numéro */}
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-full bg-gradient-to-tr from-[#241812] to-[#3B271C] border border-[#E6A635]/60 flex items-center justify-center text-[#F2BD52] shadow-md group-hover:scale-110 group-hover:border-[#F2BD52] transition-all">
                    <Icon className="size-5 text-[#F2BD52]" />
                  </div>
                  <span className="font-heading text-2xl font-light text-[#F2BD52]/40 group-hover:text-[#F2BD52] transition-colors font-mono">
                    {step.step}
                  </span>
                </div>

                {/* Titre */}
                <h3 className="font-heading text-lg font-medium text-[#F7F4EE] leading-snug group-hover:text-[#F2BD52] transition-colors min-h-[3rem] flex items-center">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs font-light text-[#D8C7B4]/85 leading-relaxed flex-1">
                  {step.text}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* ─── VERSION MOBILE & TABLETTE : TIMELINE VERTICALE LUXE (< lg) ─── */}
        <div className="lg:hidden mt-12 max-w-xl mx-auto relative pl-8 sm:pl-10">
          {/* Fil conducteur doré vertical */}
          <div className="absolute left-3.5 sm:left-4.5 top-3 bottom-6 w-[2px] bg-gradient-to-b from-[#E6A635] via-[#E6A635]/60 to-[#E6A635]/20 pointer-events-none" />

          <div className="space-y-6 sm:space-y-7">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative group"
                >
                  {/* Point de repère sur le fil conducteur */}
                  <div className="absolute -left-8 sm:-left-10 top-3.5 size-7 sm:size-8 rounded-full bg-[#241812] border-2 border-[#E6A635] flex items-center justify-center text-[#F2BD52] text-[11px] sm:text-xs font-bold font-mono shadow-[0_0_12px_rgba(230,166,53,0.5)] z-10">
                    {step.step}
                  </div>

                  {/* Carte Étape */}
                  <div className="rounded-2xl bg-[#3B271C]/90 hover:bg-[#452E21]/95 border border-[#E6A635]/35 hover:border-[#E6A635]/70 p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shrink-0">
                        <Icon className="size-4.5" />
                      </div>
                      <h3 className="font-heading text-base sm:text-lg font-medium text-[#F7F4EE] leading-snug">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm font-light text-[#D8C7B4]/85 leading-relaxed pl-1">
                      {step.text}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* BOUTON D'APPEL À L'ACTION */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/contact"
            className="btn-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs sm:text-sm font-bold uppercase tracking-[0.16em] px-8 sm:px-10 py-3.5 sm:py-4 shadow-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Démarrer mon projet sur-mesure</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
