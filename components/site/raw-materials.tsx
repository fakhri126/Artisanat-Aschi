import Image from 'next/image'
import { Reveal } from './reveal'

const MATERIALS = [
  {
    title: 'Les Motifs',
    image: '/images/raw-sculptures.jpg', // Combs (les peignes sculptés)
    description: 'Des tracés délicats et des motifs ancestraux finement taillés dans la matière.',
  },
  {
    title: 'Le Jelliz',
    image: '/images/raw-jelliz.jpg',
    description: 'Des éclats de couleurs traditionnels pour enrichir nos pièces en bois avec élégance.',
  },
  {
    title: 'Les Sculptures',
    image: '/images/raw-motifs.jpg', // Wood squares (le bois sculpté)
    description: 'La profondeur du bois sculpté, donnant naissance à des reliefs intemporels.',
  },
  {
    title: 'Le Cuivre',
    image: '/images/raw-cuivre.jpg',
    description: 'Le métal martelé et gravé qui vient sublimer et couronner le bois noble.',
  }
]

export function RawMaterials() {
  return (
    <section id="matieres-premieres" className="relative bg-transparent py-24 md:py-36 overflow-hidden border-t border-[#E8DCCB]/10">
      {/* Unified Background */}
      <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#C17D59]">
            Matières Premières
          </p>
          <h2 className="mt-5 text-balance font-heading text-4xl font-light leading-tight text-[#E8DCCB] sm:text-5xl md:text-6xl">
            L&apos;essence de notre art
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-[#D4B896]">
            Découvrez les éléments bruts et authentiques qui donnent vie à nos créations. De la noblesse du bois à l&apos;éclat du cuivre et du Jelliz.
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {MATERIALS.map((item, index) => (
            <Reveal key={item.title} delay={150 * index} className="group h-full">
              <div className="relative flex flex-col h-full bg-stone-900/60 backdrop-blur-md rounded-2xl overflow-hidden border border-[#E8DCCB]/10 transition-all duration-500 hover:border-[#C17D59]/50 hover:bg-stone-900/80 hover:shadow-[0_8px_30px_rgba(193,125,89,0.15)] hover:-translate-y-2">
                
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-stone-950">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                </div>
                
                {/* Content */}
                <div className="relative flex flex-col p-8 md:p-10 flex-grow z-10 -mt-16">
                  <div className="w-12 h-1 bg-[#C17D59] mb-6 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-150" />
                  <h3 className="font-heading text-3xl font-medium text-[#E8DCCB] mb-4 drop-shadow-sm">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base font-light leading-relaxed text-[#D4B896]">
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
