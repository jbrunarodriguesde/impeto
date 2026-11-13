'use client'

import { useEffect, useRef } from 'react'
import styles from './SilkHero.module.css'

// A cena WebGL é carregada somente quando a capa está visível.
export function SilkCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let visible = false
    let loaded = false
    let scene: { setActive(active: boolean): void; dispose(): void } | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = async () => {
      if (loaded || cancelled) return
      loaded = true
      try {
        const { createSilkScene } = await import('./silk-scene')
        if (cancelled) return
        scene = createSilkScene(canvas, host)
        scene.setActive(visible)
      } catch (error) {
        console.warn('[Ímpeto] Three.js indisponível; usando fundo estático.', error)
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !loaded && timer === undefined) {
        timer = setTimeout(() => { timer = undefined; void load() }, 120)
      }
      scene?.setActive(visible)
    }, { threshold: 0.03 })
    observer.observe(host)

    return () => {
      cancelled = true
      observer.disconnect()
      if (timer) clearTimeout(timer)
      scene?.dispose()
    }
  }, [])

  return (
    <div ref={hostRef} className={styles.scene} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas}/>
    </div>
  )
}
