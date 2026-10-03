'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Palette, Plus, X, Image as ImageIcon, Upload } from 'lucide-react'
import { ImageVariant, ColorSwatch } from '@/lib/api'

// ─── Preset colour swatches ──────────────────────────────────────────────────
export const COLOR_PRESETS = [
  { label: 'Original',      hex: null },
  { label: 'Blanc',         hex: '#FFFFFF' },
  { label: 'Noir',          hex: '#1A1A1A' },
  { label: 'Noyer',         hex: '#5C3317' },
  { label: 'Bleu',          hex: '#2D5F8A' },
  { label: 'Or',            hex: '#C9A84C' },
  { label: 'Naturel',       hex: '#C4A882' },
  { label: 'Vert Olivier',  hex: '#4A5E3A' },
  { label: 'Bordeaux',      hex: '#7B2D3E' },
  { label: 'Autre…',        hex: null },
]

export const QUICK_DIMENSIONS = [
  { label: 'Petit', desc: '< 80 cm', value: 'Petit (< 80 cm)' },
  { label: 'Moyen', desc: '80–150 cm', value: 'Moyen (80–150 cm)' },
  { label: 'Grand', desc: '> 150 cm', value: 'Grand (> 150 cm)' },
  { label: 'Sur-mesure', desc: 'Personnalisé', value: 'Sur-mesure' },
]

export const ALL_PRESETS = [
  ...COLOR_PRESETS.filter(p => p.label !== 'Autre…'),
  { label: 'Petit', hex: null },
  { label: 'Moyen', hex: null },
  { label: 'Grand', hex: null },
  { label: 'Autre…', hex: null }
]

export const hexFromLabel = (label: string | null | undefined): string => {
  if (!label) return '#C4A882'
  const norm = label.toLowerCase()
  if (norm.includes('blanc')) return '#FFFFFF'
  if (norm.includes('noir')) return '#1A1A1A'
  if (norm.includes('noyer') || norm.includes('marron')) return '#5C3317'
  if (norm.includes('bleu')) return '#2D5F8A'
  if (norm.includes('or') || norm.includes('dore')) return '#C9A84C'
  if (norm.includes('vert')) return '#4A5E3A'
  if (norm.includes('bordeaux')) return '#7B2D3E'
  return '#C4A882'
}

