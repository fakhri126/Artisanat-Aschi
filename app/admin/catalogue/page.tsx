'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant, QuoteRequest } from '@/lib/api'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Bot, 
  X, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  Palette, 
  Search, 
  Sparkles, 
  Filter, 
  Ruler, 
  Layers, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  ExternalLink,
  Gem,
  Tv,
  Frame,
  DoorClosed,
  Lamp,
  LayoutDashboard,
  Folder
} from 'lucide-react'
import Link from 'next/link'

// ─── Preset colour swatches ──────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: 'Original',      hex: null },
  { label: 'Blanc',         hex: '#FFFFFF' },
  { label: 'Noir',          hex: '#1A1A1A' },
  { label: 'Noyer',         hex: '#5C3317' },
  { label: 'Bleu',          hex: '#2D5F8A' },
  { label: 'Or',            hex: '#C9A84C' },
  { label: 'Naturel',       hex: '#C4A882' },
  { label: 'Blanc Cérusé',  hex: '#F0EDE6' },
  { label: 'Vert Olivier',  hex: '#4A5E3A' },
  { label: 'Bordeaux',      hex: '#7B2D3E' },
  { label: 'Autre…',        hex: null },
]

const QUICK_DIMENSIONS = [
  { label: 'Petit', desc: '< 80 cm', value: 'Petit (< 80 cm)' },
  { label: 'Moyen', desc: '80–150 cm', value: 'Moyen (80–150 cm)' },
  { label: 'Grand', desc: '> 150 cm', value: 'Grand (> 150 cm)' },
  { label: 'Sur-mesure', desc: 'Personnalisé', value: 'Sur-mesure' },
]

const ALL_PRESETS = [
  ...COLOR_PRESETS.filter(p => p.label !== 'Autre…'),
  { label: 'Petit', hex: null },
  { label: 'Moyen', hex: null },
  { label: 'Grand', hex: null },
  { label: 'Autre…', hex: null }
]

const getCategoryIcon = (name: string) => {
  const norm = (name || '').toLowerCase()
  if (norm.includes('buffet')) return LayoutDashboard
  if (norm.includes('tv')) return Tv
  if (norm.includes('miroir')) return Frame
  if (norm.includes('porte bijou') || norm.includes('porte-bijou') || norm.includes('porte bijoux')) return Gem
  if (norm.includes('porte')) return DoorClosed
  if (norm.includes('lustre') || norm.includes('lampe') || norm.includes('coffre')) return Lamp
  return Folder
}

