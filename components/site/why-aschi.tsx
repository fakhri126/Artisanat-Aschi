'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
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
  CheckCircle2
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

  return (
    <div ref={ref} className="text-center p-2 sm:p-3">
      <div className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gold-gradient tracking-tight tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        {count}
        <span className="text-[#F2BD52] font-sans font-light ml-0.5 text-base sm:text-xl md:text-2xl">{suffix}</span>
      </div>
      <div className="text-[9.5px] sm:text-xs uppercase tracking-[0.12em] text-[#F2BD52] font-bold mt-0.5">
        {label}
      </div>
      <div className="text-[9px] sm:text-[10px] text-white/80 drop-shadow font-normal mt-0.5 hidden sm:block">
        {sublabel}
      </div>
    </div>
  )
}

export function WhyAschi() {
  const statsList = [
    { value: 65, suffix: ' Ans', label: "D'Héritage Artisanal", sublabel: "Atelier familial fondé en 1960" },
    { value: 1200, suffix: '+', label: 'Demeures Sublimées', sublabel: "Villas & résidences privées" },
    { value: 500, suffix: '+', label: 'Projets Monumentaux', sublabel: "Palaces, riads & hôtels 5★" },
    { value: 100, suffix: '%', label: 'Bois Noble Garanti', sublabel: "Noyer massif séché à cœur" }
  ]

  const pillars = [
    {
      icon: <Trees className="size-3.5 sm:size-4 text-[#F2BD52]" />,
      title: "100% Noyer Massif",
      desc: "Bois noble séché naturellement au grand air pour une patine éternelle.",
      tag: "Bois Noble"
    },
    {
      icon: <Award className="size-3.5 sm:size-4 text-[#F2BD52]" />,
      title: "Maîtrise Depuis 1960",
      desc: "Trois générations vouées à la haute sculpture au ciseau et à la gouge.",
      tag: "Tradition"
    },
    {
      icon: <Compass className="size-3.5 sm:size-4 text-[#F2BD52]" />,
      title: "Plans 3D Sur-Mesure",
      desc: "Conception architecturale personnalisée et rendu 3D sous 24h.",
      tag: "Plans 3D"
    },
    {
      icon: <Gem className="size-3.5 sm:size-4 text-[#F2BD52]" />,
      title: "Finitions d'Art",
      desc: "Laiton ciselé, céramiques peintes à la main et dorure à la feuille.",
      tag: "Finitions"
    }
  ]

  return (
    <section id="pourquoi-aschi" className="relative overflow-hidden bg-transparent py-8 sm:py-14 lg:py-18">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE COMPACT                                             */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 shadow-md">
              <Sparkles className="size-2.5 text-[#E6A635] animate-pulse" />
              <span>Pourquoi Artisanat Aschi ?</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-gold-gradient drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-tight">
              L&apos;Excellence du Patrimoine &amp; de la Haute Ébénisterie
            </h2>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. BANDEAU CHIFFRES CLÉS (KPIs) REMONTÉ                                   */}
        {/* ========================================================================= */}
        <Reveal delay={100} className="mb-4 sm:mb-6">
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#E6A635]/40 bg-[#3B271C]/90 backdrop-blur-2xl p-2 sm:p-3 shadow-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E6A635]/20">
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
        {/* 3. LES 4 PILIERS EN GRILLE COMPACTE 2x2 (Ultra-Optimisé pour Mobile)      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
          {pillars.map((pillar, index) => (
            <Reveal key={index} delay={index * 40}>
              <div className="h-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#3B271C]/90 border border-[#E6A635]/35 backdrop-blur-xl hover:border-[#E6A635]/80 hover:bg-[#483022]/95 transition-all duration-300 shadow-md flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="size-6 sm:size-8 rounded-lg bg-[#241812] border border-[#E6A635]/40 flex items-center justify-center shadow-sm shrink-0">
                      {pillar.icon}
                    </div>
                    <span className="text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.1em] font-bold text-[#F2BD52] bg-[#241812]/85 px-1.5 py-0.5 rounded-full border border-[#E6A635]/30">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-heading text-xs sm:text-sm font-semibold text-white mb-1 leading-snug group-hover:text-[#F2BD52] transition-colors">
                    {pillar.title}
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs text-white/85 drop-shadow font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-2 pt-1 border-t border-[#E6A635]/20 flex items-center gap-1 text-[8px] sm:text-[9px] text-[#F2BD52] font-semibold uppercase tracking-wider">
                  <CheckCircle2 className="size-2.5 text-[#E6A635] shrink-0" />
                  <span>Maison Aschi</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 4. CONSOLE DE CONVERSION COMPACTE (Devis 3D & WhatsApp)                   */}
        {/* ========================================================================= */}
        <Reveal delay={140}>
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#E6A635]/40 bg-[#3B271C]/90 backdrop-blur-2xl p-3.5 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
              <div>
                <h3 className="font-heading text-base sm:text-xl font-normal text-gold-gradient leading-tight mb-0.5">
                  Un Projet de Mobilier d&apos;Exception en Tête ?
                </h3>
                <p className="text-white/90 text-[11px] sm:text-xs font-normal">
                  Étude personnalisée, modélisation 3D réaliste et devis gratuit sous 24h.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-center">
                <Link
                  href="/custom-creation"
                  className="btn-sheen inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md transition-all hover:scale-105"
                >
                  <FileText className="size-3 text-[#1A110B]" />
                  <span>Devis 3D</span>
                </Link>

                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E6A635]/40 bg-[#241812]/90 hover:bg-[#4E3425] hover:text-[#F2BD52] px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-md"
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
