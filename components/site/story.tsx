import { MapPin, Quote } from 'lucide-react'
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
    <section id="histoire" className="relative bg-transparent py-24 md:py-36 overflow-hidden border-t border-[#E8DCCB]/10">
      {/* Unified Background */}
      <div className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        
        <Reveal className="text-center mb-20 md:mb-32">
          <p className="text-[#C17D59] text-sm md:text-base font-bold tracking-[0.2em] uppercase">
            Notre Histoire
          </p>
          <h2 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl text-[#E8DCCB] font-light">
            Un héritage dans le temps
          </h2>
        </Reveal>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Line for Desktop, Left Line for Mobile */}
          <div className="absolute left-0 md:left-1/2 top-4 bottom-0 w-px bg-[#C17D59]/30 md:-translate-x-1/2" />

          <div className="space-y-20 md:space-y-32">
            {MILESTONES.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={milestone.id} className="relative">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] md:left-1/2 top-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-3 h-3 bg-[#C17D59] rounded-full shadow-[0_0_15px_rgba(193,125,89,0.8)] border-2 border-[#3A2A21] z-20" />

                  <Reveal delay={index * 150}>
                    <div className={`relative flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                      
                      {/* Image Side */}
                      <div className={`w-full pl-8 md:pl-0 md:w-1/2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <div className={`relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DCCB]/20 group shadow-2xl ${isEven ? 'md:rounded-l-3xl md:rounded-tr-[100px] md:rounded-br-3xl' : 'md:rounded-r-3xl md:rounded-tl-[100px] md:rounded-bl-3xl'}`}>
                          <img 
                            src={milestone.image} 
                            alt={milestone.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500" />
                          <div className={`absolute bottom-4 ${isEven ? 'left-4' : 'right-4'} bg-stone-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E8DCCB]/20 flex items-center gap-2`}>
                            <MapPin className="w-3 h-3 text-[#C17D59]" />
                            <span className="text-[10px] text-[#E8DCCB] tracking-widest uppercase">{milestone.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className={`w-full pl-8 md:pl-0 md:w-1/2 flex flex-col ${isEven ? 'md:pr-12 md:items-start md:text-left' : 'md:pl-12 md:items-end md:text-right'}`}>
                        <span className="text-[#C17D59] text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
                          {milestone.badge}
                        </span>
                        
                        <h3 className="font-heading text-6xl md:text-7xl text-[#E8DCCB] font-light mb-3 italic tracking-tight opacity-90">
                          {milestone.year}
                        </h3>
                        
                        <h4 className="text-2xl md:text-3xl text-white/90 font-medium mb-4">
                          {milestone.title}
                        </h4>
                        
                        <p className={`text-base text-white/70 leading-relaxed font-light mb-8 max-w-md ${isEven ? '' : 'md:text-right'}`}>
                          {milestone.text}
                        </p>
                        
                        <div className={`bg-stone-900/60 backdrop-blur-md border border-[#E8DCCB]/10 rounded-2xl p-6 relative w-full max-w-md ${isEven ? 'text-left' : 'text-left md:text-right'}`}>
                          <Quote className={`w-6 h-6 text-[#C17D59]/20 absolute top-4 ${isEven ? 'right-4' : 'right-4 md:left-4 md:right-auto'}`} />
                          <p className={`text-sm text-white/60 italic leading-relaxed ${isEven ? 'pr-8' : 'pr-8 md:pr-0 md:pl-8'}`}>
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
