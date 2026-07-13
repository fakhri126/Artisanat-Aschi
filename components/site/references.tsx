'use client'

import { useState, useEffect } from 'react'
import { Reveal } from './reveal'
import { publicApi, Reference } from '@/lib/api'

const MOCK_CLIENTS = [
  'Dar El Medina',
  'Villa Carthage',
  'Hôtel La Badira',
  'Résidence Gammarth',
  'Le Golfe Royal',
  'Sidi Bou Palace',
  'Dar Hammamet',
  'Maison Sophonisbe',
  'Résidence Les Oliviers',
  'Château Bleu',
  'Riad El Jasmin',
  'Domaine Sidi Slim',
]

export function References() {
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReferences() {
      try {
        const data = await publicApi.getReferences()
        setReferences(data)
      } catch (err) {
        console.error('Error fetching references from API, using fallback data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadReferences()
  }, [])

  const displayClients = references.length > 0
    ? references.map(ref => ref.name)
    : MOCK_CLIENTS

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-luxury text-bronze">
            Ils nous ont fait confiance
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-heading text-3xl font-light leading-tight text-foreground sm:text-4xl md:text-5xl">
            Des références prestigieuses à travers la Tunisie
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {displayClients.map((client) => (
              <div
                key={client}
                className="group flex min-h-[7rem] items-center justify-center bg-background px-6 text-center transition-colors duration-300 hover:bg-secondary"
              >
                <span className="font-heading text-xl font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground sm:text-2xl">
                  {client}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
