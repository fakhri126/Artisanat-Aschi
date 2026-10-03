'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, isLoggedIn } from '@/lib/api'
import { Gem, Lock, User, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('adminpassword')
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
      setError(err.message || 'Identifiants invalides ou serveur Spring Boot injoignable. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A2A21] flex items-center justify-center p-4">
      {/* Overlay decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,44,31,0.5),rgba(20,15,10,0.9))] pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-950/70 border border-[#E8DCCB]/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-[#E8DCCB]/10 border border-[#E8DCCB]/30 rounded-full mb-4">
            <Gem className="size-8 text-[#C17D59]" />
          </div>
          <h1 className="font-heading text-3xl font-light tracking-wide">Artisanat Aschi</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#C17D59] font-light">Espace d&apos;Administration</p>
          <div className="mt-4 h-px w-12 bg-[#E8DCCB]/20" />
        </div>

        {/* Credentials Helper Badge */}
        <div className="mt-6 p-3 rounded-xl bg-[#E8DCCB]/10 border border-[#E8DCCB]/20 text-xs text-[#FAF7F2]/90 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[#C17D59] font-bold">Identifiants pré-remplis</p>
            <p className="font-mono text-xs">admin <span className="text-[#FAF7F2]/40">/</span> adminpassword</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername('ismail')
              setPassword('adminpassword')
            }}
            className="text-[10px] bg-[#E8DCCB]/20 hover:bg-[#E8DCCB]/30 text-[#FAF7F2] px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer"
          >
            Rétablir
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex gap-3 text-sm text-red-300">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#3A2A21]/60 font-medium">Nom d&apos;utilisateur</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A2A21]/40">
                <User className="size-4.5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAF7F2]/30 border border-[#E8DCCB]/10 focus:border-[#E8DCCB]/50 rounded-lg py-3 pl-11 pr-4 text-sm text-[#3A2A21] placeholder-ivory/30 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#3A2A21]/60 font-medium">Mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A2A21]/40">
                <Lock className="size-4.5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF7F2]/30 border border-[#E8DCCB]/10 focus:border-[#E8DCCB]/50 rounded-lg py-3 pl-11 pr-4 text-sm text-[#3A2A21] placeholder-ivory/30 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-lg bg-[#E8DCCB] hover:bg-[#E8DCCB]/95 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-walnut transition-all disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-[#E8DCCB]/20"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter (Admin)'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-[#3A2A21]/40 uppercase tracking-widest font-mono">
          Depuis 1960 — Atelier de Sculpture d&apos;Art
        </p>
      </div>
    </div>
  )
}
