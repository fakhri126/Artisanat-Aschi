'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'

const LINKS = [
  { label: "L'Atelier", href: '/atelier' },
  { label: 'Créations', href: '/creations' },
  { label: 'Bijoux de Porte', href: '/bijoux-de-porte' },
  { label: 'Nos Services', isDropdown: true },
  { label: 'Réalisations', href: '/realisations' },
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
    title: 'Relooking & Restauration',
    description: 'Offrez une nouvelle vie à vos meubles anciens grâce à notre expertise.',
    image: '/relooking_service.jpg',
    href: '/relooking',
    cta: 'Découvrir le relooking'
  },
  {
    title: 'Espaces d\'Exception',
    description: 'Conception complète pour Hôtels, Maisons d\'Hôtes, Restaurants et Bureaux.',
    image: '/project-hotel.png',
    href: '/espaces-d-exception',
    cta: 'Découvrir nos espaces'
  }
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const pathname = usePathname()
  const { cartCount, setIsCartOpen, isMounted } = useCart()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40)
  })

  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotateX(-y / (rect.height / 2) * 15)
    setRotateY(x / (rect.width / 2) * 15)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled || servicesOpen
          ? 'py-3 bg-transparent border-b border-[#D4B896]/10 backdrop-blur-sm'
          : 'py-4 bg-transparent border-b border-transparent',
      )}
    >
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          {/* Mobile Logo: Clean Monogram */}
          <div className="block sm:hidden shrink-0">
            <svg viewBox="0 0 100 100" className="size-11 text-[#C17D59] fill-none stroke-current stroke-[2.5] shrink-0">
              <circle cx="50" cy="50" r="43" className="stroke-[#C17D59]/20" />
              <path d="M50 22 L32 78 M50 22 L68 78 M38 60 L62 60" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="22" r="4.5" className="fill-[#1A1512] stroke-[#C17D59] stroke-[2.5]" />
              <path d="M26 73 L74 37" strokeLinecap="round" className="stroke-[#C17D59]/40 stroke-[2]" />
            </svg>
          </div>

          {/* Desktop Logo: Realistic 3D Plaque */}
          <div
            style={{ perspective: 500 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="hidden sm:block shrink-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] hover:drop-shadow-[0_14px_28px_rgba(0,0,0,0.8)] transition-all duration-300"
          >
            <motion.div
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative h-32 w-18 shrink-0 overflow-hidden transition-all duration-300"
            >
              <Image
                src="/logo-carved-nobg.svg"
                alt="Artisanat Aschi Logo"
                fill
                className="object-contain"
                priority
              />
              
              {/* Metallic Shine Overlay */}
              <motion.div
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-2xl font-bold tracking-wide text-[#E8DCCB]">
              Artisanat Aschi
            </span>
            <span className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#D4B896] font-medium">
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
                      'group flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] transition-colors py-4',
                      isActive || servicesOpen ? 'text-[#C17D59]' : 'text-[#E8DCCB] hover:text-[#C17D59]',
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("size-4 transition-transform duration-300", servicesOpen && "rotate-180")} />
                    <span
                      className={cn(
                        'absolute bottom-2 left-0 h-px bg-[#C17D59] transition-all duration-300',
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
                    'group relative text-xs font-semibold uppercase tracking-[0.15em] transition-colors py-4',
                    isActive ? 'text-[#C17D59]' : 'text-[#E8DCCB] hover:text-[#C17D59]',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-2 left-0 h-px bg-[#C17D59] transition-all duration-300',
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
            className="relative rounded-full p-2.5 text-[#E8DCCB] transition-colors hover:text-[#C17D59]"
          >
            <ShoppingCart className="size-5 sm:size-6" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[#C17D59] text-[9px] font-bold text-white animate-pulse shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            href="/contact"
            className="hidden rounded-full border border-[#E8DCCB] bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#C17D59] transition-all duration-300 hover:bg-[#FAF7F2] hover:border-[#C17D59] hover:shadow-sm lg:inline-block"
          >
            Demander un devis
          </Link>

          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="text-[#E8DCCB] lg:hidden"
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
            className="absolute top-full left-0 w-full bg-[#1A1512]/95 backdrop-blur-xl border-t border-[#D4B896]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden hidden lg:block"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <div className="mx-auto max-w-5xl px-8 py-10 flex gap-8">
              {SERVICES.map((service, idx) => (
                <Link href={service.href} key={idx} className="flex-1 group relative overflow-hidden rounded-[2rem] border border-[#D4B896]/30 bg-[#2C1E16] transition-all hover:border-[#C17D59]/50 hover:shadow-[0_10px_30px_rgba(193,125,89,0.1)] flex flex-col">
                  <div className="h-40 relative overflow-hidden bg-[#1A1512]">
                    <Image src={service.image} alt={service.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col bg-[#2C1E16]">
                    <h3 className="font-serif text-2xl text-[#E8DCCB] mb-2">{service.title}</h3>
                    <p className="text-[#D4B896] text-sm font-light leading-relaxed mb-6 flex-1">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center text-xs uppercase tracking-[0.15em] text-[#C17D59] font-bold group-hover:translate-x-2 transition-transform duration-300">
                      {service.cta} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'overflow-y-auto bg-[#1A1512]/95 backdrop-blur-md transition-all duration-500 lg:hidden absolute top-full left-0 w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
          open ? 'max-h-screen border-t border-[#D4B896]/20 py-5' : 'max-h-0 py-0',
        )}
      >
        <ul className="flex flex-col gap-1 px-6">
          {LINKS.map((link) => {
            if (link.isDropdown) {
              return (
                <li key={link.label} className="border-b border-[#D4B896]/20 pb-2 mb-2">
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex w-full items-center justify-between py-2.5 font-serif text-xl text-[#E8DCCB] transition-colors hover:text-[#C17D59]"
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
                              className="group flex gap-4 items-center rounded-2xl bg-[#2C1E16]/50 border border-[#D4B896]/30 p-3"
                            >
                              <div className="relative size-16 rounded-xl overflow-hidden shrink-0">
                                <Image src={service.image} alt={service.title} fill className="object-cover" />
                              </div>
                              <div>
                                <h4 className="font-serif text-lg text-[#E8DCCB] group-hover:text-[#C17D59] transition-colors">{service.title}</h4>
                                <p className="text-xs text-[#D4B896] line-clamp-1">{service.description}</p>
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
              <li key={link.href} className="border-b border-[#D4B896]/20 pb-2 mb-2">
                <Link
                  href={link.href!}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 font-serif text-xl text-[#E8DCCB] transition-colors hover:text-[#C17D59]"
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
        
        <div className="mt-8 mb-12 flex justify-center">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="inline-block rounded-full bg-[#C17D59] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#A66645] hover:shadow-lg"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </header>
  )
}

