import {
  Sparkles,
  Building2,
  Hotel,
  Home,
  Briefcase
} from 'lucide-react'

export const FILTER_TYPES = [
  { id: 'all', label: 'Tous les espaces', icon: Sparkles },
  { id: 'immobilier', label: 'Projets Immobiliers', icon: Building2 },
  { id: 'hotel', label: 'Hôtels & Palaces', icon: Hotel },
  { id: 'guesthouse', label: "Maisons d'Hôtes", icon: Sparkles },
  { id: 'villa', label: 'Villas & Résidences Privées', icon: Home },
  { id: 'pro_commercial', label: 'Espaces Professionnels & Commerciaux', icon: Briefcase }
]

export function normalizeCategory(cat?: string): string {
  if (!cat) return 'autre'
  const c = cat.toLowerCase()
  if (c.includes('hotel') || c.includes('palace') || c.includes('hôtel')) return 'hotel'
  if (c.includes('guest') || c.includes('hôte') || c.includes('riad') || c.includes('lodge')) return 'guesthouse'
  if (c.includes('villa') || c.includes('demeure') || c.includes('résidence privée') || c.includes('residence privee')) return 'villa'
  if (c.includes('immo') || c.includes('promoteur') || c.includes('résidence') || c.includes('batiment')) return 'immobilier'
  if (c.includes('pro') || c.includes('bureau') || c.includes('commercial') || c.includes('restaurant') || c.includes('lounge') || c.includes('showroom')) return 'pro_commercial'
  return 'autre'
}


