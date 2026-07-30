'use client'

import { motion } from 'framer-motion'

interface BohoShapeProps {
  className?: string
  color?: string
  delay?: number
}

// Rosace polychrome (inspirée du grand motif floral de la porte droite)
export function BohoRosace({ className, color = '#3B6FA0', delay = 0, monochrome = false }: BohoShapeProps & { monochrome?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      className={className || ''}
      style={{ mixBlendMode: 'multiply', aspectRatio: '1/1', display: 'inline-flex' }}
    >
      <img 
        src="/painted-wood-rosette.jpg" 
        alt="Rosace en bois sculpté et peint" 
        className="w-full h-full object-contain rounded-full"
        style={{ filter: 'brightness(1.35) saturate(1.2)' }}
      />
    </motion.div>
  )
}

// Losange sculpté (inspiré du motif de la porte gauche)
export function BohoOrnateDiamond({ className, color = '#C8960C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 140 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        {/* Contour principal */}
        <polygon points="70,10 130,100 70,190 10,100" />
        <polygon points="70,30 110,100 70,170 30,100" strokeWidth="1" />
        
        {/* Étoile centrale */}
        <path d="M70,70 L80,90 L100,100 L80,110 L70,130 L60,110 L40,100 L60,90 Z" fill={color} opacity="0.3" />
        
        {/* Traits gravés */}
        <line x1="70" y1="10" x2="70" y2="70" />
        <line x1="70" y1="130" x2="70" y2="190" />
        <line x1="10" y1="100" x2="40" y2="100" />
        <line x1="100" y1="100" x2="130" y2="100" />
      </g>
    </motion.svg>
  )
}

// Éventail / Demi-rosace (inspiré des sculptures du bas du meuble)
export function BohoFan({ className, color = '#3A7D50', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 200 100"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <path d="M20,100 A80,80 0 0,1 180,100" />
        <path d="M40,100 A60,60 0 0,1 160,100" strokeWidth="1" />
        <circle cx="100" cy="100" r="20" fill={color} opacity="0.2" />
        {/* Lames de l'éventail */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="80"
            x2="100"
            y2="20"
            transform={`rotate(${(i - 3) * 25} 100 100)`}
          />
        ))}
      </g>
    </motion.svg>
  )
}

// Bande géométrique (inspirée de la traverse gauche)
export function BohoBand({ className, color = '#C17D59', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 300 40"
      className={`wood-motif ${className || ''}`}
      preserveAspectRatio="none"
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <rect x="0" y="5" width="300" height="30" />
        {/* Motif en zigzag intérieur */}
        <path d="M0,20 L10,10 L30,30 L50,10 L70,30 L90,10 L110,30 L130,10 L150,30 L170,10 L190,30 L210,10 L230,30 L250,10 L270,30 L290,10 L300,20" strokeWidth="1.5" />
        {/* Points décoratifs */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={i} cx={20 + i * 20} cy="20" r="2" fill={color} opacity="0.4" />
        ))}
      </g>
    </motion.svg>
  )
}

// Motif Carreau Lotus (inspiré de la céramique bleue de la première image)
export function BohoLotusTile({ className, color = '#2D5F8A', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 100 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <rect x="5" y="5" width="90" height="190" strokeWidth="1" />
        {/* Motifs symétriques haut et bas */}
        <path d="M5,100 Q50,50 95,100" />
        <path d="M5,100 Q50,150 95,100" />
        {/* Lotus stylisé */}
        <path d="M50,100 Q30,60 50,20 Q70,60 50,100 Z" fill={color} opacity="0.1" />
        <path d="M50,100 Q30,140 50,180 Q70,140 50,100 Z" fill={color} opacity="0.1" />
        <circle cx="50" cy="100" r="8" fill={color} />
        {/* Petits détails */}
        <path d="M20,100 Q50,80 80,100" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M20,100 Q50,120 80,100" strokeWidth="1" strokeDasharray="2 2" />
      </g>
    </motion.svg>
  )
}


