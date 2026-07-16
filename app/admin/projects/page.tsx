'use client'

import { useEffect, useState } from 'react'
import { adminApi, Project } from '@/lib/api'
import { Plus, Edit2, Trash2, X, MapPin, Folder, Image as ImageIcon } from 'lucide-react'
import { ImageUploader } from '@/components/site/image-uploader'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Villas')
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProjects()
      setProjects(data)
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des réalisations.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingProject(null)
    setTitle('')
    setDescription('')
    setCategory('Villas')
    setLocation('')
    setDetails('')
    setImageUrl('')
    setModalOpen(true)
  }

  const openEditModal = (proj: Project) => {
    setEditingProject(proj)
    setTitle(proj.title)
    setDescription(proj.description || '')
    setCategory(proj.category)
    setLocation(proj.location || '')
    setDetails(proj.details || '')
    setImageUrl(proj.imageUrl || '')
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette réalisation ?')) return
    try {
      await adminApi.deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur de suppression.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title,
      description,
      category,
      location,
      details,
      imageUrl: imageUrl || '/placeholder.png'
    }

    try {
      if (editingProject) {
        await adminApi.updateProject(editingProject.id, payload)
      } else {
        await adminApi.createProject(payload)
      }
      setModalOpen(false)
      loadProjects()
    } catch (err: any) {
      alert(err.message || "Erreur d'enregistrement.")
    }
  }

  if (loading && projects.length === 0) {
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
          <h1 className="font-heading text-3xl font-light text-foreground text-left">Gestion des Réalisations</h1>
          <p className="mt-1 text-sm text-muted-foreground text-left">Gérez l&apos;affichage de vos aménagements prestigieux (Villas, Hôtels, Maisons d&apos;hôtes...).</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-gold hover:bg-gold/95 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all shadow"
        >
          <Plus className="size-4" /> Nouvelle Réalisation
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      {/* Projects List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-background border border-border rounded-2xl text-muted-foreground">
            Aucune réalisation publiée pour le moment.
          </div>
        ) : (
          projects.map((proj) => (
            <article key={proj.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-56 bg-secondary overflow-hidden relative border-b border-border">
                  {proj.imageUrl ? (
                    <img src={proj.imageUrl} alt={proj.title} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground"><ImageIcon className="size-10" /></div>
                  )}
                  <span className="absolute top-4 left-4 bg-walnut text-gold text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-gold/20">
                    <Folder className="size-3" /> {proj.category}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1 text-xs text-gold font-medium">
                    <MapPin className="size-3.5" /> {proj.location || 'Tunisie'}
                  </div>
                  <h3 className="font-heading text-2xl font-light text-foreground text-left">{proj.title}</h3>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed text-left line-clamp-3">{proj.description}</p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-border mt-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => openEditModal(proj)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-border hover:border-gold rounded-full text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors"
                >
                  <Edit2 className="size-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
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
          <div className="bg-background border border-border w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <header className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-foreground">
                {editingProject ? 'Modifier la réalisation' : 'Créer une réalisation'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Titre du Projet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Villa Didon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  >
                    <option value="Villas">Villas</option>
                    <option value="Hôtels">Hôtels</option>
                    <option value="Maisons d'hôtes">Maisons d&apos;hôtes</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Entreprises">Entreprises</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Localisation</label>
                  <input
                    type="text"
                    placeholder="Ex: Carthage, Hammamet, Djerba"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <ImageUploader
                label="Image principale de la réalisation"
                imageUrl={imageUrl}
                onUploaded={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                uploading={uploading}
                setUploading={setUploading}
                uploadFn={adminApi.uploadImage}
              />

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description courte</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Bref résumé de la réalisation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Détails du projet (Spécifications techniques, matériaux...)</label>
                <textarea
                  rows={4}
                  placeholder="Ex: Mobilier en noyer massif, portes cloutées traditionnelles..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
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
