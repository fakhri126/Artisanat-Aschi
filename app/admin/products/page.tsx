'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant } from '@/lib/api'
import { Plus, Edit2, Trash2, Eye, Star, X, Image as ImageIcon, Upload, CheckCircle2, Bot, Palette, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Preset variant labels for quick selection ─────────────────────────────
const VARIANTS_PRESETS = [
  { label: 'Original',      hex: null },
  { label: 'Blanc',         hex: '#FFFFFF' },
  { label: 'Noir',          hex: '#1A1A1A' },
  { label: 'Noyer foncé',   hex: '#5C3317' },
  { label: 'Bleu Cérusé',   hex: '#2D5F8A' },
  { label: 'Doré',          hex: '#C9A84C' },
  { label: 'Blanc Cérusé',  hex: '#F0EDE6' },
  { label: 'Bordeaux',      hex: '#7B2D3E' },
  { label: 'Naturel Clair', hex: '#C4A882' },
  { label: 'Autre…',        hex: null },
]

const DIMENSION_PRESETS = [
  { label: 'Petit',         hex: null },
  { label: 'Moyen',         hex: null },
  { label: 'Grand',         hex: null },
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
  isAIDimensionCategory?: boolean
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
          const ALL_PRESETS = [...VARIANTS_PRESETS, ...DIMENSION_PRESETS]
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
                {v.colorLabel && !isOriginal && (
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [availability, setAvailability] = useState('Disponible')
  const [type, setType] = useState<'PIECE_UNIQUE' | 'REPRODUCTIBLE' | 'CATALOGUE'>('PIECE_UNIQUE')
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageVariants, setImageVariants] = useState<ImageVariant[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [prodData, catData] = await Promise.all([
        adminApi.getProducts(),
        publicApi.getCategories()
      ])

      const isHandleProduct = (p: Product) => {
        const catName = p.category?.name?.toLowerCase() || ''
        const mat = p.materials?.toLowerCase() || ''
        const name = p.name?.toLowerCase() || ''
        return (
          catName.includes("porte") ||
          catName.includes("ronds") ||
          catName.includes("ovales") ||
          catName.includes("poignée") ||
          mat.includes("céramique") ||
          mat.includes("majolique") ||
          name.includes("bouton") ||
          name.includes("poignée")
        )
      }

      setProducts(prodData.filter(p => !isHandleProduct(p)))
      setCategories(catData)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-naming & auto-description helpers
  const getNextModelName = (catId: string, allProds: Product[], allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const catName = cat?.name || 'Création'
    
    let singular = catName
    if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) {
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
    if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) {
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
    setType('PIECE_UNIQUE')
    setIsFeatured(false)
    // Start with one empty original slot
    setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    setCategoryId(product.category.id.toString())
    setDimensions(product.dimensions || '')
    setMaterials(product.materials || '')
    setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    setAvailability(product.availability || 'Disponible')
    setType(product.type)
    setIsFeatured(product.isFeatured)

    // Rebuild variants from existing images
    const variants: ImageVariant[] = product.images.map((img, i) => ({
      imageUrl: img.imageUrl,
      colorLabel: img.colorLabel ?? (i === 0 ? 'Original' : null),
    }))
    setImageVariants(variants.length > 0 ? variants : [{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur de suppression.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imageVariants.length === 0 || !imageVariants[0].imageUrl) {
      alert("Veuillez ajouter au moins une photo originale du produit.")
      return
    }

    const payload: ProductRequest = {
      name,
      description,
      categoryId: parseInt(categoryId),
      dimensions,
      materials,
      color,
      price: price === '' ? null : parseFloat(price),
      availability,
      type,
      isFeatured,
      imageVariants: imageVariants.filter(v => v.imageUrl.trim() !== ''),
    }

    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload)
      } else {
        await adminApi.createProduct(payload)
      }
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.")
    }
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-heading text-3xl font-light text-[#3A2A21] text-left">Gestion des Produits</h1>
          <p className="mt-1 text-sm text-[#3A2A21]/60 text-left">Gérez le catalogue. Ajoutez des variantes d'images (IA ou réelles) pour chaque produit.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]"
        >
          <Plus className="size-4" /> Nouveau Produit
        </motion.button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Products list */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
        }}
        className="bg-[#FAF7F2]/50 backdrop-blur-md border border-[#E8DCCB]/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-[#E8DCCB]/10 text-xs uppercase tracking-wider text-[#3A2A21]/50">
                <th className="p-4 pl-6 font-medium">Produit</th>
                <th className="p-4 font-medium">Catégorie</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Couleurs</th>
                <th className="p-4 font-medium">Disponibilité</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 text-center font-medium">Vedette</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#3A2A21]/40">Aucun produit dans le catalogue.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const colorVariants = product.images.filter(img => img.colorLabel && img.colorLabel !== 'Original')
                  return (
                    <motion.tr
                      key={product.id}
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-white/40 border border-[#E8DCCB]/10 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                            {product.images[0]?.imageUrl ? (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                              />
                            ) : (
                              <ImageIcon className="size-5 text-[#3A2A21]/20" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-medium text-[#3A2A21] text-base">{product.name}</p>
                            <p className="text-xs text-[#3A2A21]/50 line-clamp-1">{product.materials || 'Sans matériel défini'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-medium text-[#3A2A21]/80">
                          {product.category?.name}
                        </span>
                      </td>
                      <td className="p-4">
                        {product.type === 'PIECE_UNIQUE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/20 text-xs font-semibold text-[#C17D59]">Pièce unique</span>
                        ) : product.type === 'REPRODUCTIBLE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400">Reproductible</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">Catalogue</span>
                        )}
                      </td>
                      {/* Color variants column */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className="size-4 rounded-full bg-emerald-500/20 border border-emerald-400/40" title="Original" />
                          {colorVariants.slice(0, 3).map((img, i) => (
                            <div
                              key={i}
                              className="size-4 rounded-full border border-violet-400/30 bg-violet-500/20 flex items-center justify-center"
                              title={img.colorLabel || ''}
                            >
                              <span className="text-[7px] text-violet-300 font-bold">{(img.colorLabel || '?')[0]}</span>
                            </div>
                          ))}
                          {colorVariants.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{colorVariants.length - 3}</span>
                          )}
                          {colorVariants.length === 0 && (
                            <span className="text-[10px] text-muted-foreground">Pas de variantes</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                          product.availability === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          product.availability === 'Sur commande' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {product.availability}
                        </span>
                      </td>
                      <td className="p-4 text-[#3A2A21]/70 text-sm">
                        {product.price ? `${product.price.toLocaleString('fr-FR')} DT` : <span className="text-[#3A2A21]/30 italic">Sur devis</span>}
                      </td>
                      <td className="p-4 text-center">
                        {product.isFeatured ? <Star className="size-4 text-[#C17D59] fill-[#C17D59] mx-auto" /> : <Star className="size-4 text-[#3A2A21]/20 mx-auto" />}
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/produits/${product.id}`} target="_blank" className="p-1.5 text-[#3A2A21]/60 hover:text-[#C17D59] hover:bg-[#C17D59]/10 rounded-md transition-all" title="Voir">
                            <Eye className="size-4" />
                          </Link>
                          <button onClick={() => openEditModal(product)} className="p-1.5 text-[#3A2A21]/60 hover:text-[#C17D59] hover:bg-[#C17D59]/10 rounded-md transition-all" title="Modifier">
                            <Edit2 className="size-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-[#3A2A21]/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all" title="Supprimer">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#FAF7F2] border border-[#E8DCCB]/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <header className="p-6 border-b border-[#E8DCCB]/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-heading text-xl font-medium text-[#3A2A21]">
                  {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
                </h2>
                <p className="text-xs text-[#3A2A21]/50 mt-0.5">La première image = photo originale. Les suivantes = variantes IA personnalisables.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-[#3A2A21]/50 hover:text-[#3A2A21] rounded-md transition-colors hover:bg-white/5">
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic info grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom du produit (Généré auto)</label>
                  <input type="text" required placeholder="Ex: Buffet — Modèle 01" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catégorie</label>
                  <select value={categoryId} onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Type de produit</label>
                  <select value={type} onChange={e => setType(e.target.value as any)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    <option value="PIECE_UNIQUE">Pièce unique</option>
                    <option value="REPRODUCTIBLE">Modèle reproductible</option>
                    <option value="CATALOGUE">Inspiration (Catalogue)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Disponibilité</label>
                  <select value={availability} onChange={e => setAvailability(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    <option value="Disponible">Disponible</option>
                    <option value="Sur commande">Sur commande</option>
                    <option value="Vendu">Vendu</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dimensions</label>
                  <input type="text" placeholder="Ex: Petit, Moyen ou Grand" value={dimensions} onChange={e => handleDimensionsChange(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
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
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Matériaux</label>
                  <input type="text" placeholder="Ex: Noyer massif noble & Céramique" value={materials} onChange={e => setMaterials(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Couleur principale</label>
                  <input type="text" placeholder="Ex: Blanc, Noir, Noyer, Bleu, Or" value={color} onChange={e => handleColorChange(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">Suggéré :</span>
                    {['Blanc', 'Noir', 'Noyer', 'Bleu', 'Or', 'Naturel', 'Vert Olivier'].map(colorTag => (
                      <button
                        key={colorTag}
                        type="button"
                        onClick={() => handleColorChange(colorTag)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                          color.toLowerCase() === colorTag.toLowerCase()
                            ? 'bg-[#C17D59] text-white border-[#C17D59]'
                            : 'bg-white/60 text-[#3A2A21]/70 border-[#E8DCCB] hover:bg-[#E8DCCB]/40'
                        }`}
                      >
                        {colorTag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Prix (DT) — vide = Sur devis</label>
                  <input type="number" placeholder="Ex: 4200" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none" />
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
                <textarea rows={3} placeholder="Présentation du modèle..." value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-[#E8DCCB]/50 rounded-lg p-3 text-sm text-foreground outline-none resize-none" />
              </div>

              {/* ═══ COLOR VARIANTS MANAGER ═══ */}
              <div className="rounded-xl border border-[#E8DCCB]/20 bg-secondary/20 p-4">
                <ImageVariantManager
                  variants={imageVariants}
                  onChange={setImageVariants}
                  uploadFn={adminApi.uploadProductImage}
                  isAIDimensionCategory={(() => {
                    const catName = categories.find(c => c.id.toString() === categoryId)?.name?.toLowerCase() || ''
                    return catName.includes('buffet') || catName.includes('tv') || catName.includes('porte')
                  })()}
                />
                <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-400/20 text-xs text-blue-300 space-y-1">
                  <p><strong>🟢 1ère image</strong> = Photo originale (réelle, fabriquée dans l'atelier)</p>
                  <p><strong>✨ Images suivantes</strong> = Variantes IA (le client peut voir les couleurs ou dimensions en image)</p>
                  <p>Le client verra des boutons avec le nom de chaque variante (ex: Bleu Cérusé, ou Grand) que vous avez défini.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="featuredCheck" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                  className="size-4 border border-border rounded text-[#C17D59] focus:ring-gold" />
                <label htmlFor="featuredCheck" className="text-xs uppercase tracking-wider text-foreground font-semibold cursor-pointer">
                  Mettre ce produit en vedette sur la page d&apos;accueil
                </label>
              </div>

              <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all">
                  Annuler
                </button>
                <button type="submit"
                  className="rounded-full bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all">
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
