'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProjectsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/espaces-d-exception')
  }, [router])

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#B89555] border-t-transparent"></div>
        <p className="text-xs text-[#D9C8AE]/70 font-light uppercase tracking-widest">
          Redirection vers Projets clés en main...
        </p>
      </div>
    </div>
  )
}
