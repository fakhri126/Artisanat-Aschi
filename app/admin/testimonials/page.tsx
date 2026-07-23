'use client'

import { useEffect, useState } from 'react'
import { adminApi, Testimonial } from '@/lib/api'
import { Plus, Edit2, Trash2, X, MessageSquare, Video, Star, Eye, Play } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = (hovered || value) > i
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i + 1)}
            className="transition-transform hover:scale-110"
            aria-label={`${i + 1} étoile${i > 0 ? 's' : ''}`}
          >
            <Star className={`size-6 transition-colors ${filled ? 'fill-gold text-gold' : 'fill-transparent text-gold/30 hover:text-gold/60'}`} />
          </button>
        )
      })}
      <span className="ml-2 text-xs text-ivory/50">{value}/5</span>
    </div>
  )
}

function TestimonialPreview({ name, role, content, imageUrl, rating }: { name: string; role: string; content: string; imageUrl: string; rating: number }) {
  return (
    <div className="rounded-xl bg-[#1a1109] border border-gold/20 p-5 space-y-4">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-semibold text-center">Aperçu public</p>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold/50 via-gold/10 to-transparent" />
          <div className="relative size-16 overflow-hidden rounded-full border border-gold/30 bg-stone-900">
            {imageUrl
              ? <img src={imageUrl} alt={name} className="size-full object-cover" />
              : <div className="size-full bg-stone-800 flex items-center justify-center text-ivory/20 text-2xl font-heading">{name?.[0] || '?'}</div>
            }
          </div>
        </div>
        <div>
          <div className="flex justify-center mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`size-3 ${i < rating ? 'fill-gold text-gold' : 'fill-transparent text-gold/20'}`} />
            ))}
          </div>
          <p className="font-heading text-sm font-medium text-ivory">{name || 'Nom du client'}</p>
          <p className="text-[10px] text-gold/70 uppercase tracking-wider">{role || 'Rôle / Localité'}</p>
        </div>
      </div>
      <div className="relative border-t border-gold/10 pt-3">
        <span className="absolute -top-4 left-1 font-heading text-4xl text-gold/10 leading-none">"</span>
        <p className="text-xs font-light italic text-ivory/70 leading-relaxed line-clamp-4">
          {content ? `"${content}"` : 'Le contenu du témoignage apparaîtra ici...'}
        </p>
      </div>
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'reel'>('testimonials')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  // Form fields
  const [clientName, setClientName] = useState('')
  const [clientRole, setClientRole] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'TEXT' | 'VIDEO'>('TEXT')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [rating, setRating] = useState(5)
  const [uploading, setUploading] = useState(false)

  // Reel State
  const [reelData, setReelData] = useState<{videoUrl: string; reviews: any[]}>({ videoUrl: '', reviews: [] })
  const [savingReel, setSavingReel] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  useEffect(() => {
    loadTestimonials()
    loadReelData()
  }, [])

  const loadReelData = async () => {
    try {
      const res = await fetch('/api/reel')
      const data = await res.json()
      setReelData(data)
    } catch (err) {
      console.error("Failed to load reel data", err)
    }
  }

  const saveReelData = async (newData: any) => {
    try {
      setSavingReel(true)
      const res = await fetch('/api/reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })
      if (res.ok) {
        setReelData(newData)
        alert('Configuration de la vidéo sauvegardée avec succès !')
      }
    } catch (err) {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSavingReel(false)
    }
  }

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
    setRating(5)
    setShowPreview(true)
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
    setRating(5)
    setShowPreview(true)
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gold/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-widest mb-2 font-semibold">
            <Star className="size-3.5 fill-gold" /> Témoignages & Avis
          </div>
          <h1 className="font-heading text-3xl font-light text-foreground text-left">Gestion de la Réputation</h1>
          <p className="mt-1 text-sm text-muted-foreground text-left">
            Gérez les témoignages de vos clients et la vidéo de présentation des réseaux sociaux.
          </p>
        </div>
        {activeTab === 'testimonials' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold/95 px-5 py-3 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow self-start md:self-auto"
          >
            <Plus className="size-4" /> Nouveau Témoignage
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'testimonials' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Témoignages (Site)
        </button>
        <button
          onClick={() => setActiveTab('reel')}
          className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'reel' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Video className="size-4" /> Reel Vidéo (Réseaux)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {activeTab === 'testimonials' && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: testimonials.length },
          { label: 'Écrits', value: testimonials.filter(t => t.type === 'TEXT').length },
          { label: 'Vidéos', value: testimonials.filter(t => t.type === 'VIDEO').length },
        ].map(stat => (
          <div key={stat.label} className="bg-walnut border border-gold/10 rounded-xl p-4 text-center">
            <p className="font-heading text-3xl font-light text-gold">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-ivory/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Testimonial Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-background border border-border rounded-2xl text-muted-foreground">
            <Star className="size-10 text-gold/20 mx-auto mb-3" />
            <p>Aucun témoignage disponible. Ajoutez le premier !</p>
          </div>
        ) : (
          testimonials.map((t) => (
            <article
              key={t.id}
              className="group bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:border-gold/30 transition-all flex flex-col"
            >
              {/* Top bar with type badge */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  t.type === 'VIDEO'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {t.type === 'VIDEO' ? <Video className="size-2.5" /> : <MessageSquare className="size-2.5" />}
                  {t.type === 'VIDEO' ? 'Vidéo' : 'Écrit'}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3 fill-gold text-gold" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 rounded-full overflow-hidden border-2 border-gold/20 bg-stone-900 shrink-0">
                    <img
                      src={t.imageUrl || '/client-placeholder.png'}
                      alt={t.clientName}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.clientRole}</p>
                  </div>
                </div>

                <p className="text-sm font-light text-muted-foreground leading-relaxed text-left italic line-clamp-3">
                  &ldquo;{t.content}&rdquo;
                </p>

                {t.type === 'VIDEO' && t.videoUrl && (
                  <p className="text-[10px] text-amber-500/70 underline truncate font-mono">{t.videoUrl}</p>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <header className="p-5 border-b border-border flex items-center justify-between bg-secondary/20">
              <h2 className="font-heading text-xl font-medium text-foreground">
                {editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage client'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    showPreview ? 'bg-gold/10 border-gold/30 text-gold' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="size-3.5" /> Aperçu
                </button>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50">
                  <X className="size-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className={`grid ${showPreview ? 'md:grid-cols-[1fr_auto]' : ''}`}>
                {/* Form */}
                <form id="testimonial-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom du Client *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sonia Ben Miled"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Qualité / Localité</label>
                      <input
                        type="text"
                        placeholder="Ex: Propriétaire de Villa · La Marsa"
                        value={clientRole}
                        onChange={(e) => setClientRole(e.target.value)}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                      />
                    </div>
                  </div>

                  {/* Rating Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Note accordée</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  {/* Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Format du témoignage</label>
                    <div className="flex gap-3">
                      {(['TEXT', 'VIDEO'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                            type === t
                              ? 'bg-gold/10 border-gold/40 text-gold'
                              : 'border-border text-muted-foreground hover:border-gold/20'
                          }`}
                        >
                          {t === 'VIDEO' ? <Video className="size-3.5" /> : <MessageSquare className="size-3.5" />}
                          {t === 'VIDEO' ? 'Vidéo' : 'Écrit'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Upload */}
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold">URL de la vidéo *</label>
                      <input
                        type="url"
                        required={type === 'VIDEO'}
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Contenu du témoignage *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Texte du témoignage laissé par le client..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none resize-none"
                    />
                  </div>
                </form>

                {/* Live Preview Panel */}
                {showPreview && (
                  <div className="hidden md:block w-64 border-l border-border p-5 bg-stone-950">
                    <TestimonialPreview
                      name={clientName}
                      role={clientRole}
                      content={content}
                      imageUrl={imageUrl}
                      rating={rating}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="p-5 border-t border-border flex items-center justify-end gap-3 bg-secondary/10">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="testimonial-form"
                className="rounded-full bg-gold hover:bg-gold/95 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow"
              >
                {editingTestimonial ? 'Enregistrer les modifications' : 'Publier le témoignage'}
              </button>
            </footer>
          </div>
        </div>
      )}
      </>
      )}

      {activeTab === 'reel' && (
        <div className="space-y-6">
          <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-xl text-foreground mb-4">Paramètres de la vidéo globale</h2>
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Fichier Vidéo Actuel</label>
                
                {/* Video Preview / Upload area */}
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-3 bg-secondary/10 relative overflow-hidden group">
                  {uploadingVideo && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent mb-2"></div>
                      <span className="text-xs text-gold font-semibold uppercase tracking-wider">Upload en cours...</span>
                    </div>
                  )}
                  
                  {reelData.videoUrl ? (
                    <div className="w-full relative rounded-lg overflow-hidden border border-border bg-black aspect-video flex items-center justify-center group-hover:border-gold transition-colors">
                      <video src={reelData.videoUrl} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="size-8 text-white/50 group-hover:text-gold transition-colors" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white/80 p-1.5 rounded truncate">
                        {reelData.videoUrl.split('/').pop()}
                      </div>
                    </div>
                  ) : (
                    <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
                      <Video className="size-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex gap-2 w-full mt-2">
                    <label className="flex-1 rounded-lg border border-border hover:border-gold bg-background hover:bg-secondary/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground transition-all cursor-pointer text-center flex items-center justify-center gap-2">
                      <Plus className="size-4" /> {reelData.videoUrl ? 'Remplacer la vidéo' : 'Importer une vidéo'}
                      <input 
                        type="file" 
                        accept="video/mp4,video/webm,video/quicktime" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            setUploadingVideo(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            const res = await fetch('/api/upload-video', {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (!res.ok) throw new Error('Upload failed');
                            const data = await res.json();
                            
                            const newData = { ...reelData, videoUrl: data.url };
                            setReelData(newData);
                            // Auto-save the reel config after successful upload
                            saveReelData(newData);
                          } catch (err) {
                            alert('Erreur lors du téléchargement de la vidéo.');
                            console.error(err);
                          } finally {
                            setUploadingVideo(false);
                            // Reset input
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">Formats acceptés : MP4, WEBM, MOV.</p>
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl text-foreground">Avis flottants (Pop-ups)</h2>
              <button
                onClick={() => {
                  const newReview = {
                    id: Date.now(),
                    platform: 'google',
                    name: 'Nouveau client',
                    avatar: 'N',
                    rating: 5,
                    text: 'Excellent travail...',
                    time: 5,
                    duration: 4,
                    position: 'left'
                  }
                  setReelData({ ...reelData, reviews: [...reelData.reviews, newReview] })
                }}
                className="flex items-center gap-1.5 rounded-full border border-border hover:border-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors"
              >
                <Plus className="size-3" /> Ajouter un avis
              </button>
            </div>

            <div className="space-y-4">
              {reelData.reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun avis configuré sur la vidéo.</p>
              ) : (
                reelData.reviews.sort((a, b) => a.time - b.time).map((review, index) => (
                  <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-border bg-secondary/20 rounded-xl relative group">
                    <button
                      onClick={() => {
                        const newReviews = reelData.reviews.filter(r => r.id !== review.id)
                        setReelData({ ...reelData, reviews: newReviews })
                      }}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Plateforme</label>
                      <select
                        value={review.platform}
                        onChange={(e) => {
                          const newReviews = [...reelData.reviews]
                          newReviews[index].platform = e.target.value
                          setReelData({ ...reelData, reviews: newReviews })
                        }}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-md p-2 text-xs text-foreground outline-none"
                      >
                        <option value="google">Google</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Nom affiché</label>
                      <input
                        type="text"
                        value={review.name}
                        onChange={(e) => {
                          const newReviews = [...reelData.reviews]
                          newReviews[index].name = e.target.value
                          setReelData({ ...reelData, reviews: newReviews })
                        }}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-md p-2 text-xs text-foreground outline-none"
                      />
                    </div>

                    <div className="col-span-4 space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Texte</label>
                      <textarea
                        value={review.text}
                        rows={2}
                        onChange={(e) => {
                          const newReviews = [...reelData.reviews]
                          newReviews[index].text = e.target.value
                          setReelData({ ...reelData, reviews: newReviews })
                        }}
                        className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-md p-2 text-xs text-foreground outline-none resize-none"
                      />
                    </div>

                    <div className="col-span-3 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Apparaît à</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={review.time}
                            onChange={(e) => {
                              const newReviews = [...reelData.reviews]
                              newReviews[index].time = Number(e.target.value)
                              setReelData({ ...reelData, reviews: newReviews })
                            }}
                            className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-md p-2 text-xs text-foreground outline-none"
                          />
                          <span className="text-xs text-muted-foreground">sec</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Position</label>
                        <select
                          value={review.position}
                          onChange={(e) => {
                            const newReviews = [...reelData.reviews]
                            newReviews[index].position = e.target.value as 'left' | 'right'
                            setReelData({ ...reelData, reviews: newReviews })
                          }}
                          className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-md p-2 text-xs text-foreground outline-none"
                        >
                          <option value="left">Gauche</option>
                          <option value="right">Droite</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {reelData.reviews.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => saveReelData(reelData)}
                  disabled={savingReel}
                  className="rounded-full bg-gold hover:bg-gold/95 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-walnut transition-all shadow"
                >
                  {savingReel ? 'Sauvegarde...' : 'Sauvegarder les avis'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
