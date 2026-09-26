import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

    // Sanitize filename and create unique name
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${Date.now()}-${sanitizedOriginal}`
    const filepath = path.join(uploadsDir, filename)
    const backendFilepath = path.join(backendUploadsDir, filename)

    // Write file to both directories
    fs.writeFileSync(filepath, buffer)
    try {
      fs.writeFileSync(backendFilepath, buffer)
    } catch (_) {}

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error: any) {
    console.error('Error uploading image to public/uploads:', error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'enregistrement de l'image." }, { status: 500 })
  }
}
