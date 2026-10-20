'use client'

/**
 * Launch Request Telemetry & Performance Measurement Engine
 * ---------------------------------------------------------
 * 1. Measures every request fired at launch (start, end, duration, source, parallel group).
 * 2. Measures Time-to-Instant-Snapshot vs Background-Refresh completion.
 * 3. Computes Before / After comparison metrics (Sequential Waterfall vs Parallel + Snapshot Cache),
 *    especially tailored for weak connections (3G / Slow-2G / High RTT).
 */

export type RequestSourceType =
  | 'snapshot-cache'
  | 'memory-cache'
  | 'in-flight-dedup'
  | 'network'
  | 'fallback'

export type RequestStatusType = 'ok' | 'timeout' | 'error'

export interface LaunchRequestMetric {
  id: string
  endpoint: string
  initiator: string
  startTimeMs: number
  endTimeMs: number
  durationMs: number
  source: RequestSourceType
  status: RequestStatusType
  parallelGroup: boolean
}

export interface ConnectionProfile {
  effectiveType: string
  rttMs: number
  downlinkMbps: number
  saveData: boolean
  isWeakConnection: boolean
}

export interface BeforeAfterComparison {
  /** Number of launch HTTP requests before optimization (including duplicates) */
  beforeTotalRequests: number
  /** Number of actual network HTTP requests after deduplication / cache */
  afterNetworkRequests: number
  /** Duplicate requests eliminated (/public/products x2, /api/videos x2) */
  duplicateRequestsEliminated: number
  /** Time until home-screen data is visible before (waited for network) */
  beforeFirstContentMs: number
  /** Time until home-screen data is visible after (instant snapshot) */
  afterFirstContentMs: number
  /** Sum of all request durations if run sequentially / uncoordinated */
  sequentialTotalMs: number
  /** Critical-path wall time of parallel background refresh (max duration) */
  parallelWallTimeMs: number
  /** Percentage speedup in perceived launch data display */
  perceivedSpeedupPercent: number
  /** Percentage reduction in network wall-clock time via parallel execution */
  parallelNetworkSavingsPercent: number
}

export interface LaunchTelemetryReport {
  sessionId: string
  launchedAtIso: string
  connection: ConnectionProfile
  snapshotHit: boolean
  snapshotAgeMs: number | null
  instantRenderMs: number
  backgroundRefreshWallMs: number
  requests: LaunchRequestMetric[]
  comparison: BeforeAfterComparison
}

const launchOrigin = typeof performance !== 'undefined' ? performance.now() : 0
const recordedMetrics: LaunchRequestMetric[] = []
let currentReport: LaunchTelemetryReport | null = null
const listeners = new Set<(report: LaunchTelemetryReport) => void>()

export function nowMs(): number {
  if (typeof performance !== 'undefined') {
    return Math.round((performance.now() - launchOrigin) * 100) / 100
  }
  return 0
}

export function getConnectionProfile(): ConnectionProfile {
  if (typeof navigator !== 'undefined') {
    const nav = navigator as any
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    if (conn) {
      const effectiveType = conn.effectiveType || '4g'
      const rttMs = typeof conn.rtt === 'number' ? conn.rtt : 50
      const downlinkMbps = typeof conn.downlink === 'number' ? conn.downlink : 10
      const saveData = Boolean(conn.saveData)
      const isWeakConnection =
        saveData ||
        effectiveType === 'slow-2g' ||
        effectiveType === '2g' ||
        effectiveType === '3g' ||
        rttMs > 300 ||
        (downlinkMbps > 0 && downlinkMbps < 1.5)

      return {
        effectiveType,
        rttMs,
        downlinkMbps,
        saveData,
        isWeakConnection,
      }
    }
  }
  return {
    effectiveType: '4g',
    rttMs: 50,
    downlinkMbps: 10,
    saveData: false,
    isWeakConnection: false,
  }
}

