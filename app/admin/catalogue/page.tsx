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

export const getCategorySingular = (catName: string): string => {
  if (!catName) return 'Création'
  const singular = catName.trim()
  const lower = singular.toLowerCase()
  if (lower.includes('lustre')) return 'Lustre'
  if (lower.includes('porte bijou') || lower.includes('porte bijoux') || lower.includes('porte-bijou')) return 'Porte-Bijoux'
  if (lower.includes('lampe') || lower.includes('coffre')) return 'Lampe Coffre'
  if (lower.includes('meuble')) return 'Meuble TV'
  if (lower.endsWith('s') && !lower.endsWith('meubles tv')) return singular.slice(0, -1)
  return singular
}

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

// ─── Image Variant Manager ───────────────────────────────────────────────────
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
      <div className="flex items-center justify-between pb-2 border-b border-[#E6A635]/20">
        <div>
          <h3 className="text-sm font-bold text-[#FAF7F2] uppercase tracking-wider flex items-center gap-2">
            <Palette className="size-4 text-[#F2BD52]" />
            <span>Nuancier & Variantes Photos du Modèle</span>
          </h3>
          <p className="text-xs text-[#EAE4D9]/70">
            La 1ère photo est l&apos;originale d&apos;atelier. Ajoutez d&apos;autres photos ou rendus de teintes (Bleu, Noir, Blanc, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider shadow hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[3]" /> Ajouter une photo
        </button>
      </div>

      <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
        {variants.map((v, idx) => {
          const isOriginal = idx === 0
          const isCustom = v.colorLabel && !ALL_PRESETS.slice(0, -1).some(p => p.label === v.colorLabel)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 transition-all ${
                isOriginal
                  ? 'border-[#E6A635]/40 bg-[#3B271C]/70 shadow-md'
                  : 'border-[#E6A635]/20 bg-[#241812]/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isOriginal 
                      ? 'bg-[#E6A635] text-[#1A110B]' 
                      : 'bg-white/10 text-[#EAE4D9]'
                  }`}>
                    {isOriginal ? 'Photo Principale (Original Atelier)' : `Variante ${idx + 1}`}
                  </span>
                  {v.colorLabel && (
                    <span className="text-xs text-[#F2BD52] font-semibold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#F2BD52]" />
                      {v.colorLabel}
                    </span>
                  )}
                </div>

                {!isOriginal && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 rounded-md text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
  const [categoryId, setCategoryId] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
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
      // Filter strictly CATALOGUE type
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
    setCategoryId(product.category?.id.toString() || '')
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
      await adminApi.deleteQuote(quoteId)
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
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={reorderAllCategoriesAndColors}
            title="Harmoniser et s'assurer que chaque catégorie et couleur commence au Modèle 01 sans interruption"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#241812] hover:bg-[#3B271C] border border-[#E6A635]/40 hover:border-[#F2BD52] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#F2BD52] transition-all cursor-pointer shadow-sm"
          >
            <ListOrdered className="size-4" />
            <span className="hidden sm:inline">Harmoniser N° Modèles</span>
          </button>

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
          <span>Demandes & Sur-Mesure Catalogue ({catalogQuotes.length})</span>
          {catalogQuotes.filter(q => q.status === 'PENDING').length > 0 && (
            <span className="bg-[#B91C1C] text-white text-[10px] font-black rounded-full px-2 py-0.5 ml-1 animate-pulse">
              {catalogQuotes.filter(q => q.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB CONTENT 1: CATALOG MODELS GRID ───────────────────────────── */}
      {activeTab === 'MODELS' && (
        <div className="space-y-6">
          
          {/* Note Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-[#E6A635]/30 bg-[#3B271C]/75 p-4 text-xs text-[#FAF7F2] shadow-md backdrop-blur-md">
            <Sparkles className="size-4 text-[#F2BD52] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#F2BD52]">Collection Catalogue :</span>{' '}
              <span className="text-[#EAE4D9]/90">
                Ces créations sont des modèles de référence artisanaux fabriqués sur-mesure pour chaque client (sélection de teinte, dimensions au centimètre près). Les modèles sont ordonnés consécutivement dès le Modèle 01.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="size-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filters & Search Bar with Icons (Status filter removed) */}
          <div className="bg-[#2E2018]/95 p-3.5 sm:p-4 rounded-2xl border border-[#E6A635]/25 shadow-xl backdrop-blur-md flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between w-full">
              
              {/* Search Box with Model & ID support */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#F2BD52]" />
                <input 
                  type="text" 
                  placeholder="Recherche : nom, N° (#12), essence, céramique..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A110B]/85 border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#EAE4D9]/40 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EAE4D9]/60 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Icon-based Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Category Filter */}
                <div className="relative flex items-center bg-[#1A110B]/85 border border-[#E6A635]/30 focus-within:border-[#F2BD52] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Layers className="size-3.5 text-[#F2BD52] mr-1.5 shrink-0" />
                  <select 
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="bg-transparent text-xs text-[#FAF7F2] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#241812] text-[#FAF7F2]">Catégorie : Toutes ({categories.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name} className="bg-[#241812] text-[#FAF7F2]">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Color Filter */}
                <div className="relative flex items-center bg-[#1A110B]/85 border border-[#E6A635]/30 focus-within:border-[#F2BD52] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Palette className="size-3.5 text-[#F2BD52] mr-1.5 shrink-0" />
                  <select 
                    value={filterColor}
                    onChange={e => setFilterColor(e.target.value)}
                    className="bg-transparent text-xs text-[#FAF7F2] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#241812] text-[#FAF7F2]">Couleur : Toutes</option>
                    <option value="Blanc" className="bg-[#241812] text-[#FAF7F2]">⚪ Blanc</option>
                    <option value="Blanc Cérusé" className="bg-[#241812] text-[#FAF7F2]">📜 Blanc Cérusé</option>
                    <option value="Noir" className="bg-[#241812] text-[#FAF7F2]">⚫ Noir</option>
                    <option value="Noyer" className="bg-[#241812] text-[#FAF7F2]">🟤 Noyer</option>
                    <option value="Bleu" className="bg-[#241812] text-[#FAF7F2]">🔵 Bleu</option>
                    <option value="Or" className="bg-[#241812] text-[#FAF7F2]">🟡 Or / Doré</option>
                    <option value="Naturel" className="bg-[#241812] text-[#FAF7F2]">🪵 Bois Naturel</option>
                    <option value="Vert Olivier" className="bg-[#241812] text-[#FAF7F2]">🟢 Vert Olivier</option>
                    <option value="Bordeaux" className="bg-[#241812] text-[#FAF7F2]">🔴 Bordeaux</option>
                  </select>
                </div>

                {/* 3. Dimension Filter */}
                <div className="relative flex items-center bg-[#1A110B]/85 border border-[#E6A635]/30 focus-within:border-[#F2BD52] rounded-xl px-2.5 py-1.5 shrink-0">
                  <Ruler className="size-3.5 text-[#F2BD52] mr-1.5 shrink-0" />
                  <select 
                    value={filterDimension}
                    onChange={e => setFilterDimension(e.target.value)}
                    className="bg-transparent text-xs text-[#FAF7F2] font-medium outline-none cursor-pointer pr-2"
                  >
                    <option value="Tout" className="bg-[#241812] text-[#FAF7F2]">Dimension : Toutes</option>
                    <option value="Petit" className="bg-[#241812] text-[#FAF7F2]">Petit (&lt; 80 cm)</option>
                    <option value="Moyen" className="bg-[#241812] text-[#FAF7F2]">Moyen (80–150 cm)</option>
                    <option value="Grand" className="bg-[#241812] text-[#FAF7F2]">Grand (&gt; 150 cm)</option>
                    <option value="Sur-mesure" className="bg-[#241812] text-[#FAF7F2]">Sur-mesure</option>
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
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAE4D9] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    title="Réinitialiser tous les filtres"
                  >
                    <RotateCcw className="size-3 text-[#F2BD52]" />
                    <span className="hidden sm:inline">Effacer filtres</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Bottom Sub-bar: Counter, Select All & Bulk Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-[#EAE4D9]/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#F2BD52] bg-[#1A110B]/80 px-2.5 py-0.5 rounded-md border border-[#E6A635]/25">
                  {filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''}
                </span>
                {selectedIds.length > 0 && (
                  <span className="text-[11px] text-[#EAE4D9]/70 font-medium">
                    ({selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 className="size-3.5" /> Supprimer ({selectedIds.length})
                  </button>
                )}

                {/* Luxury Custom Toggle All Button (No native white checkbox) */}
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                      ? 'bg-[#E6A635] text-[#1A110B] border-[#F2BD52] shadow-sm font-bold'
                      : 'bg-[#1A110B]/80 text-[#F2BD52] border-[#E6A635]/35 hover:bg-[#3B271C]'
                  }`}
                >
                  <div className={`size-4 rounded-full flex items-center justify-center transition-all ${
                    selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                      ? 'bg-[#1A110B] text-[#F2BD52]'
                      : 'border border-[#E6A635]/60 bg-black/40'
                  }`}>
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length && (
                      <Check className="size-2.5 stroke-[3]" />
                    )}
                  </div>
                  <span>{selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
                </button>
              </div>
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
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.02 } }, hidden: {} }}
            >
              {filteredProducts.map((product) => {
                const primaryImage = product.images?.[0]?.imageUrl || '/placeholder.png'
                const catName = product.category?.name || 'Mobilier'
                const CatIcon = getCategoryIcon(catName)
                const isSelected = selectedIds.includes(product.id)

                return (
                  <motion.article
                    key={product.id}
                    onClick={() => toggleSelect(product.id)}
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
                    }}
                    className={`group cursor-pointer rounded-2xl overflow-hidden backdrop-blur-md border transition-all duration-200 flex flex-col justify-between relative ${
                      isSelected 
                        ? 'border-[#F2BD52] ring-2 ring-[#F2BD52]/80 shadow-[0_4px_25px_rgba(230,166,53,0.35)] bg-gradient-to-b from-[#3E291C] to-[#261912] scale-[1.01]' 
                        : 'border-[#E6A635]/25 bg-[#2E2018]/90 hover:border-[#E6A635]/70 hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Compact Image Container with Clean Badges */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1A110B]">
                      <img 
                        src={primaryImage} 
                        alt={product.name} 
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Top-Left: Model ID Badge */}
                      <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                        <span className="font-mono text-[9px] font-extrabold bg-[#1A110B]/90 text-[#F2BD52] px-1.5 py-0.5 rounded border border-[#E6A635]/40 shadow-xs">
                          #{product.id}
                        </span>
                      </div>

                      {/* Top-Right: Custom Pro Gold Selection Jewel (No native white box) */}
                      <div className="absolute top-1.5 right-1.5 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelect(product.id)
                          }}
                          className={`size-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-tr from-[#D89B28] via-[#F2BD52] to-[#FFE08A] text-[#1A110B] shadow-[0_0_14px_rgba(242,189,82,0.85)] ring-2 ring-white/70 scale-110'
                              : 'bg-black/60 border border-[#E6A635]/45 text-transparent hover:border-[#F2BD52] hover:bg-[#E6A635]/25 backdrop-blur-md'
                          }`}
                          title={isSelected ? 'Désélectionner' : 'Sélectionner'}
                        >
                          <Check className={`size-3.5 stroke-[3] transition-transform duration-150 ${isSelected ? 'scale-100' : 'scale-0'}`} />
                        </button>
                      </div>

                      {/* Bottom Overlay: Category name & Variants Count */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between text-[9px] text-[#FAF7F2] pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1A110B]/85 border border-[#E6A635]/30 font-semibold truncate max-w-[65%]">
                          <CatIcon className="size-2.5 text-[#F2BD52] shrink-0" />
                          <span className="truncate">{catName}</span>
                        </span>
                        {product.images && product.images.length > 1 && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-[#1A110B]/85 border border-[#E6A635]/30 font-semibold text-[#F2BD52]">
                            <Layers className="size-2.5" />
                            <span>{product.images.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact Card Content */}
                    <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        {/* Title */}
                        <h3 
                          className={`font-heading text-xs font-semibold line-clamp-1 leading-snug transition-colors ${
                            isSelected ? 'text-[#F2BD52]' : 'text-[#FAF7F2] group-hover:text-[#F2BD52]'
                          }`} 
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        {/* Specs row: Color & Dimension chips */}
                        <div className="flex items-center gap-1 text-[9.5px] text-[#EAE4D9]/75 mt-1 overflow-hidden">
                          {product.color && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1A110B]/60 border border-[#E6A635]/20 truncate max-w-[50%]">
                              <span className="size-1.5 rounded-full bg-[#F2BD52] shrink-0" />
                              <span className="truncate">{product.color}</span>
                            </span>
                          )}
                          {product.dimensions && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1A110B]/60 border border-[#E6A635]/20 truncate max-w-[50%]">
                              <Ruler className="size-2 text-[#E6A635] shrink-0" />
                              <span className="truncate">{product.dimensions}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Price & Quick Action Buttons */}
                      <div className="pt-1.5 border-t border-[#E6A635]/15 flex items-center justify-between gap-1">
                        <div>
                          {product.price ? (
                            <span className="font-heading text-xs font-bold text-[#F2BD52] whitespace-nowrap">
                              {product.price.toLocaleString('fr-FR')} <span className="text-[9px] font-normal text-[#EAE4D9]/60">DT</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#EAE4D9]/60 italic whitespace-nowrap">
                              Sur devis
                            </span>
                          )}
                        </div>

                        {/* Action Buttons (with stopPropagation) */}
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Link 
                            href={`/produits/${product.id}`} 
                            target="_blank" 
                            className="p-1 rounded-md bg-[#1A110B]/80 hover:bg-[#3B271C] text-[#EAE4D9] hover:text-[#F2BD52] border border-[#E6A635]/20 transition-all" 
                            title="Voir sur le site public"
                          >
                            <Eye className="size-3" />
                          </Link>
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="p-1 rounded-md bg-[#1A110B]/80 hover:bg-[#E6A635]/20 text-[#EAE4D9] hover:text-[#F2BD52] border border-[#E6A635]/20 transition-all cursor-pointer" 
                            title="Modifier"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-1 rounded-md bg-[#1A110B]/80 hover:bg-red-500/20 text-[#EAE4D9] hover:text-red-400 border border-[#E6A635]/20 transition-all cursor-pointer" 
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="size-3" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#241812] border border-[#E6A635]/40 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#FAF7F2] max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-5 border-b border-[#E6A635]/25 bg-[#1A110B]/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#C78318] to-[#F3C45E] text-[#1A110B] flex items-center justify-center font-bold">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#FAF7F2]">
                        Fiche Complète de Devis Atelier #{selectedQuoteForInspection.id}
                      </h3>
                      <p className="text-xs text-[#EAE4D9]/70">
                        Date de réception : {new Date(selectedQuoteForInspection.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedQuoteForInspection(null)}
                    className="size-8 rounded-full bg-white/5 hover:bg-white/10 text-[#EAE4D9] flex items-center justify-center transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Client Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#1A110B]/80 border border-[#E6A635]/20 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#F2BD52]">Nom du client</p>
                      <p className="font-semibold text-[#FAF7F2] mt-0.5">{selectedQuoteForInspection.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#F2BD52]">Téléphone</p>
                      <p className="font-semibold text-[#FAF7F2] mt-0.5">{selectedQuoteForInspection.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#F2BD52]">Email</p>
                      <p className="font-semibold text-[#FAF7F2] mt-0.5 truncate">{selectedQuoteForInspection.email}</p>
                    </div>
                  </div>

                  {/* Product Highlight */}
                  {selectedQuoteForInspection.product && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A110B]/60 border border-[#E6A635]/20">
                      <div className="size-20 rounded-xl overflow-hidden bg-black/60 border border-[#E6A635]/30 shrink-0">
                        <img 
                          src={selectedQuoteForInspection.product.images?.[0]?.imageUrl || '/placeholder.png'} 
                          alt={selectedQuoteForInspection.product.name} 
                          className="size-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2BD52]">
                          {selectedQuoteForInspection.product.category?.name || 'Catalogue'}
                        </span>
                        <h4 className="font-heading text-base font-bold text-[#FAF7F2]">
                          {selectedQuoteForInspection.product.name}
                        </h4>
                        <p className="text-xs text-[#EAE4D9]/70 mt-0.5">
                          {selectedQuoteForInspection.product.materials || 'Bois noble & Faïence d’art'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full Specifications */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold text-[#F2BD52] tracking-wider">
                      Détails de Personnalisation &amp; Notes
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#1A110B]/90 border border-white/10 text-sm leading-relaxed text-[#FAF7F2] whitespace-pre-line">
                      {selectedQuoteForInspection.personalizationDetails || selectedQuoteForInspection.message}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#E6A635]/25 bg-[#1A110B]/95 flex items-center justify-between">
                  <button 
                    onClick={() => window.print()} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#EAE4D9]"
                  >
                    <Printer className="size-3.5" /> Imprimer la fiche
                  </button>
                  <button 
                    onClick={() => setSelectedQuoteForInspection(null)} 
                    className="px-5 py-2 rounded-full bg-[#E6A635] text-[#1A110B] text-xs font-bold uppercase tracking-wider"
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
            className="text-[11px] text-[#EAE4D9]/60 hover:text-white underline ml-2 cursor-pointer"
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
                    <p className="text-[10px] text-[#EAE4D9]/50 truncate">{s.desc}</p>
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
                        <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1">
                          <span>Nom du modèle</span> <span className="text-red-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextName = getNextModelName(categoryId, products, categories)
                            setName(nextName)
                            setDescription(buildAutoDescription(nextName, categoryId, color, dimensions, categories))
                          }}
                          className="text-[10.5px] text-[#F2BD52] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
                          className="w-full bg-[#1A110B] border border-[#E6A635]/30 focus:border-[#F2BD52] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] outline-none font-semibold" 
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5 sm:col-span-2">
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

                    {/* Unified Dimensions Control */}
                    <div className="space-y-2 sm:col-span-2 bg-[#1A110B]/70 p-4 rounded-2xl border border-[#E6A635]/25">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[#F2BD52] font-bold flex items-center gap-1.5">
                          <Ruler className="size-4 text-[#E6A635]" />
                          <span>Format &amp; Dimensions</span>
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

                      {/* Custom free-text field */}
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
                        Matériaux &amp; Essences de bois
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
                        <span className="px-2.5 py-1 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-[#3B271C] text-[#F2BD52] border border-[#E6A635]/40 backdrop-blur-md">
                          Sur commande
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

            {/* ── STICKY MODAL FOOTER ── */}
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
