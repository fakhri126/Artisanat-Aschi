import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params
  const relativePath = pathSegments.join('/')
  const filename = pathSegments[pathSegments.length - 1]
  const ext = path.extname(filename).toLowerCase()
  const mimeType = MIME_MAP[ext] || 'application/octet-stream'

  // 1. Check local public/uploads directory
  const publicUploadPath = path.join(process.cwd(), 'public', 'uploads', relativePath)
  if (fs.existsSync(publicUploadPath)) {
    try {
      const buffer = fs.readFileSync(publicUploadPath)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {}
  }

  // 2. Check local backend/uploads directory
  const backendUploadPath = path.join(process.cwd(), 'backend', 'uploads', relativePath)
  if (fs.existsSync(backendUploadPath)) {
    try {
      const buffer = fs.readFileSync(backendUploadPath)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {}
  }

  // 3. Check root uploads directory
  const rootUploadPath = path.join(process.cwd(), 'uploads', relativePath)
  if (fs.existsSync(rootUploadPath)) {
    try {
      const buffer = fs.readFileSync(rootUploadPath)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {}
  }

  // 4. Try fetching from Spring Boot backend
  try {
    const backendRes = await fetch(`http://localhost:8081/api/uploads/${relativePath}`, {
      headers: { Accept: '*/*' },
      cache: 'no-store',
    })
    if (backendRes.ok) {
      const arrayBuffer = await backendRes.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      // Save locally to public/uploads for future fast requests
      try {
        const targetDir = path.dirname(publicUploadPath)
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
        fs.writeFileSync(publicUploadPath, buffer)
      } catch {}
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': backendRes.headers.get('Content-Type') || mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  } catch {}

  // 5. Try fetching from Supabase Storage (media bucket)
  try {
    const supabaseMediaUrl = `https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/${relativePath}`
    const supRes = await fetch(supabaseMediaUrl, { cache: 'no-store' })
    if (supRes.ok) {
      const arrayBuffer = await supRes.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      try {
        const targetDir = path.dirname(publicUploadPath)
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
        fs.writeFileSync(publicUploadPath, buffer)
      } catch {}
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': supRes.headers.get('Content-Type') || mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  } catch {}

  // 6. Try fetching from Supabase Storage (artisanat-aschi-media bucket)
  try {
    const supabaseBucketUrl = `https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/artisanat-aschi-media/${relativePath}`
    const supRes = await fetch(supabaseBucketUrl, { cache: 'no-store' })
    if (supRes.ok) {
      const arrayBuffer = await supRes.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      try {
        const targetDir = path.dirname(publicUploadPath)
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
        fs.writeFileSync(publicUploadPath, buffer)
      } catch {}
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': supRes.headers.get('Content-Type') || mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  } catch {}

  // 7. If image not found, return 404 so browser onError handler falls back cleanly
  return new NextResponse('Image not found', { 
    status: 404,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
