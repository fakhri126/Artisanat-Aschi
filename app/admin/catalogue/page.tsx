'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest } from '@/lib/api'
import { Plus, Edit2, Trash2, Eye, Bot, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { MultiImageUploader } from '@/components/site/image-uploader'

export default function AdminCataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [isAiGenerated, setIsAiGenerated] = useState(false)

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

  const openCreateModal = () => {
    setEditingProduct(null)
    setName(''); setDescription(''); setCategoryId(categories[0]?.id.toString() || '')
    setDimensions(''); setMaterials(''); setColor(''); setPrice('')
    setAvailability('Disponible'); setImageUrls([]); setIsAiGenerated(false)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name); setDescription(product.description || '')
    setCategoryId(product.category.id.toString()); setDimensions(product.dimensions || '')
    setMaterials(product.materials || ''); setColor(product.color || '')
    setPrice(product.price ? product.price.toString() : '')
    setAvailability(product.availability || 'Disponible')
    setImageUrls(product.images.map(img => img.imageUrl))
    setIsAiGenerated(false)
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
    const payload: ProductRequest = {
      name, description, categoryId: parseInt(categoryId), dimensions, materials,
      color, price: price === '' ? null : parseFloat(price), availability,
      type: 'CATALOGUE', isFeatured: false,
      imageUrls: imageUrls.length > 0 ? imageUrls : ['/placeholder.png'],
    }
    try {
      if (editingProduct) await adminApi.updateProduct(editingProduct.id, payload)
      else await adminApi.createProduct(payload)
      setModalOpen(false); loadData()
    } catch (err: any) { alert(err.message || "Erreur d'enregistrement.") }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-light text-ivory text-left">Catalogue d&apos;Inspiration</h1>
          <p className="mt-1 text-sm text-ivory/60 text-left">
            Modèles passés utilisés comme source d&apos;inspiration. Apparaissent sur la page <strong className="text-gold font-medium">/catalogue</strong>.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-full bg-gold hover:bg-gold/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]"
        >
          <Plus className="size-4" /> Ajouter au catalogue
        </motion.button>
      </div>

      {/* AI notice */}
      <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
        <Bot className="mt-0.5 size-4 shrink-0 text-gold" />
        <span>Les modèles du catalogue peuvent être générés ou illustrés par IA. Un avertissement est affiché aux visiteurs sur la page publique.</span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {/* Grid of catalogue items */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
      >
        {products.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 bg-walnut/50 backdrop-blur-md border border-gold/10 rounded-2xl text-ivory/40">
            <Bot className="size-10 mb-3 opacity-20" />
            <p>Aucun modèle dans le catalogue d&apos;inspiration.</p>
          </div>
        ) : (
          products.map((product) => {
            const image = product.images?.[0]?.imageUrl || '/placeholder.png'
            return (
              <motion.article
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="group bg-walnut/50 backdrop-blur-md border border-gold/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-gold/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-black/40">
                  <img src={image} alt={product.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 border border-gold/20 px-2.5 py-1 backdrop-blur-md shadow-inner">
                    <Bot className="size-3 text-gold" />
                    <span className="text-[10px] uppercase tracking-wider text-gold font-medium">Catalogue</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-medium text-ivory leading-tight">{product.name}</h3>
                    <span className="shrink-0 rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                      {product.category?.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ivory/60 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-ivory/50 font-medium">
                    {product.color && (
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full shadow-inner" style={{ backgroundColor: product.color.toLowerCase() === 'noyer' ? '#5C3317' : product.color.toLowerCase() === 'or' ? '#C9A84C' : product.color.toLowerCase() === 'bleu' ? '#2D5F8A' : '#C4A882' }} />
                        {product.color}
                      </span>
                    )}
                    {product.dimensions && <span>{product.dimensions}</span>}
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-gold/10 pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link href={`/produits/${product.id}`} target="_blank" className="p-1.5 text-ivory/60 hover:text-ivory hover:bg-white/5 rounded-md transition-colors" title="Voir sur le site">
                      <Eye className="size-4" />
                    </Link>
                    <button onClick={() => openEditModal(product)} className="p-1.5 text-ivory/60 hover:text-gold hover:bg-gold/10 rounded-md transition-colors" title="Modifier">
                      <Edit2 className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-ivory/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          })
        )}
      </motion.div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-walnut border border-gold/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <header className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-ivory">
                {editingProduct ? 'Modifier le modèle' : 'Ajouter au catalogue'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-ivory/50 hover:text-ivory rounded-md transition-colors hover:bg-white/5">
                <X className="size-5" />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom du modèle</label>
                  <input type="text" required placeholder="Ex: Buffet Carthage" value={name} onChange={e => setName(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catégorie</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Matériaux</label>
                  <input type="text" placeholder="Ex: Noyer massif" value={materials} onChange={e => setMaterials(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Couleur</label>
                  <select value={color} onChange={e => setColor(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none">
                    {['Noyer', 'Bleu', 'Or', 'Naturel', 'Blanc Cérusé', 'Vert Olivier', 'Bordeaux'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dimensions</label>
                  <input type="text" placeholder="Ex: 180 x 50 x 85 cm" value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Prix indicatif (DT)</label>
                  <input type="number" placeholder="Laisser vide = Sur demande" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
                <textarea rows={3} placeholder="Présentation du modèle..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none" />
              </div>
              <MultiImageUploader
                label="Images du modèle"
                imageUrls={imageUrls}
                onAdd={(url) => setImageUrls(prev => [...prev, url])}
                onRemove={(index) => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadProductImage}
              />
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                <input type="checkbox" id="aiCheck" checked={isAiGenerated} onChange={e => setIsAiGenerated(e.target.checked)} className="size-4 rounded" />
                <label htmlFor="aiCheck" className="text-xs text-foreground cursor-pointer flex items-center gap-2">
                  <Bot className="size-4 text-gold" />
                  Ce modèle est généré / illustré par IA
                </label>
              </div>
              <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all">
                  Annuler
                </button>
                <button type="submit" className="rounded-full bg-gold hover:bg-gold/90 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all">
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
