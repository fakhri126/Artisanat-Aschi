'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Upload, 
  X, 
  RefreshCw,
  Palette,
  Hammer,
  Shield,
  Ruler,
  CheckSquare,
  Square,
  ZoomIn,
  Move,
  Crop,
  Check,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Product, ProductRequest, Category } from '@/lib/api'

export type HandleCategoryFilter = 'ALL' | 'ceramique' | 'sculptee' | 'cuivre'
export type HandleSizeFilter = 'ALL' | 'petit' | 'moyen' | 'grand'

export default function CatalogTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Identical 3 Category Filter to Public Site
  const [typeFilter, setTypeFilter] = useState<HandleCategoryFilter>('ALL')
  
  // Identical Size Sub-Filter to Public Site (Petit, Moyen, Grand)
  const [sizeFilter, setSizeFilter] = useState<HandleSizeFilter>('ALL')

  // Multi-selection & Bulk Delete State
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<{
    name: string
    description: string
    categoryType: 'ceramique' | 'sculptee' | 'cuivre'
    sizeType: 'petit' | 'moyen' | 'grand'
    price: number
    availability: string
    imageUrl: string
  }>({
    name: '',
    description: '',
    categoryType: 'ceramique',
    sizeType: 'moyen',
    price: 35,
    availability: 'Disponible',
    imageUrl: ''
  })

  // ─── Interactive Circular Cropper Tool States ──────────────────────────────
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [rawImageFile, setRawImageFile] = useState<File | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropProcessing, setCropProcessing] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allProducts, allCategories] = await Promise.all([
        adminApi.getProducts().catch(() => []),
        adminApi.getCategories().catch(() => [])
      ])

      setCategories(allCategories)

      // Inclusive handle detection filter
      const isHandleProduct = (p: Product) => {
        const catName = p.category?.name?.toLowerCase() || ''
        const catType = p.category?.type?.toLowerCase() || ''
        const mat = p.materials?.toLowerCase() || ''
        const name = p.name?.toLowerCase() || ''
        const pType = (p.type || '').toLowerCase()
        if (catName.includes("porte bijou") || catName.includes("porte-bijou") || catName.includes("porte bijoux") || name.includes("porte bijou") || name.includes("porte-bijou") || name.includes("porte bijoux")) {
          return false
        }
        return (
          catName.includes("bijoux de porte") || 
          catName.includes("ronds") || 
          catName.includes("ovales") || 
          catName.includes("poignée") ||
          catName.includes("poignee") ||
          catName.includes("bouton") ||
          catType.includes("bijou") ||
          pType === 'bijoux_de_porte' ||
          pType.includes("bijou de porte") ||
          pType.includes("poign") ||
          name.includes("bouton") || 
          name.includes("poignée") ||
          name.includes("poignee")
        )
      }

      // Filter handle products directly from the database
      const existingApiHandles = allProducts.filter(isHandleProduct)
      setProducts(existingApiHandles)
      setSelectedIds([])
    } catch (err) {
      console.error('Error loading handle products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Parse helper for Product Type (Harmonized with Public Site)
  const getProductType = (p: Product): 'ceramique' | 'sculptee' | 'cuivre' => {
    const catName = (p.category?.name || '').toLowerCase()
    const mat = (p.materials || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()

    if (
      catName.includes('cuivre') || 
      catName.includes('laiton') || 
      catName.includes('bronze') || 
      mat.includes('cuivre') || 
      mat.includes('laiton') || 
      mat.includes('bronze') || 
      name.includes('cuivre') || 
      name.includes('laiton')
    ) {
      return 'cuivre'
    }
    if (
      catName.includes('sculptee') || 
      catName.includes('sculptée') || 
      name.includes('tirant') ||
      (catName.includes('sculpt') && !name.includes('bouton') && !mat.includes('céramique') && !mat.includes('ceramique') && !mat.includes('faïence') && !mat.includes('faience') && !desc.includes('faïence') && !desc.includes('céramique'))
    ) {
      return 'sculptee'
    }
    return 'ceramique'
  }

  // Parse helper for Product Size (Petit, Moyen, Grand)
  const getProductSize = (p: Product): 'petit' | 'moyen' | 'grand' => {
    const dims = (p.dimensions || '').toLowerCase()
    const style = (p.style || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()

    if (
      dims.includes('petit') || 
      style.includes('petit') || 
      name.includes('petit') || 
      desc.includes('petit') ||
      dims.startsWith('4') ||
      dims.startsWith('5')
    ) {
      return 'petit'
    }
    if (
      dims.includes('grand') || 
      style.includes('grand') || 
      name.includes('grand') || 
      desc.includes('grand') ||
      dims.startsWith('8') ||
      dims.startsWith('9') ||
      dims.startsWith('10') ||
      dims.startsWith('11') ||
      dims.startsWith('12')
    ) {
      return 'grand'
    }
    return 'moyen'
  }

  // Filter products by Search, Type & Size
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pType = getProductType(p)
      const pSize = getProductSize(p)

      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.materials || '').toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'ALL' || pType === typeFilter
      const matchesSize = typeFilter === 'sculptee' || sizeFilter === 'ALL' || pSize === sizeFilter

      return matchesSearch && matchesType && matchesSize
    })
  }, [products, search, typeFilter, sizeFilter])

  // Counts for tabs
  const typeCounts = useMemo(() => {
    return {
      ALL: products.length,
      ceramique: products.filter(p => getProductType(p) === 'ceramique').length,
      sculptee: products.filter(p => getProductType(p) === 'sculptee').length,
      cuivre: products.filter(p => getProductType(p) === 'cuivre').length,
    }
  }, [products])

  const sizeCounts = useMemo(() => {
    const currentPool = typeFilter === 'ALL' ? products : products.filter(p => getProductType(p) === typeFilter)
    return {
      ALL: currentPool.length,
      petit: currentPool.filter(p => getProductSize(p) === 'petit').length,
      moyen: currentPool.filter(p => getProductSize(p) === 'moyen').length,
      grand: currentPool.filter(p => getProductSize(p) === 'grand').length,
    }
  }, [products, typeFilter])

  // Select All logic
  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      const currentIds = filteredProducts.map(p => p.id)
      setSelectedIds(currentIds)
    }
  }

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Bulk Delete Function
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    const count = selectedIds.length
    if (!confirm(`Voulez-vous vraiment supprimer les ${count} modèle(s) sélectionné(s) ? Cette action est irréversible.`)) {
      return
    }

    setIsBulkDeleting(true)
    try {
      await Promise.all(selectedIds.map(id => adminApi.deleteProduct(id).catch(err => console.error(err))))
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
      alert(`${count} modèle(s) supprimé(s) avec succès.`)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression groupée.')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      const pImg = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || (product as any).image_url || (product as any).imageUrl || (product as any).imageUrls?.[0] || ''
      setFormData({
        name: product.name,
        description: product.description || '',
        categoryType: getProductType(product),
        sizeType: getProductSize(product),
        price: product.price,
        availability: product.availability || 'Disponible',
        imageUrl: pImg
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        categoryType: 'ceramique',
        sizeType: 'moyen',
        price: 35,
        availability: 'Disponible',
        imageUrl: ''
      })
    }
    setIsModalOpen(true)
  }

  // Handle Initial File Selection -> Opens Circular Cropper Tool!
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRawImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setRawImageSrc(event.target?.result as string)
      setCropZoom(1)
      setCropPan({ x: 0, y: 0 })
      setIsCropperOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // reset input
  }

  // Execute Circular Crop & Upload as Pure Transparent PNG
  const handlePerformCrop = async () => {
    if (!rawImageSrc || !imageRef.current) return
    setCropProcessing(true)

    try {
      const img = imageRef.current
      const canvas = document.createElement('canvas')
      const targetSize = 600
      canvas.width = targetSize
      canvas.height = targetSize
      const ctx = canvas.getContext('2d')

      if (!ctx) throw new Error('Canvas context error')

      // Clear with 100% transparency
      ctx.clearRect(0, 0, targetSize, targetSize)

      // Create Circular Clipping Path
      ctx.save()
      ctx.beginPath()
      ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()

      // Calculate scaled and translated draw dimensions
      const aspect = img.naturalWidth / img.naturalHeight
      let drawWidth = targetSize * cropZoom
      let drawHeight = targetSize * cropZoom

      if (aspect > 1) {
        drawWidth = targetSize * aspect * cropZoom
      } else {
        drawHeight = (targetSize / aspect) * cropZoom
      }

      const drawX = (targetSize - drawWidth) / 2 + (cropPan.x * (targetSize / 260))
      const drawY = (targetSize - drawHeight) / 2 + (cropPan.y * (targetSize / 260))

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      ctx.restore()

      // Convert Canvas to Pure PNG Blob (Transparent Background)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Erreur lors de la génération du PNG.')
          setCropProcessing(false)
          return
        }

        const pngFile = new File([blob], `poignee-ronde-${Date.now()}.png`, { type: 'image/png' })
        
        try {
          const res = await adminApi.uploadImage(pngFile)
          setFormData(prev => ({ ...prev, imageUrl: res.url }))
          setIsCropperOpen(false)
        } catch (err) {
          console.error(err)
          alert("Erreur lors de l'enregistrement de l'image sur le serveur.")
        } finally {
          setCropProcessing(false)
        }
      }, 'image/png')

    } catch (err) {
      console.error(err)
      alert('Erreur lors du découpage circulaire.')
      setCropProcessing(false)
    }
  }

  // Bypass Cropping (Direct Upload)
  const handleBypassCrop = async () => {
    if (!rawImageFile) return
    setCropProcessing(true)
    try {
      const res = await adminApi.uploadImage(rawImageFile)
      setFormData(prev => ({ ...prev, imageUrl: res.url }))
      setIsCropperOpen(false)
    } catch (err) {
      console.error(err)
      alert("Erreur lors du téléversement direct.")
    } finally {
      setCropProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let targetCategory = categories.find(c => {
        const cName = c.name.toLowerCase()
        if (formData.categoryType === 'ceramique') return cName.includes('céramique') || cName.includes('ceramique') || cName.includes('faïence') || cName.includes('bouton')
        if (formData.categoryType === 'sculptee') return cName.includes('sculpt') || cName.includes('bois')
        if (formData.categoryType === 'cuivre') return cName.includes('cuivre') || cName.includes('laiton')
        return false
      })

      if (!targetCategory) {
        targetCategory = categories[0]
      }

      const sizeLabel = 
        formData.sizeType === 'petit' ? 'Petit' :
        formData.sizeType === 'moyen' ? 'Moyen' :
        'Grand'

      const productPayload: ProductRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: targetCategory ? targetCategory.id : 1,
        materials: formData.categoryType === 'ceramique' ? 'Céramique d’art et noyer' : formData.categoryType === 'cuivre' ? 'Cuivre ciselé et laiton' : 'Noyer sculpté à la main',
        dimensions: sizeLabel,
        style: formData.sizeType,
        availability: formData.availability,
        type: 'CATALOGUE',
        color: 'Naturel',
        isFeatured: true,
        imageUrls: formData.imageUrl ? [formData.imageUrl] : [],
        imageVariants: formData.imageUrl ? [{ imageUrl: formData.imageUrl, colorLabel: 'Original' }] : []
      }

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productPayload)
      } else {
        await adminApi.createProduct(productPayload)
      }

      await loadData()
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement du modèle.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce modèle de poignée ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setSelectedIds(prev => prev.filter(item => item !== id))
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression.')
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-white font-medium">Catalogue des Modèles</h2>
          <p className="text-xs text-ivory/60 mt-1">
            Gérez vos bijoux de porte classés par catégorie (Céramique, Sculptée, Cuivre) et tailles.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-gold hover:bg-[#F3E5AB] text-walnut px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nouveau Modèle</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. LES 3 CATÉGORIES PRINCIPALES (TABS)                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* TOUT */}
        <button
          onClick={() => { setTypeFilter('ALL'); setSizeFilter('ALL'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            typeFilter === 'ALL'
              ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-gold'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider text-ivory/50 font-bold mb-1">Tous les modèles</div>
          <div className="font-heading text-xl text-white font-bold">{typeCounts.ALL} pièces</div>
        </button>

        {/* CÉRAMIQUE */}
        <button
          onClick={() => { setTypeFilter('ceramique'); setSizeFilter('ALL'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            typeFilter === 'ceramique'
              ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-gold'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-bold mb-1">
            <Palette className="size-3.5" />
            <span>Poignée Céramique</span>
          </div>
          <div className="font-heading text-xl text-white font-bold">{typeCounts.ceramique} pièces</div>
        </button>

        {/* SCULPTÉE */}
        <button
          onClick={() => { setTypeFilter('sculptee'); setSizeFilter('ALL'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            typeFilter === 'sculptee'
              ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-gold'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-bold mb-1">
            <Hammer className="size-3.5" />
            <span>Poignée Sculptée</span>
          </div>
          <div className="font-heading text-xl text-white font-bold">{typeCounts.sculptee} pièces</div>
        </button>

        {/* CUIVRE */}
        <button
          onClick={() => { setTypeFilter('cuivre'); setSizeFilter('ALL'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            typeFilter === 'cuivre'
              ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-gold'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-bold mb-1">
            <Shield className="size-3.5" />
            <span>Poignée en Cuivre</span>
          </div>
          <div className="font-heading text-xl text-white font-bold">{typeCounts.cuivre} pièces</div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 2. BARRE DE RECHERCHE & FILTRE DE TAILLE (PETIT, MOYEN, GRAND)            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-stone-900/90 rounded-2xl border border-white/10">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matière..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Size Filters (Strict: Tous, Petit, Moyen, Grand) - Hidden for Poignée Sculptée */}
        {typeFilter !== 'sculptee' && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] uppercase tracking-widest text-ivory/50 font-bold mr-1 shrink-0 flex items-center gap-1">
              <Ruler className="size-3 text-gold" />
              <span>Taille :</span>
            </span>

            <button
              onClick={() => setSizeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer ${
                sizeFilter === 'ALL' 
                  ? 'bg-gold text-walnut' 
                  : 'bg-black/40 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              Toutes ({sizeCounts.ALL})
            </button>

            <button
              onClick={() => setSizeFilter('petit')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer ${
                sizeFilter === 'petit' 
                  ? 'bg-gold text-walnut' 
                  : 'bg-black/40 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              Petit ({sizeCounts.petit})
            </button>

            <button
              onClick={() => setSizeFilter('moyen')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer ${
                sizeFilter === 'moyen' 
                  ? 'bg-gold text-walnut' 
                  : 'bg-black/40 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              Moyen ({sizeCounts.moyen})
            </button>

            <button
              onClick={() => setSizeFilter('grand')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer ${
                sizeFilter === 'grand' 
                  ? 'bg-gold text-walnut' 
                  : 'bg-black/40 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              Grand ({sizeCounts.grand})
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRE DE SÉLECTION GROUPÉE ET SUPPRESSION (SÉLECTIONNER TOUT)           */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-stone-900/60 rounded-xl border border-white/10">
        
        {/* Toggle Select All */}
        <button
          onClick={handleToggleSelectAll}
          className="flex items-center gap-2.5 text-xs font-bold text-ivory hover:text-gold transition-colors cursor-pointer"
        >
          {isAllSelected ? (
            <CheckSquare className="size-4 text-gold" />
          ) : (
            <Square className="size-4 text-ivory/50" />
          )}
          <span>
            {isAllSelected ? 'Tout désélectionner' : `Sélectionner tout (${filteredProducts.length})`}
          </span>
        </button>

        {/* Selected count & Bulk Delete Button */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gold font-semibold">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>

            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>{isBulkDeleting ? 'Suppression...' : `Supprimer la sélection (${selectedIds.length})`}</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-ivory/50 hover:text-white underline cursor-pointer"
            >
              Annuler
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. GRILLE DES MODÈLES AVEC CARTES FINES ET SANS FOND                       */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50 flex flex-col items-center justify-center">
          <RefreshCw className="size-8 animate-spin text-gold mb-3" />
          <p className="text-xs uppercase tracking-wider">Chargement des modèles...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <Sparkles className="size-8 text-gold/30 mb-3" />
          <p className="text-sm font-medium mb-1">Aucun modèle trouvé pour cette sélection.</p>
          <p className="text-xs text-ivory/40">Cliquez sur &quot;Nouveau Modèle&quot; pour ajouter une pièce avec sa photo.</p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => {
            const pType = getProductType(product)
            const pSize = getProductSize(product)
            const pImg = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || (product as any).image_url || (product as any).imageUrl || (product as any).imageUrls?.[0] || ''
            const isSelected = selectedIds.includes(product.id)

            const typeLabel = 
              pType === 'ceramique' ? 'Poignée Céramique' :
              pType === 'sculptee' ? 'Poignée Sculptée' :
              'Poignée en Cuivre'

            const sizeLabel = 
              pSize === 'petit' ? 'Petit' :
              pSize === 'moyen' ? 'Moyen' :
              'Grand'

            return (
              <div 
                key={product.id}
                className={`bg-stone-900 rounded-2xl border transition-all flex flex-col justify-between shadow-xl group relative overflow-hidden ${
                  isSelected 
                    ? 'border-gold ring-2 ring-gold/40 bg-stone-900/90' 
                    : 'border-gold/20 hover:border-gold/60'
                }`}
              >
                {/* Checkbox for individual selection */}
                <div 
                  onClick={() => handleToggleSelectOne(product.id)}
                  className="absolute top-2.5 left-2.5 z-20 cursor-pointer p-1 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                  title="Sélectionner pour supprimer"
                >
                  {isSelected ? (
                    <CheckSquare className="size-4 text-gold" />
                  ) : (
                    <Square className="size-4 text-white/50 hover:text-white" />
                  )}
                </div>

                <div className="p-3.5 pt-8 flex flex-col items-center">
                  
                  {/* Badges */}
                  <div className="flex items-center justify-between w-full gap-1 mb-2">
                    <span className="text-[8.5px] uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded font-bold ml-auto truncate">
                      {typeLabel}
                    </span>
                    <span className="text-[8.5px] uppercase tracking-wider text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-semibold shrink-0">
                      {sizeLabel}
                    </span>
                  </div>

                  {/* PURE FLOATING KNOB / LINEAR HANDLE (Sans fond, juste la poignée) */}
                  <div className={`relative flex items-center justify-center my-1 group-hover:scale-105 transition-transform duration-300 ${
                    pType === 'sculptee' ? 'h-28 sm:h-32 w-full' : 'size-24 sm:size-28'
                  }`}>
                    {pImg ? (
                      <img
                        src={pImg}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter contrast-105"
                      />
                    ) : (
                      <ImageIcon className="size-8 text-gold/30" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-2 text-center space-y-0.5 w-full">
                    <h3 className="font-heading text-sm text-white font-medium truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-[10.5px] text-ivory/60 line-clamp-2 leading-relaxed min-h-[26px]">{product.description}</p>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-3 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
                  <span className="font-heading text-xs text-gold font-bold">{product.price} TND</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-1.5 rounded-lg bg-white/5 text-gold hover:bg-gold hover:text-walnut transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Edit className="size-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALE D'ÉDITION ET D'AJOUT DE MODÈLE                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-gold/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-white cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-2xl text-white">
                {editingProduct ? 'Modifier le Modèle de Poignée' : 'Nouveau Modèle de Poignée'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom du Modèle *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bouton Rosace Bleue"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                />
              </div>

              {/* Type / Catégorie & Taille */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Catégorie *</label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) => setFormData({ ...formData, categoryType: e.target.value as any })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs font-semibold"
                  >
                    <option value="ceramique">🏺 Poignée Céramique</option>
                    <option value="sculptee">🪵 Poignée Sculptée</option>
                    <option value="cuivre">⚜️ Poignée en Cuivre</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Taille *</label>
                  <select
                    value={formData.sizeType}
                    onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as any })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs font-semibold"
                  >
                    <option value="petit">Petit</option>
                    <option value="moyen">Moyen</option>
                    <option value="grand">Grand</option>
                  </select>
                </div>
              </div>

              {/* Prix & Disponibilité */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Prix (TND) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Disponibilité</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Sur commande">Sur commande</option>
                    <option value="Édition limitée">Édition limitée</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload with Interactive Circular Cropper */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex justify-between items-center">
                  <span>Photo du modèle *</span>
                  <span className="text-[9px] text-ivory/50 lowercase">Découpe circulaire PNG auto</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/uploads/poignee-1.png ou URL"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-gold text-white"
                  />
                  <label className="inline-flex items-center gap-1.5 bg-gold text-walnut hover:bg-[#F3E5AB] px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-sm">
                    <Crop className="size-3.5" />
                    <span>Choisir &amp; Découper</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>
                
                {/* Photo Preview */}
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-black/40 rounded-xl border border-white/10">
                    <div className="relative size-12 flex items-center justify-center shrink-0">
                      <img src={formData.imageUrl} alt="preview" className="max-h-full max-w-full object-contain drop-shadow" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-[11px] text-white font-medium truncate">{formData.imageUrl}</span>
                      <span className="text-[9px] text-gold">✓ Rendu sans fond transparent actif</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Description (optionnelle)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails sur les motifs, émaux, finitions..."
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-gold transition-colors text-white text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="bg-gold text-walnut font-bold px-6 py-2.5 rounded-lg text-xs hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Créer le Modèle'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. OUTIL DE DÉCOUPE CIRCULAIRE INTERACTIF (EXPORT PNG TRANSPARENT)        */}
      {/* ========================================================================= */}
      {isCropperOpen && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-gold/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-left">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-gold">
                <Crop className="size-5" />
                <h3 className="font-heading text-lg text-white font-medium">Découpe Circulaire Parfaite</h3>
              </div>
              <button
                onClick={() => setIsCropperOpen(false)}
                className="text-ivory/50 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-ivory/70 leading-relaxed">
              Faites glisser pour centrer la poignée dans le cercle, et ajustez le zoom pour un détourage parfait sans fond.
            </p>

            {/* Interactive Viewport with Circular Mask */}
            <div 
              className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] bg-black/80 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
              onMouseDown={(e) => {
                setIsDragging(true)
                setDragStart({ x: e.clientX - cropPan.x, y: e.clientY - cropPan.y })
              }}
              onMouseMove={(e) => {
                if (!isDragging) return
                setCropPan({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                })
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                setIsDragging(true)
                setDragStart({ x: touch.clientX - cropPan.x, y: touch.clientY - cropPan.y })
              }}
              onTouchMove={(e) => {
                if (!isDragging) return
                const touch = e.touches[0]
                setCropPan({
                  x: touch.clientX - dragStart.x,
                  y: touch.clientY - dragStart.y
                })
              }}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* Inner Target Crosshairs */}
              <div className="absolute inset-0 pointer-events-none border border-gold/30 rounded-full z-10" />
              <div className="absolute size-4 border border-gold/40 rounded-full pointer-events-none z-10" />

              <img
                ref={imageRef}
                src={rawImageSrc}
                alt="Source to crop"
                draggable={false}
                style={{
                  transform: `translate(${cropPan.x}px, ${cropPan.y}px) scale(${cropZoom})`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  userSelect: 'none'
                }}
                className="pointer-events-none transition-transform duration-75"
              />
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-ivory/80">
                <span className="flex items-center gap-1">
                  <ZoomIn className="size-3 text-gold" />
                  <span>Zoom / Échelle</span>
                </span>
                <span className="text-gold font-bold">{Math.round(cropZoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePerformCrop}
                disabled={cropProcessing}
                className="w-full py-3 rounded-xl bg-gold text-walnut text-xs font-bold uppercase tracking-wider hover:bg-[#F3E5AB] transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {cropProcessing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Découpage &amp; Envoi PNG...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4 text-walnut" />
                    <span>Valider la Découpe Circulaire (PNG Sans Fond)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBypassCrop}
                disabled={cropProcessing}
                className="text-[11px] text-ivory/50 hover:text-white underline text-center py-1 cursor-pointer"
              >
                Téléverser la photo originale sans découper
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
