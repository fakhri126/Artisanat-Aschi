'use client'

import {
  publicApi,
  seedPublicApiCache,
  Product,
  Project,
  News,
  Delivery,
  Relooking,
} from '@/lib/api'
import { AUTHENTIC_PROJECTS } from '@/app/espaces-d-exception/constants'
import { isBijouxOrHandleProduct } from '@/lib/utils'
import {
  finalizeLaunchReport,
  nowMs,
  recordLaunchRequest,
} from '@/lib/launch-metrics'

export const HOME_SNAPSHOT_STORAGE_KEY = 'aschi_home_screen_snapshot_v1'

export interface SiteVideoSectionData {
  videoUrl: string
  badge?: string
  title: string
  subtitle?: string
  description: string
  poster?: string
}

export interface SiteVideosSnapshot {
  media: SiteVideoSectionData
  temoignage: SiteVideoSectionData
  savoir_faire: SiteVideoSectionData
}

export interface HomeScreenSnapshot {
  version: number
  updatedAt: number
  source: 'seed' | 'cache' | 'network'
  latestProduct: Product
  products: Product[]
  projects: Project[]
  news: News[]
  deliveries: Delivery[]
  relookings: Relooking[]
  videos: SiteVideosSnapshot
}

export const DEFAULT_HERO_PRODUCT: Product = {
  id: 0,
  name: "Buffet d'Apparat Andalou",
  description:
    'Découvrez la toute dernière pièce unique façonnée à la main par nos maîtres ébénistes.',
  dimensions: '180 x 90 x 45 cm',
  materials: 'Noyer massif & Laiton',
  color: 'Noyer & Bleu',
  price: null,
  availability: 'DISPONIBLE',
  type: 'PIECE_UNIQUE',
  isFeatured: true,
  category: { id: 1, name: 'Buffets', type: 'CREATION' },
  images: [
    {
      id: 1,
      imageUrl: '/images/bg-brass-cabinet-catalogue.jpg',
      isPrimary: true,
      colorLabel: 'Original',
    },
  ],
}

export const FALLBACK_DELIVERIES: Delivery[] = [
  {
    id: 999,
    title: "Livraison d'une table basse sculptée à La Marsa",
    description:
      "Installation chez un particulier d'une pièce façonnée sur-mesure en noyer massif sélectionné.",
    imageUrl:
      'https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1791095826710-IMG_20230930_092350.webp',
    deliveryDate: '2026-10-04',
    location: 'La Marsa, Tunis',
  },
  {
    id: 998,
    title: "Buffet d'Apparat & Majoliques d'Art",
    description:
      "Aménagement d'une demeure de prestige avec ferrures ciselées et finition satinée.",
    imageUrl:
      'https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1791190855330-file_0000000090d4821087a427259211ad97.webp',
    deliveryDate: '2026-10-05',
    location: 'Carthage, Tunis',
  },
]

export const FALLBACK_NEWS: News[] = [
  {
    id: -1,
    title: "Nouvelle Création : Buffet d'Apparat Andalou",
    content:
      "Découvrez la toute dernière pièce unique façonnée à la main par nos maîtres ébénistes.\n\n📍 Cette pièce d'art est actuellement visible dans notre atelier.\n📏 Dimensions : 180 x 90 x 45 cm\n🔨 Matériaux : Noyer massif & Laiton\n\nUne fusion parfaite entre l'héritage artisanal tunisien et le design contemporain.",
    imageUrl: '/images/bg-brass-cabinet-catalogue.jpg',
    createdDate: '2026-10-01T10:00:00.000Z',
  },
]

export const FALLBACK_RELOOKINGS: Relooking[] = [
  {
    id: 6,
    title: 'Banc Traditionnel Restauré en Blanc Patiné & Incrustations de Jelliz',
    description:
      'Redonnez une seconde vie à votre intérieur avec ce banc artisanal en bois massif entièrement rénové. Sublimé par une finition blanc vieilli à effet patiné, il intègre des détails sculptés raffinés et des carreaux de zellige traditionnels.',
    category: "Mobilier d'Art",
    imageAvantUrl: '/images/relooking/banc-avant.jpg',
    imageApresUrl: '/images/relooking/banc-apres.jpg',
    createdDate: '2026-09-27T16:10:55.371848',
  },
]

