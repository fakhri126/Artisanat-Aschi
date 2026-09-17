'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomCreationPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/contact')
  }, [router])

  return (
    <div className="min-h-screen bg-[#241812] flex items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-[#E6A635] border-t-transparent" />
    </div>
  )
}

