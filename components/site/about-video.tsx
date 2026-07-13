'use client'

import Link from 'next/link'
import { Award, History } from 'lucide-react'
import { Reveal } from './reveal'

export function AboutVideo() {
  return (
    <section className="relative flex min-h-[45rem] w-full items-center justify-center overflow-hidden bg-zinc-950 py-24 md:py-36">
      {/* Background Video */}
      <video
        src="/test-video.mp4"
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline={true}
        className="absolute inset-0 size-full object-cover"
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 text-center text-ivory sm:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-luxury text-gold">
            Qui sommes-nous
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-balance font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-shadow-cinematic">
            Maison Artisanat Aschi
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-pretty text-base font-light leading-relaxed text-ivory/90 sm:text-lg text-shadow-cinematic">
            Fondée en 1960 au cœur de la Tunisie, la Maison Artisanat Aschi incarne l&apos;excellence de la sculpture sur bois noble. Chaque pièce est le fruit d&apos;un dialogue intime entre le noyer massif et le geste précis de nos maîtres artisans, perpétuant un héritage de soixante ans de passion, de patience et de raffinement.
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal delay={150}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/atelier#histoire"
              className="flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur-sm transition-all hover:bg-gold hover:text-walnut"
            >
              <History className="size-4" /> Notre Historique
            </Link>
            <Link
              href="/atelier#atelier"
              className="flex items-center gap-2 rounded-full border border-ivory/60 bg-black/20 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-ivory backdrop-blur-sm transition-all hover:border-gold hover:text-gold"
            >
              <Award className="size-4" /> Le Savoir-Faire
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
