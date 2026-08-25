import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost, Geist_Mono } from 'next/font/google'
import { PageTransitionWrapper } from '@/components/motion/page-transition-wrapper'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Artisanat Aschi — Sculpteurs du patrimoine tunisien depuis 1960',
  description:
    "Atelier familial fondé en 1960 en Tunisie. Mobilier d'art sculpté à la main, portes artistiques, miroirs de luxe et créations sur-mesure pour villas, maisons d'hôtes, hôtels et restaurants.",
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#3a2c1f',
}

import { CartProvider } from '@/lib/cart-context'
import { CartSheet } from '@/components/site/cart-sheet'
import { MobileFloatingVIP } from '@/components/site/mobile-floating-vip'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} ${geistMono.variable}`}
    >
      <body className="antialiased min-h-screen font-sans selection:bg-[#C17D59] selection:text-white bg-[#1A1512] text-[#E8DCCB]">
        <CartProvider>
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
          <CartSheet />
          <MobileFloatingVIP />
        </CartProvider>
        <Toaster position="bottom-right" theme="dark" toastOptions={{
          style: {
            background: 'var(--color-walnut)',
            border: '1px solid var(--color-gold)',
            color: 'var(--color-ivory)',
          }
        }} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
