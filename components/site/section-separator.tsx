"use client"

import { motion } from 'framer-motion'

export function SectionSeparator() {
  return (
    <div className="w-full flex items-center justify-center py-4 md:py-12 opacity-60 relative z-20 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scaleX: 0.8 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="w-full max-w-[95vw] md:max-w-7xl h-10 md:h-14 relative flex items-center justify-center overflow-hidden drop-shadow-xl"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        <img 
          src="/separator-border.png" 
          alt="Frise géométrique en bois sculpté" 
          className="w-full h-full object-cover"
          style={{ filter: 'contrast(1.1)' }}
        />
      </motion.div>
    </div>
  )
}
