'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import styles from './wellness-carousel.module.css'

export type Practice = {
  name: string
  headline: string
  description: string
  image: string
  feeling: string
}

export function WellnessMobileCarousel({ practices }: { practices: Practice[] }) {
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [direction, setDirection] = useState(1)
  const [reduced, setReduced] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lock = useRef(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const previous = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const regionId = 'wellness-mobile-slide'

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => {
      query.removeEventListener('change', update)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const navigate = (step: number) => {
    if (lock.current) return
    const target = active + step
    if (target < 0 || target >= practices.length) return
    lock.current = true
    setBusy(true)
    setDirection(step)
    const focused = document.activeElement
    // O foco nunca permanece num botão que se tornará disabled.
    if (target === 0 && focused === previous.current) next.current?.focus()
    if (target === practices.length - 1 && focused === next.current) previous.current?.focus()
    setActive(target)
    setAnnouncement(`${practices[target].name}, ${target + 1} de ${practices.length}`)
    timer.current = setTimeout(() => {
      lock.current = false
      setBusy(false)
      timer.current = null
    }, reduced ? 0 : 380)
  }

  return <div className={styles.carousel} aria-label="Cinco formas de se reconectar">
    <div className={styles.viewport}
      onTouchStart={event => { const touch = event.touches[0]; start.current = { x: touch.clientX, y: touch.clientY } }}
      onTouchEnd={event => {
        const touch = event.changedTouches[0]
        if (!start.current) return
        const dx = touch.clientX - start.current.x
        const dy = touch.clientY - start.current.y
        start.current = null
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) navigate(dx < 0 ? 1 : -1)
      }}
      onTouchCancel={() => { start.current = null }}
    >
      <div id={regionId} className={styles.slide} key={active} data-direction={direction} data-reduced={reduced}>
        <span className={styles.number}>{String(active + 1).padStart(2, '0')}</span>
        <p className={styles.name}>{practices[active].name}</p>
        <h3>{practices[active].headline}</h3>
        <p className={styles.description}>{practices[active].description}</p>
        <figure className={styles.image}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/fotos/${practices[active].image}.webp`} alt="" width="768" height="512" loading="lazy"/>
          <figcaption>{practices[active].feeling} <ArrowUpRight size={16}/></figcaption>
        </figure>
      </div>
    </div>
    <div className={styles.controls}>
      <button ref={previous} type="button" aria-label="Anterior" aria-controls={regionId}
        disabled={active === 0 || busy} onClick={() => navigate(-1)}>
        <ArrowLeft size={19} aria-hidden="true"/><span>Anterior</span>
      </button>
      <span className={styles.counter} aria-hidden="true">{String(active + 1).padStart(2, '0')} <span>/</span> {String(practices.length).padStart(2, '0')}</span>
      <button ref={next} type="button" aria-label="Próximo" aria-controls={regionId}
        disabled={active === practices.length - 1 || busy} onClick={() => navigate(1)}>
        <span>Próximo</span><ArrowRight size={19} aria-hidden="true"/>
      </button>
    </div>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>
}
