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
      const media = gsap.matchMedia()
      media.add({ desktop: '(min-width: 681px)', phone: '(max-width: 680px)' }, ({ conditions }) => {
        const phone = conditions?.phone
        const drive = (trigger: string) => ({ trigger, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true })

        if (phone) {
          // No celular, a narrativa flui verticalmente. Evitar cenas pinadas que
          // deixam grandes espaços vazios ao variar a altura do navegador.


          for (const item of root.querySelectorAll<HTMLElement>(
            '.evolution-copy, .paths-heading, .experience, .breath-content, .wellness-intro, .wellness-step, .relay-copy'
          )) {
            gsap.fromTo(item, { opacity: 0, y: 18 }, {
              opacity: 1,
              y: 0,
              duration: .7,
              ease: 'power2.out',
              scrollTrigger: { trigger: item, start: 'top 92%', once: true }
            })
          }

          const steps = Array.from(root.querySelectorAll<HTMLElement>('.wellness-step'))
          const photos = Array.from(root.querySelectorAll<HTMLElement>('.wellness-gallery-frame'))
          const counter = root.querySelector<HTMLElement>('.wellness-current-frame')
          const bar = root.querySelector<HTMLElement>('.wellness-progress-track i')
          const showPractice = (active: number) => {
            steps.forEach((step, index) => step.classList.toggle('is-active', index === active))
            photos.forEach((photo, index) => photo.classList.toggle('is-visible', index === active))
            if (counter) counter.textContent = String(active + 1).padStart(2, '0')
            if (bar) bar.style.transform = `scaleX(${(active + 1) / steps.length})`
          }
          if (steps.length && photos.length === steps.length) {
            steps.forEach((step, index) => {
              ScrollTrigger.create({
                trigger: step,
                start: 'top 80%',
                end: 'bottom 25%',
                onEnter: () => showPractice(index),
                onEnterBack: () => showPractice(index)
              })
            })
          }

          return () => {
            steps.forEach(step => step.classList.remove('is-active'))
            photos.forEach((photo, index) => photo.classList.toggle('is-visible', index === 0))
            if (counter) counter.textContent = '01'
            if (bar) bar.style.removeProperty('transform')
          }
        }

        // Os quadros extras pertencem à experiência cinematográfica do desktop.
        for (const frame of root.querySelectorAll<HTMLImageElement>('.alternate')) {
          frame.src = frame.dataset.src!
        }
        // A nova SilkHero controla sua animação 3D independentemente.
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
