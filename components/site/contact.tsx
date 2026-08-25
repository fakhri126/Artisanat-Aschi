"use client"

import type React from "react"
import { useState } from "react"
import { Reveal } from "./reveal"
import { MapPin, Phone, Mail, Clock, AlertCircle, ChevronLeft, ArrowRight, PenTool, Sparkles, Send, CheckCircle2, MessageCircle } from "lucide-react"
import { publicApi } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function Contact() {
  const [selectedArtisan, setSelectedArtisan] = useState<'Adel' | 'Ismail' | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("name") as string
    const email = formData.get("email") as string
    const phoneNumber = formData.get("phone") as string
    const rawMessage = formData.get("message") as string
    
    const message = `[À l'attention de ${selectedArtisan || 'l\'Atelier'}]\n\n${rawMessage}`

    try {
      await publicApi.submitQuoteRequest({
        fullName,
        email,
        phoneNumber,
        message,
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de votre demande.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="bg-[#241812] text-[#F7F4EE] min-h-[90vh] flex flex-col relative overflow-hidden py-10 md:py-16">
      
      {/* Unified Background Texture */}
      <div className="absolute inset-0 z-0 opacity-80 brightness-95 pointer-events-none bg-[url('/images/bg-carved-wood.jpg')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241812]/80 via-black/30 to-[#241812]/90 pointer-events-none z-0" />

      {/* Amber Glow Halos */}
      <div className="absolute top-1/4 left-1/4 size-[450px] rounded-full bg-[#E6A635]/18 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 size-[450px] rounded-full bg-[#C78318]/15 blur-[130px] pointer-events-none z-0" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-[0.2em] mb-3 shadow-md">
            <Sparkles className="size-3 text-[#E6A635] animate-pulse" />
            <span>Conciergerie &amp; Contact Direct</span>
          </div>
          
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-gold-gradient mb-3 leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
            Donnons Vie à Vos Projets
          </h1>
          
          <p className="text-[#EAE4D9]/90 max-w-xl mx-auto font-light text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-md">
            Contactez directement notre maison d&apos;artisanat d&apos;art. Une équipe dévouée à l&apos;écoute de vos besoins pour concevoir des pièces uniques sur-mesure.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-5 items-start">
          
          {/* Left Column - Coordonnées & Conciergerie */}
          <Reveal className="lg:col-span-2">
            <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[#3B271C]/90 backdrop-blur-2xl border border-[#E6A635]/35 shadow-[0_15px_40px_rgba(0,0,0,0.65)]">
              
              <div>
                <h3 className="font-heading text-xl sm:text-2xl text-[#F7F4EE] mb-1 font-light">Maison Artisanat Aschi</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#F2BD52] font-bold">Atelier &amp; Studio de Création</p>
              </div>

              <div className="h-px w-full bg-[#E6A635]/20" />

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#4D3325] border border-[#E6A635]/35 text-[#F2BD52] shrink-0">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#F2BD52] mb-0.5">L&apos;Atelier Principal</p>
                    <p className="text-xs text-[#EAE4D9] font-light leading-relaxed">9 avenue Roosevelt<br/>La Goulette, Tunis, Tunisie</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#4D3325] border border-[#E6A635]/35 text-[#F2BD52] shrink-0">
                    <Phone className="size-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#F2BD52] mb-0.5">Téléphone &amp; Ligne Directe</p>
                    <a href="tel:+21655743760" className="text-xs text-[#EAE4D9] font-light hover:text-[#F2BD52] transition-colors">+216 55 743 760</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#4D3325] border border-[#E6A635]/35 text-[#F2BD52] shrink-0">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#F2BD52] mb-0.5">Email Conciergerie</p>
                    <p className="text-xs text-[#EAE4D9] font-light">artisanat.aschi@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#4D3325] border border-[#E6A635]/35 text-[#F2BD52] shrink-0">
                    <Clock className="size-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#F2BD52] mb-0.5">Horaires d&apos;Ouverture</p>
                    <p className="text-xs text-[#EAE4D9] font-light">Lun — Sam · 8h30 — 18h00</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp VIP Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/21655743760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider hover:bg-emerald-900/80 transition-all shadow-md"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>Discussion WhatsApp Directe</span>
                </a>
              </div>

            </div>
          </Reveal>

          {/* Right Column - Contact Form */}
          <Reveal delay={100} className="lg:col-span-3">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#3B271C]/90 backdrop-blur-2xl border border-[#E6A635]/35 shadow-[0_15px_40px_rgba(0,0,0,0.65)]">
              
              {sent ? (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <div className="size-16 rounded-full bg-[#E6A635]/20 border-2 border-[#E6A635] flex items-center justify-center">
                    <CheckCircle2 className="size-8 text-[#F2BD52]" />
                  </div>
                  <h3 className="font-heading text-2xl text-[#F7F4EE]">Message Envoyé avec Succès</h3>
                  <p className="text-xs text-[#EAE4D9]/85 max-w-md font-light leading-relaxed">
                    Merci pour votre message. Nos maîtres artisans vous répondront sous 24h ouvrées.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-2 text-xs text-[#F2BD52] underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  
                  {/* Artisan Direct Choice */}
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-2">
                      Destinataire Spécifique (Optionnel)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedArtisan(selectedArtisan === 'Adel' ? null : 'Adel')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedArtisan === 'Adel'
                            ? 'border-[#E6A635] bg-[#E6A635] text-[#1A110B] font-bold shadow-md'
                            : 'border-[#E6A635]/30 bg-[#241812]/80 text-[#EAE4D9] hover:border-[#E6A635]/70'
                        }`}
                      >
                        ✦ Adel Aschi (Sculpteur)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedArtisan(selectedArtisan === 'Ismail' ? null : 'Ismail')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedArtisan === 'Ismail'
                            ? 'border-[#E6A635] bg-[#E6A635] text-[#1A110B] font-bold shadow-md'
                            : 'border-[#E6A635]/30 bg-[#241812]/80 text-[#EAE4D9] hover:border-[#E6A635]/70'
                        }`}
                      >
                        ✦ Ismail Aschi (Projets)
                      </button>
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                        Nom &amp; Prénom *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Ex: Mohamed Ben Salem"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-[#F7F4EE] placeholder:text-[#EAE4D9]/40 text-xs focus:outline-none focus:border-[#E6A635] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="Ex: +216 98 000 000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-[#F7F4EE] placeholder:text-[#EAE4D9]/40 text-xs focus:outline-none focus:border-[#E6A635] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Ex: contact@exemple.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-[#F7F4EE] placeholder:text-[#EAE4D9]/40 text-xs focus:outline-none focus:border-[#E6A635] transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                      Votre Message ou Détails de Votre Demande *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      placeholder="Décrivez votre pièce d'artisanat, vos dimensions, le lieu de livraison..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#241812]/90 border border-[#E6A635]/30 text-[#F7F4EE] placeholder:text-[#EAE4D9]/40 text-xs focus:outline-none focus:border-[#E6A635] transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sheen w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] text-xs font-bold uppercase tracking-[0.18em] shadow-lg transition-all hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="size-3.5 text-[#1A110B]" />
                    <span>{loading ? "Envoi en cours..." : "Envoyer ma demande"}</span>
                  </button>

                </form>
              )}

            </div>
          </Reveal>

        </div>

      </div>
    </section>
  )
}
