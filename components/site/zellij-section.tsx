"use client"

import { Reveal } from "./reveal"
import { BohoCeramicOctagon, BohoCeramicCross, BohoCeramicDiamond } from "./boho-decor"

export function ZellijSection() {
  return (
    <section className="bg-transparent py-16">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <Reveal>
          <p className="font-heading text-base md:text-lg font-bold uppercase tracking-[0.3em] text-[var(--gold)] text-center mb-8">
            Inspirations Céramiques (Zellij)
          </p>
        </Reveal>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <Reveal delay={0} className="hover:scale-105 transition-transform duration-500">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-[#F7F3EC] border border-[#D9CEB8]/50">
              <BohoCeramicOctagon className="w-[300px] h-[300px]" />
            </div>
          </Reveal>
          <Reveal delay={100} className="hover:scale-105 transition-transform duration-500">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-[#F7F3EC] border border-[#D9CEB8]/50">
              <BohoCeramicCross className="w-[300px] h-[300px]" />
            </div>
          </Reveal>
          <Reveal delay={200} className="hover:scale-105 transition-transform duration-500">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-[#F7F3EC] border border-[#D9CEB8]/50">
              <BohoCeramicDiamond className="w-[300px] h-[300px]" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
