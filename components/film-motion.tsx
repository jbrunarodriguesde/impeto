'use client'
import { useEffect } from 'react'

export function FilmMotion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: no-preference)')
    let dispose: (() => void) | undefined
    let generation = 0
    const setup = async () => {
      const attempt = ++generation
      dispose?.()
      if (!preference.matches) return
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (attempt !== generation) return
      gsap.registerPlugin(ScrollTrigger)
      const context = gsap.context(() => {
        for (const item of document.querySelectorAll('.evolution-copy, .paths-heading, .breath-content, .wellness-step, .relay-copy')) {
          gsap.from(item, { y: 20, opacity: 0, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 94%', once: true } })
        }
        gsap.fromTo('.track-progress', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#movimento', start: 'top 80%', end: 'bottom 30%', scrub: 1 } })
        if (matchMedia('(min-width:681px)').matches) {
          const frames = document.querySelectorAll('.wellness-gallery-frame')
          document.querySelectorAll('.wellness-step').forEach((step, index) => {
            const show = () => {
              frames.forEach((frame, i) => frame.classList.toggle('is-visible', i === index))
              const counter = document.querySelector('.wellness-current-frame')
              if (counter) counter.textContent = String(index + 1).padStart(2, '0')
              const bar = document.querySelector<HTMLElement>('.wellness-progress-track i')
              if (bar) bar.style.transform = `scaleX(${(index + 1) / 5})`
            }
            ScrollTrigger.create({ trigger: step, start: 'top 65%', onEnter: show, onEnterBack: show })
          })
        }
      }, '#filme')
      dispose = () => context.revert()
    }
    void setup()
    preference.addEventListener('change', setup)
    return () => { generation++; dispose?.(); preference.removeEventListener('change', setup) }
  }, [])
  return null
}
