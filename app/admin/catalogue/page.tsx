'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant, QuoteRequest, colorsApi, ColorSwatch } from '@/lib/api'
import { isBijouxOrHandleCategory, isBijouxOrHandleProduct } from '@/lib/utils'
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
  Folder,
  FolderPlus,
  Settings2,
  RotateCcw,
  Hash,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  User,
  ListOrdered,
  Clock,
  Printer,
  FileText,
  SlidersHorizontal
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

export const getCategorySingular = (catName: string): string => {
  if (!catName) return 'Création'
  const singular = catName.trim()
  const lower = singular.toLowerCase()
  if (lower.includes('lustre')) return 'Lustre'
  if (lower.includes('porte bijou') || lower.includes('porte bijoux') || lower.includes('porte-bijou')) return 'Porte-Bijoux'
  if (lower.includes('lampe')) return 'Lampe'
  if (lower.includes('coffre')) return 'Coffre'
  if (lower.includes('meuble')) return 'Meuble TV'
  if (lower.includes('table')) return 'Table'
  if (lower.includes('buffet')) return 'Buffet'
  if (lower.includes('miroir')) return 'Miroir'
  if (lower.includes('porte')) return 'Porte'
  if (lower.endsWith('s') && !lower.endsWith('meubles tv')) return singular.slice(0, -1)
  return singular
}

export const isDoorJewelryOrHandleCategory = (catName: string): boolean => {
  if (!catName) return false
  const norm = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  
  // Explicitly preserve Porte-Bijoux & Portes
  if (norm.includes('porte bijou') || norm.includes('porte-bijou') || norm.includes('porte bijoux')) {
    return false
  }
  if (norm === 'porte' || norm === 'portes') {
    return false
  }

  return (
    norm.includes('bijoux de porte') ||
    norm.includes('bijou de porte') ||
    norm.includes('grand rond') ||
    norm.includes('grands ronds') ||
    norm.includes('ovale') ||
    norm.includes('ovales') ||
    norm.includes('poignee') ||
    norm.includes('poignees') ||
    norm.includes('cuivre') ||
    norm.includes('sculpte') ||
    norm.includes('sculptee') ||
    norm.includes('bouton')
  )
}

const getCategoryIcon = (name: string) => {
  const norm = (name || '').toLowerCase()
  if (norm.includes('buffet')) return LayoutDashboard
  if (norm.includes('tv') || norm.includes('meuble')) return Tv
  if (norm.includes('miroir')) return Frame
  if (norm.includes('porte bijou') || norm.includes('porte-bijou') || norm.includes('porte bijoux')) return Gem
  if (norm.includes('porte')) return DoorClosed
  if (norm.includes('lustre') || norm.includes('lampe') || norm.includes('coffre')) return Lamp
  if (norm.includes('table')) return Layers
  return Folder
}

const getColorHex = (colorName: string | null | undefined): string => {
  if (!colorName) return '#C4A882'
  const norm = colorName.toLowerCase().trim()
  if (norm.includes('blanc cérusé') || norm.includes('ceruse')) return '#F0EDE6'
  if (norm.includes('blanc')) return '#FFFFFF'
  if (norm.includes('noir')) return '#1A1A1A'
  if (norm.includes('noyer')) return '#5C3317'
  if (norm.includes('bleu')) return '#2D5F8A'
  if (norm.includes('or') || norm.includes('dore') || norm.includes('doré')) return '#C9A84C'
  if (norm.includes('naturel')) return '#C4A882'
  if (norm.includes('vert') || norm.includes('olivier')) return '#4A5E3A'
  if (norm.includes('bordeaux')) return '#7B2D3E'
  return '#C4A882'
}

