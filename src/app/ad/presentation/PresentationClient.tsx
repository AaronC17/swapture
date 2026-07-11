'use client'

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Storyboard, StoryboardBeat } from './page'

const CUSTOMER_SLOT = { start: 5, end: 19 }
const ADMIN_SLOT = { start: 19, end: 27 }

// ─────────────────────────────────────────────────────────────────────────────
//  Hook: tiempo maestro de la presentación
// ─────────────────────────────────────────────────────────────────────────────
function usePresentationTime(totalDuration: number) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  const play = () => {
    if (playing) return
    setPlaying(true)
    startRef.current = performance.now() - time * 1000
  }

  useEffect(() => {
    if (!playing) return
    const tick = () => {
      const now = performance.now()
      const t = (now - startRef.current) / 1000
      if (t >= totalDuration) {
        setTime(totalDuration)
        setPlaying(false)
      } else {
        setTime(t)
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, totalDuration])

  return { time, playing, play }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fondo y marca
// ─────────────────────────────────────────────────────────────────────────────
function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_40%)]" />
      {/* Viñeta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(10,10,18,0.7) 100%)',
        }}
      />
    </div>
  )
}

function SwaptureLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1
  return (
    <div className="flex items-center gap-4" style={{ transform: `scale(${scale})` }}>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 shadow-[0_0_40px_rgba(168,85,247,0.25)]">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="text-accent"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-heading text-5xl font-bold tracking-tight text-white">
        Swapture
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Dispositivos
// ─────────────────────────────────────────────────────────────────────────────
function IPhoneFrame({ videoRef, visible }: { videoRef: MutableRefObject<HTMLVideoElement | null>; visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.95,
        x: visible ? 0 : 60,
      }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-[120px] top-1/2 -translate-y-1/2"
      style={{ width: 480, height: 1039 }}
    >
      {/* Marco */}
      <div
        className="absolute inset-0 rounded-[72px] shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #3a3a3c 0%, #1a1a1c 50%, #0e0e10 100%)',
          boxShadow:
            '0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Borde metálico */}
        <div
          className="absolute inset-[3px] rounded-[70px]"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
      </div>

      {/* Pantalla */}
      <div
        className="absolute overflow-hidden rounded-[48px] bg-black"
        style={{
          left: 18.5,
          top: 39,
          width: 443,
          height: 961,
        }}
      >
        <video
          ref={videoRef}
          src="/ad-assets/customer.webm"
          preload="auto"
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      {/* Dynamic Island */}
      <div
        className="absolute rounded-full bg-black"
        style={{
          left: 203,
          top: 49,
          width: 74,
          height: 18,
          zIndex: 10,
        }}
      />

      {/* Reflejo sutil */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[72px]"
        style={{
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)',
        }}
      />
    </motion.div>
  )
}

