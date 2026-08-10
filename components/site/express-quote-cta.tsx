'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Reveal } from './reveal'
import { Sparkles, MessageCircle, FileText, Clock, Compass, ShieldCheck } from 'lucide-react'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

export function ExpressQuoteCTA() {
  const { color: titleColor, isMounted } = useRandomHeroColor()

  return (
    <section id="sur-mesure-express" className="relative overflow-hidden bg-transparent py-16 md:py-24">
      {/* Darkening Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      
      <div className="mx-auto max-w-5xl px-5 sm:px-8 relative z-10">
        <Reveal>
          <div className="relative w-full rounded-[2rem] overflow-hidden border border-[#D4AF37]/35 bg-[#1A1512]/55 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
            
            {/* Background Glow Overlay */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#C17D59]/15 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              
              {/* Left Content */}
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-sm">
                  <Sparkles className="size-3.5 animate-pulse" />
                  <span>Création Sur-Mesure D&apos;Exception</span>
                </div>

                <h2 
                  className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 drop-shadow-md transition-colors duration-1000"
                  style={{ color: isMounted ? titleColor : '#D4AF37' }}
                >
                  Un Projet de Mobilier Unique en Tête ?
                </h2>

                <p className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-light text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  Imaginons ensemble votre pièce sur-mesure en Noyer Massif. Nos ébénistes concrétisent vos idées à partir d&apos;une simple photo, d&apos;un croquis ou de vos dimensions exactes.
                </p>

                {/* Assurance Points */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#E8DCCB]/90 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-[#D4AF37]" />
                    <span>Réponse sous 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-[#D4AF37]" />
                    <span>Conception &amp; Plan 3D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#D4AF37]" />
                    <span>Garantie 100% Bois Noble</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto shrink-0">
                <Link
                  href="/custom-creation"
                  className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C17D59] to-[#8C5230] hover:from-[#d4af37] hover:to-[#C17D59] text-white px-8 py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest overflow-hidden shadow-xl border border-[#E8DCCB]/30 transition-all transform hover:-translate-y-1"
                >
                  <FileText className="size-4" />
                  <span>Demander un Devis 3D</span>
                </Link>

                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-[#D9CEB8]/50 bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest text-white transition-all transform hover:-translate-y-1"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>WhatsApp Direct</span>
                </a>
              </div>

            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
