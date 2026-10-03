'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, RefreshCw } from 'lucide-react'
import { adminApi, Product, Category, ProductRequest, ImageVariant } from '@/lib/api'
import WorkshopPhotosManager from './WorkshopPhotosManager'

interface ProductModalProps {
  isOpen: boolean
  product: Product | null
  categories: Category[]
  products: Product[]
  onClose: () => void
  onSaved: () => void
  onCategoryCreated: (cat: Category) => void
}

function getNextModelName(catId: string, allProds: Product[], allCats: Category[]) {
  const cat = allCats.find(c => c.id.toString() === catId)
  const catName = cat?.name || 'Création'

  let singular = catName
  if (singular.toLowerCase().includes('lustre')) singular = 'Lustre'
  else if (singular.toLowerCase().includes('porte bijou') || singular.toLowerCase().includes('porte-bijou')) singular = 'Porte-Bijoux'
  else if (singular.toLowerCase().includes('lampe')) singular = 'Lampe'
  else if (singular.toLowerCase().includes('coffre')) singular = 'Coffre'
  else if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) singular = singular.slice(0, -1)
  if (singular.toLowerCase().includes('meuble')) singular = 'Meuble TV'

  const inCat = allProds.filter(p => p.category?.id?.toString() === catId || p.category?.name === catName)

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

