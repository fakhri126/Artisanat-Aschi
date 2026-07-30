'use client'

import { usePathname } from 'next/navigation'
import { BohoGoldenLattice, BohoRosace, BohoCeilingArabesque, BohoBand } from './boho-decor'

export function GlobalBackground() {
  const pathname = usePathname()
  
  // Ne pas afficher ces grands motifs sur la page d'accueil (qui a déjà les siens)
  if (pathname === '/') return null

  return (
    <div className="absolute top-0 left-0 right-0 h-[250vh] pointer-events-none z-[0] overflow-hidden">
      {/* Motif Treillis Doré (Inspiré de l'image) en haut à gauche */}
      <BohoGoldenLattice className="absolute top-[5%] -left-[10%] w-[400px] md:w-[600px] opacity-90 drop-shadow-md" delay={0.2} />
      
      {/* Grande Rosace Terracotta au milieu à droite */}
      <BohoRosace className="absolute top-[25%] -right-[15%] w-[400px] md:w-[700px] opacity-80 drop-shadow-md" delay={0.4} color="#C17D59" />
      
      {/* Arabesque de Plafond en bas à gauche */}
      <BohoCeilingArabesque className="absolute top-[50%] -left-[5%] w-[350px] md:w-[500px] opacity-80 drop-shadow-sm" delay={0.6} color="#8B5E3C" />
      
      {/* Petites frises d'accent */}
      <BohoBand className="absolute top-[15%] right-[10%] w-32 md:w-48 opacity-80 drop-shadow-sm" color="#3A7D50" />
      <BohoBand className="absolute top-[60%] left-[10%] w-32 md:w-48 opacity-80 drop-shadow-sm" color="#C8960C" />
    </div>
  )
}
