'use client'

import { useEffect, useState } from 'react'
import { adminApi, News } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Calendar, Image as ImageIcon } from 'lucide-react'

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getNews()
      setNews(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des actualités.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingNews(null)
    setTitle('')
    setContent('')
    setImageUrl('')
    setModalOpen(true)
  }

  const openEditModal = (item: News) => {
    setEditingNews(item)
    setTitle(item.title)
    setContent(item.content)
    setImageUrl(item.imageUrl || '')
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette actualité ?')) return
    try {
      await adminApi.deleteNews(id)
      setNews(news.filter(item => item.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur de suppression.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { title, content, imageUrl: imageUrl || '/placeholder.png' }

    try {
      if (editingNews) {
        await adminApi.updateNews(editingNews.id, payload)
      } else {
        await adminApi.createNews(payload)
      }
      setModalOpen(false)
      loadNews()
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.")
    }
  }

  if (loading && news.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-light text-foreground text-left">Actualités</h1>
          <p className="mt-1 text-sm text-muted-foreground text-left">Gérez les annonces et événements de l&apos;atelier Artisanat Aschi.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-gold hover:bg-gold/95 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow"
        >
          <Plus className="size-4" /> Nouvelle Actualité
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {/* Grid of news */}
      <div className="grid gap-6 md:grid-cols-2">
        {news.length === 0 ? (
          <div className="col-span-2 text-center py-10 bg-background border border-border rounded-2xl text-muted-foreground">
            Aucune actualité publiée.
          </div>
        ) : (
          news.map((item) => (
            <article key={item.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-48 bg-secondary overflow-hidden relative border-b border-border">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground"><ImageIcon className="size-10" /></div>
                  )}
                  <span className="absolute bottom-4 left-4 bg-walnut/80 text-ivory text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="size-3 text-gold" /> {new Date(item.createdDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-heading text-xl font-medium text-foreground text-left">{item.title}</h3>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed text-left line-clamp-4">{item.content}</p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-border mt-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-border hover:border-gold rounded-full text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors"
                >
                  <Edit2 className="size-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-border hover:border-red-500 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
            <header className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-foreground">
                {editingNews ? 'Modifier l\'actualité' : 'Publier une actualité'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Titre de l&apos;actualité</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exposition Artisanale de Tunis 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">URL de l&apos;image</label>
                <input
                  type="text"
                  placeholder="Ex: /news-exposition.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contenu de l&apos;actualité</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Description détaillée de l'événement ou de l'annonce..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
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
                  Publier
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
