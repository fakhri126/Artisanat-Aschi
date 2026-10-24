'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  HomeScreenSnapshot,
  SEED_HOME_SNAPSHOT,
  readCachedHomeSnapshot,
  refreshHomeSnapshotInParallel,
} from '@/lib/home-snapshot'
import {
  LaunchTelemetryReport,
  nowMs,
  subscribeLaunchReport,
} from '@/lib/launch-metrics'

interface HomeSnapshotContextValue {
  snapshot: HomeScreenSnapshot
  isRefreshingInBackground: boolean
  isSnapshotHydrated: boolean
  telemetry: LaunchTelemetryReport | null
}

const HomeSnapshotContext = createContext<HomeSnapshotContextValue>({
  snapshot: SEED_HOME_SNAPSHOT,
  isRefreshingInBackground: false,
  isSnapshotHydrated: false,
  telemetry: null,
})

export function HomeSnapshotProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Initial SSR & first-frame state uses SEED_HOME_SNAPSHOT so SSR HTML matches hydration 100%
  const [snapshot, setSnapshot] = useState<HomeScreenSnapshot>(SEED_HOME_SNAPSHOT)
  const [isRefreshingInBackground, setIsRefreshingInBackground] = useState(false)
  const [isSnapshotHydrated, setIsSnapshotHydrated] = useState(false)
  const [telemetry, setTelemetry] = useState<LaunchTelemetryReport | null>(null)
  const [showPerfHud, setShowPerfHud] = useState(false)

  useEffect(() => {
    const unsub = subscribeLaunchReport(report => {
      setTelemetry(report)
    })
    return unsub
  }, [])

  useEffect(() => {
    // 1. Instantly read cached home-screen snapshot from localStorage (0ms network wait)
    const { snapshot: cached, isCacheHit, ageMs } = readCachedHomeSnapshot()
    const instantRenderMs = nowMs()

    if (isCacheHit) {
      setSnapshot(cached)
    }
    setIsSnapshotHydrated(true)

    // 2. Refresh all independent requests in parallel in the background (Stale-While-Revalidate)
    setIsRefreshingInBackground(true)
    refreshHomeSnapshotInParallel(cached, nextSnapshot => {
      setSnapshot(nextSnapshot)
    }, {
      snapshotHit: isCacheHit,
      snapshotAgeMs: ageMs,
      instantRenderMs,
    }).finally(() => {
      setIsRefreshingInBackground(false)
    })

    // Optional Perf HUD activation via ?perf=1 or Alt+P
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('perf') === '1' || params.get('debug') === 'perf') {
        setShowPerfHud(true)
      }
      const onKeyDown = (e: KeyboardEvent) => {
        if ((e.altKey && e.key.toLowerCase() === 'p') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p')) {
          e.preventDefault()
          setShowPerfHud(prev => !prev)
        }
      }
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <HomeSnapshotContext.Provider
      value={{
        snapshot,
        isRefreshingInBackground,
        isSnapshotHydrated,
        telemetry,
      }}
    >
      {children}

      {/* Optional Launch Telemetry HUD (?perf=1 or Alt+P) */}
      {showPerfHud && telemetry && (
        <div className="fixed bottom-4 left-4 z-50 max-w-md w-[calc(100vw-2rem)] rounded-2xl bg-[#1A110B]/95 border border-[#E6A635]/60 p-4 text-xs text-[#F7F4EE] shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl font-sans">
          <div className="flex items-center justify-between border-b border-[#E6A635]/25 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[#F2BD52]">
                Launch Telemetry (SWR + Parallel)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPerfHud(false)}
              className="text-white/60 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="rounded-xl bg-[#2B1B13] p-2 border border-[#E6A635]/25">
              <span className="text-[10px] uppercase text-white/60 block">
                Affichage Instantané (After)
              </span>
              <span className="text-base font-bold text-emerald-400">
                {telemetry.comparison.afterFirstContentMs} ms
              </span>
              <span className="text-[10px] text-white/50 block">
                Avant : {telemetry.comparison.beforeFirstContentMs} ms (-
                {telemetry.comparison.perceivedSpeedupPercent}%)
              </span>
            </div>

            <div className="rounded-xl bg-[#2B1B13] p-2 border border-[#E6A635]/25">
              <span className="text-[10px] uppercase text-white/60 block">
                Refresh Parallèle
              </span>
              <span className="text-base font-bold text-[#F2BD52]">
                {telemetry.comparison.parallelWallTimeMs} ms
              </span>
              <span className="text-[10px] text-white/50 block">
                Séquentiel : {telemetry.comparison.sequentialTotalMs} ms (-
                {telemetry.comparison.parallelNetworkSavingsPercent}%)
              </span>
            </div>
          </div>

          <div className="text-[10.5px] text-white/80 mb-2 flex items-center justify-between">
            <span>
              Snapshot :{' '}
              <strong className="text-[#F2BD52]">
                {telemetry.snapshotHit ? 'CACHE HIT' : 'SEED INSTANT'}
              </strong>
            </span>
            <span>
              Réseau :{' '}
              <strong className="text-[#F2BD52]">
                {telemetry.connection.effectiveType.toUpperCase()} ({telemetry.connection.rttMs}ms)
              </strong>
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 border-t border-[#E6A635]/20 pt-2">
            {telemetry.requests.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between text-[10px] bg-black/30 px-2 py-1 rounded"
              >
                <span className="truncate max-w-[175px] font-mono text-white/90">
                  {r.endpoint}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.2 rounded bg-[#E6A635]/20 text-[#F2BD52]">
                    {r.source}
                  </span>
                  <span className="font-mono font-semibold text-emerald-300">
                    {r.durationMs}ms
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </HomeSnapshotContext.Provider>
  )
}

export function useHomeSnapshot() {
  return useContext(HomeSnapshotContext)
}
