'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'

interface StatItemProps {
  value: number
  suffix: string
  label: string
  href: string
  delay: number
}

function StatCard({ value, suffix, label, href, delay }: StatItemProps) {
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
          className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
        >
          {/* Internal hover glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-gold tracking-tight mb-2 tabular-nums">
            {count}
            <span className="text-gold/80 font-sans font-normal ml-0.5">{suffix}</span>
          </div>
          
          <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-ivory/60 font-semibold group-hover:text-gold transition-colors duration-300">
            {label}
          </div>
        </motion.div>
      </Link>
    </Reveal>
  )
}

export function Stats() {
  const statsList = [
    { value: 500, suffix: '+', label: 'PROJETS RÉALISÉS', href: '/realisations' },
    { value: 1200, suffix: '+', label: 'CLIENTS SATISFAITS', href: '/contact' },
    { value: 60, suffix: '+', label: "ANNÉES D'HÉRITAGE", href: '/atelier' },
    { value: 48, suffix: 'h', label: 'RÉPONSE GARANTIE', href: '/contact' }
  ]

  return (
    <section className="bg-stone-950 text-[var(--ivory)] py-20 border-t border-gold/15 relative overflow-hidden">
      {/* Subtle gold aura background */}
      <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
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
              />
            ))}
          </div>

          {/* Call to Action Button */}
          <Reveal delay={400} className="shrink-0 flex justify-center lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-gold/90 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-walnut transition-all duration-300 hover:bg-gold hover:scale-[1.03] shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
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
