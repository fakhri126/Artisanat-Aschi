import React from 'react'

export function CarvedDivider({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`w-full flex items-center justify-center overflow-hidden py-12 opacity-100 ${className}`} style={style}>
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="text-gold fill-current">
        <path d="M0,10 L5,5 L10,10 L5,15 Z M10,10 L15,5 L20,10 L15,15 Z M20,10 L25,5 L30,10 L25,15 Z M30,10 L35,5 L40,10 L35,15 Z M40,10 L45,5 L50,10 L45,15 Z M50,10 L55,5 L60,10 L55,15 Z M60,10 L65,5 L70,10 L65,15 Z M70,10 L75,5 L80,10 L75,15 Z M80,10 L85,5 L90,10 L85,15 Z M90,10 L95,5 L100,10 L95,15 Z" />
        <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
