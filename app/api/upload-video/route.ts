import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier sélectionné.' }, { status: 400 })
    }

    // Limit incoming video size (increased to 300 MB for high quality videos)
    const MAX_VIDEO_SIZE = 300 * 1024 * 1024
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        {
          error: `Vidéo trop volumineuse (${sizeMb} Mo). La taille maximale autorisée est de 300 Mo.`,
        },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const backendUploadsDir = path.join(process.cwd(), 'backend', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    if (!fs.existsSync(backendUploadsDir)) fs.mkdirSync(backendUploadsDir, { recursive: true })

    // Sanitize filename and create unique path
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const baseName = sanitizedOriginal.replace(/\.[^/.]+$/, '')
    const finalFilename = `${Date.now()}-${baseName}.mp4`
    const finalFilepath = path.join(uploadsDir, finalFilename)
    const backendFilepath = path.join(backendUploadsDir, finalFilename)

    // Temporary raw file for ffmpeg processing
    const rawFilepath = path.join(uploadsDir, `temp-${Date.now()}-${sanitizedOriginal}`)
    fs.writeFileSync(rawFilepath, buffer)

    let compressionSuccess = false

    try {
      // Find ffmpeg binary
      const ffmpeg = require('@ffmpeg-installer/ffmpeg')
      const ffmpegPath = ffmpeg?.path

      if (ffmpegPath && fs.existsSync(ffmpegPath)) {
        // Fast transcoding: 720p max, H.264 ultrafast, CRF 28, AAC 128k, web faststart
        const ffmpegArgs = [
          '-i', rawFilepath,
          '-vf', "scale='min(1280,iw)':-2",
          '-c:v', 'libx264',
          '-crf', '28',
          '-preset', 'ultrafast',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          finalFilepath,
          '-y'
        ]

        await execFileAsync(ffmpegPath, ffmpegArgs, { timeout: 180000 })

        if (fs.existsSync(finalFilepath) && fs.statSync(finalFilepath).size > 0) {
          compressionSuccess = true
        }
      }
    } catch (ffmpegErr) {
      console.warn('FFmpeg auto-compression failed or timed out, falling back to raw video:', ffmpegErr)
    } finally {
      // Clean up temporary raw file if compression produced final file
      if (compressionSuccess) {
        try { fs.unlinkSync(rawFilepath) } catch (_) {}
      } else {
        // Fallback: move raw file to final filename
        try {
          fs.renameSync(rawFilepath, finalFilepath)
        } catch (_) {
          fs.writeFileSync(finalFilepath, buffer)
        }
      }
    }

    // Mirror to backend uploads directory
    try {
      fs.copyFileSync(finalFilepath, backendFilepath)
    } catch (_) {}

    // Upload to Supabase Storage if configured
    let finalUrl = `/uploads/${finalFilename}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
        const videoBuffer = fs.readFileSync(finalFilepath)
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(finalFilename, videoBuffer, {
            contentType: 'video/mp4',
            upsert: true,
          })
        if (!uploadError) {
          console.log(`Supabase backup upload succeeded for ${finalFilename}`)
        }
      } catch (sbErr) {
        console.warn('Supabase video upload fallback to local:', sbErr)
      }
    }

    return NextResponse.json({ url: finalUrl })
  } catch (error: any) {
    console.error('Error uploading video:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload video' }, { status: 500 })
  }
}
