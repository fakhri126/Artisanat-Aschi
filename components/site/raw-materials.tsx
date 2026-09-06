'use client'

import Image from 'next/image'
import { Reveal } from './reveal'
import { Sparkles, Trees, Flame, Gem, Crown } from 'lucide-react'

const MATERIALS = [
  {
    tag: 'Haute Sculpture',
    title: 'Motifs & Sculptures d\'Art',
    icon: Trees,
    image: '/images/raw-sculptures.jpg',
    origin: 'Ciselure Manuelle',
    description: 'Des arabesques et reliefs traditionnels minutieusement taillés au ciseau dans le bois noble.',
  },
  {
    tag: 'Arts du Feu',
    title: 'Le Jelliz & Céramiques',
    icon: Gem,
    image: '/images/raw-jelliz.jpg',
    origin: 'Faïence Émaillée',
    description: 'Des éclats de couleurs traditionnels peints à la main pour enrichir nos meubles d\'art avec élégance.',
  },
  {
    tag: 'Bois Noble',
    title: 'Noyer Massif Sélectionné',
    icon: Crown,
    image: '/images/raw-motifs.jpg',
    origin: 'Séché à Cœur',
    description: 'La profondeur du bois noble sculpté donnant naissance à des pièces monumentales et intemporelles.',
  },
  {
    tag: 'Orfèvrerie',
    title: 'Le Cuivre & Laiton Martelé',
    icon: Flame,
    image: '/images/raw-cuivre.jpg',
    origin: 'Ferronnerie d\'Apparat',
    description: 'Le métal martelé, gravé et ciselé à la main qui vient couronner le bois noble avec distinction.',
  }
]

export function RawMaterials() {
  return (
    <section id="matieres-premieres" className="relative bg-transparent py-10 sm:py-16 lg:py-24 overflow-hidden border-none scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>Matières Premières Nobles</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light text-gold-gradient drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2">
              L&apos;Essence de Notre Savoir-Faire
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-white drop-shadow font-normal max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-1">
              Des matières brutes de la plus haute noblesse, façonnées et associées avec la patience et la dextérité des maîtres d&apos;autrefois.
            </p>
          </Reveal>
        </div>

        {/* 4 Cards Grid (2 Columns on Mobile, 4 Columns on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {MATERIALS.map((item, index) => {
            const IconComp = item.icon

            return (
              <Reveal key={item.title} delay={index * 60} className="h-full">
                <div className="relative flex flex-col h-full bg-[#3B271C]/90 hover:bg-[#483022]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#E6A635]/40 hover:border-[#E6A635]/85 transition-all duration-500 hover:shadow-[0_20px_45px_rgba(230,166,53,0.25)] hover:-translate-y-1 shadow-xl group">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#241812] border-b border-[#E6A635]/25">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[1.2s] group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/95 via-transparent to-black/20 pointer-events-none" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-2.5 left-2.5 size-7 sm:size-8 rounded-xl bg-[#241812]/95 backdrop-blur-md border border-[#E6A635]/40 flex items-center justify-center text-[#F2BD52] shadow-md">
                      <IconComp className="size-3.5 sm:size-4" />
                    </div>

                    {/* Origin Pill */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#241812]/95 backdrop-blur-md border border-[#E6A635]/35 text-[#F2BD52] text-[8px] sm:text-[9px] uppercase tracking-wider font-bold shadow-md">
                      {item.origin}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="relative flex flex-col p-3 sm:p-5 flex-grow z-10 justify-between">
                    <div>
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.14em] text-[#F2BD52] font-bold block mb-1">
                        {item.tag}
                      </span>
                      
                      <h3 className="font-heading text-sm sm:text-lg font-semibold text-white group-hover:text-[#F2BD52] transition-colors mb-1.5 leading-snug drop-shadow">
                        {item.title}
                      </h3>
                      
                      <p className="text-[10px] sm:text-xs font-normal leading-relaxed text-white/90 drop-shadow">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E6A635]/20 flex items-center gap-1.5 text-[8.5px] sm:text-[9.5px] text-[#F2BD52] font-semibold uppercase tracking-wider">
                      <Sparkles className="size-2.5 text-[#E6A635]" />
                      <span>Matériau Certifié</span>
                    </div>
                  </div>
                  
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
