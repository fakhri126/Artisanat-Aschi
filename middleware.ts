import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Vérification rapide et légère de l'expiration du JWT (compatible Edge Runtime).
 */
function isTokenExpired(token: string): boolean {
  if (!token) return true
  try {
    const cleanToken = decodeURIComponent(token).replace(/^Bearer\s+/i, '').trim()
    const parts = cleanToken.split('.')
    if (parts.length !== 3) return true
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    const payload = JSON.parse(decoded)
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000
    }
    return false
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tokenCookie = request.cookies.get('admin_token')
  const token = tokenCookie?.value
  const isLoginPage = pathname === '/admin/login'

  const hasValidToken = Boolean(token && !isTokenExpired(token))

  // 1. Si déjà authentifié et tente d'accéder à la page de connexion -> redirection Dashboard
  if (isLoginPage && hasValidToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // 2. Si tente d'accéder à toute page /admin/* sans session valide -> redirection immédiate /admin/login
  if (!isLoginPage && !hasValidToken) {
    const loginUrl = new URL('/admin/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    
    // Si un ancien cookie corrompu ou expiré était présent, on le purge
    if (token) {
      response.cookies.delete('admin_token')
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
