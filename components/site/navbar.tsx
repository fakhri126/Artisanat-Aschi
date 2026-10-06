'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ShoppingCart, ChevronDown, ChevronRight, ArrowRight, Sparkles, Phone, Armchair, SquarePen } from 'lucide-react'
import { cn } from '@/lib/utils'

function DoorDoubleIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <rect x="6.5" y="6" width="3" height="12" rx="0.5" />
      <rect x="14.5" y="6" width="3" height="12" rx="0.5" />
    </svg>
  )
}
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'

const LINKS = [
  { label: "L'Atelier", href: '/atelier' },
  { label: 'Pièces Disponibles', href: '/creations' },
  { label: 'Bijoux de Porte', href: '/bijoux-de-porte' },
  { label: 'Nos Services', isDropdown: true },
]

const SERVICES = [
  {
    title: 'Catalogue d\'Inspiration (Sur-Mesure)',
    description: 'Explorez notre collection de mobilier d\'art sculpté pour concevoir votre projet sur-mesure.',
    image: '/herochaise.png',
    href: '/catalogue',
    cta: 'Voir le catalogue'
  },
  {
    title: 'Projets Clés en Main (Espaces d\'Exception)',
    description: 'Aménagement monumental complet pour Hôtels 5★, Palaces, Riads et Demeures de prestige.',
    image: '/images/bg-espace-exception.jpg',
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
              const isActive = pathname === '/catalogue' || pathname === '/relooking' || pathname === '/espaces-d-exception'
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

          {/* Primary CTA: Contact */}
          <Link
            href="/contact"
            className="hidden rounded-full border border-[#E6A635]/40 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1A110B] transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,166,53,0.4)] btn-sheen lg:inline-block shadow-md"
          >
            Contactez-nous
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

            {/* Mobile Navigation Cards matching the reference design */}
            <div className="flex flex-col gap-3 py-4 relative z-10">
              {/* 1. L'Atelier */}
              <Link
                href="/atelier"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1B13]/95 via-[#22150E]/95 to-[#190E08]/95 border border-[#E6A635]/25 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(242,189,82,0.12)] hover:border-[#E6A635]/50 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-b from-[#362319] to-[#1C110A] border border-[#E6A635]/30 flex items-center justify-center text-[#F2BD52] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="size-6 text-[#F2BD52]" strokeWidth={1.8} />
                  </div>
                  <span className="font-heading text-lg sm:text-[19px] text-[#F7F4EE] font-normal tracking-wide group-hover:text-[#F2BD52] transition-colors">
                    L&apos;Atelier
                  </span>
                </div>
                <ChevronRight className="size-5 text-[#F2BD52]/80 shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
              </Link>

              {/* 2. Pièces Disponibles */}
              <Link
                href="/creations"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1B13]/95 via-[#22150E]/95 to-[#190E08]/95 border border-[#E6A635]/25 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(242,189,82,0.12)] hover:border-[#E6A635]/50 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-b from-[#362319] to-[#1C110A] border border-[#E6A635]/30 flex items-center justify-center text-[#F2BD52] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="size-6 text-[#F2BD52]" strokeWidth={1.8} />
                  </div>
                  <span className="font-heading text-lg sm:text-[19px] text-[#F7F4EE] font-normal tracking-wide group-hover:text-[#F2BD52] transition-colors">
                    Pièces Disponibles
                  </span>
                </div>
                <ChevronRight className="size-5 text-[#F2BD52]/80 shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
              </Link>

              {/* 3. Bijoux de Porte */}
              <Link
                href="/bijoux-de-porte"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1B13]/95 via-[#22150E]/95 to-[#190E08]/95 border border-[#E6A635]/25 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(242,189,82,0.12)] hover:border-[#E6A635]/50 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-b from-[#362319] to-[#1C110A] border border-[#E6A635]/30 flex items-center justify-center text-[#F2BD52] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <DoorDoubleIcon className="size-6 text-[#F2BD52]" />
                  </div>
                  <span className="font-heading text-lg sm:text-[19px] text-[#F7F4EE] font-normal tracking-wide group-hover:text-[#F2BD52] transition-colors">
                    Bijoux de Porte
                  </span>
                </div>
                <ChevronRight className="size-5 text-[#F2BD52]/80 shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
              </Link>

              {/* 4. Nos Services (Accordion) */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1B13]/95 via-[#22150E]/95 to-[#190E08]/95 border border-[#E6A635]/25 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(242,189,82,0.12)] hover:border-[#E6A635]/50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="size-12 rounded-xl bg-gradient-to-b from-[#362319] to-[#1C110A] border border-[#E6A635]/30 flex items-center justify-center text-[#F2BD52] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      <SquarePen className="size-5.5 text-[#F2BD52]" strokeWidth={1.8} />
                    </div>
                    <span className="font-heading text-lg sm:text-[19px] text-[#F7F4EE] font-normal tracking-wide group-hover:text-[#F2BD52] transition-colors">
                      Nos Services
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-5 text-[#F2BD52]/80 shrink-0 transition-transform duration-300",
                      mobileServicesOpen && "rotate-180"
                    )}
                    strokeWidth={1.8}
                  />
                </button>

                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-col gap-2 pt-2.5 pl-3"
                    >
                      {SERVICES.map((service, sIdx) => (
                        <Link
                          key={sIdx}
                          href={service.href}
                          onClick={() => setOpen(false)}
                          className="flex gap-3 items-center rounded-xl bg-[#281810]/90 border border-[#E6A635]/20 p-2.5 active:border-[#E6A635] shadow-md transition-all hover:border-[#E6A635]/50"
                        >
                          <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-[#E6A635]/30">
                            <Image src={service.image} alt={service.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-heading text-sm text-[#F7F4EE] truncate">{service.title}</h4>
                            <p className="text-[9.5px] text-[#EAE4D9]/75 line-clamp-1">{service.description}</p>
                          </div>
                          <ChevronRight className="size-4 text-[#E6A635]/60 shrink-0" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Spacer with Watermark Monogram matching photo */}
            <div className="flex-1 relative min-h-[120px]">
              <div className="absolute -bottom-6 -right-6 w-64 h-80 opacity-20 pointer-events-none select-none">
                <Image
                  src="/logo-carved-nobg.svg"
                  alt=""
                  fill
                  className="object-contain object-bottom-right"
                />
              </div>
            </div>

            {/* Drawer Bottom VIP Bar matching reference photo */}
            <div className="pt-3.5 pb-1 border-t border-[#E6A635]/25 relative z-10">
              <div className="grid grid-cols-2 items-center relative">
                {/* Left: WhatsApp VIP */}
                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 group pr-2 cursor-pointer"
                >
                  <div className="size-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(37,211,102,0.4)] group-hover:scale-105 transition-transform">
                    <svg className="size-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.15c-.24.68-1.2 1.26-1.68 1.32-.47.06-.92.1-3.08-.8-2.6-1.08-4.29-3.72-4.42-3.89-.13-.17-1.06-1.41-1.06-2.69s.67-1.9 1.01-2.25c.34-.35.74-.44.99-.44.25 0 .5.01.71.02.23.01.53-.09.83.63.3.72 1.03 2.51 1.12 2.69.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.36.38-.16.73.21.35.92 1.52 1.98 2.46 1.36 1.21 2.5 1.59 2.86 1.76.36.17.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.8-.18.33.12 2.07.98 2.43 1.16.36.18.6.27.69.42.09.15.09.87-.15 1.55z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-[#F7F4EE] leading-tight group-hover:text-[#F2BD52] transition-colors">
                      WhatsApp VIP
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] uppercase tracking-[0.16em] text-[#EAA812] font-semibold mt-0.5 whitespace-nowrap">
                      PRIVILÈGE &amp; CONSEILS
                    </span>
                  </div>
                </a>

                {/* Center Vertical Divider */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-px bg-[#E6A635]/25" />

                {/* Right: Phone */}
                <a
                  href="tel:+21655743760"
                  className="flex items-center justify-end gap-2 group pl-2 cursor-pointer"
                >
                  <Phone className="size-4 text-[#F2BD52] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-[11.5px] sm:text-[12.5px] font-medium text-[#F2BD52] tracking-wider whitespace-nowrap">
                    +216 55 743 760
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