// Motif frise zigzag avec points (inspiré de la garniture)
export function BohoZigzagDivider({ className, color = '#C17D59', opacity = 1 }: { className?: string, color?: string, opacity?: number }) {
  const safeColorId = color.replace('#', '');
  return (
    <svg className={`wood-motif ${className || ''}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`zigzag-${safeColorId}`} width="40" height="24" patternUnits="userSpaceOnUse">
           <line x1="0" y1="1" x2="40" y2="1" stroke={color} strokeWidth="2" />
           <line x1="0" y1="23" x2="40" y2="23" stroke={color} strokeWidth="2" />
           <path d="M0,12 L10,23 L30,1 L40,12" stroke={color} strokeWidth="1.5" fill="none" />
           <circle cx="10" cy="12" r="2.5" fill={color} opacity="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#zigzag-${safeColorId})`} opacity={opacity} />
    </svg>
  )
}

// Colonne sculptée artisanale (Pilastre) avec motif zigzag
export function BohoCarvedColumn({ className, color = '#8B5E3C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      viewBox="0 0 100 400"
      preserveAspectRatio="none"
      className={`wood-motif ${className || ''}`}
    >
      <defs>
        <filter id="column-shadow" x="-20%" y="-10%" width="140%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3A2A1E" floodOpacity="0.25" />
        </filter>
        <linearGradient id="column-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C1A38B" />
          <stop offset="20%" stopColor="#D9BAA0" />
          <stop offset="80%" stopColor="#C1A38B" />
          <stop offset="100%" stopColor="#A67B5B" />
        </linearGradient>
      </defs>
      
      <g stroke={color} fill="none" filter="url(#column-shadow)">
        {/* Corps de la colonne */}
        <rect x="10" y="0" width="80" height="400" strokeWidth="2" fill="url(#column-grad)" />
        <rect x="15" y="0" width="70" height="400" strokeWidth="1" opacity="0.5" />
        
        {/* Chapiteau (Haut) */}
        <rect x="5" y="0" width="90" height="15" fill={color} />
        <polygon points="10,15 90,15 80,25 20,25" fill={color} opacity="0.8" />
        
        {/* Base (Bas) */}
        <rect x="5" y="385" width="90" height="15" fill={color} />
        <polygon points="20,375 80,375 90,385 10,385" fill={color} opacity="0.8" />
        
        {/* Lignes verticales (Cannelures) */}
        <line x1="25" y1="25" x2="25" y2="375" strokeWidth="1" opacity="0.4" />
        <line x1="75" y1="25" x2="75" y2="375" strokeWidth="1" opacity="0.4" />

        {/* Motif Zigzag Sculpté au centre */}
        <path 
          d="M50,40 L35,60 L65,80 L35,100 L65,120 L35,140 L65,160 L35,180 L65,200 L35,220 L65,240 L35,260 L65,280 L35,300 L65,320 L35,340 L50,360" 
          strokeWidth="3" 
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Incrustations (Points décoratifs) */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={i} cx={i % 2 === 0 ? 65 : 35} cy={50 + i * 20} r="3" fill="#E8C8AE" stroke="none" />
        ))}
      </g>
    </motion.svg>
  )
}

// Arabesque de Plafond (inspirée du plafond sculpté de la deuxième image)
export function BohoCeilingArabesque({ className, color = '#5C3317', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, rotate: 15 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        {/* Rosace centrale profonde */}
        <circle cx="100" cy="100" r="40" strokeWidth="4" />
        <circle cx="100" cy="100" r="30" fill="#B86A3D" opacity="0.9" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M100,70 Q110,60 100,40 Q90,60 100,70 Z"
            transform={`rotate(${i * 30} 100 100)`}
            fill="#C87A38"
            opacity="0.9"
          />
        ))}
        {/* Volutes entrelacées */}
        <path d="M100,20 C150,20 180,50 180,100 C180,150 150,180 100,180 C50,180 20,150 20,100 C20,50 50,20 100,20 Z" strokeWidth="1" fill="#D48D4F" opacity="0.2" />
        <path d="M100,0 C180,0 200,50 150,100 C200,150 180,200 100,200 C20,200 0,150 50,100 C0,50 20,0 100,0 Z" strokeWidth="1.5" />
      </g>
    </motion.svg>
  )
}

