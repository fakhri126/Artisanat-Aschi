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
import { Toaster } from 'sonner'
import { BohoFineCorner } from '@/components/site/boho-decor'

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
      <body className="antialiased min-h-screen font-sans selection:bg-[#C17D59] selection:text-white bg-[#DEB887] bg-[url('/seamless-plank-bg.jpg')] bg-repeat bg-[length:100vw_auto] text-[#1A110B]">        {/* Cadre Minimaliste Élégant - Rendu plus visible et mis en valeur */}
        <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]">
          <BohoFineCorner className="absolute top-4 left-4 w-16 sm:w-24 md:w-32 opacity-90 text-[#3A2A1E]" color="currentColor" />
          <BohoFineCorner className="absolute top-4 right-4 w-16 sm:w-24 md:w-32 opacity-90 text-[#3A2A1E] scale-x-[-1]" color="currentColor" delay={0.2} />
          <BohoFineCorner className="absolute bottom-4 left-4 w-16 sm:w-24 md:w-32 opacity-90 text-[#3A2A1E] scale-y-[-1]" color="currentColor" delay={0.4} />
          <BohoFineCorner className="absolute bottom-4 right-4 w-16 sm:w-24 md:w-32 opacity-90 text-[#3A2A1E] scale-[-1]" color="currentColor" delay={0.6} />
        </div>



        <CartProvider>
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
          <CartSheet />
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
