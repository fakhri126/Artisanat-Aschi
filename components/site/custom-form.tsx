'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hammer, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react'
import { publicApi } from '@/lib/api'

const TYPES = [
  { id: 'porte', label: 'Porte Sculptée', desc: 'Porte d\'entrée artistique ou d\'intérieur en bois massif.' },
  { id: 'buffet', label: 'Buffet & Commode', desc: 'Mobilier de rangement aux façades sculptées.' },
  { id: 'miroir', label: 'Miroir de Luxe', desc: 'Cadre de miroir d\'art sculpté et doré.' },
  { id: 'table', label: 'Table d\'Exception', desc: 'Table à manger ou table basse de caractère.' },
  { id: 'autre', label: 'Décoration / Autre', desc: 'Luminaires, coffres ou pièces personnalisées.' }
]

const WOODS = [
  { id: 'noyer', label: 'Noyer Massif', desc: 'Foncé, précieux et noble. Le choix signature de l\'atelier.', density: 'Très élevée' },
  { id: 'olivier', label: 'Olivier Sauvage', desc: 'Veines contrastées et fauves, très rustique et authentique.', density: 'Moyenne/Élevée' },
  { id: 'chene', label: 'Chêne Noble', desc: 'Teinte claire, très robuste, résistant aux épreuves du temps.', density: 'Élevée' }
]

const STYLES = [
  { id: 'arabesque', label: 'Arabesque / Traditionnel', desc: 'Sculptures florales et entrelacs fins inspirés du patrimoine.' },
  { id: 'geometrique', label: 'Géométrique Moderne', desc: 'Lignes épurées, formes facettées et reliefs contemporains.' },
  { id: 'epure', label: 'Minimaliste', desc: 'Mise en valeur pure de la matière brute avec peu d\'ornements.' }
]

