import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isBijouxOrHandleCategory(name: string | null | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase().trim()
  return (
    n.includes('bijou') ||
    n.includes('poignée') ||
    n.includes('poignee') ||
    n.includes('bouton') ||
    n.includes('ronds') ||
    n.includes('ovales') ||
    n === 'cuivre' ||
    n.includes('poignée céramique') ||
    n.includes('poignée sculptée') ||
    n.includes('poignée en cuivre') ||
    n.includes('petites poignées') ||
    n.includes('grands ronds')
  )
}

export function isBijouxOrHandleProduct(p: { name?: string; category?: { name?: string }; materials?: string }): boolean {
  const catName = p.category?.name?.toLowerCase() || ''
  const prodName = (p.name || '').toLowerCase()
  const mat = (p.materials || '').toLowerCase()

  if (isBijouxOrHandleCategory(catName)) return true

  const isHandleName = (
    prodName.includes('bijou') ||
    prodName.includes('poignée') ||
    prodName.includes('poignee') ||
    prodName.includes('bouton de porte') ||
    prodName.includes('bouton') ||
    prodName.includes('grand rond') ||
    prodName.includes('ovale')
  )

  const isCeramicHandle = (
    (mat.includes('céramique') || mat.includes('majolique')) &&
    (prodName.includes('poignée') || prodName.includes('bouton') || prodName.includes('rond') || prodName.includes('ovale') || catName.includes('bijou') || catName.includes('poignée'))
  )

  return isHandleName || isCeramicHandle
}

export function formatImageUrl(url: string | null | undefined, fallback: string = '/placeholder.png'): string {
  if (!url || typeof url !== 'string') return fallback

  let cleaned = url.trim()
  if (!cleaned) return fallback

  // Strip variant color hashtag (e.g. /uploads/image.jpg#color=Bleu)
  if (cleaned.includes('#color=')) {
    cleaned = cleaned.split('#color=')[0]
  }

  // Normalize Windows backslashes
  cleaned = cleaned.replace(/\\+/g, '/')

  // Inline data / blob URIs
  if (cleaned.startsWith('data:') || cleaned.startsWith('blob:')) {
    return cleaned
  }

  // Strip backend host prefix if pointing to local backend port 8081
  cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8081\/api\//, '/')
  cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8081\//, '/')

  // Convert project Supabase Storage URLs to local /uploads/ proxy so they resolve correctly
  // either from local public/uploads/ or via the /uploads proxy fallback
  cleaned = cleaned.replace(/^https?:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\/(media|artisanat-aschi-media)\//i, '/uploads/')

  // Keep valid external absolute URLs (e.g. https://...)
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned
  }

  // Strip leading 'public/' or '/public/'
  cleaned = cleaned.replace(/^\/?public\//, '/')

  // Ensure leading slash for relative paths
  if (!cleaned.startsWith('/')) {
    cleaned = `/${cleaned}`
  }

  return cleaned
}