// ─── Image Variant Manager ───────────────────────────────────────────────────
function ImageVariantManager({
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
            <span>Nuancier & Variantes Photos du Modèle</span>
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

// ─── Default Fallback Categories for Furniture Catalogue ──────────────────────
const DEFAULT_FURNITURE_CATEGORIES: Category[] = [
  { id: 1, name: 'Buffets', type: 'MOBILIER' },
  { id: 2, name: 'Meubles TV', type: 'MOBILIER' },
  { id: 3, name: 'Miroirs', type: 'DECORATION' },
  { id: 4, name: 'Portes', type: 'PORTES' },
  { id: 5, name: 'Coffres', type: 'MOBILIER' },
  { id: 6, name: 'Décoration', type: 'DECORATION' },
  { id: 7, name: 'Tables', type: 'MOBILIER' },
]

// ─── Main Admin Catalogue Page ───────────────────────────────────────────────
export default function AdminCataloguePage() {
  const [activeTab, setActiveTab] = useState<'MODELS' | 'QUOTES'>('MODELS')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_FURNITURE_CATEGORIES)
  const [colors, setColors] = useState<ColorSwatch[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Category Management Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [catNameInput, setCatNameInput] = useState('')
  const [catTypeInput, setCatTypeInput] = useState('CATALOGUE')
  const [savingCategory, setSavingCategory] = useState(false)
  const [catModalError, setCatModalError] = useState<string | null>(null)
  const [catModalSuccess, setCatModalSuccess] = useState<string | null>(null)

  // Color Swatch Management Modal State
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<ColorSwatch | null>(null)
  const [colorLabelInput, setColorLabelInput] = useState('')
  const [colorHexInput, setColorHexInput] = useState('#C8794D')
  const [savingColor, setSavingColor] = useState(false)
  const [colorModalError, setColorModalError] = useState<string | null>(null)
  const [colorModalSuccess, setColorModalSuccess] = useState<string | null>(null)

  // Modal State & Step Navigation
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // Quote Inspection Modal
  const [selectedQuoteForInspection, setSelectedQuoteForInspection] = useState<QuoteRequest | null>(null)

  // Search & Filters (Status filter removed per user requirement)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tout')
  const [filterColor, setFilterColor] = useState('Tout')
  const [filterDimension, setFilterDimension] = useState('Tout')
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Form fields (availability is always 'Sur commande' for catalogue items)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('1')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [imageVariants, setImageVariants] = useState<ImageVariant[]>([])

  // Live preview active variant selector
  const [previewVariantIdx, setPreviewVariantIdx] = useState(0)

  // Real-time model count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach(p => {
      const cname = p.category?.name || 'Autre'
      counts[cname] = (counts[cname] || 0) + 1
    })
    return counts
  }, [products])

  useEffect(() => { 
    loadData() 
    loadQuotes()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      let prodData: Product[] = []
      let catData: Category[] = []
      let colorData: ColorSwatch[] = []

      try {
        const res = await adminApi.getProducts()
        if (Array.isArray(res)) prodData = res
      } catch (e) {
        console.warn("Could not load products:", e)
      }

      try {
        const res = await publicApi.getCategories()
        if (Array.isArray(res) && res.length > 0) catData = res
        else catData = DEFAULT_FURNITURE_CATEGORIES
      } catch (e) {
        console.warn("Could not load categories, using defaults:", e)
        catData = DEFAULT_FURNITURE_CATEGORIES
      }

      try {
        const res = await colorsApi.getColors()
        if (Array.isArray(res)) colorData = res
      } catch (e) {
        console.warn("Could not load colors:", e)
      }

      if (colorData && colorData.length > 0) {
        setColors(colorData)
      }

      // Filter strictly CATALOGUE type and exclude door jewelry
      const catProds = prodData.filter(p => p.type === 'CATALOGUE' && !isBijouxOrHandleProduct(p))
      setProducts(catProds)

      // Exclude door jewelry and door handle categories (managed in /admin/bijoux-de-porte)
      let finalCats = catData.filter(c => !isDoorJewelryOrHandleCategory(c.name) && !isBijouxOrHandleCategory(c.name))

      // Also exclude generic 'Décoration' if it has no catalogue items
      finalCats = finalCats.filter(c => {
        const norm = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
        if (norm === 'decoration') {
          return catProds.some(p => p.category?.id === c.id)
        }
        return true
      })

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
      if (finalCats.length > 0) {
        setCategories(finalCats)
        setCategoryId(prev => prev || finalCats[0].id.toString())
      }
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

  // Filter ONLY quotes coming from Catalogue (Sur-mesure / personnalisation)
  const catalogQuotes = useMemo(() => {
    return quotes.filter(q => {
      if (q.product?.type === 'CATALOGUE') return true
      const details = (q.personalizationDetails || q.message || '').toLowerCase()
      const pName = (q.product?.name || '').toLowerCase()
      const isShopOrder = details.includes('panier') || details.includes('commande produit') || details.includes('achat direct')
      const isBijoux = details.includes('bijoux de porte') || details.includes('accessoires') || details.includes('bouton majolique')
      const isEspace = details.includes('espace_exception') || details.includes('résidence')
      if (isShopOrder || isBijoux || isEspace) return false
      return pName.includes('modèle') || pName.includes('modele') || details.includes('finition') || details.includes('catalogue')
    })
  }, [quotes])

  // Auto-naming & auto-description helpers per (Category + Color)
  // Auto-naming helper strictly per Category (Modèle 01..N across ALL colors)
  const getNextModelName = (catId: string, allProds: Product[], allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const catName = cat?.name || 'Création'
    const singular = getCategorySingular(catName)

    const inGroup = allProds.filter(p => {
      return p.category?.id?.toString() === catId || 
        (p.category?.name && p.category.name.trim().toLowerCase() === catName.trim().toLowerCase())
    })
    
    let maxNum = 0
    for (const p of inGroup) {
      const match = p.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    }
    
    // Next consecutive number (e.g. 1..3 -> 4)
    const nextNum = Math.max(1, maxNum + 1).toString().padStart(2, '0')
    return `${singular} — Modèle ${nextNum}`
  }

  const buildAutoDescription = (modelName: string, catId: string, itemColor: string, itemDim: string, allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const singular = getCategorySingular(cat?.name || 'Création')

    const match = modelName.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
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

  // ─── Contiguous Sequential Reordering on Deletion per Category (Modèle 01..N) ──
  const reorderCategoryWithProducts = async (catId: number, currentProductsList: Product[]) => {
    const cat = categories.find(c => c.id === catId)
    const catName = cat?.name || ''
    const singular = getCategorySingular(catName)

    const inGroup = currentProductsList.filter(p => {
      return p.category?.id === catId || 
        (p.category?.name && p.category.name.trim().toLowerCase() === catName.trim().toLowerCase())
    })

    if (inGroup.length === 0) return

    // Sort by current model number, fallback to ID
    const sorted = [...inGroup].sort((a, b) => {
      const matchA = a.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      const matchB = b.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      const numA = matchA ? parseInt(matchA[1], 10) : 999999
      const numB = matchB ? parseInt(matchB[1], 10) : 999999
      if (numA !== numB) return numA - numB
      return a.id - b.id
    })

    const updates: Promise<any>[] = []
    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i]
      const targetNumStr = String(i + 1).padStart(2, '0')
      const targetModelStr = `Modèle ${targetNumStr}`

      let newName = p.name
      if (/(?:Modèle|Modele|N°|#)\s*\d+/i.test(newName)) {
        newName = newName.replace(/(?:Modèle|Modele|N°|#)\s*\d+/i, targetModelStr)
      } else {
        newName = `${singular} — ${targetModelStr}`
      }

      let newDesc = p.description || ''
      if (/(?:Modèle|Modele|N°|#)\s*\d+/i.test(newDesc)) {
        newDesc = newDesc.replace(/(?:Modèle|Modele|N°|#)\s*\d+/gi, targetModelStr)
      }

      if (newName !== p.name || newDesc !== p.description) {
        const payload: ProductRequest = {
          name: newName,
          description: newDesc || buildAutoDescription(newName, p.category.id.toString(), p.color || 'Naturel', p.dimensions || '', categories),
          categoryId: p.category.id,
          dimensions: p.dimensions || 'Moyen',
          materials: p.materials || 'Bois noble & Céramique',
          color: p.color || 'Naturel',
          price: p.price ?? null,
          availability: 'Sur commande',
          type: 'CATALOGUE',
          isFeatured: p.isFeatured ?? true,
          imageVariants: p.images && p.images.length > 0
            ? p.images.map(img => ({ imageUrl: img.imageUrl, colorLabel: img.colorLabel || 'Original' }))
            : [{ imageUrl: '/placeholder.png', colorLabel: 'Original' }]
        }
        updates.push(adminApi.updateProduct(p.id, payload))
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates)
    }
  }

  const reorderAllCategories = async () => {
    if (!confirm("Harmoniser la numérotation de tous les modèles du catalogue (Modèle 01..N par catégorie) ?")) return
    setLoading(true)
    try {
      const catIds = Array.from(new Set(products.map(p => p.category?.id).filter(Boolean)))
      for (const catId of catIds) {
        await reorderCategoryWithProducts(catId as number, products)
      }
      await loadData()
      alert("✅ Tous les modèles de chaque catégorie sont désormais rigoureusement ordonnés dès le Modèle 01 !")
    } catch (err: any) {
      alert("Erreur lors de la réorganisation : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const resolveColorHex = (colorName: string | null | undefined): string => {
    if (!colorName) return '#C4A882'
    const match = colors.find(c => c.name.toLowerCase() === colorName.toLowerCase())
    if (match) return match.hex
    return getColorHex(colorName)
  }

  const handleOpenCategoryModal = (catToEdit?: Category) => {
    if (catToEdit) {
      setEditingCategory(catToEdit)
      setCatNameInput(catToEdit.name)
      setCatTypeInput(catToEdit.type || 'CATALOGUE')
    } else {
      setEditingCategory(null)
      setCatNameInput('')
      setCatTypeInput('CATALOGUE')
    }
    setCatModalError(null)
    setCatModalSuccess(null)
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = catNameInput.trim()
    if (!trimmed) {
      setCatModalError('Veuillez renseigner le nom de la catégorie.')
      return
    }

    setSavingCategory(true)
    setCatModalError(null)
    setCatModalSuccess(null)

    try {
      if (editingCategory) {
        const updated = await adminApi.updateCategory(editingCategory.id, {
          name: trimmed,
          type: catTypeInput || 'CATALOGUE',
        })
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c))
        // Update local products that had this category
        setProducts(prev => prev.map(p => {
          if (p.category?.id === editingCategory.id) {
            return { ...p, category: { ...p.category, name: trimmed } }
          }
          return p
        }))
        if (filterCategory === editingCategory.name) {
          setFilterCategory(trimmed)
        }
        setCatModalSuccess(`Catégorie « ${trimmed} » modifiée avec succès.`)
        setEditingCategory(null)
        setCatNameInput('')
      } else {
        if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
          setCatModalError(`Une catégorie « ${trimmed} » existe déjà.`)
          setSavingCategory(false)
          return
        }
        const created = await adminApi.createCategory({
          name: trimmed,
          type: catTypeInput || 'CATALOGUE',
        })
        setCategories(prev => [...prev, created])
        setCatModalSuccess(`Catégorie « ${trimmed} » créée avec succès.`)
        setCatNameInput('')
      }
    } catch (err: any) {
      setCatModalError(err.message || "Erreur lors de l'enregistrement de la catégorie.")
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    const count = categoryCounts[cat.name] || 0
    if (count > 0) {
      alert(`Impossible de supprimer la catégorie « ${cat.name} » car elle contient ${count} modèle(s).\n\nVeuillez d'abord réaffecter ou supprimer ces modèles avant de supprimer la catégorie.`)
      return
    }

    if (!confirm(`Supprimer définitivement la catégorie « ${cat.name} » du catalogue ?`)) return

    setSavingCategory(true)
    setCatModalError(null)
    setCatModalSuccess(null)

    try {
      await adminApi.deleteCategory(cat.id)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      if (filterCategory === cat.name) {
        setFilterCategory('Tout')
      }
      if (categoryId === cat.id.toString()) {
        setCategoryId('')
      }
      setCatModalSuccess(`Catégorie « ${cat.name} » supprimée.`)
    } catch (err: any) {
      setCatModalError(err.message || "Erreur lors de la suppression de la catégorie.")
    } finally {
      setSavingCategory(false)
    }
  }

  const handleOpenColorModal = (cToEdit?: ColorSwatch) => {
    if (cToEdit) {
      setEditingColor(cToEdit)
      setColorLabelInput(cToEdit.name || cToEdit.label)
      setColorHexInput(cToEdit.hex)
    } else {
      setEditingColor(null)
      setColorLabelInput('')
      setColorHexInput('#C8794D')
    }
    setColorModalError(null)
    setColorModalSuccess(null)
    setColorModalOpen(true)
  }

  const handleSaveColor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = colorLabelInput.trim()
    if (!trimmed) {
      setColorModalError('Veuillez renseigner le nom de la teinte.')
      return
    }
    if (!colorHexInput || !colorHexInput.startsWith('#')) {
      setColorModalError('Veuillez fournir un code hexadécimal valide (ex: #C8794D).')
      return
    }

    setSavingColor(true)
    setColorModalError(null)
    setColorModalSuccess(null)

    try {
      if (editingColor) {
        await colorsApi.updateColor(editingColor.id, {
          label: trimmed,
          hex: colorHexInput,
        })
        setColorModalSuccess(`Teinte « ${trimmed} » modifiée avec succès.`)
        setEditingColor(null)
        setColorLabelInput('')
      } else {
        await colorsApi.createColor({
          label: trimmed,
          hex: colorHexInput,
        })
        setColorModalSuccess(`Teinte « ${trimmed} » ajoutée avec succès au nuancier.`)
        setColorLabelInput('')
      }
      const freshColors = await colorsApi.getColors()
      setColors(freshColors)
    } catch (err: any) {
      setColorModalError(err.message || "Erreur lors de l'enregistrement de la teinte.")
    } finally {
      setSavingColor(false)
    }
  }

  const handleDeleteColor = async (c: ColorSwatch) => {
    const label = c.name || c.label
    if (!confirm(`Supprimer définitivement la teinte « ${label} » du nuancier de l'atelier ?`)) {
      return
    }
    setSavingColor(true)
    setColorModalError(null)
    setColorModalSuccess(null)
    try {
      await colorsApi.deleteColor(c.id)
      const freshColors = await colorsApi.getColors()
      setColors(freshColors)
      if (filterColor === label) {
        setFilterColor('Tout')
      }

      // Reassign any products in the database that had this deleted color
      const affectedProducts = products.filter(p => p.color && p.color.trim().toLowerCase() === label.trim().toLowerCase())
      if (affectedProducts.length > 0) {
        for (const p of affectedProducts) {
          try {
            const payload: ProductRequest = {
              name: p.name,
              description: p.description ? p.description.replace(new RegExp(label, 'gi'), 'Blanc') : '',
              categoryId: p.category?.id || 1,
              dimensions: p.dimensions || '',
              materials: p.materials || '',
              color: 'Blanc',
              price: p.price,
              availability: p.availability || 'Sur commande',
              type: p.type || 'CATALOGUE',
              isFeatured: p.isFeatured,
              imageUrls: p.images ? p.images.map(img => img.imageUrl + (img.colorLabel ? '#color=' + encodeURIComponent(img.colorLabel) : '')) : []
            }
            await adminApi.updateProduct(p.id, payload)
          } catch (pErr) {
            console.warn(`Could not update product ${p.id} after deleting color:`, pErr)
          }
        }
        const refreshedProducts = await publicApi.getProducts()
        setProducts(refreshedProducts)
      }

      setColorModalSuccess(`Teinte « ${label} » supprimée du nuancier.`)
    } catch (err: any) {
      setColorModalError(err.message || "Erreur lors de la suppression de la teinte.")
    } finally {
      setSavingColor(false)
    }
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
    const defaultCatId = categories[0]?.id?.toString() || '1'
    const defaultColor = 'Noyer'
    const defaultName = getNextModelName(defaultCatId, products, categories)
    setCategoryId(defaultCatId)
    setName(defaultName)
    setDescription(buildAutoDescription(defaultName, defaultCatId, defaultColor, 'Moyen (80–150 cm)', categories))
    setDimensions('Moyen (80–150 cm)')
    setMaterials('Noyer massif & Céramique')
    setColor(defaultColor)
    setPrice('')
    setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    setPreviewVariantIdx(0)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalStep(1)
    setName(product.name)
    setDescription(product.description || '')
    setCategoryId(product.category?.id?.toString() || (categories[0]?.id?.toString() || '1'))
    setDimensions(product.dimensions || '')
    setMaterials(product.materials || '')
    setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    
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
    const targetProd = products.find(p => p.id === id)
    const nameStr = targetProd ? `« ${targetProd.name} »` : 'ce modèle'
    if (!confirm(`Supprimer définitivement ${nameStr} du catalogue ?\n\n(Les modèles restants de cette catégorie seront automatiquement réordonnés de 1 à N)`)) return
    
    setLoading(true)
    try {
      await adminApi.deleteProduct(id)
      const remaining = products.filter(p => p.id !== id)
      setProducts(remaining)
      setSelectedIds(prev => prev.filter(x => x !== id))
      
      if (targetProd?.category?.id) {
        await reorderCategoryWithProducts(targetProd.category.id, remaining)
      }
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuoteStatus = async (quoteId: number, status: 'PENDING' | 'CONTACTED' | 'COMPLETED') => {
    try {
      await adminApi.updateQuoteStatus(quoteId, status)
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status } : q))
      if (selectedQuoteForInspection?.id === quoteId) {
        setSelectedQuoteForInspection(prev => prev ? { ...prev, status } : null)
      }
    } catch (err) {
      alert("Erreur de mise à jour du statut.")
    }
  }

  const handleDeleteQuote = async (quoteId: number) => {
    if (!confirm("Supprimer cette demande de devis ?")) return
    try {
      await adminApi.deleteQuoteRequest(quoteId)
      setQuotes(quotes.filter(q => q.id !== quoteId))
      if (selectedQuoteForInspection?.id === quoteId) {
        setSelectedQuoteForInspection(null)
      }
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
      availability: 'Sur commande', // Always 'Sur commande' for catalogue items
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

  // Filtered products calculation (status filter removed)
  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      const q = searchQuery.trim().toLowerCase()
      let matchSearch = true
      if (q) {
        const cleanId = q.replace(/^#/, '').trim()
        const matchId = cleanId !== '' && p.id.toString() === cleanId
        const matchText = p.name.toLowerCase().includes(q) || 
                          (p.description || '').toLowerCase().includes(q) ||
                          (p.materials || '').toLowerCase().includes(q)
        matchSearch = matchId || matchText
      }
      
      const matchCat = filterCategory === 'Tout' || (p.category?.name || '').toLowerCase() === filterCategory.toLowerCase()
      
      let matchColor = true
      if (filterColor !== 'Tout') {
        const fc = filterColor.toLowerCase()
        const pc = (p.color || '').toLowerCase()
        const hasVariant = p.images?.some(img => (img.colorLabel || '').toLowerCase().includes(fc))
        matchColor = pc.includes(fc) || hasVariant
      }

      let matchDim = true
      if (filterDimension !== 'Tout') {
        const fd = filterDimension.toLowerCase()
        const pd = (p.dimensions || '').toLowerCase()
        if (fd.includes('petit')) matchDim = pd.includes('petit')
        else if (fd.includes('moyen')) matchDim = pd.includes('moyen')
        else if (fd.includes('grand')) matchDim = pd.includes('grand')
        else if (fd.includes('sur-mesure')) matchDim = pd.includes('sur-mesure') || pd.includes('personnalisé')
        else matchDim = pd.includes(fd)
      }

      return matchSearch && matchCat && matchColor && matchDim
    })

    // Sort strictly by Category name -> numeric Model number (Modèle 01..N without jumps)!
    return list.sort((a, b) => {
      const catA = (a.category?.name || '').toLowerCase()
      const catB = (b.category?.name || '').toLowerCase()
      if (catA !== catB) return catA.localeCompare(catB)

      const matchA = a.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      const matchB = b.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      const numA = matchA ? parseInt(matchA[1], 10) : 999999
      const numB = matchB ? parseInt(matchB[1], 10) : 999999
      if (numA !== numB) return numA - numB

      return a.id - b.id
    })
  }, [products, searchQuery, filterCategory, filterColor, filterDimension])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) setSelectedIds([])
    else setSelectedIds(filteredProducts.map(p => p.id))
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Supprimer définitivement les ${selectedIds.length} modèle(s) sélectionné(s) du catalogue ?\n\n(Les modèles restants seront automatiquement réordonnés de 1 à N par catégorie)`)) return

    setLoading(true)
    try {
      const selectedProds = products.filter(p => selectedIds.includes(p.id))
      const affectedCatIds = Array.from(new Set(selectedProds.map(p => p.category?.id).filter(Boolean)))

      for (const id of selectedIds) {
        await adminApi.deleteProduct(id)
      }

      const remaining = products.filter(p => !selectedIds.includes(p.id))
      setProducts(remaining)
      setSelectedIds([])

      for (const catId of affectedCatIds) {
        await reorderCategoryWithProducts(catId as number, remaining)
      }
      await loadData()
    } catch (err: any) {
      alert("Erreur lors de la suppression en masse : " + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-[#F5F0E8]">
      
      {/* ─── Top Header Section — Luxury Showroom Aesthetic ──────────────── */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-[#3A2E24]">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8794D] block mb-1">
            Catalogue d&apos;inspiration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#F5F0E8] tracking-tight">
            Nos créations artisanales
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#D9C8AE]/80 max-w-2xl leading-relaxed">
            Découvrez notre collection de meubles et objets artisanaux, conçus avec passion et savoir-faire pour sublimer vos espaces.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenCategoryModal()}
            title="Ajouter, modifier ou supprimer des catégories du catalogue"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#211A15] hover:bg-[#2A211A] border border-[#3A2E24] hover:border-[#B89555] px-4 py-2.5 text-xs font-semibold text-[#D9C8AE] transition-all cursor-pointer shadow-xs"
          >
            <FolderPlus className="size-3.5 text-[#B89555]" />
            <span>Gérer Catégories</span>
          </button>

          <button
            onClick={() => handleOpenColorModal()}
            title="Gérer les teintes, patines et finitions du nuancier de l'atelier"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#211A15] hover:bg-[#2A211A] border border-[#3A2E24] hover:border-[#B89555] px-4 py-2.5 text-xs font-semibold text-[#D9C8AE] transition-all cursor-pointer shadow-xs"
          >
            <Palette className="size-3.5 text-[#B89555]" />
            <span>Nuancier &amp; Couleurs</span>
          </button>

          <button
            onClick={reorderAllCategories}
            title="Harmoniser et s'assurer que chaque catégorie commence au Modèle 01 sans interruption et sans saut de numéro"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#211A15] hover:bg-[#2A211A] border border-[#3A2E24] hover:border-[#B89555] px-4 py-2.5 text-xs font-semibold text-[#D9C8AE] transition-all cursor-pointer shadow-xs"
          >
            <ListOrdered className="size-3.5 text-[#B89555]" />
            <span className="hidden sm:inline">Harmoniser N°</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8794D] via-[#B89555] to-[#C8794D] hover:opacity-95 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>Ajouter un Modèle</span>
          </button>
        </div>
      </div>

      {/* ─── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('MODELS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'MODELS'
              ? 'bg-[#E5D7C5] text-[#15120F] font-bold shadow-xs'
              : 'bg-[#211A15] text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8] border border-[#3A2E24]'
          }`}
        >
          <Bot className="size-3.5" /> 
          <span>Modèles Catalogue ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'QUOTES'
              ? 'bg-[#E5D7C5] text-[#15120F] font-bold shadow-xs'
              : 'bg-[#211A15] text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8] border border-[#3A2E24]'
          }`}
        >
          <Palette className="size-3.5" /> 
          <span>Demandes &amp; Sur-Mesure ({catalogQuotes.length})</span>
          {catalogQuotes.filter(q => q.status === 'PENDING').length > 0 && (
            <span className="bg-[#C8794D] text-white text-[10px] font-bold rounded-full px-1.5 py-0.2 ml-1">
              {catalogQuotes.filter(q => q.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB CONTENT 1: CATALOG MODELS GRID ───────────────────────────── */}
      {activeTab === 'MODELS' && (
        <div className="space-y-4">

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filters & Search Bar — Showroom Palette */}
          <div className="bg-[#211A15] p-3 sm:p-3.5 rounded-2xl border border-[#3A2E24] shadow-md flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between w-full">
              
              {/* Search Box with Model & ID support */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#D9C8AE]/50" />
                <input 
                  type="text" 
                  placeholder="Rechercher : nom, N° (#12), essence, céramique..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#B89555] rounded-xl pl-9 pr-8 py-2 text-xs text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D9C8AE]/50 hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Icon-based Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Category Filter */}
                <div className="relative flex items-center bg-[#15120F] border border-[#3A2E24] focus-within:border-[#B89555] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Layers className="size-3.5 text-[#B89555] mr-1.5 shrink-0" />
                  <select 
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="bg-transparent text-xs text-[#F5F0E8] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#15120F] text-[#F5F0E8]">Catégorie : Toutes ({categories.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name} className="bg-[#15120F] text-[#F5F0E8]">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Color Filter */}
                <div className="relative flex items-center bg-[#15120F] border border-[#3A2E24] focus-within:border-[#B89555] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Palette className="size-3.5 text-[#B89555] mr-1.5 shrink-0" />
                  <select 
                    value={filterColor}
                    onChange={e => setFilterColor(e.target.value)}
                    className="bg-transparent text-xs text-[#F5F0E8] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#15120F] text-[#F5F0E8]">Couleur : Toutes</option>
                    {(colors.length > 0 ? colors : [
                      { id: '1', name: 'Blanc', hex: '#FFFFFF' },
                      { id: '3', name: 'Noir', hex: '#1A1A1A' },
                      { id: '4', name: 'Noyer', hex: '#5C3317' },
                      { id: '5', name: 'Bleu', hex: '#2D5F8A' },
                      { id: '6', name: 'Or', hex: '#C9A84C' },
                      { id: '7', name: 'Naturel', hex: '#C4A882' },
                      { id: '8', name: 'Vert Olivier', hex: '#4A5E3A' },
                      { id: '9', name: 'Bordeaux', hex: '#7B2D3E' }
                    ]).map(c => (
                      <option key={c.id} value={c.name} className="bg-[#15120F] text-[#F5F0E8]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Dimension Filter */}
                <div className="relative flex items-center bg-[#15120F] border border-[#3A2E24] focus-within:border-[#B89555] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Ruler className="size-3.5 text-[#B89555] mr-1.5 shrink-0" />
                  <select 
                    value={filterDimension}
                    onChange={e => setFilterDimension(e.target.value)}
                    className="bg-transparent text-xs text-[#F5F0E8] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#15120F] text-[#F5F0E8]">Dimension : Toutes</option>
                    <option value="Petit" className="bg-[#15120F] text-[#F5F0E8]">Petit (&lt; 80 cm)</option>
                    <option value="Moyen" className="bg-[#15120F] text-[#F5F0E8]">Moyen (80–150 cm)</option>
                    <option value="Grand" className="bg-[#15120F] text-[#F5F0E8]">Grand (&gt; 150 cm)</option>
                    <option value="Sur-mesure" className="bg-[#15120F] text-[#F5F0E8]">Sur-mesure</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(searchQuery || filterCategory !== 'Tout' || filterColor !== 'Tout' || filterDimension !== 'Tout') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterCategory('Tout')
                      setFilterColor('Tout')
                      setFilterDimension('Tout')
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D9C8AE] text-xs transition-colors cursor-pointer shrink-0"
                    title="Réinitialiser tous les filtres"
                  >
                    <RotateCcw className="size-3 text-[#B89555]" />
                    <span className="hidden sm:inline">Effacer</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Bottom Sub-bar: Counter & Bulk Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#3A2E24] text-xs text-[#D9C8AE]/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#D9C8AE] bg-[#2A211A] px-2.5 py-0.5 rounded-full border border-[#3A2E24] text-xs">
                  {filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''}
                </span>
                {selectedIds.length > 0 && (
                  <span className="text-[11px] text-[#D9C8AE]/70 font-medium">
                    ({selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 className="size-3" /> Supprimer ({selectedIds.length})
                  </button>
                )}

                {/* Circular Toggle All Selection Checkbox */}
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#D9C8AE] hover:text-white transition-colors cursor-pointer"
                >
                  <div className={`size-4.5 rounded-full border transition-all flex items-center justify-center ${
                    selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                      ? 'border-[#B89555] bg-[#B89555] text-[#15120F]'
                      : 'border-white/35 bg-black/40'
                  }`}>
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length && (
                      <Check className="size-2.5 stroke-[3]" />
                    )}
                  </div>
                  <span>Tout sélectionner</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── Modern Category Showcase Ribbon ────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* All Models button */}
            <button
              type="button"
              onClick={() => setFilterCategory('Tout')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterCategory === 'Tout'
                  ? 'bg-[#D9C8AE] text-[#15120F] shadow-xs'
                  : 'bg-[#211A15] text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8] border border-[#3A2E24]'
              }`}
            >
              <Sparkles className={`size-3.5 ${filterCategory === 'Tout' ? 'text-[#15120F]' : 'text-[#B89555]'}`} />
              <span>Toutes les créations</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                filterCategory === 'Tout' ? 'bg-[#15120F] text-[#F5F0E8]' : 'bg-[#15120F]/80 text-[#D9C8AE]/70'
              }`}>
                {products.length}
              </span>
            </button>

            {/* Individual Categories */}
            {categories.map(cat => {
              const isSelected = filterCategory === cat.name
              const CatIcon = getCategoryIcon(cat.name)
              const count = categoryCounts[cat.name] || 0

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.name)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#D9C8AE] text-[#15120F] font-bold shadow-xs'
                      : 'bg-[#211A15] text-[#D9C8AE]/80 hover:bg-[#2A211A] hover:text-[#F5F0E8] border border-[#3A2E24]'
                  }`}
                >
                  <CatIcon className={`size-3.5 ${isSelected ? 'text-[#15120F]' : 'text-[#B89555]'}`} />
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-[#15120F] text-[#F5F0E8] font-bold' : 'bg-[#15120F]/80 text-[#D9C8AE]/70'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}

            {/* Quick Manage Categories in Ribbon */}
            <button
              type="button"
              onClick={() => handleOpenCategoryModal()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-[#C8794D]/60 bg-[#C8794D]/10 hover:bg-[#C8794D]/20 text-[#D9C8AE] hover:text-white transition-all cursor-pointer shrink-0"
              title="Ajouter, modifier ou supprimer des catégories"
            >
              <FolderPlus className="size-3.5 text-[#C8794D]" />
              <span>+ Gérer Catégories</span>
            </button>
          </div>

          {/* ─── DENSE 6-COLUMN SHOWROOM PRODUCTS GRID ─────────────────────── */}
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#211A15]/50 rounded-2xl border border-[#3A2E24]">
              <div className="size-8 animate-spin rounded-full border-3 border-[#B89555] border-t-transparent mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#D9C8AE] font-semibold">Chargement des modèles...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#211A15]/60 border border-dashed border-[#3A2E24] rounded-2xl text-center">
              <Bot className="size-10 mb-3 text-[#D9C8AE]/40" />
              <h3 className="font-serif text-lg text-[#F5F0E8] font-medium">Aucun modèle ne correspond à vos filtres</h3>
              <p className="text-xs text-[#D9C8AE]/60 max-w-sm mt-1 mb-4">
                Essayez de modifier votre recherche ou ajoutez un nouveau modèle au catalogue.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9C8AE] text-[#15120F] text-xs font-bold uppercase tracking-wider shadow-xs hover:opacity-95 transition-opacity"
              >
                <Plus className="size-3.5" /> Créer un modèle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5">
              {filteredProducts.map((product) => {
                const primaryImage = product.images?.[0]?.imageUrl || '/placeholder.png'
                const isSelected = selectedIds.includes(product.id)

                return (
                  <article
                    key={product.id}
                    onClick={() => toggleSelect(product.id)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between relative shadow-xs hover:shadow-lg hover:-translate-y-0.5 ${
                      isSelected 
                        ? 'border-[#B89555] ring-1 ring-[#B89555] bg-[#2E241E]' 
                        : 'border-[#3A2E24] bg-[#2A211A] hover:border-[#B89555]/50'
                    }`}
                  >
                    {/* Compact Image Container with 4:3 Aspect Ratio */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#15120F]">
                      <img 
                        src={primaryImage} 
                        alt={product.name} 
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />

                      {/* Top-Left: Model ID Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="font-mono text-[9.5px] font-bold bg-[#15120F]/85 backdrop-blur-xs text-[#D9C8AE] px-1.5 py-0.5 rounded border border-white/10 shadow-xs">
                          #{product.id}
                        </span>
                      </div>

                      {/* Top-Right: Selection Circle */}
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelect(product.id)
                          }}
                          className={`size-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#B89555] border-[#B89555] text-[#15120F] shadow-xs'
                              : 'border-white/35 bg-black/40 hover:border-[#B89555]'
                          }`}
                          title={isSelected ? 'Désélectionner' : 'Sélectionner'}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* Compact Content Area */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                      <div>
                        {/* Title in Editorial Serif */}
                        <h3 
                          className={`font-serif text-[12.5px] font-medium line-clamp-1 leading-snug transition-colors ${
                            isSelected ? 'text-[#F5F0E8] font-semibold' : 'text-[#F5F0E8] group-hover:text-[#D9C8AE]'
                          }`}
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        {/* Meta line: Color dot & Dimension */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#D9C8AE]/75 truncate mt-1">
                          {product.color && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: resolveColorHex(product.color) }} />
                              <span className="truncate">{product.color}</span>
                            </span>
                          )}
                          {product.dimensions && (
                            <span className="inline-flex items-center gap-1 text-[#D9C8AE]/60 truncate">
                              <span>•</span>
                              <span className="truncate">{product.dimensions}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer line: Price & Quick Action Icons */}
                      <div className="pt-1.5 mt-1 border-t border-white/5 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium text-[#D9C8AE]/85 truncate">
                          {product.price ? `${product.price.toLocaleString('fr-FR')} DT` : 'Sur devis'}
                        </span>

                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Link 
                            href={`/produits/${product.id}`} 
                            target="_blank" 
                            className="p-1 rounded text-[#D9C8AE]/50 hover:text-white transition-colors"
                            title="Voir sur le site"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="p-1 rounded text-[#D9C8AE]/50 hover:text-[#B89555] transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-1 rounded text-[#D9C8AE]/50 hover:text-red-400 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT 2: DEMANDES & SUR-MESURE (PRO CLIENT QUOTE CARDS) ── */}
      {activeTab === 'QUOTES' && (
        <div className="space-y-6">
          
          {/* Header & Stats Bar */}
          <div className="bg-[#2E2018]/95 p-5 rounded-3xl border border-[#E6A635]/25 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6A635]/20">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C] border border-[#E6A635]/40 text-[#F2BD52] text-[10.5px] font-bold uppercase tracking-widest mb-1.5">
                  <Sparkles className="size-3" />
                  <span>Demandes Personnalisées d&apos;Atelier</span>
                </div>
                <h2 className="font-heading text-2xl text-[#FAF7F2] font-semibold">
                  Fiches Devis &amp; Commandes Sur-Mesure
                </h2>
                <p className="text-xs text-[#EAE4D9]/80 mt-1">
                  Demandes spécifiques envoyées par les clients depuis le configurateur et le nuancier du catalogue en ligne.
                </p>
              </div>

              <button 
                onClick={loadQuotes} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A110B] border border-[#E6A635]/40 text-[#F2BD52] text-xs font-bold uppercase tracking-wider hover:bg-[#3B271C] transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <RefreshCw className={`size-3.5 ${loadingQuotes ? 'animate-spin' : ''}`} /> Actualiser
              </button>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-[#E6A635]/20 flex items-center justify-between">
                <span className="text-[#EAE4D9]/70">Total Demandes :</span>
                <span className="font-bold text-[#F2BD52] text-sm">{catalogQuotes.length}</span>
              </div>
              <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-300/80">En attente :</span>
                <span className="font-bold text-amber-400 text-sm">
                  {catalogQuotes.filter(q => q.status === 'PENDING').length}
                </span>
              </div>
              <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-blue-500/30 flex items-center justify-between">
                <span className="text-blue-300/80">Contacté :</span>
                <span className="font-bold text-blue-400 text-sm">
                  {catalogQuotes.filter(q => q.status === 'CONTACTED').length}
                </span>
              </div>
              <div className="bg-[#1A110B]/80 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300/80">Confirmé :</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {catalogQuotes.filter(q => q.status === 'COMPLETED').length}
                </span>
              </div>
            </div>
          </div>

          {/* Quotes List / Cards */}
          {loadingQuotes ? (
            <div className="p-16 text-center text-[#EAE4D9]/70 bg-[#2E2018]/50 rounded-3xl border border-[#E6A635]/20">
              <div className="size-10 animate-spin rounded-full border-4 border-[#E6A635] border-t-transparent mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#F2BD52] font-semibold">Chargement des fiches devis...</p>
            </div>
          ) : catalogQuotes.length === 0 ? (
            <div className="p-16 text-center text-[#EAE4D9]/60 bg-[#2E2018]/60 rounded-3xl border border-dashed border-[#E6A635]/30">
              <Bot className="size-12 mx-auto mb-3 text-[#E6A635]/40" />
              <h3 className="font-heading text-lg text-[#FAF7F2] font-medium">Aucune demande de devis catalogue pour le moment</h3>
              <p className="text-xs text-[#EAE4D9]/60 max-w-sm mx-auto mt-1">
                Les demandes formulées par les visiteurs depuis les modèles du catalogue apparaîtront ici avec toutes leurs spécifications sur-mesure.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {catalogQuotes.map((q) => {
                const prod = q.product
                const prodImage = prod?.images?.[0]?.imageUrl || '/placeholder.png'
                const cleanPhone = (q.phoneNumber || '').replace(/[^0-9+]/g, '')
                const waGreeting = encodeURIComponent(`Bonjour ${q.fullName}, suite à votre demande sur notre catalogue Artisanat Aschi concernant le modèle « ${prod?.name || 'Mobilier sur-mesure'} », nos maîtres artisans ont examiné votre projet et nous serions ravis d'en discuter avec vous...`)
                const waLink = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('216') ? cleanPhone : '216' + cleanPhone}?text=${waGreeting}`

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#2E2018]/95 border border-[#E6A635]/25 hover:border-[#E6A635]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
                  >
                    {/* Top Identity Header */}
                    <div className="p-4 sm:p-5 border-b border-[#E6A635]/15 bg-[#1A110B]/60 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Client Avatar initials */}
                        <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#C78318] to-[#F3C45E] text-[#1A110B] font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                          {q.fullName ? q.fullName.slice(0, 2).toUpperCase() : 'CL'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-base font-bold text-[#FAF7F2]">{q.fullName}</h3>
                            <span className="font-mono text-[10px] text-[#F2BD52] bg-[#3B271C] px-1.5 py-0.5 rounded border border-[#E6A635]/30">
                              #DEV-{q.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#EAE4D9]/70 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-[#E6A635]" />
                              {new Date(q.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border shadow-xs ${
                        q.status === 'PENDING' 
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' 
                          : q.status === 'CONTACTED' 
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40' 
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {q.status === 'PENDING' ? 'En attente' : q.status === 'CONTACTED' ? 'Contacté' : 'Confirmé / Confection'}
                      </span>
                    </div>

                    {/* Middle Card Content */}
                    <div className="p-4 sm:p-5 space-y-4 flex-1">
                      
                      {/* Quick Communication Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {q.phoneNumber && (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <MessageCircle className="size-3.5" /> WhatsApp direct
                          </a>
                        )}
                        {q.phoneNumber && (
                          <a 
                            href={`tel:${q.phoneNumber}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A110B] hover:bg-[#3B271C] border border-[#E6A635]/30 text-[#F2BD52] text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Phone className="size-3.5" /> {q.phoneNumber}
                          </a>
                        )}
                        {q.email && (
                          <a 
                            href={`mailto:${q.email}?subject=Devis Artisanat Aschi - Modèle ${prod?.name || 'Catalogue'}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A110B] hover:bg-[#3B271C] border border-[#E6A635]/30 text-[#EAE4D9] text-xs transition-all cursor-pointer"
                          >
                            <Mail className="size-3.5 text-[#F2BD52]" /> {q.email}
                          </a>
                        )}
                      </div>

                      {/* Product Card Highlight */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A110B]/70 border border-[#E6A635]/25">
                        <div className="size-16 rounded-xl overflow-hidden bg-black/50 border border-[#E6A635]/30 shrink-0">
                          <img 
                            src={prodImage} 
                            alt={prod?.name || 'Modèle catalogue'} 
                            className="size-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2BD52]">
                              {prod?.category?.name || 'Modèle Catalogue'}
                            </span>
                            {prod?.id && (
                              <Link 
                                href={`/produits/${prod.id}`} 
                                target="_blank" 
                                className="text-[10.5px] text-[#F2BD52] hover:underline flex items-center gap-0.5 font-medium"
                              >
                                Fiche public <ExternalLink className="size-3" />
                              </Link>
                            )}
                          </div>
                          <h4 className="font-heading text-sm font-bold text-[#FAF7F2] truncate mt-0.5">
                            {prod?.name || 'Modèle du Catalogue'}
                          </h4>
                          <p className="text-[11px] text-[#EAE4D9]/70 truncate">
                            {prod?.materials || 'Bois noble & Faïence artisanale'}
                          </p>
                        </div>
                      </div>

                      {/* Customization Details Block */}
                      <div className="space-y-2 bg-[#241812]/90 p-3.5 rounded-2xl border border-[#E6A635]/20 text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2BD52] flex items-center gap-1">
                          <SlidersHorizontal className="size-3" /> Spécifications Demandées :
                        </span>
                        
                        <div className="text-[#FAF7F2] leading-relaxed whitespace-pre-line font-sans text-xs bg-[#1A110B]/60 p-2.5 rounded-xl border border-white/5">
                          {q.personalizationDetails || q.message || 'Aucune note complémentaire.'}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Status & Management Actions */}
                    <div className="p-4 border-t border-[#E6A635]/20 bg-[#1A110B]/80 flex items-center justify-between gap-2 flex-wrap">
                      {/* Status switcher */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#EAE4D9]/60 mr-1">Statut :</span>
                        <button
                          onClick={() => handleUpdateQuoteStatus(q.id, 'PENDING')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            q.status === 'PENDING' ? 'bg-amber-500 text-[#1A110B]' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                          }`}
                        >
                          En attente
                        </button>
                        <button
                          onClick={() => handleUpdateQuoteStatus(q.id, 'CONTACTED')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            q.status === 'CONTACTED' ? 'bg-blue-500 text-white' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                          }`}
                        >
                          Contacté
                        </button>
                        <button
                          onClick={() => handleUpdateQuoteStatus(q.id, 'COMPLETED')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            q.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-[#EAE4D9]/60 hover:text-white'
                          }`}
                        >
                          Validé
                        </button>
                      </div>

                      {/* Modal view & Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQuoteForInspection(q)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3B271C] hover:bg-[#4A3224] border border-[#E6A635]/40 text-[#F2BD52] text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          <FileText className="size-3.5" /> Fiche complète
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Supprimer cette demande"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Inspection Modal for Quote Details */}
          {selectedQuoteForInspection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#211A15] border border-[#3A2E24] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#F5F0E8] max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-5 border-b border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-[#C8794D]/20 border border-[#C8794D]/30 text-[#C8794D] flex items-center justify-center font-bold">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#F5F0E8]">
                        Fiche Complète de Devis Atelier #{selectedQuoteForInspection.id}
                      </h3>
                      <p className="text-xs text-[#D9C8AE]/70">
                        Date de réception : {new Date(selectedQuoteForInspection.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedQuoteForInspection(null)}
                    className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#D9C8AE] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Client Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24] text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#C8794D]">Nom du client</p>
                      <p className="font-semibold text-[#F5F0E8] mt-0.5">{selectedQuoteForInspection.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#C8794D]">Téléphone</p>
                      <p className="font-semibold text-[#F5F0E8] mt-0.5">{selectedQuoteForInspection.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#C8794D]">Email</p>
                      <p className="font-semibold text-[#F5F0E8] mt-0.5 truncate">{selectedQuoteForInspection.email}</p>
                    </div>
                  </div>

                  {/* Product Highlight */}
                  {selectedQuoteForInspection.product && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24]">
                      <div className="size-20 rounded-xl overflow-hidden bg-black/60 border border-[#3A2E24] shrink-0">
                        <img 
                          src={selectedQuoteForInspection.product.images?.[0]?.imageUrl || '/placeholder.png'} 
                          alt={selectedQuoteForInspection.product.name} 
                          className="size-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8794D]">
                          {selectedQuoteForInspection.product.category?.name || 'Catalogue'}
                        </span>
                        <h4 className="font-heading text-base font-bold text-[#F5F0E8]">
                          {selectedQuoteForInspection.product.name}
                        </h4>
                        <p className="text-xs text-[#D9C8AE]/70 mt-0.5">
                          {selectedQuoteForInspection.product.materials || 'Bois noble & Faïence d’art'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full Specifications */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold text-[#C8794D] tracking-wider">
                      Détails de Personnalisation &amp; Notes
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24] text-sm leading-relaxed text-[#F5F0E8] whitespace-pre-line">
                      {selectedQuoteForInspection.personalizationDetails || selectedQuoteForInspection.message}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
                  <button 
                    onClick={() => window.print()} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#D9C8AE] cursor-pointer"
                  >
                    <Printer className="size-3.5" /> Imprimer la fiche
                  </button>
                  <button 
                    onClick={() => setSelectedQuoteForInspection(null)} 
                    className="px-5 py-2 rounded-full bg-[#C8794D] hover:bg-[#B5673C] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </div>
      )}

      {/* ─── Floating Bulk Action Bar ─────────────────────────────────────── */}
      {selectedIds.length > 0 && activeTab === 'MODELS' && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-[#211A15] text-[#F5F0E8] px-6 py-3 rounded-full shadow-2xl border border-[#3A2E24] backdrop-blur-xl"
        >
          <span className="text-xs font-bold text-[#C8794D]">{selectedIds.length} modèle(s) sélectionné(s)</span>
          <div className="w-px h-4 bg-[#3A2E24]" />
          <button 
            onClick={handleBulkDelete} 
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="size-3.5" /> Supprimer la sélection
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-[11px] text-[#D9C8AE]/60 hover:text-[#F5F0E8] underline ml-2 cursor-pointer"
          >
            Annuler
          </button>
        </motion.div>
      )}

      {/* ─── Multi-step Tabbed Modal with Sticky Footer ───────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="bg-[#211A15] border border-[#3A2E24] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-[#F5F0E8]"
          >
            {/* Modal Header with Steps Indicator */}
            <header className="p-5 sm:p-6 border-b border-[#3A2E24] bg-[#1A1410] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-2xl bg-[#C8794D]/20 border border-[#C8794D]/30 flex items-center justify-center text-[#C8794D] shadow-md">
                    {editingProduct ? <Edit2 className="size-5" /> : <Plus className="size-5" />}
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-[#F5F0E8]">
                      {editingProduct ? 'Modifier le modèle du catalogue' : 'Ajouter un nouveau modèle au catalogue'}
                    </h2>
                    <p className="text-xs text-[#D9C8AE]/70">
                      Configuration des dimensions, essences et variantes visuelles.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#D9C8AE] hover:text-[#F5F0E8] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Step Tabs Nav */}
              <div className="grid grid-cols-3 gap-2 border-t border-[#3A2E24] pt-3">
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
                        ? 'bg-[#2A211A] border-[#C8794D] text-[#F5F0E8] shadow-sm'
                        : 'bg-[#15120F]/60 border-[#3A2E24]/60 text-[#D9C8AE]/60 hover:text-[#F5F0E8] hover:bg-[#15120F]'
                    }`}
                  >
                    <p className={`text-xs font-bold ${modalStep === s.step ? 'text-[#C8794D]' : ''}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-[#D9C8AE]/50 truncate">{s.desc}</p>
                  </button>
                ))}
              </div>
            </header>

            {/* Modal Body with Scrollable Area */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* ── STEP 1: INFORMATIONS DE BASE ── */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Model Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold flex items-center gap-1">
                          <span>Nom du modèle</span> <span className="text-red-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextName = getNextModelName(categoryId, products, categories)
                            setName(nextName)
                            setDescription(buildAutoDescription(nextName, categoryId, color, dimensions, categories))
                          }}
                          className="text-[10.5px] text-[#C8794D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          title="Générer automatiquement le numéro de modèle suivant"
                        >
                          <RefreshCw className="size-3" /> N° suivant auto
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Buffet — Modèle 01" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F0E8] outline-none font-semibold" 
                        />
                      </div>
                    </div>

                    {/* Modern Interactive Category Selection */}
                    <div className="space-y-2.5 sm:col-span-2 bg-[#15120F] p-4 sm:p-5 rounded-2xl border border-[#3A2E24]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold flex items-center gap-1.5">
                          <Layers className="size-4 text-[#C8794D]" />
                          <span>Choisir la Catégorie du Modèle</span> <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryModal()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] hover:border-[#C8794D] text-[#D9C8AE] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                          >
                            <FolderPlus className="size-3 text-[#C8794D]" />
                            <span>+ Nouvelle / Gérer</span>
                          </button>
                          <span className="text-[11px] text-[#C8794D] font-semibold bg-[#211A15] px-2.5 py-1 rounded-full border border-[#3A2E24]">
                            {categories.find(c => c.id.toString() === categoryId)?.name || 'Sélection requise'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        {categories.map(cat => {
                          const isSelected = categoryId === cat.id.toString()
                          const CatIcon = getCategoryIcon(cat.name)
                          const count = categoryCounts[cat.name] || 0
                          const singular = getCategorySingular(cat.name)

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleCategoryChange(cat.id.toString())}
                              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group ${
                                isSelected
                                  ? 'bg-[#2A211A] border-[#C8794D] shadow-[0_0_15px_rgba(200,121,77,0.25)] ring-1 ring-[#C8794D]'
                                  : 'bg-[#1A1410] border-[#3A2E24] hover:border-[#C8794D]/60 hover:bg-[#211A15] text-[#D9C8AE]/80 hover:text-white'
                              }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className={`p-2 rounded-xl transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-[#C8794D] text-white shadow-md scale-105' 
                                    : 'bg-[#211A15] text-[#C8794D] group-hover:bg-[#2A211A]'
                                }`}>
                                  <CatIcon className="size-4" />
                                </div>

                                {isSelected ? (
                                  <span className="flex items-center justify-center size-5 rounded-full bg-[#C8794D] text-white shadow-xs">
                                    <Check className="size-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-[#D9C8AE]/50 bg-[#211A15] px-1.5 py-0.5 rounded border border-[#3A2E24]">
                                    {count}
                                  </span>
                                )}
                              </div>

                              <div>
                                <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-[#F5F0E8]' : 'text-[#D9C8AE]'}`}>
                                  {cat.name}
                                </p>
                                <p className="text-[10px] text-[#D9C8AE]/60 truncate mt-0.5">
                                  {singular} &bull; {count} modèle{count > 1 ? 's' : ''}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Unified Dimensions Control */}
                    <div className="space-y-2 sm:col-span-2 bg-[#15120F] p-4 rounded-2xl border border-[#3A2E24]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold flex items-center gap-1.5">
                          <Ruler className="size-4 text-[#C8794D]" />
                          <span>Format &amp; Dimensions</span>
                        </label>
                        <span className="text-[10.5px] text-[#D9C8AE]/70 italic">Sélection rapide ou cotes exactes</span>
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
                                  ? 'bg-[#C8794D] text-white border-[#C8794D] font-bold shadow-md'
                                  : 'bg-[#211A15] text-[#D9C8AE] border-[#3A2E24] hover:border-[#C8794D]/50'
                              }`}
                            >
                              <p className="text-xs font-bold">{qd.label}</p>
                              <p className="text-[10px] opacity-75">{qd.desc}</p>
                            </button>
                          )
                        })}
                      </div>

                      {/* Custom free-text field */}
                      <div className="pt-2">
                        <input 
                          type="text" 
                          placeholder="Ex: 180 x 50 x 85 cm ou Format Grand sur-mesure" 
                          value={dimensions} 
                          onChange={e => handleDimensionsChange(e.target.value)} 
                          className="w-full bg-[#211A15] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2 text-xs text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none" 
                        />
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold">
                        Matériaux &amp; Essences de bois
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Noyer massif & Céramique d'art" 
                        value={materials} 
                        onChange={e => setMaterials(e.target.value)} 
                        className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F0E8] outline-none" 
                      />
                    </div>

                    {/* Price (Optional) */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold">
                        Prix indicatif (DT) <span className="text-[10px] font-normal text-[#D9C8AE]/60">(Optionnel)</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="Laisser vide pour « Sur devis »" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F0E8] outline-none" 
                      />
                    </div>

                    {/* Color Preset Palette for Original */}
                    <div className="space-y-2 sm:col-span-2 bg-[#15120F] p-4 rounded-2xl border border-[#3A2E24]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold flex items-center gap-1.5">
                          <Palette className="size-4 text-[#C8794D]" />
                          <span>Finition / Teinte Principale de l&apos;Original</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenColorModal()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] hover:border-[#C8794D] text-[#D9C8AE] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          <Palette className="size-3 text-[#C8794D]" />
                          <span>+ Nouvelle / Gérer Nuancier</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(colors.length > 0 ? colors : [
                          { id: '1', name: 'Blanc', hex: '#FFFFFF' },
                          { id: '3', name: 'Noir', hex: '#1A1A1A' },
                          { id: '4', name: 'Noyer', hex: '#5C3317' },
                          { id: '5', name: 'Bleu', hex: '#2D5F8A' },
                          { id: '6', name: 'Or', hex: '#C9A84C' },
                          { id: '7', name: 'Naturel', hex: '#C4A882' },
                          { id: '8', name: 'Vert Olivier', hex: '#4A5E3A' },
                          { id: '9', name: 'Bordeaux', hex: '#7B2D3E' }
                        ]).map(preset => {
                          const isSelected = color === preset.name
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleColorChange(preset.name)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#C8794D] bg-[#C8794D]/25 text-[#F5F0E8] shadow-sm'
                                  : 'border-[#3A2E24] bg-[#211A15] text-[#D9C8AE]/70 hover:border-[#3A2E24]/80 hover:text-white'
                              }`}
                            >
                              <div className="size-3 rounded-full border border-white/30" style={{ backgroundColor: preset.hex }} />
                              {preset.name}
                            </button>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => handleColorChange('')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                            color && !(colors.length > 0 ? colors : COLOR_PRESETS).some(c => ('name' in c ? c.name : c.label) === color)
                              ? 'border-[#C8794D] bg-[#C8794D]/25 text-[#F5F0E8]'
                              : 'border-[#3A2E24] bg-[#211A15] text-[#D9C8AE]/70 hover:border-[#3A2E24]/80 hover:text-white'
                          }`}
                        >
                          Autre…
                        </button>
                      </div>
                      {(!color || !(colors.length > 0 ? colors : COLOR_PRESETS).some(c => ('name' in c ? c.name : c.label) === color)) && (
                        <input 
                          type="text" 
                          placeholder="Précisez la couleur personnalisée (ex: Noyer Foncé Ciselé Or)..." 
                          value={color} 
                          onChange={e => handleColorChange(e.target.value)} 
                          className="w-full mt-2 bg-[#211A15] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3 py-2 text-xs text-[#F5F0E8] outline-none" 
                        />
                      )}
                    </div>
                  </div>

                  {/* Auto-description text area */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-[#C8794D] font-bold">
                        Description Artisanale
                      </label>
                      <button
                        type="button"
                        onClick={() => setDescription(buildAutoDescription(name, categoryId, color, dimensions, categories))}
                        className="text-xs text-[#C8794D] hover:text-white flex items-center gap-1 font-semibold underline cursor-pointer"
                      >
                        <Sparkles className="size-3" /> Régénérer automatiquement
                      </button>
                    </div>
                    <textarea 
                      rows={3} 
                      placeholder="Description détaillée du modèle..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-2xl p-3.5 text-xs sm:text-sm text-[#F5F0E8] outline-none leading-relaxed" 
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
                    colors={colors}
                  />
                </div>
              )}

              {/* ── STEP 3: APERÇU EN DIRECT (LIVE PREVIEW) ── */}
              {modalStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-[#15120F] border border-[#3A2E24] text-xs text-[#D9C8AE]/80 flex items-center gap-2">
                    <Info className="size-4 text-[#C8794D] shrink-0" />
                    <span>Voici le rendu exact de la carte tel qu&apos;il apparaîtra dans le catalogue et dans le tableau de bord.</span>
                  </div>

                  {/* Live Card Preview */}
                  <div className="max-w-md mx-auto bg-[#2A211A] border border-[#3A2E24] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative aspect-[4/3] bg-[#15120F]">
                      <img 
                        src={imageVariants[previewVariantIdx]?.imageUrl || imageVariants[0]?.imageUrl || '/placeholder.png'} 
                        alt={name} 
                        className="size-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#15120F] via-transparent to-black/30 opacity-80" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#15120F]/85 border border-[#3A2E24] px-3 py-1 backdrop-blur-md">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5F0E8]">
                          {categories.find(c => c.id.toString() === categoryId)?.name || 'Catalogue'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-[#211A15] text-[#C8794D] border border-[#3A2E24] backdrop-blur-md">
                          Sur commande
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-heading text-lg font-bold text-[#F5F0E8]">{name || 'Nom du Modèle'}</h3>
                      <p className="text-xs text-[#D9C8AE]/80 line-clamp-2">{description || 'Description du modèle...'}</p>

                      {/* Interactive variant pill tester */}
                      {imageVariants.length > 1 && (
                        <div className="pt-2">
                          <p className="text-[10px] uppercase tracking-wider text-[#C8794D] font-bold mb-1.5">Variantes visuelles :</p>
                          <div className="flex flex-wrap gap-1.5">
                            {imageVariants.map((iv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPreviewVariantIdx(idx)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                                  previewVariantIdx === idx 
                                    ? 'bg-[#C8794D] text-white border-[#C8794D]' 
                                    : 'bg-[#15120F] text-[#D9C8AE]/70 border-[#3A2E24]'
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

            {/* ── STICKY MODAL FOOTER ── */}
            <footer className="sticky bottom-0 z-30 p-4 sm:p-5 border-t border-[#3A2E24] bg-[#1A1410] backdrop-blur-xl flex items-center justify-between gap-3">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-5 py-2.5 rounded-full border border-[#3A2E24] text-xs font-bold uppercase tracking-wider text-[#D9C8AE] hover:bg-white/5 transition-all cursor-pointer"
              >
                Annuler
              </button>

              <div className="flex items-center gap-2">
                {modalStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setModalStep((modalStep - 1) as any)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full border border-[#3A2E24] text-xs font-bold uppercase tracking-wider text-[#D9C8AE] hover:bg-[#2A211A] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="size-4" /> Précédent
                  </button>
                )}

                {modalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setModalStep((modalStep + 1) as any)}
                    className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] text-xs font-bold uppercase tracking-wider text-[#F5F0E8] transition-all cursor-pointer shadow-md"
                  >
                    Suivant <ChevronRight className="size-4" />
                  </button>
                ) : null}

                <button 
                  type="button"
                  onClick={() => handleSubmit()} 
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C8794D] to-[#A85F37] hover:brightness-110 active:scale-95 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#C8794D]/30 cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-4 stroke-[3]" />
                  <span>{saving ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Enregistrer'}</span>
                </button>
              </div>
            </footer>

          </motion.div>
        </div>
      )}

      {/* ─── CATEGORY MANAGEMENT MODAL ─── */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="bg-[#211A15] border border-[#3A2E24] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-[#F5F0E8]"
          >
            {/* Header */}
            <header className="p-5 sm:p-6 border-b border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[#C8794D]/20 border border-[#C8794D]/30 flex items-center justify-center text-[#C8794D] shadow-md">
                  <FolderPlus className="size-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#F5F0E8]">
                    Gestion des Catégories du Catalogue
                  </h2>
                  <p className="text-xs text-[#D9C8AE]/70">
                    Ajoutez, modifiez le libellé ou supprimez des catégories de vos créations artisanales.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#D9C8AE] hover:text-[#F5F0E8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Alert Feedback */}
              {catModalError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 text-red-400 shrink-0" />
                  <span>{catModalError}</span>
                </div>
              )}
              {catModalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>{catModalSuccess}</span>
                </div>
              )}

              {/* Add / Edit Category Form */}
              <form onSubmit={handleSaveCategory} className="bg-[#15120F] border border-[#3A2E24] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C8794D] flex items-center gap-1.5">
                    {editingCategory ? <Edit2 className="size-3.5" /> : <Plus className="size-3.5" />}
                    <span>{editingCategory ? `Modifier « ${editingCategory.name} »` : 'Ajouter une nouvelle catégorie'}</span>
                  </span>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null)
                        setCatNameInput('')
                        setCatModalError(null)
                        setCatModalSuccess(null)
                      }}
                      className="text-xs text-[#D9C8AE]/60 hover:text-white underline cursor-pointer"
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bibliothèques, Paravents, Consoles..."
                    value={catNameInput}
                    onChange={e => setCatNameInput(e.target.value)}
                    className="flex-1 bg-[#211A15] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none font-semibold transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8794D] to-[#A85F37] hover:brightness-110 active:scale-95 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#C8794D]/30 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Check className="size-4 stroke-[3]" />
                    <span>{savingCategory ? 'Patientez...' : editingCategory ? 'Mettre à jour' : 'Ajouter'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider text-[#D9C8AE]/70 font-bold">
                    Catégories actuelles ({categories.length})
                  </h3>
                  <span className="text-[11px] text-[#D9C8AE]/50">
                    Cliquez sur l'icône crayon pour renommer
                  </span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {categories.map(cat => {
                    const CatIcon = getCategoryIcon(cat.name)
                    const count = categoryCounts[cat.name] || 0
                    const isBeingEdited = editingCategory?.id === cat.id

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          isBeingEdited
                            ? 'bg-[#2A211A] border-[#C8794D] shadow-md ring-1 ring-[#C8794D]'
                            : 'bg-[#15120F] border-[#3A2E24] hover:border-[#3A2E24]/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isBeingEdited
                              ? 'bg-[#C8794D] text-white'
                              : 'bg-[#211A15] text-[#C8794D] border border-[#3A2E24]'
                          }`}>
                            <CatIcon className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[#F5F0E8] truncate">
                              {cat.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10.5px] font-mono text-[#D9C8AE]/60">
                                {count} modèle{count > 1 ? 's' : ''}
                              </span>
                              <span className="text-[10px] text-white/30">&bull;</span>
                              <span className="text-[10px] uppercase font-bold text-[#C8794D]/70">
                                {cat.type || 'CATALOGUE'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#D9C8AE] hover:text-white transition-colors cursor-pointer"
                            title="Modifier le libellé de cette catégorie"
                          >
                            <Edit2 className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              count > 0
                                ? 'bg-white/5 text-white/20 hover:text-red-400/50 hover:bg-red-500/10'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300'
                            }`}
                            title={
                              count > 0
                                ? `Contient ${count} modèle(s) — réaffectez ou supprimez les modèles pour pouvoir supprimer la catégorie`
                                : 'Supprimer définitivement cette catégorie'
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <footer className="p-4 sm:p-5 border-t border-[#3A2E24] bg-[#1A1410] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] text-xs font-bold uppercase tracking-wider text-[#F5F0E8] transition-all cursor-pointer shadow-md"
              >
                Fermer
              </button>
            </footer>

          </motion.div>
        </div>
      )}

      {/* ─── COLOR SWATCH & NUANCIER MANAGEMENT MODAL ─── */}
      {colorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="bg-[#211A15] border border-[#3A2E24] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-[#F5F0E8]"
          >
            {/* Header */}
            <header className="p-5 sm:p-6 border-b border-[#3A2E24] bg-[#1A1410] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[#C8794D]/20 border border-[#C8794D]/30 flex items-center justify-center text-[#C8794D] shadow-md">
                  <Palette className="size-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#F5F0E8]">
                    Nuancier &amp; Couleurs de l&apos;Atelier
                  </h2>
                  <p className="text-xs text-[#D9C8AE]/70">
                    Ajoutez, modifiez ou supprimez des teintes appliquées aux modèles du catalogue.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setColorModalOpen(false)}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#D9C8AE] hover:text-[#F5F0E8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Alert Feedback */}
              {colorModalError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 text-red-400 shrink-0" />
                  <span>{colorModalError}</span>
                </div>
              )}
              {colorModalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>{colorModalSuccess}</span>
                </div>
              )}

              {/* Add / Edit Color Form */}
              <form onSubmit={handleSaveColor} className="bg-[#15120F] border border-[#3A2E24] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C8794D] flex items-center gap-1.5">
                    {editingColor ? <Edit2 className="size-3.5" /> : <Plus className="size-3.5" />}
                    <span>{editingColor ? `Modifier « ${editingColor.name || editingColor.label} »` : 'Ajouter une nouvelle teinte'}</span>
                  </span>
                  {editingColor && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingColor(null)
                        setColorLabelInput('')
                        setColorHexInput('#C8794D')
                        setColorModalError(null)
                        setColorModalSuccess(null)
                      }}
                      className="text-xs text-[#D9C8AE]/60 hover:text-white underline cursor-pointer"
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>

                {/* Live Swatch Preview */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#211A15] border border-[#3A2E24]">
                  <div
                    className="size-12 rounded-xl border-2 border-white/20 shadow-inner shrink-0 relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: colorHexInput }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/30 pointer-events-none" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#C8794D] font-bold">Aperçu en Direct</span>
                    <p className="font-bold text-xs sm:text-sm text-[#F5F0E8] truncate">
                      {colorLabelInput || 'Nom de la teinte'}
                    </p>
                    <p className="font-mono text-[11px] text-[#D9C8AE]/70 uppercase">{colorHexInput}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Name Input */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D9C8AE]/80 font-bold">
                      Intitulé de la teinte
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Noyer Miel, Patine Or, Vert Olivier..."
                      value={colorLabelInput}
                      onChange={e => setColorLabelInput(e.target.value)}
                      className="w-full bg-[#211A15] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none font-semibold transition-colors"
                    />
                  </div>

                  {/* Hex + Pipette Picker */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#D9C8AE]/80 font-bold">
                      Code Hexadécimal &amp; Pipette
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative size-9 rounded-xl overflow-hidden border border-[#3A2E24] shrink-0 cursor-pointer shadow-xs">
                        <input
                          type="color"
                          value={colorHexInput}
                          onChange={e => setColorHexInput(e.target.value)}
                          className="absolute -inset-2 size-16 cursor-pointer border-0 p-0"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="#C8794D"
                        value={colorHexInput}
                        onChange={e => setColorHexInput(e.target.value)}
                        className="flex-1 bg-[#211A15] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-[#F5F0E8] uppercase outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingColor}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8794D] to-[#A85F37] hover:brightness-110 active:scale-95 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#C8794D]/30 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="size-4 stroke-[3]" />
                    <span>{savingColor ? 'Patientez...' : editingColor ? 'Mettre à jour la teinte' : 'Ajouter au nuancier'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Colors Swatches Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider text-[#D9C8AE]/70 font-bold">
                    Nuancier actuel ({colors.length} teintes)
                  </h3>
                  <span className="text-[11px] text-[#D9C8AE]/50">
                    Gérez les teintes disponibles dans le catalogue
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {colors.map(c => {
                    const label = c.name || c.label
                    const isBeingEdited = editingColor?.id === c.id

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isBeingEdited
                            ? 'bg-[#2A211A] border-[#C8794D] shadow-md ring-1 ring-[#C8794D]'
                            : 'bg-[#15120F] border-[#3A2E24] hover:border-[#3A2E24]/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="size-8 rounded-full border-2 border-white/20 shadow-md shrink-0 relative overflow-hidden"
                            style={{ backgroundColor: c.hex }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/25 pointer-events-none" />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenColorModal(c)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D9C8AE] hover:text-white transition-colors cursor-pointer"
                              title="Modifier cette teinte"
                            >
                              <Edit2 className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColor(c)}
                              className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Supprimer du nuancier"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#F5F0E8] truncate" title={label}>
                            {label}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-mono text-[10px] text-[#D9C8AE]/60 uppercase">{c.hex}</span>
                            {c.isDefault && (
                              <span className="text-[8.5px] uppercase tracking-wider text-[#C8794D] bg-[#C8794D]/10 px-1 rounded border border-[#C8794D]/20">
                                Standard
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <footer className="p-4 sm:p-5 border-t border-[#3A2E24] bg-[#1A1410] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setColorModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#2A211A] hover:bg-[#322820] border border-[#3A2E24] text-xs font-bold uppercase tracking-wider text-[#F5F0E8] transition-all cursor-pointer shadow-md"
              >
                Fermer
              </button>
            </footer>

          </motion.div>
        </div>
      )}

    </div>
  )
}
