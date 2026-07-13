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
  BookImage
} from 'lucide-react'
import { isLoggedIn, removeAuthToken } from '@/lib/api'
import { cn } from '@/lib/utils'

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', label: 'Statistiques', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits disponibles', icon: Package },
  { href: '/admin/catalogue', label: 'Catalogue inspiration', icon: BookImage },
  { href: '/admin/quotes', label: 'Demandes de devis', icon: MessageSquareCode },
  { href: '/admin/news', label: 'Actualités', icon: Newspaper },
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

  if (authenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-walnut text-ivory">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold font-light">Chargement de l&apos;administration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-walnut border-r border-gold/10 text-ivory shrink-0">
        <div className="h-20 flex items-center gap-2 px-6 border-b border-gold/10">
          <Gem className="size-6 text-gold" />
          <span className="font-heading text-lg font-semibold tracking-wide">Artisanat Aschi</span>
          <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded font-mono uppercase">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gold text-walnut shadow-md" 
                    : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-walnut border-r border-gold/10 text-ivory flex flex-col transition-transform duration-300 md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gold/10">
          <div className="flex items-center gap-2">
            <Gem className="size-6 text-gold" />
            <span className="font-heading text-lg font-semibold tracking-wide">Aschi Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="size-5 text-gold" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gold text-walnut shadow-md" 
                    : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Banner */}
        <header className="h-20 bg-walnut text-ivory border-b border-gold/10 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <Gem className="size-6 text-gold" />
            <span className="font-heading text-lg font-semibold">Aschi Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 border border-gold/20 rounded" aria-label="Open menu">
            <Menu className="size-6 text-gold" />
          </button>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
