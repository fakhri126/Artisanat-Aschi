'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'

const CHAPTERS = [
  {
    year: '1960',
    title: 'La fondation',
    subtitle: 'Hechmi Aschi',
    image: '/story-founder.png',
    text: "Dans un modeste atelier tunisien, Hechmi Aschi pose le premier ciseau sur le bois. Animé par une passion intacte pour le geste juste, il fonde une maison dédiée à la noblesse du bois et à la beauté du détail.",
  },
  {
    year: '1985',
    title: 'La transmission',
    subtitle: 'Un héritage de mains en mains',
    image: '/story-transmission.png',
    text: "Le savoir-faire se transmet, geste après geste, de l'aîné à l'apprenti. Chaque entaille porte la mémoire d'une génération. La maison grandit sans jamais trahir son âme : le travail à la main, patient et sincère.",
  },
  {
    year: "Aujourd'hui",
    title: 'La nouvelle génération',
    subtitle: "L'art en mouvement",
    image: '/story-newgen.png',
    text: "Une nouvelle génération d'artisans perpétue l'héritage en y insufflant une vision contemporaine. Tradition et modernité dialoguent pour créer des pièces uniques, pensées pour les demeures d'exception.",
  },
]

export function Story() {
  const [active, setActive] = useState(0)
  const chapter = CHAPTERS[active]

  return (
    <section id="histoire" className="relative bg-walnut py-24 text-walnut-foreground md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-xs uppercase tracking-luxury text-gold">
            Notre histoire
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl text-balance text-center font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl">
            Soixante années à façonner le bois et la mémoire
          </h2>
        </Reveal>

        {/* Timeline rail */}
        <Reveal delay={150}>
          <div className="relative mt-16 flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-walnut-foreground/15" />
            {CHAPTERS.map((c, i) => (
              <button
                key={c.year}
                type="button"
                onClick={() => setActive(i)}
                className="group relative z-10 flex flex-1 flex-col items-center gap-3"
              >
                <span
                  className={cn(
                    'size-4 rounded-full border-2 transition-all duration-300',
                    i === active
                      ? 'scale-125 border-gold bg-gold'
                      : 'border-walnut-foreground/40 bg-walnut group-hover:border-gold',
                  )}
                />
                <span
                  className={cn(
                    'font-heading text-xl transition-colors duration-300 sm:text-2xl',
                    i === active ? 'text-gold' : 'text-walnut-foreground/50',
                  )}
                >
                  {c.year}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Active chapter */}
        <div className="mt-16 grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal key={`img-${active}`} className="order-2 md:order-1">
            <div className="relative overflow-hidden">
              <img
                src={chapter.image || '/placeholder.svg'}
                alt={`${chapter.title} — ${chapter.subtitle}`}
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/20" />
            </div>
          </Reveal>

          <Reveal key={`txt-${active}`} delay={120} className="order-1 md:order-2">
            <p className="font-heading text-7xl font-light text-gold/30 sm:text-8xl">
              {chapter.year}
            </p>
            <h3 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
              {chapter.title}
            </h3>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-gold">
              {chapter.subtitle}
            </p>
            <p className="mt-6 max-w-md text-pretty text-base font-light leading-relaxed text-walnut-foreground/75">
              {chapter.text}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
