'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  Camera, 
  RefreshCw,
  Image as ImageIcon,
  Package
} from 'lucide-react'
import { Product, Category } from '@/lib/api'

interface ProductsTabProps {
  products: Product[]
  categories: Category[]
  loading: boolean
  onRefresh: () => void
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

export default function ProductsTab({
  products,
  categories,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onCreate,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL')

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCatFilter === 'ALL' || p.category?.id?.toString() === selectedCatFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        Boolean(p.materials?.toLowerCase().includes(q)) ||
        Boolean(p.dimensions?.toLowerCase().includes(q)) ||
        Boolean(p.category?.name?.toLowerCase().includes(q))
      )
      return matchesCat && matchesSearch
    })
  }, [products, selectedCatFilter, searchQuery])

  return (
    <div className="space-y-6 text-left text-[#0F172A]">
      {/* ─── Barre de Recherche & Filtres ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E8DFD4] p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par nom, bois, dimensions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl outline-none focus:border-[#C8960C] focus:bg-white transition-all text-[#0F172A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-medium">Catégorie :</span>
            <select
              value={selectedCatFilter}
              onChange={e => setSelectedCatFilter(e.target.value)}
              className="text-xs bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl px-3 py-2 outline-none focus:border-[#C8960C] focus:bg-white text-[#0F172A] cursor-pointer"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          </div>

          <span className="text-xs font-semibold text-[#0F172A] bg-[#FAF8F5] border border-[#E2DBD0] px-3 py-2 rounded-xl">
            <strong>{filteredProducts.length}</strong> pièce{filteredProducts.length > 1 ? 's' : ''}
          </span>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] p-2 rounded-xl border border-[#E2DBD0] bg-white transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Table des Pièces en Stock ─── */}
      {loading && products.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des pièces en stock...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-3">
          <Package className="size-10 text-[#94A3B8]" />
          <p className="text-sm font-medium">Aucune pièce disponible trouvée.</p>
          <button
            onClick={onCreate}
            className="text-xs text-[#C17D59] font-bold hover:underline"
          >
            + Ajouter une nouvelle pièce disponible
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8DFD4] text-[11px] uppercase tracking-wider text-[#64748B]">
                  <th className="p-4 pl-6 font-bold">Photo Face</th>
                  <th className="p-4 font-bold">Catégorie</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Photos &amp; Angles</th>
                  <th className="p-4 font-bold">Disponibilité</th>
                  <th className="p-4 font-bold">Prix (DT)</th>
                  <th className="p-4 text-center font-bold">Vedette</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4] text-xs">
                {filteredProducts.map((product) => {
                  const photoCount = product.images?.length || 0
                  const facePhoto = product.images?.[0]?.imageUrl

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF8F5] transition-colors group">
                      {/* Photo & Nom */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="size-14 rounded-xl bg-stone-100 border border-[#E8DFD4] overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            {facePhoto ? (
                              <img
                                src={facePhoto}
                                alt={product.name}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                              />
                            ) : (
                              <ImageIcon className="size-5 text-[#94A3B8]" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-[#0F172A] text-sm">{product.name}</p>
                            <p className="text-xs text-[#64748B] line-clamp-1">{product.materials || 'Noyer noble massif'}</p>
                            {product.dimensions && (
                              <p className="text-[11px] text-[#C17D59] font-medium mt-0.5">{product.dimensions}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[10.5px] uppercase tracking-wider font-semibold text-[#C17D59]">
                          {product.category?.name}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        {product.type === 'PIECE_UNIQUE' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                            ✦ Pièce unique
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700">
                            Reproductible
                          </span>
                        )}
                      </td>

                      {/* Photos & Angles */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                          <Camera className="size-3 text-emerald-600" />
                          {photoCount} {photoCount > 1 ? 'angles' : 'vue'}
                        </span>
                      </td>

                      {/* Disponibilité */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                          product.availability === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          product.availability === 'Sur commande' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {product.availability}
                        </span>
                      </td>

                      {/* Prix */}
                      <td className="p-4 font-bold text-sm text-[#0F172A]">
                        {product.price ? (
                          `${product.price.toLocaleString('fr-FR')} DT`
                        ) : (
                          <span className="text-amber-700 text-xs font-normal">À renseigner</span>
                        )}
                      </td>

                      {/* Vedette */}
                      <td className="p-4 text-center">
                        {product.isFeatured ? (
                          <Star className="size-4 text-[#C8960C] fill-[#C8960C] mx-auto" />
                        ) : (
                          <Star className="size-4 text-[#CBD5E1] mx-auto" />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/produits/${product.id}`}
                            target="_blank"
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] rounded-lg transition-all"
                            title="Aperçu sur le site"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 text-[#64748B] hover:text-[#C17D59] hover:bg-[#FAF8F5] rounded-lg transition-all cursor-pointer"
                            title="Modifier la pièce"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product.id)}
                            className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Supprimer la pièce"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
