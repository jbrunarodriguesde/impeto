import * as THREE from 'three'
import { makeSport, type SportKind } from './models'
import type { StudioScene } from './SportStage'

type Piece = { kind: SportKind; at: [number,number,number]; scale: number; rotate?: [number,number,number] }
const compositions: Record<StudioScene, Piece[]> = {
 hero: [
  {kind:'bottle',at:[1.75,1.05,-.8],scale:1,rotate:[-.12,0,-.15]},
  {kind:'shoe',at:[-.25,.2,.6],scale:1.8,rotate:[.38,-.48,-.18]},
  {kind:'dumbbell',at:[.6,-1.65,.3],scale:1.05,rotate:[.3,-.3,-.2]}
 ],
 movement: [
  {kind:'pilates',at:[1.05,.7,-1],scale:1.6},
  {kind:'dumbbell',at:[-.6,-.6,.5],scale:1.7,rotate:[.25,-.3,-.35]}
 ],
 experiences: [
  {kind:'bike',at:[-.45,.15,0],scale:1.5,rotate:[0,-.1,-.07]},
  {kind:'volleyball',at:[1.9,-.9,.6],scale:.95}
 ],
 wellness: [
  {kind:'pilates',at:[.65,.6,-.5],scale:1.85},
  {kind:'mat',at:[-.6,-1.1,.7],scale:1.65,rotate:[.25,-.25,-.15]}
 ],
 community: [{kind:'headphones',at:[0,.3,.3],scale:2.1,rotate:[.05,-.35,-.23]}]
}

export function createStudioScene(kind: StudioScene, lite: boolean) {
 const scene = new THREE.Scene()
 const root = new THREE.Group(); scene.add(root)
 const pieces = compositions[kind].map((piece,index) => {
   const group = new THREE.Group()
   const mesh = makeSport(piece.kind,lite)
   if (piece.rotate) mesh.rotation.set(...piece.rotate)
   group.add(mesh); group.position.set(...piece.at); group.scale.setScalar(piece.scale)
   root.add(group)
   return { group, y:piece.at[1], index }
 })
 scene.add(new THREE.HemisphereLight(0xfff5fa,0xd28dab,.85))
 const key=new THREE.DirectionalLight(0xfffaff,2.2);key.position.set(-3,6,8);scene.add(key)
 const fill=new THREE.DirectionalLight(0xffffff,.65);fill.position.set(5,1,3);scene.add(fill)
 const rim=new THREE.DirectionalLight(0xffc8e4,.9);rim.position.set(-4,3,-5);scene.add(rim)
 // Sombras de contato difusas, sem shadow maps ou passes adicionais.
 const surface=document.createElement('canvas');surface.width=128;surface.height=128
 const ctx=surface.getContext('2d')!
 const gradient=ctx.createRadialGradient(64,64,2,64,64,64)
 gradient.addColorStop(0,'rgba(110,35,70,.25)');gradient.addColorStop(.4,'rgba(110,35,70,.13)');gradient.addColorStop(1,'rgba(110,35,70,0)')
 ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128)
 const texture=new THREE.CanvasTexture(surface)
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.5),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}))
 shadow.position.set(0,-2.2,-2);root.add(shadow)
 const camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,50);camera.position.set(0,0,15)
 const resize=(width:number,height:number)=>{
  const aspect=width/height
  // Mantém a composição inteira também nos espaços mais estreitos.
  const halfHeight=aspect<.95 ? 3.1/aspect : 3.15
  camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight
  camera.updateProjectionMatrix()
 }
 const animate=(time:number,x:number,y:number,progress:number)=>{
  root.rotation.y=x*.045;root.rotation.x=-y*.025
  pieces.forEach(({group,y:base,index})=>{
   // Só o objeto principal flutua; os demais respondem discretamente ao scroll.
   group.position.y=base+(index===1||pieces.length===1?Math.sin(time*.48+index)*.055:0)+progress*.07
   group.rotation.z=Math.sin(time*.23+index)*.016
  })
 }
 const dispose=()=>{
  const geometry=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>()
  root.traverse(child=>{if(child instanceof THREE.Mesh){geometry.add(child.geometry);(Array.isArray(child.material)?child.material:[child.material]).forEach(m=>materials.add(m))}})
  geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose()
 }
 return {scene,camera,resize,animate,dispose}
}
