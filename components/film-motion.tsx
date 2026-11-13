'use client'

import { useEffect } from 'react'

export function FilmMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let dispose: (() => void) | undefined
    let generation = 0
    const setup = async () => {
      const attempt = ++generation
      dispose?.()
      if (!preference.matches) return
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      const root = document.querySelector<HTMLElement>('#filme')
      if (!root || attempt !== generation || !preference.matches) return
      gsap.registerPlugin(ScrollTrigger)
      root.dataset.motion = 'on'
      const frames = Array.from(root.querySelectorAll<HTMLImageElement>('.alternate'))
      for (const frame of frames) frame.src = frame.dataset.src!
      const media = gsap.matchMedia()
      media.add({ desktop: '(min-width: 681px)', phone: '(max-width: 680px)' }, ({ conditions }) => {
        const phone = conditions?.phone
        const drive = (trigger: string) => ({ trigger, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true })
        const hero = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: drive('.hero-scene') })
        hero.fromTo('.hero-cover', { scale: 1 }, { scale: phone ? 1.14 : 1.24, transformOrigin: '80% 88%', duration: 0.36 }, 0)
        hero.fromTo('.frame-cadarco', { clipPath: 'inset(0 0 0 100%)', scale: 1.12 }, { clipPath: 'inset(0 0 0 0%)', scale: 1, duration: 0.23 }, 0.16)
        hero.fromTo('.frame-posicao', { clipPath: 'inset(100% 0 0 0)', scale: 1.12 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 0.23 }, 0.41)
        hero.fromTo('.frame-largada', { clipPath: 'inset(0 100% 0 0)', xPercent: -7, scale: 1.13 }, { clipPath: 'inset(0 0% 0 0)', xPercent: 0, scale: 1, duration: 0.29 }, 0.68)
        hero.to('.hero-lane path', { strokeDashoffset: 0, duration: 0.19 }, 0.81)
        hero.to('.chapter-indicator i', { scaleX: 1, duration: 1 }, 0)
        const path = root.querySelector<SVGPathElement>('.track-progress')!
        const dot = root.querySelector<SVGCircleElement>('.track-dot')!
        const words = Array.from(root.querySelectorAll<HTMLElement>('.milestones li'))
        const length = path.getTotalLength()
        ScrollTrigger.create({
          ...drive('.evolution'),
          onUpdate({ progress }) {
            const position = path.getPointAtLength(progress * length)
            path.style.strokeDashoffset = String(1 - progress)
            dot.setAttribute('cx', String(position.x))
            dot.setAttribute('cy', String(position.y))
            const active = Math.min(words.length - 1, Math.floor(progress * words.length))
            for (let index = 0; index < words.length; index++) words[index].classList.toggle('current', index === active)
          }
        })
        words[0].classList.add('current')
        gsap.to('.experience-reel', { xPercent: -75, ease: 'none', scrollTrigger: drive('.paths-scene') })
        gsap.to('.reel-line span', { scaleX: 1, ease: 'none', scrollTrigger: drive('.paths-scene') })
        // A pausa desacelera a narrativa, com revelação progressiva de texto.
        gsap.from('.breath-content > *', {
          y: phone ? 18 : 32,
          opacity: 0,
          stagger: .12,
          duration: .8,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.breath-scene', start: 'top 72%', toggleActions: 'play none none reverse' }
        })
        gsap.fromTo('.breath-symbol', { scale: .94 }, {
          scale: 1.035,
          ease: 'none',
          scrollTrigger: { trigger: '.breath-scene', start: 'top bottom', end: 'bottom top', scrub: true }
        })

        // Troca de fotografias sincronizada ao conteúdo, sem ocultar nada quando JS está desligado.
        const wellnessSteps = Array.from(root.querySelectorAll<HTMLElement>('.wellness-step'))
        const wellnessFrames = Array.from(root.querySelectorAll<HTMLElement>('.wellness-gallery-frame'))
        const currentFrame = root.querySelector<HTMLElement>('.wellness-current-frame')
        const progressBar = root.querySelector<HTMLElement>('.wellness-progress-track i')
        const selectScene = (active: number) => {
          wellnessFrames.forEach((frame, index) => frame.classList.toggle('is-visible', index === active))
          wellnessSteps.forEach((step, index) => step.classList.toggle('is-active', index === active))
          if (currentFrame) currentFrame.textContent = String(active + 1).padStart(2, '0')
          if (progressBar) progressBar.style.transform = `scaleX(${(active + 1) / wellnessSteps.length})`
        }
        if (wellnessSteps.length && wellnessFrames.length === wellnessSteps.length) {
          selectScene(0)
          wellnessSteps.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: step,
              start: 'top 68%',
              end: 'bottom 30%',
              onEnter: () => selectScene(index),
              onEnterBack: () => selectScene(index)
            })
          })
        }
        const relay = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: drive('.relay-scene') })
        relay.fromTo('.relay-frame', { scale: 1.13, xPercent: phone ? 0 : -3 }, { scale: 1, xPercent: 0, duration: 1 }, 0)
        relay.to('.relay-paths path', { strokeDashoffset: 0, duration: 0.7, stagger: 0.08 }, 0.14)
        relay.to('.relay-paths circle', { opacity: 1, duration: 0.12 }, 0.85)
        return () => {
          path.style.removeProperty('stroke-dashoffset')
          words.forEach(word => word.classList.remove('current'))
          wellnessSteps.forEach(step => step.classList.remove('is-active'))
          wellnessFrames.forEach((frame, index) => frame.classList.toggle('is-visible', index === 0))
          if (currentFrame) currentFrame.textContent = '01'
          if (progressBar) progressBar.style.removeProperty('transform')
        }
      }, root)
      const observer = new ResizeObserver(() => ScrollTrigger.refresh())
      observer.observe(root)
      dispose = () => {
        observer.disconnect()
        media.revert()
        delete root.dataset.motion
      }
    }
    const start = window.setTimeout(() => void setup(), 0)
    preference.addEventListener('change', setup)
    return () => {
      window.clearTimeout(start)
      preference.removeEventListener('change', setup)
      generation++
      dispose?.()
    }
  }, [])
  return null
}
