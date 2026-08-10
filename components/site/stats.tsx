'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'
import { BohoFan, BohoBand, BohoCeilingArabesque, BohoRosace, BohoCeramicPattern } from './boho-decor'

interface StatItemProps {
  value: number
  suffix: string
  label: string
  href: string
  delay: number
  theme: {
    bg: string
    text: string
    label: string
    border: string
    hoverBg: string
  }
}

function StatCard({ value, suffix, label, href, delay, theme }: StatItemProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (latest) => setCount(Math.floor(latest))
      })
      return () => controls.stop()
    }
  }, [isInView, value])

  return (
    <Reveal delay={delay}>
      <Link href={href} className="block group">
        <motion.div
          ref={ref}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`group p-6 rounded-2xl ${theme.bg} border-2 ${theme.border} ${theme.hoverBg} transition-all duration-300 relative overflow-hidden shadow-md hover:shadow-lg`}
        >
          {/* Internal hover highlight */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className={`font-heading text-4xl md:text-5xl lg:text-6xl font-light ${theme.text} tracking-tight mb-2 tabular-nums`}>
            {count}
            <span className={`${theme.text} opacity-80 font-sans font-normal ml-0.5`}>{suffix}</span>
          </div>
          
          <div className={`text-[10px] md:text-xs uppercase tracking-[0.25em] ${theme.label} font-semibold transition-colors duration-300`}>
            {label}
          </div>
        </motion.div>
      </Link>
    </Reveal>
  )
}

export function Stats() {
  const statsList = [
    { value: 500, suffix: '+', label: 'PROJETS RÉALISÉS', href: '/realisations', theme: { bg: 'bg-[#C8960C]', text: 'text-[#3A2A1E]', label: 'text-[#3A2A1E]/80', border: 'border-[#B8860B]', hoverBg: 'hover:bg-[#B8860B]' } },
    { value: 1200, suffix: '+', label: 'CLIENTS SATISFAITS', href: '/contact', theme: { bg: 'bg-[#2D5F8A]', text: 'text-white', label: 'text-white/80', border: 'border-[#1A3F60]', hoverBg: 'hover:bg-[#1A3F60]' } },
    { value: 60, suffix: '+', label: "ANNÉES D'HÉRITAGE", href: '/atelier', theme: { bg: 'bg-[#5C3317]', text: 'text-white', label: 'text-white/80', border: 'border-[#3A2A1E]', hoverBg: 'hover:bg-[#3A2A1E]' } },
    { value: 48, suffix: 'h', label: 'RÉPONSE GARANTIE', href: '/contact', theme: { bg: 'bg-[#3A7D50]', text: 'text-white', label: 'text-white/80', border: 'border-[#2D6A40]', hoverBg: 'hover:bg-[#2D6A40]' } }
  ]

  return (
    <section id="statistiques" className="relative overflow-hidden bg-transparent py-24 sm:py-32">
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Numbers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 flex-1">
            {statsList.map((stat, i) => (
              <StatCard
                key={i}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                href={stat.href}
                delay={i * 100}
                theme={stat.theme}
              />
            ))}
          </div>

          {/* Call to Action Button */}
          <Reveal delay={400} className="shrink-0 flex justify-center lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-[#C17D59] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#A66645] hover:scale-[1.03] shadow-[0_4px_20px_rgba(193,125,89,0.35)]"
            >
              <Mail className="size-4" />
              Étude Gratuite
            </Link>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