// ─── Enhanced Image Variant Manager with Live Thumbnails ──────────────────────
function ImageVariantManager({
  variants,
  onChange,
  uploadFn,
}: {
  variants: ImageVariant[]
  onChange: (variants: ImageVariant[]) => void
  uploadFn: (file: File) => Promise<{ url: string }>
}) {
  const [uploading, setUploading] = useState<number | null>(null)
  const [customLabels, setCustomLabels] = useState<Record<number, string>>({})

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
    setUploading(idx)
    try {
      const res = await uploadFn(file)
      updateUrl(idx, res.url)
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'image.")
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E6A635]/20">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-2">
            <Palette className="size-4 text-[#E6A635]" />
            Photos & Variantes Visuelles (Couleur / Format)
          </label>
          <p className="text-[11px] text-[#EAE4D9]/70 mt-0.5">
            Ajoutez la photo originale de l&apos;atelier et les déclinaisons de finitions pour le configurateur client.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6A635]/20 border border-[#E6A635]/50 text-[#F2BD52] text-xs font-semibold hover:bg-[#E6A635]/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="size-3.5" /> Ajouter une vue / variante
        </button>
      </div>

      {variants.length === 0 && (
        <div className="text-center p-6 rounded-2xl bg-[#1A110B]/60 border border-dashed border-[#E6A635]/30 text-[#EAE4D9]/70">
          <ImageIcon className="size-8 mx-auto mb-2 text-[#E6A635]/60" />
          <p className="text-xs">Ajoutez au moins une photo pour ce modèle.</p>
          <button
            type="button"
            onClick={addVariant}
            className="mt-3 px-4 py-1.5 rounded-full bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider"
          >
            Ajouter la photo principale
          </button>
        </div>
      )}

      <div className="space-y-3.5">
        {variants.map((v, idx) => {
          const isFirstOriginal = idx === 0
          const isOriginal = isFirstOriginal || v.colorLabel === 'Original' || v.colorLabel === null
          const isCustom = v.colorLabel && !ALL_PRESETS.slice(0, -1).some(p => p.label === v.colorLabel)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-2xl border p-4 transition-all ${
                isFirstOriginal
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-sm'
                  : 'border-[#E6A635]/30 bg-[#241812]/90 hover:border-[#E6A635]/50 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {isFirstOriginal ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10.5px] font-bold uppercase tracking-widest text-emerald-300">
                      <CheckCircle2 className="size-3.5" /> Photo Principale (Original Atelier)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10.5px] font-bold uppercase tracking-widest text-amber-300">
                      <Layers className="size-3.5" /> Variante Visuelle N°{idx + 1}
                    </span>
                  )}
                </div>
                {!isFirstOriginal && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer cette variante"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                {/* Thumbnail Preview Area */}
                <div className="md:col-span-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1A110B] border border-[#E6A635]/30 flex items-center justify-center group shadow-inner">
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
                      <div className="flex flex-col items-center justify-center p-2 text-center text-[#EAE4D9]/40">
                        <ImageIcon className="size-6 mb-1 text-[#E6A635]/40" />
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
                      className="flex-1 bg-[#1A110B]/90 border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3 py-2 text-xs text-[#FAF7F2] placeholder:text-[#EAE4D9]/40 outline-none transition-colors"
                    />
                    <label className="inline-flex items-center gap-1.5 bg-[#3B271C] hover:bg-[#4A3224] border border-[#E6A635]/40 text-[#F2BD52] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 shadow-sm">
                      <Upload className="size-3.5" />
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
                    <p className="text-[10px] uppercase tracking-wider text-[#EAE4D9]/70 font-bold mb-1.5 flex items-center gap-1">
                      <span>Associer le libellé client :</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PRESETS.map(preset => {
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
                                ? 'border-[#F2BD52] bg-[#E6A635]/25 text-[#F2BD52] shadow-sm'
                                : 'border-[#E6A635]/20 bg-[#1A110B]/50 text-[#EAE4D9]/70 hover:border-[#E6A635]/40 hover:text-[#FAF7F2]'
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
                        className="mt-2 w-full bg-[#1A110B]/90 border border-[#E6A635]/40 focus:border-[#F2BD52] rounded-xl px-3 py-1.5 text-xs text-[#FAF7F2] outline-none"
                      />
                    )}
                    {v.colorLabel && (
                      <p className="mt-1 text-[10.5px] text-[#F2BD52] flex items-center gap-1">
                        <Check className="size-3" /> Bouton interactif affiché au client : <strong>&laquo; {v.colorLabel} &raquo;</strong>
                      </p>
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

// ─── Main Admin Catalogue Page ───────────────────────────────────────────────
export default function AdminCataloguePage() {
  const [activeTab, setActiveTab] = useState<'MODELS' | 'QUOTES'>('MODELS')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal State & Step Navigation
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tout')
  const [filterStatus, setFilterStatus] = useState('Tout')
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [availability, setAvailability] = useState('Disponible')
  const [imageVariants, setImageVariants] = useState<ImageVariant[]>([])

  // Live preview active variant selector
  const [previewVariantIdx, setPreviewVariantIdx] = useState(0)

  useEffect(() => { 
    loadData() 
    loadQuotes()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [prodData, catData] = await Promise.all([
        adminApi.getProducts(),
        publicApi.getCategories(),
      ])
      // Filter only CATALOGUE type
      setProducts(prodData.filter(p => p.type === 'CATALOGUE'))
      let finalCats = [...catData]
      let lustresCat = finalCats.find(c => c.name.toLowerCase().includes('lustre'))
      if (!lustresCat) {
        try {
          const created = await adminApi.createCategory({
            name: 'Lustres',
            type: 'CATALOGUE'
          })
          finalCats.push(created)
        } catch (e) {
          console.warn("Could not auto-create Lustres category:", e)
          if (!finalCats.some(c => c.name.toLowerCase().includes('lustre'))) {
            finalCats.push({ id: 999, name: 'Lustres', type: 'CATALOGUE' } as any)
          }
        }
      }
      let porteBijouxCat = finalCats.find(c => c.name.toLowerCase().includes('porte bijou') || c.name.toLowerCase().includes('porte bijoux') || c.name.toLowerCase().includes('porte-bijou'))
      if (!porteBijouxCat) {
        try {
          const created = await adminApi.createCategory({
            name: 'Porte Bijoux',
            type: 'CATALOGUE'
          })
          finalCats.push(created)
        } catch (e) {
          console.warn("Could not auto-create Porte Bijoux category:", e)
          if (!finalCats.some(c => c.name.toLowerCase().includes('porte bijou') || c.name.toLowerCase().includes('porte bijoux'))) {
            finalCats.push({ id: 998, name: 'Porte Bijoux', type: 'CATALOGUE' } as any)
          }
        }
      }
      setCategories(finalCats)
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }

  const loadQuotes = async () => {
    try {
      setLoadingQuotes(true)
      const data = await adminApi.getQuotes()
      setQuotes(data || [])
    } catch (err) {
      console.error("Failed to load quotes:", err)
    } finally {
      setLoadingQuotes(false)
    }
  }

  // Auto-naming & auto-description helpers
  const getNextModelName = (catId: string, allProds: Product[], allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const catName = cat?.name || 'Création'
    
    let singular = catName
    if (singular.toLowerCase().includes('lustre')) {
      singular = 'Lustre'
    } else if (singular.toLowerCase().includes('porte bijou') || singular.toLowerCase().includes('porte bijoux') || singular.toLowerCase().includes('porte-bijou')) {
      singular = 'Porte-Bijoux'
    } else if (singular.toLowerCase().includes('lampe') || singular.toLowerCase().includes('coffre')) {
      singular = 'Lampe Coffre'
    } else if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) {
      singular = singular.slice(0, -1)
    }
    if (singular.toLowerCase().includes('meuble')) {
      singular = 'Meuble TV'
    }

    const inCat = allProds.filter(p => p.category?.id.toString() === catId || p.category?.name === catName)
    
    let maxNum = 0
    for (const p of inCat) {
      const match = p.name.match(/(?:Modèle|N°|#|\s)(\d+)/i)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    }
    
    const nextNum = (maxNum + 1).toString().padStart(2, '0')
    return `${singular} — Modèle ${nextNum}`
  }

  const buildAutoDescription = (modelName: string, catId: string, itemColor: string, itemDim: string, allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    let singular = cat?.name || 'Création'
    if (singular.toLowerCase().includes('lustre')) {
      singular = 'Lustre'
    } else if (singular.toLowerCase().includes('porte bijou') || singular.toLowerCase().includes('porte bijoux') || singular.toLowerCase().includes('porte-bijou')) {
      singular = 'Porte-Bijoux'
    } else if (singular.toLowerCase().includes('lampe') || singular.toLowerCase().includes('coffre')) {
      singular = 'Lampe Coffre'
    } else if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) {
      singular = singular.slice(0, -1)
    }
    if (singular.toLowerCase().includes('meuble')) {
      singular = 'Meuble TV'
    }

    const match = modelName.match(/(?:Modèle|N°|#|\s)(\d+)/i)
    const modelPart = match ? `(Modèle ${match[1].padStart(2, '0')}) ` : ''

    if (singular === 'Lustre') {
      return `Lustre artisanal d'art fait-main sur-mesure ${modelPart}— Suspension noble en bois sculpté et faïence artisanale.`
    }
    if (singular === 'Porte-Bijoux') {
      return `Porte-bijoux artisanal d'art fait-main sur-mesure ${modelPart}— Écrin et support noble en bois sculpté et céramique d'art.`
    }

    const colorPart = itemColor ? `Finition ${itemColor}` : 'Finition au choix'
    const dimPart = itemDim ? `, format ${itemDim}` : ''

    return `${singular} artisanal d'art fait-main sur-mesure ${modelPart}— ${colorPart}${dimPart}.`
  }

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId)
    if (!editingProduct) {
      const nextName = getNextModelName(newCatId, products, categories)
      setName(nextName)
      setDescription(buildAutoDescription(nextName, newCatId, color, dimensions, categories))
    } else {
      setDescription(buildAutoDescription(name, newCatId, color, dimensions, categories))
    }
  }

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    setDescription(buildAutoDescription(name, categoryId, newColor, dimensions, categories))
  }

  const handleDimensionsChange = (newDim: string) => {
    setDimensions(newDim)
    setDescription(buildAutoDescription(name, categoryId, color, newDim, categories))
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setModalStep(1)
    const defaultCatId = categories[0]?.id.toString() || ''
    const defaultName = getNextModelName(defaultCatId, products, categories)
    setCategoryId(defaultCatId)
    setName(defaultName)
    setDescription(buildAutoDescription(defaultName, defaultCatId, 'Noyer', 'Moyen (80–150 cm)', categories))
    setDimensions('Moyen (80–150 cm)')
    setMaterials('Noyer massif')
    setColor('Noyer')
    setPrice('')
    setAvailability('Disponible')
    setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    setPreviewVariantIdx(0)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalStep(1)
    setName(product.name)
    setDescription(product.description || '')
    setCategoryId(product.category?.id.toString() || '')
    setDimensions(product.dimensions || '')
    setMaterials(product.materials || '')
    setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    setAvailability(product.availability || 'Disponible')
    
    if (product.images && product.images.length > 0) {
      setImageVariants(product.images.map(img => ({
        imageUrl: img.imageUrl,
        colorLabel: img.colorLabel || 'Original'
      })))
    } else {
      setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    }
    setPreviewVariantIdx(0)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ce modèle du catalogue ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    }
  }

  const handleUpdateQuoteStatus = async (quoteId: number, status: string) => {
    try {
      await adminApi.updateQuoteStatus(quoteId, status)
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status } : q))
    } catch (err) {
      alert("Erreur de mise à jour du statut.")
    }
  }

  const handleDeleteQuote = async (quoteId: number) => {
    if (!confirm("Supprimer cette demande ?")) return
    try {
      await adminApi.deleteQuote(quoteId)
      setQuotes(quotes.filter(q => q.id !== quoteId))
    } catch (err) {
      alert("Erreur de suppression.")
    }
  }

  const validateForm = () => {
    if (!name.trim()) {
      alert('Veuillez renseigner le nom du modèle.')
      setModalStep(1)
      return false
    }
    if (!categoryId) {
      alert('Veuillez sélectionner une catégorie.')
      setModalStep(1)
      return false
    }
    if (imageVariants.length === 0 || !imageVariants[0].imageUrl.trim()) {
      alert("Veuillez ajouter au moins la photo originale principale du produit.")
      setModalStep(2)
      return false
    }
    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    let finalCatId = parseInt(categoryId)

    // If categoryId is a virtual/placeholder id (e.g. 999 or 998), create or find the real category in DB first
    if (finalCatId === 999 || finalCatId === 998 || isNaN(finalCatId)) {
      try {
        const selectedCat = categories.find(c => c.id.toString() === categoryId)
        const catName = selectedCat?.name || (finalCatId === 998 ? 'Porte Bijoux' : 'Lustres')
        const dbCats = await adminApi.getCategories()
        const existing = dbCats.find(c => c.name.toLowerCase() === catName.toLowerCase())
        if (existing) {
          finalCatId = existing.id
        } else {
          const createdCat = await adminApi.createCategory({
            name: catName,
            type: 'CATALOGUE'
          })
          finalCatId = createdCat.id
        }
      } catch (catErr) {
        console.error("Error creating/resolving category:", catErr)
      }
    }

    const payload: ProductRequest = {
      name: name.trim(), 
      description: description.trim(), 
      categoryId: finalCatId, 
      dimensions: dimensions.trim(), 
      materials: materials.trim(),
      color: color.trim(), 
      price: price === '' ? null : parseFloat(price), 
      availability,
      type: 'CATALOGUE', 
      isFeatured: false,
      imageVariants: imageVariants.filter(v => v.imageUrl.trim() !== ''),
    }

    try {
      if (editingProduct) await adminApi.updateProduct(editingProduct.id, payload)
      else await adminApi.createProduct(payload)
      setModalOpen(false)
      loadData()
    } catch (err: any) { 
      alert(err.message || "Erreur d'enregistrement.") 
    } finally {
      setSaving(false)
    }
  }

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.materials || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = filterCategory === 'Tout' || p.category?.name === filterCategory
      const matchStatus = filterStatus === 'Tout' || (p.availability || 'Disponible') === filterStatus
      return matchSearch && matchCat && matchStatus
    })
  }, [products, searchQuery, filterCategory, filterStatus])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) setSelectedIds([])
    else setSelectedIds(filteredProducts.map(p => p.id))
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.length} modèle(s) sélectionné(s) du catalogue ?`)) return
    try {
       for (const id of selectedIds) {
         await adminApi.deleteProduct(id)
       }
       setProducts(products.filter(p => !selectedIds.includes(p.id)))
       setSelectedIds([])
    } catch(err: any) { alert("Erreur lors de la suppression en masse.") }
  }

  return (
    <div className="space-y-7 text-[#FAF7F2]">
      
      {/* ─── Top Header Section with High Contrast ────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-[#E6A635]/25">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B271C] border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-widest mb-2 shadow-sm">
            <Sparkles className="size-3 text-[#E6A635]" />
            <span>Gestion de la Collection</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#FAF7F2] tracking-tight">
            Catalogue d&apos;Inspiration
          </h1>
          <p className="mt-1.5 text-sm text-[#EAE4D9]/80 leading-relaxed max-w-2xl">
            Modèles de référence et pièces d&apos;inspiration présentés aux clients sur{' '}
            <Link href="/catalogue" target="_blank" className="text-[#F2BD52] hover:underline font-semibold inline-flex items-center gap-1">
              /catalogue <ExternalLink className="size-3.5 inline" />
            </Link>{' '}
            pour configurer leurs créations sur-mesure.
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={openCreateModal}
          className="btn-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] hover:scale-[1.02] active:scale-[0.98] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#1A110B] transition-all shadow-[0_4px_20px_rgba(230,166,53,0.35)] cursor-pointer shrink-0"
        >
          <Plus className="size-4 stroke-[3]" />
          <span>Ajouter un Modèle</span>
        </motion.button>
      </div>

      {/* ─── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveTab('MODELS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'MODELS'
              ? 'bg-[#E6A635] text-[#1A110B] shadow-lg shadow-[#E6A635]/25 scale-[1.02]'
              : 'bg-[#2E2018]/90 text-[#EAE4D9]/80 hover:bg-[#3B271C] hover:text-[#FAF7F2] border border-[#E6A635]/20'
          }`}
        >
          <Bot className="size-4" /> 
          <span>Modèles Catalogue ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'QUOTES'
              ? 'bg-[#E6A635] text-[#1A110B] shadow-lg shadow-[#E6A635]/25 scale-[1.02]'
              : 'bg-[#2E2018]/90 text-[#EAE4D9]/80 hover:bg-[#3B271C] hover:text-[#FAF7F2] border border-[#E6A635]/20'
          }`}
        >
          <Palette className="size-4" /> 
          <span>Demandes & Sur-Mesure</span>
          {quotes.filter(q => q.status === 'PENDING').length > 0 && (
            <span className="bg-[#B91C1C] text-white text-[10px] font-black rounded-full px-2 py-0.5 ml-1 animate-pulse">
              {quotes.filter(q => q.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB CONTENT 1: CATALOG MODELS GRID ───────────────────────────── */}
      {activeTab === 'MODELS' && (
        <div className="space-y-6">
          
          {/* Note Banner with High Contrast */}
          <div className="flex items-start gap-3 rounded-2xl border border-[#E6A635]/30 bg-[#3B271C]/75 p-4 text-xs text-[#FAF7F2] shadow-md backdrop-blur-md">
            <Sparkles className="size-4 text-[#F2BD52] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#F2BD52]">Gestion d&apos;Inspiration :</span>{' '}
              <span className="text-[#EAE4D9]/90">
                Chaque modèle publié ici peut proposer plusieurs finitions visuelles (teintes de bois, céramiques, dimensions). Les clients peuvent demander un devis direct ou personnaliser les cotes via le formulaire en ligne.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="size-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filters & Search Bar */}
          <div className="bg-[#2E2018]/90 p-4 rounded-2xl border border-[#E6A635]/25 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-3.5 items-center justify-between">
            <div className="flex flex-col sm:flex-row flex-1 items-center gap-3 w-full">
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#F2BD52]" />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom, essence, dimensions..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A110B]/85 border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#EAE4D9]/40 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EAE4D9]/60 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-auto shrink-0">
                <select 
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto bg-[#1A110B]/85 border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#FAF7F2] font-medium outline-none cursor-pointer"
                >
                  <option value="Tout">Toutes les catégories ({categories.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto shrink-0">
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto bg-[#1A110B]/85 border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#FAF7F2] font-medium outline-none cursor-pointer"
                >
                  <option value="Tout">Tous les statuts</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Sur commande">Sur commande</option>
                  <option value="Épuisé">Épuisé / Rupture</option>
                </select>
              </div>
            </div>
            
            {/* Selection & Counter */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <span className="text-xs text-[#EAE4D9]/70 font-medium whitespace-nowrap">
                {filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''}
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#F2BD52] bg-[#1A110B]/80 border border-[#E6A635]/35 px-3 py-1.5 rounded-xl hover:bg-[#3B271C] transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded text-[#E6A635] focus:ring-[#E6A635] border-[#E6A635]/40 size-4 cursor-pointer" 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length} 
                  onChange={toggleSelectAll} 
                />
                <span>Tout sélectionner</span>
              </label>
            </div>
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#2E2018]/50 rounded-3xl border border-[#E6A635]/20">
              <div className="size-10 animate-spin rounded-full border-4 border-[#E6A635] border-t-transparent mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold">Chargement des modèles...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#2E2018]/60 backdrop-blur-md border border-dashed border-[#E6A635]/30 rounded-3xl text-center">
              <Bot className="size-12 mb-3 text-[#E6A635]/40" />
              <h3 className="font-heading text-lg text-[#FAF7F2] font-medium">Aucun modèle ne correspond à vos filtres</h3>
              <p className="text-xs text-[#EAE4D9]/60 max-w-sm mt-1 mb-5">
                Essayez de modifier votre recherche ou ajoutez un nouveau modèle au catalogue.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
              >
                <Plus className="size-4" /> Créer un modèle maintenant
              </button>
            </div>
          ) : (
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
            >
              {filteredProducts.map((product) => {
                const primaryImage = product.images?.[0]?.imageUrl || '/placeholder.png'
                const catName = product.category?.name || 'Mobilier'
                const CatIcon = getCategoryIcon(catName)
                const isSelected = selectedIds.includes(product.id)
                const isAvailable = product.availability === 'Disponible' || !product.availability
                const isSurCommande = product.availability === 'Sur commande'

                return (
                  <motion.article
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className={`group bg-[#2E2018]/90 backdrop-blur-md border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#E6A635]/60 transition-all duration-300 flex flex-col justify-between relative ${
                      isSelected 
                        ? 'border-[#F2BD52] ring-2 ring-[#F2BD52]/40 bg-[#3B271C]' 
                        : 'border-[#E6A635]/25 hover:-translate-y-1'
                    }`}
                  >
                    {/* Top Image Container with Overlaid Badges (NO OVERLAPPING ON TITLE) */}
                    <div className="relative aspect-[16/11] overflow-hidden bg-[#1A110B]">
                      <img 
                        src={primaryImage} 
                        alt={product.name} 
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B] via-transparent to-black/40 opacity-80" />

                      {/* 1. Category Badge - Floating Top Left */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-[#1A110B]/85 border border-[#E6A635]/40 px-3 py-1 backdrop-blur-md shadow-md">
                        <CatIcon className="size-3 text-[#F2BD52]" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FAF7F2]">
                          {catName}
                        </span>
                      </div>

                      {/* 2. Status Badge & Select Checkbox - Floating Top Right */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] uppercase font-bold tracking-wider backdrop-blur-md shadow-md border ${
                          isAvailable 
                            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40' 
                            : isSurCommande 
                            ? 'bg-amber-950/85 text-amber-300 border-amber-500/40'
                            : 'bg-rose-950/85 text-rose-300 border-rose-500/40'
                        }`}>
                          <span className={`size-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : isSurCommande ? 'bg-amber-400' : 'bg-rose-400'}`} />
                          {product.availability || 'Disponible'}
                        </span>

                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="size-4.5 rounded border-[#E6A635]/60 bg-black/60 text-[#E6A635] focus:ring-[#E6A635] focus:ring-offset-0 cursor-pointer shadow-md backdrop-blur-md"
                          title="Sélectionner"
                        />
                      </div>

                      {/* 3. Variants Preview Indicator - Bottom of Image */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-[#1A110B]/85 border border-[#E6A635]/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                          <Layers className="size-3 text-[#F2BD52]" />
                          <span className="text-[10px] text-[#FAF7F2] font-semibold">
                            {product.images.length} visuels
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content (Clean unconstrained Title & Specs) */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Title (Full Width, High Contrast, No Badge Collisions) */}
                        <h3 className="font-heading text-lg font-semibold text-[#FAF7F2] group-hover:text-[#F2BD52] transition-colors leading-snug">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="mt-1.5 text-xs text-[#EAE4D9]/75 line-clamp-2 leading-relaxed font-normal">
                          {product.description || 'Création artisanale sur-mesure en bois noble.'}
                        </p>

                        {/* Specs Pills */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px]">
                          {product.materials && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1A110B]/60 border border-[#E6A635]/20 text-[#EAE4D9]/90 font-medium">
                              <Sparkles className="size-3 text-[#E6A635]" />
                              {product.materials}
                            </span>
                          )}
                          {product.dimensions && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1A110B]/60 border border-[#E6A635]/20 text-[#EAE4D9]/90 font-medium">
                              <Ruler className="size-3 text-[#E6A635]" />
                              {product.dimensions}
                            </span>
                          )}
                          {product.color && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1A110B]/60 border border-[#E6A635]/20 text-[#EAE4D9]/90 font-medium">
                              <Palette className="size-3 text-[#E6A635]" />
                              {product.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Price & Actions */}
                      <div className="pt-3.5 border-t border-[#E6A635]/20 flex items-center justify-between gap-2">
                        <div>
                          {product.price ? (
                            <span className="font-heading text-base font-bold text-[#F2BD52]">
                              {product.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-[#EAE4D9]/70">DT</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#EAE4D9]/60 italic">
                              Sur devis
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <Link 
                            href={`/produits/${product.id}`} 
                            target="_blank" 
                            className="p-2 rounded-xl bg-[#1A110B]/80 hover:bg-[#3B271C] text-[#EAE4D9] hover:text-[#F2BD52] border border-[#E6A635]/20 transition-all cursor-pointer" 
                            title="Voir sur le site public"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="p-2 rounded-xl bg-[#1A110B]/80 hover:bg-[#E6A635]/20 text-[#EAE4D9] hover:text-[#F2BD52] border border-[#E6A635]/20 transition-all cursor-pointer" 
                            title="Modifier ce modèle"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-2 rounded-xl bg-[#1A110B]/80 hover:bg-rose-950/40 text-[#EAE4D9] hover:text-rose-400 border border-[#E6A635]/20 hover:border-rose-500/40 transition-all cursor-pointer" 
                            title="Supprimer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT 2: DEMANDES & SUR-MESURE CATALOGUE ──────────────── */}
      {activeTab === 'QUOTES' && (
        <div className="bg-[#2E2018]/90 backdrop-blur-md rounded-3xl border border-[#E6A635]/25 shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6A635]/20">
            <div>
              <h2 className="font-heading text-xl text-[#FAF7F2] font-semibold">Demandes de Devis & Personnalisation</h2>
              <p className="text-xs text-[#EAE4D9]/70 mt-0.5">Demandes des clients envoyées depuis le catalogue en ligne.</p>
            </div>
            <button 
              onClick={loadQuotes} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A110B] border border-[#E6A635]/30 text-[#F2BD52] text-xs font-semibold hover:bg-[#3B271C] transition-colors"
            >
              <RefreshCw className={`size-3.5 ${loadingQuotes ? 'animate-spin' : ''}`} /> Actualiser
            </button>
          </div>

          {loadingQuotes ? (
            <div className="p-12 text-center text-[#EAE4D9]/70">Chargement des devis catalogue...</div>
          ) : quotes.length === 0 ? (
            <div className="p-12 text-center text-[#EAE4D9]/60 bg-[#1A110B]/40 rounded-2xl border border-dashed border-[#E6A635]/30">
              <Bot className="size-10 mx-auto mb-2 text-[#E6A635]/40" />
              <p className="text-sm">Aucune demande de devis catalogue reçue pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A110B]/80 border-b border-[#E6A635]/30 text-[11px] uppercase tracking-wider text-[#F2BD52] font-bold">
                    <th className="p-4">Client</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Modèle & Personnalisation</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6A635]/15 text-xs">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-[#FAF7F2]">{q.fullName}</td>
                      <td className="p-4 text-xs text-[#EAE4D9]/80 space-y-1">
                        <p className="font-mono">{q.email}</p>
                        <p className="font-bold text-[#F2BD52]">{q.phoneNumber}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-[#F2BD52] text-xs mb-1">{q.product?.name || 'Création Catalogue'}</p>
                        <p className="text-xs text-[#FAF7F2] bg-[#1A110B]/70 p-2.5 rounded-xl border border-[#E6A635]/20 leading-relaxed font-sans">
                          {q.personalizationDetails || q.message}
                        </p>
                      </td>
                      <td className="p-4 text-xs text-[#EAE4D9]/70">
                        {new Date(q.createdDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                          q.status === 'PENDING' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                          q.status === 'CONTACTED' ? 'bg-blue-950/80 text-blue-300 border-blue-500/40' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Terminé'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateQuoteStatus(q.id, 'CONTACTED')}
                          className="px-3 py-1.5 text-xs bg-[#E6A635]/20 hover:bg-[#E6A635] text-[#F2BD52] hover:text-[#1A110B] rounded-lg font-semibold transition-colors"
                        >
                          Marquer Contacté
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Floating Bulk Action Bar ─────────────────────────────────────── */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-[#1A110B] text-white px-6 py-3 rounded-full shadow-2xl border border-[#E6A635]/50 backdrop-blur-xl"
        >
          <span className="text-xs font-bold text-[#F2BD52]">{selectedIds.length} modèle(s) sélectionné(s)</span>
          <div className="w-px h-4 bg-[#E6A635]/30" />
          <button 
            onClick={handleBulkDelete} 
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="size-3.5" /> Supprimer la sélection
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-[11px] text-[#EAE4D9]/60 hover:text-white underline ml-2"
          >
            Annuler
          </button>
        </motion.div>
      )}

      {/* ─── Multi-step Tabbed Modal with Sticky Footer ───────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="bg-[#241812] border border-[#E6A635]/40 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-[#FAF7F2]"
          >
            {/* Modal Header with Steps Indicator */}
            <header className="p-5 sm:p-6 border-b border-[#E6A635]/25 bg-[#1A110B]/95 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-2xl bg-gradient-to-br from-[#E6A635] to-[#C17D59] flex items-center justify-center text-[#1A110B] shadow-md">
                    {editingProduct ? <Edit2 className="size-5" /> : <Plus className="size-5" />}
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-[#FAF7F2]">
                      {editingProduct ? 'Modifier le modèle du catalogue' : 'Ajouter un nouveau modèle au catalogue'}
                    </h2>
                    <p className="text-xs text-[#EAE4D9]/70">
                      Configuration des dimensions, essences et variantes visuelles.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#EAE4D9] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Step Tabs Nav */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                {[
                  { step: 1, label: '1. Informations', desc: 'Nom, dimensions, essences' },
                  { step: 2, label: '2. Photos & Variantes', desc: 'Photos atelier & teintes' },
                  { step: 3, label: '3. Aperçu en Direct', desc: 'Rendu final client' },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setModalStep(s.step as any)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      modalStep === s.step
                        ? 'bg-[#E6A635]/25 border-[#F2BD52] text-[#FAF7F2] shadow-sm'
                        : 'bg-[#1A110B]/50 border-white/5 text-[#EAE4D9]/60 hover:text-[#FAF7F2] hover:bg-[#1A110B]'
                    }`}
                  >
                    <p className={`text-xs font-bold ${modalStep === s.step ? 'text-[#F2BD52]' : ''}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] opacity-70 hidden sm:block truncate">{s.desc}</p>
                  </button>
                ))}
              </div>
            </header>

            {/* Modal Body (Scrollable Pane) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* ── STEP 1: INFORMATIONS GÉNÉRALES ── */}
              {modalStep === 1 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    
                    {/* Model Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1">
                        <span>Nom du modèle</span> <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Buffet — Modèle 01" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] outline-none font-semibold" 
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1">
                        <span>Catégorie</span> <span className="text-red-400">*</span>
                      </label>
                      <select 
                        value={categoryId} 
                        onChange={e => handleCategoryChange(e.target.value)} 
                        className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] outline-none font-medium cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Unified Dimensions Control (Pills + Custom Input) */}
                    <div className="space-y-2 sm:col-span-2 bg-[#1A110B]/70 p-4 rounded-2xl border border-[#E6A635]/25">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1.5">
                          <Ruler className="size-4 text-[#E6A635]" />
                          <span>Format & Dimensions</span>
                        </label>
                        <span className="text-[10.5px] text-[#EAE4D9]/70 italic">Sélection rapide ou cotes exactes</span>
                      </div>

                      {/* Quick format pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {QUICK_DIMENSIONS.map((qd) => {
                          const isSelected = dimensions.toLowerCase().includes(qd.label.toLowerCase())
                          return (
                            <button
                              key={qd.label}
                              type="button"
                              onClick={() => handleDimensionsChange(qd.value)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#E6A635] text-[#1A110B] border-[#F2BD52] font-bold shadow-md'
                                  : 'bg-[#241812] text-[#EAE4D9] border-[#E6A635]/20 hover:border-[#E6A635]/50'
                              }`}
                            >
                              <p className="text-xs font-bold">{qd.label}</p>
                              <p className="text-[10px] opacity-75">{qd.desc}</p>
                            </button>
                          )
                        })}
                      </div>

                      {/* Custom free-text field automatically synced */}
                      <div className="pt-2">
                        <input 
                          type="text" 
                          placeholder="Ex: 180 x 50 x 85 cm ou Format Grand sur-mesure" 
                          value={dimensions} 
                          onChange={e => handleDimensionsChange(e.target.value)} 
                          className="w-full bg-[#241812] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2 text-xs text-[#FAF7F2] placeholder:text-[#EAE4D9]/40 outline-none" 
                        />
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">
                        Matériaux & Essences de bois
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Noyer massif & Céramique d'art" 
                        value={materials} 
                        onChange={e => setMaterials(e.target.value)} 
                        className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] outline-none" 
                      />
                    </div>

                    {/* Price (Optional) */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">
                        Prix indicatif (DT) <span className="text-[10px] font-normal text-[#EAE4D9]/60">(Optionnel)</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="Laisser vide pour « Sur devis »" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] outline-none" 
                      />
                    </div>

                    {/* Availability / Status */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">
                        Disponibilité / Statut Catalogue
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Disponible', 'Sur commande', 'Épuisé'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAvailability(st)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              availability === st
                                ? 'bg-[#E6A635] text-[#1A110B] border-[#F2BD52] shadow-sm'
                                : 'bg-[#1A110B] text-[#EAE4D9]/70 border-[#E6A635]/20 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Preset Palette for Original */}
                    <div className="space-y-2 sm:col-span-2 bg-[#1A110B]/70 p-4 rounded-2xl border border-[#E6A635]/25">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1.5">
                        <Palette className="size-4 text-[#E6A635]" />
                        <span>Finition / Teinte Principale de l&apos;Original</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.filter(p => p.label !== 'Original').map(preset => {
                          const isCustom = color && !COLOR_PRESETS.slice(0, -1).some(p => p.label === color)
                          const isSelected = color === preset.label || (preset.label === 'Autre…' && isCustom)
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                if (preset.label === 'Autre…') {
                                  handleColorChange('')
                                } else {
                                  handleColorChange(preset.label)
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#F2BD52] bg-[#E6A635]/25 text-[#F2BD52] shadow-sm'
                                  : 'border-[#E6A635]/20 bg-[#241812] text-[#EAE4D9]/70 hover:border-[#E6A635]/40 hover:text-white'
                              }`}
                            >
                              {preset.hex && (
                                <div className="size-3 rounded-full border border-white/30" style={{ backgroundColor: preset.hex }} />
                              )}
                              {preset.label}
                            </button>
                          )
                        })}
                      </div>
                      {(!color || !COLOR_PRESETS.slice(0, -1).some(p => p.label === color)) && (
                        <input 
                          type="text" 
                          placeholder="Précisez la couleur (ex: Noyer Foncé Ciselé Or)..." 
                          value={color} 
                          onChange={e => handleColorChange(e.target.value)} 
                          className="w-full mt-2 bg-[#241812] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3 py-2 text-xs text-[#FAF7F2] outline-none" 
                        />
                      )}
                    </div>
                  </div>

                  {/* Auto-description text area */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold">
                        Description Artisanale
                      </label>
                      <button
                        type="button"
                        onClick={() => setDescription(buildAutoDescription(name, categoryId, color, dimensions, categories))}
                        className="text-xs text-[#F2BD52] hover:text-white flex items-center gap-1 font-semibold underline cursor-pointer"
                      >
                        <Sparkles className="size-3" /> Régénérer automatiquement
                      </button>
                    </div>
                    <textarea 
                      rows={3} 
                      placeholder="Description détaillée du modèle..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-2xl p-3.5 text-xs sm:text-sm text-[#FAF7F2] outline-none leading-relaxed" 
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 2: VARIANTES & MÉDIAS ── */}
              {modalStep === 2 && (
                <div className="space-y-4">
                  <ImageVariantManager
                    variants={imageVariants}
                    onChange={setImageVariants}
                    uploadFn={adminApi.uploadProductImage}
                  />
                </div>
              )}

              {/* ── STEP 3: APERÇU EN DIRECT (LIVE PREVIEW) ── */}
              {modalStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-[#1A110B]/80 border border-[#E6A635]/30 text-xs text-[#EAE4D9]/80 flex items-center gap-2">
                    <Info className="size-4 text-[#F2BD52] shrink-0" />
                    <span>Voici le rendu exact de la carte tel qu&apos;il apparaîtra dans le catalogue et dans le tableau de bord.</span>
                  </div>

                  {/* Live Card Preview */}
                  <div className="max-w-md mx-auto bg-[#2E2018] border border-[#E6A635]/40 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative aspect-[16/11] bg-[#1A110B]">
                      <img 
                        src={imageVariants[previewVariantIdx]?.imageUrl || imageVariants[0]?.imageUrl || '/placeholder.png'} 
                        alt={name} 
                        className="size-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B] via-transparent to-black/40 opacity-80" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#1A110B]/85 border border-[#E6A635]/40 px-3 py-1 backdrop-blur-md">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FAF7F2]">
                          {categories.find(c => c.id.toString() === categoryId)?.name || 'Catalogue'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                          {availability}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-heading text-lg font-bold text-[#FAF7F2]">{name || 'Nom du Modèle'}</h3>
                      <p className="text-xs text-[#EAE4D9]/80 line-clamp-2">{description || 'Description du modèle...'}</p>

                      {/* Interactive variant pill tester */}
                      {imageVariants.length > 1 && (
                        <div className="pt-2">
                          <p className="text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1.5">Variantes visuelles :</p>
                          <div className="flex flex-wrap gap-1.5">
                            {imageVariants.map((iv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPreviewVariantIdx(idx)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                                  previewVariantIdx === idx 
                                    ? 'bg-[#E6A635] text-[#1A110B] border-[#F2BD52]' 
                                    : 'bg-[#1A110B] text-[#EAE4D9]/70 border-[#E6A635]/20'
                                }`}
                              >
                                {iv.colorLabel || (idx === 0 ? 'Original' : `Variante ${idx + 1}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* ── STICKY MODAL FOOTER (Always Visible while Scrolling) ── */}
            <footer className="sticky bottom-0 z-30 p-4 sm:p-5 border-t border-[#E6A635]/30 bg-[#1A110B]/95 backdrop-blur-xl flex items-center justify-between gap-3">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-[#EAE4D9] hover:bg-white/5 transition-all cursor-pointer"
              >
                Annuler
              </button>

              <div className="flex items-center gap-2">
                {modalStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setModalStep((modalStep - 1) as any)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full border border-[#E6A635]/40 text-xs font-bold uppercase tracking-wider text-[#F2BD52] hover:bg-[#3B271C] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="size-4" /> Précédent
                  </button>
                )}

                {modalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setModalStep((modalStep + 1) as any)}
                    className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-[#3B271C] hover:bg-[#4A3224] border border-[#E6A635]/60 text-xs font-bold uppercase tracking-wider text-[#F2BD52] transition-all cursor-pointer shadow-md"
                  >
                    Suivant <ChevronRight className="size-4" />
                  </button>
                ) : null}

                <button 
                  type="button"
                  onClick={() => handleSubmit()} 
                  disabled={saving}
                  className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] hover:scale-105 active:scale-95 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A110B] transition-all shadow-lg shadow-[#E6A635]/30 cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-4 stroke-[3]" />
                  <span>{saving ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Enregistrer'}</span>
                </button>
              </div>
            </footer>

          </motion.div>
        </div>
      )}

    </div>
  )
}
