'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { adminApi, publicApi, Product, Category, ProductRequest, ImageVariant, colorsApi, ColorSwatch } from '@/lib/api'
import { isBijouxOrHandleCategory, isBijouxOrHandleProduct } from '@/lib/utils'
import { 
  Plus, Edit2, Trash2, X, Palette, Search, Sparkles, Check, 
  RefreshCw, Tv, Frame, DoorClosed, Lamp, LayoutDashboard, Layers, Folder, FolderPlus, ListOrdered, Gem
} from 'lucide-react'
import ImageVariantManager, { COLOR_PRESETS, QUICK_DIMENSIONS } from './ImageVariantManager'

// ─── UTILS & HELPERS ────────────────────────────────────────────────────────
export const getCategorySingular = (catName: string): string => {
  if (!catName) return 'Création'
  const lower = catName.trim().toLowerCase()
  if (lower.includes('lustre')) return 'Lustre'
  if (lower.includes('porte bijou') || lower.includes('porte-bijou')) return 'Porte-Bijoux'
  if (lower.includes('lampe')) return 'Lampe'
  if (lower.includes('coffre')) return 'Coffre'
  if (lower.includes('meuble') || lower.includes('tv')) return 'Meuble TV'
  if (lower.includes('table')) return 'Table'
  if (lower.includes('buffet')) return 'Buffet'
  if (lower.includes('miroir')) return 'Miroir'
  if (lower.includes('porte')) return 'Porte'
  return lower.endsWith('s') && !lower.endsWith('tv') ? catName.trim().slice(0, -1) : catName.trim()
}

const DOOR_JEWELRY_REGEX = /bijoux? de porte|grands? ronds?|ovales?|poign[eé]es?|cuivre|sculpt[eé]e?|bouton/i
export const isDoorJewelryOrHandleCategory = (catName: string): boolean => {
  if (!catName) return false
  const norm = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  if (/porte-?bijoux?/i.test(norm) || /^portes?$/i.test(norm)) return false
  return DOOR_JEWELRY_REGEX.test(norm)
}

const getCategoryIcon = (name: string) => {
  const norm = (name || '').toLowerCase()
  if (norm.includes('buffet')) return LayoutDashboard
  if (norm.includes('tv') || norm.includes('meuble')) return Tv
  if (norm.includes('miroir')) return Frame
  if (norm.includes('porte bijou') || norm.includes('porte-bijou')) return Gem
  if (norm.includes('porte')) return DoorClosed
  if (norm.includes('lustre') || norm.includes('lampe') || norm.includes('coffre')) return Lamp
  if (norm.includes('table')) return Layers
  return Folder
}

const COLOR_MAP: Record<string, string> = {
  blanc: '#FFFFFF',
  'blanc cérusé': '#F0EDE6',
  ceruse: '#F0EDE6',
  noir: '#1A1A1A',
  noyer: '#5C3317',
  bleu: '#2D5F8A',
  or: '#C9A84C',
  doré: '#C9A84C',
  naturel: '#C4A882',
  vert: '#4A5E3A',
  olivier: '#4A5E3A',
  bordeaux: '#7B2D3E',
}

const resolveColorHex = (colorName?: string | null, customColors: ColorSwatch[] = []): string => {
  if (!colorName) return '#C4A882'
  const custom = customColors.find(c => (c.name || c.label || '').toLowerCase() === colorName.toLowerCase())
  if (custom) return custom.hex
  const norm = colorName.toLowerCase().trim()
  for (const [k, hex] of Object.entries(COLOR_MAP)) {
    if (norm.includes(k)) return hex
  }
  return '#C4A882'
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Buffets', type: 'MOBILIER' },
  { id: 2, name: 'Meubles TV', type: 'MOBILIER' },
  { id: 3, name: 'Miroirs', type: 'DECORATION' },
  { id: 4, name: 'Portes', type: 'PORTES' },
  { id: 5, name: 'Coffres', type: 'MOBILIER' },
  { id: 6, name: 'Décoration', type: 'DECORATION' },
  { id: 7, name: 'Tables', type: 'MOBILIER' },
]

interface ProductForm {
  id?: number
  name: string
  description: string
  categoryId: string
  dimensions: string
  materials: string
  color: string
  price: string
  imageVariants: ImageVariant[]
}

const DEFAULT_FORM: ProductForm = {
  name: '',
  description: '',
  categoryId: '1',
  dimensions: 'Moyen (80–150 cm)',
  materials: 'Noyer massif & Céramique',
  color: 'Noyer',
  price: '',
  imageVariants: [{ imageUrl: '', colorLabel: 'Original' }]
}

