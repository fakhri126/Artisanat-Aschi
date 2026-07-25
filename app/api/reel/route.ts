import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'public', 'reel-data.json')

// Default data in case file doesn't exist
const DEFAULT_DATA = {
  videoUrl: '/Video.mp4',
  reviews: [
    {
      id: 1,
      platform: 'google',
      name: 'Sonia B.',
      avatar: 'S',
      rating: 5,
      text: 'Un travail magnifique ! Les portes sculptées sont une véritable œuvre d\'art. ⭐⭐⭐⭐⭐',
      time: 3,
      duration: 4,
      position: 'left',
    },
    {
      id: 2,
      platform: 'facebook',
      name: 'Karim Trabelsi',
      avatar: 'K',
      rating: 5,
      text: '❤️ 47 personnes aiment ça · « Atelier incroyable, résultat au-delà de mes attentes ! »',
      time: 9,
      duration: 4,
      position: 'right',
    },
    {
      id: 3,
      platform: 'google',
      name: 'Fatma M.',
      avatar: 'F',
      rating: 5,
      text: 'Service professionnel, livraison à temps. Notre salon est transformé !',
      time: 16,
      duration: 4,
      position: 'left',
    },
  ]
}

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_DATA, null, 2))
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf8')
    return NextResponse.json(JSON.parse(fileContent))
  } catch (error) {
    console.error('Error reading reel data:', error)
    return NextResponse.json(DEFAULT_DATA)
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving reel data:', error)
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 })
  }
}
