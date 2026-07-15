'use client'

import { useEffect, useState } from 'react'
import { ArrowDown } from 'lucide-react'

import Image from 'next/image'

const HERO_IMAGES = [
  '/porte.png',
  '/herochaise1.png',
  '/buffet.png',
  '/miroir.png',
  '/prod1.jpg',
  '/prod2.jpg',
  '/prod3.jpg',
  '/prod4.jpg',
  '/new1.jpg',
  '/new2.jpg'
]

export function Hero() {
  const [offset, setOffset] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="top" className="relative h-screen min-h-[40rem] w-full overflow-hidden grain">
      {/* Parallax background slideshow */}
      <div
        className="absolute inset-0 scale-110"
        style={{ transform: `translateY(${offset * 0.4}px) scale(1.1)` }}
      >
        {HERO_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="Atelier d'ébénisterie Artisanat Aschi"
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          />
        ))}
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-walnut/70 via-walnut/40 to-walnut/90" />
      <div className="absolute inset-0 z-10 bg-walnut/20" />

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p
          className="mb-6 animate-[fadeIn_1.4s_ease] text-xs uppercase tracking-luxury text-gold sm:text-sm"
          style={{ animationFillMode: 'both' }}
        >
          Atelier d&apos;art · Tunisie · Depuis 1960
        </p>
        <h1 className="font-heading text-6xl font-medium leading-[0.95] text-ivory text-shadow-cinematic sm:text-7xl md:text-8xl lg:text-[8.5rem]">
          Artisanat Aschi
        </h1>
        <p className="mt-8 max-w-2xl font-heading text-2xl font-light italic leading-snug text-ivory/90 text-shadow-cinematic sm:text-3xl md:text-4xl">
          « Depuis 1960, nous sculptons l&apos;âme du patrimoine tunisien. »
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <a
            href="#histoire"
            className="rounded-full bg-gold px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:bg-ivory"
          >
            Découvrir l&apos;atelier
          </a>
          <a
            href="#creations"
            className="rounded-full border border-ivory/60 px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory transition-all duration-300 hover:border-gold hover:text-gold"
          >
            Explorer nos créations
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-ivory/70">
        <ArrowDown className="size-6 animate-bounce" />
      </div>
    </section>
  )
}
