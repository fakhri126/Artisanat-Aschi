import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[var(--ivory)]/10 bg-[var(--walnut-deep)] py-16 text-[var(--ivory)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-3 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-44 w-24 shrink-0 overflow-hidden drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                <Image 
                  src="/logo-carved-nobg.svg" 
                  alt="Artisanat Aschi Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div>
                <p className="font-heading text-xl tracking-wide">Artisanat Aschi</p>
                <p className="text-[10px] uppercase tracking-luxury text-[var(--gold)]">Depuis 1960 · Tunisie</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--ivory)]/50 text-pretty">
              Maison familiale de sculpture sur bois. Nous façonnons l&apos;âme du patrimoine tunisien, une pièce d&apos;exception à la fois.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[var(--gold)] font-semibold">Navigation</p>
            <nav className="flex flex-col gap-3 text-sm text-[var(--ivory)]/70">
              <Link href="/atelier" className="transition-colors hover:text-[var(--gold)]">L&apos;Atelier</Link>
              <Link href="/creations" className="transition-colors hover:text-[var(--gold)]">Créations</Link>
              <Link href="/catalogue" className="transition-colors hover:text-[var(--gold)]">Catalogue d&apos;inspiration</Link>
              <Link href="/realisations" className="transition-colors hover:text-[var(--gold)]">Réalisations</Link>
              <Link href="/contact" className="transition-colors hover:text-[var(--gold)]">Contact & Devis</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[var(--gold)] font-semibold">Contact</p>
            <div className="flex flex-col gap-3 text-sm text-[var(--ivory)]/70">
              <p>9 avenue roosvelt la Goulette</p>
              <p>+216 55743760</p>
              <p>artisanat.aschi@gmail.com</p>
              <p>Lun — Sam · 8h30 — 18h00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--ivory)]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--ivory)]/40">
            © {new Date().getFullYear()} Artisanat Aschi. Tous droits réservés.
          </p>
          <p className="text-xs text-[var(--ivory)]/30 italic">
            Certains visuels du catalogue sont générés par intelligence artificielle.
          </p>
        </div>
      </div>
    </footer>
  )
}
