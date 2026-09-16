'use client'

import { MapPin, Quote, Sparkles, Calendar } from 'lucide-react'
import { Reveal } from './reveal'
import Image from 'next/image'

interface Milestone {
  id: string
  year: string
  title: string
  subtitle: string
  image: string
  text: string
  badge: string
  location: string
  anecdote: string
  objectPosition?: string
  aspectRatioClass?: string
}

const MILESTONES: Milestone[] = [
  {
    id: '1950-1960',
    year: 'Années 1950–1960',
    title: 'Les Racines',
    subtitle: "L'éveil du geste & la passion des pièces anciennes",
    image: '/images/story-1950-1960.jpg',
    text: "À Tunis, Hachemi Aschi et son frère Abdelaziz, passionnés de pièces anciennes, se forment en autodidactes au fil de leurs découvertes et collections. Héritiers du savoir-faire de leur père, baradai, ils développent le travail du bois, du cuir et du cuivre, donnant naissance aux coffres artisanaux, marionnettes et premières créations emblématiques de la maison.",
    badge: 'Les Racines',
    location: 'Tunis',
    anecdote: "Héritiers du savoir-faire de leur père baradai, ils développent le travail du bois, du cuir et du cuivre pour forger l'âme de la maison.",
    objectPosition: 'object-center',
    aspectRatioClass: 'aspect-[4/3]'
  },
  {
    id: '1976',
    year: '1976',
    title: 'L’Atelier de La Goulette',
    subtitle: "L'ancrage au port & le rayonnement patrimonial",
    image: '/images/story-1976.jpg',
    text: "L’aventure se poursuit et prend de l’ampleur à La Goulette. Autour de Hachemi Aschi, le travail fait main s’affirme et se diversifie : coffres, mobilier sculpté et objets décoratifs, entre restauration, création et valorisation du patrimoine artisanal tunisien.",
    badge: 'L’Atelier',
    location: 'La Goulette, Tunis',
    anecdote: "Autour de Hachemi Aschi, le travail fait main s'affirme : coffres, mobilier sculpté et mise en valeur du patrimoine artisanal tunisien.",
    objectPosition: 'object-top',
    aspectRatioClass: 'aspect-[4/3] sm:aspect-[4/5]'
  },
  {
    id: '2018',
    year: 'La Transmission 2018',
    title: 'La Transmission',
    subtitle: "Adel & Ismail Aschi poursuivent l'histoire familiale",
    image: '/images/story-transmission-2018.jpg',
    text: "Après le décès de Hachemi Aschi, ses fils Adel et Ismail poursuivent l’histoire familiale. Ils préservent les techniques et le savoir-faire hérités tout en développant de nouvelles créations.",
    badge: 'La Transmission',
    location: 'Atelier de La Goulette',
    anecdote: "Adel et Ismail préservent avec dévouement les techniques et gestes ancestraux tout en développant de nouvelles créations.",
    objectPosition: 'object-center',
    aspectRatioClass: 'aspect-[4/3]'
  },
  {
    id: 'aujourd-hui',
    year: "Aujourd'hui",
    title: 'Un Savoir-Faire en Évolution',
    subtitle: "Mobilier, portes, luminaires & projets d'envergure",
    image: '/images/story-aujourdhui.jpg',
    text: "Artisanat Aschi élargit son univers au mobilier, portes, luminaires et aménagements sur mesure, en associant savoir-faire traditionnel et création contemporaine. Aujourd’hui, la maison accompagne également des projets de grande envergure : projets immobiliers, hôtels, maisons d’hôtes, villas et espaces professionnels.",
    badge: 'Création Contemporaine & Projets',
    location: 'Tunisie & International',
    anecdote: "De la pièce sculptée d'art et luminaires sur-mesure aux projets hôteliers et résidentiels d'envergure : tradition vivante et création contemporaine.",
    objectPosition: 'object-center',
    aspectRatioClass: 'aspect-[4/3] sm:aspect-[4/5]'
  }
]

export function Story() {
  return (
    <section id="histoire" className="relative bg-transparent py-12 sm:py-20 lg:py-28 overflow-hidden border-none scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8">
        
        {/* En-tête Statutaire */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Chronologie &amp; Héritage</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2">
              Les Dates Clés d&apos;Artisanat Aschi
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-white drop-shadow font-normal max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-1">
              Des racines artisanales des années 1950 aux projets contemporains d&apos;envergure : plus de six décennies de passion et de transmission familiale.
            </p>
          </Reveal>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Ligne dorée centrale (Desktop) / gauche (Mobile) */}
          <div className="absolute left-3.5 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#E6A635] via-[#E6A635]/40 to-transparent md:-translate-x-1/2 pointer-events-none" />

          <div className="space-y-10 sm:space-y-16 md:space-y-24">
            {MILESTONES.map((milestone, index) => {
              const isEven = index % 2 === 0

              return (
                <div key={milestone.id} className="relative">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[10px] md:left-1/2 top-3 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 size-3.5 sm:size-4 bg-gradient-to-r from-[#F3C45E] to-[#E6A635] rounded-full shadow-[0_0_15px_#E6A635] border-2 border-[#241812] z-20" />

                  <Reveal delay={index * 100}>
                    <div className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-5 sm:gap-8 md:gap-14 pl-8 md:pl-0 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                      
                      {/* 1. Colonne Image */}
                      <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <div className={`relative w-full max-w-md ${milestone.aspectRatioClass || 'aspect-[4/3]'} rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/45 bg-[#3B271C] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group`}>
                          <Image 
                            src={milestone.image} 
                            alt={milestone.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            className={`object-cover ${milestone.objectPosition || 'object-center'} transition-transform duration-1000 group-hover:scale-105`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/90 via-transparent to-transparent pointer-events-none" />
                          
                          <div className={`absolute bottom-3 ${isEven ? 'left-3' : 'right-3'} bg-[#3B271C]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#E6A635]/40 flex items-center gap-1.5 shadow-md`}>
                            <MapPin className="size-3 text-[#E6A635]" />
                            <span className="text-[9px] sm:text-[10px] text-white tracking-wider uppercase font-bold">{milestone.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Colonne Texte & Anecdote */}
                      <div className={`w-full md:w-1/2 flex flex-col justify-center text-left ${isEven ? 'md:pr-6 md:text-left' : 'md:pl-6 md:text-right'}`}>
                        
                        <div className={`flex items-center gap-2 mb-1 ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/35 text-[#F2BD52] text-[9.5px] uppercase tracking-wider font-bold">
                            <Calendar className="size-3 text-[#E6A635]" />
                            {milestone.badge}
                          </span>
                        </div>
                        
                        {/* Année Monumentale */}
                        <div className="font-heading text-2xl sm:text-4xl lg:text-5xl text-gold-gradient font-light leading-tight mb-1 drop-shadow">
                          {milestone.year}
                        </div>
                        
                        {/* Titre */}
                        <h3 className="font-heading text-lg sm:text-2xl text-white font-normal mb-1.5 drop-shadow leading-snug">
                          {milestone.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal mb-3 drop-shadow">
                          {milestone.text}
                        </p>
                        
                        {/* Boîte Anecdote Raffinée */}
                        <div className="bg-[#3B271C]/90 backdrop-blur-xl border-l-2 border-[#E6A635] rounded-r-2xl p-3 sm:p-4 relative shadow-lg text-left">
                          <Quote className="size-4 text-[#E6A635] mb-1" />
                          <p className="text-[11px] sm:text-xs text-white/95 italic leading-relaxed">
                            « {milestone.anecdote} »
                          </p>
                        </div>

                      </div>

                    </div>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
