'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function CarvedRosette({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`opacity-10 text-gold pointer-events-none ${className}`}
      style={style}
      fill="currentColor"
      initial={{ rotate: -15, scale: 0.9 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M50 10 Q55 30 50 50 Q45 30 50 10 Z" />
      <path d="M90 50 Q70 55 50 50 Q70 45 90 50 Z" />
      <path d="M50 90 Q45 70 50 50 Q55 70 50 90 Z" />
      <path d="M10 50 Q30 45 50 50 Q30 55 10 50 Z" />
      <path d="M21.7 21.7 Q35 35 50 50 Q35 35 21.7 21.7 Z" strokeWidth="2" stroke="currentColor" />
      <path d="M78.3 78.3 Q65 65 50 50 Q65 65 78.3 78.3 Z" strokeWidth="2" stroke="currentColor" />
      <path d="M78.3 21.7 Q65 35 50 50 Q65 35 78.3 21.7 Z" strokeWidth="2" stroke="currentColor" />
      <path d="M21.7 78.3 Q35 65 50 50 Q35 65 21.7 78.3 Z" strokeWidth="2" stroke="currentColor" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      <circle cx="50" cy="50" r="4" fill="#F7F3EC" />
    </motion.svg>
  )
}
