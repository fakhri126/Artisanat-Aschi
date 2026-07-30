'use client'

import { Reveal } from './reveal'
import Link from 'next/link'
import { Award, History, Play } from 'lucide-react'
import { BohoCeramicCross, BohoRosace } from './boho-decor'

export function AboutVideo() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-transparent overflow-hidden">
      
      {/* Motif Zellij */}
      <BohoCeramicCross className="absolute -top-10 -left-10 md:-left-5 w-24 md:w-64 opacity-[0.9] shadow-2xl rounded-2xl z-0 pointer-events-none text-[#C17D59]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Text Content */}
        <div className="w-full lg:w-1/2">
          <Reveal>
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#C17D59]">
              Qui sommes-nous
            </p>
            <h2 className="mt-4 text-balance font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-[#3A2A1E]">
              Maison Artisanat Aschi
            </h2>
            <p className="mt-8 text-pretty text-base font-light leading-relaxed text-[#5A453A] sm:text-lg">
              Fondée en 1960 au cœur de la Tunisie, la Maison Artisanat Aschi incarne l&apos;excellence de la sculpture sur bois noble. Chaque pièce est le fruit d&apos;un dialogue intime entre le noyer massif et le geste précis de nos maîtres artisans, perpétuant un héritage de soixante ans de passion, de patience et de raffinement.
            </p>
          </Reveal>

          {/* Action Buttons */}
          <Reveal delay={150}>
            <div className="mt-12 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/atelier#histoire"
                className="flex items-center justify-center gap-2 rounded-full border border-[#C17D59] bg-[#C17D59] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#A66645] hover:border-[#A66645] w-full sm:w-auto"
              >
                <History className="size-4" /> Notre Historique
              </Link>
              <Link
                href="/atelier#atelier"
                className="flex items-center justify-center gap-2 rounded-full border border-[#D9CEB8] bg-white px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#3A2A1E] transition-all hover:bg-[#E8DCCB] w-full sm:w-auto"
              >
                <Award className="size-4" /> Le Savoir-Faire
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Video Frame */}
        <div className="w-full lg:w-1/2 relative">
          <Reveal delay={300} className="relative w-full aspect-[4/5] max-w-lg mx-auto">
            {/* Arched Video Frame */}
            <div className="absolute inset-0 rounded-t-full rounded-b-[40px] overflow-hidden border-[12px] border-white shadow-2xl bg-[#E8DCCB]">
              <video
                src="/Video.mp4"
                autoPlay
                muted
                loop
                playsInline={true}
                preload="metadata"
                className="size-full object-cover opacity-90"
              />
            </div>
            
            {/* Motif Rosace beige et orangé en bas à droite */}
            <BohoRosace className="absolute -bottom-16 -right-16 w-32 md:w-40 h-auto z-20 pointer-events-none drop-shadow-2xl" monochrome={true} color="#C17D59" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