export const DEFAULT_SITE_VIDEOS: SiteVideosSnapshot = {
  temoignage: {
    videoUrl: '/uploads/1791058503119-WhatsApp_Video_2026-10-03_at_06.20.12.mp4',
    badge: "Témoignage & Gestes d'Atelier",
    title: "L'Expérience Aschi en Vidéo",
    subtitle: "Atelier Familial & Réalisations d'Exception",
    description:
      "Découvrez en vidéo la passion de nos maîtres ébénistes, la noblesse du travail du noyer massif et la satisfaction de nos clients d'exception.",
  },
  savoir_faire: {
    videoUrl: '/uploads/1790852145325-lv_0_20260921162458.mp4',
    title: "Savoir-Faire & Gestes d'Atelier",
    subtitle: 'Sculpture sur Noyer Massif & Ébénisterie Ancestrale',
    description:
      "Immersion au cœur de notre atelier familial fondé en 1960. Découvrez le geste précis du maître artisan, le choix des essences nobles de noyer et le façonnage traditionnel des ferrures et majoliques d'art.",
    poster: '/images/about-atelier-stand.jpg',
  },
  media: {
    videoUrl: '/video-media-aschi.mp4',
    badge: 'Passage Média & Télévision',
    title: "L'Artisanat Aschi à l'Écran",
    subtitle: 'Reportage Télévisé Intégral • Format Source 100% Sans Recadrage',
    description:
      'Plongez dans les coulisses de notre atelier familial à travers ce reportage télévisé dédié à la haute sculpture sur noyer et la sauvegarde de nos arts traditionnels.',
  },
}

export const SEED_HOME_SNAPSHOT: HomeScreenSnapshot = {
  version: 1,
  updatedAt: 0,
  source: 'seed',
  latestProduct: DEFAULT_HERO_PRODUCT,
  products: [DEFAULT_HERO_PRODUCT],
  projects: AUTHENTIC_PROJECTS as unknown as Project[],
  news: FALLBACK_NEWS,
  deliveries: FALLBACK_DELIVERIES,
  relookings: FALLBACK_RELOOKINGS,
  videos: DEFAULT_SITE_VIDEOS,
}

export function extractLatestAvailableProduct(products: Product[]): Product | null {
  if (!Array.isArray(products) || products.length === 0) return null
  const availableProds = products.filter(
    p => p.type !== 'CATALOGUE' && !isBijouxOrHandleProduct(p)
  )
  if (availableProds.length === 0) return null

  const sorted = [...availableProds].sort((a, b) => {
    const timeB = new Date(b.createdAt || (b as any).createdDate || 0).getTime()
    const timeA = new Date(a.createdAt || (a as any).createdDate || 0).getTime()
    if (timeB && timeA && timeB !== timeA) {
      return timeB - timeA
    }
    return b.id - a.id
  })
  return sorted[0] || null
}

export function composeHomeNews(
  rawNews: News[] | null | undefined,
  latestProduct: Product | null | undefined
): News[] {
  const sortedNews: News[] = Array.isArray(rawNews)
    ? [...rawNews]
        .filter(n => n && n.id > 0)
        .sort(
          (a, b) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        )
    : []

  if (latestProduct && latestProduct.id > 0) {
    const productNews: News = {
      id: -latestProduct.id,
      title: `Nouvelle Création : ${latestProduct.name}`,
      content: `${latestProduct.description}\n\n📍 Cette pièce d'art est actuellement visible dans notre atelier.\n📏 Dimensions : ${latestProduct.dimensions || 'Sur-mesure'}\n🔨 Matériaux : ${latestProduct.materials || 'Bois noble massif'}\n\nUne fusion parfaite entre l'héritage artisanal tunisien et le design contemporain.`,
      imageUrl:
        latestProduct.images?.find(img => img.isPrimary)?.imageUrl ||
        latestProduct.images?.[0]?.imageUrl ||
        '/placeholder.jpg',
      createdDate:
        latestProduct.createdAt ||
        (latestProduct as any).createdDate ||
        new Date().toISOString(),
    }
    return [productNews, ...sortedNews]
  }

  return sortedNews.length > 0 ? sortedNews : FALLBACK_NEWS
}

let inMemorySnapshot: HomeScreenSnapshot | null = null

/**
 * Synchronously reads the cached Home-Screen Snapshot from memory or localStorage
 * so the home screen can display 100% instantly (0ms network wait) on launch.
 */
