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

    const filepath = path.join(uploadsDir, finalFilename)
    const backendFilepath = path.join(backendUploadsDir, finalFilename)

    // Write processed file to both directories
    fs.writeFileSync(filepath, processedBuffer)
    try {
      fs.writeFileSync(backendFilepath, processedBuffer)
    } catch (_) {}

    return NextResponse.json({ url: `/uploads/${finalFilename}` })
  } catch (error: any) {
    console.error('Error uploading image to public/uploads:', error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'enregistrement de l'image." }, { status: 500 })
  }
}
