import Image from 'next/image'
import { Reveal } from './reveal'
import { Sparkles, Compass, Gem, Layers, Flame } from 'lucide-react'

const MATERIALS = [
  {
    roman: 'I',
    title: 'Les Motifs',
    icon: Compass,
    image: '/images/raw-sculptures.jpg',
    origin: 'Ciselure d\'Art',
    description: 'Des tracés délicats et des motifs ancestraux finement taillés dans la matière.',
  },
  {
    roman: 'II',
    title: 'Le Jelliz',
    icon: Gem,
    image: '/images/raw-jelliz.jpg',
    origin: 'Faïence Émaillée',
    description: 'Des éclats de couleurs traditionnels pour enrichir nos pièces en bois avec élégance.',
  },
  {
    roman: 'III',
    title: 'Le Bois Noble',
    icon: Layers,
    image: '/images/raw-motifs.jpg',
    origin: 'Noyer Sélectionné',
    description: 'La profondeur du bois sculpté au ciseau, donnant naissance à des reliefs intemporels.',
  },
  {
    roman: 'IV',
    title: 'Le Cuivre',
    icon: Flame,
    image: '/images/raw-cuivre.jpg',
    origin: 'Ferronnerie d\'Apparat',
    description: 'Le métal martelé et gravé qui vient sublimer et couronner le bois noble.',
  }
]

export function RawMaterials() {
  return (
    <section id="matieres-premieres" className="relative bg-transparent py-10 sm:py-24 md:py-36 overflow-hidden border-none">
      {/* Unified Original Background */}
      <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-8">
        
        {/* Section Header */}
        <Reveal className="mx-auto max-w-3xl text-center mb-6 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#1A120B]/85 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[9px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.25em] mb-2 sm:mb-4 shadow-lg">
            <Sparkles className="size-2.5 sm:size-3.5 text-[#D4AF37] animate-pulse" />
            <span>Matières Premières Nobles</span>
          </div>
          <h2 className="text-balance font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gold-gradient leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            L&apos;essence de notre art
          </h2>
          <p className="mx-auto mt-1.5 sm:mt-4 max-w-xl text-pretty text-[11px] sm:text-base font-light leading-relaxed text-[#E8DCCB] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] px-2">
            Découvrez les éléments bruts et authentiques qui donnent vie à nos créations. De la noblesse du bois à l&apos;éclat du cuivre et du Jelliz.
          </p>
        </Reveal>

        {/* 4 Cards Grid (2 Columns on Mobile, 4 Columns on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8">
          {MATERIALS.map((item, index) => (
            <Reveal key={item.title} delay={80 * index} className="group h-full">
              <div className="relative flex flex-col h-full bg-[#1A120B]/80 hover:bg-[#281A12]/90 backdrop-blur-md rounded-xl sm:rounded-3xl overflow-hidden border border-[#D4AF37]/35 hover:border-[#D4AF37]/90 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(212,175,55,0.25)] hover:-translate-y-1 shadow-xl">
                
                {/* Image Container with Roman Badge */}
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#1A120B] border-b border-[#D4AF37]/25">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-108"
                  />
                  {/* Subtle Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B] via-transparent to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-55" />
                  
                  {/* Roman Index Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 size-5 sm:size-7 rounded-full bg-[#1A120B]/90 backdrop-blur-md border border-[#D4AF37]/40 flex items-center justify-center text-[#F2BD52] font-heading font-bold text-[9px] sm:text-xs shadow-md">
                    {item.roman}
                  </div>

                  {/* Micro Origin Pill */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 py-0.5 sm:px-2.5 rounded-full bg-[#1A120B]/90 backdrop-blur-md border border-[#D4AF37]/35 text-[#F2BD52] text-[7.5px] sm:text-[9px] uppercase tracking-wider font-bold shadow-md">
                    {item.origin}
                  </div>
                </div>
                
                {/* Card Text Content */}
                <div className="relative flex flex-col p-2.5 sm:p-6 flex-grow z-10 -mt-2 sm:-mt-5">
                  <div className="w-5 sm:w-10 h-0.5 bg-[#D4AF37] mb-1.5 sm:mb-3 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-125 shadow-sm" />
                  
                  <h3 className="font-heading text-xs sm:text-2xl font-normal text-[#FFF6E5] group-hover:text-[#F2BD52] transition-colors mb-1 drop-shadow leading-tight line-clamp-1">
                    {item.title}
                  </h3>
                  
                  <p className="text-[9.5px] sm:text-xs font-light leading-relaxed text-[#E8DCCB]/90 line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                </div>
                
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
