import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('http://localhost:8081/api/public/products?type=CATALOGUE')
    const products = await res.json()
    const relookingsRes = await fetch('http://localhost:8081/api/public/relookings')
    const relookings = await relookingsRes.json()

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const localFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []

    let totalImages = 0
    let existingLocallyCount = 0
    let missingLocallyCount = 0
    const missingLocallyList: string[] = []

    // Check relookings
    for (const r of relookings) {
      for (const key of ['imageAvantUrl', 'imageApresUrl']) {
        const url = (r as any)[key]
        if (url) {
          totalImages++
          const filename = url.split('/').pop()?.split('#')[0] || ''
          if (localFiles.includes(filename)) {
            existingLocallyCount++
          } else {
            missingLocallyCount++
            missingLocallyList.push(url)
          }
        }
      }
    }

    // Check products
    for (const p of products) {
      if (!p.images || p.images.length === 0) continue
      for (const img of p.images) {
        const url = img.imageUrl || ''
        if (url) {
          totalImages++
          const filename = url.split('/').pop()?.split('#')[0] || ''
          if (localFiles.includes(filename)) {
            existingLocallyCount++
          } else {
            missingLocallyCount++
            if (missingLocallyList.length < 20) missingLocallyList.push(url)
          }
        }
      }
    }

    return NextResponse.json({
      totalProducts: products.length,
      totalRelookings: relookings.length,
      totalImagesChecked: totalImages,
      existingLocallyCount,
      missingLocallyCount,
      missingLocallyListSample: missingLocallyList
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
