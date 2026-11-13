import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type SportKind = 'shoe' | 'bottle' | 'dumbbell' | 'pilates' | 'mat' | 'bike' | 'volleyball' | 'headphones'
const palette = { coral: 0xff91c1, rose: 0xee8aba, peach: 0xffd4e6, gold: 0xffffff }
// Plástico premium opaco: as silhuetas continuam reconhecíveis em fundo claro.
export const glass = (color = palette.coral, lite = false) => new THREE.MeshPhysicalMaterial({
  color, metalness: 0.02, roughness: lite ? .38 : .3, transmission: 0,
  clearcoat: .65, clearcoatRoughness: .24, envMapIntensity: .6
})
const matte = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.08 })
const add = (group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, pos: [number,number,number] = [0,0,0], rot?: [number,number,number]) => {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...pos)
  if (rot) mesh.rotation.set(...rot)
  group.add(mesh)
  return mesh
}
const tube = (group: THREE.Group, points: [number,number,number][], radius: number, material: THREE.Material) =>
  add(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))), Math.max(18,points.length*8),radius,7,false),material)
const bar = (group: THREE.Group, a: [number,number,number], b: [number,number,number], radius: number, material: THREE.Material) => {
  const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), diff=end.clone().sub(start)
  const mesh=add(group,new THREE.CylinderGeometry(radius,radius,diff.length(),10),material)
  mesh.position.copy(start.add(end).multiplyScalar(.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize())
  return mesh
}
const torus = (g:THREE.Group,r:number,t:number,m:THREE.Material,p:[number,number,number],rot?:[number,number,number])=>add(g,new THREE.TorusGeometry(r,t,9,48),m,p,rot)

