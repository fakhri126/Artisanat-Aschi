'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { AnimatePresence, motion } from 'framer-motion'

const LINKS = [
  { label: "L'Atelier", href: '/atelier' },
  { label: 'Créations', href: '/creations' },
  { label: 'Nos Services', isDropdown: true },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Actualités', href: '/#actualites' },
  { label: 'Contact', href: '/contact' },
]

const SERVICES = [
  {
    title: 'Service Catalogue',
    description: 'Explorez notre collection de mobilier d\'art, portes et miroirs sculptés.',
    image: '/prod1.jpg',
    href: '/catalogue',
    cta: 'Voir le catalogue'
  },
  {
    title: 'Service Rebooking / Relooking',
    description: 'Offrez une nouvelle vie à vos meubles anciens grâce à notre expertise.',
    image: '/relooking_service.jpg',
    href: '/relooking',
    cta: 'Découvrir le relooking'
  }
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
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
        scrolled || servicesOpen
          ? 'bg-walnut/90 backdrop-blur-md py-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)]'
          : 'bg-transparent py-4',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <div className="relative size-11 overflow-hidden rounded-full border border-gold/30 bg-white shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png2.png"
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
        <ul className="hidden items-center gap-7 lg:flex h-full">
          {LINKS.map((link) => {
            if (link.isDropdown) {
              const isActive = pathname === '/catalogue' || pathname === '/relooking'
              return (
                <li
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    className={cn(
                      'group flex items-center gap-1 text-sm font-light uppercase tracking-[0.15em] transition-colors py-4',
                      isActive || servicesOpen ? 'text-gold' : 'text-walnut-foreground/80 hover:text-gold',
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("size-4 transition-transform duration-300", servicesOpen && "rotate-180")} />
                    <span
                      className={cn(
                        'absolute bottom-2 left-0 h-px bg-gold transition-all duration-300',
                        isActive ? 'w-full' : 'w-0 group-hover:w-full',
                      )}
                    />
                  </button>
                </li>
              )
            }

            const isActive = pathname === link.href
            return (
              <li key={link.href} className="relative h-full flex items-center">
                <Link
                  href={link.href!}
                  className={cn(
                    'group relative text-sm font-light uppercase tracking-[0.15em] transition-colors py-4',
                    isActive ? 'text-gold' : 'text-walnut-foreground/80 hover:text-gold',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-2 left-0 h-px bg-gold transition-all duration-300',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-4 relative z-50">
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

      {/* Desktop Mega Menu Dropdown */}
      <AnimatePresence>
        {servicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-full left-0 w-full bg-walnut/95 backdrop-blur-xl border-t border-gold/20 shadow-2xl overflow-hidden hidden lg:block"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <div className="mx-auto max-w-5xl px-8 py-10 flex gap-8">
              {SERVICES.map((service, idx) => (
                <Link href={service.href} key={idx} className="flex-1 group relative overflow-hidden rounded-xl border border-gold/10 bg-walnut/50 transition-all hover:border-gold/40 hover:bg-walnut/80">
                  <div className="flex h-full">
                    <div className="w-1/2 relative overflow-hidden">
                      <Image src={service.image} alt={service.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-walnut/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="w-1/2 p-8 flex flex-col justify-center">
                      <h3 className="font-heading text-2xl text-ivory mb-3">{service.title}</h3>
                      <p className="text-walnut-foreground/80 text-sm font-light leading-relaxed mb-6">
                        {service.description}
                      </p>
                      <span className="inline-flex items-center text-xs uppercase tracking-[0.15em] text-gold font-medium group-hover:translate-x-2 transition-transform duration-300">
                        {service.cta} &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-y-auto bg-walnut/95 backdrop-blur-md transition-all duration-500 lg:hidden absolute top-full left-0 w-full shadow-2xl',
          open ? 'max-h-screen border-t border-gold/20 py-5' : 'max-h-0 py-0',
        )}
      >
        <ul className="flex flex-col gap-1 px-6">
          {LINKS.map((link) => {
            if (link.isDropdown) {
              return (
                <li key={link.label} className="border-b border-white/5 pb-2 mb-2">
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex w-full items-center justify-between py-2.5 font-heading text-xl text-walnut-foreground/90 transition-colors hover:text-gold"
                  >
                    {link.label}
                    <ChevronDown className={cn("size-5 transition-transform duration-300", mobileServicesOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {mobileServicesOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-4 pt-2 pb-4"
                      >
                        {SERVICES.map((service, idx) => (
                          <li key={idx}>
                            <Link
                              href={service.href}
                              onClick={() => setOpen(false)}
                              className="group flex gap-4 items-center rounded-xl bg-white/5 p-3"
                            >
                              <div className="relative size-16 rounded-md overflow-hidden shrink-0">
                                <Image src={service.image} alt={service.title} fill className="object-cover" />
                              </div>
                              <div>
                                <h4 className="font-heading text-lg text-ivory group-hover:text-gold transition-colors">{service.title}</h4>
                                <p className="text-xs text-walnut-foreground/70 line-clamp-1">{service.description}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              )
            }

            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href!}
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
          <li className="pt-6 pb-10">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex w-full justify-center items-center rounded-full border border-gold px-6 py-4 text-sm uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-walnut transition-colors"
            >
              Demander un devis
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}

