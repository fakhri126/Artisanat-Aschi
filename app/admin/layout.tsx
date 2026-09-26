'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  MessageSquareCode, 
  Newspaper, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Gem,
  BookImage,
  ArrowLeftRight,
  Sparkles,
  Briefcase,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react'
import { isLoggedIn, removeAuthToken } from '@/lib/api'
import { cn } from '@/lib/utils'

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', label: 'Statistiques', icon: LayoutDashboard },
  { href: '/admin/quotes', label: 'Devis (Sur-mesure & Relooking)', icon: MessageSquareCode },
  { href: '/admin/bijoux-de-porte', label: 'Bijoux de Porte', icon: Sparkles },
  { href: '/admin/espaces-d-exception', label: 'Projets clés en main', icon: Briefcase },
  { href: '/admin/products', label: 'Produits disponibles', icon: Package },
  { href: '/admin/catalogue', label: 'Catalogue inspiration', icon: BookImage },
  { href: '/admin/news', label: 'Actualités', icon: Newspaper },
  { href: '/admin/relooking', label: 'Relookings', icon: ArrowLeftRight },
  { href: '/admin/deliveries', label: 'Livraisons', icon: Package },
  { href: '/admin/testimonials', label: 'Témoignages', icon: MessageSquare },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Skip auth layout for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const checkAuth = () => {
      const logged = isLoggedIn()
      if (!logged && !isLoginPage) {
        setAuthenticated(false)
        router.push('/admin/login')
      } else {
        setAuthenticated(true)
      }
    }
    checkAuth()
  }, [pathname, isLoginPage, router])

  const handleLogout = () => {
    removeAuthToken()
    router.push('/admin/login')
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F7F4] text-[#0F172A]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C8960C] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#64748B] font-medium">Chargement de l&apos;administration...</p>
        </div>
      </div>
    )
  }

  const renderNavItems = (onItemClick?: () => void) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {SIDEBAR_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200",
              isActive 
                ? "bg-[#EFECE6] text-[#0F172A] font-bold shadow-xs border border-[#E2DBD0]" 
                : "text-[#475569] hover:bg-[#F3EFEA] hover:text-[#0F172A]"
            )}
          >
            <item.icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-[#C17D59]" : "text-[#8C7A6B]")} />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0F172A] flex overflow-hidden">
      {/* Desktop Sidebar — 280px Cream / Ivory Luxury Palette */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-[#FAF8F5] border-r border-[#E8DFD4] text-[#0F172A] shrink-0 h-screen select-none">
        {/* Brand Header */}
        <div className="pt-6 pb-5 px-6 border-b border-[#E8DFD4] flex items-center gap-3 shrink-0">
          <div className="size-9 rounded-xl bg-gradient-to-br from-[#C8794D] to-[#B89555] flex items-center justify-center text-white shadow-xs shrink-0">
            <Gem className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg font-bold tracking-tight text-[#0F172A] leading-snug truncate">
              Artisanat Aschi
            </h1>
            <p className="text-[10px] tracking-wider text-[#78695C] uppercase font-sans font-semibold truncate">
              Mobilier &amp; Décoration Artisanale
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        {renderNavItems()}

        {/* User Footer with Avatar */}
        <div className="p-4 border-t border-[#E8DFD4] mt-auto bg-[#FAF8F5] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-[#3A2A1E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate">Admin</p>
                <p className="text-[10px] text-[#78695C] font-medium truncate">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-2 text-[#78695C] hover:text-[#C8794D] hover:bg-[#EFECE6] rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#FAF8F5] border-r border-[#E8DFD4] text-[#0F172A] flex flex-col transition-transform duration-300 lg:hidden shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-18 flex items-center justify-between px-6 border-b border-[#E8DFD4] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#C8794D] to-[#B89555] flex items-center justify-center text-white shadow-xs">
              <Gem className="size-4" />
            </div>
            <span className="font-serif text-base font-bold text-[#0F172A]">Artisanat Aschi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" className="p-1 rounded-lg hover:bg-[#EFECE6] text-[#0F172A] cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {renderNavItems(() => setSidebarOpen(false))}

        <div className="p-4 border-t border-[#E8DFD4] mt-auto bg-[#FAF8F5] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-[#3A2A1E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate">Admin</p>
                <p className="text-[10px] text-[#78695C] font-medium truncate">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#78695C] hover:text-[#C8794D] hover:bg-[#EFECE6] rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8F7F4]">
        {/* Top Header Bar — Light Luxury Theme */}
        <header className="h-16 px-5 sm:px-8 border-b border-[#E8DFD4] bg-white/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-10 shadow-2xs">
          {/* Mobile hamburger button */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 border border-[#E2DBD0] rounded-xl text-[#0F172A] hover:bg-[#FAF8F5] lg:hidden cursor-pointer" 
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Top Search Input */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8C7A6B]" />
            <input
              type="text"
              placeholder="Rechercher un projet, une commande, un produit..."
              className="w-full bg-[#FAF8F5] border border-[#E2DBD0] focus:border-[#C8960C] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder:text-[#8C7A6B]/80 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 ml-auto">
            <button 
              type="button"
              className="relative p-2 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E2DBD0] transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#C8794D]" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E8DFD4]">
              <div className="size-8 rounded-full bg-[#3A2A1E] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                A
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-[#0F172A] font-semibold">
                <span>Admin</span>
                <ChevronDown className="size-3 text-[#78695C]" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
