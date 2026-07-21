'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Anchor, Clock, MapPin, Sparkles, Award, Hammer, ChevronDown } from 'lucide-react'

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
    text: "C'est au cœur de Bab Jdid, l'une des portes historiques de la médina de Tunis, que Hechmi Aschi fonde le premier atelier. Armé d'une passion inébranlable pour la menuiserie fine et l'ébénisterie d'art, il commence à façonner le bois avec une précision et un respect de la matière qui deviendront la signature indélébile de la famille Aschi.",
    badge: 'La Fondation',
    location: 'Bab Jdid, Tunis',
    details: {
      anecdote: "Hechmi Aschi travaillait principalement à la lueur du jour pour capter les moindres reliefs du bois. Le premier établi de l'atelier, sculpté dans un tronc d'olivier sauvage, est toujours conservé comme le symbole fondateur du savoir-faire de la famille.",
      tools: ["Rabots traditionnels en bois de hêtre", "Ciseaux forgés main", "Trusquins et outils de tracé traditionnels"],
      wood: "Noyer de Tunisie (pour sa noblesse sombre) et Olivier sauvage (pour son veinage spectaculaire)."
    }
  },
  {
    id: '1976',
    year: '1976',
    title: 'Le Souffle de La Goulette',
    subtitle: "L'installation de l'atelier face à la mer",
    image: '/story-transmission.png',
    text: "En 1976, l'atelier s'installe à La Goulette, port historique et balnéaire de Tunis. Ce nouvel espace baigné de lumière marine et de sérénité devient le berceau de créations monumentales. L'odeur du bois fraîchement taillé s'y mêle à celle de la brise marine, inspirant de nouvelles lignes et perfectionnant les méthodes de séchage naturel du bois.",
    badge: "L'Installation",
    location: 'La Goulette, Tunis',
    details: {
      anecdote: "Le choix de La Goulette n'était pas fortuit : l'humidité ambiante régulée par la mer offrait des conditions idéales pour le séchage lent du bois massif, évitant ainsi les fissures futures des pièces monumentales.",
      tools: ["Limes et râpes de précision", "Gouges de sculpture pour bas-reliefs", "Calibres de séchage"],
      wood: "Bois de Frêne et Noyer, particulièrement adaptés aux pièces d'exception soumises aux climats maritimes."
    }
  },
  {
    id: 'aujourdhui',
    year: "Aujourd'hui",
    title: 'La Nouvelle Génération',
    subtitle: 'Adel & Ismail Aschi, la transmission perpétuelle',
    image: '/story-newgen.png',
    text: "Aujourd'hui, les frères Adel et Ismail Aschi reprennent le flambeau. En associant les techniques ancestrales héritées de leur père à des lignes contemporaines et épurées, ils projettent l'atelier dans l'avenir tout en préservant l'authenticité absolue du travail fait main.",
    badge: 'La Nouvelle Génération',
    location: 'Atelier de La Goulette',
    details: {
      anecdote: "Les deux frères continuent d'utiliser les cahiers de croquis originaux de leur père, tout en collaborant avec des designers contemporains internationaux pour intégrer les pièces Aschi dans des projets d'architecture modernes à travers le monde.",
      tools: ["Ciseaux de sculpture hérités de Hechmi Aschi", "Outils de traçage laser de précision", "Finitions à la cire d'abeille bio faite maison"],
      wood: "Chêne massif, Noyer centenaire récupéré et essences locales tunisiennes nobles."
    }
  }
]

interface MilestoneRowProps {
  milestone: Milestone
  index: number
  onInView: (id: string) => void
}