export function CustomFormWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    type: 'porte',
    wood: 'noyer',
    style: 'arabesque',
    dimensions: '',
    fullName: '',
    email: '',
    phone: '',
    message: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4))
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Construct the formatted project summary to pass to the API
    const formattedMessage = `
[DEMANDE DE CRÉATION SUR MESURE]
Type de création : ${TYPES.find(t => t.id === formData.type)?.label || formData.type}
Essence de bois : ${WOODS.find(w => w.id === formData.wood)?.label || formData.wood}
Style de sculpture : ${STYLES.find(s => s.id === formData.style)?.label || formData.style}
Dimensions souhaitées : ${formData.dimensions || 'Non spécifiées'}

Détails complémentaires :
${formData.message || 'Aucun détail supplémentaire fourni.'}
`.trim()

    try {
      await publicApi.submitQuoteRequest({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        message: formattedMessage
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de votre demande.')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#3B271C]/95 backdrop-blur-2xl rounded-3xl border border-[#E6A635]/40 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-[#F7F4EE]">
      
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs uppercase tracking-widest text-[#F2BD52] mb-3 font-bold">
          <span>Création Sur-Mesure 3D</span>
          <span>Étape {step} sur 4</span>
        </div>
        <div className="w-full h-1.5 bg-[#241812] rounded-full overflow-hidden border border-[#E6A635]/25">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#F3C45E] to-[#E6A635] shadow-[0_0_10px_#E6A635]"
            initial={{ width: '25%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 flex gap-3 text-xs text-red-300 items-start">
          <AlertCircle className="size-4.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {sent ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 flex flex-col items-center"
        >
          <div className="size-16 rounded-full bg-[#E6A635]/20 border-2 border-[#E6A635] text-[#F2BD52] flex items-center justify-center mb-6">
            <Check className="size-8" />
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl text-gold-gradient mb-3">Demande transmise avec succès</h3>
          <p className="text-[#EAE4D9]/85 text-xs sm:text-sm max-w-md leading-relaxed font-light mb-8">
            Adel, Ismail et l&apos;équipe de l&apos;Atelier Aschi ont bien reçu votre projet. Nous allons étudier vos choix et vous recontacter avec une proposition et des plans 3D sous 24h ouvrées.
          </p>
          <button
            onClick={() => {
              setSent(false)
              setStep(1)
              setFormData({
                type: 'porte',
                wood: 'noyer',
                style: 'arabesque',
                dimensions: '',
                fullName: '',
                email: '',
                phone: '',
                message: ''
              })
            }}
            className="btn-sheen rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] px-7 py-3.5 text-xs uppercase tracking-widest text-[#1A110B] font-bold shadow-lg cursor-pointer"
          >
            Faire une autre demande
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Type of piece */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5 text-left"
              >
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-[#F7F4EE] mb-1.5 flex items-center gap-2">
                    <Hammer className="size-5 text-[#F2BD52]" /> Quelle pièce souhaitez-vous créer ?
                  </h3>
                  <p className="text-xs text-[#EAE4D9]/80 font-light">Sélectionnez le type d&apos;ouvrage pour votre intérieur.</p>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TYPES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[130px] ${
                        formData.type === t.id
                          ? 'border-[#E6A635] bg-[#E6A635] text-[#1A110B] shadow-[0_4px_15px_rgba(230,166,53,0.35)] scale-[1.02]'
                          : 'border-[#E6A635]/25 bg-[#241812]/80 text-[#F7F4EE] hover:border-[#E6A635]/60 hover:bg-[#2E1E16]'
                      }`}
                    >
                      <h4 className={`font-heading text-base font-medium ${formData.type === t.id ? 'text-[#1A110B] font-bold' : 'text-[#F7F4EE]'}`}>{t.label}</h4>
                      <p className={`text-[11px] leading-relaxed font-light mt-2 ${formData.type === t.id ? 'text-[#1A110B]/85' : 'text-[#EAE4D9]/75'}`}>{t.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Wood Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5 text-left"
              >
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-[#F7F4EE] mb-1.5 flex items-center gap-2">
                    <Sparkles className="size-5 text-[#F2BD52]" /> Quelle essence de bois préférez-vous ?
                  </h3>
                  <p className="text-xs text-[#EAE4D9]/80 font-light">Le choix de la matière détermine la couleur naturelle et la patine de la pièce.</p>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  {WOODS.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setFormData({ ...formData, wood: w.id })}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                        formData.wood === w.id
                          ? 'border-[#E6A635] bg-[#E6A635] text-[#1A110B] shadow-[0_4px_15px_rgba(230,166,53,0.35)] scale-[1.02]'
                          : 'border-[#E6A635]/25 bg-[#241812]/80 text-[#F7F4EE] hover:border-[#E6A635]/60 hover:bg-[#2E1E16]'
                      }`}
                    >
                      <div>
                        <h4 className={`font-heading text-base font-medium ${formData.wood === w.id ? 'text-[#1A110B] font-bold' : 'text-[#F7F4EE]'}`}>{w.label}</h4>
                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 inline-block ${formData.wood === w.id ? 'bg-[#1A110B]/20 text-[#1A110B] font-bold' : 'bg-[#241812] text-[#F2BD52] border border-[#E6A635]/30'}`}>
                          Densité : {w.density}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed font-light mt-3 ${formData.wood === w.id ? 'text-[#1A110B]/85' : 'text-[#EAE4D9]/75'}`}>{w.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Style and Dimensions */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5 text-left"
              >
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-[#F7F4EE] mb-1.5">Style &amp; Dimensions</h3>
                  <p className="text-xs text-[#EAE4D9]/80 font-light">Déterminez l&apos;esthétique générale de l&apos;ouvrage.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* Style of sculpture */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">Style de Sculpture</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {STYLES.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setFormData({ ...formData, style: s.id })}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-left ${
                            formData.style === s.id
                              ? 'border-[#E6A635] bg-[#E6A635] text-[#1A110B] shadow-[0_4px_12px_rgba(230,166,53,0.3)]'
                              : 'border-[#E6A635]/25 bg-[#241812]/80 text-[#F7F4EE] hover:border-[#E6A635]/60'
                          }`}
                        >
                          <h5 className={`font-heading text-sm font-medium ${formData.style === s.id ? 'text-[#1A110B] font-bold' : 'text-[#F7F4EE]'}`}>{s.label}</h5>
                          <p className={`text-[10.5px] font-light mt-1.5 ${formData.style === s.id ? 'text-[#1A110B]/85' : 'text-[#EAE4D9]/75'}`}>{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="dimensions" className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold text-left">
                      Dimensions Approximatives (ex: L 180 x H 90 x P 45 cm)
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      placeholder="Laisser vide si vous souhaitez notre conseil"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full rounded-xl border border-[#E6A635]/30 bg-[#241812]/90 px-4 py-3 outline-none focus:border-[#E6A635] transition-colors text-left text-xs text-[#F7F4EE] placeholder:text-[#EAE4D9]/40"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Personal Info & Submission */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 text-left"
              >
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-[#F7F4EE] mb-1.5">Finalisons votre projet</h3>
                  <p className="text-xs text-[#EAE4D9]/80 font-light">Saisissez vos coordonnées pour recevoir votre étude 3D et votre devis.</p>
                </div>
                
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="fullName" className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold text-left">Nom complet *</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Ex: Mohamed Trabelsi"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="rounded-xl border border-[#E6A635]/30 bg-[#241812]/90 px-4 py-2.5 outline-none focus:border-[#E6A635] transition-colors text-left text-xs text-[#F7F4EE] placeholder:text-[#EAE4D9]/40"
                    />
                  </div>
                  
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold text-left">Email *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="Ex: contact@exemple.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl border border-[#E6A635]/30 bg-[#241812]/90 px-4 py-2.5 outline-none focus:border-[#E6A635] transition-colors text-left text-xs text-[#F7F4EE] placeholder:text-[#EAE4D9]/40"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="phone" className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold text-left">Téléphone *</label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="Ex: +216 55 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl border border-[#E6A635]/30 bg-[#241812]/90 px-4 py-2.5 outline-none focus:border-[#E6A635] transition-colors text-left text-xs text-[#F7F4EE] placeholder:text-[#EAE4D9]/40"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="message" className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold text-left">Détails ou demandes particulières</label>
                    <textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="resize-none rounded-xl border border-[#E6A635]/30 bg-[#241812]/90 px-4 py-2.5 outline-none focus:border-[#E6A635] transition-colors text-left text-xs text-[#F7F4EE] placeholder:text-[#EAE4D9]/40"
                      placeholder="Décrivez vos préférences de patine, lieu de livraison..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 border-t border-[#E6A635]/20 pt-5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || loading}
              className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-full transition-colors cursor-pointer ${
                step === 1
                  ? 'text-[#EAE4D9]/30 cursor-not-allowed'
                  : 'text-[#EAE4D9]/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="size-3.5" /> Précédent
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-sheen inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-3 px-7 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] rounded-full hover:scale-[1.02] transition-all shadow-md cursor-pointer"
              >
                <span>Suivant</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-sheen inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-3 px-8 bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] rounded-full hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Envoi en cours...' : 'Demander mon Devis 3D'}</span>
              </button>
            )}
          </div>
          
        </form>
      )}

    </div>
  )
}
