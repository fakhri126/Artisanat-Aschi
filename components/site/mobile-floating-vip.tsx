'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, Sparkles, FileText } from 'lucide-react'
import Link from 'next/link'

export function MobileFloatingVIP() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar after scrolling 200px
      setVisible(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 inset-x-4 z-40 lg:hidden flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-sm flex items-center justify-between gap-2 p-2 rounded-full bg-[#1A110B]/95 backdrop-blur-2xl border border-[#E6A635]/40 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(230,166,53,0.2)]">
            {/* Direct WhatsApp VIP Button */}
            <a
              href="https://wa.me/21655743760"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
            >
              <MessageCircle className="size-3.5 fill-[#25D366]/20" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Call Button */}
            <a
              href="tel:+21655743760"
              className="flex items-center justify-center size-9 rounded-full bg-[#231710] border border-[#E6A635]/40 text-[#F2BD52] active:scale-95 transition-transform shrink-0"
              aria-label="Appeler l'atelier"
            >
              <Phone className="size-4 text-[#E6A635]" />
            </a>

            {/* Devis Express VIP Button in Authentic Mustard Ochre */}
            <Link
              href="/contact"
              className="flex-1 btn-sheen flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform"
            >
              <Sparkles className="size-3 text-[#1A110B]" />
              <span>Devis 3D</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
