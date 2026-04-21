import { useCallback, useEffect, useRef, useState } from 'react'

const TRACKS = [
  {
    title: 'Lobster',
    src: 'https://igpapxaakaqvnfqnvfym.supabase.co/storage/v1/object/public/beats/lobster.mp3',
    accent: '#14f195',
  },
  {
    title: 'Epistemological',
    src: 'https://igpapxaakaqvnfqnvfym.supabase.co/storage/v1/object/public/beats/epistemolgical.mp3',
    accent: '#00d4ff',
  },
  {
    title: '9.6',
    src: 'https://igpapxaakaqvnfqnvfym.supabase.co/storage/v1/object/public/beats/9.6.mp3',
    accent: '#8f6aff',
  },
]

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [trackIdx, setTrackIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.6)
  const [expanded, setExpanded] = useState(false)

  const track = TRACKS[trackIdx]

  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audio.preload = 'metadata'
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('durationchange', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => {
      setTrackIdx((prev) => (prev + 1) % TRACKS.length)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switch track source
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const wasPlaying = playing
    audio.src = track.src
    audio.load()
    if (wasPlaying) {
      audio.play().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [playing])

  const prevTrack = useCallback(() => {
    setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length)
  }, [])

  const nextTrack = useCallback(() => {
    setTrackIdx((i) => (i + 1) % TRACKS.length)
  }, [])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * duration
  }, [duration])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`solana-player${expanded ? ' is-expanded' : ''}`}>
      {/* Mini bar — always visible */}
      <div className="solana-player-bar">
        <button type="button" className="solana-player-btn" onClick={prevTrack} aria-label="Previous">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button type="button" className="solana-player-btn solana-player-play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button type="button" className="solana-player-btn" onClick={nextTrack} aria-label="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6z"/></svg>
        </button>

        <div className="solana-player-info" onClick={() => setExpanded((e) => !e)}>
          <span className="solana-player-title" style={{ color: track.accent }}>
            {track.title}
          </span>
          <span className="solana-player-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="solana-player-progress" onClick={seek}>
          <div className="solana-player-progress-fill" style={{ width: `${progress}%`, background: track.accent }} />
        </div>

        <div className="solana-player-vol">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="solana-player-vol-slider"
            aria-label="Volume"
          />
        </div>

        <button type="button" className="solana-player-btn solana-player-expand" onClick={() => setExpanded((e) => !e)} aria-label="Expand">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}>
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
      </div>

      {/* Expanded track list */}
      {expanded && (
        <div className="solana-player-tracklist">
          {TRACKS.map((t, i) => (
            <button
              key={t.src}
              type="button"
              className={`solana-player-track${i === trackIdx ? ' is-active' : ''}`}
              style={i === trackIdx ? { borderColor: t.accent, color: t.accent } : undefined}
              onClick={() => { setTrackIdx(i); if (!playing) togglePlay() }}
            >
              <span className="solana-player-track-dot" style={{ background: i === trackIdx && playing ? t.accent : 'rgba(255,255,255,0.2)' }} />
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
