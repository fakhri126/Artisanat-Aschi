"use client"

import { BohoCeramicOctagon, BohoCeramicCross, BohoCeramicDiamond } from "./boho-decor"

export function ZellijScatter({ type = "page" }: { type?: "page" | "hero" }) {
  // Config selon l'endroit (hero = 5 motifs concentrés, page = 15 motifs éparpillés sur toute la hauteur)
  const motifs = type === "page" ? [
    { Motif: BohoCeramicDiamond, top: '28%', left: '8%', rotate: 45 },
    { Motif: BohoCeramicDiamond, top: '75%', left: '6%', rotate: 30 },
    { Motif: BohoCeramicDiamond, top: '95%', left: '85%', rotate: -25 },
    { Motif: BohoCeramicDiamond, top: '85%', left: '55%', rotate: 40 },
  ] : [
    { Motif: BohoCeramicOctagon, top: '15%', left: '12%', rotate: 15 },
    { Motif: BohoCeramicCross, top: '75%', left: '85%', rotate: -15 },
    { Motif: BohoCeramicDiamond, top: '80%', left: '15%', rotate: 45 },
    { Motif: BohoCeramicOctagon, top: '25%', left: '88%', rotate: -25 },
  ]

  // Opacité augmentée pour rendre les motifs bien visibles avec leur fond blanc
  const baseOpacity = type === "hero" ? "0.85" : "0.7"
  const zIndex = type === "hero" ? "z-[5]" : "z-[-1]"

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${zIndex}`}>
      {motifs.map((m, i) => {
        const { Motif, top, left, rotate } = m
        return (
          <div
            key={i}
            className="absolute transform-gpu"
            style={{
              top,
              left,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
              opacity: baseOpacity,
            }}
          >
            {/* Le motif fait 200px exactement comme demandé */}
            <Motif className="w-[200px] h-[200px] shadow-2xl rounded-xl" />
          </div>
        )
      })}
    </div>
  )
}
