'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, isLoggedIn } from '@/lib/api'
import { Gem, Lock, User, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await adminApi.login({ username, password })
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-walnut text-ivory flex items-center justify-center p-4">
      {/* Overlay decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,44,31,0.5),rgba(20,15,10,0.9))] pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-950/70 border border-gold/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-gold/10 border border-gold/30 rounded-full mb-4">
            <Gem className="size-8 text-gold" />
          </div>
          <h1 className="font-heading text-3xl font-light tracking-wide">Artisanat Aschi</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold font-light">Espace d&apos;Administration</p>
          <div className="mt-4 h-px w-12 bg-gold/20" />
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex gap-3 text-sm text-red-300">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-ivory/60 font-medium">Nom d&apos;utilisateur</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-ivory/40">
                <User className="size-4.5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-walnut/30 border border-gold/10 focus:border-gold/50 rounded-lg py-3 pl-11 pr-4 text-sm text-ivory placeholder-ivory/30 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-ivory/60 font-medium">Mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-ivory/40">
                <Lock className="size-4.5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-walnut/30 border border-gold/10 focus:border-gold/50 rounded-lg py-3 pl-11 pr-4 text-sm text-ivory placeholder-ivory/30 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 rounded-lg bg-gold hover:bg-gold/95 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-walnut transition-all disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-ivory/40 uppercase tracking-widest font-mono">
          Depuis 1960 — Atelier de Sculpture d&apos;Art
        </p>
      </div>
    </div>
  )
}
