import Link from 'next/link'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { BohoBand } from './boho-decor'

export function Footer() {
  return (
    <footer className="relative border-t border-[#DAB692]/20 bg-transparent text-[#F7F3EC] overflow-hidden">
      {/* Decorative Top Band */}
      <div className="absolute top-0 left-0 w-full h-8 overflow-hidden opacity-20 pointer-events-none">
        <BohoBand className="w-[120%] -ml-[10%] h-full text-[#C8960C]" color="currentColor" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-12 relative z-10">
        {/* Soft Decorative background blob */}
        <div className="absolute top-0 right-10 w-64 h-64 bg-[#E8DCCB]/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="grid gap-8 md:grid-cols-3 mb-8 relative z-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[#1A1512] rounded-full border border-[#D4B896]/30 flex items-center justify-center p-2 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C17D59] fill-none stroke-current stroke-[2.5] shrink-0">
                  <circle cx="50" cy="50" r="43" className="stroke-[#C17D59]/20" />
                  <path d="M50 22 L32 78 M50 22 L68 78 M38 60 L62 60" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="22" r="4.5" className="fill-[#1A1512] stroke-[#C17D59] stroke-[2.5]" />
                  <path d="M26 73 L74 37" strokeLinecap="round" className="stroke-[#C17D59]/40 stroke-[2]" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-2xl tracking-wide text-[#E8DCCB]">Artisanat Aschi</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C17D59] font-bold">Depuis 1960 · Tunisie</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#D4B896] text-pretty">
              Maison familiale de sculpture sur bois. Nous façonnons l&apos;âme du patrimoine tunisien, une pièce d&apos;exception à la fois.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Leaf className="size-4 text-[#C17D59]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">Navigation</p>
            </div>
            <nav className="flex flex-col gap-3 text-sm text-[#D4B896] font-medium">
              <Link href="/atelier" className="transition-colors hover:text-[#C17D59]">L&apos;Atelier</Link>
              <Link href="/creations" className="transition-colors hover:text-[#C17D59]">Créations</Link>
              <Link href="/catalogue" className="transition-colors hover:text-[#C17D59]">Catalogue d&apos;inspiration</Link>
              <Link href="/realisations" className="transition-colors hover:text-[#C17D59]">Réalisations</Link>
              <Link href="/contact" className="transition-colors hover:text-[#C17D59]">Contact & Devis</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Leaf className="size-4 text-[#C17D59] scale-x-[-1]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">Contact</p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-[#D4B896]">
              <p>9 avenue roosvelt la Goulette</p>
              <p>+216 55 743 760</p>
              <p>artisanat.aschi@gmail.com</p>
              <p>Lun — Sam · 8h30 — 18h00</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#DAB692]/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-[#D4B896]">
          <p className="text-xs text-[#8C7A6B]">
            © {new Date().getFullYear()} Artisanat Aschi. Tous droits réservés.
          </p>
          <p className="text-xs text-[#8C7A6B] italic">
            Certains visuels du catalogue sont générés par intelligence artificielle.
          </p>
        </div>
      </div>
    </footer>
  )
}
