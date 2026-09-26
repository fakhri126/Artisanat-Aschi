import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DB_URL?.replace('jdbc:', '') ||
  'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'

// Clean up any jdbc prefix or ssl parameters if needed
const cleanUrl = connectionString.replace(/^jdbc:/, '')

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
})

export interface BoardModel {
  id: string
  title: string
  subtitle: string
  category: 'portes' | 'meubles'
  subType: string
  sizeCategory?: 'grand' | 'moyen' | 'ovale' | 'all'
  image: string
  dimensions?: string
  description: string
  idealFor: string
  tags: string[]
}

function mapRowToBoard(row: any): BoardModel {
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    category: row.category as 'portes' | 'meubles',
    subType: row.sub_type || 'ceramique',
    sizeCategory: row.size_category || 'all',
    image: row.image || '',
    dimensions: row.dimensions || '',
    description: row.description || '',
    idealFor: row.ideal_for || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
  }
}

// GET: Récupérer tous les modèles de bijoux de porte / meuble
export async function GET() {
  try {
    const res = await pool.query(`
      SELECT * FROM bijoux_boards
      ORDER BY display_order ASC, created_at ASC
    `)
    const boards = res.rows.map(mapRowToBoard)
    return NextResponse.json(boards)
  } catch (error: any) {
    console.error('Erreur GET /api/bijoux-de-porte:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Ajouter ou modifier un modèle (Upsert)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      title,
      subtitle,
      category,
      subType,
      sizeCategory,
      image,
      dimensions,
      description,
      idealFor,
      tags,
      displayOrder,
    } = body

    if (!id || !title || !image) {
      return NextResponse.json({ error: 'id, title et image sont requis' }, { status: 400 })
    }

    const query = `
      INSERT INTO bijoux_boards (
        id, title, subtitle, category, sub_type, size_category, image, dimensions, description, ideal_for, tags, display_order, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, 0), NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        category = EXCLUDED.category,
        sub_type = EXCLUDED.sub_type,
        size_category = EXCLUDED.size_category,
        image = EXCLUDED.image,
        dimensions = EXCLUDED.dimensions,
        description = EXCLUDED.description,
        ideal_for = EXCLUDED.ideal_for,
        tags = EXCLUDED.tags,
        display_order = EXCLUDED.display_order,
        updated_at = NOW()
      RETURNING *;
    `

    const values = [
      id,
      title,
      subtitle || '',
      category || 'portes',
      subType || 'ceramique',
      sizeCategory || 'all',
      image,
      dimensions || '',
      description || '',
      idealFor || '',
      Array.isArray(tags) ? tags : [],
      displayOrder ?? null,
    ]

    const result = await pool.query(query, values)
    const savedBoard = mapRowToBoard(result.rows[0])
    return NextResponse.json(savedBoard, { status: 200 })
  } catch (error: any) {
    console.error('Erreur POST /api/bijoux-de-porte:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer un modèle par son ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await pool.query('DELETE FROM bijoux_boards WHERE id = $1;', [id])
    return NextResponse.json({ success: true, deletedId: id })
  } catch (error: any) {
    console.error('Erreur DELETE /api/bijoux-de-porte:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
