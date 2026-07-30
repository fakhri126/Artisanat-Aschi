'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'
import { BohoFloralRosette, BohoBand, BohoCeilingArabesque } from './boho-decor'


export function HeroCatalogue() {
  return (
    <div className="relative h-screen min-h-[700px] w-full overflow-hidden bg-transparent flex items-center font-sans border-b border-[#D9CEB8]/30">
      
      {/* Decorative Motifs */}
      <BohoFloralRosette className="absolute top-[60%] left-[-20%] md:top-[-10%] md:left-[-10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[600px] opacity-[0.4] pointer-events-none" delay={0.2} />


      <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-y-0 lg:gap-x-20 pt-24 md:pt-32 pb-10 z-10 relative items-center">
        
        {/* Left Side: Elegant typography and CTA */}
        <div className="w-full flex flex-col justify-center items-start order-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE6D6] border border-[#D9CEB8] text-[#8B5E3C] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <BookOpen className="size-4" />
              Collection Complète
            </div>
            
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-[#3A2A1E] mb-6 leading-none">
              Le Catalogue<br/>
              <span className="text-[#C17D59] text-4xl md:text-5xl italic">Artisanat Aschi</span>
            </h2>
            
            <p className="text-[#5A453A] font-light max-w-md text-lg md:text-xl mb-10 leading-relaxed">
              Plongez au cœur de notre univers. Explorez notre collection intemporelle de mobilier d'art, de miroirs et de luminaires sculptés à la main.
            </p>
            
            <Link
              href="/catalogue"
              className="group relative inline-flex items-center justify-center bg-[#2D5F8A] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest overflow-hidden shadow-lg border border-[#2D5F8A]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2D5F8A]/30"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="size-4" />
                Feuilleter le catalogue
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D5F8A] via-[#4382BA] to-[#2D5F8A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Themed Image Frame */}
        <div className="w-full relative flex justify-center lg:justify-end h-[45vh] lg:h-[65vh] max-h-[700px] order-1 lg:order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[500px] h-full"
          >
            {/* Ornate Frame Decoration */}
            <div className="absolute inset-0 bg-[#EDE6D6] rounded-[2rem] transform -rotate-3 border border-[#D9CEB8] shadow-xl" />
            <div className="absolute inset-0 bg-white rounded-[2rem] transform rotate-1 shadow-2xl p-4 md:p-6 overflow-hidden flex flex-col">
              
              {/* Inner Image Container with rounded corners */}
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#F7F3EC] group">
                <Image
                  src="/herochaise.png"
                  alt="Catalogue Artisanat Aschi"
                  fill
                  className="object-cover transition-transform duration-[15s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3A2A1E]/30 to-transparent pointer-events-none" />
                
              </div>
              
            </div>
            
          </motion.div>
        </div>
      </div>

      {/* Small floating zigzag motifs (Brown) */}
      <BohoBand className="absolute top-10 right-10 md:right-20 w-48 opacity-20" color="#8B5E3C" />
      <BohoBand className="absolute bottom-10 left-10 md:left-20 w-48 opacity-20" color="#8B5E3C" />
    </div>
  )
}
