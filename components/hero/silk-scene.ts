import * as THREE from 'three'

type Controller = { setActive(active: boolean): void; dispose(): void }

/**
 * Fitas orgânicas procedurais. Sem modelos, texturas, shaders externos ou sombras.
 * Executada somente no cliente após importação dinâmica em SilkCanvas.
 */
export function createSilkScene(canvas: HTMLCanvasElement, host: HTMLElement): Controller {
  const mobile = window.matchMedia('(max-width: 680px)').matches
  const segments = mobile ? 52 : 112
  const rows = mobile ? 8 : 14
  const frameMs = 1000 / (mobile ? 30 : 60)

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: !mobile, powerPreference: 'low-power',
    stencil: false, preserveDrawingBuffer: false
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.6))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0, mobile ? 14 : 11)

  const group = new THREE.Group()
  group.position.set(mobile ? 0.35 : 1.45, mobile ? 0.75 : 0.05, 0)
  scene.add(group)
  scene.add(new THREE.HemisphereLight(0xffe6de, 0x5f303e, 2.1))
  const key = new THREE.DirectionalLight(0xffd6a7, 3.1)
  key.position.set(-2, 5, 7)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xff8d9f, 1.45)
  fill.position.set(3, -3, 2)
  scene.add(fill)

  const colors = [
    ['#b96452', '#da918a', '#c39b5f'],
    ['#a95765', '#d38f91', '#b88e5e'],
    ['#bc7a4d', '#d9a2a1', '#d5b579']
  ]
  const ribbons: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[] = []

  for (let index = 0; index < 3; index++) {
    const geometry = new THREE.PlaneGeometry(6.2, 1.3, segments, rows)
    const position = geometry.getAttribute('position') as THREE.BufferAttribute
    const vertexColors = new Float32Array(position.count * 3)
    const shades = colors[index].map(hex => new THREE.Color(hex))
    const temp = new THREE.Color()
    for (let vertex = 0; vertex < position.count; vertex++) {
      const t = (vertex % (segments + 1)) / segments
      if (t < .52) temp.copy(shades[0]).lerp(shades[1], t / .52)
      else temp.copy(shades[1]).lerp(shades[2], (t - .52) / .48)
      vertexColors[vertex * 3] = temp.r
      vertexColors[vertex * 3 + 1] = temp.g
      vertexColors[vertex * 3 + 2] = temp.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3))
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true, side: THREE.DoubleSide, roughness: .48, metalness: .18
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    ribbons.push(mesh)
    group.add(mesh)
  }

  const bend = (mesh: typeof ribbons[number], index: number, time: number) => {
    const positions = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const phase = index * 1.7
    const offset = index - 1
    for (let row = 0; row <= rows; row++) {
      const v = row / rows - .5
      for (let column = 0; column <= segments; column++) {
        const u = column / segments
        const wave = u * Math.PI * 3.3 + time * 1.3 + phase
        const twist = u * Math.PI * 3.7 + time * .65 + phase
        const radius = (.83 + .14 * Math.sin(u * Math.PI * 2.4 + phase)) * v
        const y = offset * .48 + Math.sin(wave) * .57 + radius * Math.cos(twist)
        const z = offset * .3 + Math.cos(wave * .8) * .55 + radius * Math.sin(twist)
        positions.setXYZ(row * (segments + 1) + column, (u - .5) * 6.3, y, z)
      }
    }
    positions.needsUpdate = true
    mesh.geometry.computeVertexNormals()
  }

  const resize = () => {
    const width = Math.max(1, host.clientWidth)
    const height = Math.max(1, host.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.z = mobile ? 14 : width < 1050 ? 13 : 11
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  resize()

  const target = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const { left, right, top, bottom, width, height } = host.getBoundingClientRect()
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) return
    target.x = ((event.clientX - left) / width - .5) * 2
    target.y = ((event.clientY - top) / height - .5) * 2
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  let disposed = false
  let active = false
  let frame = 0
  let lastFrame = 0
  let elapsed = 0
  const render = (now: number) => {
    frame = 0
    if (disposed || !active || document.hidden) return
    frame = requestAnimationFrame(render)
    if (now - lastFrame < frameMs) return
    const delta = lastFrame === 0 ? 0 : Math.min((now - lastFrame) / 1000, .055)
    lastFrame = now
    elapsed += delta
    ribbons.forEach((mesh, index) => bend(mesh, index, elapsed))
    group.rotation.y += (target.x * .2 - group.rotation.y) * .055
    group.rotation.x += (-target.y * .11 - group.rotation.x) * .055
    group.rotation.z = Math.sin(elapsed * .4) * .045
    renderer.render(scene, camera)
  }
  const schedule = () => {
    if (disposed) return
    if (active && !document.hidden && !frame) {
      lastFrame = 0
      frame = requestAnimationFrame(render)
    } else if ((!active || document.hidden) && frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
  document.addEventListener('visibilitychange', schedule)
  ribbons.forEach((mesh, index) => bend(mesh, index, 0))
  renderer.render(scene, camera)

  return {
    setActive(value) { active = value; schedule() },
    dispose() {
      if (disposed) return
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', schedule)
      window.removeEventListener('pointermove', onPointer)
      ribbons.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose() })
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }
}
