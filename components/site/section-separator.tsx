import { BohoBand, BohoRosace } from "./boho-decor"

export function SectionSeparator() {
  return (
    <div className="w-full flex items-center justify-center py-4 md:py-12 opacity-60 relative z-20 pointer-events-none">
      <BohoBand className="h-[8px] md:h-[12px] flex-grow max-w-[12rem] md:max-w-sm text-[#8B5E3C] drop-shadow-sm" color="currentColor" />
      <BohoRosace className="w-10 h-10 md:w-12 md:h-12 text-[#8B5E3C] mx-4 drop-shadow-md" color="currentColor" monochrome />
      <BohoBand className="h-[8px] md:h-[12px] flex-grow max-w-[12rem] md:max-w-sm text-[#8B5E3C] drop-shadow-sm transform rotate-180" color="currentColor" />
    </div>
  )
}
