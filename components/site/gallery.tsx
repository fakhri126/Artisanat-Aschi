"use client"

import Image from "next/image"
import { Reveal } from "./reveal"

const images = [
  { src: "/gallery-1.png", alt: "Détail de sculpture arabesque sur noyer", span: "row-span-2" },
  { src: "/gallery-3.png", alt: "Outils anciens de l'artisan sur l'établi", span: "" },
  { src: "/gallery-2.png", alt: "Colonne sculptée rehaussée de feuille d'or", span: "row-span-2" },
  { src: "/gallery-5.png", alt: "Pièces finies dans l'atelier baigné de lumière", span: "" },
  { src: "/gallery-4.png", alt: "Panneau décoratif aux motifs moucharabieh", span: "" },
  { src: "/gallery-6.png", alt: "Mains du maître artisan sur le bois sculpté", span: "row-span-2" },
]

export function Gallery() {
  return (
    <section id="galerie" className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-[var(--gold)]">Galerie d&apos;art</p>
          <h2 className="mt-4 max-w-2xl font-heading text-4xl leading-tight text-foreground md:text-6xl text-balance">
            La beauté dans le détail
          </h2>
        </Reveal>

        <div className="mt-16 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3 md:auto-rows-[260px]">
          {images.map((img, i) => (
            <Reveal
              key={img.src}
              delay={i * 80}
              className={`group relative overflow-hidden rounded-sm ${img.span}`}
            >
              <Image
                src={img.src || "/placeholder.svg"}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--walnut-deep)]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
