'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  MessageSquareCode, 
  Newspaper, 
  FolderGit, 
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
  { href: '/admin/espaces-d-exception', label: "Espaces d'Exception", icon: Briefcase },
  { href: '/admin/products', label: 'Produits disponibles', icon: Package },
  { href: '/admin/catalogue', label: 'Catalogue inspiration', icon: BookImage },
  { href: '/admin/news', label: 'Actualités', icon: Newspaper },
  { href: '/admin/relooking', label: 'Relookings', icon: ArrowLeftRight },
  { href: '/admin/deliveries', label: 'Livraisons', icon: Package },
  { href: '/admin/projects', label: 'Réalisations', icon: FolderGit },
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
      <div className="flex h-screen items-center justify-center bg-[#15120F] text-[#F5F0E8]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#B89555] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#D9C8AE] font-light">Chargement de l&apos;administration...</p>
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
                ? "bg-[#E5D7C5] text-[#15120F] font-semibold shadow-xs" 
                : "text-[#3A2E24]/80 hover:bg-[#EBE2D5]/70 hover:text-[#15120F]"
            )}
          >
            <item.icon className={cn("size-4 shrink-0", isActive ? "text-[#15120F]" : "text-[#6B4935]")} />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#15120F] text-[#F5F0E8] flex overflow-hidden">
      {/* Desktop Sidebar — 280px Cream / Ivory Luxury Palette */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-[#F5F0E8] border-r border-[#E5D7C5]/70 text-[#15120F] shrink-0 h-screen select-none">
        {/* Brand Header */}
        <div className="pt-6 pb-5 px-6 border-b border-[#E5D7C5]/70 flex items-center gap-3 shrink-0">
          <div className="size-9 rounded-xl bg-gradient-to-br from-[#C8794D] to-[#B89555] flex items-center justify-center text-white shadow-xs shrink-0">
            <Gem className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg font-bold tracking-tight text-[#15120F] leading-snug truncate">
              Artisanat Aschi
            </h1>
            <p className="text-[10px] tracking-wider text-[#6B4935]/80 uppercase font-sans font-medium truncate">
              Mobilier &amp; Décoration Artisanale
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        {renderNavItems()}

        {/* User Footer with Avatar */}
        <div className="p-4 border-t border-[#E5D7C5]/70 mt-auto bg-[#F5F0E8] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-[#15120F] text-[#F5F0E8] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#15120F] truncate">Admin</p>
                <p className="text-[10px] text-[#6B4935]/80 truncate">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-2 text-[#6B4935] hover:text-[#C8794D] hover:bg-[#EBE2D5] rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#F5F0E8] border-r border-[#E5D7C5]/70 text-[#15120F] flex flex-col transition-transform duration-300 lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-18 flex items-center justify-between px-6 border-b border-[#E5D7C5]/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#C8794D] to-[#B89555] flex items-center justify-center text-white shadow-xs">
              <Gem className="size-4" />
            </div>
            <span className="font-serif text-base font-bold text-[#15120F]">Artisanat Aschi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" className="p-1 rounded-lg hover:bg-[#EBE2D5] text-[#15120F]">
            <X className="size-5" />
          </button>
        </div>

        {renderNavItems(() => setSidebarOpen(false))}

        <div className="p-4 border-t border-[#E5D7C5]/70 mt-auto bg-[#F5F0E8] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-[#15120F] text-[#F5F0E8] font-bold text-xs flex items-center justify-center shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#15120F] truncate">Admin</p>
                <p className="text-[10px] text-[#6B4935]/80 truncate">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#6B4935] hover:text-[#C8794D] hover:bg-[#EBE2D5] rounded-xl transition-colors shrink-0"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#15120F]">
        {/* Top Header Bar — Matches Luxury Showroom Mockup */}
        <header className="h-16 px-5 sm:px-8 border-b border-[#2A211A] bg-[#15120F] flex items-center justify-between gap-4 shrink-0 z-10">
          {/* Mobile hamburger button */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 border border-[#3A2E24] rounded-xl text-[#D9C8AE] hover:text-white lg:hidden cursor-pointer" 
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Top Search Input */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#D9C8AE]/50" />
            <input
              type="text"
              placeholder="Rechercher un produit, une catégorie..."
              className="w-full bg-[#211A15] border border-[#3A2E24] focus:border-[#B89555] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none transition-colors"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 ml-auto">
            <button 
              type="button"
              className="relative p-2 rounded-xl text-[#D9C8AE]/80 hover:text-[#F5F0E8] hover:bg-[#211A15] border border-transparent hover:border-[#3A2E24] transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#C8794D]" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#3A2E24]">
              <div className="size-8 rounded-full bg-[#2A211A] border border-[#3A2E24] text-[#F5F0E8] font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-[#F5F0E8] font-medium">
                <span>Admin</span>
                <ChevronDown className="size-3 text-[#D9C8AE]/60" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-9 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
