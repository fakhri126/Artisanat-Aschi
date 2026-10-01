import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('http://localhost:8081/api/public/products?type=CATALOGUE')
    const products = await res.json()
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const localFiles = fs.readdirSync(uploadsDir)
    const downloaded: string[] = []
    const failed: any[] = []

    for (const p of products) {
      if (!p.images || p.images.length === 0) continue
      for (const img of p.images) {
        const rawUrl = img.imageUrl || ''
        const cleanUrl = rawUrl.split('#')[0]
        if (!cleanUrl.startsWith('http')) continue

        const filename = cleanUrl.split('/').pop() || ''
        if (!filename) continue

        const localPath = path.join(uploadsDir, filename)
        if (!fs.existsSync(localPath)) {
          try {
            const fetchRes = await fetch(cleanUrl)
            if (fetchRes.ok) {
              const ab = await fetchRes.arrayBuffer()
              fs.writeFileSync(localPath, Buffer.from(ab))
              downloaded.push(filename)
            } else {
              failed.push({ filename, url: cleanUrl, status: fetchRes.status })
            }
          } catch (e: any) {
            failed.push({ filename, url: cleanUrl, error: e.message })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      downloadedCount: downloaded.length,
      downloaded,
      failedCount: failed.length,
      failed
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