// Losange à coupe profonde (inspiré des sculptures de la troisième image)
export function BohoDeepCarvedDiamond({ className, color = '#8B5E3C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 100 100"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        {/* Losange extérieur épais */}
        <polygon points="50,5 95,50 50,95 5,50" strokeWidth="4" />
        {/* Lignes de coupe 3D */}
        <line x1="5" y1="50" x2="95" y2="50" strokeWidth="1" />
        <line x1="50" y1="5" x2="50" y2="95" strokeWidth="1" />
        {/* Petits losanges intérieurs */}
        <polygon points="50,25 75,50 50,75 25,50" fill={color} opacity="0.15" />
        <polygon points="50,40 60,50 50,60 40,50" fill={color} opacity="0.3" />
        {/* Points de relief */}
        <circle cx="50" cy="20" r="3" fill={color} />
        <circle cx="50" cy="80" r="3" fill={color} />
        <circle cx="20" cy="50" r="3" fill={color} />
        <circle cx="80" cy="50" r="3" fill={color} />
      </g>
    </motion.svg>
  )
}

// 1. Floral Rosette (inspiré de la première image - motif coloré floral)
export function BohoFloralRosette({ className, color = '#C8960C', delay = 0, monochrome = false }: BohoShapeProps & { monochrome?: boolean }) {
  return (
    <motion.svg
      initial={{ opacity: 0, rotate: 20 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="5 5" />
        <circle cx="100" cy="100" r="70" />
        {Array.from({ length: 8 }).map((_, i) => {
          const colors = monochrome ? [color, color, color, color] : ['#3A7D50', '#C17D59', '#C8960C', '#2D5F8A'];
          const opacity = monochrome ? (i % 2 === 0 ? "0.8" : "0.5") : "0.8";
          return (
            <path
              key={i}
              d="M100,30 Q120,65 100,100 Q80,65 100,30 Z"
              transform={`rotate(${i * 45} 100 100)`}
              fill={colors[i % 4]}
              opacity={opacity}
            />
          );
        })}
        <circle cx="100" cy="100" r="20" fill={monochrome ? color : "#2D5F8A"} opacity={monochrome ? "0.6" : "0.9"} />
        <circle cx="100" cy="100" r="10" fill={monochrome ? color : "#C17D59"} opacity="0.9" />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx="100" cy="15" r="5" transform={`rotate(${i * 45 + 22.5} 100 100)`} fill={monochrome ? color : "#C8960C"} opacity="0.9" />
        ))}
      </g>
    </motion.svg>
  )
}

// Motif Soleil Doré (inspiré de la maquette Livraison de la Semaine)
export function BohoGoldenSun({ className, color = '#C8960C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      viewBox="0 0 400 400"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="3" fill="none">
        {/* Background translucent fills (the large vertical ovals) */}
        <circle cx="200" cy="150" r="120" fill="#C8960C" stroke="none" opacity="0.15" />
        <circle cx="200" cy="250" r="120" fill="#C17D59" stroke="none" opacity="0.15" />
        
        {/* Two large vertical intersecting circles (the outer rings) */}
        <circle cx="200" cy="110" r="140" stroke="#8B5E3C" strokeWidth="4" opacity="0.8" />
        <circle cx="200" cy="290" r="140" stroke="#8B5E3C" strokeWidth="4" opacity="0.8" />
        
        {/* 12 Petals of the sun */}
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M200,125 Q218,85 200,45 Q182,85 200,125 Z"
            transform={`rotate(${i * 30} 200 200)`}
            fill="#C8960C"
            stroke="#8B5E3C"
            strokeWidth="3"
            opacity="0.85"
          />
        ))}

        {/* Center of the sun */}
        <circle cx="200" cy="200" r="60" fill="#C17D59" stroke="none" opacity="0.95" />
        <circle cx="200" cy="200" r="75" stroke="#C8960C" strokeWidth="4" opacity="0.9" />
      </g>
    </motion.svg>
  )
}

