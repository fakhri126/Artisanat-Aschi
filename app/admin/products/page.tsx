'use client'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant, QuoteRequest } from '@/lib/api'
import { isBijouxOrHandleCategory, isBijouxOrHandleProduct } from '@/lib/utils'
import {
  Plus, Edit2, Trash2, Eye, Star, X, Image as ImageIcon,
  Upload, CheckCircle2, ShoppingBag, Mail, Phone, RefreshCw,
  Search, SlidersHorizontal, Camera, Sparkles
} from 'lucide-react'

// ─── Photos Manager for Workshop Products (Face + Other Angles) ─────────────
function WorkshopPhotosManager({
  variants,
  onChange,
  uploadFn,
}: {
  variants: ImageVariant[]
  onChange: (variants: ImageVariant[]) => void
  uploadFn: (file: File) => Promise<{ url: string }>
}) {
  const [uploading, setUploading] = useState<number | null>(null)

  const addPhoto = () => {
    onChange([...variants, { imageUrl: '', colorLabel: null }])
  }

  const removePhoto = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx))
  }

  const updateUrl = (idx: number, url: string) => {
    const next = [...variants]
    next[idx] = { ...next[idx], imageUrl: url }
    onChange(next)
  }

  const updateAngleLabel = (idx: number, label: string) => {
    const next = [...variants]
    next[idx] = { ...next[idx], colorLabel: label.trim() === '' ? (idx === 0 ? 'Original' : null) : label }
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#C17D59] font-bold flex items-center gap-2">
            <Camera className="size-4 text-[#C17D59]" />
            Photos de la Pièce en Atelier (Face &amp; Autres Angles)
          </label>
          <p className="text-[11px] text-[#3A2A21]/60 mt-0.5">
            Ajoutez la photo de face principale ainsi que les photos des autres faces ou détails si elles existent.
          </p>
        </div>
        <button
          type="button"
          onClick={addPhoto}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8DCCB]/40 border border-[#E8DCCB] text-[#C17D59] text-xs font-semibold hover:bg-[#E8DCCB] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-3.5" /> + Ajouter une autre face / angle
        </button>
      </div>

      {variants.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs text-center">
          Veuillez ajouter au moins une photo de face de la pièce.
        </div>
      )}

      <div className="space-y-3">
        {variants.map((v, idx) => {
          const isPrimary = idx === 0

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                isPrimary
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'border-[#E8DCCB]/60 bg-white/60'
              }`}
            >
              {/* Photo header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPrimary ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="size-3.5" /> Photo Principale (Façade de face)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A2A21]/80 bg-[#E8DCCB]/30 px-2.5 py-0.5 rounded-full border border-[#E8DCCB]">
                      📸 Angle / Face additionnelle #{idx + 1}
                    </span>
                  )}
                </div>

                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              {/* Angle Label (Optional descriptive tag) */}
              {!isPrimary && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#3A2A21]/60">
                    Type de prise de vue (optionnel) :
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['Vue de profil', 'Vue 3/4', 'Intérieur', 'Détail sculpture', 'Vue arrière', 'Zoom bois'].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => updateAngleLabel(idx, suggestion)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                          v.colorLabel === suggestion
                            ? 'bg-[#C17D59] text-white border-[#C17D59]'
                            : 'bg-white/80 text-[#3A2A21]/70 border-[#E8DCCB] hover:bg-[#E8DCCB]/40'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ou écrivez un libellé (ex: Vue de profil, Détail céramique...)"
                    value={v.colorLabel && v.colorLabel !== 'Original' ? v.colorLabel : ''}
                    onChange={e => updateAngleLabel(idx, e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2 text-xs text-[#3A2A21] outline-none mt-1"
                  />
                </div>
              )}

              {/* Image Input & Upload */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de l'image (https://...) ou choisissez un fichier →"
                  value={v.imageUrl}
                  onChange={e => updateUrl(idx, e.target.value)}
                  className="flex-1 bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-xs text-[#3A2A21] outline-none"
                />
                <label className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#E8DCCB]/50 border border-[#E8DCCB] text-[#C17D59] px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-sm">
                  <Upload className="size-3.5" />
                  <span>{uploading === idx ? 'Envoi...' : 'Choisir photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading === idx}
                    onChange={e => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Real-time Image Preview */}
              {v.imageUrl && (
                <div className="relative h-32 w-full max-w-xs rounded-xl overflow-hidden bg-[#241812] border border-[#E8DCCB]/60 shadow-inner">
                  <img
                    src={v.imageUrl}
                    alt=""
                    className="size-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {v.colorLabel && v.colorLabel !== 'Original' && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-semibold">
                      {v.colorLabel}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Default Fallback Categories for Furniture Pieces in Stock ────────────────
const DEFAULT_FURNITURE_CATEGORIES: Category[] = [
  { id: 1, name: 'Buffets', type: 'MOBILIER' },
  { id: 2, name: 'Meubles TV', type: 'MOBILIER' },
  { id: 3, name: 'Miroirs', type: 'DECORATION' },
  { id: 4, name: 'Portes', type: 'PORTES' },
  { id: 5, name: 'Coffres', type: 'MOBILIER' },
  { id: 6, name: 'Décoration', type: 'DECORATION' },
  { id: 7, name: 'Tables', type: 'MOBILIER' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS'>('PRODUCTS')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_FURNITURE_CATEGORIES)
  const [orders, setOrders] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('1')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [availability, setAvailability] = useState('Disponible')
  const [type, setType] = useState<'PIECE_UNIQUE' | 'REPRODUCTIBLE'>('PIECE_UNIQUE')
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageVariants, setImageVariants] = useState<ImageVariant[]>([])

  // Quick category creation states
  const [isAddingNewCat, setIsAddingNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [creatingCat, setCreatingCat] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('tab') === 'orders') {
        setActiveTab('ORDERS')
      }
    }
    loadData()
    loadOrders()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Charge les catégories de façon isolée et sécurisée
      try {
        const catData = await publicApi.getCategories()
        if (Array.isArray(catData)) {
          const pureCats = catData.filter(c => !isBijouxOrHandleCategory(c.name))
          if (pureCats.length > 0) {
            setCategories(pureCats)
            setCategoryId(prev => prev || pureCats[0].id.toString())
          }
        }
      } catch (catErr) {
        console.warn('Erreur chargement catégories API, utilisation des catégories par défaut:', catErr)
      }

      // 2. Charge les pièces en stock disponibles
      try {
        const prodData = await adminApi.getProducts()
        if (Array.isArray(prodData)) {
          setProducts(prodData.filter(p => p.type !== 'CATALOGUE' && !isBijouxOrHandleProduct(p)))
        }
      } catch (prodErr: any) {
        console.warn('Erreur chargement produits:', prodErr)
        setError(prodErr.message || 'Erreur lors du chargement des produits.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuickCategory = async () => {
    const trimmed = newCatName.trim()
    if (!trimmed) return
    try {
      setCreatingCat(true)
      const created = await adminApi.createCategory({
        name: trimmed,
        type: 'MOBILIER',
      })
      setCategories(prev => [...prev, created])
      setCategoryId(created.id.toString())
      setNewCatName('')
      setIsAddingNewCat(false)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la catégorie.')
    } finally {
      setCreatingCat(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const allQuotes = await adminApi.getQuotes()
      // Filter orders for available stock products (exclude Bijoux de Porte orders)
      const prodOrders = allQuotes.filter(q => {
        const pType = q.product?.type
        const msg = (q.message || '').toLowerCase()
        const isBijoux = q.product ? isBijouxOrHandleProduct(q.product) : false
        return !isBijoux && (pType === 'PIECE_UNIQUE' || pType === 'REPRODUCTIBLE' || msg.includes('panier') || msg.includes('commande pièce'))
      })
      setOrders(prodOrders)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateQuoteStatus(id, status as any)
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o))
    } catch (err) { console.error(err) }
  }

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Supprimer cette demande ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setOrders(orders.filter(o => o.id !== id))
    } catch (err) { console.error(err) }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setName('')
    setDescription('')
    const defaultCatId = categories[0]?.id?.toString() || '1'
    setCategoryId(defaultCatId)
    setIsAddingNewCat(false)
    setNewCatName('')
    setDimensions('')
    setMaterials('')
    setColor('')
    setPrice('')
    setAvailability('Disponible')
    setType('PIECE_UNIQUE')
    setIsFeatured(false)
    // Start with one empty primary photo
    setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    const catId = product.category?.id ? product.category.id.toString() : (categories[0]?.id?.toString() || '1')
    setCategoryId(catId)
    setIsAddingNewCat(false)
    setNewCatName('')
    setDimensions(product.dimensions || '')
    setMaterials(product.materials || '')
    setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    setAvailability(product.availability || 'Disponible')
    setType(product.type === 'REPRODUCTIBLE' ? 'REPRODUCTIBLE' : 'PIECE_UNIQUE')
    setIsFeatured(product.isFeatured)

    // Rebuild photos from existing images
    const variants: ImageVariant[] = (product.images || []).map((img, i) => ({
      imageUrl: img.imageUrl,
      colorLabel: img.colorLabel ?? (i === 0 ? 'Original' : null),
    }))
    setImageVariants(variants.length > 0 ? variants : [{ imageUrl: '', colorLabel: 'Original' }])
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce disponible ?')) return
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
      alert("Veuillez ajouter au moins la photo de face principale du produit.")
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

  // Filtered Products for Table
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCatFilter === 'ALL' || p.category?.id?.toString() === selectedCatFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      )
      return matchesCat && matchesSearch
    })
  }, [products, selectedCatFilter, searchQuery])

  if (loading && products.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8DCCB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/30 border border-[#E8DCCB] text-[#C17D59] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5 text-[#C17D59]" />
            Stock Showroom &amp; Pièces Disponibles
          </div>
          <h1 className="font-heading text-3xl font-light text-[#3A2A21]">Gestion des Pièces Disponibles</h1>
          <p className="mt-1 text-sm text-[#3A2A21]/60">Gérez les créations réelles en noyer massif prêtes à la vente en atelier ou showroom.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-full bg-[#C17D59] hover:bg-[#A86442] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          <Plus className="size-4" /> + Nouvelle Pièce Disponible
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 border-b border-[#E8DCCB]/20 pb-3">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'PRODUCTS'
              ? 'bg-[#C17D59] text-white shadow-md'
              : 'bg-white/40 text-[#3A2A21]/60 hover:bg-white/70'
          }`}
        >
          <Camera className="size-4" />
          Pièces en stock ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-[#C17D59] text-white shadow-md'
              : 'bg-white/40 text-[#3A2A21]/60 hover:bg-white/70'
          }`}
        >
          <ShoppingBag className="size-4" />
          Commandes de pièces ({orders.length})
        </button>
      </div>

      {/* TAB CONTENT 2: ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="bg-[#FAF7F2]/50 backdrop-blur-md border border-[#E8DCCB]/20 rounded-2xl overflow-hidden shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-heading font-medium text-[#3A2A21]">Commandes &amp; Réservations de Pièces</h2>
              <p className="text-xs text-[#3A2A21]/60 mt-1">Commandes directes et réservations effectuées depuis le site.</p>
            </div>
            <button
              onClick={loadOrders}
              className="p-2 hover:bg-[#E8DCCB]/30 rounded-lg text-[#3A2A21]/60 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`size-4 ${loadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-[#3A2A21]/50 text-sm">
              Aucune commande de pièce enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 border-b border-[#E8DCCB]/20 text-xs uppercase tracking-wider text-[#3A2A21]/60">
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Pièce</th>
                    <th className="p-4 font-semibold">Message</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Statut</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCB]/20 text-sm">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4 font-semibold text-[#3A2A21]">{o.fullName}</td>
                      <td className="p-4 text-xs text-[#3A2A21]/70 space-y-1">
                        <p className="font-mono">{o.email}</p>
                        <p className="font-bold text-[#C17D59]">{o.phoneNumber}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#C17D59] text-xs">{o.product?.name || 'Pièce en stock'}</p>
                        {o.product?.price && <p className="text-xs text-[#3A2A21]/60 font-semibold">{o.product.price} DT</p>}
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-[#3A2A21]/80 bg-white/70 p-2.5 rounded-lg border border-[#E8DCCB]/40 leading-relaxed font-mono">{o.message}</p>
                      </td>
                      <td className="p-4 text-xs text-[#3A2A21]/60">
                        {new Date(o.createdDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          o.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          o.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {o.status === 'PENDING' ? 'En attente' : o.status === 'CONTACTED' ? 'Contacté' : 'Terminé'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'CONTACTED')}
                          className="px-2.5 py-1 text-xs bg-[#E8DCCB]/30 hover:bg-[#E8DCCB] text-[#3A2A21] rounded-md font-semibold cursor-pointer"
                        >
                          Contacté
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
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

      {/* TAB CONTENT 1: PRODUCTS TABLE */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 border border-[#E8DCCB]/60 p-3 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#C17D59]" />
              <input
                type="text"
                placeholder="Rechercher par nom, bois, dimensions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DCCB] rounded-xl outline-none focus:border-[#C17D59]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-[#3A2A21]/60 font-medium">Catégorie :</span>
              <select
                value={selectedCatFilter}
                onChange={e => setSelectedCatFilter(e.target.value)}
                className="text-xs bg-[#FAF7F2] border border-[#E8DCCB] rounded-xl px-3 py-2 outline-none focus:border-[#C17D59] cursor-pointer"
              >
                <option value="ALL">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id.toString()}>{c.name}</option>
                ))}
              </select>
              <span className="text-xs font-bold text-[#C17D59] ml-2">
                {filteredProducts.length} pièces
              </span>
            </div>
          </div>

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
                    <th className="p-4 pl-6 font-medium">Photo Face</th>
                    <th className="p-4 font-medium">Catégorie</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Photos &amp; Angles</th>
                    <th className="p-4 font-medium">Disponibilité</th>
                    <th className="p-4 font-medium">Prix (DT)</th>
                    <th className="p-4 text-center font-medium">Vedette</th>
                    <th className="p-4 pr-6 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5 text-sm">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#3A2A21]/40">
                        Aucune pièce disponible avec ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const photoCount = product.images.length
                      return (
                        <motion.tr
                          key={product.id}
                          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                          className="hover:bg-white/[0.03] transition-colors group"
                        >
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="size-14 rounded-xl bg-white/40 border border-[#E8DCCB]/20 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
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
                                <p className="text-xs text-[#3A2A21]/50 line-clamp-1">{product.materials || 'Noyer noble massif'}</p>
                                {product.dimensions && (
                                  <p className="text-[11px] text-[#C17D59] font-medium mt-0.5">{product.dimensions}</p>
                                )}
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
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8DCCB]/20 border border-[#E8DCCB]/40 text-xs font-semibold text-[#C17D59]">
                                ✦ Pièce unique
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-600">
                                Reproductible
                              </span>
                            )}
                          </td>
                          {/* Photos & Angles column */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700">
                                <Camera className="size-3 text-emerald-600" />
                                {photoCount} {photoCount > 1 ? 'angles' : 'vue (face)'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                              product.availability === 'Disponible' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                              product.availability === 'Sur commande' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                              'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {product.availability}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold text-[#C17D59]">
                            {product.price ? `${product.price.toLocaleString('fr-FR')} DT` : <span className="text-amber-600/70 text-xs font-normal">À renseigner</span>}
                          </td>
                          <td className="p-4 text-center">
                            {product.isFeatured ? <Star className="size-4 text-[#C17D59] fill-[#C17D59] mx-auto" /> : <Star className="size-4 text-[#3A2A21]/20 mx-auto" />}
                          </td>
                          <td className="p-4 pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/produits/${product.id}`} target="_blank" className="p-1.5 text-[#3A2A21]/60 hover:text-[#C17D59] hover:bg-[#C17D59]/10 rounded-md transition-all" title="Aperçu">
                                <Eye className="size-4" />
                              </Link>
                              <button onClick={() => openEditModal(product)} className="p-1.5 text-[#3A2A21]/60 hover:text-[#C17D59] hover:bg-[#C17D59]/10 rounded-md transition-all cursor-pointer" title="Modifier">
                                <Edit2 className="size-4" />
                              </button>
                              <button onClick={() => handleDelete(product.id)} className="p-1.5 text-[#3A2A21]/60 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer" title="Supprimer">
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
        </div>
      )}

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-[#FAF7F2] border border-[#E8DCCB] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            <header className="p-5 border-b border-[#E8DCCB]/40 flex items-center justify-between shrink-0 bg-white/60">
              <div>
                <h2 className="font-heading text-xl font-medium text-[#3A2A21]">
                  {editingProduct ? 'Modifier la Pièce Disponible' : 'Ajouter une Pièce Disponible en Atelier'}
                </h2>
                <p className="text-xs text-[#3A2A21]/60 mt-0.5">
                  Renseignez la description, les dimensions et les photos (face principale + autres angles).
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-[#3A2A21]/50 hover:text-[#3A2A21] rounded-md transition-colors hover:bg-black/5 cursor-pointer">
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic info grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Nom de la pièce *</label>
                  <input type="text" required placeholder="Ex: Buffet Carthage en Noyer Massif" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Catégorie *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                      className="text-[11px] text-[#C17D59] hover:underline font-semibold cursor-pointer"
                    >
                      {isAddingNewCat ? '← Choisir dans la liste' : '+ Nouvelle catégorie'}
                    </button>
                  </div>

                  {isAddingNewCat ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Consoles, Fauteuils, Chaises..."
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="flex-1 bg-white border border-[#C17D59] focus:ring-1 focus:ring-[#C17D59] rounded-lg p-2 text-sm text-[#3A2A21] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateQuickCategory}
                        disabled={creatingCat || !newCatName.trim()}
                        className="px-3 py-2 bg-[#C17D59] text-white rounded-lg text-xs font-semibold hover:bg-[#A86442] disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {creatingCat ? '...' : 'Ajouter'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none cursor-pointer"
                    >
                      {categories.length === 0 ? (
                        <option value="" disabled>Chargement des catégories...</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Type de pièce</label>
                  <select value={type} onChange={e => setType(e.target.value as any)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none cursor-pointer">
                    <option value="PIECE_UNIQUE">✦ Pièce unique (1 seul exemplaire en stock)</option>
                    <option value="REPRODUCTIBLE">Modèle reproductible en atelier</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Disponibilité en stock</label>
                  <select value={availability} onChange={e => setAvailability(e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none cursor-pointer">
                    <option value="Disponible">Disponible immédiatement (En stock)</option>
                    <option value="Sur commande">Sur commande</option>
                    <option value="Vendu">Vendu</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#C17D59] font-bold">Prix de Vente (DT) *</label>
                  <input type="number" required placeholder="Ex: 2800 (Prix en Dinars Tunisiens)" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full bg-white border-2 border-[#C17D59]/50 focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none font-bold" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Dimensions réelles</label>
                  <input type="text" placeholder="Ex: 180 x 50 x 85 cm" value={dimensions} onChange={e => setDimensions(e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Bois &amp; Matériaux</label>
                  <input type="text" placeholder="Ex: 100% Noyer massif & Laiton" value={materials} onChange={e => setMaterials(e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Teinte &amp; Finition</label>
                  <input type="text" placeholder="Ex: Noyer ciré naturel, Patine dorée..." value={color} onChange={e => setColor(e.target.value)}
                    className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-2.5 text-sm text-[#3A2A21] outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#3A2A21]/70 font-bold">Description de la pièce</label>
                <textarea rows={3} placeholder="Présentation de l'ouvrage, détails de sculpture, finitions d'atelier..." value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#E8DCCB] focus:border-[#C17D59] rounded-lg p-3 text-sm text-[#3A2A21] outline-none resize-none" />
              </div>

              {/* ═══ CLEAN WORKSHOP PHOTOS MANAGER ═══ */}
              <div className="rounded-2xl border border-[#E8DCCB] bg-white/70 p-4 sm:p-5 shadow-sm">
                <WorkshopPhotosManager
                  variants={imageVariants}
                  onChange={setImageVariants}
                  uploadFn={adminApi.uploadProductImage}
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8DCCB]">
                <input type="checkbox" id="featuredCheck" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                  className="size-4 border border-[#E8DCCB] rounded text-[#C17D59] focus:ring-[#C17D59] cursor-pointer" />
                <label htmlFor="featuredCheck" className="text-xs uppercase tracking-wider text-[#3A2A21] font-semibold cursor-pointer">
                  Mettre cette pièce en vedette sur la page d&apos;accueil
                </label>
              </div>

              <footer className="pt-4 border-t border-[#E8DCCB]/40 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-full border border-[#E8DCCB] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#3A2A21] hover:bg-black/5 transition-all cursor-pointer">
                  Annuler
                </button>
                <button type="submit"
                  className="rounded-full bg-[#C17D59] hover:bg-[#A86442] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer">
                  Enregistrer la pièce
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
