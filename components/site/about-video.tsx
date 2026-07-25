'use client'

import Link from 'next/link'
import { Award, History } from 'lucide-react'
import { Reveal } from './reveal'

export function AboutVideo() {
  return (
    <section className="relative flex min-h-[45rem] w-full items-center justify-center overflow-hidden bg-zinc-950 py-24 md:py-36">
      {/* Background Video */}
      <video
        src="/Video.mp4"
        autoPlay
        muted
        loop
        playsInline={true}
        className="absolute inset-0 size-full object-cover"
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-white/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 text-center text-[#3A2A21] sm:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-luxury text-[#C17D59]">
            Qui sommes-nous
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-balance font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-shadow-cinematic">
            Maison Artisanat Aschi
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-pretty text-base font-light leading-relaxed text-[#3A2A21]/90 sm:text-lg text-shadow-cinematic">
            Fondée en 1960 au cœur de la Tunisie, la Maison Artisanat Aschi incarne l&apos;excellence de la sculpture sur bois noble. Chaque pièce est le fruit d&apos;un dialogue intime entre le noyer massif et le geste précis de nos maîtres artisans, perpétuant un héritage de soixante ans de passion, de patience et de raffinement.
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal delay={150}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/atelier#histoire"
              className="flex items-center gap-2 rounded-full border border-[#E8DCCB] bg-[#E8DCCB]/10 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#C17D59] backdrop-blur-sm transition-all hover:bg-[#E8DCCB] hover:text-walnut"
            >
              <History className="size-4" /> Notre Historique
            </Link>
            <Link
              href="/atelier#atelier"
              className="flex items-center gap-2 rounded-full border border-ivory/60 bg-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#3A2A21] backdrop-blur-sm transition-all hover:border-[#E8DCCB] hover:text-[#C17D59]"
            >
              <Award className="size-4" /> Le Savoir-Faire
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
