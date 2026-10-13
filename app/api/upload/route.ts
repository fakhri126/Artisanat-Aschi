import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier sélectionné.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists in public/uploads and backend/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const backendUploadsDir = path.join(process.cwd(), 'backend', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    if (!fs.existsSync(backendUploadsDir)) fs.mkdirSync(backendUploadsDir, { recursive: true })

    // Sanitize filename
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    let finalFilename = `${Date.now()}-${sanitizedOriginal}`
    let processedBuffer = buffer

    // Check if file is a compressible image
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(file.name)
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
    const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name)

    if (isImage && !isSvg && !isGif) {
      try {
        const sharpInstance = sharp(buffer)
        const metadata = await sharpInstance.metadata()

        let pipeline = sharpInstance.rotate() // auto-orient based on EXIF

        if ((metadata.width && metadata.width > 1920) || (metadata.height && metadata.height > 1920)) {
          pipeline = pipeline.resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true,
          })
        }

        // Convert to high-quality compressed WebP
        processedBuffer = await pipeline
          .webp({ quality: 82, effort: 4 })
          .toBuffer()

        const baseName = sanitizedOriginal.replace(/\.[^/.]+$/, '')
        finalFilename = `${Date.now()}-${baseName}.webp`
      } catch (sharpErr) {
        console.warn('Sharp compression failed, fallback to original buffer:', sharpErr)
        processedBuffer = buffer
      }
    }

    // Try local backup cache only if filesystem is writable (non-blocking for Vercel Serverless)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      const backendUploadsDir = path.join(process.cwd(), 'backend', 'uploads')
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
      if (!fs.existsSync(backendUploadsDir)) fs.mkdirSync(backendUploadsDir, { recursive: true })
      fs.writeFileSync(path.join(uploadsDir, finalFilename), processedBuffer)
      fs.writeFileSync(path.join(backendUploadsDir, finalFilename), processedBuffer)
    } catch (_) {
      // Ignored on read-only environments like Vercel
    }

    // Upload directly to permanent Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcmJxc3dneHNpbmF5ZnludHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcyMTcsImV4cCI6MjEwMzg4MzIxN30.xoxyBPIb5ZOxM5ggsIsgPxyMF2K8BjO9_JwE8mtKygI'

    let finalUrl = `https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/${finalFilename}`

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(finalFilename, processedBuffer, {
          contentType: isImage && !isSvg && !isGif ? 'image/webp' : (file.type || 'application/octet-stream'),
          upsert: true,
        })

      if (!uploadError) {
        const { data: pubData } = supabase.storage.from('media').getPublicUrl(finalFilename)
        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message)
      }
    } catch (sbErr) {
      console.warn('Supabase upload exception:', sbErr)
    }

    return NextResponse.json({ url: finalUrl })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: error.message || "Erreur lors du traitement de l'image." }, { status: 500 })
  }
}
