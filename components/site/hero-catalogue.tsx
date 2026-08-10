'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'
import { BohoFloralRosette, BohoBand, BohoCeilingArabesque } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'


export function HeroCatalogue() {
  const { color: titleColor, isMounted } = useRandomHeroColor()
  
  return (
    <div className="relative h-screen min-h-[700px] w-full overflow-hidden bg-transparent flex items-center font-sans">
      
      {/* Decorative Motifs */}
      <BohoFloralRosette className="absolute top-[60%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-[0.1] pointer-events-none" delay={0.2} />


      <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-y-0 lg:gap-x-20 pt-24 md:pt-32 pb-10 z-10 relative items-center">
        
        {/* Left Side: Elegant typography and CTA */}
        <div className="w-full flex flex-col justify-center items-start order-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9CEB8] text-[#C17D59] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <BookOpen className="size-4" />
              Inspiration Sur-Mesure
            </div>
            
            <h2 
              className="font-heading text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-6 leading-none transition-colors duration-1000"
              style={{ color: isMounted ? titleColor : '#87CEEB' }}
            >
              Catalogue<br/>
              <span className="text-[#D4AF37] text-4xl md:text-5xl italic drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">d&apos;Inspiration</span>
            </h2>
            
            <p className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium max-w-md text-lg md:text-xl mb-10 leading-relaxed">
              Explorez nos modèles phares déclinés dans toutes les couleurs, finitions et dimensions pour inspirer et concevoir votre propre création sur-mesure.
            </p>
            
            <Link
              href="/catalogue"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-[#C17D59] to-[#8C5230] hover:from-[#d4af37] hover:to-[#C17D59] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#E8DCCB]/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="size-4" />
                Explorer le Catalogue d&apos;Inspiration
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Showcase Image */}
        <div className="w-full relative flex justify-center lg:justify-end h-[45vh] lg:h-[65vh] max-h-[700px] order-1 lg:order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[400px] md:max-w-[500px] aspect-[4/5] mx-auto lg:mr-0 drop-shadow-[0_25px_50px_rgba(58,42,30,0.6)] group"
          >
            {/* Main Frame (Mustard Yellow Border) */}
            <div className="absolute inset-0 bg-[#DDA72D] rounded-[2rem] shadow-2xl p-4 md:p-6 overflow-hidden flex flex-col">
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
                <Image
                  src="/images/catalog_bench_cropped.jpg"
                  alt="Catalogue Artisanat Aschi"
                  fill
                  className="object-cover transition-transform duration-[15s] group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Small floating zigzag motifs (Brown) */}
      <BohoBand className="absolute top-10 right-10 md:right-20 w-48 opacity-[0.1]" color="#8B5E3C" />
      <BohoBand className="absolute bottom-10 left-10 md:left-20 w-48 opacity-[0.1]" color="#8B5E3C" />
    </div>
  )
}
