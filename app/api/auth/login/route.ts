import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DB_URL?.replace(/^jdbc:/, '') ||
  'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'

const pool = new Pool({
  connectionString: connectionString.replace(/^jdbc:/, ''),
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
})

const DEFAULT_JWT_SECRET = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'
const JWT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60 // 7 days (604800s)

/**
 * Génère un JWT signé en HS384 100% compatible avec JwtUtils.java (Spring Boot).
 */
function generateCompatibleJwt(username: string): string {
  const secretBase64 = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
  const keyBytes = Buffer.from(secretBase64, 'base64')

  const nowSeconds = Math.floor(Date.now() / 1000)
  const expSeconds = nowSeconds + JWT_EXPIRATION_SECONDS

  const header = Buffer.from(JSON.stringify({ alg: 'HS384' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      iat: nowSeconds,
      exp: expSeconds,
    })
  ).toString('base64url')

  const signingInput = `${header}.${payload}`
  const signature = crypto.createHmac('sha384', keyBytes).update(signingInput).digest('base64url')

  return `${signingInput}.${signature}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const rawUsername = typeof body?.username === 'string' ? body.username.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!rawUsername || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis", status: 400 },
        { status: 400 }
      )
    }

    let authenticatedAdmin: { username: string; email: string; role: string } | null = null
    let dbChecked = false

    // 1. Vérification directe dans la table `admins` sur Supabase PostgreSQL via pgcrypto
    try {
      const result = await pool.query(
        `SELECT username, email, role,
                (password = extensions.crypt($2, password)) AS is_valid
         FROM admins
         WHERE LOWER(username) = LOWER($1)
         LIMIT 1`,
        [rawUsername, password]
      )
      dbChecked = true

      if (result.rows.length > 0) {
        const row = result.rows[0]
        if (row.is_valid) {
          authenticatedAdmin = {
            username: row.username,
            email: row.email || `${row.username}@artisanat-aschi.com`,
            role: row.role || 'ROLE_ADMIN',
          }
        }
      } else if (
        rawUsername.toLowerCase() === (process.env.ADMIN_DEFAULT_USERNAME || 'admin').toLowerCase() &&
        password === (process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword')
      ) {
        // Si aucun compte admin n'existe encore en base, l'initialiser comme DatabaseSeeder.java
        const defaultEmail = 'admin@artisanat-aschi.com'
        await pool
          .query(
            `INSERT INTO admins (username, password, email, role)
             VALUES ($1, extensions.crypt($2, extensions.gen_salt('bf', 10)), $3, 'ROLE_ADMIN')
             ON CONFLICT (username) DO NOTHING`,
            ['admin', password, defaultEmail]
          )
          .catch(() => {})
        authenticatedAdmin = {
          username: 'admin',
          email: defaultEmail,
          role: 'ROLE_ADMIN',
        }
      }
    } catch (dbErr) {
      console.warn('[Auth API] Fallback suite à erreur connexion DB:', dbErr)
    }

    // 2. Fallback de secours si la base est momentanément injoignable
    if (!dbChecked) {
      const expectedUser = process.env.ADMIN_DEFAULT_USERNAME || 'admin'
      const expectedPass = process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword'
      if (rawUsername.toLowerCase() === expectedUser.toLowerCase() && password === expectedPass) {
        authenticatedAdmin = {
          username: expectedUser,
          email: `${expectedUser}@artisanat-aschi.com`,
          role: 'ROLE_ADMIN',
        }
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json(
        { error: 'Identifiants invalides (nom d’utilisateur ou mot de passe incorrect).', status: 401 },
        { status: 401 }
      )
    }

    // 3. Générer le JWT compatible Spring Boot & Middleware Next.js
    const token = generateCompatibleJwt(authenticatedAdmin.username)

    // Réveiller le backend Render en arrière-plan (non-bloquant) s'il est en veille
    fetch('https://artisanat-aschi-backend.onrender.com/api/public/categories', {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    }).catch(() => {})

    const response = NextResponse.json({
      token,
      username: authenticatedAdmin.username,
      email: authenticatedAdmin.email,
      role: authenticatedAdmin.role,
    })

    // Poser le cookie admin_token côté serveur pour garantir la synchronisation avec middleware.ts
    response.cookies.set('admin_token', token, {
      path: '/',
      maxAge: JWT_EXPIRATION_SECONDS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Doit rester lisible côté client pour la synchro localStorage/cookie
    })

    return response
  } catch (err: any) {
    console.error('[Auth API] Erreur inattendue:', err)
    return NextResponse.json(
      { error: 'Erreur interne lors de la connexion.', status: 500 },
      { status: 500 }
    )
  }
}
