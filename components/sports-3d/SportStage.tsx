export type StudioScene = 'hero' | 'movement' | 'experiences' | 'wellness' | 'community'

/** Espaço reservado no grid: arte nunca disputa a área de leitura. */
export function SportStage({ scene, className = '' }: { scene: StudioScene; className?: string }) {
  return <div className={`sport-stage sport-stage-${scene} ${className}`} data-studio={scene} aria-hidden="true">
    {/* Render estático da cena 3D; sem animação ou troca para canvas. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="studio-fallback" src={`/studio/${scene}.webp`} alt="" width="900" height="760" loading={scene === 'hero' ? 'eager' : 'lazy'} fetchPriority={scene === 'hero' ? 'high' : 'auto'}/>
  </div>
}
