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

export interface ProjectSeed {
  id: number
  title: string
  description: string
  category: string
  location: string
  details: string
  imageUrl: string
  videoUrl?: string
}

export const AUTHENTIC_PROJECTS: ProjectSeed[] = [
  {
    id: 14,
    title: "Ministère des Affaires Étrangères",
    description: "Agencement protocolaire des salons d'honneur et salles de conférences diplomatiques : portes d'apparat sculptées et tables de réunion monumentales.",
    category: "pro_commercial",
    location: "Tunis",
    details: "Salons d'honneur officiels, Portes d'apparat sculptées, Tables de réunion sur-mesure",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790322788691-IMG_20240726_120052.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790322820477-IMG_20240722_142600.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790322841698-IMG_20240722_141903.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790322907877-IMG_20240722_144616.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790322949720-IMG_20240805_135713.jpg",
    videoUrl: "/uploads/1790323039663-lv_0_20260922171936.mp4"
  },
  {
    id: 5,
    title: "Villa de Maître Carthage",
    description: "Menuiserie d'art et portes monumentales extérieures sculptées en bois noble pour une somptueuse demeure de style arabo-andalou.",
    category: "villa",
    location: "Carthage, Tunis",
    details: "Portes monumentales en noyer massif, Plafonds à caissons traditionnels, Moucharabiehs d'art",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789988672234-Capture_d__cran_2026-09-21_120344.png",
    videoUrl: "/uploads/1788412722399-villacarthage.mp4"
  },
  {
    id: 6,
    title: "Villa Résidentielle La Soukra",
    description: "Conception et pose sur-mesure d'habillages muraux en bois massif, comptoir de salon sculpté et portes intérieures artisanales.",
    category: "villa",
    location: "La Soukra, Tunis",
    details: "Boiseries murales, Portes intérieures sculptées en noyer, Salons de réception",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789913226687-villa_soukra.png",
    videoUrl: "/uploads/1788370150280-villasoukra.mp4"
  },
  {
    id: 9,
    title: "Hôtel & Spa El Menara",
    description: "Aménagement d'exception du grand hall d'accueil : plafonds monumentaux à caissons, miroiterie d'art et boiseries murales d'apparat.",
    category: "hotel",
    location: "Sidi Bou Said",
    details: "Plafonds à caissons sculptés, Boiseries d'accueil, Miroirs d'apparat majolique",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/84599123-a85c-47c7-b794-f9e5b8323ea3.png",
    videoUrl: "/uploads/0ca5bec6-900a-4232-b65c-81658df964f2.mp4"
  },
  {
    id: 11,
    title: "Maison d'Hôtes Diar Ali",
    description: "Fabrication artisanale de menuiseries djerbiennes traditionnelles : portes d'entrée cloutées en bois massif, alcôves et fenêtres sculptées.",
    category: "guesthouse",
    location: "Djerba",
    details: "Portes traditionnelles cloutées, Menuiserie d'art djerbienne, Alcôves et volets sculptés",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789912567876-Capture_d__cran_2026-09-20_145520.png",
    videoUrl: "/uploads/1789912103615-lv_0_20260904092720.mp4"
  },
  {
    id: 15,
    title: "Demeure Privée Mhamdia",
    description: "Conception d'un claustra monumental ajouré et laqué blanc, boiseries murales et portes intérieures artisanales sur-mesure.",
    category: "villa",
    location: "Mhamdia, Tunis",
    details: "Claustra monumental sculpté, Boiseries murales laquées, Portes intérieures sur-mesure",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790415810992-IMG_20241226_135610.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790416018105-IMG-20240703-WA0006.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790416056444-IMG_20241226_134702.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790416075651-IMG_20241226_135341.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1790416098107-IMG_20241226_135707.jpg",
    videoUrl: "/uploads/1790416203249-lv_0_20260918163259.mp4"
  },
  {
    id: 13,
    title: "Siège AFI – Agence Foncière Industrielle",
    description: "Agencement complet des espaces de direction : portes acoustiques plaquées bois noble, comptoirs d'accueil monumentaux et bureaux de prestige.",
    category: "pro_commercial",
    location: "Montplaisir, Tunis",
    details: "Portes de bureaux de direction, Habillage mural acoustique, Comptoir d'accueil sur-mesure",
    imageUrl: "https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789921862597-afi.png,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789985983070-IMG_20260413_110154.jpg,https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1789986019270-IMG_20251217_191434.jpg",
    videoUrl: "/uploads/1789913768743-lv_0_20260910130311.mp4"
  }
]


