'use client'

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Upload, 
  X, 
  DoorOpen, 
  Sofa, 
  Palette, 
  Hammer, 
  Shield, 
  Ruler, 
  Check, 
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2
} from 'lucide-react'
import Image from 'next/image'
import { adminApi } from '@/lib/api'

export interface BoardModel {
  id: string
  title: string
  subtitle: string
  category: 'portes' | 'meubles'
  subType: string
  sizeCategory?: 'grand' | 'moyen' | 'ovale'
  image: string
  dimensions?: string
  description: string
  idealFor: string
  tags: string[]
}

export const DEFAULT_BOARDS: BoardModel[] = []

export default function CatalogTab() {
  const [boards, setBoards] = useState<BoardModel[]>([])
  const [search, setSearch] = useState('')
  
  // Niveau 1 : Univers (portes vs meubles)
  const [mainCat, setMainCat] = useState<'portes' | 'meubles'>('meubles')

  // Sous-filtres Portes
  const [doorSubType, setDoorSubType] = useState<'ALL' | 'ceramique' | 'sculptee' | 'cache_serrure' | 'cache_cellule'>('ALL')

  // Sous-filtres Meubles
  const [furnitureSubType, setFurnitureSubType] = useState<'ALL' | 'ceramique' | 'sculptee'>('ALL')
  const [ceramicSize, setCeramicSize] = useState<'ALL' | 'grand' | 'moyen' | 'ovale'>('ALL')

  // Modal d'édition / création
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<BoardModel | null>(null)
  const [uploading, setUploading] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState<Omit<BoardModel, 'id'>>({
    title: '',
    subtitle: '',
    category: 'meubles',
    subType: 'ceramique',
    sizeCategory: 'grand',
    image: '',
    dimensions: '',
    description: '',
    idealFor: '',
    tags: []
  })
  const [tagsInput, setTagsInput] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBoards()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('aschi_bijoux_boards_user_v1')
        localStorage.removeItem('aschi_bijoux_boards')
      } catch (_) {}
    }
  }, [])

  const loadBoards = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bijoux-de-porte')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setBoards(data)
        }
      }
    } catch (e) {
      console.error('Erreur chargement Supabase', e)
    } finally {
      setLoading(false)
    }
  }

  const handleResetDefaults = async () => {
    if (confirm('Voulez-vous rafraîchir le catalogue depuis Supabase ?')) {
      await loadBoards()
    }
  }

  const handleOpenCreateModal = () => {
    setEditingBoard(null)
    setFormData({
      title: '',
      subtitle: '',
      category: mainCat,
      subType: mainCat === 'portes' ? 'ceramique' : 'ceramique',
      sizeCategory: 'grand',
      image: '',
      dimensions: '',
      description: '',
      idealFor: '',
      tags: []
    })
    setTagsInput('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (board: BoardModel) => {
    setEditingBoard(board)
    setFormData({
      title: board.title,
      subtitle: board.subtitle,
      category: board.category,
      subType: board.subType,
      sizeCategory: board.sizeCategory || 'grand',
      image: board.image,
      dimensions: board.dimensions || '',
      description: board.description,
      idealFor: board.idealFor,
      tags: board.tags
    })
    setTagsInput(board.tags.join(', '))
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cette planche / modèle de Supabase ?')) return
    try {
      const res = await fetch(`/api/bijoux-de-porte?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setBoards(prev => prev.filter(b => b.id !== id))
      } else {
        const err = await res.json()
        alert(err.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      setUploading(true)
      const res = await adminApi.uploadImage(file)
      // Normalisation systématique en chemin relatif /uploads/...
      const cleanUrl = res.url.replace(/^https?:\/\/[^/]+(?:\/api)?/, '')
      setFormData(prev => ({ ...prev, image: cleanUrl }))
    } catch (err: any) {
      alert(err.message || "Erreur lors du téléversement de l'image.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const payload = editingBoard 
      ? { ...formData, id: editingBoard.id, tags }
      : { ...formData, id: `board-${Date.now()}`, tags }

    try {
      setUploading(true)
      const res = await fetch('/api/bijoux-de-porte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const saved = await res.json()
        if (editingBoard) {
          setBoards(prev => prev.map(b => b.id === saved.id ? saved : b))
        } else {
          setBoards(prev => [saved, ...prev])
        }
        setIsModalOpen(false)
      } else {
        const err = await res.json()
        alert(err.error || 'Erreur lors de la sauvegarde dans Supabase')
      }
    } catch (err) {
      alert('Erreur de connexion avec Supabase')
    } finally {
      setUploading(false)
    }
  }

  // Filtrage selon la recherche et les onglets
  const filteredBoards = boards.filter(board => {
    const matchesSearch = 
      board.title.toLowerCase().includes(search.toLowerCase()) ||
      board.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      board.description.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (board.category !== mainCat) return false

    if (mainCat === 'portes') {
      if (doorSubType !== 'ALL' && board.subType !== doorSubType && !(doorSubType === 'cache_serrure' && board.subType === 'cache_cellule')) return false
    } else {
      if (furnitureSubType !== 'ALL' && board.subType !== furnitureSubType) return false
      if (furnitureSubType === 'ceramique' && ceramicSize !== 'ALL') {
        if (board.sizeCategory !== ceramicSize) return false
      }
    }

    return true
  })

  // Compteurs
  const doorsCount = boards.filter(b => b.category === 'portes').length
  const furnitureCount = boards.filter(b => b.category === 'meubles').length

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">

      {/* ========================================================================= */}
      {/* SÉLECTEUR DE NIVEAU 1 : 2 UNIVERS (PORTES vs MEUBLES)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Univers 1 : Poignées de Portes */}
        <button
          type="button"
          onClick={() => setMainCat('portes')}
          className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            mainCat === 'portes'
              ? 'bg-[#3B271C] border-[#E6A635] shadow-lg text-white ring-1 ring-[#E6A635]/50'
              : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
          }`}
        >
          <div className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black">
            <Image
              src="/poignees/type_poignee_porte.jpg"
              alt="Poignées de Portes"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-white">Poignées de Portes</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">
                {doorsCount} modèles
              </span>
            </div>
            <p className="text-xs text-ivory/60 mt-0.5">Céramique, Sculptée, Cache Serrure</p>
          </div>
        </button>

        {/* Univers 2 : Poignées de Meubles */}
        <button
          type="button"
          onClick={() => setMainCat('meubles')}
          className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            mainCat === 'meubles'
              ? 'bg-[#3B271C] border-[#E6A635] shadow-lg text-white ring-1 ring-[#E6A635]/50'
              : 'bg-stone-900/60 border-white/10 text-ivory/60 hover:bg-stone-900'
          }`}
        >
          <div className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black">
            <Image
              src="/poignees/type_poignee_meuble.jpg"
              alt="Poignées de Meubles"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-white">Poignées de Meubles</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6A635]/20 text-[#F2BD52] font-bold">
                {furnitureCount} planches
              </span>
            </div>
            <p className="text-xs text-ivory/60 mt-0.5">Céramique (Grand, Moyen, Ovale) &amp; Bois Sculpté</p>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BARRE D'ACTIONS & FILTRES DE SOUS-CATÉGORIES                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-walnut p-4 rounded-xl border border-gold/10">
        
        {/* Recherche */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Filtrer les planches et modèles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold"
          />
        </div>

        {/* Filtres spécifiques Portes */}
        {mainCat === 'portes' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Tous les types' },
              { id: 'ceramique', label: 'Poignée Céramique' },
              { id: 'sculptee', label: 'Poignée Sculptée' },
              { id: 'cache_serrure', label: 'Cache Serrure' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDoorSubType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                  doorSubType === tab.id
                    ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                    : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filtres spécifiques Meubles */}
        {mainCat === 'meubles' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => { setFurnitureSubType('ALL'); setCeramicSize('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'ALL'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => { setFurnitureSubType('ceramique'); setCeramicSize('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'ceramique' && ceramicSize === 'ALL'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Céramique (Tous formats)
            </button>
            <button
              type="button"
              onClick={() => { setFurnitureSubType('ceramique'); setCeramicSize('grand'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'ceramique' && ceramicSize === 'grand'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Grand (6-7 cm)
            </button>
            <button
              type="button"
              onClick={() => { setFurnitureSubType('ceramique'); setCeramicSize('moyen'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'ceramique' && ceramicSize === 'moyen'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Moyenne (3-4 cm)
            </button>
            <button
              type="button"
              onClick={() => { setFurnitureSubType('ceramique'); setCeramicSize('ovale'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'ceramique' && ceramicSize === 'ovale'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Ovale (7x4 cm)
            </button>
            <button
              type="button"
              onClick={() => { setFurnitureSubType('sculptee'); setCeramicSize('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                furnitureSubType === 'sculptee'
                  ? 'bg-[#E6A635] text-[#1A110B] font-bold'
                  : 'bg-stone-900 text-ivory/70 hover:text-white border border-white/5'
              }`}
            >
              Sculptée
            </button>
          </div>
        )}

        {/* Boutons Création & Réinitialisation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Restaurer les modèles et planches par défaut"
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-ivory/50 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-[#E6A635] hover:bg-[#F3C45E] text-[#1A110B] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow"
          >
            <Plus className="size-4" />
            <span>Ajouter une Planche / Modèle</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* GRILLE DES PLANCHES ET MODÈLES DANS LE DASHBOARD                         */}
      {/* ========================================================================= */}
      {filteredBoards.length === 0 ? (
        <div className="py-20 text-center text-ivory/40 bg-stone-900/40 rounded-2xl border border-white/5 space-y-2">
          <p className="text-sm">Aucune planche ou modèle ne correspond aux filtres actuels.</p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="text-xs text-[#E6A635] hover:underline font-semibold"
          >
            + Créer un nouveau modèle pour cet univers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="bg-walnut rounded-2xl border border-gold/15 overflow-hidden flex flex-col justify-between shadow-lg group hover:border-[#E6A635]/60 transition-all"
            >
              {/* Image */}
              <div>
                <div className="relative w-full aspect-[16/10] bg-stone-950 overflow-hidden border-b border-white/5">
                  {board.image ? (
                    <Image
                      src={board.image}
                      alt={board.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-ivory/20">
                      <ImageIcon className="size-10" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-[#1A110B]/90 text-[#F2BD52] border border-[#E6A635]/30">
                      {board.category === 'portes' ? '🚪 Poignée de Porte' : '🪑 Poignée de Meuble'}
                    </span>
                    {board.subType && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-[#E6A635] text-[#1A110B]">
                        {board.subType === 'cache_serrure' || board.subType === 'cache_cellule' ? 'Cache Serrure' : board.subType}
                      </span>
                    )}
                  </div>

                  {board.dimensions && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] bg-black/80 text-white/90">
                      {board.dimensions}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h4 className="font-heading text-lg text-white font-medium line-clamp-1">{board.title}</h4>
                  <p className="text-[11px] text-[#F2BD52] font-medium line-clamp-1">{board.subtitle}</p>
                  <p className="text-xs text-ivory/70 font-light line-clamp-2 leading-relaxed">{board.description}</p>
                  
                  {board.idealFor && (
                    <div className="p-2 rounded-lg bg-stone-900/60 text-[10.5px] text-ivory/80">
                      <span className="font-bold text-[#E6A635]">Usage : </span>{board.idealFor}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {board.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-ivory/50 border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(board)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="size-3" />
                  <span>Modifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(board.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  <span>Supprimer</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CRÉATION / ÉDITION DE PLANCHE OU MODÈLE                            */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-[#E6A635]/40 rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <h3 className="font-heading text-2xl text-white">
                {editingBoard ? 'Modifier la Planche / Modèle' : 'Nouvelle Planche / Modèle'}
              </h3>
              <p className="text-xs text-[#F2BD52] mt-0.5">
                Ce modèle apparaîtra directement sur la page Bijoux de Porte du site.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Choix de l'Univers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Univers *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  >
                    <option value="portes">Poignées de Portes</option>
                    <option value="meubles">Poignées de Meubles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Sous-Catégorie *
                  </label>
                  {formData.category === 'portes' ? (
                    <select
                      value={formData.subType}
                      onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                      className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="ceramique">Poignée Céramique</option>
                      <option value="sculptee">Poignée Sculptée</option>
                      <option value="cache_serrure">Cache Serrure</option>
                    </select>
                  ) : (
                    <select
                      value={formData.subType}
                      onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                      className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="ceramique">Poignée Céramique</option>
                      <option value="sculptee">Poignée Sculptée</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Format pour Meuble Céramique */}
              {formData.category === 'meubles' && formData.subType === 'ceramique' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Format Céramique de Meuble
                  </label>
                  <select
                    value={formData.sizeCategory || 'grand'}
                    onChange={(e) => setFormData({ ...formData, sizeCategory: e.target.value as any })}
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  >
                    <option value="grand">Grand (Diamètre 6 à 7 cm)</option>
                    <option value="moyen">Moyenne (Diamètre 3 à 4 cm)</option>
                    <option value="ovale">Ovale (7 x 4 cm)</option>
                  </select>
                </div>
              )}

              {/* Titre & Sous-titre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Titre du Modèle / Planche *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Boutons Grands Ronds (6-7 cm)"
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Sous-Titre
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ex: Ligne Majolique Grand Format"
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Image Upload & URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                  Photo HD de la Planche ou Réalisation *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/bijoux-de-porte.jpg ou URL d'image"
                    className="flex-1 bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-[#E6A635] hover:text-[#1A110B] text-white font-semibold cursor-pointer transition-colors">
                    <Upload className="size-3.5" />
                    <span>{uploading ? 'Envoi...' : 'Photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Dimensions & Usage Idéal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Dimensions Types
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="Ex: Diamètre 6 à 7 cm / Longueur 25 cm"
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                    Usage Recommandé
                  </label>
                  <input
                    type="text"
                    value={formData.idealFor}
                    onChange={(e) => setFormData({ ...formData, idealFor: e.target.value })}
                    placeholder="Ex: Grands tiroirs, armoires, dressings..."
                    className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails sur l'émail, la sculpture, le rendu esthétique..."
                  className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#F2BD52] font-bold mb-1">
                  Tags &amp; Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ex: Majolique, Bois noble, Cuisines, Sur-Mesure"
                  className="w-full bg-stone-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Bouton d'enregistrement */}
              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E6A635] hover:bg-[#F3C45E] text-[#1A110B] font-bold uppercase tracking-wider shadow cursor-pointer"
                >
                  {editingBoard ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
