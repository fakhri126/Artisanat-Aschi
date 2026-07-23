'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Star, ThumbsUp, X } from 'lucide-react'

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
    <section className="relative bg-[#0d0a06] py-24 md:py-32 overflow-hidden">
      {/* Ambient decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 size-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">
            ✦ Ils nous font confiance ✦
          </p>
          <h2 className="font-heading text-4xl font-light text-ivory sm:text-5xl leading-tight">
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-ivory/50 text-sm max-w-lg mx-auto">
            Des centaines d'avis sur Google, Facebook et Instagram. Découvrez leur expérience avec l'Atelier Aschi.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        {/* Video Player */}
        <div className="relative mx-auto max-w-4xl">
          {/* Glow effect */}
          <div className="absolute -inset-4 rounded-3xl bg-gold/10 blur-xl" />

          <div className="relative rounded-2xl overflow-hidden border border-gold/20 bg-black shadow-2xl shadow-black/60">
            {/* Video Element */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Review overlays */}
              <AnimatePresence>
                {activeReviews.map(review => (
                  <ReviewOverlay key={review.id} review={review} position={review.position} />
                ))}
              </AnimatePresence>

              {/* Watermark */}
              {hasStarted && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 pointer-events-none">
                  <div className="size-4 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-[7px] font-black text-walnut">A</span>
                  </div>
                  <span className="text-[10px] text-ivory/80 font-medium tracking-wider uppercase">Aschi</span>
                </div>
              )}
            </div>

            {/* Custom Controls */}
            <div className="bg-black/90 px-4 py-3 flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-ivory/80 hover:text-gold transition-colors shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />}
              </button>

              {/* Time */}
              <span className="text-[10px] text-ivory/40 font-mono shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Progress Bar */}
              <div className="relative flex-1 group">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full transition-all"
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
                onClick={toggleMute}
                className="text-ivory/80 hover:text-gold transition-colors shrink-0"
                aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>

              {/* Platform badges */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0 border-l border-white/10 pl-3">
                <span className="text-[9px] text-ivory/30 uppercase tracking-wider mr-1">Avis sur</span>
                <span className="size-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-gray-700">G</span>
                <span className="size-5 rounded-full bg-[#1877f2] flex items-center justify-center text-[10px] font-black text-white">f</span>
                <span className="size-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center text-[10px] font-black text-white">◎</span>
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
                <p className="font-heading text-2xl text-gold font-light">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-ivory/60 mt-1">{stat.label}</p>
                <p className="text-[10px] text-ivory/30 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