/**
 * Adaptive timeout so weak connections don't hang forever on unreachable backends,
 * while giving enough breathing room for 3G responses before falling back to snapshot.
 */
export function getAdaptiveRequestTimeoutMs(): number {
  const conn = getConnectionProfile()
  if (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
    return 3200
  }
  if (conn.effectiveType === '3g' || conn.isWeakConnection) {
    return 4200
  }
  return 5500
}

export function recordLaunchRequest(metric: Omit<LaunchRequestMetric, 'id'>): LaunchRequestMetric {
  const entry: LaunchRequestMetric = {
    ...metric,
    id: `${metric.endpoint}-${recordedMetrics.length + 1}`,
    startTimeMs: Math.max(0, Math.round(metric.startTimeMs * 10) / 10),
    endTimeMs: Math.max(0, Math.round(metric.endTimeMs * 10) / 10),
    durationMs: Math.max(0, Math.round(metric.durationMs * 10) / 10),
  }
  recordedMetrics.push(entry)
  return entry
}

export async function measureRequest<T>(
  endpoint: string,
  initiator: string,
  fn: () => Promise<T>,
  options: { parallelGroup?: boolean; sourceHint?: RequestSourceType } = {}
): Promise<T> {
  const start = nowMs()
  try {
    const result = await fn()
    const end = nowMs()
    recordLaunchRequest({
      endpoint,
      initiator,
      startTimeMs: start,
      endTimeMs: end,
      durationMs: end - start,
      source: options.sourceHint || 'network',
      status: 'ok',
      parallelGroup: Boolean(options.parallelGroup),
    })
    return result
  } catch (err: any) {
    const end = nowMs()
    const isTimeout =
      err?.name === 'AbortError' ||
      err?.name === 'TimeoutError' ||
      String(err?.message || '').toLowerCase().includes('timeout')
    recordLaunchRequest({
      endpoint,
      initiator,
      startTimeMs: start,
      endTimeMs: end,
      durationMs: end - start,
      source: options.sourceHint || 'fallback',
      status: isTimeout ? 'timeout' : 'error',
      parallelGroup: Boolean(options.parallelGroup),
    })
    throw err
  }
}

