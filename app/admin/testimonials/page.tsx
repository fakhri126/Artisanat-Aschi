'use client'

import { useEffect, useState } from 'react'
import { adminApi, Testimonial } from '@/lib/api'
import { Plus, Edit2, Trash2, X, MessageSquare, Video, Quote } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  // Form fields
  const [clientName, setClientName] = useState('')
  const [clientRole, setClientRole] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'TEXT' | 'VIDEO'>('TEXT')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getTestimonials()
      setTestimonials(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des témoignages.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTestimonial(null)
    setClientName('')
    setClientRole('')
    setContent('')
    setType('TEXT')
    setVideoUrl('')
    setImageUrl('')
    setModalOpen(true)
  }

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t)
    setClientName(t.clientName)
    setClientRole(t.clientRole || '')
    setContent(t.content)
    setType(t.type)
    setVideoUrl(t.videoUrl || '')
    setImageUrl(t.imageUrl || '')
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce témoignage ?')) return
    try {
      await adminApi.deleteTestimonial(id)
      setTestimonials(testimonials.filter(t => t.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur de suppression.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      clientName,
      clientRole,
      content,
      type,
      videoUrl: type === 'VIDEO' ? videoUrl : null,
      imageUrl: imageUrl || '/client-placeholder.png'
    }

    try {
      if (editingTestimonial) {
        await adminApi.updateTestimonial(editingTestimonial.id, payload)
      } else {
        await adminApi.createTestimonial(payload)
      }
      setModalOpen(false)
      loadTestimonials()
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.")
    }
  }

  if (loading && testimonials.length === 0) {
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
          <h1 className="font-heading text-3xl font-light text-foreground text-left">Témoignages Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground text-left">Gérez les retours d&apos;expérience de vos clients prestigieux (Villas, Hôtels, Restaurants).</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-gold hover:bg-gold/95 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow"
        >
          <Plus className="size-4" /> Nouveau Témoignage
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {/* Grid of testimonials */}
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-background border border-border rounded-2xl text-muted-foreground">
            Aucun témoignage disponible.
          </div>
        ) : (
          testimonials.map((t) => (
            <article key={t.id} className="bg-background border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <Quote className="absolute right-6 top-6 size-12 text-secondary-foreground/5 rotate-180" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden border border-border bg-secondary shrink-0">
                    <img src={t.imageUrl || '/client-placeholder.png'} alt={t.clientName} className="size-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.clientRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    t.type === 'VIDEO' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {t.type === 'VIDEO' ? <Video className="size-2.5" /> : <MessageSquare className="size-2.5" />}
                    {t.type === 'VIDEO' ? 'Vidéo' : 'Texte'}
                  </span>
                  {t.type === 'VIDEO' && t.videoUrl && (
                    <span className="text-[10px] text-muted-foreground underline truncate max-w-xs">{t.videoUrl}</span>
                  )}
                </div>

                <p className="text-sm font-light text-muted-foreground leading-relaxed text-left italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border mt-6 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => openEditModal(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-gold rounded-full text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors"
                >
                  <Edit2 className="size-3" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-red-500 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3" /> Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <header className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-foreground">
                {editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage client'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom du Client</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sonia Ben Miled"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Qualité / Rôle</label>
                  <input
                    type="text"
                    placeholder="Ex: Propriétaire de Villa, Sidi Bou Saïd"
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Format du témoignage</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  >
                    <option value="TEXT">Témoignage écrit</option>
                    <option value="VIDEO">Témoignage vidéo</option>
                  </select>
                </div>
              </div>

              {/* Photo de profil via upload */}
              <ImageUploader
                label="Photo de profil du client"
                imageUrl={imageUrl}
                onUploaded={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadImage}
              />

              {type === 'VIDEO' && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">URL de la vidéo (YouTube, Vimeo, etc.)</label>
                  <input
                    type="text"
                    required={type === 'VIDEO'}
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Commentaire / Contenu du témoignage</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Texte du témoignage laissé par le client..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>

              <footer className="pt-4 border-t border-border flex items-center justify-end gap-3 bg-secondary/10">
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
          </div>
        </div>
      )}
    </div>
  )
}
