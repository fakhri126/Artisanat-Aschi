'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'

const LINKS = [
  { label: "L'Atelier", href: '/atelier' },
  { label: 'Créations', href: '/creations' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Actualités', href: '/#actualites' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { cartCount, setIsCartOpen } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-walnut/90 backdrop-blur-md py-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)]'
          : 'bg-transparent py-4',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-11 overflow-hidden rounded-full border border-gold/30 bg-white shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Artisanat Aschi Logo"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-semibold tracking-wide text-walnut-foreground">
              Artisanat Aschi
            </span>
            <span className="mt-0.5 text-[0.58rem] uppercase tracking-luxury text-gold">
              Maison fondée en 1960
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'group relative text-sm font-light uppercase tracking-[0.15em] transition-colors',
                    isActive ? 'text-gold' : 'text-walnut-foreground/80 hover:text-gold',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-4">
          {/* Cart Icon Desktop/Mobile */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Ouvrir le panier"
            className="relative rounded-full p-2.5 text-walnut-foreground/80 transition-colors hover:text-gold"
          >
            <ShoppingCart className="size-5 sm:size-6" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-walnut animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            href="/contact"
            className="hidden rounded-full border border-gold/70 px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-gold transition-all duration-300 hover:bg-gold hover:text-walnut lg:inline-block"
          >
            Demander un devis
          </Link>

          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="text-walnut-foreground lg:hidden"
          >
            {open ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden bg-walnut/95 backdrop-blur-md transition-all duration-500 lg:hidden',
          open ? 'max-h-[32rem] border-t border-gold/20' : 'max-h-0',
        )}
      >
        <ul className="flex flex-col gap-1 px-6 py-5">
          {LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block py-2.5 font-heading text-xl transition-colors',
                    isActive ? 'text-gold' : 'text-walnut-foreground/90 hover:text-gold',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
          <li className="pt-3">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="inline-block rounded-full border border-gold px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-gold"
            >
              Demander un devis
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