// ─── MAIN CATALOG TAB COMPONENT ─────────────────────────────────────────────
export default function CatalogTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [colors, setColors] = useState<ColorSwatch[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tout')
  const [filterColor, setFilterColor] = useState('Tout')
  const [filterDimension, setFilterDimension] = useState('Tout')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1)
  const [savingProduct, setSavingProduct] = useState(false)
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM)

  const [categoryModal, setCatModal] = useState<{ open: boolean; item: Category | null; name: string; error?: string; saving?: boolean }>({
    open: false, item: null, name: ''
  })
  const [colorModal, setColorModal] = useState<{ open: boolean; item: ColorSwatch | null; name: string; hex: string; error?: string; saving?: boolean }>({
    open: false, item: null, name: '', hex: '#C8794D'
  })

  // Category product counters
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
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, colorRes] = await Promise.allSettled([
        adminApi.getProducts(),
        publicApi.getCategories(),
        colorsApi.getColors()
      ])

      const prodData = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
      const catData = catRes.status === 'fulfilled' && Array.isArray(catRes.value) && catRes.value.length > 0 ? catRes.value : DEFAULT_CATEGORIES
      const colorData = colorRes.status === 'fulfilled' && Array.isArray(colorRes.value) ? colorRes.value : []

      if (colorData.length > 0) setColors(colorData)

      const catProds = prodData.filter(p => p.type === 'CATALOGUE' && !isBijouxOrHandleProduct(p))
      setProducts(catProds)

      let cleanCats = catData.filter(c => !isDoorJewelryOrHandleCategory(c.name) && !isBijouxOrHandleCategory(c.name))
      cleanCats = cleanCats.filter(c => {
        const norm = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
        return norm !== 'decoration' || catProds.some(p => p.category?.id === c.id)
      })

      if (!cleanCats.some(c => c.name.toLowerCase().includes('lustre'))) {
        try {
          const created = await adminApi.createCategory({ name: 'Lustres', type: 'CATALOGUE' })
          cleanCats.push(created)
        } catch {
          cleanCats.push({ id: 999, name: 'Lustres', type: 'CATALOGUE' } as any)
        }
      }

      setCategories(cleanCats)
      if (cleanCats.length > 0 && !form.categoryId) {
        setForm(prev => ({ ...prev, categoryId: cleanCats[0].id.toString() }))
      }
    } finally {
      setLoading(false)
    }
  }

  // Next model & auto description generators
  const getNextModelName = (catId: string, allProds: Product[], allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const singular = getCategorySingular(cat?.name || 'Création')
    const inGroup = allProds.filter(p => p.category?.id?.toString() === catId || p.category?.name?.toLowerCase() === cat?.name?.toLowerCase())
    
    let maxNum = 0
    for (const p of inGroup) {
      const match = p.name.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10))
    }
    return `${singular} — Modèle ${String(maxNum + 1).padStart(2, '0')}`
  }

  const buildAutoDescription = (modelName: string, catId: string, itemColor: string, itemDim: string, allCats: Category[]) => {
    const cat = allCats.find(c => c.id.toString() === catId)
    const singular = getCategorySingular(cat?.name || 'Création')
    const match = modelName.match(/(?:Modèle|Modele|N°|#|\s)(\d+)/i)
    const modelPart = match ? `(Modèle ${match[1].padStart(2, '0')}) ` : ''

    if (singular === 'Lustre') return `Lustre artisanal d'art fait-main sur-mesure ${modelPart}— Suspension noble en bois sculpté et faïence artisanale.`
    if (singular === 'Porte-Bijoux') return `Porte-bijoux artisanal d'art fait-main sur-mesure ${modelPart}— Écrin et support noble en bois sculpté et céramique d'art.`

    const colorPart = itemColor ? `Finition ${itemColor}` : 'Finition au choix'
    const dimPart = itemDim ? `, format ${itemDim}` : ''
    return `${singular} artisanal d'art fait-main sur-mesure ${modelPart}— ${colorPart}${dimPart}.`
  }

  // Reactive form updater
  const updateFormField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      if (key === 'categoryId' && !prev.id) {
        const nextName = getNextModelName(String(value), products, categories)
        updated.name = nextName
        updated.description = buildAutoDescription(nextName, String(value), updated.color, updated.dimensions, categories)
      } else if (key === 'color' || key === 'dimensions') {
        updated.description = buildAutoDescription(updated.name, updated.categoryId, updated.color, updated.dimensions, categories)
      }
      return updated
    })
  }

  // Model creation / edition triggers
  const openCreateModal = () => {
    const defaultCatId = categories[0]?.id?.toString() || '1'
    const defaultColor = 'Noyer'
    const defaultName = getNextModelName(defaultCatId, products, categories)
    setForm({
      ...DEFAULT_FORM,
      categoryId: defaultCatId,
      name: defaultName,
      color: defaultColor,
      description: buildAutoDescription(defaultName, defaultCatId, defaultColor, DEFAULT_FORM.dimensions, categories)
    })
    setModalStep(1)
    setIsProductModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      categoryId: p.category?.id?.toString() || categories[0]?.id?.toString() || '1',
      dimensions: p.dimensions || '',
      materials: p.materials || '',
      color: p.color || '',
      price: p.price ? p.price.toString() : '',
      imageVariants: p.images?.length
        ? p.images.map(img => ({ imageUrl: img.imageUrl, colorLabel: img.colorLabel || 'Original' }))
        : [{ imageUrl: '', colorLabel: 'Original' }]
    })
    setModalStep(1)
    setIsProductModalOpen(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    if (!form.name.trim()) { alert('Veuillez renseigner le nom du modèle.'); setModalStep(1); return; }
    if (!form.categoryId) { alert('Veuillez sélectionner une catégorie.'); setModalStep(1); return; }
    if (!form.imageVariants.length || !form.imageVariants[0].imageUrl.trim()) {
      alert("Veuillez ajouter au moins la photo originale principale."); setModalStep(2); return;
    }

    setSavingProduct(true)
    const payload: ProductRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: parseInt(form.categoryId),
      dimensions: form.dimensions.trim(),
      materials: form.materials.trim(),
      color: form.color.trim(),
      price: form.price === '' ? null : parseFloat(form.price),
      availability: 'Sur commande',
      type: 'CATALOGUE',
      isFeatured: false,
      imageVariants: form.imageVariants.filter(v => v.imageUrl.trim() !== '')
    }

    try {
      if (form.id) await adminApi.updateProduct(form.id, payload)
      else await adminApi.createProduct(payload)
      setIsProductModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.")
    } finally {
      setSavingProduct(false)
    }
  }

  // Reordering & Harmonisation
  const reorderCategoryWithProducts = async (catId: number, currentList: Product[]) => {
    const cat = categories.find(c => c.id === catId)
    const singular = getCategorySingular(cat?.name || '')
    const inGroup = currentList.filter(p => p.category?.id === catId || p.category?.name?.toLowerCase() === cat?.name?.toLowerCase())
    if (inGroup.length === 0) return

    const sorted = [...inGroup].sort((a, b) => {
      const matchA = a.name.match(/\d+/)
      const matchB = b.name.match(/\d+/)
      const numA = matchA ? parseInt(matchA[0], 10) : 999999
      const numB = matchB ? parseInt(matchB[0], 10) : 999999
      return numA !== numB ? numA - numB : a.id - b.id
    })

    const updates = sorted.map((p, i) => {
      const targetStr = `Modèle ${String(i + 1).padStart(2, '0')}`
      const newName = /(?:Modèle|Modele|N°|#)\s*\d+/i.test(p.name)
        ? p.name.replace(/(?:Modèle|Modele|N°|#)\s*\d+/i, targetStr)
        : `${singular} — ${targetStr}`
      const newDesc = p.description ? p.description.replace(/(?:Modèle|Modele|N°|#)\s*\d+/gi, targetStr) : ''

      if (newName === p.name && newDesc === (p.description || '')) return null

      const payload: ProductRequest = {
        name: newName,
        description: newDesc || buildAutoDescription(newName, String(p.category.id), p.color || 'Naturel', p.dimensions || '', categories),
        categoryId: p.category.id,
        dimensions: p.dimensions || 'Moyen',
        materials: p.materials || 'Bois noble & Céramique',
        color: p.color || 'Naturel',
        price: p.price ?? null,
        availability: 'Sur commande',
        type: 'CATALOGUE',
        isFeatured: p.isFeatured ?? true,
        imageVariants: p.images?.length
          ? p.images.map(img => ({ imageUrl: img.imageUrl, colorLabel: img.colorLabel || 'Original' }))
          : [{ imageUrl: '/placeholder.png', colorLabel: 'Original' }]
      }
      return adminApi.updateProduct(p.id, payload)
    }).filter(Boolean)

    if (updates.length > 0) await Promise.all(updates)
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
      alert("✅ Tous les modèles de chaque catégorie sont désormais ordonnés dès le Modèle 01 !")
    } catch (err: any) {
      alert("Erreur lors de la réorganisation : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Deletions
  const handleDeleteProduct = async (id: number) => {
    const target = products.find(p => p.id === id)
    if (!confirm(`Supprimer définitivement ce modèle ?`)) return
    setLoading(true)
    try {
      await adminApi.deleteProduct(id)
      const remaining = products.filter(p => p.id !== id)
      setProducts(remaining)
      setSelectedIds(prev => prev.filter(x => x !== id))
      if (target?.category?.id) await reorderCategoryWithProducts(target.category.id, remaining)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Supprimer définitivement les ${selectedIds.length} modèle(s) sélectionné(s) ?`)) return
    setLoading(true)
    try {
      const affectedCats = Array.from(new Set(products.filter(p => selectedIds.includes(p.id)).map(p => p.category?.id).filter(Boolean)))
      for (const id of selectedIds) await adminApi.deleteProduct(id)
      const remaining = products.filter(p => !selectedIds.includes(p.id))
      setProducts(remaining)
      setSelectedIds([])
      for (const catId of affectedCats) await reorderCategoryWithProducts(catId as number, remaining)
      await loadData()
    } finally {
      setLoading(false)
    }
  }

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const cleanId = q.replace(/^#/, '').trim()
        const matchId = cleanId !== '' && p.id.toString() === cleanId
        const matchText = p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.materials || '').toLowerCase().includes(q)
        if (!matchId && !matchText) return false
      }
      if (filterCategory !== 'Tout' && (p.category?.name || '').toLowerCase() !== filterCategory.toLowerCase()) return false
      if (filterColor !== 'Tout') {
        const hasColor = (p.color || '').toLowerCase().includes(filterColor.toLowerCase()) || p.images?.some(img => (img.colorLabel || '').toLowerCase().includes(filterColor.toLowerCase()))
        if (!hasColor) return false
      }
      if (filterDimension !== 'Tout') {
        const pDim = (p.dimensions || '').toLowerCase()
        const match = filterDimension === 'Petit' ? pDim.includes('petit') || /^[1-7]\d\s*cm/i.test(pDim) :
                      filterDimension === 'Grand' ? pDim.includes('grand') || /^(?:1[6-9]\d|[2-9]\d\d)\s*cm/i.test(pDim) :
                      pDim.includes('moyen') || !pDim
        if (!match) return false
      }
      return true
    }).sort((a, b) => {
      const catA = (a.category?.name || '').toLowerCase()
      const catB = (b.category?.name || '').toLowerCase()
      if (catA !== catB) return catA.localeCompare(catB)
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '999999', 10)
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '999999', 10)
      return numA !== numB ? numA - numB : a.id - b.id
    })
  }, [products, searchQuery, filterCategory, filterColor, filterDimension])

  return (
    <div className="space-y-6 text-[#F5F0E8] text-left">
      
      {/* ─── Showroom Toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#211A15] p-4 rounded-2xl border border-[#3A2E24]">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-[#F2BD52] tracking-wider">Catalogue Showroom</span>
          <span className="text-xs text-[#D9C8AE]/50">•</span>
          <span className="text-xs text-[#D9C8AE]/70">{products.length} modèles actifs</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCatModal({ open: true, item: null, name: '' })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1410] hover:bg-[#2A211A] border border-[#3A2E24] px-3.5 py-2 text-xs font-semibold text-[#D9C8AE] cursor-pointer shadow-xs"
          >
            <FolderPlus className="size-3.5 text-[#B89555]" />
            <span>Gérer Catégories</span>
          </button>

          <button
            onClick={() => setColorModal({ open: true, item: null, name: '', hex: '#C8794D' })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1410] hover:bg-[#2A211A] border border-[#3A2E24] px-3.5 py-2 text-xs font-semibold text-[#D9C8AE] cursor-pointer shadow-xs"
          >
            <Palette className="size-3.5 text-[#B89555]" />
            <span>Nuancier &amp; Couleurs</span>
          </button>

          <button
            onClick={reorderAllCategories}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1410] hover:bg-[#2A211A] border border-[#3A2E24] px-3.5 py-2 text-xs font-semibold text-[#D9C8AE] cursor-pointer shadow-xs"
            title="Harmoniser les numéros de modèles de 01 à N"
          >
            <ListOrdered className="size-3.5 text-[#B89555]" />
            <span className="hidden sm:inline">Harmoniser N°</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C8794D] via-[#B89555] to-[#C8794D] hover:opacity-95 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>Ajouter un Modèle</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Ribbon ───────────────────────────────────────── */}
      <div className="bg-[#211A15] p-4 sm:p-5 rounded-2xl border border-[#3A2E24] space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#D9C8AE]/50" />
            <input
              type="text"
              placeholder="Rechercher par nom (ex: Modèle 02), référence, ID (#42)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#15120F] border border-[#3A2E24] focus:border-[#C8794D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F0E8] placeholder:text-[#D9C8AE]/40 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={filterColor}
              onChange={e => setFilterColor(e.target.value)}
              className="bg-[#15120F] border border-[#3A2E24] rounded-xl px-3 py-2 text-xs text-[#D9C8AE] outline-none"
            >
              <option value="Tout">Toutes les teintes</option>
              {COLOR_PRESETS.filter(p => p.label !== 'Original' && p.label !== 'Autre…').map(c => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
              {colors.map(c => (
                <option key={c.id} value={c.name || c.label}>{c.name || c.label}</option>
              ))}
            </select>

            <select
              value={filterDimension}
              onChange={e => setFilterDimension(e.target.value)}
              className="bg-[#15120F] border border-[#3A2E24] rounded-xl px-3 py-2 text-xs text-[#D9C8AE] outline-none"
            >
              <option value="Tout">Toutes dimensions</option>
              {QUICK_DIMENSIONS.map(d => (
                <option key={d.label} value={d.label}>{d.label} ({d.desc})</option>
              ))}
            </select>

            {(searchQuery || filterCategory !== 'Tout' || filterColor !== 'Tout' || filterDimension !== 'Tout') && (
              <button
                onClick={() => { setSearchQuery(''); setFilterCategory('Tout'); setFilterColor('Tout'); setFilterDimension('Tout'); }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#D9C8AE] transition-colors cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Category Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#3A2E24]/60">
          <button
            onClick={() => setFilterCategory('Tout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filterCategory === 'Tout' ? 'bg-[#C8794D] text-white shadow-sm' : 'bg-[#15120F] text-[#D9C8AE]/70 hover:text-[#F5F0E8] border border-[#3A2E24]'
            }`}
          >
            <span>Toutes les créations</span>
            <span className="text-[10px] opacity-80">({products.length})</span>
          </button>

          {categories.map(c => {
            const Icon = getCategoryIcon(c.name)
            const count = categoryCounts[c.name] || 0
            const active = filterCategory.toLowerCase() === c.name.toLowerCase()
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  active ? 'bg-[#C8794D] text-white shadow-sm' : 'bg-[#15120F] text-[#D9C8AE]/70 hover:text-[#F5F0E8] border border-[#3A2E24]'
                }`}
              >
                <Icon className="size-3 text-[#B89555]" />
                <span>{c.name}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Showroom Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 text-center text-[#D9C8AE]/60">
          <div className="size-10 animate-spin rounded-full border-4 border-[#C8794D] border-t-transparent mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest font-semibold">Chargement des modèles...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-[#D9C8AE]/50 bg-[#211A15] rounded-3xl border border-[#3A2E24] p-8 space-y-2">
          <p className="text-sm">Aucun modèle ne correspond à vos critères.</p>
          <button onClick={openCreateModal} className="text-xs text-[#C8794D] hover:underline font-semibold cursor-pointer">
            + Ajouter un modèle pour cette sélection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {filteredProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isSelected={selectedIds.includes(p.id)}
              onToggleSelect={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
              onEdit={() => openEditModal(p)}
              onDelete={() => handleDeleteProduct(p.id)}
              colorHex={resolveColorHex(p.color, colors)}
            />
          ))}
        </div>
      )}

      {/* Floating Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
          <div className="bg-[#1A1410] border border-[#C8794D] rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 text-xs">
            <span className="font-bold text-[#F5F0E8]">{selectedIds.length} sélectionné(s)</span>
            <button
              onClick={() => setSelectedIds(selectedIds.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id))}
              className="text-[#D9C8AE] hover:underline cursor-pointer"
            >
              {selectedIds.length === filteredProducts.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
            >
              <Trash2 className="size-3" /> Supprimer
            </button>
          </div>
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────────────────── */}
      <ProductModal
        open={isProductModalOpen}
        step={modalStep}
        form={form}
        categories={categories}
        colors={colors}
        saving={savingProduct}
        onClose={() => setIsProductModalOpen(false)}
        onStepChange={setModalStep}
        onFieldChange={updateFormField}
        onSubmit={handleSaveProduct}
      />

      <CategoryModal
        state={categoryModal}
        categories={categories}
        categoryCounts={categoryCounts}
        onClose={() => setCatModal({ open: false, item: null, name: '' })}
        onSelectEdit={(cat) => setCatModal({ open: true, item: cat, name: cat.name })}
        onChangeName={(name) => setCatModal(prev => ({ ...prev, name }))}
        onSave={async (e) => {
          e.preventDefault()
          const trimmed = categoryModal.name.trim()
          if (!trimmed) { setCatModal(prev => ({ ...prev, error: 'Nom requis.' })); return; }
          setCatModal(prev => ({ ...prev, saving: true, error: undefined }))
          try {
            if (categoryModal.item) {
              const updated = await adminApi.updateCategory(categoryModal.item.id, { name: trimmed, type: 'CATALOGUE' })
              setCategories(prev => prev.map(c => c.id === categoryModal.item!.id ? updated : c))
              setProducts(prev => prev.map(p => p.category?.id === categoryModal.item!.id ? { ...p, category: { ...p.category, name: trimmed } } : p))
            } else {
              const created = await adminApi.createCategory({ name: trimmed, type: 'CATALOGUE' })
              setCategories(prev => [...prev, created])
            }
            setCatModal({ open: false, item: null, name: '' })
          } catch (err: any) {
            setCatModal(prev => ({ ...prev, error: err.message || "Erreur d'enregistrement." }))
          }
        }}
        onDelete={async (cat) => {
          if ((categoryCounts[cat.name] || 0) > 0) return alert(`Impossible : contient des modèles.`)
          if (!confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return
          try {
            await adminApi.deleteCategory(cat.id)
            setCategories(prev => prev.filter(c => c.id !== cat.id))
          } catch (err: any) { alert(err.message || 'Erreur.') }
        }}
      />

      <ColorModal
        state={colorModal}
        colors={colors}
        onClose={() => setColorModal({ open: false, item: null, name: '', hex: '#C8794D' })}
        onSelectEdit={(c) => setColorModal({ open: true, item: c, name: c.name || c.label, hex: c.hex })}
        onChangeName={(name) => setColorModal(prev => ({ ...prev, name }))}
        onChangeHex={(hex) => setColorModal(prev => ({ ...prev, hex }))}
        onSave={async (e) => {
          e.preventDefault()
          const trimmed = colorModal.name.trim()
          if (!trimmed) { setColorModal(prev => ({ ...prev, error: 'Nom requis.' })); return; }
          setColorModal(prev => ({ ...prev, saving: true, error: undefined }))
          try {
            if (colorModal.item) await colorsApi.updateColor(colorModal.item.id, { label: trimmed, hex: colorModal.hex })
            else await colorsApi.createColor({ label: trimmed, hex: colorModal.hex })
            const fresh = await colorsApi.getColors()
            setColors(fresh)
            setColorModal({ open: false, item: null, name: '', hex: '#C8794D' })
          } catch (err: any) {
            setColorModal(prev => ({ ...prev, error: err.message || "Erreur." }))
          }
        }}
        onDelete={async (c) => {
          if (!confirm(`Supprimer la teinte « ${c.name || c.label} » ?`)) return
          try {
            await colorsApi.deleteColor(c.id)
            setColors(await colorsApi.getColors())
          } catch { alert('Erreur.') }
        }}
      />

    </div>
  )
}

// ─── SUB-COMPONENT: PRODUCT CARD ────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  colorHex
}: {
  product: Product
  isSelected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDelete: () => void
  colorHex: string
}) {
  const mainImg = product.images?.[0]?.imageUrl || '/placeholder.png'

  return (
    <div
      className={`bg-[#211A15] rounded-2xl border overflow-hidden flex flex-col justify-between transition-all group ${
        isSelected ? 'border-[#C8794D] ring-2 ring-[#C8794D]/40' : 'border-[#3A2E24] hover:border-[#C8794D]/60'
      }`}
    >
      <div className="relative aspect-[4/3] bg-black/60 overflow-hidden">
        <img
          src={mainImg}
          alt={product.name}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
        />
        <div className="absolute top-2 left-2 flex gap-1 items-center">
          <span className="font-mono text-[9px] bg-black/80 text-[#F2BD52] px-1.5 py-0.5 rounded border border-[#E6A635]/30">
            #{product.id}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleSelect}
          className={`absolute top-2 right-2 size-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
            isSelected ? 'bg-[#C8794D] border-[#C8794D] text-white' : 'bg-black/50 border-white/40 text-transparent hover:border-white'
          }`}
        >
          <Check className="size-3" />
        </button>
        {product.dimensions && (
          <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/80 text-[#D9C8AE] px-1.5 py-0.5 rounded">
            {product.dimensions}
          </span>
        )}
      </div>

      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#C8794D] block truncate">
            {product.category?.name || 'Mobilier'}
          </span>
          <h4 className="font-serif text-xs font-semibold text-[#F5F0E8] line-clamp-1" title={product.name}>
            {product.name}
          </h4>
          {product.color && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="size-2 rounded-full border border-white/20" style={{ backgroundColor: colorHex }} />
              <span className="text-[10px] text-[#D9C8AE]/70 truncate">{product.color}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="font-mono text-[10px] text-[#F2BD52] font-bold">
            {product.price ? `${product.price} DT` : 'Sur devis'}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-[#D9C8AE] hover:text-white cursor-pointer" title="Modifier">
              <Edit2 className="size-3" />
            </button>
            <button onClick={onDelete} className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer" title="Supprimer">
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

// ─── SUB-COMPONENT: PRODUCT MODAL ───────────────────────────────────────────
function ProductModal({
  open,
  step,
  form,
  categories,
  colors,
  saving,
  onClose,
  onStepChange,
  onFieldChange,
  onSubmit
}: {
  open: boolean
  step: 1 | 2 | 3
  form: ProductForm
  categories: Category[]
  colors: ColorSwatch[]
  saving: boolean
  onClose: () => void
  onStepChange: (step: 1 | 2 | 3) => void
  onFieldChange: <K extends keyof ProductForm>(key: K, val: ProductForm[K]) => void
  onSubmit: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md">
      <div className="bg-[#1E1712] border border-[#3A2E24] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <header className="p-4 sm:p-5 border-b border-[#3A2E24] bg-[#16120E] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#C8794D] tracking-wider">
              {form.id ? 'Édition de Modèle' : 'Nouveau Modèle'}
            </span>
            <h3 className="font-serif text-lg font-bold text-[#F5F0E8]">
              {form.id ? form.name : 'Ajouter une pièce au catalogue'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/60 hover:text-white cursor-pointer">
            <X className="size-5" />
          </button>
        </header>

        {/* Stepper Tabs */}
        <div className="flex border-b border-[#3A2E24] bg-[#1A1410] text-xs">
          {[
            { s: 1, label: '1. Informations Générales' },
            { s: 2, label: '2. Nuancier & Photos' },
            { s: 3, label: '3. Prévisualisation' },
          ].map(item => (
            <button
              key={item.s}
              type="button"
              onClick={() => onStepChange(item.s as any)}
              className={`flex-1 py-2.5 text-center font-semibold transition-colors cursor-pointer ${
                step === item.s ? 'bg-[#C8794D] text-white' : 'text-[#D9C8AE]/60 hover:text-[#F5F0E8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Step Panels */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Catégorie *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => onFieldChange('categoryId', e.target.value)}
                    className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Nom du modèle *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => onFieldChange('name', e.target.value)}
                    className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Teinte Principale</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => onFieldChange('color', e.target.value)}
                    placeholder="Ex: Noyer, Blanc..."
                    className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={e => onFieldChange('dimensions', e.target.value)}
                    placeholder="Ex: 120 x 45 x 90 cm"
                    className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Prix indicatif (DT)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => onFieldChange('price', e.target.value)}
                    placeholder="Optionnel"
                    className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Matériaux</label>
                <input
                  type="text"
                  value={form.materials}
                  onChange={e => onFieldChange('materials', e.target.value)}
                  placeholder="Ex: Noyer massif & Céramique artisanale"
                  className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#F2BD52] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => onFieldChange('description', e.target.value)}
                  className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-[#F5F0E8] outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <ImageVariantManager
              variants={form.imageVariants}
              onChange={variants => onFieldChange('imageVariants', variants)}
              uploadFn={adminApi.uploadImage}
              colors={colors}
            />
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="max-w-xs mx-auto bg-[#15120F] rounded-2xl border border-[#3A2E24] overflow-hidden text-left shadow-lg">
                <div className="aspect-[4/3] bg-black/60 relative">
                  <img
                    src={form.imageVariants[0]?.imageUrl || '/placeholder.png'}
                    alt={form.name}
                    className="size-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#C8794D]">
                    {categories.find(c => c.id.toString() === form.categoryId)?.name || 'Mobilier'}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#F5F0E8]">{form.name}</h4>
                  <p className="text-xs text-[#D9C8AE]/70">{form.description}</p>
                  <p className="font-mono text-xs text-[#F2BD52] font-bold pt-1">{form.price ? `${form.price} DT` : 'Sur devis'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Footer */}
        <footer className="p-4 border-t border-[#3A2E24] bg-[#16120E] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => onStepChange((step - 1) as any)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer"
            >
              Précédent
            </button>
          ) : <div />}

          <div className="flex gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => onStepChange((step + 1) as any)}
                className="px-5 py-2 rounded-xl bg-[#C8794D] hover:bg-[#B5673C] text-white font-bold cursor-pointer"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#C8794D] to-[#B89555] text-white font-bold cursor-pointer shadow-md"
              >
                {saving ? 'Enregistrement...' : form.id ? 'Enregistrer les modifications' : 'Créer le Modèle'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}

// ─── SUB-COMPONENT: CATEGORY MODAL ──────────────────────────────────────────
function CategoryModal({
  state,
  categories,
  categoryCounts,
  onClose,
  onSelectEdit,
  onChangeName,
  onSave,
  onDelete
}: {
  state: { open: boolean; item: Category | null; name: string; error?: string; saving?: boolean }
  categories: Category[]
  categoryCounts: Record<string, number>
  onClose: () => void
  onSelectEdit: (cat: Category) => void
  onChangeName: (name: string) => void
  onSave: (e: React.FormEvent) => void
  onDelete: (cat: Category) => void
}) {
  if (!state.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="bg-[#1E1712] border border-[#3A2E24] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#3A2E24]">
          <h3 className="font-serif text-lg font-bold text-[#F5F0E8]">
            {state.item ? 'Modifier la catégorie' : 'Gestion des Catégories du Catalogue'}
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-3">
          <input
            type="text"
            placeholder="Nom de la catégorie (ex: Commodes, Miroirs...)"
            value={state.name}
            onChange={e => onChangeName(e.target.value)}
            className="w-full bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-xs text-[#F5F0E8] outline-none"
          />
          {state.error && <p className="text-xs text-red-400">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <button type="submit" disabled={state.saving} className="px-4 py-2 rounded-xl bg-[#C8794D] text-white font-bold text-xs cursor-pointer">
              {state.saving ? 'Envoi...' : state.item ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-[#3A2E24]">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#15120F] border border-[#3A2E24] text-xs">
              <span className="font-semibold text-[#F5F0E8]">{c.name} ({categoryCounts[c.name] || 0})</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onSelectEdit(c)} className="p-1 text-[#D9C8AE] hover:text-white cursor-pointer" title="Modifier">
                  <Edit2 className="size-3" />
                </button>
                <button onClick={() => onDelete(c)} className="p-1 text-red-400 hover:text-red-300 cursor-pointer" title="Supprimer">
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SUB-COMPONENT: COLOR MODAL ─────────────────────────────────────────────
function ColorModal({
  state,
  colors,
  onClose,
  onSelectEdit,
  onChangeName,
  onChangeHex,
  onSave,
  onDelete
}: {
  state: { open: boolean; item: ColorSwatch | null; name: string; hex: string; error?: string; saving?: boolean }
  colors: ColorSwatch[]
  onClose: () => void
  onSelectEdit: (c: ColorSwatch) => void
  onChangeName: (name: string) => void
  onChangeHex: (hex: string) => void
  onSave: (e: React.FormEvent) => void
  onDelete: (c: ColorSwatch) => void
}) {
  if (!state.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="bg-[#1E1712] border border-[#3A2E24] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#3A2E24]">
          <h3 className="font-serif text-lg font-bold text-[#F5F0E8]">
            {state.item ? 'Modifier la teinte' : 'Nuancier de l’Atelier'}
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom (ex: Vert Émeraude, Noyer Miel...)"
              value={state.name}
              onChange={e => onChangeName(e.target.value)}
              className="flex-1 bg-[#15120F] border border-[#3A2E24] rounded-xl p-2.5 text-xs text-[#F5F0E8] outline-none"
            />
            <input
              type="color"
              value={state.hex}
              onChange={e => onChangeHex(e.target.value)}
              className="size-9 rounded-xl border border-[#3A2E24] cursor-pointer bg-transparent"
            />
          </div>
          {state.error && <p className="text-xs text-red-400">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <button type="submit" disabled={state.saving} className="px-4 py-2 rounded-xl bg-[#C8794D] text-white font-bold text-xs cursor-pointer">
              {state.saving ? 'Envoi...' : state.item ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2 pt-2 border-t border-[#3A2E24]">
          {colors.map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#15120F] border border-[#3A2E24] text-xs">
              <div className="flex items-center gap-2 truncate">
                <div className="size-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                <span className="font-semibold text-[#F5F0E8] truncate">{c.name || c.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onSelectEdit(c)} className="p-1 text-[#D9C8AE] hover:text-white cursor-pointer">
                  <Edit2 className="size-3" />
                </button>
                <button onClick={() => onDelete(c)} className="p-1 text-red-400 hover:text-red-300 cursor-pointer">
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
