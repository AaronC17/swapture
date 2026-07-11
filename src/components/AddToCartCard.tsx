'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ShoppingCart, Check, Package } from 'lucide-react'

const ITEMS = [
  { id: 1, price: 5200 },
  { id: 2, price: 3800 },
  { id: 3, price: 6400 },
]

export default function AddToCartCard() {
  const [addedCount, setAddedCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [phase, setPhase] = useState<'idle' | 'flying' | 'arrived'>('idle')
  const [cycle, setCycle] = useState(0)

  const totalMotion = useMotionValue(0)
  const displayTotal = useTransform(totalMotion, (v) => Math.max(0, Math.round(v)))
  const totalRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(totalMotion, total, {
      duration: total === 0 ? 0.35 : 0.5,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [total, totalMotion])

  useEffect(() => {
    return displayTotal.on('change', (v) => {
      if (totalRef.current) totalRef.current.textContent = `¢${v}`
    })
  }, [displayTotal])

  useEffect(() => {
    let mounted = true

    const runCycle = async () => {
      while (mounted) {
        setAddedCount(0)
        setTotal(0)
        setActiveIndex(-1)
        setPhase('idle')
        await wait(600)

        for (let i = 0; i < ITEMS.length; i++) {
          if (!mounted) return
          setActiveIndex(i)
          setPhase('flying')
          await wait(1800)

          if (!mounted) return
          setPhase('arrived')
          await wait(100)
          setAddedCount((c) => c + 1)
          setTotal((t) => t + ITEMS[i].price)
          await wait(i === ITEMS.length - 1 ? 1000 : 600)
          if (i !== ITEMS.length - 1) {
            setPhase('idle')
            await wait(300)
          }
        }

        await wait(1500)
        setCycle((c) => c + 1)
      }
    }

    runCycle()
    return () => {
      mounted = false
    }
  }, [cycle])

  return (
    <div className="relative w-full max-w-[300px] mx-auto overflow-hidden rounded-[24px] border border-border/60 bg-surface/[0.42] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-accent/8 blur-[40px]" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent/30 to-accent-dim/20 border border-accent/25 flex items-center justify-center overflow-hidden">
            <ShoppingCart size={16} className="text-accent-light relative z-10" />
            <div className="absolute inset-0 bg-accent/10 blur-md" />
          </div>
          <span className="text-xs font-medium text-white/80 tracking-tight">Pedido en curso</span>
        </div>

        <motion.div
          animate={phase === 'arrived' ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="relative min-w-[26px] h-6 px-1.5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center overflow-hidden"
        >
          <motion.span
            key={addedCount}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="text-[11px] font-bold text-accent-light"
          >
            {addedCount}
          </motion.span>
        </motion.div>
      </div>

      {/* Stage */}
      <div className="relative">
        {/* Product sources */}
        <div className="flex items-center justify-between mb-8 px-1">
          {ITEMS.map((item, i) => {
            const isActive = activeIndex === i && phase === 'flying'
            const isDone = i < addedCount

            return (
              <div key={item.id} className="relative flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    opacity: isDone ? 0.45 : 1,
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-accent/35 to-accent-dim/25 border border-accent/45'
                      : 'bg-bg/70 border border-white/[0.06]'
                  }`}
                >
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                      className="w-5 h-5 rounded-full bg-positive/18 flex items-center justify-center"
                    >
                      <Check size={10} className="text-positive" />
                    </motion.div>
                  ) : (
                    <Package size={16} className="text-white/40" />
                  )}

                  {isActive && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-accent/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.45, 0] }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-xl border border-accent/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                    </>
                  )}
                </motion.div>

                <span className="text-[11px] text-white/30 font-mono">¢{item.price}</span>
              </div>
            )
          })}
        </div>

        {/* Cart area - fixed height */}
        <div
          className="relative h-[196px] rounded-2xl bg-bg/60 border border-white/[0.06] p-4 overflow-hidden"
          style={{ transform: 'translate3d(0,0,0)' }}
        >
          {/* Arrival scan line */}
          {phase === 'arrived' && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent z-10 pointer-events-none"
              style={{
                animation: 'scanDown 0.8s ease-in-out forwards',
                transform: 'translate3d(0,0,0)',
              }}
            />
          )}

          <div className="flex flex-col justify-center h-full gap-y-2.5">
            {ITEMS.map((item, i) => {
              const isAdded = i < addedCount

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-center py-2 px-3 rounded-xl border transition-colors duration-300 ${
                    isAdded ? 'bg-white/[0.04] border-white/[0.06]' : 'border-dashed border-white/[0.05]'
                  }`}
                >
                  {isAdded ? (
                    <div className="relative flex items-center justify-center w-full opacity-0 animate-[fadeIn_0.38s_ease-out_forwards]">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-positive/12 flex items-center justify-center">
                        <Check size={10} className="text-positive" />
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[11px] text-white/80">Producto agregado</span>
                        <span className="text-[9px] text-white/30">Confirmado</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center w-full">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-white/[0.05]" />
                      <div className="flex flex-col gap-1">
                        <div className="w-20 h-2 rounded-full bg-white/[0.06]" />
                        <div className="w-12 h-1.5 rounded-full bg-white/[0.04]" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer total */}
      <div className="relative flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
        <span className="text-[11px] text-muted">Total</span>
        <span ref={totalRef} className="text-sm font-semibold font-mono text-white">
          ¢0
        </span>
      </div>
    </div>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}