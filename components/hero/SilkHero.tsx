import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { SportStage } from '../sports-3d/SportStage'
import styles from './SilkHero.module.css'

export function SilkHero() {
  return <section className={`silk-hero-shell ${styles.hero}`} aria-labelledby="hero-silk-title">
    <div className={styles.layout}>
      <div className={styles.content}>
        <p className={styles.eyebrow}><span/> ENERGIA FEMININA · CORPO &amp; MENTE</p>
        <h1 className={styles.title} id="hero-silk-title">O movimento <span>começa em <em>você.</em></span></h1>
        <p className={styles.description}>Viva experiências de fitness e bem-estar que respeitam o seu ritmo. Encontre força, leveza e uma comunidade para ir mais longe.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#eventos">Explorar eventos <ArrowUpRight size={19} strokeWidth={1.7}/></a>
          <a className={styles.secondary} href="#bem-estar">Descubra seu ritmo <ArrowDownRight size={19} strokeWidth={1.6}/></a>
        </div>
      </div>
      <SportStage scene="hero" className={styles.studio}/>
    </div>
    <div className={styles.bottom} aria-hidden="true">
      <span><Sparkles size={15} strokeWidth={1.4}/> SINTA · MOVA · TRANSFORME</span><span>01 / UMA NOVA ENERGIA</span>
    </div>
  </section>
}
