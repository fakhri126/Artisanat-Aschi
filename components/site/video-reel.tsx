'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Reveal } from './reveal'

export function VideoReel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { margin: '100px 0px', once: false })

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

  const [reelData, setReelData] = useState({
    videoUrl: '/uploads/1791058503119-WhatsApp_Video_2026-10-03_at_06.20.12.mp4',
    badge: "Témoignage & Gestes d'Atelier",
    title: "L'Expérience Aschi en Vidéo",
    description: "Découvrez en vidéo la passion de nos maîtres ébénistes, la noblesse du travail du noyer massif et la satisfaction de nos clients d'exception."
  })

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (data?.temoignage) {
          setReelData(prev => ({
            videoUrl: data.temoignage.videoUrl || prev.videoUrl,
            badge: data.temoignage.badge || prev.badge,
            title: data.temoignage.title || prev.title,
            description: data.temoignage.description || prev.description
          }))
        } else if (data?.videoUrl) {
          setReelData(prev => ({ ...prev, videoUrl: data.videoUrl }))
        }
      })
      .catch(() => {})
  }, [])

  // Smart lazy loading & auto-pause via IntersectionObserver
  useEffect(() => {
    if (!videoRef.current) return

    if (isInView) {
      setHasLoaded(true)
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Autoplay may be restricted on some mobile browsers without user interaction
        setIsPlaying(false)
      })
    } else if (hasLoaded) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isInView, hasLoaded])

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = t
      setCurrentTime(t)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <section id="temoignages" ref={containerRef} className="relative bg-transparent py-10 sm:py-16 lg:py-20 overflow-hidden border-none scroll-mt-20">
      {/* Ancre de compatibilité */}
      <span id="coulisses" className="absolute -top-24" />

      <div className="relative mx-auto max-w-5xl px-3.5 sm:px-6 lg:px-8 z-10">
        
        {/* ========================================================================= */}
        {/* 1. EN-TÊTE STATUTAIRE (Harmonisé & Centré)                                */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B271C]/90 backdrop-blur-md border border-[#E6A635]/40 text-[#F2BD52] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#E6A635] animate-pulse" />
              <span>{reelData.badge || "Témoignage & Gestes d'Atelier"}</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gold-gradient drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-tight mb-2">
              {reelData.title || "L'Expérience Aschi en Vidéo"}
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-white drop-shadow text-xs sm:text-sm font-normal max-w-2xl mx-auto leading-relaxed px-1">
              {reelData.description}
            </p>
          </Reveal>
        </div>

        {/* ========================================================================= */}
        {/* 2. LECTEUR CINÉMA CENTRÉ & MAJESTUEUX (Lazy Loading Viewport)             */}
        {/* ========================================================================= */}
        <div className="max-w-4xl mx-auto">
          <Reveal delay={120}>
            <div className="relative overflow-hidden border-2 border-[#E6A635]/45 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#3B271C]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl group">
              
              {/* Video Element */}
              <div 
                onClick={togglePlay}
                className="relative w-full flex items-center justify-center bg-[#1A110B] overflow-hidden aspect-[16/9] sm:aspect-[16/9] cursor-pointer"
              >
                <video
                  ref={videoRef}
                  src={hasLoaded ? (reelData.videoUrl || "/uploads/1791058503119-WhatsApp_Video_2026-10-03_at_06.20.12.mp4") : undefined}
                  poster="/images/raw-sculptures.jpg"
                  muted={isMuted}
                  preload="none"
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />

                {/* Dark subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Live Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#241812]/95 border border-[#E6A635]/40 backdrop-blur-xl text-xs font-semibold text-white shadow-lg">
                  <span className="size-2 rounded-full bg-[#E6A635] shadow-[0_0_8px_#E6A635] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#F2BD52]">Gestes d&apos;Atelier en Direct</span>
                </div>

                {/* Center Play Indicator on Hover / Pause */}
                {!isPlaying && (
                  <div className="absolute inset-0 m-auto size-14 sm:size-16 rounded-full bg-[#E6A635]/90 text-[#1A110B] flex items-center justify-center shadow-2xl z-20 pointer-events-none">
                    <Play className="size-6 sm:size-7 fill-current ml-1" />
                  </div>
                )}

                {/* Custom Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-8 pb-3.5 px-4 sm:px-6 flex items-center gap-3 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100 z-20">
                  
                  {/* Play/Pause */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay()
                    }}
                    className="text-white hover:text-[#F2BD52] transition-colors shrink-0 p-1 cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                  </button>

                  {/* Time */}
                  <span className="text-[10.5px] text-white/90 font-mono shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Progress Bar */}
                  <div className="relative flex-1 group/progress cursor-pointer h-4 flex items-center">
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden transition-all group-hover/progress:h-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#F3C45E] to-[#E6A635] rounded-full transition-all relative shadow-[0_0_8px_#E6A635]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      aria-label="Progression de la vidéo"
                    />
                  </div>

                  {/* Mute */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMute()
                    }}
                    className="text-white hover:text-[#F2BD52] transition-colors shrink-0 p-1 cursor-pointer"
                    aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                  >
                    {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-[#F2BD52]" />}
                  </button>
                </div>
              </div>

            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
