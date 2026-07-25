'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MapPin, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

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
  const [index, setIndex] = useState(0)
  const activeMilestone = MILESTONES[index]

  const next = () => setIndex((prev) => (prev + 1) % MILESTONES.length)
  const prev = () => setIndex((prev) => (prev - 1 + MILESTONES.length) % MILESTONES.length)

  return (
    <section id="histoire" className="relative bg-walnut py-24 flex items-center justify-center overflow-hidden grain border-y border-gold/10">
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('/wood-bg.jpg')] bg-cover bg-center" />
      
      <div className="mx-auto max-w-5xl px-6 relative z-10 w-full">
        
        {/* Adorable Chic Card */}
        <div className="bg-walnut-deep/80 backdrop-blur-md rounded-3xl p-6 md:p-12 shadow-2xl border border-gold/20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Left: Arch Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-64 h-[22rem] md:w-80 md:h-[450px] overflow-hidden rounded-t-[1000px] rounded-b-3xl border-[4px] border-gold/20 shadow-[0_0_30px_rgba(197,168,128,0.15)] bg-stone-900 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeMilestone.id}
                  src={activeMilestone.image}
                  alt={activeMilestone.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-walnut-deep/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gold/30 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gold" />
                <span className="text-[10px] text-ivory tracking-widest uppercase whitespace-nowrap">{activeMilestone.location}</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center relative min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMilestone.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col"
              >
                <span className="text-gold text-[11px] font-sans tracking-[0.2em] uppercase mb-3">
                  {activeMilestone.badge}
                </span>
                
                <h3 className="font-heading text-5xl md:text-6xl text-ivory font-light mb-2 italic tracking-tight">
                  {activeMilestone.year}
                </h3>
                
                <h4 className="text-xl md:text-2xl text-white/90 font-medium mb-4">
                  {activeMilestone.title}
                </h4>

                <p className="text-sm md:text-base text-white/70 leading-relaxed font-light mb-6 max-w-sm">
                  {activeMilestone.text}
                </p>

                <div className="bg-gold/5 border border-gold/10 rounded-2xl p-5 relative mt-auto">
                  <Quote className="w-5 h-5 text-gold/30 absolute top-4 right-4" />
                  <p className="text-xs text-white/60 italic leading-relaxed pr-6">
                    {activeMilestone.details.anecdote}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 mt-8 md:mt-10">
              <button 
                onClick={prev}
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-walnut-deep transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {MILESTONES.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300", 
                      i === index ? "w-6 bg-gold" : "w-1.5 bg-gold/20"
                    )} 
                  />
                ))}
              </div>
              <button 
                onClick={next}
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-walnut-deep transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