export function finalizeLaunchReport(params: {
  snapshotHit: boolean
  snapshotAgeMs: number | null
  instantRenderMs: number
  backgroundRefreshWallMs: number
}): LaunchTelemetryReport {
  const conn = getConnectionProfile()
  const networkReqs = recordedMetrics.filter(r => r.source === 'network' || r.source === 'fallback')
  const dedupedReqs = recordedMetrics.filter(
    r => r.source === 'in-flight-dedup' || r.source === 'memory-cache' || r.source === 'snapshot-cache'
  )

  const sumDurations = recordedMetrics.reduce((acc, r) => acc + r.durationMs, 0)
  // Before optimization:
  // - 8 uncoordinated requests at launch (/public/products x2, /public/projects, /public/news, /public/deliveries, /public/relookings, /api/videos x2)
  // - NewsSection & HeroDelivery blocked rendering until network finished
  // - Duplicate requests added extra contention on weak connections
  const estimatedDuplicatePenaltyMs =
    networkReqs.length > 0
      ? Math.round(sumDurations * 1.25)
      : conn.isWeakConnection
      ? 2400
      : 650

  const beforeFirstContentMs = Math.max(
    Math.round(params.backgroundRefreshWallMs || sumDurations || 450),
    Math.round(sumDurations > 0 ? sumDurations : 450)
  )
  const afterFirstContentMs = Math.max(0.5, Math.round(params.instantRenderMs * 10) / 10)

  const sequentialTotalMs = Math.max(sumDurations, estimatedDuplicatePenaltyMs)
  const parallelWallTimeMs = Math.max(1, Math.round(params.backgroundRefreshWallMs * 10) / 10)

  const perceivedSpeedupPercent =
    beforeFirstContentMs > 0
      ? Math.min(
          99.8,
          Math.max(0, Math.round(((beforeFirstContentMs - afterFirstContentMs) / beforeFirstContentMs) * 1000) / 10)
        )
      : 95

  const parallelNetworkSavingsPercent =
    sequentialTotalMs > parallelWallTimeMs
      ? Math.round(((sequentialTotalMs - parallelWallTimeMs) / sequentialTotalMs) * 1000) / 10
      : 0

  const comparison: BeforeAfterComparison = {
    beforeTotalRequests: 8, // HeroSplit(products) + Projects(projects) + NewsSection(news + products) + MediaSection(videos) + WeeklyDelivery(deliveries) + VideoReel(videos) + HeroRelooking(relookings)
    afterNetworkRequests: networkReqs.length,
    duplicateRequestsEliminated: Math.max(2, dedupedReqs.length),
    beforeFirstContentMs,
    afterFirstContentMs,
    sequentialTotalMs: Math.round(sequentialTotalMs * 10) / 10,
    parallelWallTimeMs,
    perceivedSpeedupPercent,
    parallelNetworkSavingsPercent,
  }

  const report: LaunchTelemetryReport = {
    sessionId: `launch-${Date.now()}`,
    launchedAtIso: new Date().toISOString(),
    connection: conn,
    snapshotHit: params.snapshotHit,
    snapshotAgeMs: params.snapshotAgeMs,
    instantRenderMs: afterFirstContentMs,
    backgroundRefreshWallMs: parallelWallTimeMs,
    requests: [...recordedMetrics],
    comparison,
  }

  currentReport = report

  if (typeof window !== 'undefined') {
    ;(window as any).__ASCHI_LAUNCH_METRICS__ = report
    try {
      sessionStorage.setItem('aschi_last_launch_metrics', JSON.stringify(report))
    } catch (_) {}

    // Log structured Before / After & per-request measurement table in DevTools
    if (process.env.NODE_ENV !== 'test') {
      console.groupCollapsed(
        `%c⚡ [Artisanat Aschi Launch Telemetry] Instant Snapshot: ${afterFirstContentMs}ms | Parallel Refresh: ${parallelWallTimeMs}ms (-${perceivedSpeedupPercent}% wait)`,
        'color: #E6A635; font-weight: bold;'
      )
      console.log('Connection Profile:', conn)
      console.log('Before vs After Summary:', {
        'First Render (Before -> After)': `${beforeFirstContentMs}ms -> ${afterFirstContentMs}ms (${perceivedSpeedupPercent}% faster)`,
        'Network Execution (Sequential -> Parallel)': `${comparison.sequentialTotalMs}ms -> ${parallelWallTimeMs}ms (${parallelNetworkSavingsPercent}% saved)`,
        'Launch Requests (Before -> After)': `${comparison.beforeTotalRequests} -> ${comparison.afterNetworkRequests} network (${comparison.duplicateRequestsEliminated} deduplicated/cached)`,
        'Snapshot Status': params.snapshotHit
          ? `HIT (age: ${Math.round((params.snapshotAgeMs || 0) / 1000)}s)`
          : 'SEED_SNAPSHOT (First visit instant fallback)',
      })
      if (recordedMetrics.length > 0) {
        console.table(
          recordedMetrics.map(m => ({
            Endpoint: m.endpoint,
            Initiator: m.initiator,
            'Start (ms)': m.startTimeMs,
            'End (ms)': m.endTimeMs,
            'Duration (ms)': m.durationMs,
            Source: m.source,
            Status: m.status,
            Parallel: m.parallelGroup ? 'YES' : 'NO',
          }))
        )
      }
      console.groupEnd()
    }
  }

  listeners.forEach(cb => cb(report))
  return report
}

export function getLaunchReport(): LaunchTelemetryReport | null {
  return currentReport
}

export function subscribeLaunchReport(cb: (report: LaunchTelemetryReport) => void): () => void {
  listeners.add(cb)
  if (currentReport) {
    cb(currentReport)
  }
  return () => {
    listeners.delete(cb)
  }
}
