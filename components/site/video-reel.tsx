'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Star, ThumbsUp, X } from 'lucide-react'
import { BohoCeramicCross, BohoRosace, BohoCarvedColumn } from './boho-decor'
import { useRandomHeroColor } from '@/hooks/use-random-hero-color'

// We will fetch SOCIAL_REVIEWS dynamically now
export interface SocialReview {
  id: number
  platform: string
  name: string
  avatar: string
  rating: number
  text: string
  time: number
  duration: number
  position: 'left' | 'right'
}

const PLATFORM_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  google: {
    bg: 'bg-white',
    text: 'text-gray-800',
    icon: 'G',
  },
  facebook: {
    bg: 'bg-[#1877f2]',
    text: 'text-white',
    icon: 'f',
  },
  instagram: {
    bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400',
    text: 'text-white',
    icon: '◎',
  },
}

function PlatformBadge({ platform }: { platform: string }) {
  const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.google
  return (
    <span className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-black ${style.bg} ${style.text} shrink-0`}>
      {style.icon}
    </span>
  )
}

function ReviewOverlay({ review, position }: { review: SocialReview; position: string }) {
  const isLeft = position === 'left'
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -60 : 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: isLeft ? -40 : 40, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${isLeft ? 'left-4 md:left-8' : 'right-4 md:right-8'} max-w-[220px] md:max-w-[260px]`}
      style={{ top: isLeft ? '18%' : '22%' }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3.5 border border-white/60">
        <div className="flex items-center gap-2 mb-2">
          <PlatformBadge platform={review.platform} />
          <div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">{review.name}</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-700 leading-relaxed">{review.text}</p>
      </div>
      {/* Arrow pointer */}
      <div className={`absolute top-4 ${isLeft ? '-left-2' : '-right-2'} size-4 rotate-45 bg-white/95`} />
    </motion.div>
  )
}

export function VideoReel() {
  const { color: titleColor, isMounted: isHeroColorMounted } = useRandomHeroColor()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // API State
  const [videoUrl, setVideoUrl] = useState('/Video.mp4')
  const [socialReviews, setSocialReviews] = useState<SocialReview[]>([])
  const [activeReviews, setActiveReviews] = useState<SocialReview[]>([])
  const [hasStarted, setHasStarted] = useState(true)

  // Fetch reel config
  useEffect(() => {
    fetch('/api/reel')
      .then(res => res.json())
      .then(data => {
        if (data.videoUrl) setVideoUrl(data.videoUrl)
        if (data.reviews) setSocialReviews(data.reviews)
      })
      .catch(err => console.error("Failed to load reel config", err))
  }, [])

  // Track which reviews are currently visible
  useEffect(() => {
    const visible = socialReviews.filter(
      r => currentTime >= r.time && currentTime < r.time + r.duration
    )
    setActiveReviews(visible)
  }, [currentTime, socialReviews])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
      setHasStarted(true)
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
    <section className="relative bg-transparent py-16 md:py-24 overflow-hidden">
      {/* Repeating Panel Background */}
      <div 
        className="absolute inset-0 z-0 opacity-60 brightness-75 pointer-events-none bg-[url('/images/bg-white-cabinet.png')] bg-[length:100%_auto] md:bg-[length:50%_auto] bg-top bg-repeat" 
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] font-semibold mb-4">
            ✦ Ils nous font confiance ✦
          </p>
          <h2 
            className="font-heading text-3xl font-light drop-shadow-[0_2px_4px_rgba(26,17,11,0.8)] sm:text-4xl leading-tight transition-colors duration-1000"
            style={{ color: isHeroColorMounted ? titleColor : '#8B4513' }}
          >
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-white drop-shadow-[0_1px_2px_rgba(26,17,11,0.8)] text-sm max-w-lg mx-auto font-medium">
            Des centaines d'avis sur Google, Facebook et Instagram. Découvrez leur expérience avec l'Atelier Aschi.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        {/* Video Player - Square Layout */}
        <div className="relative mx-auto w-full group max-w-3xl">
          <div className="relative overflow-hidden border-[12px] border-white shadow-2xl bg-[#E8DCCB] rounded-sm">
            {/* Video Element */}
            <div className="relative w-full aspect-square">
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                autoPlay
                preload="metadata"
                className="w-full h-full object-cover"
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2A1E]/80 via-transparent to-[#3A2A1E]/30 pointer-events-none" />

              {/* Review overlays */}
              <AnimatePresence>
                {activeReviews.map(review => (
                  <ReviewOverlay key={review.id} review={review} position={review.position} />
                ))}
              </AnimatePresence>

              {/* Watermark */}
              {hasStarted && (
                <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-1.5 bg-white/40 backdrop-blur-md rounded-full px-4 py-2 pointer-events-none border border-white/10">
                  <div className="size-5 rounded-full bg-[#E8DCCB] flex items-center justify-center">
                    <span className="text-[9px] font-black text-walnut">A</span>
                  </div>
                  <span className="text-xs text-[#3A2A21]/90 font-medium tracking-widest uppercase">Aschi</span>
                </div>
              )}
            </div>

            {/* Custom Controls - Positioned over the video at the bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#3A2A1E]/90 via-[#3A2A1E]/50 to-transparent pt-16 pb-8 md:pb-10 px-6 md:px-12 flex items-center gap-3 md:gap-4 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-[#3A2A21]/90 hover:text-[#C17D59] transition-colors shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isPlaying ? <Pause className="size-6 md:size-7" /> : <Play className="size-6 md:size-7 fill-current" />}
              </button>

              {/* Time */}
              <span className="text-xs md:text-sm text-[#3A2A21]/60 font-mono shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Progress Bar */}
              <div className="relative flex-1 group/progress cursor-pointer h-8 flex items-center">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden transition-all group-hover/progress:h-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full transition-all relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 translate-x-1/2" />
                  </div>
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
                onClick={toggleMute}
                className="text-[#3A2A21]/90 hover:text-[#C17D59] transition-colors shrink-0"
                aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX className="size-5 md:size-6" /> : <Volume2 className="size-5 md:size-6" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement && videoRef.current) {
                    videoRef.current.requestFullscreen().catch(err => console.error(err))
                  } else {
                    document.exitFullscreen()
                  }
                }}
                className="text-[#3A2A21]/90 hover:text-[#C17D59] transition-colors shrink-0 hidden md:block"
                aria-label="Plein écran"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>

              {/* Platform badges */}
              <div className="hidden lg:flex items-center gap-1.5 shrink-0 border-l border-white/20 pl-4 ml-2">
                <span className="text-[10px] text-[#3A2A21]/50 uppercase tracking-widest mr-2">Avis vérifiés sur</span>
                <span className="size-6 rounded-full bg-white flex items-center justify-center text-[11px] font-black text-gray-700 shadow">G</span>
                <span className="size-6 rounded-full bg-[#1877f2] flex items-center justify-center text-[11px] font-black text-white shadow">f</span>
                <span className="size-6 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center text-[11px] font-black text-white shadow">◎</span>
              </div>
            </div>
          </div>

          {/* Stats below */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Avis Google', value: '4.9 ★', sub: '50+ évaluations' },
              { label: 'Avis Facebook', value: '4.8 ★', sub: '80+ commentaires' },
              { label: 'Années d\'expérience', value: '50+', sub: 'Depuis 1976' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="font-heading text-2xl text-[#C17D59] font-light">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#3A2A21]/60 mt-1">{stat.label}</p>
                <p className="text-[10px] text-[#3A2A21]/30 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