export function readCachedHomeSnapshot(): {
  snapshot: HomeScreenSnapshot
  isCacheHit: boolean
  ageMs: number | null
} {
  const start = nowMs()

  if (inMemorySnapshot && inMemorySnapshot.source !== 'seed') {
    const end = nowMs()
    const ageMs = Date.now() - inMemorySnapshot.updatedAt
    recordLaunchRequest({
      endpoint: 'localStorage://home-snapshot',
      initiator: 'HomeSnapshot:memory',
      startTimeMs: start,
      endTimeMs: end,
      durationMs: end - start,
      source: 'snapshot-cache',
      status: 'ok',
      parallelGroup: false,
    })
    return {
      snapshot: inMemorySnapshot,
      isCacheHit: true,
      ageMs,
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(HOME_SNAPSHOT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<HomeScreenSnapshot>
        if (parsed && parsed.version === 1) {
          const hydrated: HomeScreenSnapshot = {
            version: 1,
            updatedAt: parsed.updatedAt || Date.now(),
            source: 'cache',
            latestProduct: parsed.latestProduct || DEFAULT_HERO_PRODUCT,
            products:
              Array.isArray(parsed.products) && parsed.products.length > 0
                ? parsed.products
                : [parsed.latestProduct || DEFAULT_HERO_PRODUCT],
            projects:
              Array.isArray(parsed.projects) && parsed.projects.length > 0
                ? parsed.projects
                : (AUTHENTIC_PROJECTS as unknown as Project[]),
            news:
              Array.isArray(parsed.news) && parsed.news.length > 0
                ? parsed.news
                : FALLBACK_NEWS,
            deliveries:
              Array.isArray(parsed.deliveries) && parsed.deliveries.length > 0
                ? parsed.deliveries
                : FALLBACK_DELIVERIES,
            relookings:
              Array.isArray(parsed.relookings) && parsed.relookings.length > 0
                ? parsed.relookings
                : FALLBACK_RELOOKINGS,
            videos: {
              media: {
                ...DEFAULT_SITE_VIDEOS.media,
                ...(parsed.videos?.media || {}),
              },
              temoignage: {
                ...DEFAULT_SITE_VIDEOS.temoignage,
                ...(parsed.videos?.temoignage || {}),
              },
              savoir_faire: {
                ...DEFAULT_SITE_VIDEOS.savoir_faire,
                ...(parsed.videos?.savoir_faire || {}),
              },
            },
          }

          inMemorySnapshot = hydrated

          const end = nowMs()
          const ageMs = Date.now() - hydrated.updatedAt
          recordLaunchRequest({
            endpoint: 'localStorage://home-snapshot',
            initiator: 'HomeSnapshot:localStorage',
            startTimeMs: start,
            endTimeMs: end,
            durationMs: end - start,
            source: 'snapshot-cache',
            status: 'ok',
            parallelGroup: false,
          })

          return {
            snapshot: hydrated,
            isCacheHit: true,
            ageMs,
          }
        }
      }

      // Check legacy single-product cache if snapshot v1 not yet written
      const legacyProductRaw = localStorage.getItem('aschi_latest_available_product')
      if (legacyProductRaw) {
        const legacyProd = JSON.parse(legacyProductRaw) as Product
        if (legacyProd && legacyProd.id && legacyProd.name) {
          const migrated: HomeScreenSnapshot = {
            ...SEED_HOME_SNAPSHOT,
            updatedAt: Date.now(),
            source: 'cache',
            latestProduct: legacyProd,
            products: [legacyProd],
            news: composeHomeNews([], legacyProd),
          }
          inMemorySnapshot = migrated
          return {
            snapshot: migrated,
            isCacheHit: true,
            ageMs: 0,
          }
        }
      }
    } catch (_) {}
  }

  return {
    snapshot: SEED_HOME_SNAPSHOT,
    isCacheHit: false,
    ageMs: null,
  }
}

export function writeCachedHomeSnapshot(snapshot: HomeScreenSnapshot): void {
  inMemorySnapshot = snapshot
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HOME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot))
    if (snapshot.latestProduct && snapshot.latestProduct.id > 0) {
      localStorage.setItem(
        'aschi_latest_available_product',
        JSON.stringify(snapshot.latestProduct)
      )
    }
  } catch (e) {
    console.warn('Unable to persist home snapshot in localStorage:', e)
  }
}

/**
 * Runs all independent home-screen requests in parallel in the background,
 * incrementally updating the snapshot as fast responses arrive and saving the
 * final snapshot to localStorage.
 */
