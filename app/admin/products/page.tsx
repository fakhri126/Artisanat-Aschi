'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, publicApi, Product, Category, ProductRequest } from '@/lib/api'
import { Plus, Edit2, Trash2, Eye, Star, X, Image as ImageIcon } from 'lucide-react'
import { MultiImageUploader } from '@/components/site/image-uploader'

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
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

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
      setProducts(prodData)
      setCategories(catData)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setName('')
    setDescription('')
    setCategoryId(categories[0]?.id.toString() || '')
    setDimensions('')
    setMaterials('')
    setColor('')
    setPrice('')
    setAvailability('Disponible')
    setType('PIECE_UNIQUE')
    setIsFeatured(false)
    setImageUrls([])
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
    const urls = product.images.map(img => img.imageUrl)
    setImageUrls(urls)
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
      imageUrls: imageUrls.length > 0 ? imageUrls : ['/placeholder.png']
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
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
          <h1 className="font-heading text-3xl font-light text-ivory text-left">Gestion des Produits</h1>
          <p className="mt-1 text-sm text-ivory/60 text-left">Gérez l&apos;ensemble du catalogue d&apos;inspiration et des pièces uniques.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-full bg-gold hover:bg-gold/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)]"
        >
          <Plus className="size-4" /> Nouveau Produit
        </motion.button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Products list table */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
        }}
        className="bg-walnut/50 backdrop-blur-md border border-gold/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-gold/10 text-xs uppercase tracking-wider text-ivory/50">
                <th className="p-4 pl-6 font-medium">Produit</th>
                <th className="p-4 font-medium">Catégorie</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Disponibilité</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 text-center font-medium">En vedette</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ivory/40">Aucun produit dans le catalogue.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr 
                    key={product.id} 
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-black/40 border border-gold/10 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                          {product.images[0]?.imageUrl ? (
                            <img 
                              src={product.images[0].imageUrl} 
                              alt={product.name} 
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.png'
                              }}
                            />
                          ) : (
                            <ImageIcon className="size-5 text-ivory/20" />
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-medium text-ivory text-base">{product.name}</p>
                          <p className="text-xs text-ivory/50 line-clamp-1">{product.materials || 'Sans matériel défini'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-medium text-ivory/80">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.type === 'PIECE_UNIQUE' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-semibold text-gold">
                          Pièce unique
                        </span>
                      ) : product.type === 'REPRODUCTIBLE' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-ivory">
                          Reproductible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/5 text-xs font-medium text-ivory/50">
                          Catalogue
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        product.availability === 'Disponible' ? 'text-emerald-400' :
                        product.availability === 'Sur commande' ? 'text-gold' : 'text-red-400'
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          product.availability === 'Disponible' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' :
                          product.availability === 'Sur commande' ? 'bg-gold shadow-[0_0_5px_rgba(201,168,76,0.5)]' : 'bg-red-400'
                        }`} />
                        {product.availability}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-ivory/90">
                      {product.price ? `${product.price.toLocaleString('fr-FR')} DT` : <span className="text-ivory/40 italic">Sur demande</span>}
                    </td>
                    <td className="p-4 text-center">
                      {product.isFeatured ? (
                        <Star className="size-4 text-gold fill-gold mx-auto drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
                      ) : (
                        <span className="text-ivory/10">—</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/produits/${product.id}`} target="_blank" className="p-1.5 text-ivory/60 hover:text-ivory hover:bg-white/5 rounded-md transition-all" title="Voir sur le site">
                          <Eye className="size-4" />
                        </Link>
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="p-1.5 text-ivory/60 hover:text-gold hover:bg-gold/10 rounded-md transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-1.5 text-ivory/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-walnut border border-gold/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <header className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-ivory">
                {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-ivory/50 hover:text-ivory rounded-md transition-colors hover:bg-white/5">
                <X className="size-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom du produit</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Buffet Carthage"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Type de produit</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  >
                    <option value="PIECE_UNIQUE">Pièce unique (Produit détourné)</option>
                    <option value="REPRODUCTIBLE">Modèle reproductible</option>
                    <option value="CATALOGUE">Inspiration (Catalogue uniquement)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Disponibilité</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Sur commande">Sur commande</option>
                    <option value="Vendu">Vendu</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dimensions</label>
                  <input
                    type="text"
                    placeholder="Ex: 180 x 50 x 85 cm"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Matériaux</label>
                  <input
                    type="text"
                    placeholder="Ex: Noyer massif & Laiton"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Couleur</label>
                  <input
                    type="text"
                    placeholder="Ex: Noyer naturel, Bleu Sidi Bou"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Prix (DT) — Laisser vide pour &quot;Sur demande&quot;</label>
                  <input
                    type="number"
                    placeholder="Ex: 4200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
                <textarea
                  rows={4}
                  placeholder="Présentation du meuble, son histoire, sa sculpture, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>

              <MultiImageUploader
                label="Images du produit"
                imageUrls={imageUrls}
                onAdd={(url) => setImageUrls(prev => [...prev, url])}
                onRemove={(index) => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadProductImage}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="size-4 border border-border rounded text-gold focus:ring-gold"
                />
                <label htmlFor="featuredCheck" className="text-xs uppercase tracking-wider text-foreground font-semibold cursor-pointer">
                  Mettre ce produit en vedette sur la page d&apos;accueil
                </label>
              </div>

              <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gold hover:bg-gold/95 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all"
                >
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
