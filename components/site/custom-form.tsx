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
    <div className="w-full max-w-3xl mx-auto bg-stone-900/60 backdrop-blur-md rounded-2xl border border-gold/20 p-6 md:p-10 shadow-2xl text-ivory">
      
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gold/80 mb-3 font-semibold">
          <span>Création Sur Mesure</span>
          <span>Étape {step} sur 4</span>
        </div>
        <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gold"
            initial={{ width: '25%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex gap-3 text-sm text-red-300 items-start">
          <AlertCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {sent ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center mb-6">
            <Check className="size-8" />
          </div>
          <h3 className="font-heading text-3xl text-gold mb-4">Demande transmise</h3>
          <p className="text-ivory/70 max-w-md leading-relaxed font-light mb-8">
            Hechmi, Adel et l&apos;équipe de l&apos;Atelier Aschi ont bien reçu votre projet de création sur-mesure. Nous allons étudier vos choix et vous recontacter par e-mail ou téléphone très rapidement.
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
            className="rounded-full border border-gold px-6 py-3 text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-walnut transition-colors"
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
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="font-heading text-2xl text-white mb-2 flex items-center gap-2">
                    <Hammer className="size-5 text-gold" /> Quelle pièce souhaitez-vous créer ?
                  </h3>
                  <p className="text-sm text-ivory/50 font-light">Sélectionnez le type d&apos;ouvrage pour votre demeure.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TYPES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                        formData.type === t.id
                          ? 'border-gold bg-gold/5 shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <h4 className="font-heading text-lg text-white font-medium">{t.label}</h4>
                      <p className="text-xs text-ivory/60 leading-relaxed font-light mt-3">{t.desc}</p>
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
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="font-heading text-2xl text-white mb-2 flex items-center gap-2">
                    <Sparkles className="size-5 text-gold" /> Quelle essence de bois préférez-vous ?
                  </h3>
                  <p className="text-sm text-ivory/50 font-light">Le choix de la matière détermine la couleur naturelle et le caractère de la pièce.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  {WOODS.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setFormData({ ...formData, wood: w.id })}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                        formData.wood === w.id
                          ? 'border-gold bg-gold/5 shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <h4 className="font-heading text-lg text-white font-medium">{w.label}</h4>
                        <span className="text-[9px] uppercase tracking-wider text-gold/80 bg-gold/10 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                          Densité : {w.density}
                        </span>
                      </div>
                      <p className="text-xs text-ivory/60 leading-relaxed font-light mt-4">{w.desc}</p>
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
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="font-heading text-2xl text-white mb-2">Style &amp; Dimensions</h3>
                  <p className="text-sm text-ivory/50 font-light">Déterminez l&apos;esthétique générale de l&apos;ouvrage.</p>
                </div>
                
                <div className="flex flex-col gap-6">
                  {/* Style of sculpture */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs uppercase tracking-wider text-gold font-semibold">Style de Sculpture</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {STYLES.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setFormData({ ...formData, style: s.id })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 text-left ${
                            formData.style === s.id
                              ? 'border-gold bg-gold/5 shadow-[0_4px_12px_rgba(212,175,55,0.1)]'
                              : 'border-white/10 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <h5 className="font-heading text-base text-white font-medium">{s.label}</h5>
                          <p className="text-xs text-ivory/50 font-light mt-2">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dimensions" className="text-xs uppercase tracking-wider text-gold font-semibold text-left">
                      Dimensions Approximatives (ex: L 180 x H 90 x P 45 cm)
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      placeholder="Laisser vide si vous ne savez pas"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-gold transition-colors text-left"
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
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="font-heading text-2xl text-white mb-2">Finalisons votre projet</h3>
                  <p className="text-sm text-ivory/50 font-light">Saisissez vos coordonnées pour recevoir votre étude gratuite.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-xs uppercase tracking-wider text-gold font-semibold text-left">Nom complet *</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-gold transition-colors text-left"
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs uppercase tracking-wider text-gold font-semibold text-left">Email *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-gold transition-colors text-left"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-xs uppercase tracking-wider text-gold font-semibold text-left">Téléphone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-gold transition-colors text-left"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs uppercase tracking-wider text-gold font-semibold text-left">Détails ou demandes particulières</label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-gold transition-colors text-left"
                      placeholder="Décrivez votre projet..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-10 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || loading}
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-full transition-colors ${
                step === 1
                  ? 'text-ivory/20 cursor-not-allowed'
                  : 'text-ivory/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="size-3.5" /> Précédent
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold py-3 px-6 bg-gold text-walnut rounded-full hover:scale-[1.03] transition-all"
              >
                Suivant <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold py-3 px-8 bg-gold text-walnut rounded-full hover:scale-[1.03] transition-all disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Soumettre le projet'}
              </button>
            )}
          </div>
          
        </form>
      )}

    </div>
  )
}
