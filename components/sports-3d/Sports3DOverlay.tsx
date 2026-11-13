'use client'

import { useEffect, useRef } from 'react'
import type * as ThreeTypes from 'three'

/** Um único WebGLRenderer compartilhado por todas as seções.
 * Elementos decorativos não capturam eventos, não afetam o layout nem o SEO. */
export function Sports3DOverlay() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(max-width: 680px)')
    const small = window.matchMedia('(max-width: 1050px)')
    if (reduced.matches) return

    let cancelled = false
    let cleanup: (() => void) | undefined
    const start = async () => {
      try {
        const [THREE, { makeSport }] = await Promise.all([
          import('three'), import('./models')
        ])
        if (cancelled) return
        const lite = small.matches
        const mobile = coarse.matches
        const renderer = new THREE.WebGLRenderer({
          canvas: element, alpha: true, antialias: !lite,
          powerPreference: 'low-power', stencil: false, depth: true
        })
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(0, 0)
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : lite ? 1.25 : 1.6))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.15
        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-5,5,5,-5,.1,60)
        camera.position.z = 22
        scene.add(new THREE.HemisphereLight(0xffe9e0,0x624357,2.6))
        const key=new THREE.DirectionalLight(0xffdcc8,3.4);key.position.set(-5,7,10);scene.add(key)
        const rim=new THREE.DirectionalLight(0xf3a6b4,2.3);rim.position.set(7,2,-3);scene.add(rim)
        const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(1,-4,8);scene.add(fill)

        type Kind = import('./models').SportKind
        type Placement = { section: string; kind: Kind; x: number; y: number; size: number; phase: number }
        const placements: Placement[] = [
          {section:'.silk-hero-shell',kind:'shoe',x:.89,y:.43,size:1.05,phase:0},
          {section:'.silk-hero-shell',kind:'bottle',x:.95,y:.72,size:.52,phase:2.1},
          {section:'.silk-hero-shell',kind:'dumbbell',x:.97,y:.2,size:.42,phase:3.5},
          {section:'#movimento',kind:'dumbbell',x:.87,y:.6,size:.86,phase:1.2},
          {section:'.paths-scene',kind:'volleyball',x:.84,y:.37,size:.75,phase:1.4},
          {section:'.paths-scene',kind:'bike',x:.82,y:.72,size:.72,phase:3.1},
          {section:'.paths-scene',kind:'shoe',x:.92,y:.54,size:.57,phase:4.1},
          {section:'.breath-scene',kind:'pilates',x:.19,y:.49,size:.84,phase:2.4},
          {section:'.breath-scene',kind:'mat',x:.78,y:.74,size:.65,phase:3.9},
          {section:'#bem-estar',kind:'mat',x:.88,y:.27,size:.58,phase:2.2},
          {section:'#bem-estar',kind:'pilates',x:.88,y:.76,size:.5,phase:4.8},
          {section:'#comunidade',kind:'headphones',x:.84,y:.48,size:.83,phase:1.8},
          {section:'#eventos',kind:'volleyball',x:.91,y:.16,size:.4,phase:2.7},
          {section:'#eventos',kind:'bike',x:.94,y:.85,size:.37,phase:5.3},
          {section:'.site-footer',kind:'headphones',x:.88,y:.48,size:.56,phase:3.2},
          {section:'.site-footer',kind:'bottle',x:.96,y:.22,size:.34,phase:5.1}
        ]
        const objects=placements.map((p,index)=>{
          const root=new THREE.Group()
          const model=makeSport(p.kind,lite)
          root.add(model);scene.add(root)
          const anchor=document.querySelector<HTMLElement>(p.section)
          return {p,index,root,anchor}
        })
        let width=1,height=1,raf=0,active=true,visible=true,elapsed=0,last=0,mouseX=0,mouseY=0,targetX=0,targetY=0
        const resize=()=>{
          width=Math.max(1,innerWidth);height=Math.max(1,innerHeight)
          renderer.setSize(width,height,false)
          camera.left=-width/180;camera.right=width/180
          camera.top=height/180;camera.bottom=-height/180
          camera.updateProjectionMatrix()
        }
        resize()
        const onPointer=(e:PointerEvent)=>{
          if(e.pointerType==='touch')return
          targetX=(e.clientX/width-.5)*2;targetY=(e.clientY/height-.5)*2
        }
        const onLeave=()=>{targetX=0;targetY=0}
        const onVisibility=()=>{visible=!document.hidden;run()}
        const maxPerSection=mobile?1:lite?2:3
        const fps=mobile?24:lite?30:60
        const interval=1000/fps
        const render=(now:number)=>{
          raf=0
          if(!active||!visible)return
          raf=requestAnimationFrame(render)
          if(now-last<interval)return
          const dt=last?Math.min((now-last)/1000,.06):0
          last=now;elapsed+=dt
          const damp=1-Math.exp(-3.8*dt)
          mouseX+=(targetX-mouseX)*damp
          mouseY+=(targetY-mouseY)*damp
          const sectionCount=new Map<string,number>()
          let any=false
          for(const {p,root,anchor} of objects){
            if(!anchor){root.visible=false;continue}
            const rect=anchor.getBoundingClientRect()
            const inRange=rect.bottom>0&&rect.top<height
            const count=sectionCount.get(p.section)||0
            sectionCount.set(p.section,count+1)
            // Texto e CTAs têm prioridade: no mobile, apenas uma peça pequena
            // por seção, sempre à direita, fora da região principal de leitura.
            if(!inRange||count>=maxPerSection){root.visible=false;continue}
            const sectionY=rect.top+Math.min(rect.height,height*1.4)*p.y
            const sectionX=rect.left+rect.width*p.x
            const inFrame=sectionY>-120&&sectionY<height+120
            root.visible=inFrame
            if(!inFrame)continue
            any=true
            const progress=THREE.MathUtils.clamp((height-rect.top)/(height+rect.height),0,1)
            const depth=mobile?0:Math.sin(progress*Math.PI)*.18
            root.position.set(
              (sectionX-width/2)/90+(mobile?0:mouseX*.12*(1-p.size*.18)),
              (height/2-sectionY)/90+Math.sin(elapsed*(.54+p.phase*.025)+p.phase)*.085+(-mouseY*.07),
              depth
            )
            const size=p.size*(mobile?.72:lite?.84:1)
            root.scale.setScalar(size*(.92+.08*Math.min(1,progress*5)))
            root.rotation.set(
              Math.sin(elapsed*.39+p.phase)*.055+progress*.09,
              Math.sin(elapsed*.28+p.phase)*.075+mouseX*.07,
              Math.cos(elapsed*.33+p.phase)*.05
            )
          }
          if(any)renderer.render(scene,camera)
          else renderer.clear()
        }
        const run=()=>{if(active&&visible&&!raf){last=0;raf=requestAnimationFrame(render)}else if((!active||!visible)&&raf){cancelAnimationFrame(raf);raf=0}}
        const onScroll=()=>{if(!raf)run()}
        window.addEventListener('resize',resize,{passive:true})
        window.addEventListener('pointermove',onPointer,{passive:true})
        document.addEventListener('pointerleave',onLeave)
        document.addEventListener('visibilitychange',onVisibility)
        window.addEventListener('scroll',onScroll,{passive:true})
        run()
        cleanup=()=>{
          active=false;run()
          window.removeEventListener('resize',resize)
          window.removeEventListener('pointermove',onPointer)
          document.removeEventListener('pointerleave',onLeave)
          document.removeEventListener('visibilitychange',onVisibility)
          window.removeEventListener('scroll',onScroll)
          const geometries=new Set<ThreeTypes.BufferGeometry>()
          const materials=new Set<ThreeTypes.Material>()
          for(const {root} of objects)root.traverse(child=>{
            if(child instanceof THREE.Mesh){
              geometries.add(child.geometry)
              const mats=Array.isArray(child.material)?child.material:[child.material]
              mats.forEach(m=>materials.add(m))
            }
          })
          geometries.forEach(g=>g.dispose())
          materials.forEach(m=>m.dispose())
          renderer.dispose()
          renderer.forceContextLoss()
        }
      }catch(error){console.error('[Ímpeto] Falha ao iniciar objetos 3D; mantendo conteúdo HTML.',error)}
    }
    // Adia o WebGL até a página estar interativa.
    const id=window.setTimeout(()=>void start(),500)
    return()=>{cancelled=true;clearTimeout(id);cleanup?.()}
  },[])
  return <canvas ref={canvas} className="sports-3d-overlay" aria-hidden="true" tabIndex={-1}/>
}