function buildAutoDescription(modelName: string, catId: string, itemColor: string, itemDim: string, allCats: Category[]) {
  const cat = allCats.find(c => c.id.toString() === catId)
  let singular = cat?.name || 'Création'
  if (singular.toLowerCase().includes('lustre')) singular = 'Lustre'
  else if (singular.toLowerCase().includes('porte bijou') || singular.toLowerCase().includes('porte-bijou')) singular = 'Porte-Bijoux'
  else if (singular.toLowerCase().includes('lampe')) singular = 'Lampe'
  else if (singular.toLowerCase().includes('coffre')) singular = 'Coffre'
  else if (singular.toLowerCase().endsWith('s') && !singular.toLowerCase().endsWith('meubles tv')) singular = singular.slice(0, -1)
  if (singular.toLowerCase().includes('meuble')) singular = 'Meuble TV'

  const match = modelName.match(/(?:Modèle|N°|#|\s)(\d+)/i)
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

export default function ProductModal({
  isOpen,
  product,
  categories,
  products,
  onClose,
  onSaved,
  onCategoryCreated,
}: ProductModalProps) {
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

  // Quick category
  const [isAddingNewCat, setIsAddingNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [creatingCat, setCreatingCat] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || '')
      setCategoryId(product.category?.id ? product.category.id.toString() : (categories[0]?.id?.toString() || '1'))
      setDimensions(product.dimensions || '')
      setMaterials(product.materials || '')
      setColor(product.color || '')
      setPrice(product.price ? product.price.toString() : '')
      setAvailability(product.availability || 'Disponible')
      setType(product.type === 'REPRODUCTIBLE' ? 'REPRODUCTIBLE' : 'PIECE_UNIQUE')
      setIsFeatured(product.isFeatured)

      const variants: ImageVariant[] = (product.images || []).map((img, i) => ({
        imageUrl: img.imageUrl,
        colorLabel: img.colorLabel ?? (i === 0 ? 'Original' : null),
      }))
      setImageVariants(variants.length > 0 ? variants : [{ imageUrl: '', colorLabel: 'Original' }])
    } else {
      const initCatId = categories.find(c => c.name.toLowerCase().includes('buffet'))?.id?.toString() || categories[0]?.id?.toString() || '1'
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
      setImageVariants([{ imageUrl: '', colorLabel: 'Original' }])
    }
    setIsAddingNewCat(false)
    setNewCatName('')
  }, [product, isOpen, categories, products])

  if (!isOpen) return null

  const handleCreateQuickCategory = async () => {
    const trimmed = newCatName.trim()
    if (!trimmed) return
    try {
      setCreatingCat(true)
      const created = await adminApi.createCategory({ name: trimmed, type: 'MOBILIER' })
      onCategoryCreated(created)
      setCategoryId(created.id.toString())
      setNewCatName('')
      setIsAddingNewCat(false)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la catégorie.')
    } finally {
      setCreatingCat(false)
    }
  }

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId)
    if (!product) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imageVariants.length === 0 || !imageVariants[0].imageUrl) {
      alert('Veuillez ajouter au moins la photo de face principale du produit.')
      return
    }

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
          const createdCat = await adminApi.createCategory({ name: catName, type: 'CATALOGUE' })
          finalCatId = createdCat.id
        }
      } catch (catErr) {
        console.error('Error creating category:', catErr)
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
      availability,
      type,
      isFeatured,
      imageVariants: imageVariants.filter(v => v.imageUrl.trim() !== ''),
    }

    try {
      setSaving(true)
      if (product) {
        await adminApi.updateProduct(product.id, payload)
      } else {
        await adminApi.createProduct(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement de la pièce.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-[#E8DFD4] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-left text-[#0F172A]">
        {/* Header */}
        <header className="p-6 border-b border-[#E8DFD4] flex items-center justify-between shrink-0 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#0F172A]">
                {product ? 'Modifier la Pièce Disponible' : 'Ajouter une Pièce Disponible en Atelier'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Renseignez la description, les dimensions et les photos (face principale + autres angles).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-[#EFECE6] hover:bg-[#E2DBD0] flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Nom de la pièce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Buffet — Modèle 01"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                  Catégorie *
                </label>
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
                    placeholder="Ex: Consoles, Fauteuils..."
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="flex-1 rounded-xl border border-[#C17D59] bg-white px-3 py-2 text-xs text-[#0F172A] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateQuickCategory}
                    disabled={creatingCat || !newCatName.trim()}
                    className="px-3 py-2 bg-[#C17D59] text-white rounded-xl text-xs font-semibold hover:bg-[#A86442] disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {creatingCat ? '...' : 'Ajouter'}
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Type de pièce
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors cursor-pointer"
              >
                <option value="PIECE_UNIQUE">✦ Pièce unique (1 seul exemplaire en stock)</option>
                <option value="REPRODUCTIBLE">Modèle reproductible en atelier</option>
              </select>
            </div>

            {/* Disponibilité */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Disponibilité en stock
              </label>
              <select
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors cursor-pointer"
              >
                <option value="Disponible">Disponible immédiatement (En stock)</option>
                <option value="Sur commande">Sur commande</option>
                <option value="Vendu">Vendu</option>
              </select>
            </div>

            {/* Prix */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#C17D59] font-bold">
                Prix de Vente (DT) *
              </label>
              <input
                type="number"
                required
                placeholder="Ex: 2800 (Prix en Dinars Tunisiens)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full rounded-xl border border-[#C17D59] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none font-bold"
              />
            </div>

            {/* Dimensions */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Dimensions réelles
              </label>
              <input
                type="text"
                placeholder="Ex: 180 x 50 x 85 cm ou format"
                value={dimensions}
                onChange={e => handleDimensionsChange(e.target.value)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#64748B] font-medium">Format rapide :</span>
                {['Petit', 'Moyen', 'Grand'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleDimensionsChange(size)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      dimensions.toLowerCase() === size.toLowerCase()
                        ? 'bg-[#C17D59] text-white border-[#C17D59] shadow-xs'
                        : 'bg-white text-[#475569] border-[#E8DFD4] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Bois & Matériaux */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Bois &amp; Matériaux
              </label>
              <input
                type="text"
                placeholder="Ex: 100% Noyer massif noble & Céramique"
                value={materials}
                onChange={e => setMaterials(e.target.value)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
              />
            </div>

            {/* Teinte & Finition */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Teinte &amp; Finition
              </label>
              <input
                type="text"
                placeholder="Ex: Blanc, Noir, Noyer, Bleu..."
                value={color}
                onChange={e => handleColorChange(e.target.value)}
                className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors"
              />
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] text-[#64748B] font-medium">Suggéré :</span>
                {['Blanc', 'Noir', 'Noyer', 'Bleu', 'Doré', 'Naturel', 'Vert Olivier'].map(colorTag => (
                  <button
                    key={colorTag}
                    type="button"
                    onClick={() => handleColorChange(colorTag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border cursor-pointer ${
                      color.toLowerCase() === colorTag.toLowerCase()
                        ? 'bg-[#C17D59] text-white border-[#C17D59]'
                        : 'bg-white text-[#475569] border-[#E8DFD4] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {colorTag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">
                Description de la pièce
              </label>
              <button
                type="button"
                onClick={() => setDescription(buildAutoDescription(name, categoryId, color, dimensions, categories))}
                className="text-[10px] text-[#C17D59] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                🪄 Régénérer la description
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Présentation de l'ouvrage, détails de sculpture, finitions d'atelier..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#C8960C] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Photos Manager */}
          <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-4 sm:p-5 shadow-xs">
            <WorkshopPhotosManager
              variants={imageVariants}
              onChange={setImageVariants}
              uploadFn={adminApi.uploadProductImage}
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD4]">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="size-4 border border-[#D9D2C7] rounded text-[#C17D59] focus:ring-[#C17D59] cursor-pointer"
            />
            <label htmlFor="featuredCheck" className="text-xs uppercase tracking-wider text-[#0F172A] font-bold cursor-pointer">
              Mettre cette pièce en vedette sur la page d&apos;accueil
            </label>
          </div>

          {/* Footer Actions */}
          <footer className="pt-4 border-t border-[#E8DFD4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#D9D2C7] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#475569] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#C8960C] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="size-3.5 animate-spin" />}
              <span>{product ? 'Enregistrer les modifications' : 'Créer la pièce'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