export function makeSport(kind: SportKind, lite: boolean): THREE.Group {
  const g = new THREE.Group()
  const pink=glass(palette.rose,lite), coral=glass(palette.coral,lite), peach=glass(palette.peach,lite)
  const detail=matte(0xfff7fb), dark=matte(0x873758)
  if(kind==='dumbbell') {
    for(const offset of [-.28,.28]) {
      const d=new THREE.Group(); d.position.set(offset,offset*.35,offset*.45); d.rotation.z=offset*.65;g.add(d)
      bar(d,[-.72,0,0],[.72,0,0],.09,detail)
      for(const side of [-1,1]) {
        add(d,new THREE.CylinderGeometry(.29,.29,.23,16),coral,[side*.53,0,0],[0,0,Math.PI/2])
        add(d,new THREE.CylinderGeometry(.20,.20,.05,16),pink,[side*.68,0,0],[0,0,Math.PI/2])
      }
    }
  } else if(kind==='pilates') {
    add(g,new THREE.SphereGeometry(.88,lite?22:44, lite?16:30),peach)
    for(let i=0;i<9;i++) torus(g,.88*Math.cos((i-4)*.15),.008,detail,[0,Math.sin((i-4)*.15)*.88,0],[Math.PI/2,0,0])
  } else if(kind==='volleyball') {
    add(g,new THREE.SphereGeometry(.85,lite?22:40,18),pink)
    for(let i=0;i<6;i++){
      const band=torus(g,.86,.021,i%2?detail:coral,[0,0,0],[i*.48,i*.62,0])
      band.scale.y=.94
    }
  } else if(kind==='bottle') {
    add(g,new THREE.CylinderGeometry(.34,.38,1.45,24,1),peach,[0,-.13,0])
    add(g,new THREE.CylinderGeometry(.23,.34,.28,24),coral,[0,.73,0])
    add(g,new THREE.CylinderGeometry(.25,.25,.21,24),dark,[0,.96,0])
    torus(g,.31,.045,detail,[0,.5,0],[Math.PI/2,0,0])
    tube(g,[[.2,1.02,0],[.44,1.15,0],[.47,.92,0]],.055,detail)
  } else if(kind==='mat') {
    // Espiral lateral visível e superfície parcialmente desenrolada.
    const shape=new THREE.Shape();shape.moveTo(-1.12,-.5);shape.lineTo(.48,-.5);shape.lineTo(.48,.5);shape.lineTo(-1.12,.5);shape.closePath()
    add(g,new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.045,bevelThickness:.025,bevelSegments:2}),pink,[0,-.35,0],[Math.PI/2,0,0])
    const roll=add(g,new THREE.CylinderGeometry(.33,.33,1.1,32),coral,[.48,-.13,0],[Math.PI/2,0,0])
    roll.rotation.z=.08
    for(let i=0;i<3;i++) torus(g,.12+i*.08,.022,detail,[.48,-.13,-.58],[0,0,0])
  } else if(kind==='bike') {
    for(const x of [-.91,.91]) {
      torus(g,.62,.055,dark,[x,-.43,0])
      torus(g,.54,.012,detail,[x,-.43,.015])
      for(let i=0;i<8;i++){const a=i*Math.PI/4;bar(g,[x,-.43,.015],[x+Math.cos(a)*.53,-.43+Math.sin(a)*.53,.015],.009,detail)}
    }
    const A:[number,number,number]=[-.32,-.37,.04],B:[number,number,number]=[.36,-.37,.04],C:[number,number,number]=[-.13,.32,.04],D:[number,number,number]=[.48,.37,.04]
    for(const [a,b] of [[A,B],[A,C],[C,B],[C,D],[B,D],[D,[.91,-.43,.04]],[A,[-.91,-.43,.04]],[C,[-.91,-.43,.04]]] as [number,number,number][][])bar(g,a,b,.058,coral)
    bar(g,[-.13,.32,.04],[-.2,.53,.04],.045,dark)
    bar(g,[-.47,.55,.04],[.02,.55,.04],.065,detail)
    bar(g,[.48,.37,.04],[.51,.61,.04],.045,detail)
    bar(g,[.33,.63,.04],[.78,.63,.04],.038,dark)
    torus(g,.13,.035,dark,[.36,-.37,.09])
  } else if(kind==='headphones') {
    const curve=[] as [number,number,number][]
    for(let i=0;i<=24;i++){const a=Math.PI*i/24;curve.push([Math.cos(a)*.75,Math.sin(a)*.92-.16,0])}
    tube(g,curve,.095,coral)
    for(const x of [-.74,.74]){
      const cup=add(g,new THREE.CapsuleGeometry(.18,.25,6,20),pink,[x,-.35,0]);cup.scale.z=.8
      const cushion=add(g,new THREE.SphereGeometry(1,20,14),coral,[x,-.35,.15]);cushion.scale.set(.13,.245,.07)
      const inset=add(g,new THREE.SphereGeometry(1,16,12),peach,[x,-.35,.205]);inset.scale.set(.065,.14,.025)
      bar(g,[x,-.12,0],[x,-.34,0],.035,detail)
    }
  } else if(kind==='shoe') {
    const sole = new THREE.Shape()
    sole.moveTo(-1.04,-.18); sole.bezierCurveTo(-1.15,-.38,.58,-.48,1.19,-.2)
    sole.bezierCurveTo(1.35,-.06,1.18,.04,1.02,.07)
    sole.bezierCurveTo(.24,.02,-.7,.15,-1.04,.02); sole.closePath()
    const extrude = (shape: THREE.Shape, depth: number, bevel: number) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:true, bevelSize:bevel, bevelThickness:bevel, bevelSegments:3, curveSegments:20, steps:1 })
    add(g,extrude(sole,.53,.065),detail,[0,-.36,-.265])
    const outsole=add(g,extrude(sole,.52,.035),coral,[0,-.46,-.26]);outsole.scale.y=.72
    const upper = new THREE.Shape()
    upper.moveTo(-1.01,-.18); upper.bezierCurveTo(-1.02,.2,-.95,.48,-.73,.48)
    upper.bezierCurveTo(-.59,.45,-.54,.35,-.33,.35)
    upper.bezierCurveTo(-.08,.31,.06,.06,.43,.025)
    upper.bezierCurveTo(.83,.0,1.17,-.06,1.17,-.2)
    upper.bezierCurveTo(.8,-.33,-.59,-.34,-1.01,-.18);upper.closePath()
    add(g,extrude(upper,.46,.12),pink,[0,-.08,-.23])
    // Col de cheville, intérieur, languette et coutures contrastées.
    const opening=add(g,new THREE.SphereGeometry(1,24,12),dark,[-.68,.35,.025]);opening.scale.set(.24,.06,.24);opening.rotation.z=.22
    const collar=torus(g,.215,.055,coral,[-.68,.35,.025],[Math.PI/2,0,.2]);collar.scale.set(1,1.15,1)
    const tongue=add(g,new THREE.CapsuleGeometry(.14,.29,5,12),peach,[-.3,.29,.03],[0,0,.92]);tongue.scale.z=.36
    for(let i=0;i<5;i++) {
      const x=-.47+i*.13, y=.30-i*.065
      tube(g,[[x-.045,y-.03,.23],[x+.025,y+.06,.05],[x+.10,y-.03,-.18]],.018,detail)
      add(g,new THREE.SphereGeometry(.025,7,5),dark,[x-.045,y-.03,.25])
    }
    tube(g,[[-.35,.3,.19],[-.54,.45,.24],[-.24,.4,.29],[-.35,.3,.19],[-.13,.36,.29],[-.18,.20,.30]],.016,detail)
    // Painel lateral e costuras do cabedal, sem marca de terceiros.
    const panel=new THREE.Shape();panel.moveTo(-.65,.01);panel.lineTo(-.43,.15);panel.lineTo(.30,-.10);panel.lineTo(.55,-.10);panel.lineTo(.07,-.23);panel.lineTo(-.65,-.12);panel.closePath()
    add(g,extrude(panel,.012,.012),peach,[0,-.04,.36])
    tube(g,[[-.98,-.08,.32],[-.83,.27,.32],[-.67,.38,.32]],.016,coral)
    tube(g,[[.38,-.15,.36],[.65,-.1,.35],[1.0,-.18,.29]],.012,coral)
    tube(g,[[-1.02,-.39,.36],[-.3,-.48,.38],[.65,-.43,.38],[1.15,-.31,.3]],.012,peach)
    for(let i=0;i<12;i++) {
      const tread=add(g,new THREE.BoxGeometry(.08,.035,.5),dark,[-.86+i*.17,-.62,.02]);tread.rotation.z=.06
    }
    for(let i=0;i<6;i++)for(let j=0;j<3;j++) {
      add(g,new THREE.SphereGeometry(.009,4,3),coral,[.45+i*.075,-.04-j*.045,.33-j*.009])
    }
    // Alça de calcanhar.
    tube(g,[[-1.02,.35,-.12],[-1.12,.58,-.12],[-.96,.55,-.12]],.028,detail)
  }
  // Agrupa por material: detalhes continuam presentes com poucas draw calls.
  g.updateMatrixWorld(true)
  const batches=new Map<THREE.Material,THREE.BufferGeometry[]>()
  const originals=new Set<THREE.BufferGeometry>()
  g.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return
    const material=child.material as THREE.Material
    const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone()
    geometry.applyMatrix4(child.matrixWorld)
    const batch=batches.get(material)||[];batch.push(geometry);batches.set(material,batch)
    originals.add(child.geometry)
  })
  g.clear()
  for(const [material,geometries] of batches){
    const merged=mergeGeometries(geometries,false)
    if(merged)add(g,merged,material)
    geometries.forEach(geometry=>geometry.dispose())
  }
  originals.forEach(geometry=>geometry.dispose())
  for(const material of [pink,coral,peach,detail,dark])if(!batches.has(material))material.dispose()
  // Cada objeto possui proporções próprias, mas cabe em um espaço 3D uniforme.
  g.rotation.set(-.08,.23,.06)
  return g
}
