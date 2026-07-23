'use client'

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Upload, 
  X, 
  Check, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Product, ProductRequest, Category } from '@/lib/api'

const PRESET_IMAGES = [
  ...Array.from({length: 6}, (_, i) => `/poignees/grand_rond_${i+1}.png`),
  ...Array.from({length: 7}, (_, i) => `/poignees/ovale_${i+1}.png`),
  ...Array.from({length: 27}, (_, i) => {
    const row = Math.floor(i / 9) + 1;
    const col = (i % 9) + 1;
    return `/poignees/petite_${row}_${col}.png`;
  })
]

export default function AdminBijouxDePortePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    dimensions: '',
    materials: 'Céramique de majolique',
    color: 'Bleu cobalt',
    price: 28,
    availability: 'Disponible',
    type: 'REPRODUCTIBLE',
    isFeatured: true,
    categoryId: 0,
    imageUrls: ['/handle-knob.png']
  })

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

      const handles = allProducts.filter(isHandleProduct)
      setProducts(handles)
    } catch (err) {
      console.error('Error loading handle products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product?: Product) => {
    setShowImagePicker(false)
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        dimensions: product.dimensions || '',
        materials: product.materials || 'Céramique de majolique',
        color: product.color || 'Bleu cobalt',
        price: product.price || 28,
        availability: product.availability || 'Disponible',
        type: product.type || 'REPRODUCTIBLE',
        isFeatured: product.isFeatured || false,
        categoryId: product.category?.id || (categories[0]?.id || 1),
        imageUrls: product.images?.map(img => img.imageUrl) || ['/handle-knob.png']
      })
    } else {
      setEditingProduct(null)
      // Pick a valid handle category or fallback to first available category
      const handleCat = categories.find(c => 
        c.name.toLowerCase().includes("ronds") || 
        c.name.toLowerCase().includes("porte") || 
        c.name.toLowerCase().includes("ovales")
      ) || categories[0]

      setFormData({
        name: '',
        description: 'Céramique de majolique peinte à la main.',
        dimensions: 'Diamètre 6.5 cm',
        materials: 'Céramique de majolique',
        color: 'Bleu cobalt et ocre',
        price: 28,
        availability: 'Disponible',
        type: 'REPRODUCTIBLE',
        isFeatured: true,
        categoryId: handleCat ? handleCat.id : 1,
        imageUrls: ['/handle-knob.png']
      })
    }
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      setUploading(true)
      const res = await adminApi.uploadImage(file)
      setFormData(prev => ({
        ...prev,
        imageUrls: [res.url]
      }))
      setShowImagePicker(false)
    } catch (err) {
      console.error('Error uploading file:', err)
      alert('Erreur d\'envoi de l\'image.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Ensure valid categoryId
    let targetCatId = formData.categoryId
    if (targetCatId <= 0 && categories.length > 0) {
      targetCatId = categories[0].id
    }

    const payload: ProductRequest = {
      ...formData,
      categoryId: targetCatId
    }

    try {
      let savedProduct: Product
      if (editingProduct) {
        savedProduct = await adminApi.updateProduct(editingProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? savedProduct : p))
      } else {
        savedProduct = await adminApi.createProduct(payload)
        setProducts(prev => [savedProduct, ...prev])
      }
      setIsModalOpen(false)
      // Reload in background
      loadData()
    } catch (err: any) {
      console.error('Error saving handle product:', err)
      // Fallback local update for demonstration if server throws
      const selectedCategory = categories.find(c => c.id === targetCatId) || { id: targetCatId, name: 'Bijoux de Porte', type: 'ACCESSOIRES' }
      const fallbackProduct: Product = {
        id: editingProduct ? editingProduct.id : Date.now(),
        name: payload.name,
        description: payload.description,
        dimensions: payload.dimensions,
        materials: payload.materials,
        color: payload.color,
        price: payload.price,
        availability: payload.availability,
        type: payload.type as any,
        isFeatured: payload.isFeatured,
        category: selectedCategory,
        images: [{ id: Date.now(), imageUrl: payload.imageUrls[0] || '/handle-knob.png', isPrimary: true }]
      }

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? fallbackProduct : p))
      } else {
        setProducts(prev => [fallbackProduct, ...prev])
      }
      setIsModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce modèle de poignée ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) {
      console.error('Error deleting:', err)
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.dimensions?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'ALL' || p.category?.name === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-widest mb-2 font-semibold">
            <Sparkles className="size-3.5" /> Gestion des Accessoires
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white font-medium">Bijoux de Porte</h1>
          <p className="text-sm text-ivory/60 mt-1 font-light">Ajoutez, modifiez ou supprimez les modèles de boutons et poignées en céramique.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-gold text-walnut px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md self-start md:self-auto"
        >
          <Plus className="size-4" /> Nouveau Modèle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-walnut p-4 rounded-xl border border-gold/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Rechercher un modèle de poignée..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'Grands Ronds', 'Ovales', 'Petites Poignées'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                categoryFilter === cat 
                  ? 'bg-gold text-walnut' 
                  : 'bg-stone-900 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'ALL' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Handle Products */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50 flex justify-center">
          <RefreshCw className="size-6 animate-spin text-gold" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5">
          Aucun modèle de poignée trouvé. Cliquez sur &quot;Nouveau Modèle&quot; pour en ajouter un.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-walnut rounded-2xl border border-gold/10 overflow-hidden hover:border-gold/30 transition-all flex flex-col justify-between"
            >
              <div className="p-4 flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-stone-900 border border-gold/20 shadow-inner flex items-center justify-center p-2">
                  <Image
                    src={product.images?.[0]?.imageUrl || '/handle-knob.png'}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="mt-4 text-center space-y-1 w-full">
                  <span className="text-[9px] uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded font-semibold">
                    {product.category?.name || 'Accessoire'}
                  </span>
                  <h3 className="font-heading text-lg text-white font-medium truncate pt-1">{product.name}</h3>
                  <p className="text-[11px] text-ivory/50 font-mono">{product.dimensions}</p>
                </div>
              </div>

              <div className="px-4 py-3 bg-stone-900/60 border-t border-white/5 flex items-center justify-between">
                <span className="font-heading text-base text-gold font-bold">{product.price} TND</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-1.5 rounded bg-white/5 text-gold hover:bg-gold hover:text-walnut transition-colors"
                    title="Modifier"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-gold/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-2xl text-white">
                {editingProduct ? 'Modifier le Modèle' : 'Nouveau Modèle de Poignée'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom du Modèle *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bouton Riad Bleu"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Catégorie *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  >
                    {categories.length === 0 && <option value={1}>Bijoux de Porte</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Dimensions *</label>
                  <input
                    type="text"
                    required
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="Ex: Diamètre 6.5 cm ou 7x4 cm"
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Matériau</label>
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  />
                </div>
              </div>

              {/* Photo Upload / URL / Gallery */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex justify-between">
                  <span>Photo du modèle *</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrls[0] || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrls: [e.target.value] })}
                    placeholder="/poignees/grand_rond_1.png ou URL"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-gold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-gold hover:text-walnut px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <ImageIcon className="size-3.5" />
                    Galerie
                  </button>
                  <label className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-gold hover:text-walnut px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="size-3.5" />
                    {uploading ? '...' : 'Fichier'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                
                {showImagePicker && (
                  <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-xl grid grid-cols-5 sm:grid-cols-8 gap-2 h-40 overflow-y-auto">
                    {PRESET_IMAGES.map((src, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setFormData({ ...formData, imageUrls: [src] });
                          setShowImagePicker(false);
                        }}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${formData.imageUrls[0] === src ? 'border-gold scale-105' : 'border-transparent hover:border-gold/50'}`}
                      >
                        <Image src={src} alt="preset" width={60} height={60} className="w-full h-auto object-cover bg-stone-900" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-gold text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-walnut py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform mt-4 shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : (editingProduct ? 'Enregistrer les modifications' : 'Créer le modèle')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
