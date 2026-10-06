import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const videosFilePath = path.join(process.cwd(), 'public', 'site-videos.json')
const reelFilePath = path.join(process.cwd(), 'public', 'reel-data.json')

const DEFAULT_VIDEOS = {
  temoignage: {
    videoUrl: '/uploads/1791058503119-WhatsApp_Video_2026-10-03_at_06.20.12.mp4',
    badge: "Témoignage & Gestes d'Atelier",
    title: "L'Expérience Aschi en Vidéo",
    subtitle: "Atelier Familial & Réalisations d'Exception",
    description: "Découvrez en vidéo la passion de nos maîtres ébénistes, la noblesse du travail du noyer massif et la satisfaction de nos clients d'exception."
  },
  savoir_faire: {
    videoUrl: '',
    title: "Savoir-Faire & Gestes d'Atelier",
    subtitle: "Sculpture sur Noyer Massif & Ébénisterie Ancestrale",
    description: "Immersion au cœur de notre atelier familial fondé en 1960. Découvrez le geste précis du maître artisan, le choix des essences nobles de noyer et le façonnage traditionnel des ferrures et majoliques d'art.",
    poster: '/images/about-atelier-stand.jpg'
  },
  media: {
    videoUrl: '/video-media-aschi.mp4',
    badge: "Passage Média & Télévision",
    title: "L'Artisanat Aschi à l'Écran",
    subtitle: "Reportage Télévisé Intégral • Format Source 100% Sans Recadrage",
    description: "Plongez dans les coulisses de notre atelier familial à travers ce reportage télévisé dédié à la haute sculpture sur noyer et la sauvegarde de nos arts traditionnels."
  }
}

// Fonction de nettoyage de la table testimonials en base de données Supabase
async function cleanDatabaseTestimonials() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co'
    const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcmJxc3dneHNpbmF5ZnludHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcyMTcsImV4cCI6MjEwMzg4MzIxN30.xoxyBPIb5ZOxM5ggsIsgPxyMF2K8BjO9_JwE8mtKygI'
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Suppression de tous les anciens avis textuels dans Supabase
    await supabase.from('testimonials').delete().neq('id', 0)

    // Vérification du résultat
    const { data } = await supabase.from('testimonials').select('id, client_name')
    return {
      cleaned: true,
      remainingCount: data ? data.length : 0,
      testimonialsInDb: data || []
    }
  } catch (err: any) {
    return {
      cleaned: false,
      error: err.message
    }
  }
}

// Fonction de mise à jour des URLs vidéo des projets vers le stockage ultra-rapide /uploads/
async function syncProjectVideosToFastLocal() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co'
    const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcmJxc3dneHNpbmF5ZnludHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcyMTcsImV4cCI6MjEwMzg4MzIxN30.xoxyBPIb5ZOxM5ggsIsgPxyMF2K8BjO9_JwE8mtKygI'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: projects } = await supabase.from('projects').select('id, video_url')
    if (projects && projects.length > 0) {
      for (const p of projects) {
        if (p.video_url && p.video_url.includes('/media/')) {
          const m = p.video_url.match(/\/media\/([^/?#]+\.mp4)/i)
          if (m && m[1]) {
            const localUrl = `/uploads/${m[1]}`
            await supabase.from('projects').update({ video_url: localUrl }).eq('id', p.id)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Sync project videos to fast local error:', e)
  }
}

function getStoredVideos() {
  try {
    if (fs.existsSync(videosFilePath)) {
      const content = fs.readFileSync(videosFilePath, 'utf8')
      const parsed = JSON.parse(content)
      
      const tem = parsed.temoignage || {}
      delete tem.reviews // Suppression absolue de toute trace d'avis/commentaires

      return {
        temoignage: { ...DEFAULT_VIDEOS.temoignage, ...tem },
        savoir_faire: { ...DEFAULT_VIDEOS.savoir_faire, ...(parsed.savoir_faire || {}) },
        media: { ...DEFAULT_VIDEOS.media, ...(parsed.media || {}) },
      }
    }
  } catch (err) {
    console.error('Erreur lecture site-videos.json:', err)
  }
  return DEFAULT_VIDEOS
}

// GET: Récupère l'ensemble des vidéos du site et garantit le nettoyage de la BDD
export async function GET() {
  const dbResult = await cleanDatabaseTestimonials()
  await syncProjectVideosToFastLocal()
  const data = getStoredVideos()
  return NextResponse.json({
    ...data,
    databaseStatus: dbResult
  })
}

// POST: Met à jour une section de vidéo ou toutes les vidéos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const current = getStoredVideos()

    let updated = { ...current }

    if (body.category && ['temoignage', 'savoir_faire', 'media'].includes(body.category)) {
      const cat = body.category as 'temoignage' | 'savoir_faire' | 'media'
      const payload = body.data || body
      delete payload.reviews
      updated[cat] = {
        ...updated[cat],
        ...payload
      }
    } else {
      const tem = body.temoignage ? { ...body.temoignage } : {}
      delete tem.reviews
      updated = {
        temoignage: body.temoignage ? { ...updated.temoignage, ...tem } : updated.temoignage,
        savoir_faire: body.savoir_faire ? { ...updated.savoir_faire, ...body.savoir_faire } : updated.savoir_faire,
        media: body.media ? { ...updated.media, ...body.media } : updated.media,
      }
    }

    // Sauvegarde nettoyée dans public/site-videos.json
    fs.writeFileSync(videosFilePath, JSON.stringify(updated, null, 2), 'utf8')

    // Maintien propre et rétro-compatible de public/reel-data.json
    if (updated.temoignage) {
      try {
        fs.writeFileSync(reelFilePath, JSON.stringify({
          videoUrl: updated.temoignage.videoUrl
        }, null, 2), 'utf8')
      } catch (_) {}
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Erreur POST /api/videos:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
