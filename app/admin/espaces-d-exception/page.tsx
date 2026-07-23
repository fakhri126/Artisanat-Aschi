'use client'

import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Upload, 
  X, 
  Check, 
  RefreshCw,
  MapPin,
  Star,
  Video
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Project } from '@/lib/api'

export default function AdminEspacesDExceptionPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'hotel',
    location: '',
    details: 'Portes monumentales, Boiseries d\'art',
    imageUrl: '/project-hotel.png'
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Error loading projects:', err)
      // Fallback mock projects
      setProjects([
        {
          id: 1,
          title: 'Hôtel Dar El Jeld',
          description: 'Aménagement monumental complet de l\'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques.',
          category: 'hotel',
          location: 'Médina de Tunis',
          details: 'Portes monumentales, Boiseries d\'art, Salons de réception',
          imageUrl: '/project-hotel.png'
        },
        {
          id: 2,
          title: 'Maison d\'Hôtes Dar Said',
          description: 'Conception sur-mesure d\'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés et cadres dorés.',
          category: 'guesthouse',
          location: 'Sidi Bou Saïd',
          details: 'Mobilier de chambre, Miroirs sculptés, Consoles',
          imageUrl: '/project-guesthouse.png'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        title: project.title,
        description: project.description || '',
        category: project.category || 'hotel',
        location: project.location || '',
        details: project.details || '',
        imageUrl: project.imageUrl || '/project-hotel.png'
      })
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        description: '',
        category: 'hotel',
        location: '',
        details: 'Portes monumentales, Boiseries d\'art',
        imageUrl: '/project-hotel.png'
      })
    }
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      setUploading(true)
      const res = await adminApi.uploadImage(file)
      setFormData(prev => ({
        ...prev,
        imageUrl: res.url
      }))
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Erreur d\'envoi de l\'image.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await adminApi.updateProject(editingProject.id, formData)
      } else {
        await adminApi.createProject(formData)
      }
      setIsModalOpen(false)
      loadProjects()
    } catch (err: any) {
      console.error('Error saving project:', err)
      alert(err.message || 'Erreur lors de l\'enregistrement.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce projet d\'aménagement ?')) return
    try {
      await adminApi.deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err: any) {
      console.error('Error deleting project:', err)
      alert('Erreur de suppression.')
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.location?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-ivory">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs uppercase tracking-widest mb-2 font-semibold">
            <Briefcase className="size-3.5" /> Aménagements de Prestige
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white font-medium">Espaces d&apos;Exception</h1>
          <p className="text-sm text-ivory/60 mt-1 font-light">Gérez les projets clés en main pour Hôtels, Maisons d&apos;Hôtes, Restaurants et Entreprises.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-gold text-walnut px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md self-start md:self-auto"
        >
          <Plus className="size-4" /> Nouveau Projet
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-walnut p-4 rounded-xl border border-gold/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory/40" />
          <input
            type="text"
            placeholder="Rechercher par titre ou lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-ivory/30 outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'hotel', label: 'Hôtels' },
            { id: 'guesthouse', label: 'Maisons d\'Hôtes' },
            { id: 'restaurant', label: 'Restaurants' },
            { id: 'entreprise', label: 'Entreprises' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                categoryFilter === cat.id 
                  ? 'bg-gold text-walnut' 
                  : 'bg-stone-900 text-ivory/60 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="py-20 text-center text-ivory/50 flex justify-center">
          <RefreshCw className="size-6 animate-spin text-gold" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-ivory/40 bg-stone-900/40 rounded-xl border border-white/5">
          Aucun projet trouvé. Cliquez sur &quot;Nouveau Projet&quot; pour en ajouter un.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-walnut rounded-2xl border border-gold/10 overflow-hidden hover:border-gold/30 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full bg-stone-900 border-b border-gold/10">
                <Image
                  src={project.imageUrl || '/project-hotel.png'}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/20">
                  {project.category}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-gold/80 font-semibold">
                  <MapPin className="size-3.5" /> {project.location || 'Tunis'}
                </div>

                <h3 className="font-heading text-2xl text-white font-medium">{project.title}</h3>
                
                <p className="text-xs text-ivory/70 font-light leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {project.details && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.details.split(',').map((tag, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-[9px] text-ivory/60">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 py-3.5 bg-stone-950/60 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gold hover:bg-gold hover:text-walnut text-xs font-semibold transition-colors"
                >
                  <Edit className="size-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-gold/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-2xl text-white">
                {editingProject ? 'Modifier le Projet' : 'Nouveau Projet d\'Exception'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Titre du Projet *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Hôtel Dar El Jeld"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Type d&apos;Établissement *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  >
                    <option value="hotel">Hôtel de luxe</option>
                    <option value="guesthouse">Maison d&apos;Hôtes</option>
                    <option value="restaurant">Restaurant / Bar</option>
                    <option value="entreprise">Siège d&apos;Entreprise</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Localisation *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Médina de Tunis"
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Détails &amp; Tags (Séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Portes monumentales, Boiseries d'art, Salons"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-gold transition-colors text-white text-xs"
                />
              </div>

              {/* Photo Upload / URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Photo de couverture *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/project-hotel.png ou URL"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-gold text-white"
                  />
                  <label className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-gold hover:text-walnut px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="size-3.5" />
                    {uploading ? '...' : 'Fichier'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Description du Projet</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'intervention de l'atelier, l'ébénisterie et la sculpture..."
                  className="resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-gold text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold text-walnut py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform mt-4 shadow-lg"
              >
                {editingProject ? 'Enregistrer les modifications' : 'Créer le projet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