function MonitorFrame({ videoRef, visible }: { videoRef: MutableRefObject<HTMLVideoElement | null>; visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.95,
        x: visible ? 0 : 60,
      }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-[120px] top-1/2 -translate-y-1/2"
      style={{ width: 1000, height: 700 }}
    >
      {/* Pantalla */}
      <div
        className="absolute overflow-hidden rounded-xl bg-black shadow-2xl"
        style={{
          left: 20,
          top: 20,
          width: 960,
          height: 600,
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        }}
      >
        <video
          ref={videoRef}
          src="/ad-assets/admin.webm"
          preload="auto"
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      {/* Marco */}
      <div
        className="absolute rounded-2xl border border-white/5"
        style={{
          left: 10,
          top: 10,
          width: 980,
          height: 620,
          background: 'linear-gradient(145deg, #252538 0%, #151520 100%)',
          zIndex: -1,
        }}
      />

      {/* Stand */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 630,
          width: 140,
          height: 50,
          background: 'linear-gradient(180deg, #2a2a3c, #1a1a25)',
          clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: 670,
          width: 220,
          height: 14,
          background: 'linear-gradient(180deg, #303045, #1e1e2c)',
        }}
      />

      {/* Reflejo */}
      <div
        className="pointer-events-none absolute rounded-xl"
        style={{
          left: 20,
          top: 20,
          width: 960,
          height: 600,
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 70%, rgba(255,255,255,0.02) 100%)',
        }}
      />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Textos animados
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedText({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function TextPanel({ beat }: { beat: StoryboardBeat }) {
  return (
    <div className="flex h-full w-[760px] flex-col justify-center pl-[140px] pr-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatedText delay={0.1}>
            <h2 className="font-heading text-7xl font-bold leading-[1.05] tracking-tight text-white">
              {beat.text.split(' ').map((word, i) =>
                word.toLowerCase().includes('swapture') ? (
                  <span key={i} className="text-accent">
                    {word}{' '}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h2>
          </AnimatedText>

          {beat.subtext && (
            <AnimatedText delay={0.25} className="mt-6">
              <p className="max-w-xl text-2xl leading-relaxed text-muted">
                {beat.subtext}
              </p>
            </AnimatedText>
          )}

          {/* Indicador de beat (línea de progreso) */}
          <AnimatedText delay={0.35} className="mt-10">
            <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: beat.end - beat.start, ease: 'linear' }}
              />
            </div>
          </AnimatedText>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Escenas
// ─────────────────────────────────────────────────────────────────────────────
function FullTextScene({ beat }: { beat: StoryboardBeat }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-40 text-center">
      <AnimatePresence mode="wait">
        <AnimatedText key={beat.id} className="max-w-5xl">
          <h1 className="font-heading text-8xl font-bold leading-[1.05] tracking-tight text-white">
            {beat.text}
          </h1>
        </AnimatedText>
      </AnimatePresence>
    </div>
  )
}

function LogoScene({ beat }: { beat: StoryboardBeat }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <SwaptureLogo size="lg" />
          {beat.subtext && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 text-3xl text-muted"
            >
              {beat.subtext}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CTAScene({ beat }: { beat: StoryboardBeat }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-40 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-heading text-9xl font-bold tracking-tight text-white">
            <span className="text-accent">Swapture.</span>
          </h1>
          <p className="mt-8 text-4xl font-medium text-white/90">{beat.subtext}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function SplitScene({
  beat,
  customerRef,
  adminRef,
}: {
  beat: StoryboardBeat
  customerRef: MutableRefObject<HTMLVideoElement | null>
  adminRef: MutableRefObject<HTMLVideoElement | null>
}) {
  const isPhone = beat.screen === 'phone'
  return (
    <div className="absolute inset-0 flex">
      <TextPanel beat={beat} />
      <IPhoneFrame videoRef={customerRef} visible={isPhone} />
      <MonitorFrame videoRef={adminRef} visible={!isPhone} />
    </div>
  )
}

function PlayOverlay({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlay}
        className="flex items-center gap-4 rounded-full bg-accent px-10 py-5 font-heading text-2xl font-semibold text-white shadow-[0_0_60px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_0_80px_rgba(168,85,247,0.55)]"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Reproducir presentación
      </motion.button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function PresentationClient({ storyboard }: { storyboard: Storyboard }) {
  const { time, playing, play } = usePresentationTime(storyboard.totalDuration)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const customerRef = useRef<HTMLVideoElement | null>(null)
  const adminRef = useRef<HTMLVideoElement | null>(null)

  const [rates, setRates] = useState({ customer: 1, admin: 1 })
  const customerStarted = useRef(false)
  const adminStarted = useRef(false)

  // Exponer función global para Playwright
  useEffect(() => {
    ;(window as any).startPresentation = play
    return () => {
      delete (window as any).startPresentation
    }
  }, [play])

  // Medir duraciones y calcular playback rates
  useEffect(() => {
    const customer = customerRef.current
    const admin = adminRef.current
    if (!customer || !admin) return

    const update = () => {
      setRates({
        customer: (customer.duration || 25) / (CUSTOMER_SLOT.end - CUSTOMER_SLOT.start),
        admin: (admin.duration || 12) / (ADMIN_SLOT.end - ADMIN_SLOT.start),
      })
    }

    customer.addEventListener('loadedmetadata', update)
    admin.addEventListener('loadedmetadata', update)
    // Si ya están cargados
    if (customer.readyState >= 1 && admin.readyState >= 1) update()

    return () => {
      customer.removeEventListener('loadedmetadata', update)
      admin.removeEventListener('loadedmetadata', update)
    }
  }, [])

  // Sincronizar audio
  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.currentTime = time
      audioRef.current.play().catch(() => {})
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [playing])

  // Control de videos según el timeline
  useEffect(() => {
    if (!playing) return

    const customer = customerRef.current
    const admin = adminRef.current

    if (time >= CUSTOMER_SLOT.start && time < CUSTOMER_SLOT.end) {
      if (!customerStarted.current && customer) {
        customer.currentTime = 0
        customer.playbackRate = rates.customer || 1
        customer.play().catch(() => {})
        customerStarted.current = true
      }
    } else if (customerStarted.current && customer) {
      customer.pause()
      customerStarted.current = false
    }

    if (time >= ADMIN_SLOT.start && time < ADMIN_SLOT.end) {
      if (!adminStarted.current && admin) {
        admin.currentTime = 0
        admin.playbackRate = rates.admin || 1
        admin.play().catch(() => {})
        adminStarted.current = true
      }
    } else if (adminStarted.current && admin) {
      admin.pause()
      adminStarted.current = false
    }
  }, [playing, time, rates])

  const currentBeat =
    storyboard.beats.find((b) => time >= b.start && time < b.end) ||
    storyboard.beats[storyboard.beats.length - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a12]">
      <div
        className="relative overflow-hidden bg-[#0a0a12] text-[#f0f0f8]"
        style={{ width: 1920, height: 1080 }}
      >
        <Background />

        {/* Audio (silencioso durante grabación, se mezcla en post) */}
        <audio ref={audioRef} src="/ad-assets/final-audio.mp3" preload="auto" />

        {/* Escenas */}
        <AnimatePresence mode="wait">
          {currentBeat.screen === 'full-text' && (
            <motion.div
              key="full-text"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FullTextScene beat={currentBeat} />
            </motion.div>
          )}

          {currentBeat.screen === 'logo' && (
            <motion.div
              key="logo"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LogoScene beat={currentBeat} />
            </motion.div>
          )}

          {(currentBeat.screen === 'phone' || currentBeat.screen === 'admin') && (
            <motion.div
              key="split"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SplitScene
                beat={currentBeat}
                customerRef={customerRef}
                adminRef={adminRef}
              />
            </motion.div>
          )}

          {currentBeat.screen === 'cta' && (
            <motion.div
              key="cta"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CTAScene beat={currentBeat} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador / marca sutil */}
        <div className="pointer-events-none absolute bottom-8 left-8 z-40 flex items-center gap-3 opacity-40">
          <SwaptureLogo size="sm" />
        </div>

        {!playing && <PlayOverlay onPlay={play} />}
      </div>
    </div>
  )
}
