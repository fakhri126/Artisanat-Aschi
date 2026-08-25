import { MapPin, Quote, Sparkles } from 'lucide-react'
import { Reveal } from './reveal'

interface MilestoneDetails {
  anecdote: string
  tools: string[]
  wood: string
}

interface Milestone {
  id: string
  year: string
  title: string
  subtitle: string
  image: string
  text: string
  badge: string
  location: string
  details: MilestoneDetails
}

const MILESTONES: Milestone[] = [
  {
    id: '1960',
    year: '1960',
    title: 'Fondation à Bab Jdid',
    subtitle: "L'origine du geste par Hechmi Aschi",
    image: '/story-founder.png',
    text: "C'est au cœur de Bab Jdid que Hechmi Aschi fonde le premier atelier. Armé d'une passion inébranlable pour la menuiserie fine, il commence à façonner le bois avec une précision qui deviendra la signature de la famille.",
    badge: 'La Fondation',
    location: 'Bab Jdid, Tunis',
    details: {
      anecdote: "Hechmi Aschi travaillait principalement à la lueur du jour pour capter les moindres reliefs du bois.",
      tools: ["Rabots", "Ciseaux forgés", "Trusquins"],
      wood: "Noyer de Tunisie, Olivier"
    }
  },
  {
    id: '1976',
    year: '1976',
    title: 'Le Souffle de La Goulette',
    subtitle: "L'installation face à la mer",
    image: '/story-transmission.png',
    text: "L'atelier s'installe à La Goulette, port historique de Tunis. Ce nouvel espace baigné de lumière marine inspire de nouvelles lignes et perfectionne les méthodes de séchage naturel du bois.",
    badge: "L'Installation",
    location: 'La Goulette, Tunis',
    details: {
      anecdote: "L'humidité ambiante régulée par la mer offrait des conditions idéales pour le séchage lent du bois massif.",
      tools: ["Limes", "Gouges", "Calibres"],
      wood: "Bois de Frêne, Noyer"
    }
  },
  {
    id: 'aujourdhui',
    year: "Aujourd'hui",
    title: 'La Nouvelle Génération',
    subtitle: 'Adel & Ismail Aschi',
    image: '/story-newgen.png',
    text: "En associant les techniques ancestrales héritées de leur père à des lignes contemporaines, les frères Aschi projettent l'atelier dans l'avenir tout en préservant l'authenticité absolue du fait main.",
    badge: 'La Relève',
    location: 'Atelier de La Goulette',
    details: {
      anecdote: "Les frères continuent d'utiliser les cahiers de croquis originaux de leur père, tout en collaborant avec des designers.",
      tools: ["Traçage laser", "Ciseaux hérités"],
      wood: "Chêne massif, Essences nobles"
    }
  }
]

export function Story() {
  return (
    <section id="histoire" className="relative bg-transparent py-14 sm:py-24 md:py-36 overflow-hidden border-none">
      {/* Unified Original Background */}
      <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
        
        <Reveal className="text-center mb-12 sm:mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A120B]/80 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] sm:tracking-[0.25em] mb-3 sm:mb-5 shadow-lg">
            <Sparkles className="size-3 sm:size-3.5 text-[#D4AF37] animate-pulse" />
            <span>Notre Histoire &amp; Genèse</span>
          </div>
          <h2 className="mt-2 font-heading text-3xl sm:text-5xl md:text-6xl text-gold-gradient font-light leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Un héritage dans le temps
          </h2>
        </Reveal>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Line for Desktop, Left Line for Mobile */}
          <div className="absolute left-2.5 md:left-1/2 top-4 bottom-0 w-px bg-[#D4AF37]/35 md:-translate-x-1/2" />

          <div className="space-y-12 sm:space-y-20 md:space-y-32">
            {MILESTONES.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={milestone.id} className="relative">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[6px] md:left-1/2 top-2 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 size-3 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)] border-2 border-[#1A120B] z-20" />

                  <Reveal delay={index * 150}>
                    <div className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-10 md:gap-16 pl-6 md:pl-0 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                      
                      {/* Image Side */}
                      <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <div className={`relative w-full max-w-sm sm:max-w-md aspect-[16/10] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl group ${isEven ? 'md:rounded-l-3xl md:rounded-tr-[100px] md:rounded-br-3xl' : 'md:rounded-r-3xl md:rounded-tl-[100px] md:rounded-bl-3xl'}`}>
                          <img 
                            src={milestone.image} 
                            alt={milestone.title}
                            className="size-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-[#1A120B]/20 group-hover:bg-transparent transition-colors duration-500" />
                          <div className={`absolute bottom-3 ${isEven ? 'left-3' : 'right-3'} bg-[#1A120B]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-lg`}>
                            <MapPin className="size-3 text-[#D4AF37]" />
                            <span className="text-[9px] sm:text-[10px] text-[#FFF6E5] tracking-widest uppercase font-bold">{milestone.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className={`w-full md:w-1/2 flex flex-col ${isEven ? 'md:pr-12 md:items-start md:text-left' : 'md:pl-12 md:items-end md:text-right'}`}>
                        <span className="text-[#D4AF37] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase mb-1 sm:mb-2">
                          {milestone.badge}
                        </span>
                        
                        <h3 className="font-heading text-4xl sm:text-6xl md:text-7xl text-gold-gradient font-light mb-1 sm:mb-3 italic tracking-tight drop-shadow-md">
                          {milestone.year}
                        </h3>
                        
                        <h4 className="text-xl sm:text-2xl md:text-3xl text-[#FFF6E5] font-light mb-2 sm:mb-4 drop-shadow-md">
                          {milestone.title}
                        </h4>
                        
                        <p className={`text-xs sm:text-base text-[#E8DCCB] leading-relaxed font-light mb-4 sm:mb-8 max-w-md ${isEven ? '' : 'md:text-right'}`}>
                          {milestone.text}
                        </p>
                        
                        <div className={`bg-[#1A120B]/75 backdrop-blur-md border border-[#D4AF37]/35 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 relative w-full max-w-md shadow-xl ${isEven ? 'text-left' : 'text-left md:text-right'}`}>
                          <Quote className={`size-5 sm:size-6 text-[#D4AF37]/30 absolute top-3 sm:top-4 ${isEven ? 'right-3 sm:right-4' : 'right-3 sm:right-4 md:left-4 md:right-auto'}`} />
                          <p className={`text-xs sm:text-sm text-[#E8DCCB]/90 italic leading-relaxed ${isEven ? 'pr-6 sm:pr-8' : 'pr-6 sm:pr-8 md:pr-0 md:pl-8'}`}>
                            {milestone.details.anecdote}
                          </p>
                        </div>
                      </div>

                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  )
}
