'use client'

import { motion } from 'framer-motion'

interface SectionSeparatorProps {
  variant?: 'gold' | 'wood' | 'minimal'
  symbol?: string
  label?: string
  className?: string
}

export function SectionSeparator({
  variant = 'gold',
  symbol = '✦',
  label,
  className = '',
}: SectionSeparatorProps) {
  return (
    <div className={`relative w-full py-10 flex flex-col items-center justify-center overflow-hidden z-20 pointer-events-none ${className}`}>
      
      {/* Background Soft Gold Ambient Halo */}
      <div className="absolute size-72 rounded-full bg-[#D4AF37]/10 blur-[70px] pointer-events-none animate-pulse" />

      {/* Main Divider Line with Center Ornament */}
      <div className="relative flex items-center justify-center w-full max-w-4xl px-8">
        
        {/* Left Gradient Line with Smooth Unfold Animation */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2C783]/30 to-[#D4AF37] relative flex items-center origin-right"
        >
          <div className="absolute right-0 size-1 rounded-full bg-[#E2C783] shadow-[0_0_6px_#D4AF37]" />
        </motion.div>

        {/* Center Craft Hallmark Badge */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mx-4 px-4 py-1.5 rounded-full bg-[#18130E]/90 border border-[#D4AF37]/40 text-[#E2C783] text-xs flex items-center gap-2.5 shadow-2xl backdrop-blur-md"
        >
          {/* Authentic miniature carved rosette */}
          <div className="relative size-4 rounded-full overflow-hidden shrink-0 border border-[#D4AF37]/60 shadow-inner">
            <img 
              src="/motifs/motif-1-star-rosette.png" 
              alt="Rosace Aschi" 
              className="size-full object-cover"
              style={{ clipPath: 'circle(48% at 50% 50%)', transform: 'scale(1.1)' }}
            />
          </div>
          {label ? (
            <span className="uppercase tracking-editorial text-[9.5px] font-semibold text-[#F7F4EE] font-sans">
              {label}
            </span>
          ) : (
            <span className="text-sm font-serif">{symbol}</span>
          )}
          <span className="text-[10px] text-[#D4AF37] font-bold">✦</span>
        </motion.div>

        {/* Right Gradient Line with Smooth Unfold Animation */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E2C783]/30 to-[#D4AF37] relative flex items-center origin-left"
        >
          <div className="absolute left-0 size-1 rounded-full bg-[#E2C783] shadow-[0_0_6px_#D4AF37]" />
        </motion.div>

      </div>

    </div>
  )
}
