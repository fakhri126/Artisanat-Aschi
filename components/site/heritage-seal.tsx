'use client'

import { motion } from 'framer-motion'

interface HeritageSealProps {
  size?: number
  className?: string
}

export function HeritageSeal({ size = 110, className = '' }: HeritageSealProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft Ambient Gold Glow */}
      <div className="absolute inset-0 rounded-full bg-[#E6A635]/20 blur-xl group-hover:bg-[#E6A635]/40 transition-all duration-500" />

      {/* Rotating Circular Text SVG */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <path
            id="sealCirclePath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="text-[7.5px] font-sans font-bold uppercase tracking-[0.26em] fill-[#F2BD52] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <textPath href="#sealCirclePath" startOffset="0%">
              ✦ MAISON ASCHI ✦ SCULPTURE D&apos;ART ✦ DEPUIS 1960
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Center Authentic Carved Rosette & 1960 Medallion */}
      <div className="relative size-[56%] rounded-full overflow-hidden border-2 border-[#E6A635]/80 shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-center backdrop-blur-md group-hover:border-[#F2BD52] group-hover:scale-105 transition-all duration-300">
        <img
          src="/motifs/motif-1-star-rosette.png"
          alt="Rosace Sculptée Aschi"
          className="absolute inset-0 size-full object-cover pointer-events-none"
          style={{ clipPath: 'circle(48% at 50% 50%)', transform: 'scale(1.15)' }}
        />
        {/* Subtle dark glass center badge */}
        <div className="relative z-10 size-[68%] rounded-full bg-[#241812]/90 border border-[#E6A635]/60 flex flex-col items-center justify-center shadow-lg">
          <span className="text-[8px] text-[#F2BD52] font-bold tracking-widest leading-none">1960</span>
          <span className="text-[5.5px] uppercase tracking-wider text-[#F7F4EE] font-medium mt-0.5">TUNISIE</span>
        </div>
      </div>
    </div>
  )
}
