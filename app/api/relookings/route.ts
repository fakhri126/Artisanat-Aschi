import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const dataFilePath = path.join(process.cwd(), 'public', 'relooking-data.json')

// Liste des motifs considérés comme des "photos mortes" (anciens gabarits de test)
export function isDeadPhoto(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true
  const lower = url.toLowerCase().trim()
  return (
    lower.includes('gallery-1') ||
    lower.includes('gallery-2') ||
    lower.includes('relooking_service') ||
    lower.includes('herochaise') ||
    lower.includes('placeholder')
  )
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co'
  const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcmJxc3dneHNpbmF5ZnludHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcyMTcsImV4cCI6MjEwMzg4MzIxN30.xoxyBPIb5ZOxM5ggsIsgPxyMF2K8BjO9_JwE8mtKygI'
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
}

function readLocalData(): any[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => !isDeadPhoto(item.imageAvantUrl) && !isDeadPhoto(item.imageApresUrl))
      }
    }
  } catch (e) {
    console.error('Erreur lecture relooking-data.json:', e)
  }
  return []
}

function writeLocalData(items: any[]) {
  try {
    const cleanItems = items.filter(item => !isDeadPhoto(item.imageAvantUrl) && !isDeadPhoto(item.imageApresUrl))
    fs.writeFileSync(dataFilePath, JSON.stringify(cleanItems, null, 2), 'utf8')
  } catch (e) {
    console.error('Erreur écriture relooking-data.json:', e)
  }
}

// Nettoyage automatique des anciennes données de test dans Supabase
async function purgeDeadPhotosInDb() {
  try {
    const supabase = getSupabaseClient()
    // Supprimer les lignes qui contiennent les photos mortes
    await supabase
      .from('relookings')
      .delete()
      .or('image_avant_url.ilike.%gallery-%,image_apres_url.ilike.%relooking_service%,image_apres_url.ilike.%herochaise%')
  } catch (e) {
    console.warn('Purge dead photos Supabase error:', e)
  }
}

// GET: Récupère la liste des relookings (uniquement les vraies photos ajoutées par l'admin)
export async function GET() {
  await purgeDeadPhotosInDb()

  const localItems = readLocalData()
  let dbItems: any[] = []

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('relookings')
      .select('*')
      .order('id', { ascending: false })

    if (!error && Array.isArray(data)) {
      dbItems = data
        .map((row: any) => ({
          id: row.id,
          title: row.title || 'Restauration d’Art Aschi',
          description: row.description || '',
          category: row.category || 'Mobilier d’Art',
          imageAvantUrl: row.image_avant_url || row.imageAvantUrl || '',
          imageApresUrl: row.image_apres_url || row.imageApresUrl || '',
          createdDate: row.created_date || row.createdDate || new Date().toISOString(),
        }))
        .filter(item => !isDeadPhoto(item.imageAvantUrl) && !isDeadPhoto(item.imageApresUrl))
    }
  } catch (err) {
    console.warn('Supabase fetch relookings error:', err)
  }

  // Fusionner les données locales et la BDD (sans doublons sur l'ID)
  const map = new Map<number, any>()
  for (const item of [...dbItems, ...localItems]) {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  }

  const result = Array.from(map.values()).sort((a, b) => (b.id || 0) - (a.id || 0))

  // Mettre à jour le fichier local pour garantir un cache chaud ultra-rapide
  if (result.length > 0) {
    writeLocalData(result)
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
  })
}

// POST: Ajouter ou mettre à jour une restauration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, title, description, category, imageAvantUrl, imageApresUrl } = body

    if (!title || !imageAvantUrl || !imageApresUrl) {
      return NextResponse.json({ error: 'Titre, photo Avant et photo Après requis' }, { status: 400 })
    }

    if (isDeadPhoto(imageAvantUrl) || isDeadPhoto(imageApresUrl)) {
      return NextResponse.json({ error: 'Les photos de gabarit ou mortes ne sont pas autorisées' }, { status: 400 })
    }

    const currentItems = readLocalData()
    const itemId = id ? Number(id) : Date.now()
    const newItem = {
      id: itemId,
      title: title.trim(),
      description: (description || '').trim(),
      category: category || 'Mobilier d’Art',
      imageAvantUrl: imageAvantUrl.trim(),
      imageApresUrl: imageApresUrl.trim(),
      createdDate: new Date().toISOString(),
    }

    // Sauvegarde Supabase
    try {
      const supabase = getSupabaseClient()
      if (id) {
        await supabase
          .from('relookings')
          .update({
            title: newItem.title,
            description: newItem.description,
            category: newItem.category,
            image_avant_url: newItem.imageAvantUrl,
            image_apres_url: newItem.imageApresUrl,
          })
          .eq('id', itemId)
      } else {
        await supabase
          .from('relookings')
          .insert({
            id: itemId,
            title: newItem.title,
            description: newItem.description,
            category: newItem.category,
            image_avant_url: newItem.imageAvantUrl,
            image_apres_url: newItem.imageApresUrl,
            created_date: newItem.createdDate,
          })
      }
    } catch (dbErr) {
      console.warn('Supabase sync POST error:', dbErr)
    }

    // Sauvegarde fichier local
    const filtered = currentItems.filter(i => i.id !== itemId)
    filtered.unshift(newItem)
    writeLocalData(filtered)

    return NextResponse.json({ success: true, data: newItem })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer une restauration
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const numId = Number(id)
    const current = readLocalData().filter(i => i.id !== numId)
    writeLocalData(current)

    try {
      const supabase = getSupabaseClient()
      await supabase.from('relookings').delete().eq('id', numId)
    } catch (e) {
      console.warn('Supabase DELETE error:', e)
    }

    return NextResponse.json({ success: true, deletedId: numId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
