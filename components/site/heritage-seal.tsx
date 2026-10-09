import Image from 'next/image'

interface HeritageSealProps {
  size?: number
  className?: string
}

export function HeritageSeal({ size = 70, className = '' }: HeritageSealProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none group cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-carved-nobg.svg"
        alt="Artisanat Aschi Logo"
        fill
        className="object-contain drop-shadow-[0_4px_16px_rgba(234,168,18,0.3)] group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  )
}
