'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant } from '@/lib/api'
import { Plus, Edit2, Trash2, Eye, Bot, X, Image as ImageIcon, Upload, CheckCircle2, Palette, Search } from 'lucide-react'
import Link from 'next/link'

// ─── Preset colour swatches for quick selection ──────────────────────────────
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

const VARIANTS_PRESETS = [...COLOR_PRESETS]
const DIMENSION_PRESETS = [
  { label: 'Petit',         hex: null },
  { label: 'Moyen',         hex: null },
  { label: 'Grand',         hex: null },
]

const ALL_PRESETS = [
  ...VARIANTS_PRESETS.filter(p => p.label !== 'Autre…'),
  ...DIMENSION_PRESETS,
  { label: 'Autre…', hex: null }
]

// ─── Image Variant Manager ────────────────────────────────────────────────────
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
    } catch {
      alert("Erreur lors de l'envoi de l'image.")
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-[#C17D59] font-bold flex items-center gap-2">
          <Palette className="size-3.5" />
          Variantes en images (Couleur ou Dimension)
        </label>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8DCCB]/20 border border-[#E8DCCB]/40 text-[#C17D59] text-xs font-semibold hover:bg-[#E8DCCB]/30 transition-colors"
        >
          <Plus className="size-3.5" /> Ajouter une photo (Vue ou Variante)
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 border border-border border-dashed text-center">
          Ajoutez au moins une variante. La première sera marquée comme « Original » (photo réelle de l'atelier).
        </p>
      )}

      <div className="space-y-3">
        {variants.map((v, idx) => {
          const isFirstOriginal = idx === 0
          const isOriginal = v.colorLabel === 'Original' || v.colorLabel === null
          const isCustom = v.colorLabel && !ALL_PRESETS.slice(0, -1).some(p => p.label === v.colorLabel)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-xl border p-4 space-y-3 ${
                isOriginal
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-violet-500/20 bg-violet-500/5'
              }`}
            >
              {/* Variant header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isFirstOriginal ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Photo Principale
                    </span>
                  ) : isOriginal ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                      <CheckCircle2 className="size-3.5" /> Vue additionnelle (Même modèle)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-400">
                      <Bot className="size-3.5" /> Variante (Couleur / IA)
                    </span>
                  )}
                </div>
                {!isFirstOriginal && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Image URL + Upload */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de l'image ou télécharger →"
                  value={v.imageUrl}
                  onChange={e => updateUrl(idx, e.target.value)}
                  className="flex-1 bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-2.5 text-xs text-foreground outline-none"
                />
                <label className="inline-flex items-center gap-1.5 bg-secondary/70 hover:bg-[#E8DCCB]/20 border border-border hover:border-[#E8DCCB]/40 text-[#C17D59] px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0">
                  <Upload className="size-3.5" />
                  {uploading === idx ? '...' : 'Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Image preview */}
              {v.imageUrl && (
                <div className="relative h-24 w-full rounded-lg overflow-hidden bg-secondary/50 border border-border">
                  <img src={v.imageUrl} alt="" className="size-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}

              {/* Color label picker */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Lier cette photo à une variante :
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_PRESETS.map(preset => (
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
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold transition-all ${
                          (v.colorLabel === preset.label || (v.colorLabel === null && preset.label === 'Original') || (preset.label === 'Autre…' && isCustom))
                            ? 'border-violet-400 bg-violet-500/20 text-violet-300'
                            : 'border-border text-muted-foreground hover:border-violet-400/50 hover:text-violet-300'
                        }`}
                      >
                        {preset.hex && preset.label !== 'Original' && (
                          <div className="size-3 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                        )}
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {isCustom && (
                    <input
                      type="text"
                      placeholder="Tapez le nom de la couleur/taille..."
                      value={v.colorLabel || ''}
                      onChange={e => {
                        const val = e.target.value
                        setCustomLabels(prev => ({ ...prev, [idx]: val }))
                        updateLabel(idx, val)
                      }}
                      className="mt-3 w-full bg-secondary/50 border border-violet-500/30 focus:border-violet-400/60 rounded-lg p-2.5 text-xs text-foreground outline-none"
                    />
                  )}
                  {v.colorLabel && (
                    <p className="mt-1.5 text-[10px] text-violet-400">
                      ✓ Le client verra ce bouton : <strong>"{v.colorLabel}"</strong>
                    </p>
                  )}
                </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminCataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tout')
  
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

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [prodData, catData] = await Promise.all([
        adminApi.getProducts(),
        publicApi.getCategories(),
      ])
      // Filter only CATALOGUE type
      setProducts(prodData.filter(p => p.type === 'CATALOGUE'))
      setCategories(catData)
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-naming & auto-description helpers
  const getNextModelName = (catId: string, allProds: Product[], allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const catName = cat?.name || 'Création'
    
    let singular = catName
    if (singular.toLowerCase().includes('lampe') || singular.toLowerCase().includes('coffre')) {
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
    if (singular.toLowerCase().includes('lampe') || singular.toLowerCase().includes('coffre')) {
      singular = 'Lampe Coffre'
    } else if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) {
      singular = singular.slice(0, -1)
    }
    if (singular.toLowerCase().includes('meuble')) {
      singular = 'Meuble TV'
    }

    const match = modelName.match(/(?:Modèle|N°|#|\s)(\d+)/i)
    const modelPart = match ? `(Modèle ${match[1].padStart(2, '0')}) ` : ''
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
    const initCatId = categories.find(c => c.name.toLowerCase().includes('buffet'))?.id.toString() || categories[0]?.id.toString() || '1'
    const initColor = 'Blanc'
    const initDim = 'Moyen'
    const nextName = getNextModelName(initCatId, products, categories)
    const initDesc = buildAutoDescription(nextName, initCatId, initColor, initDim, categories)

    setName(nextName)
    setDescription(initDesc)
    setCategoryId(initCatId)
    setDimensions(initDim)
    setMaterials('Bois massif noble & Céramique artisanale')
    setColor(initColor)
    setPrice('')
    setAvailability('Disponible')
    setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name); setDescription(product.description || '')
    setCategoryId(product.category.id.toString()); setDimensions(product.dimensions || '')
    setMaterials(product.materials || ''); setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    setAvailability(product.availability || 'Disponible')
    const variants: ImageVariant[] = product.images.map((img, i) => ({
      imageUrl: img.imageUrl,
      colorLabel: img.colorLabel ?? (i === 0 ? 'Original' : null),
    }))
    setImageVariants(variants.length > 0 ? variants : [{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce modèle du catalogue ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) { alert(err.message || 'Erreur de suppression.') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageVariants.length === 0 || !imageVariants[0].imageUrl) {
      alert("Veuillez ajouter au moins une photo originale du produit.")
      return
    }

    const payload: ProductRequest = {
      name, description, categoryId: parseInt(categoryId), dimensions, materials,
      color, price: price === '' ? null : parseFloat(price), availability,
      type: 'CATALOGUE', isFeatured: false,
      imageVariants: imageVariants.filter(v => v.imageUrl.trim() !== ''),
    }
    try {
      if (editingProduct) await adminApi.updateProduct(editingProduct.id, payload)
      else await adminApi.createProduct(payload)
      setModalOpen(false); loadData()
    } catch (err: any) { alert(err.message || "Erreur d'enregistrement.") }
  }

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = filterCategory === 'Tout' || p.category?.name === filterCategory
    return matchSearch && matchCat
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) setSelectedIds([])
    else setSelectedIds(filteredProducts.map(p => p.id))
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.length} modèles du catalogue ?`)) return
    try {
       for (const id of selectedIds) {
         await adminApi.deleteProduct(id)
       }
       setProducts(products.filter(p => !selectedIds.includes(p.id)))
       setSelectedIds([])
    } catch(err: any) { alert("Erreur lors de la suppression en masse.") }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8DCCB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-light text-[#3A2A21] text-left">Catalogue d&apos;Inspiration</h1>
          <p className="mt-1 text-sm text-[#3A2A21]/60 text-left">
            Modèles passés utilisés comme source d&apos;inspiration. Apparaissent sur la page <strong className="text-[#C17D59] font-medium">/catalogue</strong>.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]"
        >
          <Plus className="size-4" /> Ajouter au catalogue
        </motion.button>
      </div>

      {/* AI notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E8DCCB]/20 bg-[#E8DCCB]/5 px-4 py-3 text-xs text-muted-foreground">
        <Bot className="mt-0.5 size-4 shrink-0 text-[#C17D59]" />
        <span>Les modèles du catalogue peuvent être générés ou illustrés par IA. Un avertissement est affiché aux visiteurs sur la page publique.</span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FAF7F2]/80 p-4 rounded-2xl border border-[#E8DCCB]/20 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C7A6B]" />
            <input 
              type="text" 
              placeholder="Rechercher un modèle..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E8DCCB]/50 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#C17D59] transition-colors"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto bg-white border border-[#E8DCCB]/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#C17D59] text-[#5A453A] font-medium"
          >
            <option value="Tout">Toutes les catégories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        
        {/* Bulk Actions Indicator */}
        <div className="flex items-center gap-3 text-sm font-medium w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-[#5A453A] bg-white border border-[#E8DCCB]/40 px-3 py-1.5 rounded-full hover:bg-[#E8DCCB]/10 transition-colors">
            <input 
              type="checkbox" 
              className="rounded text-[#C17D59] focus:ring-[#C17D59] border-[#E8DCCB] size-4 cursor-pointer" 
              checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length} 
              onChange={toggleSelectAll} 
            />
            Sélectionner la page
          </label>
        </div>
      </div>

      {/* Grid of catalogue items */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
      >
        {filteredProducts.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 bg-[#FAF7F2]/50 backdrop-blur-md border border-[#E8DCCB]/10 rounded-2xl text-[#3A2A21]/40">
            <Bot className="size-10 mb-3 opacity-20" />
            <p>Aucun modèle dans le catalogue d&apos;inspiration.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const image = product.images?.[0]?.imageUrl || '/placeholder.png'
            return (
              <motion.article
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                className={`group bg-[#FAF7F2]/50 backdrop-blur-md border rounded-2xl overflow-hidden shadow-lg hover:shadow-gold/5 transition-all duration-300 hover:-translate-y-1 relative ${selectedIds.includes(product.id) ? 'border-[#C17D59] ring-1 ring-[#C17D59]' : 'border-[#E8DCCB]/10'}`}
              >
                {/* Bulk Select Checkbox */}
                <div className="absolute top-3 right-3 z-20">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="size-5 rounded border-white/60 bg-black/20 text-[#C17D59] focus:ring-[#C17D59] focus:ring-offset-0 cursor-pointer shadow-sm backdrop-blur-md border-2 checked:border-none"
                  />
                </div>

                <div className="relative h-48 overflow-hidden bg-white/40">
                  <img src={image} alt={product.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/50 border border-[#E8DCCB]/20 px-2.5 py-1 backdrop-blur-md shadow-inner">
                    <Bot className="size-3 text-[#C17D59]" />
                    <span className="text-[10px] uppercase tracking-wider text-[#C17D59] font-medium">Catalogue</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-medium text-[#3A2A21] leading-tight">{product.name}</h3>
                    <span className="shrink-0 rounded-full border border-[#E8DCCB]/20 bg-[#E8DCCB]/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#C17D59]">
                      {product.category?.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#3A2A21]/60 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#3A2A21]/50 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-emerald-500/20 border border-emerald-400/40" title="Original" />
                      {product.images.filter(img => img.colorLabel && img.colorLabel !== 'Original').slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="size-2.5 rounded-full border border-violet-400/30 bg-violet-500/20 flex items-center justify-center"
                          title={img.colorLabel || ''}
                        />
                      ))}
                      {product.images.filter(img => img.colorLabel && img.colorLabel !== 'Original').length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{product.images.filter(img => img.colorLabel && img.colorLabel !== 'Original').length - 3}</span>
                      )}
                    </div>
                    {product.dimensions && <span>{product.dimensions}</span>}
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E8DCCB]/10 pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link href={`/produits/${product.id}`} target="_blank" className="p-1.5 text-[#3A2A21]/60 hover:text-[#3A2A21] hover:bg-white/5 rounded-md transition-colors" title="Voir sur le site">
                      <Eye className="size-4" />
                    </Link>
                    <button onClick={() => openEditModal(product)} className="p-1.5 text-[#3A2A21]/60 hover:text-[#C17D59] hover:bg-[#E8DCCB]/10 rounded-md transition-colors" title="Modifier">
                      <Edit2 className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-[#3A2A21]/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          })
        )}
      </motion.div>

      {/* Floating Action Bar for Bulk */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-[#3A2A21] text-white px-6 py-3 rounded-full shadow-2xl border border-[#5A453A]"
        >
          <span className="text-sm font-semibold">{selectedIds.length} sélectionné(s)</span>
          <div className="w-px h-5 bg-[#5A453A]" />
          <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
            <Trash2 className="size-4" /> Supprimer
          </button>
        </motion.div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#FAF7F2] border border-[#E8DCCB]/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <header className="p-6 border-b border-[#E8DCCB]/10 flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-[#3A2A21]">
                {editingProduct ? 'Modifier le modèle' : 'Ajouter au catalogue'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-[#3A2A21]/50 hover:text-[#3A2A21] rounded-md transition-colors hover:bg-white/5">
                <X className="size-5" />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom du modèle (Généré auto)</label>
                  <input type="text" required placeholder="Ex: Buffet — Modèle 01" value={name} onChange={e => setName(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catégorie</label>
                  <select value={categoryId} onChange={e => handleCategoryChange(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Matériaux</label>
                  <input type="text" placeholder="Ex: Noyer massif" value={materials} onChange={e => setMaterials(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Couleur de l'Original (Principale)</label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold transition-all ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400'
                              : 'border-border text-muted-foreground hover:border-emerald-400/50 hover:text-emerald-400'
                          }`}
                        >
                          {preset.hex && (
                            <div className="size-3 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                          )}
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                  {(!color || !COLOR_PRESETS.slice(0, -1).some(p => p.label === color)) && (
                    <input type="text" placeholder="Entrez la couleur exacte de l'original..." value={color} onChange={e => handleColorChange(e.target.value)} className="w-full bg-secondary/50 border border-emerald-500/30 focus:border-emerald-400/60 rounded-lg p-2.5 text-xs text-foreground outline-none" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dimensions</label>
                  <input type="text" placeholder="Ex: Petit, Moyen ou Grand" value={dimensions} onChange={e => handleDimensionsChange(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">Format rapide :</span>
                    {['Petit', 'Moyen', 'Grand'].map(size => {
                      const isTagged = dimensions.toLowerCase() === size.toLowerCase()
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleDimensionsChange(size)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            isTagged 
                              ? 'bg-[#C17D59] text-white border-[#C17D59] shadow-sm' 
                              : 'bg-white text-[#3A2A21] border-[#E8DCCB] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Prix indicatif (DT)</label>
                  <input type="number" placeholder="Laisser vide = Sur demande" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description (Auto-générée)</label>
                  <button
                    type="button"
                    onClick={() => setDescription(buildAutoDescription(name, categoryId, color, dimensions, categories))}
                    className="text-[10px] text-[#C17D59] hover:underline flex items-center gap-1 font-semibold"
                  >
                    🪄 Régénérer la description
                  </button>
                </div>
                <textarea rows={3} placeholder="Présentation du modèle..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
              </div>
              <div className="rounded-xl border border-[#E8DCCB]/20 bg-secondary/20 p-4">
                <ImageVariantManager
                  variants={imageVariants}
                  onChange={setImageVariants}
                  uploadFn={adminApi.uploadProductImage}
                />
                <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-400/20 text-xs text-blue-300 space-y-1">
                  <p><strong>🟢 1ère image</strong> = Photo originale (réelle, fabriquée dans l'atelier)</p>
                  <p><strong>✨ Images suivantes</strong> = Variantes IA (le client peut voir les couleurs ou dimensions en image)</p>
                  <p>Le client verra des boutons avec le nom de chaque variante (ex: Bleu, ou Grand) que vous avez défini.</p>
                </div>
              </div>
              <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all">
                  Annuler
                </button>
                <button type="submit" className="rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/90 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all">
                  Enregistrer
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
