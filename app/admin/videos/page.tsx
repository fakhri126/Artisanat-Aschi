'use client'

import { useEffect, useState } from 'react'
import {
  Video,
  Film,
  Tv,
  Sparkles,
  Check,
  Save,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import VideoSectionEditor from './VideoSectionEditor'

interface SiteVideosData {
  temoignage: {
    videoUrl: string
    badge?: string
    title: string
    subtitle: string
    description: string
  }
  savoir_faire: {
    videoUrl: string
    title: string
    subtitle: string
    description: string
    poster?: string
  }
  media: {
    videoUrl: string
    badge?: string
    title: string
    subtitle: string
    description: string
  }
}

export default function AdminVideosPage() {
  const [activeTab, setActiveTab] = useState<'temoignage' | 'savoir_faire' | 'media'>('temoignage')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingTab, setUploadingTab] = useState<string | null>(null)

  const [videosData, setVideosData] = useState<SiteVideosData>({
    temoignage: {
      videoUrl: '',
      badge: "Témoignage & Gestes d'Atelier",
      title: "L'Expérience Aschi en Vidéo",
      subtitle: "Atelier Familial & Réalisations d'Exception",
      description: "Découvrez en vidéo la passion de nos maîtres ébénistes, la noblesse du travail du noyer massif et la satisfaction de nos clients d'exception."
    },
    savoir_faire: {
      videoUrl: '',
      title: "Savoir-Faire & Gestes d'Atelier",
      subtitle: "Sculpture sur Noyer Massif & Ébénisterie Ancestrale",
      description: '',
      poster: ''
    },
    media: {
      videoUrl: '',
      badge: "Passage Média & Télévision",
      title: "L'Artisanat Aschi à l'Écran",
      subtitle: "Reportage Télévisé Intégral • Format Source 100% Sans Recadrage",
      description: ''
    }
  })

  // Chargement des données depuis /api/videos
  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true)
        const res = await fetch('/api/videos')
        if (res.ok) {
          const data = await res.json()
          setVideosData({
            temoignage: {
              videoUrl: data.temoignage?.videoUrl || '',
              badge: data.temoignage?.badge || "Témoignage & Gestes d'Atelier",
              title: data.temoignage?.title || "L'Expérience Aschi en Vidéo",
              subtitle: data.temoignage?.subtitle || "Atelier Familial & Réalisations d'Exception",
              description: data.temoignage?.description || ""
            },
            savoir_faire: {
              videoUrl: data.savoir_faire?.videoUrl || '',
              title: data.savoir_faire?.title || "Savoir-Faire & Gestes d'Atelier",
              subtitle: data.savoir_faire?.subtitle || "Sculpture sur Noyer Massif & Ébénisterie Ancestrale",
              description: data.savoir_faire?.description || "",
              poster: data.savoir_faire?.poster || ""
            },
            media: {
              videoUrl: data.media?.videoUrl || '',
              badge: data.media?.badge || "Passage Média & Télévision",
              title: data.media?.title || "L'Artisanat Aschi à l'Écran",
              subtitle: data.media?.subtitle || "Reportage Télévisé Intégral • Format Source 100% Sans Recadrage",
              description: data.media?.description || ""
            }
          })
        }
      } catch (err) {
        console.error('Erreur chargement /api/videos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [])

  // Sauvegarde des modifications
  const handleSave = async (updatedData?: SiteVideosData) => {
    try {
      setSaving(true)
      const toSave = updatedData || videosData
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave)
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert('Erreur lors de la sauvegarde.')
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      alert('Erreur de connexion au serveur.')
    } finally {
      setSaving(false)
    }
  }

  // Upload vidéo
  const handleVideoUpload = async (file: File, category: 'temoignage' | 'savoir_faire' | 'media') => {
    try {
      setUploadingTab(category)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Échec de l’envoi de la vidéo.')
      }
      const data = await res.json()

      const updated: SiteVideosData = {
        ...videosData,
        [category]: {
          ...videosData[category],
          videoUrl: data.url
        }
      }
      setVideosData(updated)
      await handleSave(updated)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erreur lors de l’envoi de la vidéo.')
    } finally {
      setUploadingTab(null)
    }
  }

  // Upload poster / image
  const handlePosterUpload = async (file: File) => {
    try {
      setUploadingTab('poster')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Échec upload poster')
      const data = await res.json()

      const updated: SiteVideosData = {
        ...videosData,
        savoir_faire: {
          ...videosData.savoir_faire,
          poster: data.url
        }
      }
      setVideosData(updated)
      await handleSave(updated)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l’envoi de l’image.')
    } finally {
      setUploadingTab(null)
    }
  }

  const updateField = (
    tab: 'temoignage' | 'savoir_faire' | 'media',
    field: 'videoUrl' | 'badge' | 'title' | 'subtitle' | 'description' | 'poster',
    value: string
  ) => {
    setVideosData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#C8960C] border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs uppercase tracking-widest text-[#78695C] font-semibold">
            Chargement de la gestion vidéo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* En-tête Statutaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DFD4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#FAF0E6] text-[#C17D59]">
              <Video className="size-5" />
            </span>
            <h1 className="font-heading text-2xl font-bold text-[#0F172A]">
              Gestion des Vidéos
            </h1>
          </div>
          <p className="text-xs text-[#78695C] mt-1">
            Pilotez l’intégralité des vidéos de la Maison Aschi : Témoignages clients, Savoir-Faire d’atelier et Reportages Médias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/#temoignages"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8DFD4] hover:bg-[#FAF8F5] text-xs font-semibold text-[#0F172A] transition-colors"
          >
            <Eye className="size-3.5" />
            <span>Voir le site</span>
            <ExternalLink className="size-3 opacity-50" />
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] active:scale-98 transition-all text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="size-4 animate-spin text-[#C8960C]" />
                <span>Enregistrement...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <Save className="size-4 text-[#C8960C]" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Onglets de navigation des 3 Catégories */}
      <div className="flex bg-[#EFECE6] p-1.5 rounded-2xl border border-[#E2DBD0] gap-2 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('temoignage')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'temoignage'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E8DFD4]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Film className="size-4 text-[#C17D59]" />
          <span>1. Vidéo Témoignages</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('savoir_faire')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'savoir_faire'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E8DFD4]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sparkles className="size-4 text-[#C8960C]" />
          <span>2. Savoir-Faire (Atelier)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E8DFD4]'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Tv className="size-4 text-[#C17D59]" />
          <span>3. Média &amp; Télévision</span>
        </button>
      </div>

      {/* 1. Onglet Témoignages */}
      {activeTab === 'temoignage' && (
        <VideoSectionEditor
          title="Lecteur Vidéo Témoignage"
          icon={Film}
          hasBadge
          videoUrl={videosData.temoignage.videoUrl}
          badge={videosData.temoignage.badge}
          mainTitle={videosData.temoignage.title}
          subtitle={videosData.temoignage.subtitle}
          description={videosData.temoignage.description}
          uploading={uploadingTab === 'temoignage'}
          onVideoUpload={(file) => handleVideoUpload(file, 'temoignage')}
          onChangeField={(field, val) => updateField('temoignage', field, val)}
          subtitleLabel="Sous-Titre :"
          descriptionLabel="Description :"
          importButtonLabel="Importer un fichier vidéo MP4"
          urlPlaceholder="/Video.mp4 ou https://..."
        />
      )}

      {/* 2. Onglet Savoir-Faire */}
      {activeTab === 'savoir_faire' && (
        <VideoSectionEditor
          title="Vidéo d'Immersion Atelier"
          icon={Sparkles}
          hasPoster
          videoUrl={videosData.savoir_faire.videoUrl}
          poster={videosData.savoir_faire.poster}
          mainTitle={videosData.savoir_faire.title}
          subtitle={videosData.savoir_faire.subtitle}
          description={videosData.savoir_faire.description}
          uploading={uploadingTab === 'savoir_faire'}
          uploadingPoster={uploadingTab === 'poster'}
          onVideoUpload={(file) => handleVideoUpload(file, 'savoir_faire')}
          onPosterUpload={handlePosterUpload}
          onChangeField={(field, val) => updateField('savoir_faire', field, val)}
          subtitleLabel="Sous-Titre / Métier :"
          descriptionLabel="Texte Descriptif :"
          importButtonLabel="Importer la vidéo Savoir-Faire"
          urlPlaceholder="/Video.mp4 ou https://..."
        />
      )}

      {/* 3. Onglet Média & Télévision */}
      {activeTab === 'media' && (
        <VideoSectionEditor
          title="Fichier du Reportage Télévisé"
          icon={Tv}
          hasBadge
          videoUrl={videosData.media.videoUrl}
          badge={videosData.media.badge}
          mainTitle={videosData.media.title}
          subtitle={videosData.media.subtitle}
          description={videosData.media.description}
          uploading={uploadingTab === 'media'}
          onVideoUpload={(file) => handleVideoUpload(file, 'media')}
          onChangeField={(field, val) => updateField('media', field, val)}
          subtitleLabel="Sous-Titre / Chaîne TV :"
          descriptionLabel="Description du Reportage :"
          importButtonLabel="Importer le reportage télévisé"
          urlPlaceholder="/video-media-aschi.mp4 ou https://..."
        />
      )}
    </div>
  )
}
