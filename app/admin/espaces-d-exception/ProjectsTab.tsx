'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  RefreshCw,
  MapPin,
  Video,
  Play,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Project } from '@/lib/api'
import QuickGalleryModal from './QuickGalleryModal'
import ProjectModal from './ProjectModal'

function normalizeCategory(cat?: string): string {
  if (!cat) return 'autre'
  const c = cat.toLowerCase()
  if (c.includes('hotel') || c.includes('palace') || c.includes('hôtel')) return 'hotel'
  if (c.includes('guest') || c.includes('hôte') || c.includes('riad') || c.includes('lodge')) return 'guesthouse'
  if (c.includes('villa') || c.includes('demeure') || c.includes('résidence privée') || c.includes('residence privee')) return 'villa'
  if (c.includes('immo') || c.includes('promoteur') || c.includes('résidence') || c.includes('batiment')) return 'immobilier'
  if (c.includes('pro') || c.includes('bureau') || c.includes('commercial') || c.includes('restaurant') || c.includes('lounge') || c.includes('showroom')) return 'pro_commercial'
  return c
}

const CATEGORIES = [
  { id: 'ALL', label: 'Tous' },
  { id: 'immobilier', label: 'Projets Immobiliers' },
  { id: 'hotel', label: 'Hôtels & Palaces' },
  { id: 'guesthouse', label: 'Maisons d\'Hôtes' },
  { id: 'villa', label: 'Villas & Résidences' },
  { id: 'pro_commercial', label: 'Espaces Pro & Commerciaux' }
]

