'use client'

import Link from 'next/link'
import { Sparkles, MapPin, Phone, Mail, Clock, ArrowRight, MessageCircle, ExternalLink } from 'lucide-react'
import { HeritageSeal } from './heritage-seal'

function InstagramIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="relative border-t-2 border-[#E6A635]/35 bg-[#1B110B]/98 text-white overflow-hidden pt-12 pb-8">
      {/* Background Soft Amber Glow */}
      <div className="absolute top-0 right-1/4 size-96 bg-[#E6A635]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 size-96 bg-[#C78318]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid: 3 Clean, Ultra-Fast Columns (Zero Heavy iFrames) */}
        <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 mb-10 text-left">
          
          {/* ========================================================================= */}
          {/* 1. BRAND, HISTOIRE & RÉSEAUX SOCIAUX (5 Cols)                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <HeritageSeal size={70} />
                <div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-light tracking-wide text-gold-gradient">
                    Artisanat Aschi
                  </h3>
                  <p className="text-[9.5px] uppercase tracking-[0.24em] text-[#F2BD52] font-bold mt-0.5">
                    Maison Fondée en 1960 • Tunisie
                  </p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm font-normal leading-relaxed text-white drop-shadow max-w-md">
                Atelier familial de sculpture sur bois noble et haute ébénisterie. Nous façonnons des pièces uniques et des aménagements d&apos;exception pour les demeures de prestige à travers le monde.
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-[#F2BD52] font-semibold bg-[#241812]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E6A635]/35 shadow-sm">
                <span className="size-2 rounded-full bg-[#E6A635] animate-pulse shadow-[0_0_8px_#E6A635]" />
                <span>Atelier ouvert aux visites privées sur rendez-vous</span>
              </div>
            </div>

            {/* Social Media Accounts (Instagram, Facebook & WhatsApp) */}
            <div className="pt-1">
              <h5 className="text-[10.5px] uppercase tracking-[0.2em] text-[#F2BD52] font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#E6A635]" />
                <span>Rejoignez Notre Communauté</span>
              </h5>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/artisanat_aschi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Artisanat Aschi"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#1A110B] hover:bg-gradient-to-r hover:from-[#F3C45E] hover:to-[#E6A635] transition-all duration-300 shadow-md group cursor-pointer"
                >
                  <InstagramIcon className="size-4 text-[#F2BD52] group-hover:text-[#1A110B] transition-colors" />
                  <span className="text-xs font-semibold">Instagram</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/artisanat.aschi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Artisanat Aschi"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241812]/90 border border-[#E6A635]/40 text-white hover:text-[#1A110B] hover:bg-gradient-to-r hover:from-[#F3C45E] hover:to-[#E6A635] transition-all duration-300 shadow-md group cursor-pointer"
                >
                  <FacebookIcon className="size-4 text-[#F2BD52] group-hover:text-[#1A110B] transition-colors" />
                  <span className="text-xs font-semibold">Facebook</span>
                </a>

                {/* WhatsApp Direct */}
                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Direct"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. NAVIGATION & SERVICES (3 Cols)                                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#F2BD52] font-bold mb-4 sm:mb-5 flex items-center gap-2">
              <span>Maison &amp; Services</span>
            </h4>
            <nav className="flex flex-col gap-3 text-xs sm:text-[13px] text-white font-normal">
              <Link href="/atelier" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>L&apos;Atelier &amp; Savoir-Faire</span>
              </Link>
              <Link href="/creations" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>Créations Noyer Massif</span>
              </Link>
              <Link href="/bijoux-de-porte" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>Bijoux de Porte d&apos;Art</span>
              </Link>
              <Link href="/catalogue" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>Catalogue d&apos;Inspiration</span>
              </Link>
              <Link href="/relooking" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>Restauration &amp; Relooking</span>
              </Link>
              <Link href="/espaces-d-exception" className="transition-colors hover:text-[#F2BD52] flex items-center gap-2 group">
                <span className="text-[#E6A635] text-[10px] group-hover:translate-x-0.5 transition-transform">❖</span>
                <span>Espaces d&apos;Exception &amp; Hôtels</span>
              </Link>
            </nav>
          </div>

          {/* ========================================================================= */}
          {/* 3. COORDONNÉES, ITINÉRAIRE & ÉTUDE PRIVÉE (4 Cols)                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#F2BD52] font-bold mb-4 sm:mb-5 flex items-center gap-2">
              <span>Atelier &amp; Contact VIP</span>
            </h4>
            
            <div className="flex flex-col gap-3.5 text-xs sm:text-[13px] text-white font-normal">
              {/* Adresse avec bouton direct Google Maps */}
              <div className="flex items-start justify-between gap-3 bg-[#241812]/90 border border-[#E6A635]/35 p-3 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-[#F2BD52] shrink-0 mt-0.5" />
                  <span className="leading-snug">9 avenue Roosevelt, La Goulette, Tunis</span>
                </div>
                <a
                  href="https://maps.google.com/?q=9+avenue+Roosevelt,+La+Goulette,+Tunis,+Tunisie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6A635] text-[#1A110B] text-[10px] font-bold uppercase tracking-wider hover:bg-[#F3C45E] transition-colors shadow-sm shrink-0 cursor-pointer"
                  title="Ouvrir dans Google Maps"
                >
                  <span>GPS</span>
                  <ExternalLink className="size-2.5" />
                </a>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-[#F2BD52] shrink-0" />
                <a href="tel:+21655743760" className="hover:text-[#F2BD52] transition-colors font-medium">+216 55 743 760</a>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-[#F2BD52] shrink-0" />
                <a href="mailto:artisanat.aschi@gmail.com" className="hover:text-[#F2BD52] transition-colors">artisanat.aschi@gmail.com</a>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-[#F2BD52] shrink-0" />
                <span>Lun — Sam : 08h30 — 18h30</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/espaces-d-exception#demande-projet"
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1A110B] transition-all hover:scale-[1.02] shadow-xl hover:shadow-[0_0_20px_rgba(230,166,53,0.35)]"
              >
                <span>Demander une Étude Privée</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BAR & MENTIONS LÉGALES                                          */}
        {/* ========================================================================= */}
        <div className="border-t border-[#E6A635]/25 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/80 font-normal">
          <p>© {new Date().getFullYear()} Maison Artisanat Aschi. Tous droits réservés.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-[#F2BD52] transition-colors">Mentions Légales</Link>
            <span className="text-[#E6A635]/60">•</span>
            <Link href="/politique-de-confidentialite" className="hover:text-[#F2BD52] transition-colors">Confidentialité</Link>
            <span className="text-[#E6A635]/60">•</span>
            <Link href="/admin/login" className="text-[#F2BD52] hover:text-white transition-colors font-medium">Espace Privé</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
