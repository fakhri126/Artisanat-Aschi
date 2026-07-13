"use client"

import type React from "react"

import { useState } from "react"
import { Reveal } from "./reveal"
import { MapPin, Phone, Mail, Clock, AlertCircle } from "lucide-react"
import { publicApi } from "@/lib/api"

export function Contact() {
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
    const message = formData.get("message") as string

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
    <section id="contact" className="bg-[var(--walnut-deep)] py-24 text-[var(--ivory)] md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-[var(--gold)]">Contact</p>
            <h2 className="mt-4 font-heading text-4xl leading-tight md:text-6xl text-balance">
              Donnons vie à votre projet
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-[var(--ivory)]/70">
              Chaque création commence par une conversation. Parlez-nous de vos envies, et l&apos;atelier Aschi
              imaginera la pièce qui traversera les générations.
            </p>

            <div className="mt-12 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="font-medium">Atelier &amp; Showroom</p>
                  <p className="text-sm text-[var(--ivory)]/60">Route de Tunis, Sfax — Tunisie</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-sm text-[var(--ivory)]/60">+216 00 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-[var(--ivory)]/60">contact@artisanataschi.tn</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="font-medium">Horaires</p>
                  <p className="text-sm text-[var(--ivory)]/60">Lun — Sam · 8h30 — 18h00</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/21600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Discuter sur WhatsApp
            </a>
          </Reveal>

          <Reveal delay={150}>
            {sent ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-sm border border-[var(--ivory)]/15 bg-[var(--ivory)]/5 p-12 text-center">
                <h3 className="font-heading text-3xl text-[var(--gold)]">Merci.</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-[var(--ivory)]/70">
                  Votre message a été transmis à l&apos;atelier. Hechmi et son équipe vous répondront très
                  prochainement.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 rounded-sm border border-[var(--ivory)]/15 bg-[var(--ivory)]/5 p-8 md:p-10"
              >
                {error && (
                  <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex gap-3 text-sm text-red-300 text-left">
                    <AlertCircle className="size-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm text-[var(--ivory)]/70 text-left">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    className="rounded-sm border border-[var(--ivory)]/20 bg-transparent px-4 py-3 text-[var(--ivory)] outline-none transition-colors focus:border-[var(--gold)] text-left"
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm text-[var(--ivory)]/70 text-left">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="rounded-sm border border-[var(--ivory)]/20 bg-transparent px-4 py-3 text-[var(--ivory)] outline-none transition-colors focus:border-[var(--gold)] text-left"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm text-[var(--ivory)]/70 text-left">
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      className="rounded-sm border border-[var(--ivory)]/20 bg-transparent px-4 py-3 text-[var(--ivory)] outline-none transition-colors focus:border-[var(--gold)] text-left"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm text-[var(--ivory)]/70 text-left">
                    Votre projet
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="resize-none rounded-sm border border-[var(--ivory)]/20 bg-transparent px-4 py-3 text-[var(--ivory)] outline-none transition-colors focus:border-[var(--gold)] text-left"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-full bg-[var(--gold)] px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-[var(--walnut-deep)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
