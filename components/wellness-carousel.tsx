'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function WellnessCarousel({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const list = host.current?.querySelector<HTMLOListElement>('ol')
    if (!list) return
    const observer = new IntersectionObserver(entries => {
      if (!window.matchMedia('(max-width:680px)').matches) return
      const entry = entries.find(entry => entry.isIntersecting)
      if (!entry) return
      const index = Array.from(list.children).indexOf(entry.target)
      setActive(index)
      document.querySelectorAll('.wellness-gallery-frame').forEach((frame, i) => frame.classList.toggle('is-visible', i === index))
      const counter = document.querySelector('.wellness-current-frame')
      if (counter) counter.textContent = String(index + 1).padStart(2, '0')
    }, { root: list, threshold: .6 })
    Array.from(list.children).forEach(child => observer.observe(child))
    return () => observer.disconnect()
  }, [])
  const go = (index: number) => {
    const list = host.current?.querySelector<HTMLOListElement>('ol')
    const item = list?.children[index] as HTMLElement | undefined
    if (!list || !item) return
    list.scrollTo({ left: item.offsetLeft - (list.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' })
  }
  return <div ref={host} className="wellness-carousel">
    {children}
    <div className="wellness-controls">
      <p aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} <span>/ 05</span></p>
      <div><button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Prática anterior" aria-controls="wellness-practices"><ArrowLeft size={19}/></button>
      <button type="button" onClick={() => go(active + 1)} disabled={active === 4} aria-label="Próxima prática" aria-controls="wellness-practices"><ArrowRight size={19}/></button></div>
    </div>
  </div>
}