export async function refreshHomeSnapshotInParallel(
  baseSnapshot: HomeScreenSnapshot,
  onSnapshotUpdate: (next: HomeScreenSnapshot) => void,
  telemetryMeta: {
    snapshotHit: boolean
    snapshotAgeMs: number | null
    instantRenderMs: number
  }
): Promise<HomeScreenSnapshot> {
  const parallelStart = nowMs()
  let working: HomeScreenSnapshot = {
    ...baseSnapshot,
    source: 'network',
  }

  let rawNewsItems: News[] | null = null
  let latestAvailProd: Product | null =
    working.latestProduct?.id > 0 ? working.latestProduct : null

  const emitIncremental = () => {
    working = {
      ...working,
      updatedAt: Date.now(),
      source: 'network',
    }
    inMemorySnapshot = working
    onSnapshotUpdate(working)
  }

  // Launch ALL 6 independent home-screen requests in parallel!
  const productsTask = publicApi
    .getProducts()
    .then(products => {
      if (Array.isArray(products) && products.length > 0) {
        const newest = extractLatestAvailableProduct(products)
        latestAvailProd = newest || DEFAULT_HERO_PRODUCT
        working = {
          ...working,
          products,
          latestProduct: latestAvailProd,
          news: composeHomeNews(rawNewsItems ?? working.news, latestAvailProd),
        }
        seedPublicApiCache('/public/products', products)
        emitIncremental()
      }
      return products
    })
    .catch(() => null)

  const projectsTask = publicApi
    .getProjects()
    .then(projects => {
      if (Array.isArray(projects) && projects.length > 0) {
        working = {
          ...working,
          projects,
        }
        seedPublicApiCache('/public/projects', projects)
        emitIncremental()
      }
      return projects
    })
    .catch(() => null)

  const newsTask = publicApi
    .getNews()
    .then(newsList => {
      if (Array.isArray(newsList)) {
        rawNewsItems = newsList
        working = {
          ...working,
          news: composeHomeNews(rawNewsItems, latestAvailProd),
        }
        seedPublicApiCache('/public/news', newsList)
        emitIncremental()
      }
      return newsList
    })
    .catch(() => null)

  const deliveriesTask = publicApi
    .getDeliveries()
    .then(deliveries => {
      if (Array.isArray(deliveries) && deliveries.length > 0) {
        const sorted = [...deliveries].sort((a, b) => b.id - a.id)
        working = {
          ...working,
          deliveries: sorted,
        }
        seedPublicApiCache('/public/deliveries', sorted)
        emitIncremental()
      }
      return deliveries
    })
    .catch(() => null)

  const relookingsTask = publicApi
    .getRelookings()
    .then(relookings => {
      if (Array.isArray(relookings) && relookings.length > 0) {
        working = {
          ...working,
          relookings,
        }
        seedPublicApiCache('/public/relookings', relookings)
        emitIncremental()
      }
      return relookings
    })
    .catch(() => null)

  const videosTask = publicApi
    .getVideos()
    .then(videoData => {
      if (videoData && typeof videoData === 'object') {
        working = {
          ...working,
          videos: {
            media: {
              ...working.videos.media,
              ...(videoData.media || {}),
            },
            temoignage: {
              ...working.videos.temoignage,
              ...(videoData.temoignage || {}),
              ...(videoData.videoUrl ? { videoUrl: videoData.videoUrl } : {}),
            },
            savoir_faire: {
              ...working.videos.savoir_faire,
              ...(videoData.savoir_faire || {}),
            },
          },
        }
        seedPublicApiCache('/api/videos', videoData)
        emitIncremental()
      }
      return videoData
    })
    .catch(() => null)

  await Promise.allSettled([
    productsTask,
    projectsTask,
    newsTask,
    deliveriesTask,
    relookingsTask,
    videosTask,
  ])

  const parallelEnd = nowMs()
  const finalSnapshot: HomeScreenSnapshot = {
    ...working,
    updatedAt: Date.now(),
    source: 'network',
  }

  writeCachedHomeSnapshot(finalSnapshot)
  onSnapshotUpdate(finalSnapshot)

  finalizeLaunchReport({
    snapshotHit: telemetryMeta.snapshotHit,
    snapshotAgeMs: telemetryMeta.snapshotAgeMs,
    instantRenderMs: telemetryMeta.instantRenderMs,
    backgroundRefreshWallMs: parallelEnd - parallelStart,
  })

  return finalSnapshot
}
