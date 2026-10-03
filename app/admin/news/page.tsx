'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  Newspaper, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  Search, 
  RefreshCw, 
  Sparkles,
  Image as ImageIcon 
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, News } from '@/lib/api'
import NewsModal from './NewsModal'

const getReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

const isRecent = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getNews()
      setNews(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement des actualités:', err)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette actualité ?')) return
    try {
      await adminApi.deleteNews(id)
      setNews(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    }
  }

  const openCreateModal = () => {
    setEditingNews(null)
    setModalOpen(true)
  }

  const openEditModal = (item: News) => {
    setEditingNews(item)
    setModalOpen(true)
  }

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news
    const query = searchQuery.toLowerCase().trim()
    return news.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    )
  }, [news, searchQuery])

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-[#0F172A]">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <Newspaper className="size-3.5" /> Événements &amp; Vie de l&apos;Atelier
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#0F172A] font-bold">
            Actualités
          </h1>
          <p className="text-sm text-[#475569] mt-1 font-normal">
            Gérez les annonces, expositions et histoires de l&apos;atelier pour tenir votre audience informée.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#C8960C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <Plus className="size-4" /> Publier une actualité
        </button>
      </div>

      {/* ─── Barre de Recherche & Contrôles ─── */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par titre ou mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#64748B] font-medium bg-[#FAF8F5] border border-[#E2DBD0] px-3 py-2 rounded-xl">
            <strong className="text-[#0F172A]">{filteredNews.length}</strong> article{filteredNews.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={loadNews}
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-3 py-2 rounded-xl border border-[#E2DBD0] bg-white transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Grille des Actualités ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des articles...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59]">
            <Newspaper className="size-8" />
          </div>
          <div>
            <p className="text-[#0F172A] text-sm font-bold">Aucune actualité trouvée</p>
            <p className="text-[#64748B] text-xs mt-1">
              {searchQuery ? 'Aucun article ne correspond à votre recherche.' : 'Cliquez sur "Publier une actualité" pour créer votre premier article.'}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="text-xs text-[#C17D59] font-bold hover:underline"
          >
            + Rédiger un premier article
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => {
            const recent = isRecent(item.createdDate)

            return (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-[#E8DFD4] shadow-xs hover:shadow-lg hover:border-[#C8960C]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Photo Média */}
                  <div className="relative aspect-[16/10] w-full bg-[#EFECE6] border-b border-[#E8DFD4] overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-[#94A3B8]">
                        <ImageIcon className="size-10" />
                      </div>
                    )}

                    {recent && (
                      <span className="absolute top-3 right-3 bg-[#FAF0E6] text-[#C17D59] border border-[#E8DFD4] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-md">
                        <Sparkles className="size-3 text-[#C8960C]" /> Nouveau
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                      <span className="bg-white/90 border border-[#E8DFD4] text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                        <Calendar className="size-3 text-[#C17D59]" />
                        {new Date(item.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="bg-white/90 border border-[#E8DFD4] text-[#475569] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                        <Clock className="size-3 text-[#C17D59]" /> {getReadTime(item.content)}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-heading text-lg font-bold text-[#0F172A] group-hover:text-[#C17D59] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Barre d'Actions Inférieure */}
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E8DFD4] flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2DBD0] text-[#0F172A] hover:bg-[#FAF8F5] hover:border-[#C8960C] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 className="size-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> Supprimer
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ─── Modale d'Édition / Création ─── */}
      <NewsModal
        isOpen={modalOpen}
        newsItem={editingNews}
        onClose={() => {
          setModalOpen(false)
          setEditingNews(null)
        }}
        onSaved={loadNews}
      />
    </div>
  )
}
