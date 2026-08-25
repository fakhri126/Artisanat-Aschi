'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface MagneticCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glareOpacity?: number
}

export function MagneticCard({
  children,
  className = '',
  intensity = 10,
  glareOpacity = 0.15,
}: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 200 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-intensity, intensity])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
      }}
      className={`relative ${className}`}
    >
      {children}
      {glareOpacity > 0 && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${(smoothX.get() + 0.5) * 100}% ${(smoothY.get() + 0.5) * 100}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  )
}
