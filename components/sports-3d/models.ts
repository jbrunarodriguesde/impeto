import * as THREE from 'three'

export type SportKind = 'shoe' | 'bottle' | 'dumbbell' | 'pilates' | 'mat' | 'bike' | 'volleyball' | 'headphones'
const palette = { coral: 0xe69b93, rose: 0xd78da3, peach: 0xf4c3ad, gold: 0xd8b48d }
export const glass = (color = palette.coral, lite = false) => new THREE.MeshPhysicalMaterial({
  color, metalness: 0.03, roughness: lite ? 0.46 : 0.34, transmission: lite ? 0.08 : 0.24,
  thickness: 0.45, ior: 1.42, transparent: true, opacity: lite ? 0.96 : 1,
  attenuationColor: new THREE.Color(color), attenuationDistance: 2.6,
  envMapIntensity: 0.45, clearcoat: 0.18, clearcoatRoughness: 0.32,
  side: THREE.DoubleSide, depthWrite: lite
})
const matte = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.76, metalness: 0.02 })
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
  const detail=matte(0xf6dfd8), dark=matte(0x805768)
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
    for(const [a,b] of [[A,B],[A,C],[C,B],[B,D],[D,[.91,-.43,.04]],[A,[-.91,-.43,.04]]] as [number,number,number][][])bar(g,a,b,.058,coral)
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
      add(g,new THREE.BoxGeometry(.24,.49,.36),pink,[x,-.35,0])
      add(g,new THREE.BoxGeometry(.11,.35,.27),detail,[x*1.11,-.35,0])
    }
  } else if(kind==='shoe') {
    // Cabedal, biqueira, calcanhar, solado, lingueta e cadarços definidos.
    const sole=new THREE.Shape()
    sole.moveTo(-1.04,-.2);sole.bezierCurveTo(-.78,-.38,.75,-.4,1.18,-.12)
    sole.lineTo(1.2,.05);sole.bezierCurveTo(.3,.16,-.65,.12,-1.04,.05);sole.closePath()
    add(g,new THREE.ExtrudeGeometry(sole,{depth:.34,bevelEnabled:true,bevelSize:.045,bevelThickness:.05,bevelSegments:2,curveSegments:10}),detail,[0,-.46,-.18])
    const upper=new THREE.Shape()
    upper.moveTo(-1.0,-.2);upper.bezierCurveTo(-.94,.34,-.68,.61,-.37,.53)
    upper.bezierCurveTo(-.08,.47,.1,.08,.4,.02);upper.bezierCurveTo(.83,-.04,1.06,-.11,1.1,-.2);upper.closePath()
    add(g,new THREE.ExtrudeGeometry(upper,{depth:.34,bevelEnabled:true,bevelSize:.06,bevelThickness:.05,bevelSegments:2,curveSegments:12}),pink,[0,-.14,-.16])
    add(g,new THREE.BoxGeometry(.52,.075,.37),coral,[-.33,.19,0],[0,0,-.25])
    for(let i=0;i<5;i++){
      const x=-.53+i*.15,y=.18-i*.048
      bar(g,[x,y,.26],[x+.11,y-.035,.26],.022,detail)
    }
    tube(g,[[-.9,.04,.2],[-.83,.31,.22],[-.65,.43,.2]],.035,coral)
  }
  // Cada objeto possui proporções próprias, mas cabe em um espaço 3D uniforme.
  g.rotation.set(-.08,.23,.06)
  return g
}
