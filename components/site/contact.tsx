"use client"

import type React from "react"
import { useState } from "react"
import { Reveal } from "./reveal"
import { MapPin, Phone, Mail, Clock, AlertCircle, ChevronLeft, ArrowRight, PenTool, Sparkles } from "lucide-react"
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
    
    const message = `[À l'attention de ${selectedArtisan}]\n\n${rawMessage}`

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
    <section id="contact" className="bg-transparent text-[#3A2A21] min-h-[90vh] flex flex-col relative overflow-hidden">
      
      {/* Soft Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E8DCCB]/50 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DFD3C3]/50 rounded-[60%_40%_30%_70%/50%_60%_40%_50%] blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!selectedArtisan ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col w-full h-full relative z-10"
          >
            <div className="text-center pt-24 pb-12 px-6">
              <Reveal>
                <div className="inline-flex items-center justify-center gap-3 mb-6">
                  <PenTool className="size-5 text-[#C17D59]" />
                  <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#C17D59] font-bold">Nos Experts</span>
                  <Sparkles className="size-5 text-[#C17D59]" />
                </div>
                <h2 className="font-serif italic text-5xl md:text-6xl text-[#2C1E16] mb-4">
                  Avec qui souhaitez-vous discuter ?
                </h2>
                <p className="text-[#5A453A] max-w-xl mx-auto font-light text-sm md:text-base leading-relaxed">
                  Choisissez votre interlocuteur privilégié pour vous accompagner dans votre projet sur-mesure. Une approche humaine et artisanale avant tout.
                </p>
              </Reveal>
            </div>

            <div className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto px-6 md:px-12 gap-8 pb-24">
              {/* Adel Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                onClick={() => setSelectedArtisan('Adel')}
                className="flex-1 group relative rounded-[3rem] overflow-hidden cursor-pointer bg-white border border-[#E8DCCB] shadow-[0_20px_50px_rgba(58,42,33,0.05)] hover:shadow-[0_30px_60px_rgba(193,125,89,0.15)] transition-all duration-500 flex flex-col p-12 items-center text-center justify-center"
              >
                <div className="w-24 h-24 rounded-full border-4 border-[#FAF7F2] bg-white mb-6 flex items-center justify-center shadow-md">
                  <span className="font-serif text-5xl text-[#C17D59]">A</span>
                </div>
                <h3 className="font-serif text-4xl text-[#2C1E16] mb-2">Adel</h3>
                <p className="text-[#C17D59] text-xs uppercase tracking-[0.15em] mb-6 font-bold">Création & Sur-Mesure</p>
                <p className="text-[#5A453A] font-light mb-10 leading-relaxed max-w-sm">
                  Discutez de vos idées les plus folles et laissez Adel concevoir le design parfait pour votre intérieur.
                </p>
                <div className="inline-flex items-center justify-center gap-2 text-[#8C7A6B] group-hover:text-[#C17D59] transition-colors uppercase text-xs tracking-widest font-bold">
                  Écrire à Adel <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>

              {/* Ismail Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                onClick={() => setSelectedArtisan('Ismail')}
                className="flex-1 group relative rounded-[3rem] overflow-hidden cursor-pointer bg-white border border-[#E8DCCB] shadow-[0_20px_50px_rgba(58,42,33,0.05)] hover:shadow-[0_30px_60px_rgba(193,125,89,0.15)] transition-all duration-500 flex flex-col p-12 items-center text-center justify-center"
              >
                <div className="w-24 h-24 rounded-full border-4 border-[#FAF7F2] bg-white mb-6 flex items-center justify-center shadow-md">
                  <span className="font-serif text-5xl text-[#C17D59]">I</span>
                </div>
                <h3 className="font-serif text-4xl text-[#2C1E16] mb-2">Ismail</h3>
                <p className="text-[#C17D59] text-xs uppercase tracking-[0.15em] mb-6 font-bold">Technique & Conception</p>
                <p className="text-[#5A453A] font-light mb-10 leading-relaxed max-w-sm">
                  Des questions sur la cuisson, les matériaux ou les spécificités techniques ? Ismail est là pour vous guider.
                </p>
                <div className="inline-flex items-center justify-center gap-2 text-[#8C7A6B] group-hover:text-[#C17D59] transition-colors uppercase text-xs tracking-widest font-bold">
                  Écrire à Ismail <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl mx-auto px-6 py-20 relative z-10"
          >
            <button 
              onClick={() => { setSelectedArtisan(null); setSent(false); }}
              className="group mb-10 inline-flex items-center gap-2 text-[#8C7A6B] hover:text-[#C17D59] transition-colors"
            >
              <div className="p-2 rounded-full border border-[#E8DCCB] bg-white group-hover:border-[#C17D59] transition-colors shadow-sm">
                <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold">Retour aux artisans</span>
            </button>

            <div className="grid gap-12 lg:grid-cols-5">
              
              {/* Left Column - Contact Info */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <div className="mb-10">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#C17D59] mb-2 font-bold">
                    En discussion avec
                  </p>
                  <h2 className="font-serif text-5xl md:text-6xl text-[#2C1E16]">
                    {selectedArtisan}
                  </h2>
                </div>

                <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-white border border-[#E8DCCB] shadow-[0_10px_40px_rgba(58,42,33,0.03)]">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[#FAF7F2]">
                      <MapPin className="size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C1E16] mb-1">L'Atelier</p>
                      <p className="text-sm text-[#5A453A] leading-relaxed">9 avenue roosvelt<br/>La Goulette, Tunisie</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[#FAF7F2]">
                      <Phone className="size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C1E16] mb-1">Téléphone</p>
                      <p className="text-sm text-[#5A453A]">+216 55 743 760</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[#FAF7F2]">
                      <Mail className="size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C1E16] mb-1">Email</p>
                      <p className="text-sm text-[#5A453A]">artisanat.aschi@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[#FAF7F2]">
                      <Clock className="size-5 text-[#C17D59]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C1E16] mb-1">Horaires</p>
                      <p className="text-sm text-[#5A453A]">Lun — Sam · 8h30 — 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-3">
                {sent ? (
                  <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-[3rem] border border-[#E8DCCB] bg-white p-12 text-center shadow-[0_20px_50px_rgba(58,42,33,0.05)]">
                    <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#E8DCCB] flex items-center justify-center mb-6 shadow-sm">
                      <Sparkles className="size-8 text-[#C17D59]" />
                    </div>
                    <h3 className="font-serif text-3xl text-[#2C1E16] mb-4">Message Transmis</h3>
                    <p className="max-w-md leading-relaxed text-[#5A453A]">
                      C'est un plaisir de vous lire. {selectedArtisan} a bien reçu votre demande et vous répondra très rapidement pour discuter de votre projet.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 rounded-[3rem] border border-[#E8DCCB] bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(58,42,33,0.05)]"
                  >
                    <div className="mb-2">
                      <h3 className="text-3xl font-serif text-[#2C1E16] mb-2">Décrivez votre idée</h3>
                      <p className="text-[#8C7A6B]">Un croquis en tête ? Des dimensions précises ? Dites-nous tout.</p>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-sm text-red-600">
                        <AlertCircle className="size-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-[0.1em] text-[#8C7A6B] font-bold ml-2">
                        Votre nom
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        className="rounded-2xl border border-[#E8DCCB] bg-[#FAF7F2] px-5 py-4 text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white"
                        placeholder="Ex: Sophie Dubois"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[10px] uppercase tracking-[0.1em] text-[#8C7A6B] font-bold ml-2">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="rounded-2xl border border-[#E8DCCB] bg-[#FAF7F2] px-5 py-4 text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white"
                          placeholder="sophie@exemple.com"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.1em] text-[#8C7A6B] font-bold ml-2">
                          Téléphone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          required
                          className="rounded-2xl border border-[#E8DCCB] bg-[#FAF7F2] px-5 py-4 text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white"
                          placeholder="+33 6 ..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-[10px] uppercase tracking-[0.1em] text-[#8C7A6B] font-bold ml-2">
                        Votre message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        className="resize-none rounded-2xl border border-[#E8DCCB] bg-[#FAF7F2] px-5 py-4 text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white"
                        placeholder="Racontez-nous ce que vous imaginez..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-[#2C1E16] px-6 py-4 text-sm font-medium tracking-wide text-white transition-all hover:bg-[#C17D59] hover:shadow-lg disabled:opacity-50"
                      >
                        {loading ? "Envoi..." : `Écrire à ${selectedArtisan}`}
                      </button>
                      
                      <a
                        href="https://wa.me/21655743760"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-[#25D366] px-6 py-4 text-sm font-medium tracking-wide text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white shadow-sm hover:shadow-lg"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Par WhatsApp
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
