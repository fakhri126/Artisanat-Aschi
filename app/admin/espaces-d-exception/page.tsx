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
  Video,
  Play,
  Film,
  InboxIcon,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wrench,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Project, QuoteRequest } from '@/lib/api'
import { MultiImageUploader } from '@/components/site/image-uploader'

// Tab types
type Tab = 'projets' | 'demandes'

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

export default function AdminEspacesDExceptionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('projets')

  // --- Projects state ---
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)

  // Dedicated Quick Gallery Modal states (pour ajouter plusieurs photos à un projet clé en main)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [activeProjectForGallery, setActiveProjectForGallery] = useState<Project | null>(null)
  const [projectGalleryList, setProjectGalleryList] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // --- Demandes state ---
  const [demandes, setDemandes] = useState<QuoteRequest[]>([])
  const [loadingDemandes, setLoadingDemandes] = useState(true)
  const [expandedDemande, setExpandedDemande] = useState<number | null>(null)

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'hotel',
    location: '',
    details: 'Portes monumentales, Boiseries d\'art',
    imageUrl: '/project-hotel.png',
    videoUrl: '',
    gallery: []
  })

  useEffect(() => {
    loadProjects()
    loadDemandes()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Error loading projects:', err)
      setProjects([
        {
          id: 1,
          title: 'Hôtel Dar El Jeld',
          description: 'Aménagement monumental complet de l\'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques.',
          category: 'hotel',
          location: 'Médina de Tunis',
          details: 'Portes monumentales, Boiseries d\'art, Salons de réception',
          imageUrl: '/project-hotel.png',
          videoUrl: '/Video.mp4',
          gallery: ['/project-hotel.png', '/gallery-1.png', '/gallery-2.png']
        },
        {
          id: 2,
          title: 'Maison d\'Hôtes Dar Said',
          description: 'Conception sur-mesure d\'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés et cadres dorés.',
          category: 'guesthouse',
          location: 'Sidi Bou Saïd',
          details: 'Mobilier de chambre, Miroirs sculptés, Consoles',
          imageUrl: '/project-guesthouse.png',
          videoUrl: '/test-video.mp4',
          gallery: ['/project-guesthouse.png', '/gallery-3.png', '/gallery-4.png']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadDemandes = async () => {
    try {
      setLoadingDemandes(true)
      const all = await adminApi.getQuotes()
      // Filter only those from Espaces d'Exception form
      const filtered = all.filter((q: QuoteRequest) =>
        q.personalizationDetails?.includes('[ESPACE_EXCEPTION]')
      )
      setDemandes(filtered)
    } catch (err) {
      console.error('Error loading demandes:', err)
      setDemandes([])
    } finally {
      setLoadingDemandes(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateQuoteStatus(id, status)
      await loadDemandes()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDeleteDemande = async (id: number) => {
    if (!confirm('Supprimer cette demande ?')) return
    try {
      await adminApi.deleteQuoteRequest(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      console.error('Error deleting demande:', err)
    }
  }

  // Parse personalizationDetails into structured info
  const parseDetails = (details: string | null) => {
    if (!details) return {}
    const result: Record<string, string> = {}
    details.split('|').forEach(part => {
      const [key, ...val] = part.split(':')
      if (key && val.length) {
        result[key.trim()] = val.join(':').trim()
      }
    })
    return result
  }

  // Extraction propre des photos pour un projet clé en main
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

  // Ouvrir le modal rapide de gestion de la galerie photos pour un projet
  const openGalleryModal = (proj: Project) => {
    setActiveProjectForGallery(proj)
    const imgs = getProjectPhotos(proj)
    setProjectGalleryList(imgs)
    setGalleryModalOpen(true)
  }

  // Importation multiple de photos (sélection multiple à la fois)
  const handleQuickGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeProjectForGallery) return
    const files = Array.from(e.target.files)
    setUploadingGallery(true)
    setUploadProgress(`Envoi de ${files.length} photo(s)...`)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Envoi de la photo ${i + 1} sur ${files.length}...`)
        const res = await adminApi.uploadImage(files[i])
        if (res && res.url) {
          newUrls.push(res.url)
        }
      }

      if (newUrls.length > 0) {
        const updatedList = [...projectGalleryList, ...newUrls]
        setProjectGalleryList(updatedList)

        // Sauvegarde immédiate
        const primaryImg = updatedList[0] || activeProjectForGallery.imageUrl || '/project-hotel.png'
        const cleanPayload = {
          title: activeProjectForGallery.title,
          description: activeProjectForGallery.description || '',
          category: activeProjectForGallery.category || 'hotel',
          location: activeProjectForGallery.location || '',
          details: activeProjectForGallery.details || '',
          imageUrl: updatedList.length > 0 ? updatedList.join(',') : primaryImg,
          videoUrl: activeProjectForGallery.videoUrl || ''
        }

        try {
          await adminApi.updateProject(activeProjectForGallery.id, cleanPayload)
        } catch (apiErr) {
          console.warn('API update fallback:', apiErr)
        }

        try {
          localStorage.setItem(`project_gallery_${activeProjectForGallery.id}`, JSON.stringify(updatedList))
        } catch (_) {}

        setProjects(prev => prev.map(p => p.id === activeProjectForGallery.id ? { ...p, gallery: updatedList, imageUrl: updatedList[0] } : p))
        setActiveProjectForGallery(prev => prev ? { ...prev, gallery: updatedList, imageUrl: updatedList[0] } : null)
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi des photos.")
    } finally {
      setUploadingGallery(false)
      setUploadProgress('')
      e.target.value = ''
    }
  }

  // Définir une photo comme couverture principale du projet
  const handleSetAsCover = async (idx: number) => {
    if (!activeProjectForGallery) return
    const selectedUrl = projectGalleryList[idx]
    const updatedList = [selectedUrl, ...projectGalleryList.filter((_, i) => i !== idx)]
    setProjectGalleryList(updatedList)

    const cleanPayload = {
      title: activeProjectForGallery.title,
      description: activeProjectForGallery.description || '',
      category: activeProjectForGallery.category || 'hotel',
      location: activeProjectForGallery.location || '',
      details: activeProjectForGallery.details || '',
      imageUrl: updatedList.join(','),
      videoUrl: activeProjectForGallery.videoUrl || ''
    }

    try {
      await adminApi.updateProject(activeProjectForGallery.id, cleanPayload)
      try {
        localStorage.setItem(`project_gallery_${activeProjectForGallery.id}`, JSON.stringify(updatedList))
      } catch (_) {}
      setProjects(prev => prev.map(p => p.id === activeProjectForGallery.id ? { ...p, gallery: updatedList, imageUrl: updatedList[0] } : p))
    } catch (err: any) {
      alert(err.message || "Erreur lors de la mise à jour de la photo de couverture.")
    }
  }

  // Supprimer une photo de la galerie
  const handleRemovePhotoFromQuickGallery = async (idx: number) => {
    if (!activeProjectForGallery) return
    if (!confirm("Supprimer cette photo de la galerie du projet ?")) return

    const updatedList = projectGalleryList.filter((_, i) => i !== idx)
    setProjectGalleryList(updatedList)

    const primaryImg = updatedList[0] || '/project-hotel.png'
    const cleanPayload = {
      title: activeProjectForGallery.title,
      description: activeProjectForGallery.description || '',
      category: activeProjectForGallery.category || 'hotel',
      location: activeProjectForGallery.location || '',
      details: activeProjectForGallery.details || '',
      imageUrl: updatedList.length > 0 ? updatedList.join(',') : primaryImg,
      videoUrl: activeProjectForGallery.videoUrl || ''
    }

    try {
      await adminApi.updateProject(activeProjectForGallery.id, cleanPayload)
      try {
        localStorage.setItem(`project_gallery_${activeProjectForGallery.id}`, JSON.stringify(updatedList))
      } catch (_) {}
      setProjects(prev => prev.map(p => p.id === activeProjectForGallery.id ? { ...p, gallery: updatedList, imageUrl: primaryImg } : p))
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.")
    }
  }

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      const imgs = getProjectPhotos(project)
      setGalleryUrls(imgs)
      setFormData({
        title: project.title,
        description: project.description || '',
        category: project.category || 'hotel',
        location: project.location || '',
        details: project.details || '',
        imageUrl: imgs[0] || project.imageUrl || '/project-hotel.png',
        videoUrl: project.videoUrl || project.video || '',
        gallery: imgs
      })
    } else {
      setEditingProject(null)
      setGalleryUrls([])
      setFormData({
        title: '',
        description: '',
        category: 'hotel',
        location: '',
        details: 'Portes monumentales, Boiseries d\'art',
        imageUrl: '/project-hotel.png',
        videoUrl: '',
        gallery: []
      })
    }
    setIsModalOpen(true)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      setUploadingVideo(true)
      const res = await adminApi.uploadVideo(file)
      setFormData(prev => ({ ...prev, videoUrl: res.url }))
    } catch (err) {
      console.error('Error uploading video:', err)
      alert('Erreur lors du téléchargement de la vidéo.')
    } finally {
      setUploadingVideo(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim()) {
      alert("Veuillez saisir un titre pour le projet.")
      return
    }

    const primaryImg = galleryUrls[0] || formData.imageUrl || '/project-hotel.png'
    const imageUrl = galleryUrls.length > 0 ? galleryUrls.join(',') : primaryImg

    const cleanPayload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      category: formData.category || 'hotel',
      location: formData.location?.trim() || '',
      details: formData.details?.trim() || '',
      imageUrl: imageUrl,
      videoUrl: formData.videoUrl?.trim() || ''
    }

    try {
      if (editingProject) {
        await adminApi.updateProject(editingProject.id, cleanPayload)
        try {
          localStorage.setItem(`project_gallery_${editingProject.id}`, JSON.stringify(galleryUrls))
        } catch (_) {}
      } else {
        const created = await adminApi.createProject(cleanPayload)
        if (created && created.id) {
          try {
            localStorage.setItem(`project_gallery_${created.id}`, JSON.stringify(galleryUrls))
          } catch (_) {}
        }
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
    const normP = normalizeCategory(p.category)
    const matchesCat = categoryFilter === 'ALL' || 
                       p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
                       normP === categoryFilter
    return matchesSearch && matchesCat
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
    CONTACTED: 'bg-blue-100 text-blue-700 border border-blue-200',
    COMPLETED: 'bg-green-100 text-green-700 border border-green-200',
  }
  const statusLabels: Record<string, string> = {
    PENDING: '⏳ En attente',
    CONTACTED: '📞 Contacté',
    COMPLETED: '✅ Terminé',
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <Briefcase className="size-3.5" /> Projets Clés en Main &amp; Espaces d&apos;Exception
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#0F172A] font-bold">Projets clés en main</h1>
          <p className="text-sm text-[#475569] mt-1 font-normal">Gérez les réalisations de prestige clés en main et les demandes clients reçues via le site.</p>
        </div>
        {activeTab === 'projets' && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#C8960C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start md:self-auto cursor-pointer"
          >
            <Plus className="size-4" /> Nouveau Projet
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1.5 bg-[#EFECE6] border border-[#E2DBD0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('demandes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'demandes'
              ? 'bg-[#C17D59] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <InboxIcon className="size-4" />
          Demandes Reçues
          {demandes.filter(d => d.status === 'PENDING').length > 0 && (
            <span className="ml-1 bg-white text-[#C17D59] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
              {demandes.filter(d => d.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('projets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'projets'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2DBD0]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <Briefcase className="size-4" />
          Mes Projets Clés en Main
        </button>
      </div>

      {/* ==================== DEMANDES TAB ==================== */}
      {activeTab === 'demandes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#475569]">
              {demandes.length} demande{demandes.length !== 1 ? 's' : ''} reçue{demandes.length !== 1 ? 's' : ''} via le formulaire du site
            </p>
            <button onClick={loadDemandes} className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer">
              <RefreshCw className="size-3.5" /> Actualiser
            </button>
          </div>

          {loadingDemandes ? (
            <div className="py-20 text-center flex justify-center">
              <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
            </div>
          ) : demandes.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFD4] shadow-xs flex flex-col items-center gap-4">
              <InboxIcon className="size-12 text-[#94A3B8]" />
              <p className="text-[#475569] text-sm font-medium">Aucune demande reçue pour le moment.</p>
              <p className="text-[#94A3B8] text-xs">Les demandes du formulaire &quot;Parlez-nous de votre projet&quot; apparaîtront ici.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {demandes.map((demande) => {
                const parsed = parseDetails(demande.personalizationDetails)
                const isExpanded = expandedDemande === demande.id
                return (
                  <div
                    key={demande.id}
                    className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs overflow-hidden"
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                      onClick={() => setExpandedDemande(isExpanded ? null : demande.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#C17D59]/10 border border-[#C17D59]/25 flex items-center justify-center shrink-0">
                          <User className="size-5 text-[#C17D59]" />
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#0F172A]">{demande.fullName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[demande.status] || statusColors.PENDING}`}>
                              {statusLabels[demande.status] || demande.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#64748B] flex-wrap">
                            {parsed["Type d'espace"] && (
                              <span className="font-semibold text-[#C17D59]">{parsed["Type d'espace"]}</span>
                            )}
                            {parsed['Ville'] && parsed['Ville'] !== 'undefined' && (
                              <span className="flex items-center gap-1"><MapPin className="size-3" />{parsed['Ville']}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(demande.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? <ChevronUp className="size-4 text-[#64748B]" /> : <ChevronDown className="size-4 text-[#64748B]" />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-[#E8DFD4] p-5 space-y-5 bg-[#FAF8F5]">
                        {/* Contact info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white rounded-xl p-4 border border-[#E8DFD4] shadow-xs flex items-start gap-3">
                            <User className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">Client</p>
                              <p className="text-sm font-bold text-[#0F172A] mt-0.5">{demande.fullName}</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-[#E8DFD4] shadow-xs flex items-start gap-3">
                            <Phone className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">Téléphone</p>
                              <a href={`tel:${demande.phoneNumber}`} className="text-sm font-bold text-[#C17D59] mt-0.5 hover:underline block">
                                {demande.phoneNumber}
                              </a>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-[#E8DFD4] shadow-xs flex items-start gap-3">
                            <Mail className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">Email</p>
                              <a href={`mailto:${demande.email}`} className="text-sm font-bold text-[#C17D59] mt-0.5 hover:underline block truncate">
                                {demande.email}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Project details */}
                        <div className="bg-white rounded-xl p-4 border border-[#E8DFD4] shadow-xs space-y-3">
                          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold flex items-center gap-1.5">
                            <Wrench className="size-3.5 text-[#C17D59]" /> Détails du Projet
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {parsed["Type d'espace"] && (
                              <div>
                                <p className="text-[9px] uppercase text-[#64748B]">Type d&apos;espace</p>
                                <p className="text-sm font-semibold text-[#0F172A]">{parsed["Type d'espace"]}</p>
                              </div>
                            )}
                            {parsed['Ville'] && parsed['Ville'] !== 'undefined' && (
                              <div>
                                <p className="text-[9px] uppercase text-[#64748B]">Ville</p>
                                <p className="text-sm font-semibold text-[#0F172A]">{parsed['Ville']}</p>
                              </div>
                            )}
                          </div>
                          {parsed['Travaux souhaités'] && parsed['Travaux souhaités'] !== 'undefined' && (
                            <div>
                              <p className="text-[9px] uppercase text-[#64748B] mb-2 font-medium">Travaux souhaités</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed['Travaux souhaités'].split(',').map((t, i) => (
                                  t.trim() && (
                                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs font-semibold px-3 py-1 rounded-full">
                                      <CheckCircle2 className="size-3" /> {t.trim()}
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          {demande.message && (
                            <div>
                              <p className="text-[9px] uppercase text-[#64748B] mb-1 font-medium">Description du client</p>
                              <p className="text-sm text-[#334155] leading-relaxed bg-[#FAF8F5] rounded-lg p-3 border border-[#E8DFD4]">
                                {demande.message}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#64748B] mr-2 font-semibold">Changer le statut :</span>
                          {['PENDING', 'CONTACTED', 'COMPLETED'].map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpdateStatus(demande.id, s)}
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border cursor-pointer ${
                                demande.status === s
                                  ? statusColors[s] + ' scale-105 shadow-xs'
                                  : 'border-[#E8DFD4] bg-white text-[#475569] hover:border-[#CBD5E1]'
                              }`}
                            >
                              {statusLabels[s]}
                            </button>
                          ))}
                          <button
                            onClick={() => handleDeleteDemande(demande.id)}
                            className="ml-auto text-xs px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== PROJETS TAB ==================== */}
      {activeTab === 'projets' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[#E8DFD4] shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Rechercher par titre ou lieu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#C8960C] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'Tous' },
                { id: 'immobilier', label: 'Projets Immobiliers' },
                { id: 'hotel', label: 'Hôtels & Palaces' },
                { id: 'guesthouse', label: 'Maisons d\'Hôtes' },
                { id: 'villa', label: 'Villas & Résidences' },
                { id: 'pro_commercial', label: 'Espaces Pro & Commerciaux' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-all shrink-0 cursor-pointer ${
                    categoryFilter === cat.id 
                      ? 'bg-[#0F172A] text-white shadow-xs' 
                      : 'bg-[#FAF8F5] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1ECE4] border border-[#E2DBD0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#64748B] flex justify-center">
              <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] bg-white rounded-xl border border-[#E8DFD4] shadow-xs">
              Aucun projet trouvé. Cliquez sur &quot;Nouveau Projet&quot; pour en ajouter un.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredProjects.map((project) => {
                const categoryLabels: Record<string, string> = {
                  immobilier: 'Projets Immobiliers',
                  hotel: 'Hôtels & Palaces',
                  guesthouse: "Maisons d'Hôtes",
                  villa: 'Villas & Résidences Privées',
                  pro_commercial: 'Espaces Pro & Commerciaux',
                  restaurant: 'Restaurants',
                  entreprise: 'Entreprises'
                }
                const displayCat = categoryLabels[project.category] || project.category

                const projectPhotos = getProjectPhotos(project)
                const coverPhoto = projectPhotos[0] || (project.imageUrl ? project.imageUrl.split(',')[0].trim() : '') || '/project-hotel.png'

                return (
                  <div 
                    key={project.id}
                    className="bg-white rounded-2xl border border-[#E8DFD4] shadow-xs hover:shadow-lg hover:border-[#C8960C]/40 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="relative aspect-[16/9] w-full bg-[#EFECE6] border-b border-[#E8DFD4] overflow-hidden">
                      <Image
                        src={coverPhoto}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C17D59] border border-[#E8DFD4] shadow-xs">
                        {displayCat}
                      </div>

                      {(project.videoUrl || project.video) && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideoUrl(project.videoUrl || project.video || null)}
                          className="absolute bottom-3 right-3 bg-[#0F172A]/90 hover:bg-[#0F172A] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Play className="size-3 fill-current" /> Vidéo
                        </button>
                      )}

                      {/* Badge nombre de photos dans la galerie */}
                      <span className="absolute bottom-3 left-3 bg-white/90 text-[#0F172A] text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#E8DFD4] backdrop-blur-md shadow-xs">
                        <ImageIcon className="size-3 text-[#C8960C]" />
                        <span>{projectPhotos.length} photo{projectPhotos.length > 1 ? 's' : ''}</span>
                      </span>
                    </div>

                    {/* Bandeau Miniatures Photos en dessous du Média */}
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

                    <div className="p-5 space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[#C17D59] font-semibold">
                          <MapPin className="size-3.5" /> {project.location || 'Tunis'}
                        </div>
                        {(project.videoUrl || project.video) && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Video className="size-2.5" /> Vidéo incluse
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-xl text-[#0F172A] font-bold">{project.title}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
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

                    <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E8DFD4] flex items-center justify-between gap-2 flex-wrap">
                      {/* Bouton direct pour ajouter / gérer plusieurs photos */}
                      <button
                        type="button"
                        onClick={() => openGalleryModal(project)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        title="Ajouter ou gérer les photos de ce projet"
                      >
                        <Plus className="size-3.5 stroke-[2.5]" />
                        <ImageIcon className="size-3.5" />
                        <span>+ Photos ({projectPhotos.length})</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(project)}
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
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-10 size-9 rounded-full bg-black/70 border border-white/20 text-white hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Photo Gallery Modal — Ajout multiple de photos pour chaque projet */}
      {galleryModalOpen && activeProjectForGallery && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-4xl bg-white border border-[#E8DFD4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E8DFD4] flex items-start justify-between gap-4 bg-[#FAF8F5]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C17D59] bg-[#FAF0E6] px-2.5 py-1 rounded-full border border-[#E8DFD4]">
                  {activeProjectForGallery.category}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-[#0F172A] font-bold mt-2">
                  Galerie Photos — {activeProjectForGallery.title}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Sélectionnez et importez plusieurs photos à la fois pour ce projet clé en main.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGalleryModalOpen(false)
                  setActiveProjectForGallery(null)
                }}
                className="size-8 sm:size-9 rounded-full bg-[#EFECE6] hover:bg-[#E2DBD0] flex items-center justify-center text-[#0F172A] transition-colors shrink-0 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin bg-white">

              {/* Bouton d'upload multiple */}
              <label className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-[#D9D2C7] hover:border-[#C8960C] bg-[#FAF8F5] hover:bg-white rounded-2xl cursor-pointer transition-all group text-center">
                <div className="size-12 sm:size-14 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C17D59] mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <Upload className="size-6" />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                  + Cliquez ici pour ajouter plusieurs photos à la fois
                </span>
                <span className="text-xs text-[#64748B] mt-1">
                  Sélection multiple activée : choisissez autant de photos que vous souhaitez en un seul clic
                </span>
                <span className="text-[10.5px] text-[#C17D59] font-medium mt-1">
                  Formats acceptés : JPG, PNG, WEBP
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleQuickGalleryUpload}
                  disabled={uploadingGallery}
                  className="hidden"
                />
              </label>

              {/* Indicateur de progression de l'upload */}
              {uploadingGallery && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-3 animate-pulse">
                  <RefreshCw className="size-4 animate-spin shrink-0 text-amber-600" />
                  <span>{uploadProgress || 'Téléchargement des photos en cours...'}</span>
                </div>
              )}

              {/* Grille des photos du projet */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#0F172A] flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-[#C17D59]" />
                    <span>Photos du projet ({projectGalleryList.length})</span>
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    La photo n°1 sert de couverture principale
                  </span>
                </div>

                {projectGalleryList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E8DFD4] rounded-xl text-xs text-[#94A3B8]">
                    Aucune photo dans la galerie pour le moment. Cliquez sur le bouton ci-dessus pour importer vos photos.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {projectGalleryList.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 bg-stone-100 group transition-all shadow-xs ${
                          idx === 0 ? 'border-[#C17D59] ring-2 ring-[#C17D59]/30' : 'border-[#E8DFD4] hover:border-[#C8960C]'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          className="size-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/project-hotel.png' }}
                        />

                        {/* Top Badges & Actions */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-[#C17D59] text-white text-[9px] font-bold uppercase tracking-wider shadow">
                              Couverture
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(idx)}
                              className="px-2 py-0.5 rounded bg-black/75 hover:bg-[#C17D59] text-white text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow cursor-pointer"
                            >
                              Mettre en couverture
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromQuickGallery(idx)}
                            className="size-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow cursor-pointer"
                            title="Supprimer cette photo"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>

                        {/* Numéro photo */}
                        <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono z-10">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E8DFD4] flex items-center justify-between bg-[#FAF8F5]">
              <span className="text-xs text-[#64748B] font-medium">
                {projectGalleryList.length} photo{projectGalleryList.length > 1 ? 's' : ''} au total
              </span>
              <button
                type="button"
                onClick={() => {
                  setGalleryModalOpen(false)
                  setActiveProjectForGallery(null)
                }}
                className="rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD4] rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-[#E8DFD4] pb-3">
              <h3 className="font-heading text-2xl text-[#0F172A] font-bold">
                {editingProject ? 'Modifier le Projet' : 'Nouveau Projet d\'Exception'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Titre du Projet *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Hôtel Dar El Jeld"
                  className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Type d&apos;Établissement / Espace *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs cursor-pointer"
                  >
                    <option value="immobilier">Projets Immobiliers</option>
                    <option value="hotel">Hôtels &amp; Palaces</option>
                    <option value="guesthouse">Maisons d&apos;Hôtes</option>
                    <option value="villa">Villas &amp; Résidences Privées</option>
                    <option value="pro_commercial">Espaces Professionnels &amp; Commerciaux</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Localisation *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Médina de Tunis"
                    className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Détails &amp; Tags (Séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Portes monumentales, Boiseries d'art, Salons"
                  className="rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2.5 outline-none focus:border-[#C8960C] transition-colors text-[#0F172A] text-xs"
                />
              </div>

              {/* Galerie Photos avec sélection multiple et couverture */}
              <div className="rounded-xl border border-[#E8DFD4] bg-[#FAF8F5] p-4">
                <MultiImageUploader
                  label="Photos du projet (La 1ère image sera la couverture principale)"
                  imageUrls={galleryUrls}
                  onAdd={(url) => {
                    setGalleryUrls(prev => [...prev, url])
                    if (!formData.imageUrl || formData.imageUrl === '/project-hotel.png') {
                      setFormData(prev => ({ ...prev, imageUrl: url }))
                    }
                  }}
                  onRemove={(idx) => {
                    setGalleryUrls(prev => {
                      const next = prev.filter((_, i) => i !== idx)
                      setFormData(f => ({ ...f, imageUrl: next[0] || '/project-hotel.png' }))
                      return next
                    })
                  }}
                  uploading={uploading}
                  setUploading={setUploading}
                  uploadFn={adminApi.uploadImage}
                />
              </div>

              {/* Vidéo du projet */}
              <div className="flex flex-col gap-1.5 rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                    <Film className="size-3.5" /> Vidéo du projet (Atelier / Visite 3D / Chantier)
                  </label>
                  {formData.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                    >
                      Supprimer la vidéo
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Ex: /Video.mp4 ou importer un fichier MP4..."
                    className="flex-1 rounded-lg border border-amber-200 bg-white px-4 py-2 text-xs outline-none focus:border-amber-500 text-[#0F172A] font-mono"
                  />
                  <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    uploadingVideo 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs'
                  }`}>
                    {uploadingVideo ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Video className="size-3.5" />
                    )}
                    {uploadingVideo ? 'Envoi...' : 'Importer Vidéo'}
                    <input 
                      type="file" 
                      accept="video/mp4,video/webm,video/quicktime" 
                      className="hidden" 
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                  </label>
                </div>

                {/* Video Live Preview */}
                {formData.videoUrl && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-amber-300 bg-black mt-2">
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <p className="text-[10px] text-amber-800/70">Formats acceptés : MP4, WEBM, MOV (ou fichier vidéo local /Video.mp4)</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#0F172A] font-bold">Description du Projet</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'intervention de l'atelier, l'ébénisterie et la sculpture..."
                  className="resize-none rounded-lg border border-[#D9D2C7] bg-[#FAF8F5] focus:bg-white px-4 py-2 outline-none focus:border-[#C8960C] text-xs text-[#0F172A]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all mt-2 shadow-md cursor-pointer"
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

