'use client'

import { useEffect, useRef } from 'react'
import type { StudioScene } from './SportStage'

/** Um renderer, recortado aos espaços reservados no grid de cada capítulo. */
export function Sports3DOverlay() {
 const canvas=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const element=canvas.current
  if(!element)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  const connection=(navigator as Navigator & { connection?: { saveData?:boolean } }).connection
  if(reduced.matches||connection?.saveData)return
  let cancelled=false,cleanup:(()=>void)|undefined
  const start=async()=>{
   try {
    const [THREE,{createStudioScene},{RoomEnvironment}]=await Promise.all([import('three'),import('./studio-scene'),import('three/addons/environments/RoomEnvironment.js')])
    if(cancelled||reduced.matches)return
    const mobile=matchMedia('(max-width:680px)').matches
    const renderer=new THREE.WebGLRenderer({canvas:element,alpha:true,antialias:!mobile,powerPreference:'low-power',stencil:false})
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.5))
    renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment()
    const environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose()
    const stages=Array.from(document.querySelectorAll<HTMLElement>('[data-studio]')).map(host=>({host,visible:false,studio:undefined as ReturnType<typeof createStudioScene>|undefined}))
    let width=innerWidth,height=innerHeight,raf=0,previous=0,elapsed=0,mouseX=0,mouseY=0
    const resize=()=>{width=innerWidth;height=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,width<=680?1.25:1.5));renderer.setSize(width,height,false);wake()}
    const render=(now:number)=>{
     raf=0
     if(document.hidden||cancelled)return
     const visible=stages.filter(stage=>stage.visible)
     if(!visible.length){renderer.setScissorTest(false);renderer.clear();return}
     raf=requestAnimationFrame(render)
     if(now-previous<1000/(mobile?24:40))return
     elapsed+=previous?Math.min((now-previous)/1000,.06):0;previous=now
     renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true)
     for(const stage of visible){
      const rect=stage.host.getBoundingClientRect()
      if(rect.bottom<=0||rect.top>=height||rect.width<=0)continue
      if(!stage.studio){stage.studio=createStudioScene(stage.host.dataset.studio as StudioScene,mobile);stage.studio.scene.environment=environment.texture}
      stage.studio.resize(rect.width,rect.height)
      stage.studio.animate(elapsed,mouseX,mouseY,(height/2-rect.top-rect.height/2)/height)
      renderer.setViewport(rect.left,height-rect.bottom,rect.width,rect.height)
      renderer.setScissor(Math.max(0,rect.left),Math.max(0,height-rect.bottom),Math.min(rect.right,width)-Math.max(0,rect.left),Math.min(rect.bottom,height)-Math.max(0,rect.top))
      renderer.render(stage.studio.scene,stage.studio.camera)
      stage.host.dataset.ready='true'
     }
    }
    function wake(){if(!raf&&!cancelled&&!document.hidden&&!reduced.matches){previous=0;raf=requestAnimationFrame(render)}}
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){const stage=stages.find(stage=>stage.host===entry.target);if(stage){stage.visible=entry.isIntersecting;if(!stage.visible)delete stage.host.dataset.ready}}wake()},{threshold:0})
    stages.forEach(stage=>observer.observe(stage.host))
    const pointer=(event:PointerEvent)=>{if(event.pointerType==='mouse'){mouseX=event.clientX/width-.5;mouseY=event.clientY/height-.5}}
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()}
    const fallback=()=>{cancelAnimationFrame(raf);raf=0;renderer.setScissorTest(false);renderer.clear();stages.forEach(stage=>delete stage.host.dataset.ready)}
    const preference=()=>{if(reduced.matches){fallback();observer.disconnect()}else{stages.forEach(stage=>observer.observe(stage.host));wake()}}
    const lost=(event:Event)=>{event.preventDefault();fallback()}
    window.addEventListener('resize',resize,{passive:true});window.addEventListener('pointermove',pointer,{passive:true})
    document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference)
    element.addEventListener('webglcontextlost',lost)
    resize()
    cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();stages.forEach(stage=>{delete stage.host.dataset.ready;stage.studio?.dispose()});environment.dispose();renderer.dispose();window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);element.removeEventListener('webglcontextlost',lost)}
   }catch(error){console.warn('[Ímpeto] Mantendo composição estática.',error)}
  }
  const timer=setTimeout(()=>void start(),900)
  return()=>{cancelled=true;clearTimeout(timer);cleanup?.()}
 },[])
 return <canvas ref={canvas} className="sports-3d-overlay" aria-hidden="true" tabIndex={-1}/>
}