function MilestoneRow({ milestone, index, onInView }: MilestoneRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    margin: '-35% 0px -45% 0px',
    once: false
  })
  
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isInView) {
      onInView(milestone.id)
    }
  }, [isInView, milestone.id, onInView])

  const isEven = index % 2 === 0

  return (
    <div 
      ref={ref}
      id={`milestone-${milestone.id}`}
      className="relative mb-24 md:mb-40 last:mb-0 scroll-mt-48"
    >
      {/* Node Marker */}
      <div className="absolute left-8 top-12 md:left-1/2 -translate-x-[9px] md:-translate-x-1/2 z-20">
        <motion.div 
          className="size-5 rounded-full border-2 border-gold bg-walnut flex items-center justify-center cursor-pointer"
          animate={{
            scale: isInView ? 1.25 : 1,
            borderColor: isInView ? 'var(--gold)' : 'rgba(197, 168, 128, 0.4)',
            boxShadow: isInView ? '0 0 15px var(--gold)' : 'none'
          }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        >
          {isInView && (
            <motion.div 
              layoutId="active-node-core" 
              className="size-2 rounded-full bg-gold"
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )}
        </motion.div>
      </div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-10 md:gap-20 pl-20 md:pl-0">
        {/* Left Side (Desktop: Text or Image) */}
        <div className={cn(
          "flex flex-col justify-center",
          isEven ? "md:order-1 md:text-right md:items-end" : "md:order-2 md:text-left md:items-start"
        )}>
          {/* Card Content animation wrapper */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -45 : 45, y: 25 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
            className="group animate-none"
          >
            {/* Header Badge */}
            <div className={cn(
              "flex items-center gap-2 text-xs uppercase tracking-luxury text-gold mb-3",
              isEven ? "md:justify-end" : "md:justify-start"
            )}>
              {milestone.id === '1976' ? <Anchor className="size-3.5 text-gold" /> : <Clock className="size-3.5 text-gold" />}
              <span>{milestone.badge}</span>
              <span className="text-white/20">•</span>
              <MapPin className="size-3.5 text-gold" />
              <span>{milestone.location}</span>
            </div>

            {/* Giant Year Backdrop */}
            <h4 className="font-heading text-6xl md:text-7xl font-extralight text-gold/15 select-none leading-none mb-2 transition-colors duration-500 group-hover:text-gold/25">
              {milestone.year}
            </h4>

            <h3 className="font-heading text-3xl font-light text-white leading-tight mb-2">
              {milestone.title}
            </h3>
            
            <p className="text-sm font-medium tracking-wide text-gold/80 italic mb-4">
              {milestone.subtitle}
            </p>

            <p className={cn(
              "text-base font-light leading-relaxed text-walnut-foreground/80 max-w-md",
              isEven ? "md:ml-auto" : "md:mr-auto"
            )}>
              {milestone.text}
            </p>

            {/* Expandable trigger */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "mt-6 flex items-center gap-2 text-sm text-gold hover:text-gold/80 font-medium tracking-wider uppercase transition-colors group/btn cursor-pointer",
                isEven ? "md:flex-row-reverse" : ""
              )}
            >
              <span>{isExpanded ? "Masquer les secrets" : "Découvrir l'histoire secrète"}</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="size-4 group-hover/btn:translate-y-0.5 transition-transform" />
              </motion.span>
            </button>

            {/* Expandable panel */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "mt-6 p-5 rounded-lg border border-gold/15 bg-walnut-deep/60 backdrop-blur-sm text-left text-sm space-y-4 max-w-md",
                    isEven ? "md:ml-auto" : ""
                  )}>
                    {/* Anecdote */}
                    <div className="flex gap-3 items-start">
                      <Sparkles className="size-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gold block mb-0.5 font-sans uppercase text-[11px] tracking-wider">L&apos;Anecdote de l&apos;époque</strong>
                        <p className="text-walnut-foreground/75 font-light leading-relaxed">{milestone.details.anecdote}</p>
                      </div>
                    </div>
                    
                    {/* Wood Types */}
                    <div className="flex gap-3 items-start">
                      <Award className="size-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gold block mb-0.5 font-sans uppercase text-[11px] tracking-wider">Essences à l&apos;honneur</strong>
                        <p className="text-walnut-foreground/75 font-light leading-relaxed">{milestone.details.wood}</p>
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="flex gap-3 items-start">
                      <Hammer className="size-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gold block mb-1 font-sans uppercase text-[11px] tracking-wider">Outils d&apos;artisanat</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {milestone.details.tools.map((tool, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/15 font-sans tracking-wide"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Side (Desktop: Image or Text) */}
        <div className={cn(
          "flex items-center justify-center",
          isEven ? "md:order-2" : "md:order-1"
        )}>
          <motion.div
            initial={{ opacity: 0, x: isEven ? 45 : -45, y: 35 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
            className="w-full max-w-md relative"
          >
            {/* Background gold border decorative box */}
            <motion.div 
              className="absolute inset-0 border border-gold/30 rounded-lg translate-x-3 translate-y-3 pointer-events-none"
              variants={{
                initial: { x: 12, y: 12, opacity: 0.3, borderColor: 'rgba(197, 168, 128, 0.3)' },
                hover: { x: 18, y: 18, opacity: 0.9, borderColor: 'rgba(197, 168, 128, 0.7)' }
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />

            {/* Main Interactive Card */}
            <motion.div 
              initial="initial"
              whileHover="hover"
              className="relative overflow-hidden rounded-lg border border-white/10 shadow-2xl bg-walnut-deep aspect-[4/5] cursor-pointer group"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.img
                src={milestone.image}
                alt={milestone.title}
                className="w-full h-full object-cover"
                variants={{
                  initial: { scale: 1.02 },
                  hover: { scale: 1.08 }
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-deep/80 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/20 group-hover:ring-gold/40 transition-all duration-500 rounded-lg" />
              
              {/* Tap to expand overlay indicator */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[11px] uppercase tracking-luxury text-gold bg-walnut-deep/90 px-3 py-1.5 rounded-full border border-gold/20 backdrop-blur-sm">
                  {isExpanded ? "Fermer les secrets" : "Explorer l'histoire"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function Story() {
  const [activeMilestone, setActiveMilestone] = useState('1960')
  const timelineRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // useScroll for progress bar
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 40%', 'end 60%']
  })
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  })

  // Function to scroll to a milestone
  const scrollToMilestone = (id: string) => {
    const element = document.getElementById(`milestone-${id}`)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - 180
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section 
      ref={sectionRef} 
      id="histoire" 
      className="relative bg-walnut py-24 text-walnut-foreground md:py-36 overflow-hidden grain"
    >
      {/* Decorative Background Lighting */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-bronze/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
        
        {/* Title and Intro */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-20">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-luxury text-gold block font-sans font-medium">
                Héritage & Passion
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-light leading-tight text-white">
                Soixante années à façonner le bois et la mémoire
              </h2>
            </div>
            <p className="text-base font-light leading-relaxed text-walnut-foreground/80 max-w-lg">
              Depuis sa création, la maison Artisanat Aschi perpétue un dialogue intime entre la main de l&apos;artisan et la noblesse du bois. Chaque création porte en elle l&apos;empreinte du temps, du geste précis et de la transmission familiale.
            </p>
          </div>
          <div className="relative">
            {/* Decorative gold frame */}
            <div className="absolute inset-0 border border-gold/30 rounded-lg translate-x-3 translate-y-3 pointer-events-none" />
            <motion.div 
              className="relative overflow-hidden rounded-lg border border-white/10 shadow-2xl aspect-[16/9] group"
              whileHover={{ scale: 1.01 }}
            >
              <motion.img 
                src="/wood-selection.png" 
                alt="Sélection du bois d'ébénisterie" 
                className="w-full h-full object-cover object-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-deep/90 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-4 left-4 text-xs font-sans text-gold bg-walnut-deep/80 backdrop-blur-sm px-3 py-1.5 rounded border border-gold/15">
                L&apos;art du choix des grumes de bois noble
              </span>
            </motion.div>
          </div>
        </div>

        {/* Sticky Year Navigation */}
        <div className="sticky top-[72px] md:top-[80px] z-40 bg-walnut/90 backdrop-blur-md border-y border-gold/10 py-4 mb-16 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 flex justify-center items-center gap-6 sm:gap-12 md:gap-16">
            {MILESTONES.map((m) => {
              const isActive = activeMilestone === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => scrollToMilestone(m.id)}
                  className="relative py-1 text-sm sm:text-base font-sans tracking-luxury uppercase transition-colors focus:outline-none cursor-pointer"
                >
                  <span className={cn(
                    "transition-colors duration-300 font-medium",
                    isActive ? "text-gold" : "text-walnut-foreground/45 hover:text-walnut-foreground/80"
                  )}>
                    {m.year}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-timeline-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold shadow-[0_0_8px_rgba(197,168,128,0.6)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative mt-20 md:mt-32 max-w-5xl mx-auto">
          {/* Central Vertical Timeline Progress Line */}
          <div className="absolute left-8 top-8 bottom-8 w-[2px] md:left-1/2 md:-translate-x-[1px] bg-white/10">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-gold/30 via-gold to-gold/20 shadow-[0_0_10px_rgba(197,168,128,0.6)] origin-top"
              style={{
                height: '100%',
                scaleY: scaleY
              }}
            />
          </div>

          {/* Milestones Rows */}
          <div className="space-y-24 md:space-y-36">
            {MILESTONES.map((milestone, index) => (
              <MilestoneRow
                key={milestone.id}
                milestone={milestone}
                index={index}
                onInView={setActiveMilestone}
              />
            ))}
          </div>
        </div>
        
      </div>
    </section>
  )
}

