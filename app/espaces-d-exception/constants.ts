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

export const PROJECTS = [
  {
    id: 1,
    title: 'Hôtel Dar El Jeld',
    location: 'Médina de Tunis',
    type: 'hotel',
    image: '/project-hotel.png',
    description: "Aménagement monumental complet de l'établissement de luxe. Portes cochères sculptées en noyer massif, habillages muraux géométriques d'inspiration andalouse, et mobilier de salon d'exception.",
    details: ['Portes monumentales', "Boiseries d'art", 'Salons de réception', 'Luminaires'],
    gallery: ['/project-hotel.png', '/gallery-1.png', '/gallery-2.png', '/porte.png'],
    video: '/Video.mp4',
    review: {
      author: 'M. Habib',
      role: 'Directeur Général, Dar El Jeld',
      rating: 5,
      comment: "L'Atelier Aschi a su capturer l'essence historique de notre hôtel. Les portes sculptées sont devenues de véritables attractions pour nos clients. Un travail d'ébénisterie d'art d'une précision chirurgicale."
    }
  },
  {
    id: 2,
    title: "Maison d'Hôtes Dar Said",
    location: 'Sidi Bou Saïd',
    type: 'guesthouse',
    image: '/project-guesthouse.png',
    description: "Conception sur-mesure d'éléments de mobilier pour les suites de prestige. Lits à baldaquin sculptés, commodes incrustées de laiton poli et cadres de miroirs dorés à la feuille d'or.",
    details: ['Mobilier de chambre', 'Miroirs sculptés', 'Incrustations laiton', 'Consoles'],
    gallery: ['/project-guesthouse.png', '/gallery-3.png', '/gallery-4.png', '/miroir.png'],
    video: '/test-video.mp4',
    review: {
      author: 'Mme Amel',
      role: 'Fondatrice, Dar Said',
      rating: 5,
      comment: "Un raffinement exceptionnel. Le mobilier en olivier et les cadres dorés apportent une chaleur et une authenticité inégalées à nos suites de prestige. La finition est irréprochable."
    }
  },
  {
    id: 3,
    title: 'Villa de Maître Carthage',
    location: 'Carthage',
    type: 'villa',
    image: '/project-villa.png',
    description: "Création intégrale de menuiserie d'art pour une résidence privée de prestige. Portes monumentales extérieures cloutées, plafonds à caissons en noyer et habillages muraux sculptés.",
    details: ['Portes monumentales', 'Plafonds à caissons', 'Moucharabiehs', 'Mobilier de salon'],
    gallery: ['/project-villa.png', '/gallery-1.png', '/creation-unique.png'],
    video: '/Video.mp4',
    review: {
      author: 'Dr. Karoui',
      role: 'Propriétaire',
      rating: 5,
      comment: "L'expertise et la précision de l'Atelier Aschi ont sublimé notre demeure. Chaque détail sculpté reflète la noblesse de l'artisanat tunisien authentique."
    }
  },
  {
    id: 4,
    title: 'Résidence Panorama Marina',
    location: 'Gammarth',
    type: 'immobilier',
    image: '/creation-model.png',
    description: "Conception et fabrication en série sur-mesure pour un programme immobilier de grand standing. Portes palières sculptées, agencements de halls d'entrée et claustras décoratifs.",
    details: ['Portes de standing', "Habillage hall d'accueil", 'Claustras et moucharabiehs', 'Boiseries nobles'],
    gallery: ['/creation-model.png', '/project-hotel.png', '/gallery-2.png'],
    video: '/test-video.mp4',
    review: {
      author: 'M. Ben Salem',
      role: 'Promoteur Immobilier',
      rating: 5,
      comment: "Une capacité de production industrielle alliée à une finition d'ébénisterie d'art artisanale. Respect strict des délais de livraison sur notre chantier."
    }
  },
  {
    id: 5,
    title: "Bureaux Corporate & Restaurant L'Ébène",
    location: 'Les Berges du Lac, Tunis',
    type: 'pro_commercial',
    image: '/project-restaurant.png',
    description: "Aménagement prestigieux de la salle du conseil d'administration et de l'espace restaurant lounge. Table de réunion de 6 mètres en chêne massif et habillage acoustique sculpté.",
    details: ['Table de conférence', "Comptoir de bar d'art", 'Habillages acoustiques', 'Bureaux de direction'],
    gallery: ['/project-restaurant.png', '/gallery-5.png', '/gallery-6.png', '/buffet.png'],
    video: '/test-video.mp4',
    review: {
      author: 'M. Adel',
      role: "CEO, L'Ébène",
      rating: 5,
      comment: "La table de conférence monumentale et le bar sculpté ont transformé notre espace. Le service sur-mesure de l'Atelier Aschi est parfait pour les professionnels."
    }
  }
]
