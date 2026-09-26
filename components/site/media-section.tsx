'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Tv, 
  Sparkles, 
  Award, 
  Film,
  MessageCircle,
  ArrowRight
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Reveal } from './reveal'

export function MediaSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { margin: '150px 0px', once: false })

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Pause video if scrolled out of view
  useEffect(() => {
    if (!videoRef.current) return

    if (!isInView && isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isInView, isPlaying])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentFs = Boolean(
        document.fullscreenElement || 
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      )
      setIsFullscreen(isCurrentFs)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        setAspectRatio(`${videoRef.current.videoWidth} / ${videoRef.current.videoHeight}`)
      }
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    setShowControls(true)
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowControls(true)
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.warn('Playback prevented:', err)
        setIsPlaying(false)
      })
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime
      setCurrentTime(targetTime)
    }
  }

  const toggleFullscreen = async () => {
    const wrapper = videoWrapperRef.current
    if (!wrapper) return

    try {
      if (!isFullscreen) {
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen()
        } else if ((wrapper as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (wrapper as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  // Auto-hide controls when playing
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <section 
      id="media" 
      ref={containerRef} 
      className="relative bg-transparent py-12 sm:py-16 lg:py-24 overflow-hidden scroll-mt-24"
    >
      {/* Halo lumineux d'ambiance or / ambre */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E6A635]/12 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE & MÉDIATIQUE                                        */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-xs font-bold uppercase tracking-[0.2em] mb-3 shadow-lg">
              <Tv className="size-3.5 text-[#E6A635]" />
              <span>Passage Média &amp; Télévision</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gold-gradient drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-tight mb-3">
              L&apos;Artisanat Aschi à l&apos;Écran
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-white drop-shadow text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
              Plongez dans les coulisses de notre atelier familial à travers ce reportage télévisé dédié à la haute sculpture sur noyer et la sauvegarde de nos arts traditionnels.
            </p>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. LECTEUR CINÉMA FORMAT COMPLET INTÉGRAL (AUCUN RECADRAGE NI ROGNAGE)      */}
        {/* ========================================================================= */}
        <Reveal delay={120}>
          <div className="relative mx-auto max-w-5xl">

            {/* Barre d'informations média extérieure (pour ne jamais cacher le logo de la chaîne) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3 mb-2.5">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 backdrop-blur-md shadow-sm">
                <span className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#F2BD52]">
                  Reportage Télévisé Intégral
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 border border-[#E6A635]/40 backdrop-blur-md shadow-sm">
                <Film className="size-3 text-[#E6A635]" />
                <span className="text-[10.5px] sm:text-xs font-semibold text-white/90">
                  Format Source Complet • 100% Sans Recadrage
                </span>
              </div>
            </div>

            {/* Lueur dorée d'encadrement */}
            <div className="absolute -inset-1 sm:-inset-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#E6A635]/30 via-[#F3C45E]/40 to-[#C78318]/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

            {/* Conteneur principal du lecteur */}
            <div 
              ref={videoWrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E6A635]/60 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.95)] group"
            >
              {/* Conteneur vidéo adapté dynamiquement aux dimensions réelles */}
              <div 
                onClick={togglePlay}
                style={aspectRatio ? { aspectRatio } : undefined}
                className={`relative w-full ${!aspectRatio ? 'aspect-[16/9]' : ''} max-h-[80vh] flex items-center justify-center bg-black cursor-pointer select-none`}
              >
                {/* 
                  Vidéo Standard MP4
                  - object-contain : garantit l'affichage à 100% sans aucun rognage de bord
                  - aucun badge interne : les logos de chaînes (en haut à gauche ou à droite) restent totalement dégagés
                */}
                <video
                  ref={videoRef}
                  src="/video-media-aschi.mp4"
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-contain bg-black"
                />

                {/* Bouton de lecture central élégant (affiché uniquement quand la vidéo est en pause) */}
                {!isPlaying && (
                  <div className="absolute inset-0 m-auto size-16 sm:size-20 rounded-full bg-gradient-to-tr from-[#C78318] via-[#E6A635] to-[#F3C45E] text-[#1A110B] flex items-center justify-center shadow-[0_0_35px_rgba(230,166,53,0.7)] transform transition-transform duration-300 hover:scale-110 z-20 cursor-pointer pointer-events-auto">
                    <Play className="size-7 sm:size-9 fill-current ml-1" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* BARRE DE CONTRÔLES PERSONNALISÉE (Bas uniquement, sans masquer le haut)     */}
                {/* ========================================================================= */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-10 pb-3 sm:pb-4 px-3 sm:px-6 flex flex-col gap-2 z-30 transition-opacity duration-300 ${
                    isPlaying && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  {/* Ligne de progression vidéo */}
                  <div className="relative w-full h-3 flex items-center group/progress cursor-pointer">
                    <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden transition-all duration-200 group-hover/progress:h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] rounded-full relative shadow-[0_0_10px_#E6A635]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      aria-label="Progression de la vidéo"
                    />
                  </div>

                  {/* Boutons de contrôle & Horodatage */}
                  <div className="flex items-center justify-between gap-3 text-white">
                    {/* Gauche : Play/Pause + Horodatage */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white hover:text-[#F2BD52] transition-colors focus:outline-none cursor-pointer"
                        aria-label={isPlaying ? 'Mettre en pause' : 'Lire la vidéo'}
                      >
                        {isPlaying ? <Pause className="size-4 sm:size-5" /> : <Play className="size-4 sm:size-5 fill-current" />}
                      </button>

                      <div className="text-[11px] sm:text-xs font-mono text-white/90">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-white/40 mx-1">/</span>
                        <span className="text-white/60">{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Droite : Volume / Muet + Plein écran */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white hover:text-[#F2BD52] transition-colors focus:outline-none cursor-pointer"
                        aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                      >
                        {isMuted ? (
                          <VolumeX className="size-4 sm:size-5 text-red-400" />
                        ) : (
                          <Volume2 className="size-4 sm:size-5 text-[#F2BD52]" />
                        )}
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white hover:text-[#F2BD52] transition-colors focus:outline-none cursor-pointer"
                        aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                      >
                        {isFullscreen ? (
                          <Minimize className="size-4 sm:size-5" />
                        ) : (
                          <Maximize className="size-4 sm:size-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ========================================================================= */}
        {/* 3. CARTES DE CONTEXTE & RECONNAISSANCE MÉDIATIQUE                         */}
        {/* ========================================================================= */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Carte 1 */}
          <Reveal delay={140}>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#3B271C]/75 backdrop-blur-md border border-[#E6A635]/30 shadow-md flex items-start gap-3.5 h-full">
              <div className="p-2.5 rounded-xl bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] shrink-0">
                <Tv className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-medium text-white mb-1">
                  Reportage &amp; Témoignage
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  L&apos;histoire de notre atelier familial et la transmission des secrets de sculpture de père en fils.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Carte 2 */}
          <Reveal delay={180}>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#3B271C]/75 backdrop-blur-md border border-[#E6A635]/30 shadow-md flex items-start gap-3.5 h-full">
              <div className="p-2.5 rounded-xl bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] shrink-0">
                <Award className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-medium text-white mb-1">
                  Savoir-Faire d&apos;Excellence
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Démonstration des gestes séculaires : noyer massif sculpté à la gouge et ciselure d&apos;art à la main.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Carte 3 */}
          <Reveal delay={220}>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#3B271C]/75 backdrop-blur-md border border-[#E6A635]/30 shadow-md flex items-start gap-3.5 h-full">
              <div className="p-2.5 rounded-xl bg-[#E6A635]/15 border border-[#E6A635]/40 text-[#F2BD52] shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-medium text-white mb-1">
                  Projets d&apos;Exception
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Portes monumentales, salons majestueux et créations uniques pour demeures de prestige et palaces.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 4. CALL TO ACTION D'ÉLÉGANCE                                              */}
        {/* ========================================================================= */}
        <Reveal delay={260}>
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/21655743760?text=Bonjour,%20j'ai%20visionn%C3%A9%20votre%20passage%20t%C3%A9l%C3%A9vis%C3%A9%20et%20je%20souhaite%20des%20renseignements"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F3C45E] via-[#E6A635] to-[#C78318] text-[#1A110B] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(230,166,53,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="size-4 text-[#1A110B]" />
              <span>Échanger avec notre atelier</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
