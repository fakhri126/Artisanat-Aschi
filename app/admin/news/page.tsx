'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { adminApi, News } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Calendar, Image as ImageIcon, Search, Clock, Sparkles } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getNews()
      setNews(data)
    } catch (err: any) {
      console.warn("Backend inaccessible, utilisation de données fictives (mock) pour les actualités.", err)
      // Injection de vraies fausses données (Mock Data)
      setNews([
        {
          id: 1,
          title: "Exposition Exclusive à Paris 2026",
          content: "Nous sommes fiers d'annoncer notre participation au prestigieux Salon de l'Artisanat d'Art à Paris. Venez découvrir nos dernières créations en bois d'olivier et noyer massif, ainsi que nos portes traditionnelles sculptées à la main. C'est l'occasion parfaite pour rencontrer nos maîtres artisans et discuter de vos projets sur mesure.",
          imageUrl: "https://images.unsplash.com/photo-1590059345511-7397b91d6c8b?auto=format&fit=crop&q=80&w=800",
          createdDate: new Date().toISOString()
        },
        {
          id: 2,
          title: "Lancement de la Collection 'Zellige & Bois'",
          content: "Découvrez l'harmonie parfaite entre la chaleur du bois de noyer et l'élégance géométrique du zellige authentique. Cette nouvelle collection marie deux éléments phares de notre patrimoine pour créer des pièces uniques, à la fois contemporaines et profondément ancrées dans la tradition.",
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
          createdDate: new Date(Date.now() - 3 * 86400000).toISOString() // 3 days ago
        },
        {
          id: 3,
          title: "Mise en lumière : Le travail du bois d'Olivier",
          content: "Symbole de paix et de sagesse, l'olivier est un bois noble aux veines sinueuses exceptionnelles. Dans notre atelier, chaque pièce d'olivier est séchée pendant plusieurs années avant d'être façonnée. Plongez dans les secrets de fabrication de nos miroirs et coffrets artisanaux.",
          imageUrl: "https://images.unsplash.com/photo-1611082538600-410a5ebafcc9?auto=format&fit=crop&q=80&w=800",
          createdDate: new Date(Date.now() - 15 * 86400000).toISOString() // 15 days ago
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Filtrage dynamique
  const filteredNews = useMemo(() => {
    if (!searchQuery) return news
    const query = searchQuery.toLowerCase()
    return news.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    )
  }, [news, searchQuery])

  // Helper pour temps de lecture (env. 200 mots/minute)
  const getReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min`
  }

  // Helper pour savoir si l'article est récent (< 7 jours)
  const isRecent = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  }

  const openCreateModal = () => {
    setEditingNews(null)
    setTitle(''); setContent(''); setImageUrl('')
    setModalOpen(true)
  }

  const openEditModal = (item: News) => {
    setEditingNews(item)
    setTitle(item.title); setContent(item.content); setImageUrl(item.imageUrl || '')
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
      if (editingNews) await adminApi.updateNews(editingNews.id, payload)
      else await adminApi.createNews(payload)
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
    <div className="space-y-8">
      {/* Header section with animations */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-4xl font-light text-ivory text-left">Actualités</h1>
          <p className="mt-2 text-sm text-ivory/60 text-left max-w-xl leading-relaxed">
            Gérez les annonces, événements et histoires de l&apos;atelier. Tenez votre audience informée de vos dernières créations et participations.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
        >
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gold/50" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-walnut/50 border border-gold/10 focus:border-gold/50 text-ivory placeholder:text-ivory/30 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none transition-all shadow-inner"
            />
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold/90 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)] shrink-0"
          >
            <Plus className="size-4" /> Publier
          </button>
        </motion.div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Grid of news with Masonry/Cards style */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
      >
        {filteredNews.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-walnut/50 backdrop-blur-md border border-gold/10 rounded-2xl text-ivory/40">
            <Search className="size-10 mb-3 opacity-20 mx-auto" />
            <p>Aucune actualité trouvée.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <motion.article 
              key={item.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="group bg-walnut/50 backdrop-blur-md border border-gold/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-gold/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="h-56 bg-black/40 overflow-hidden relative border-b border-gold/10">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-ivory/20"><ImageIcon className="size-10" /></div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-transparent to-transparent opacity-80" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {isRecent(item.createdDate) && (
                      <span className="bg-gold text-walnut text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Sparkles className="size-3" /> Nouveau
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                    <span className="bg-black/50 border border-gold/20 text-ivory text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <Calendar className="size-3 text-gold" /> {new Date(item.createdDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="bg-black/50 border border-gold/20 text-ivory text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <Clock className="size-3 text-gold" /> {getReadTime(item.content)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="font-heading text-xl font-medium text-ivory text-left leading-tight group-hover:text-gold transition-colors">{item.title}</h3>
                  <p className="text-sm font-light text-ivory/60 leading-relaxed text-left line-clamp-3">{item.content}</p>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-4 flex items-center justify-end gap-2 border-t border-gold/10 pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 border border-gold/10 hover:border-gold hover:bg-gold/10 rounded-lg text-ivory/60 hover:text-gold transition-all"
                  title="Modifier l'article"
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 border border-gold/10 hover:border-red-400 hover:bg-red-400/10 rounded-lg text-ivory/60 hover:text-red-400 transition-all"
                  title="Supprimer l'article"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </motion.article>
          ))
        )}
      </motion.div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-walnut border border-gold/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <header className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-ivory">
                {editingNews ? "Modifier l'actualité" : 'Publier une actualité'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-ivory/50 hover:text-ivory rounded-md transition-colors hover:bg-white/5">
                <X className="size-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ivory/60 font-semibold">Titre de l&apos;actualité</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exposition Artisanale de Tunis 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/20 border border-gold/10 focus:border-gold/50 rounded-lg p-3 text-sm text-ivory outline-none shadow-inner transition-colors"
                />
              </div>

              <div className="bg-black/10 p-4 rounded-xl border border-gold/5">
                <ImageUploader
                  label="Image d'illustration"
                  imageUrl={imageUrl}
                  onUploaded={(url) => setImageUrl(url)}
                  onRemove={() => setImageUrl('')}
                  uploading={uploading}
                  setUploading={setUploading}
                  uploadFn={adminApi.uploadImage}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ivory/60 font-semibold">Contenu de l&apos;article</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Écrivez votre article ici..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-black/20 border border-gold/10 focus:border-gold/50 rounded-lg p-3 text-sm text-ivory outline-none shadow-inner transition-colors"
                />
              </div>

              <footer className="pt-4 border-t border-gold/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-gold/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gold hover:bg-gold/90 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow-[0_0_10px_rgba(201,168,76,0.2)]"
                >
                  {editingNews ? 'Mettre à jour' : 'Publier'}
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