const CATEGORY_LABELS: Record<string, string> = {
  immobilier: 'Projets Immobiliers',
  hotel: 'Hôtels & Palaces',
  guesthouse: "Maisons d'Hôtes",
  villa: 'Villas & Résidences Privées',
  pro_commercial: 'Espaces Pro & Commerciaux',
  restaurant: 'Restaurants',
  entreprise: 'Entreprises'
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)

  // Modals state
  const [activeGalleryProject, setActiveGalleryProject] = useState<Project | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Erreur chargement projets:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const getProjectPhotos = (proj: Project): string[] => {
    let imgs: string[] = []
    if (Array.isArray(proj.gallery) && proj.gallery.length > 0) {
      imgs = proj.gallery
    } else if (typeof proj.gallery === 'string' && (proj.gallery as string).trim()) {
      imgs = (proj.gallery as string).split(',').map(s => s.trim()).filter(Boolean)
    } else if (Array.isArray(proj.images) && proj.images.length > 0) {
      imgs = proj.images.map((im: any) => typeof im === 'string' ? im : (im.imageUrl || '')).filter(Boolean)
    } else if (proj.imageUrl) {
      imgs = proj.imageUrl.split(',').map(s => s.trim()).filter(Boolean)
    }

    try {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`project_gallery_${proj.id}`)
        if (local) {
          const parsed = JSON.parse(local)
          if (Array.isArray(parsed) && parsed.length > 0) {
            imgs = Array.from(new Set([...imgs, ...parsed]))
          }
        }
      }
    } catch (_) {}

    return imgs
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce projet d\'aménagement ?')) return
    try {
      await adminApi.deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Erreur lors de la suppression.')
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const s = search.toLowerCase()
      const matchesSearch = p.title.toLowerCase().includes(s) || (p.location && p.location.toLowerCase().includes(s))
      const norm = normalizeCategory(p.category)
      const matchesCat = categoryFilter === 'ALL' || p.category?.toLowerCase() === categoryFilter.toLowerCase() || norm === categoryFilter
      return matchesSearch && matchesCat
    })
  }, [projects, search, categoryFilter])

  return (
    <div className="space-y-6">
      {/* ─── Barre de Recherche, Filtres & Bouton Nouveau ─── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par titre ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#C8960C] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] uppercase tracking-wider font-semibold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.id 
                  ? 'bg-[#0F172A] text-white shadow-xs' 
                  : 'bg-[#FAF8F5] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1ECE4] border border-[#E2DBD0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
          
          <button
            onClick={() => {
              setEditingProject(null)
              setIsEditorOpen(true)
            }}
            className="inline-flex items-center gap-1.5 bg-[#C17D59] hover:bg-[#A96846] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer shrink-0 ml-2"
          >
            <Plus className="size-4" /> Nouveau Projet
          </button>
        </div>
      </div>

      {/* ─── Grille des Projets ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
          <p className="text-xs text-[#64748B]">Chargement des projets...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-3">
          <Briefcase className="size-10 text-[#94A3B8]" />
          <p className="text-sm font-medium">Aucun projet trouvé.</p>
          <button
            onClick={() => { setEditingProject(null); setIsEditorOpen(true) }}
            className="text-xs text-[#C17D59] font-bold hover:underline"
          >
            + Créer un premier projet d&apos;exception
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const displayCat = CATEGORY_LABELS[project.category] || project.category
            const projectPhotos = getProjectPhotos(project)
            const coverPhoto = projectPhotos[0] || (project.imageUrl ? project.imageUrl.split(',')[0].trim() : '') || '/project-hotel.png'
            const video = project.videoUrl || (project as any).video

            return (
              <div 
                key={project.id}
                className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs hover:shadow-lg hover:border-[#C8960C]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Media Header */}
                <div className="relative aspect-[16/9] w-full bg-[#EFECE6] border-b border-[#E8DFD4] overflow-hidden">
                  <Image src={coverPhoto} alt={project.title} fill className="object-cover" />
                  
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C17D59] border border-[#E8DFD4] shadow-xs">
                    {displayCat}
                  </div>

                  {video && (
                    <button
                      type="button"
                      onClick={() => setPreviewVideoUrl(video)}
                      className="absolute bottom-3 right-3 bg-[#0F172A]/90 hover:bg-[#0F172A] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Play className="size-3 fill-current" /> Vidéo
                    </button>
                  )}

                  <span className="absolute bottom-3 left-3 bg-white/90 text-[#0F172A] text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#E8DFD4] backdrop-blur-md shadow-xs">
                    <ImageIcon className="size-3 text-[#C8960C]" />
                    <span>{projectPhotos.length} photo{projectPhotos.length > 1 ? 's' : ''}</span>
                  </span>
                </div>

                {/* Thumbnails Ribbon */}
                {projectPhotos.length > 1 && (
                  <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#E8DFD4] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {projectPhotos.slice(0, 5).map((img, i) => (
                      <div key={i} className="relative size-8 rounded-md overflow-hidden border border-[#E2DBD0] shrink-0">
                        <Image src={img.split(',')[0].trim()} alt="Miniature" fill className="object-cover" />
                      </div>
                    ))}
                    {projectPhotos.length > 5 && (
                      <span className="text-[9px] text-[#C17D59] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E6] border border-[#E8DFD4]">
                        +{projectPhotos.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#C17D59] font-semibold">
                      <MapPin className="size-3.5" /> {project.location || 'Tunis'}
                    </div>
                    {video && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Video className="size-2.5" /> Vidéo incluse
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-xl text-[#0F172A] font-bold">{project.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">{project.description}</p>
                  
                  {project.details && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.details.split(',').map((tag, idx) => (
                        <span key={idx} className="bg-[#FAF8F5] border border-[#E8DFD4] px-2.5 py-0.5 rounded text-[10px] text-[#475569] font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E8DFD4] flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveGalleryProject(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="size-3.5 stroke-[2.5]" />
                    <ImageIcon className="size-3.5" />
                    <span>+ Photos ({projectPhotos.length})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProject(project)
                        setIsEditorOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2DBD0] text-[#0F172A] hover:bg-[#FAF8F5] hover:border-[#C8960C] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit className="size-3.5" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Video Fullscreen Modal ─── */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-10 size-9 rounded-full bg-black/70 border border-white/20 text-white hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <video src={previewVideoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick Gallery Modal ─── */}
      {activeGalleryProject && (
        <QuickGalleryModal
          project={activeGalleryProject}
          initialPhotos={getProjectPhotos(activeGalleryProject)}
          onClose={() => setActiveGalleryProject(null)}
          onPhotosUpdated={(projectId, newPhotos) => {
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, gallery: newPhotos, imageUrl: newPhotos[0] } : p))
            setActiveGalleryProject(prev => prev ? { ...prev, gallery: newPhotos, imageUrl: newPhotos[0] } : null)
          }}
        />
      )}

      {/* ─── Project Creation / Edit Modal ─── */}
      {isEditorOpen && (
        <ProjectModal
          project={editingProject}
          initialPhotos={editingProject ? getProjectPhotos(editingProject) : []}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingProject(null)
          }}
          onSaved={loadProjects}
        />
      )}
    </div>
  )
}
