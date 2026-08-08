"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Reveal } from "./reveal"
import { MapPin, Phone, Mail, Clock, AlertCircle, ArrowRight, PenTool, Sparkles, Upload, CheckCircle2, Image as ImageIcon, X, ChevronRight } from "lucide-react"
import { publicApi } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const ARTISANS = [
  { id: 'Adel', label: 'Adel', role: 'Création & Sur-Mesure', icon: '🧑‍🎨' },
  { id: 'Ismail', label: 'Ismail', role: 'Technique & Fabrication', icon: '🛠️' },
  { id: "L'Atelier", label: "L'Atelier", role: 'Demande générale', icon: '🏛️' },
]

const PROJECT_TYPES = ['Mobilier', 'Miroir', 'Restauration', 'Bijoux de porte', 'Autre']

export function Contact() {
  const [selectedArtisan, setSelectedArtisan] = useState<string>("L'Atelier")
  const [projectType, setProjectType] = useState<string>('Mobilier')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("name") as string
    const email = formData.get("email") as string
    const phoneNumber = formData.get("phone") as string
    const rawMessage = formData.get("message") as string
    
    const fileInfo = attachedFiles.length > 0 ? `\n\n[INFO : ${attachedFiles.length} photo(s) ou croquis sont à récupérer auprès du client pour ce projet.]` : ''
    const message = `[À l'attention de : ${selectedArtisan}]\n[Projet : ${projectType}]\n\n${rawMessage}${fileInfo}`

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
    <section id="contact" className="min-h-screen bg-[#FAF7F2] text-[#3A2A21] flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* LEFT SIDE: Visuals & Contact Info (Split Screen) */}
      <div className="lg:w-5/12 xl:w-1/2 relative min-h-[400px] lg:min-h-screen flex flex-col justify-end p-8 lg:p-12 xl:p-16">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#2C1E16]">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="/artisanat.jpg" 
            alt="L'Atelier Aschi" 
            className="size-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-[#1a1512]/60 to-[#1a1512]/10" />
        </div>

        <div className="relative z-10 w-full max-w-lg mx-auto lg:mx-0">
          <Reveal>
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="size-4 text-[#E8DCCB]" />
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#E8DCCB] font-bold">Maison fondée en 1960</span>
            </div>
            <h2 className="font-serif italic text-4xl md:text-5xl text-white mb-8 leading-tight">
              Donnons vie à vos idées.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2 text-[#DFD3C3] mt-8">
              
              <div className="space-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-full bg-white/10">
                    <MapPin className="size-4" />
                  </div>
                  <p className="font-semibold text-xs uppercase tracking-wider">L'Atelier</p>
                </div>
                <p className="text-sm font-light leading-relaxed pl-11 opacity-80">9 avenue roosvelt<br/>La Goulette, Tunisie</p>
              </div>

              <div className="space-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-full bg-white/10">
                    <Clock className="size-4" />
                  </div>
                  <p className="font-semibold text-xs uppercase tracking-wider">Horaires</p>
                </div>
                <p className="text-sm font-light leading-relaxed pl-11 opacity-80">Lun — Sam<br/>8h30 — 18h00</p>
              </div>

              <div className="space-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-full bg-white/10">
                    <Phone className="size-4" />
                  </div>
                  <p className="font-semibold text-xs uppercase tracking-wider">Téléphone</p>
                </div>
                <p className="text-sm font-light leading-relaxed pl-11 opacity-80">+216 55 743 760</p>
              </div>

              <div className="space-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-full bg-white/10">
                    <Mail className="size-4" />
                  </div>
                  <p className="font-semibold text-xs uppercase tracking-wider">Email</p>
                </div>
                <p className="text-sm font-light leading-relaxed pl-11 opacity-80 break-words">artisanat.aschi<br/>@gmail.com</p>
              </div>

            </div>
          </Reveal>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="lg:w-7/12 xl:w-1/2 flex flex-col justify-center px-6 py-12 md:p-12 xl:p-16 bg-white relative max-h-screen overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-2xl mx-auto">
          
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="size-24 rounded-full bg-[#E8DCCB]/20 border-2 border-[#E8DCCB] flex items-center justify-center mb-8">
                  <CheckCircle2 className="size-10 text-[#C17D59]" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-[#2C1E16] mb-4">Message Transmis avec Succès</h3>
                <p className="text-[#5A453A] mb-10 max-w-md leading-relaxed">
                  Merci pour votre message. <strong>{selectedArtisan}</strong> reviendra vers vous très rapidement pour discuter de votre projet.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="rounded-full bg-[#FAF7F2] text-[#3A2A21] hover:bg-[#E8DCCB] px-8 py-4 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Nouvelle demande
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-10"
              >
                
                {/* 1. Who to contact */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#C17D59] font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded-full bg-[#C17D59] text-white">1</span>
                    À qui s'adresse votre demande ?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ARTISANS.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setSelectedArtisan(a.id)}
                        className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                          selectedArtisan === a.id
                            ? 'border-[#C17D59] bg-[#C17D59]/5 shadow-[0_0_15px_rgba(193,125,89,0.15)] scale-[1.02]'
                            : 'border-border bg-transparent hover:border-[#E8DCCB] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="text-2xl mb-2 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">{a.icon}</span>
                        <span className="font-serif text-lg text-[#2C1E16]">{a.label}</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{a.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Project Type */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#C17D59] font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded-full bg-[#C17D59] text-white">2</span>
                    Quel est le type de projet ?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setProjectType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                          projectType === type 
                            ? 'border-[#3A2A21] bg-[#3A2A21] text-white shadow-md' 
                            : 'border-border bg-white text-muted-foreground hover:border-[#E8DCCB] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Details */}
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#C17D59] font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded-full bg-[#C17D59] text-white">3</span>
                    Vos coordonnées et détails
                  </label>
                  
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-sm text-red-600">
                      <AlertCircle className="size-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 font-semibold">Votre nom</label>
                      <input
                        id="name"
                        name="name"
                        required
                        className="w-full rounded-2xl border border-border bg-[#FAF7F2]/50 px-5 py-4 text-sm text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white focus:shadow-[0_0_15px_rgba(193,125,89,0.1)]"
                        placeholder="Ex: Sophie Dubois"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 font-semibold">Téléphone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full rounded-2xl border border-border bg-[#FAF7F2]/50 px-5 py-4 text-sm text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white focus:shadow-[0_0_15px_rgba(193,125,89,0.1)]"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 font-semibold">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-2xl border border-border bg-[#FAF7F2]/50 px-5 py-4 text-sm text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white focus:shadow-[0_0_15px_rgba(193,125,89,0.1)]"
                      placeholder="sophie@exemple.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 font-semibold">Votre message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-[#FAF7F2]/50 px-5 py-4 text-sm text-[#2C1E16] outline-none transition-colors focus:border-[#C17D59] focus:bg-white focus:shadow-[0_0_15px_rgba(193,125,89,0.1)] resize-none"
                      placeholder="Décrivez votre idée, les dimensions souhaitées, les matériaux..."
                    />
                  </div>

                  {/* File Upload UI */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] uppercase tracking-wider text-[#3A2A21] font-semibold">Pièces jointes (Optionnel)</label>
                      <span className="text-[10px] text-muted-foreground/80 font-medium">Photos, croquis, inspirations...</span>
                    </div>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed border-[#E8DCCB] hover:border-[#C17D59] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
                    >
                      <div className="p-3 rounded-full bg-white border border-[#E8DCCB] group-hover:border-[#C17D59] group-hover:scale-110 transition-all shadow-sm">
                        <Upload className="size-5 text-[#C17D59]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#2C1E16]">Cliquez pour ajouter des fichiers</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">JPEG, PNG, PDF</p>
                      </div>
                      <input 
                        type="file" 
                        multiple
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                    </div>

                    {/* File Previews */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {attachedFiles.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white border border-[#E8DCCB] rounded-full pl-2 pr-1 py-1 shadow-sm">
                            <div className="p-1 rounded-full bg-[#FAF7F2]">
                              <ImageIcon className="size-3 text-[#C17D59]" />
                            </div>
                            <span className="text-[10px] font-semibold text-[#2C1E16] max-w-[100px] truncate uppercase tracking-wider">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeFile(i)}
                              className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-full transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-8 border-t border-[#E8DCCB]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* How it works mini guide */}
                  <div className="flex items-center gap-4 text-xs font-medium text-[#5A453A]">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="size-6 rounded-full bg-[#E8DCCB]/30 flex items-center justify-center text-[10px] font-bold text-[#C17D59]">1</div>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Demande</span>
                    </div>
                    <ChevronRight className="size-3 text-border" />
                    <div className="flex flex-col gap-1 items-center">
                      <div className="size-6 rounded-full bg-[#E8DCCB]/30 flex items-center justify-center text-[10px] font-bold text-[#C17D59]">2</div>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Échange</span>
                    </div>
                    <ChevronRight className="size-3 text-border" />
                    <div className="flex flex-col gap-1 items-center">
                      <div className="size-6 rounded-full bg-[#E8DCCB]/30 flex items-center justify-center text-[10px] font-bold text-[#C17D59]">3</div>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Création</span>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#3A2A21] hover:bg-[#C17D59] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all shadow-xl hover:shadow-[0_10px_20px_rgba(193,125,89,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none group"
                  >
                    {loading ? (
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Envoyer ma demande
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </section>
  )
}
