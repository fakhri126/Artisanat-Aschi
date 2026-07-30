'use client'

import { BohoGoldenLattice, BohoRosace, BohoCeilingArabesque, BohoCeramicPattern, BohoBand } from './boho-decor'

export function PageBackgroundMotifs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#FAF7F2]">
      {/* Background Ceramic Texture */}
      <BohoCeramicPattern className="absolute inset-0 opacity-[0.015]" color="#8B5E3C" />
      
      {/* Large Golden Lattice Motif at Top Left */}
      <BohoGoldenLattice className="absolute -top-[5%] -left-[10%] w-[350px] md:w-[500px] opacity-[0.4]" delay={0.2} />
      
      {/* Large Boho Rosace at Center Right */}
      <BohoRosace className="absolute top-[40%] -right-[15%] w-[400px] md:w-[600px] opacity-[0.08]" delay={0.4} color="#C17D59" />
      
      {/* Ceiling Arabesque at Bottom Left */}
      <BohoCeilingArabesque className="absolute -bottom-[10%] -left-[5%] w-[300px] md:w-[500px] opacity-[0.05]" delay={0.6} color="#8B5E3C" />
      
      {/* Small floating bands */}
      <BohoBand className="absolute top-[20%] right-[10%] w-32 md:w-48 opacity-[0.1]" color="#3A7D50" />
      <BohoBand className="absolute bottom-[20%] left-[10%] w-32 md:w-48 opacity-[0.1]" color="#C8960C" />
    </div>
  )
}