// 2. Diamond Lattice (inspiré de la deuxième image - bois sculpté géométrique)
export function BohoWoodDiamondLattice({ className, color = '#8B5E3C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <pattern id="diamond-lattice" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <polygon points="25,0 50,25 25,50 0,25" />
          <polygon points="25,10 40,25 25,40 10,25" strokeWidth="1" />
          <path d="M20,20 L30,20 M20,30 L30,30 M25,15 L25,35" strokeWidth="1.5" />
        </pattern>
        <rect x="0" y="0" width="200" height="200" fill="url(#diamond-lattice)" />
      </g>
    </motion.svg>
  )
}

// 3. Colorful Wheel (inspiré de la troisième image - rosace avec pétales)
export function BohoColorfulWheel({ className, color = '#3A7D50', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, rotate: -30 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke="#3A2A1E" strokeWidth="2" fill="none">
        <circle cx="100" cy="100" r="20" fill="#2D5F8A" />
        <circle cx="100" cy="100" r="10" fill="#C17D59" />
        {Array.from({ length: 16 }).map((_, i) => {
          const petalColors = ['#3A7D50', '#C17D59', '#C8960C', '#2D5F8A'];
          return (
            <path
              key={i}
              d="M100,80 L115,10 A10,10 0 0,0 85,10 Z"
              transform={`rotate(${i * 22.5} 100 100)`}
              fill={petalColors[i % 4]}
              opacity="0.85"
              strokeWidth="1.5"
            />
          );
        })}
      </g>
    </motion.svg>
  )
}

// 4. Intricate Ovals (inspiré de la quatrième image - bleu et or)
export function BohoIntricateOvals({ className, color = '#2D5F8A', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.3, delay, ease: 'easeOut' }}
      viewBox="0 0 150 250"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="2" fill="none">
        <rect x="10" y="10" width="130" height="230" rx="65" />
        <rect x="25" y="25" width="100" height="200" rx="50" strokeWidth="1" />
        <path d="M75,25 Q120,125 75,225 Q30,125 75,25 Z" fill={color} opacity="0.1" />
        <path d="M75,50 L95,125 L75,200 L55,125 Z" strokeWidth="1.5" />
        <circle cx="75" cy="125" r="10" fill={color} opacity="0.4" />
        <circle cx="75" cy="50" r="5" fill={color} />
        <circle cx="75" cy="200" r="5" fill={color} />
      </g>
    </motion.svg>
  )
}

// Corner Minimaliste Élégant (Gravure très fine)
export function BohoFineCorner({ className, color = '#C8960C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      viewBox="0 0 100 100"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} strokeWidth="0.5" fill="none">
        {/* Ligne de bordure externe */}
        <polyline points="2,98 2,2 98,2" />
        <polyline points="6,98 6,6 98,6" strokeWidth="0.25" />
        
        {/* Motifs géométriques (losanges fins) */}
        <polygon points="6,45 20,59 34,45 20,31" />
        <polygon points="20,31 34,45 48,31 34,17" />
        <polygon points="34,17 48,31 62,17 48,3" />
        <polygon points="48,3 62,17 76,3 62,-11" opacity="0" /> {/* Just for spacing logic, invisible */}
        
        {/* Rayons / Traits de gravure */}
        <line x1="6" y1="6" x2="34" y2="34" strokeWidth="0.5" />
        <line x1="20" y1="6" x2="48" y2="34" strokeWidth="0.25" />
        
        {/* Courbes douces intérieures */}
        <path d="M12,12 Q40,12 40,40" strokeWidth="0.5" />
        <path d="M12,12 Q60,12 60,60" strokeWidth="0.25" opacity="0.6" />
        <path d="M12,12 Q80,12 80,80" strokeWidth="0.15" opacity="0.4" />
        
        {/* Petits points (incrustations) */}
        <circle cx="20" cy="45" r="0.8" fill={color} />
        <circle cx="34" cy="31" r="0.8" fill={color} />
        <circle cx="48" cy="17" r="0.8" fill={color} />
      </g>
    </motion.svg>
  )
}

