'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  ArrowLeftRight
} from 'lucide-react'
import { Relooking } from '@/lib/api'
import { formatImageUrl } from '@/lib/utils'

function isDeadPhoto(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  const lower = url.toLowerCase().trim()
  return (
    lower.includes('gallery-1') ||
    lower.includes('gallery-2') ||
    lower.includes('relooking_service') ||
    lower.includes('herochaise') ||
    lower.includes('placeholder')
  )
}

interface RelookingsTabProps {
  relookings: Relooking[]
  loading: boolean
  onRefresh: () => void
  onEdit: (r: Relooking) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

export default function RelookingsTab({
  relookings,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onCreate,
}: RelookingsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return relookings
    const q = searchQuery.toLowerCase().trim()
    return relookings.filter(r =>
      r.title.toLowerCase().includes(q) ||
      Boolean(r.description?.toLowerCase().includes(q)) ||
      Boolean(r.category?.toLowerCase().includes(q))
    )
  }, [relookings, searchQuery])

  return (
    <div className="space-y-6 text-left text-[#0F172A]">
      {/* ─── Barre de Recherche & Contrôles ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E8DFD4] p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par titre, catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl outline-none focus:border-[#C8960C] focus:bg-white transition-all text-[#0F172A]"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-[#0F172A] bg-[#FAF8F5] border border-[#E2DBD0] px-3 py-2 rounded-xl">
            <strong>{filtered.length}</strong> restauration{filtered.length > 1 ? 's' : ''}
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

      {/* ─── Table des Restaurations ─── */}
      {loading && relookings.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des restaurations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-3">
          <ArrowLeftRight className="size-10 text-[#94A3B8]" />
          <p className="text-sm font-medium">Aucune restauration trouvée.</p>
          <button
            onClick={onCreate}
            className="text-xs text-[#C17D59] font-bold hover:underline"
          >
            + Publier un premier projet Avant / Après
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8DFD4] text-[11px] uppercase tracking-wider text-[#64748B]">
                  <th className="p-4 pl-6 font-bold w-28">Avant</th>
                  <th className="p-4 font-bold w-28">Après</th>
                  <th className="p-4 font-bold">Projet &amp; Détails</th>
                  <th className="p-4 font-bold">Catégorie</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD4] text-xs">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5] transition-colors group">
                    {/* Image Avant */}
                    <td className="p-4 pl-6">
                      <div className="size-16 rounded-xl overflow-hidden bg-stone-100 relative border border-[#E8DFD4] shadow-2xs">
                        {r.imageAvantUrl ? (
                          <img src={formatImageUrl(r.imageAvantUrl)} alt="Avant" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-[#94A3B8] size-5" />
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-stone-800/80 text-white text-[8px] text-center font-bold tracking-wider py-0.5">
                          AVANT
                        </div>
                      </div>
                    </td>

                    {/* Image Après */}
                    <td className="p-4">
                      <div className="size-16 rounded-xl overflow-hidden bg-stone-100 relative border border-[#E8DFD4] shadow-2xs">
                        {r.imageApresUrl ? (
                          <img src={formatImageUrl(r.imageApresUrl)} alt="Après" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-[#94A3B8] size-5" />
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-[#C17D59] text-white text-[8px] text-center font-bold tracking-wider py-0.5">
                          APRÈS
                        </div>
                      </div>
                    </td>

                    {/* Titre & Description */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-bold text-[#0F172A] text-sm group-hover:text-[#C17D59] transition-colors">
                          {r.title}
                        </p>
                        {(isDeadPhoto(r.imageAvantUrl) || isDeadPhoto(r.imageApresUrl)) && (
                          <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9.5px] font-bold rounded-full">
                            ⚠️ Gabarit de test
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                    </td>

                    {/* Catégorie */}
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-[#FAF0E6] text-[#C17D59] border border-[#E8DFD4] text-[10.5px] uppercase tracking-wider font-semibold rounded-full">
                        {r.category || 'Général'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(r)}
                          className="p-1.5 text-[#64748B] hover:text-[#C17D59] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                          title="Modifier la restauration"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la restauration"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
