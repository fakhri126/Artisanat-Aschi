'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ShoppingCart, ChevronDown, ArrowRight, Sparkles, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'

const LINKS = [
  { label: "L'Atelier", href: '/atelier' },
  { label: 'Pièces Disponibles', href: '/creations' },
  { label: 'Bijoux de Porte', href: '/bijoux-de-porte' },
  { label: 'Nos Savoir-Faire', isDropdown: true },
  { label: 'Contact', href: '/contact' },
]

const SERVICES = [
  {
    title: 'Catalogue d\'Inspiration (Sur-Mesure)',
    description: 'Explorez notre collection de mobilier d\'art sculpté pour concevoir votre projet sur-mesure.',
    image: '/prod1.jpg',
    href: '/catalogue',
    cta: 'Voir le catalogue'
  },
  {
    title: 'Projets Clés en Main (Espaces d\'Exception)',
    description: 'Aménagement monumental complet pour Hôtels 5★, Palaces, Riads et Demeures de prestige.',
    image: '/project-hotel.png',
    href: '/espaces-d-exception',
    cta: 'Découvrir nos réalisations'
  },
  {
    title: 'Relooking & Restauration d\'Art',
    description: 'Offrez une nouvelle vie à vos meubles anciens grâce à notre savoir-faire d\'art patrimonial.',
    image: '/relooking_service.jpg',
    href: '/relooking',
    cta: 'Découvrir la restauration'
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
    setScrolled(latest > 30)
  })

  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotateX(-y / (rect.height / 2) * 12)
    setRotateY(x / (rect.width / 2) * 12)
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
          ? 'py-3 bg-[#241812]/92 border-b border-[#E6A635]/25 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.75)]'
          : 'py-4.5 bg-gradient-to-b from-[#1A110B]/85 via-[#241812]/40 to-transparent border-b border-transparent',
      )}
    >
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          {/* Mobile Logo: Same motif as web, bigger and bolder */}
          <div className="block sm:hidden shrink-0 relative size-12 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <Image
              src="/logo-carved-nobg.svg"
              alt="Artisanat Aschi Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Desktop Logo: Realistic 3D Plaque, Bigger & Bolder */}
          <div
            style={{ perspective: 500 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="hidden sm:block shrink-0 drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_12px_28px_rgba(234,168,18,0.4)] transition-all duration-300"
          >
            <motion.div
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative h-14 w-16 shrink-0 overflow-hidden transition-all duration-300"
            >
              <Image
                src="/logo-carved-nobg.svg"
                alt="Artisanat Aschi Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl sm:text-2xl font-normal tracking-wide text-[#F7F4EE] group-hover:text-[#F2BD52] transition-colors">
              Artisanat Aschi
            </span>
            <span className="mt-0.5 text-[0.65rem] uppercase tracking-[0.24em] text-[#EAA812] font-bold">
              Maison Fondée en 1960
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex h-full">
          {LINKS.map((link) => {
            if (link.isDropdown) {
              const isActive = pathname === '/catalogue' || pathname === '/custom-creation' || pathname === '/relooking' || pathname === '/espaces-d-exception'
              return (
                <li
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    className={cn(
                      'group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors py-4 cursor-pointer',
                      isActive || servicesOpen ? 'text-[#F2BD52]' : 'text-[#EAE4D9]/90 hover:text-[#F2BD52]',
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("size-3.5 transition-transform duration-300", servicesOpen && "rotate-180 text-[#E6A635]")} />
                    <span
                      className={cn(
                        'absolute bottom-2 left-0 h-px bg-gradient-to-r from-[#F3C45E] to-[#E6A635] transition-all duration-300',
                        isActive || servicesOpen ? 'w-full' : 'w-0 group-hover:w-full',
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
                    'group relative text-xs font-semibold uppercase tracking-[0.16em] transition-colors py-4',
                    isActive ? 'text-[#F2BD52]' : 'text-[#EAE4D9]/90 hover:text-[#F2BD52]',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute bottom-2 left-0 h-px bg-gradient-to-r from-[#F3C45E] to-[#E6A635] transition-all duration-300',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-3 sm:gap-4 relative z-50">
          {/* Cart Icon Desktop/Mobile */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Ouvrir le panier"
            className="relative rounded-full p-2 text-[#EAE4D9] transition-colors hover:text-[#E6A635] cursor-pointer"
          >
            <ShoppingCart className="size-5" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#E6A635] text-[9px] font-bold text-[#1A110B] shadow-[0_0_8px_#E6A635]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA: Studio Sur-Mesure 3D */}
          <Link
            href="/custom-creation"
            className="hidden rounded-full border border-[#E6A635]/40 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1A110B] transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,166,53,0.4)] btn-sheen lg:inline-block shadow-md"
          >
            Devis Sur-Mesure 3D
          </Link>

          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="text-[#EAE4D9] lg:hidden cursor-pointer p-1"
          >
            {open ? <X className="size-6 text-[#E6A635]" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {/* Desktop Mega Menu Dropdown */}
      <AnimatePresence>
        {servicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-full left-0 w-full bg-[#241812]/98 backdrop-blur-2xl border-t border-[#E6A635]/25 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden hidden lg:block"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <div className="mx-auto max-w-5xl px-8 py-7 flex gap-5">
              {SERVICES.map((service, idx) => (
                <Link 
                  href={service.href} 
                  key={idx} 
                  className="flex-1 group relative overflow-hidden rounded-2xl border border-[#E6A635]/30 bg-[#3B271C]/85 transition-all hover:border-[#E6A635]/75 hover:bg-[#452E21] hover:shadow-[0_10px_30px_rgba(230,166,53,0.2)] flex flex-col hover:-translate-y-1"
                >
                  <div className="h-32 relative overflow-hidden bg-[#241812]">
                    <Image src={service.image} alt={service.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3B271C] via-transparent to-transparent" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col bg-[#3B271C]">
                    <h3 className="font-heading text-lg text-[#F7F4EE] mb-1.5 group-hover:text-[#F2BD52] transition-colors">{service.title}</h3>
                    <p className="text-[#EAE4D9]/80 text-xs font-light leading-relaxed mb-3 flex-1">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#F2BD52] font-bold group-hover:translate-x-1.5 transition-transform duration-300">
                      <span>{service.cta}</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Luxury Curtain Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-0 h-[100dvh] bg-[#20150F]/98 backdrop-blur-2xl z-50 flex flex-col justify-between overflow-y-auto px-5 pt-5 pb-8 lg:hidden border-b border-[#E6A635]/30 shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#E6A635]/20">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  <Image
                    src="/logo-carved-nobg.svg"
                    alt="Artisanat Aschi Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-heading text-xl text-[#F7F4EE]">Artisanat Aschi</span>
                  <span className="text-[8px] uppercase tracking-[0.24em] text-[#EAA812] font-bold mt-0.5">Depuis 1960 • Tunisie</span>
                </div>
              </Link>
              
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setOpen(false)}
                className="size-9 rounded-full border border-[#E6A635]/40 bg-[#2E1E16] flex items-center justify-center text-[#F2BD52] shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Navigation Links */}
            <ul className="flex flex-col gap-1 py-4 flex-1">
              {LINKS.map((link) => {
                if (link.isDropdown) {
                  return (
                    <li key={link.label} className="border-b border-[#E6A635]/15 pb-1">
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className="flex w-full items-center justify-between py-2.5 font-heading text-xl text-[#F7F4EE] transition-colors active:text-[#F2BD52]"
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={cn("size-4 text-[#E6A635] transition-transform duration-300", mobileServicesOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-2 pt-1 pb-2"
                          >
                            {SERVICES.map((service, sIdx) => (
                              <li key={sIdx}>
                                <Link
                                  href={service.href}
                                  onClick={() => setOpen(false)}
                                  className="flex gap-3 items-center rounded-xl bg-[#3B271C]/90 border border-[#E6A635]/30 p-2.5 active:border-[#E6A635]"
                                >
                                  <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-[#E6A635]/30">
                                    <Image src={service.image} alt={service.title} fill className="object-cover" />
                                  </div>
                                  <div>
                                    <h4 className="font-heading text-sm text-[#F7F4EE]">{service.title}</h4>
                                    <p className="text-[9.5px] text-[#EAE4D9]/75 line-clamp-1">{service.description}</p>
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
                  <li key={link.href} className="border-b border-[#E6A635]/15 pb-0.5">
                    <Link
                      href={link.href!}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-2.5 font-heading text-xl transition-colors",
                        isActive ? "text-[#F2BD52]" : "text-[#F7F4EE] active:text-[#F2BD52]"
                      )}
                    >
                      <span>{link.label}</span>
                      <span className="text-[#E6A635]/40 text-xs">❖</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Drawer Bottom VIP Actions & Quick Call */}
            <div className="pt-3 border-t border-[#E6A635]/20 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[#EAE4D9]/80 font-light">
                <a href="https://wa.me/21655743760" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <MessageCircle className="size-3.5" />
                  <span>WhatsApp VIP</span>
                </a>
                <span className="text-[#E6A635]/40">•</span>
                <a href="tel:+21655743760" className="flex items-center gap-1.5 text-[#F2BD52] font-medium">
                  <Phone className="size-3.5" />
                  <span>+216 55 743 760</span>
                </a>
              </div>

              <Link
                href="/custom-creation"
                onClick={() => setOpen(false)}
                className="btn-sheen w-full text-center rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1A110B] shadow-lg"
              >
                Studio Sur-Mesure 3D
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