// Boho Eye motif (Blue Eye)
export function BohoEye({ className, color = '#3B6FA0', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke={color} fill="none">
        {/* Background vertical light petals */}
        <path d="M 100 10 C 130 80 130 120 100 190 C 70 120 70 80 100 10 Z" fill="#D9CEB8" opacity="0.4" stroke="none" />
        
        {/* Outer Eye */}
        <path d="M 20 100 C 60 50 140 50 180 100 C 140 150 60 150 20 100 Z" strokeWidth="4" />
        
        {/* Inner Dashed Eye */}
        <path d="M 40 100 C 70 70 130 70 160 100 C 130 130 70 130 40 100 Z" strokeWidth="3" strokeDasharray="6 6" />
        
        {/* Pupil */}
        <circle cx="100" cy="100" r="22" fill={color} stroke="none" />
        
        {/* Little dashed side accents */}
        <path d="M 0 100 L 10 100 M 190 100 L 200 100" strokeWidth="3" strokeDasharray="4 4" />
      </g>
    </motion.svg>
  )
}

// Motif très petit répétitif pour le fond (Inspiré des motifs céramiques)
export function BohoCeramicPattern({ className, color = '#2D5F8A', opacity = 0.03 }: { className?: string, color?: string, opacity?: number }) {
  return (
    <svg className={`wood-motif ${className || ''}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ceramic-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
           {/* Étoile centrale type Zellige */}
           <path d="M30 15 L33 27 L45 30 L33 33 L30 45 L27 33 L15 30 L27 27 Z" fill={color} opacity={opacity + 0.02} />
           {/* Losanges aux intersections (sculpture bois) */}
           <path d="M0 30 L5 25 L10 30 L5 35 Z" fill="#8B5E3C" opacity={opacity} />
           <path d="M60 30 L55 25 L50 30 L55 35 Z" fill="#8B5E3C" opacity={opacity} />
           <path d="M30 0 L25 5 L30 10 L35 5 Z" fill="#8B5E3C" opacity={opacity} />
           <path d="M30 60 L25 55 L30 50 L35 55 Z" fill="#8B5E3C" opacity={opacity} />
           {/* Rayures obliques discrètes */}
           <path d="M10 10 L20 20 M50 10 L40 20 M10 50 L20 40 M50 50 L40 40" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ceramic-pattern)" />
    </svg>
  )
}

// Motif Doré Géométrique (Inspiré par le moucharabieh / vitrail doré)
export function BohoGoldenLattice({ className, delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 200 200"
      className={`wood-motif ${className || ''}`}
    >
      <defs>
        <linearGradient id="goldGradientLattice" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9E596" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g stroke="url(#goldGradientLattice)" strokeWidth="4" fill="none" strokeLinecap="square" strokeLinejoin="miter" filter="url(#goldGlow)">
        {/* Outer Frame */}
        <rect x="10" y="10" width="180" height="180" strokeWidth="6" />
        
        {/* Outer Diamond */}
        <polygon points="100,10 190,100 100,190 10,100" />
        
        {/* Middle Diamond */}
        <polygon points="100,45 155,100 100,155 45,100" />
        
        {/* Inner Solid Diamond */}
        <polygon points="100,75 125,100 100,125 75,100" fill="url(#goldGradientLattice)" />
        
        {/* Crossbars */}
        <line x1="100" y1="10" x2="100" y2="190" />
        <line x1="10" y1="100" x2="190" y2="100" />
      </g>
    </motion.svg>
  )
}

// Panneau de porte sculpté traditionnel (pour les portes qui s'ouvrent)
export function BohoDoorPanel({ className, color = '#3A2A1E', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 100 300"
      className={`wood-motif ${className || ''}`}
    >
      <defs>
        <filter id="panel-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <filter id="panel-inner-shadow">
          <feDropShadow dx="-1" dy="-1" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      
      <g filter="url(#panel-shadow)">
        {/* Outer carved frame */}
        <rect x="5" y="5" width="90" height="290" rx="4" fill="none" stroke={color} strokeWidth="3" opacity="0.6" />
        <rect x="12" y="12" width="76" height="276" rx="2" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
        
        {/* Top Panel (Arched) */}
        <path d="M20,60 L20,30 Q50,10 80,30 L80,60 Z" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
        <rect x="20" y="60" width="60" height="60" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
        
        {/* Rosette in Top Panel */}
        <circle cx="50" cy="80" r="15" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <circle cx="50" cy="80" r="5" fill={color} opacity="0.8" />
        <path d="M50,65 L50,95 M35,80 L65,80 M40,70 L60,90 M40,90 L60,70" stroke={color} strokeWidth="1.5" opacity="0.5" />

        {/* Bottom Panel (Tall) */}
        <rect x="20" y="140" width="60" height="130" fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
        
        {/* Diamond Carvings in Bottom Panel */}
        <path d="M50,160 L40,175 L50,190 L60,175 Z" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <path d="M50,205 L40,220 L50,235 L60,220 Z" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <path d="M50,250 L40,265 L50,280 L60,265 Z" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        
        {/* Clous (Nails) along the border */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={`l-${i}`} cx="8" cy={15 + i * 19.2} r="1.5" fill={color} opacity="0.9" />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={`r-${i}`} cx="92" cy={15 + i * 19.2} r="1.5" fill={color} opacity="0.9" />
        ))}
      </g>
    </motion.svg>
  )
}

// Motif céramique 1 : Octogone bleu avec fleur rouge (inspiré de la première image)
export function BohoCeramicOctagon({ className, delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 300 300"
      className={`wood-motif ${className || ''}`}
    >
      <g stroke="#2D5F8A" strokeWidth="6" fill="none">
        <rect x="15" y="15" width="270" height="270" rx="10" strokeWidth="2" opacity="0.5" />
        <path d="M 25 25 Q 150 50 275 25 Q 250 150 275 275 Q 150 250 25 275 Q 50 150 25 25" />
        <path d="M 25 25 Q 50 150 25 275 Q 150 250 275 275 Q 250 150 275 25 Q 150 50 25 25" />
      </g>

      {/* Cadre octogonal bleu */}
      <polygon 
        points="100,50 200,50 250,100 250,200 200,250 100,250 50,200 50,100" 
        fill="#F7F3EC" 
        stroke="#2D5F8A" 
        strokeWidth="10" 
        strokeLinejoin="round" 
      />
      <polygon 
        points="105,60 195,60 240,105 240,195 195,240 105,240 60,195 60,105" 
        fill="none" 
        stroke="#1A3F60" 
        strokeWidth="2" 
      />

      {/* Fleur rouge centrale */}
      <g fill="#A63D2F">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d="M 150 150 Q 165 110 150 80 Q 135 110 150 150 Z"
            transform={`rotate(${i * 45} 150 150)`}
          />
        ))}
        <circle cx="150" cy="150" r="10" fill="#8B2515" />
      </g>
    </motion.svg>
  )
}

// Motif céramique 2 : Croix et étoile noire/bleue (inspiré de la deuxième image)
export function BohoCeramicCross({ className, delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 300 300"
      className={`wood-motif ${className || ''}`}
    >
      {/* Motifs des coins (Vert/Jaune) */}
      <g fill="#3A7D50" opacity="0.8">
        <circle cx="0" cy="0" r="80" />
        <circle cx="300" cy="0" r="80" />
        <circle cx="0" cy="300" r="80" />
        <circle cx="300" cy="300" r="80" />
      </g>
      <g stroke="#C8960C" strokeWidth="8" fill="none">
        <circle cx="0" cy="0" r="95" />
        <circle cx="300" cy="0" r="95" />
        <circle cx="0" cy="300" r="95" />
        <circle cx="300" cy="300" r="95" />
      </g>

      {/* Fond sombre croisé */}
      <polygon points="150,70 230,150 150,230 70,150" fill="#2C1E16" />
      
      {/* Lignes de séparation blanches */}
      <g stroke="#F7F3EC" strokeWidth="20" strokeLinecap="round">
        <line x1="30" y1="30" x2="110" y2="110" />
        <line x1="270" y1="30" x2="190" y2="110" />
        <line x1="30" y1="270" x2="110" y2="190" />
        <line x1="270" y1="270" x2="190" y2="190" />
      </g>

      {/* Étoile bleue centrale */}
      <polygon 
        points="150,90 175,115 210,115 210,150 175,175 150,210 125,175 90,150 90,115 125,115" 
        fill="#F7F3EC" 
        stroke="#2D5F8A" 
        strokeWidth="8" 
        strokeLinejoin="round"
      />
      
      {/* Pétales noires au centre */}
      <g fill="#1A1A1A">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d="M 150 150 Q 158 135 150 115 Q 142 135 150 150 Z"
            transform={`rotate(${i * 45} 150 150)`}
          />
        ))}
        <circle cx="150" cy="150" r="6" fill="#F7F3EC" />
      </g>
    </motion.svg>
  )
}

// Motif céramique 3 : Losange central et nœud (inspiré de la troisième image)
export function BohoCeramicDiamond({ className, delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      viewBox="0 0 300 300"
      className={`wood-motif ${className || ''}`}
    >
      {/* Détails fleuris dans les coins */}
      <g stroke="#2D5F8A" strokeWidth="4" fill="none">
        <path d="M 0 80 Q 40 40 80 0" />
        <path d="M 220 0 Q 260 40 300 80" />
        <path d="M 0 220 Q 40 260 80 300" />
        <path d="M 220 300 Q 260 260 300 220" />
      </g>
      <g fill="#3A7D50" opacity="0.5">
        <circle cx="20" cy="20" r="15" />
        <circle cx="280" cy="20" r="15" />
        <circle cx="20" cy="280" r="15" />
        <circle cx="280" cy="280" r="15" />
      </g>

      {/* Losange central à multiples bordures */}
      <g transform="translate(150,150)">
        <polygon points="0,-120 120,0 0,120 -120,0" fill="#F7F3EC" stroke="#3A2A1E" strokeWidth="6" strokeLinejoin="round" />
        <polygon points="0,-105 105,0 0,105 -105,0" fill="none" stroke="#C8960C" strokeWidth="10" strokeLinejoin="round" />
        <polygon points="0,-90 90,0 0,90 -90,0" fill="none" stroke="#3A2A1E" strokeWidth="4" strokeLinejoin="round" />
        
        {/* Nœud géométrique au centre */}
        <polygon points="0,-25 25,0 0,25 -25,0" fill="none" stroke="#3A2A1E" strokeWidth="4" />
        <polygon points="0,-15 15,0 0,15 -15,0" fill="#C8960C" />
        
        {/* Les 4 petits carrés attachés */}
        <g stroke="#3A2A1E" strokeWidth="4" fill="none">
          <rect x="-7.5" y="-40" width="15" height="15" transform="rotate(45 0 -32.5)" />
          <rect x="-7.5" y="25" width="15" height="15" transform="rotate(45 0 32.5)" />
          <rect x="-40" y="-7.5" width="15" height="15" transform="rotate(45 -32.5 0)" />
          <rect x="25" y="-7.5" width="15" height="15" transform="rotate(45 32.5 0)" />
        </g>
      </g>
    </motion.svg>
  )
}

// Poignée de porte sculptée (pour remplacer l'image handle-knob.png)
export function BohoCarvedKnob({ className, color = '#8B5E3C', delay = 0 }: BohoShapeProps) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      viewBox="0 0 100 100"
      className={`wood-motif ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C17D59" />
          <stop offset="50%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#3A2A1E" />
        </linearGradient>
      </defs>
      {/* Ombre de base */}
      <circle cx="52" cy="52" r="40" fill="rgba(58,42,30,0.15)" />
      
      {/* Contour extérieur en bronze */}
      <circle cx="50" cy="50" r="40" fill="url(#bronzeGradient)" stroke="#3A2A1E" strokeWidth="2" />
      
      {/* Anneau intérieur gravé */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="#F3E7DB" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      
      {/* Centre floral sculpté */}
      <g fill="#3A2A1E" transform="translate(50, 50)">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d="M 0 -6 Q 12 -25 0 -30 Q -12 -25 0 -6 Z" transform={`rotate(${i * 45})`} opacity="0.85" />
        ))}
        {/* Cœur de la fleur */}
        <circle cx="0" cy="0" r="10" fill="#E8DCCB" opacity="0.9" />
        <circle cx="0" cy="0" r="4" fill="#3A2A1E" />
      </g>
    </motion.svg>
  )
}
