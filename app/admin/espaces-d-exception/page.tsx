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
  Wrench
} from 'lucide-react'
import Image from 'next/image'
import { adminApi, Project, QuoteRequest } from '@/lib/api'

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

  // --- Demandes state ---
  const [demandes, setDemandes] = useState<QuoteRequest[]>([])
  const [loadingDemandes, setLoadingDemandes] = useState(true)
  const [expandedDemande, setExpandedDemande] = useState<number | null>(null)

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'hotel',
    location: '',
    details: 'Portes monumentales, Boiseries d\'art',
    imageUrl: '/project-hotel.png',
    videoUrl: ''
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
          videoUrl: '/Video.mp4'
        },
        {
          id: 2,
          title: 'Maison d\'Hôtes Dar Said',
          description: 'Conception sur-mesure d\'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés et cadres dorés.',
          category: 'guesthouse',
          location: 'Sidi Bou Saïd',
          details: 'Mobilier de chambre, Miroirs sculptés, Consoles',
          imageUrl: '/project-guesthouse.png',
          videoUrl: '/test-video.mp4'
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

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        title: project.title,
        description: project.description || '',
        category: project.category || 'hotel',
        location: project.location || '',
        details: project.details || '',
        imageUrl: project.imageUrl || '/project-hotel.png',
        videoUrl: project.videoUrl || project.video || ''
      })
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        description: '',
        category: 'hotel',
        location: '',
        details: 'Portes monumentales, Boiseries d\'art',
        imageUrl: '/project-hotel.png',
        videoUrl: ''
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
      setFormData(prev => ({ ...prev, imageUrl: res.url }))
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Erreur d\'envoi de l\'image.')
    } finally {
      setUploading(false)
    }
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
    <div className="p-6 md:p-10 space-y-8 text-left text-[#3A2A21]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DCCB]/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCCB]/10 border border-[#E8DCCB]/25 text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <Briefcase className="size-3.5" /> Aménagements de Prestige
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white font-medium">Espaces d&apos;Exception</h1>
          <p className="text-sm text-[#3A2A21]/60 mt-1 font-light">Gérez les projets et les demandes clients reçues via le site.</p>
        </div>
        {activeTab === 'projets' && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#E8DCCB] text-walnut px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md self-start md:self-auto"
          >
            <Plus className="size-4" /> Nouveau Projet
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-stone-900/60 border border-white/10 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('demandes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'demandes'
              ? 'bg-[#C17D59] text-white shadow-md'
              : 'text-white/50 hover:text-white'
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'projets'
              ? 'bg-[#E8DCCB] text-walnut shadow-md'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Briefcase className="size-4" />
          Mes Projets
        </button>
      </div>

      {/* ==================== DEMANDES TAB ==================== */}
      {activeTab === 'demandes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {demandes.length} demande{demandes.length !== 1 ? 's' : ''} reçue{demandes.length !== 1 ? 's' : ''} via le formulaire du site
            </p>
            <button onClick={loadDemandes} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
              <RefreshCw className="size-3.5" /> Actualiser
            </button>
          </div>

          {loadingDemandes ? (
            <div className="py-20 text-center flex justify-center">
              <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
            </div>
          ) : demandes.length === 0 ? (
            <div className="py-20 text-center bg-stone-900/40 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
              <InboxIcon className="size-12 text-white/20" />
              <p className="text-white/40 text-sm">Aucune demande reçue pour le moment.</p>
              <p className="text-white/20 text-xs">Les demandes du formulaire &quot;Parlez-nous de votre projet&quot; apparaîtront ici.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {demandes.map((demande) => {
                const parsed = parseDetails(demande.personalizationDetails)
                const isExpanded = expandedDemande === demande.id
                return (
                  <div
                    key={demande.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                      onClick={() => setExpandedDemande(isExpanded ? null : demande.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#C17D59]/15 border border-[#C17D59]/30 flex items-center justify-center shrink-0">
                          <User className="size-5 text-[#C17D59]" />
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-stone-800">{demande.fullName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[demande.status] || statusColors.PENDING}`}>
                              {statusLabels[demande.status] || demande.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400 flex-wrap">
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
                        {isExpanded ? <ChevronUp className="size-4 text-stone-400" /> : <ChevronDown className="size-4 text-stone-400" />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 p-5 space-y-5 bg-stone-50">
                        {/* Contact info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3">
                            <User className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Client</p>
                              <p className="text-sm font-bold text-stone-800 mt-0.5">{demande.fullName}</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3">
                            <Phone className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Téléphone</p>
                              <a href={`tel:${demande.phoneNumber}`} className="text-sm font-bold text-[#C17D59] mt-0.5 hover:underline block">
                                {demande.phoneNumber}
                              </a>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3">
                            <Mail className="size-4 text-[#C17D59] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Email</p>
                              <a href={`mailto:${demande.email}`} className="text-sm font-bold text-[#C17D59] mt-0.5 hover:underline block truncate">
                                {demande.email}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Project details */}
                        <div className="bg-white rounded-xl p-4 border border-stone-100 space-y-3">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
                            <Wrench className="size-3.5" /> Détails du Projet
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {parsed["Type d'espace"] && (
                              <div>
                                <p className="text-[9px] uppercase text-stone-400">Type d&apos;espace</p>
                                <p className="text-sm font-semibold text-stone-800">{parsed["Type d'espace"]}</p>
                              </div>
                            )}
                            {parsed['Ville'] && parsed['Ville'] !== 'undefined' && (
                              <div>
                                <p className="text-[9px] uppercase text-stone-400">Ville</p>
                                <p className="text-sm font-semibold text-stone-800">{parsed['Ville']}</p>
                              </div>
                            )}
                          </div>
                          {parsed['Travaux souhaités'] && parsed['Travaux souhaités'] !== 'undefined' && (
                            <div>
                              <p className="text-[9px] uppercase text-stone-400 mb-2">Travaux souhaités</p>
                              <div className="flex flex-wrap gap-2">
                                {parsed['Travaux souhaités'].split(',').map((t, i) => (
                                  t.trim() && (
                                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#C17D59]/10 border border-[#C17D59]/20 text-[#C17D59] text-xs font-semibold px-3 py-1 rounded-full">
                                      <CheckCircle2 className="size-3" /> {t.trim()}
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          {demande.message && (
                            <div>
                              <p className="text-[9px] uppercase text-stone-400 mb-1">Description du client</p>
                              <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 rounded-lg p-3 border border-stone-100">
                                {demande.message}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-stone-500 mr-2 font-semibold">Changer le statut :</span>
                          {['PENDING', 'CONTACTED', 'COMPLETED'].map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpdateStatus(demande.id, s)}
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                                demande.status === s
                                  ? statusColors[s] + ' scale-105 shadow-sm'
                                  : 'border-stone-200 text-stone-500 hover:border-stone-300'
                              }`}
                            >
                              {statusLabels[s]}
                            </button>
                          ))}
                          <button
                            onClick={() => handleDeleteDemande(demande.id)}
                            className="ml-auto text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold flex items-center gap-1.5 transition-all"
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
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DCCB]/10">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#3A2A21]/40" />
              <input
                type="text"
                placeholder="Rechercher par titre ou lieu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#3A2A21]/30 outline-none focus:border-[#E8DCCB]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
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
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors shrink-0 ${
                    categoryFilter === cat.id 
                      ? 'bg-[#E8DCCB] text-walnut' 
                      : 'bg-stone-900 text-[#3A2A21]/60 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#3A2A21]/50 flex justify-center">
              <RefreshCw className="size-6 animate-spin text-[#C17D59]" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-[#3A2A21]/40 bg-stone-900/40 rounded-xl border border-white/5">
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

                return (
                  <div 
                    key={project.id}
                    className="bg-[#FAF7F2] rounded-2xl border border-[#E8DCCB]/10 overflow-hidden hover:border-[#E8DCCB]/30 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] w-full bg-stone-900 border-b border-[#E8DCCB]/10">
                      <Image
                        src={project.imageUrl || '/project-hotel.png'}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C17D59] border border-[#E8DCCB]/20">
                        {displayCat}
                      </div>

                      {(project.videoUrl || project.video) && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideoUrl(project.videoUrl || project.video || null)}
                          className="absolute bottom-3 right-3 bg-[#E8DCCB] text-walnut px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                        >
                          <Play className="size-3 fill-current" /> Vidéo
                        </button>
                      )}
                    </div>

                    <div className="p-5 space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[#C17D59]/80 font-semibold">
                          <MapPin className="size-3.5" /> {project.location || 'Tunis'}
                        </div>
                        {(project.videoUrl || project.video) && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <Video className="size-2.5" /> Vidéo incluse
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-2xl text-white font-medium">{project.title}</h3>
                      <p className="text-xs text-[#3A2A21]/70 font-light leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                      {project.details && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.details.split(',').map((tag, idx) => (
                            <span key={idx} className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-[9px] text-[#3A2A21]/60">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3.5 bg-stone-950/60 border-t border-white/5 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#C17D59] hover:bg-[#E8DCCB] hover:text-walnut text-xs font-semibold transition-colors"
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
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-stone-900 border border-[#E8DCCB]/30 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-10 size-9 rounded-full bg-black/70 border border-white/20 text-white hover:text-amber-400 flex items-center justify-center transition-colors"
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

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-[#E8DCCB]/30 rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#3A2A21]/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <h3 className="font-heading text-2xl text-white">
                {editingProject ? 'Modifier le Projet' : 'Nouveau Projet d\'Exception'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Titre du Projet *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Hôtel Dar El Jeld"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-[#E8DCCB] transition-colors text-white text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Type d&apos;Établissement / Espace *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="rounded-lg border border-white/10 bg-stone-950 px-4 py-2.5 outline-none focus:border-[#E8DCCB] transition-colors text-white text-xs"
                  >
                    <option value="immobilier">Projets Immobiliers</option>
                    <option value="hotel">Hôtels &amp; Palaces</option>
                    <option value="guesthouse">Maisons d&apos;Hôtes</option>
                    <option value="villa">Villas &amp; Résidences Privées</option>
                    <option value="pro_commercial">Espaces Professionnels &amp; Commerciaux</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Localisation *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Médina de Tunis"
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-[#E8DCCB] transition-colors text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Détails &amp; Tags (Séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Portes monumentales, Boiseries d'art, Salons"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-[#E8DCCB] transition-colors text-white text-xs"
                />
              </div>

              {/* Photo de couverture */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Photo de couverture *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/project-hotel.png ou URL"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-[#E8DCCB] text-white"
                  />
                  <label className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-[#E8DCCB] hover:text-walnut px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="size-3.5" />
                    {uploading ? '...' : 'Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Vidéo du projet */}
              <div className="flex flex-col gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                    <Film className="size-3.5" /> Vidéo du projet (Atelier / Visite 3D / Chantier)
                  </label>
                  {formData.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
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
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-amber-400 text-white font-mono"
                  />
                  <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    uploadingVideo 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-gradient-to-r from-[#F3C45E] to-[#C78318] text-[#1A110B] hover:opacity-90 font-bold shadow'
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
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-amber-500/30 bg-black mt-2">
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <p className="text-[10px] text-white/40">Formats acceptés : MP4, WEBM, MOV (ou fichier vidéo local /Video.mp4)</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#C17D59] font-bold">Description du Projet</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'intervention de l'atelier, l'ébénisterie et la sculpture..."
                  className="resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-[#E8DCCB] text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#E8DCCB] text-walnut py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform mt-2 shadow-lg"
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