// ─── Image Variant Manager Component ─────────────────────────────────────────
export default function ImageVariantManager({
  variants,
  onChange,
  uploadFn,
  colors = [],
}: {
  variants: ImageVariant[]
  onChange: (variants: ImageVariant[]) => void
  uploadFn: (file: File) => Promise<{ url: string }>
  colors?: ColorSwatch[]
}) {
  const [uploading, setUploading] = useState<number | null>(null)
  const [customLabels, setCustomLabels] = useState<Record<number, string>>({})

  const activePresets = useMemo(() => {
    const list: { label: string; hex: string | null }[] = [
      { label: 'Original', hex: null }
    ]
    if (colors && colors.length > 0) {
      colors.forEach(c => list.push({ label: c.name, hex: c.hex }))
    } else {
      COLOR_PRESETS.filter(p => p.label !== 'Original' && p.label !== 'Autre…').forEach(p => list.push(p))
    }
    list.push(
      { label: 'Petit', hex: null },
      { label: 'Moyen', hex: null },
      { label: 'Grand', hex: null },
      { label: 'Autre…', hex: null }
    )
    return list
  }, [colors])

  const addVariant = () => {
    onChange([...variants, { imageUrl: '', colorLabel: null }])
  }

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return
    onChange(variants.filter((_, i) => i !== idx))
  }

  const updateUrl = (idx: number, url: string) => {
    const next = [...variants]
    next[idx] = { ...next[idx], imageUrl: url }
    onChange(next)
  }

  const updateLabel = (idx: number, label: string | null) => {
    const next = [...variants]
    next[idx] = { ...next[idx], colorLabel: label }
    onChange(next)
  }

  const handleFileUpload = async (idx: number, file: File) => {
    try {
      setUploading(idx)
      const res = await uploadFn(file)
      if (res && res.url) {
        updateUrl(idx, res.url)
      }
    } catch (e) {
      alert('Erreur lors du téléversement.')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#3A2E24]">
        <div>
          <h3 className="text-sm font-bold text-[#F5F0E8] uppercase tracking-wider flex items-center gap-2">
            <Palette className="size-4 text-[#C8794D]" />
            <span>Nuancier &amp; Variantes Photos du Modèle</span>
          </h3>
          <p className="text-xs text-[#D9C8AE]/70">
            La 1ère photo est l&apos;originale d&apos;atelier. Ajoutez d&apos;autres photos ou rendus de teintes (Bleu, Noir, Blanc, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8794D] hover:bg-[#B5673C] text-white text-xs font-bold uppercase tracking-wider shadow hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[3]" /> Ajouter une photo
        </button>
      </div>

      <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
        {variants.map((v, idx) => {
          const isOriginal = idx === 0
          const isCustom = v.colorLabel && !activePresets.slice(0, -1).some(p => p.label === v.colorLabel)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 transition-all ${
                isOriginal
                  ? 'border-[#C8794D]/40 bg-[#2A211A] shadow-md'
                  : 'border-[#3A2E24] bg-[#211A15]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isOriginal 
                      ? 'bg-[#C8794D] text-white' 
                      : 'bg-white/10 text-[#D9C8AE]'
                  }`}>
                    {isOriginal ? 'Photo Principale (Original Atelier)' : `Variante ${idx + 1}`}
                  </span>
                  {v.colorLabel && (
                    <span className="text-xs text-[#C8794D] font-semibold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#C8794D]" />
                      {v.colorLabel}
                    </span>
                  )}
                </div>

                {!isOriginal && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 rounded-md text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Supprimer cette variante"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                {/* Thumbnail Preview Area */}
                <div className="md:col-span-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#15120F] border border-[#3A2E24] flex items-center justify-center group shadow-inner">
                    {v.imageUrl ? (
                      <>
                        <img 
                          src={v.imageUrl} 
                          alt={`Variante ${idx + 1}`} 
                          className="size-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium bg-black/70 px-2 py-0.5 rounded-full">Aperçu</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-[#D9C8AE]/40">
                        <ImageIcon className="size-6 mb-1 text-[#C8794D]/40" />
                        <span className="text-[9px] uppercase tracking-wider">Aucune image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls & URL upload */}
                <div className="md:col-span-9 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coller l'URL de l'image ou téléversez une photo..."
                      value={v.imageUrl}
                      onChange={e => updateUrl(idx, e.target.value)}
                      className="flex-1 bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3 py-2 text-xs text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none transition-colors"
                    />
                    <label className="inline-flex items-center gap-1.5 bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] text-[#D9C8AE] hover:text-[#F5F0E8] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 shadow-sm">
                      <Upload className="size-3.5 text-[#C8794D]" />
                      {uploading === idx ? 'Chargement...' : 'Parcourir'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                      />
                    </label>
                  </div>

                  {/* Preset Selector */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#D9C8AE]/70 font-bold mb-1.5 flex items-center gap-1">
                      <span>Associer le libellé client :</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activePresets.map(preset => {
                        const isSelected = (v.colorLabel === preset.label || (v.colorLabel === null && preset.label === 'Original') || (preset.label === 'Autre…' && isCustom))
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              if (preset.label === 'Autre…') {
                                updateLabel(idx, customLabels[idx] || '')
                              } else {
                                updateLabel(idx, preset.label === 'Original' ? null : preset.label)
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#C8794D] bg-[#C8794D]/20 text-[#F5F0E8] shadow-sm'
                                : 'border-[#3A2E24] bg-[#15120F] text-[#D9C8AE]/70 hover:border-[#3A2E24]/80 hover:text-[#F5F0E8]'
                            }`}
                          >
                            {preset.hex && preset.label !== 'Original' && (
                              <div className="size-2.5 rounded-full border border-white/30" style={{ backgroundColor: preset.hex }} />
                            )}
                            {preset.label}
                          </button>
                        )
                      })}
                    </div>
                    {isCustom && (
                      <input
                        type="text"
                        placeholder="Ex: Noyer Teinté Miel, Patine Or Antique..."
                        value={v.colorLabel || ''}
                        onChange={e => {
                          const val = e.target.value
                          setCustomLabels(prev => ({ ...prev, [idx]: val }))
                          updateLabel(idx, val)
                        }}
                        className="mt-2 w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3 py-1.5 text-xs text-[#F5F0E8] outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
