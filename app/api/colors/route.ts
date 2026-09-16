import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface ColorItem {
  id: string
  label: string
  hex: string
  isDefault?: boolean
}

const dataFilePath = path.join(process.cwd(), 'public', 'colors-data.json')

const DEFAULT_COLORS: ColorItem[] = [
  { id: 'blanc', label: 'Blanc', hex: '#FFFFFF', isDefault: true },
  { id: 'noir', label: 'Noir', hex: '#1A1A1A', isDefault: true },
  { id: 'noyer', label: 'Noyer', hex: '#5C3317', isDefault: true },
  { id: 'bleu', label: 'Bleu', hex: '#2D5F8A', isDefault: true },
  { id: 'or', label: 'Or', hex: '#C9A84C', isDefault: true },
  { id: 'naturel', label: 'Naturel', hex: '#C4A882', isDefault: true },
  { id: 'vert-olivier', label: 'Vert Olivier', hex: '#4A5E3A', isDefault: true },
  { id: 'bordeaux', label: 'Bordeaux', hex: '#7B2D3E', isDefault: true },
]

function readColors(): ColorItem[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_COLORS, null, 2), 'utf8')
      return DEFAULT_COLORS
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return DEFAULT_COLORS
  } catch (err) {
    console.error('Error reading colors-data.json:', err)
    return DEFAULT_COLORS
  }
}

function writeColors(colors: ColorItem[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(colors, null, 2), 'utf8')
}

// GET: list all colors
export async function GET() {
  const colors = readColors()
  return NextResponse.json(colors)
}

// POST: create a new color
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { label, hex } = body

    if (!label || !hex) {
      return NextResponse.json({ error: 'Libellé et code couleur hexadécimal requis' }, { status: 400 })
    }

    const colors = readColors()
    const slug = label.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    const id = `${slug}-${Date.now().toString().slice(-4)}`

    const newColor: ColorItem = {
      id,
      label: label.trim(),
      hex: hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`,
      isDefault: false
    }

    colors.push(newColor)
    writeColors(colors)

    return NextResponse.json(newColor, { status: 201 })
  } catch (err: any) {
    console.error('Error adding color:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

// PUT: update existing color
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, label, hex } = body

    if (!id || !label || !hex) {
      return NextResponse.json({ error: 'Id, libellé et code hex requis' }, { status: 400 })
    }

    const colors = readColors()
    const index = colors.findIndex(c => c.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Couleur introuvable' }, { status: 404 })
    }

    colors[index] = {
      ...colors[index],
      label: label.trim(),
      hex: hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`
    }

    writeColors(colors)
    return NextResponse.json(colors[index])
  } catch (err: any) {
    console.error('Error updating color:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: delete color by query param or body
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await req.json()
        id = body.id
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Identifiant de couleur requis' }, { status: 400 })
    }

    let colors = readColors()
    const initialLength = colors.length
    colors = colors.filter(c => c.id !== id)

    if (colors.length === initialLength) {
      return NextResponse.json({ error: 'Couleur introuvable' }, { status: 404 })
    }

    writeColors(colors)
    return NextResponse.json({ success: true, remaining: colors.length })
  } catch (err: any) {
    console.error('Error deleting color:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
