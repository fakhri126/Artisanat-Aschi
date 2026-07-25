import Link from 'next/link'
import Image from 'next/image'
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[#E8DCCB] bg-[#FAF7F2] py-16 text-[#3A2A21]">
      <div className="mx-auto max-w-7xl px-6 relative">
        {/* Soft Decorative background blob */}
        <div className="absolute top-0 right-10 w-64 h-64 bg-[#E8DCCB]/40 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="grid gap-12 md:grid-cols-3 mb-12 relative z-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white rounded-full border border-[#E8DCCB] flex items-center justify-center p-3 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C17D59] fill-none stroke-current stroke-[2.5] shrink-0">
                  <circle cx="50" cy="50" r="43" className="stroke-[#C17D59]/20" />
                  <path d="M50 22 L32 78 M50 22 L68 78 M38 60 L62 60" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="22" r="4.5" className="fill-white stroke-[#C17D59] stroke-[2.5]" />
                  <path d="M26 73 L74 37" strokeLinecap="round" className="stroke-[#C17D59]/40 stroke-[2]" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-2xl tracking-wide text-[#2C1E16]">Artisanat Aschi</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C17D59] font-bold">Depuis 1960 · Tunisie</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#5A453A] text-pretty">
              Maison familiale de sculpture sur bois. Nous façonnons l&apos;âme du patrimoine tunisien, une pièce d&apos;exception à la fois.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Leaf className="size-4 text-[#C17D59]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">Navigation</p>
            </div>
            <nav className="flex flex-col gap-3 text-sm text-[#5A453A] font-medium">
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
            <div className="flex flex-col gap-3 text-sm text-[#5A453A]">
              <p>9 avenue roosvelt la Goulette</p>
              <p>+216 55 743 760</p>
              <p>artisanat.aschi@gmail.com</p>
              <p>Lun — Sam · 8h30 — 18h00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8DCCB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
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
