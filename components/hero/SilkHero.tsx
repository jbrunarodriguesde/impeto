import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { SilkCanvas } from './SilkCanvas'
import styles from './SilkHero.module.css'

// Primeiro capítulo da Ímpeto: o restante do storytelling continua em Film.
export function SilkHero() {
  return <section className={`silk-hero-shell ${styles.hero}`} aria-labelledby="hero-silk-title">
    <div className={styles.art} aria-hidden="true">
      <div className={styles.fallbackArt}/>
      <SilkCanvas/>
    </div>
    <div className={styles.overlay} aria-hidden="true"/>
    <div className={styles.content}>
      <p className={styles.eyebrow}><span className={styles.eyebrowLine}/> ENERGIA FEMININA · CORPO &amp; MENTE</p>
      <h1 className={styles.title} id="hero-silk-title">
        O movimento <span>começa em <em>você.</em></span>
      </h1>
      <p className={styles.description}>
        Viva experiências de fitness e bem-estar que respeitam o seu ritmo.
        Encontre força, leveza e uma comunidade para ir mais longe.
      </p>
      <div className={styles.actions}>
        <a className={styles.primary} href="#eventos">Explorar eventos <ArrowUpRight size={19} strokeWidth={1.7}/></a>
        <a className={styles.secondary} href="#bem-estar">Descubra seu ritmo <ArrowDownRight size={19} strokeWidth={1.6}/></a>
      </div>
    </div>
    <div className={styles.bottom} aria-hidden="true">
      <span><Sparkles size={15} strokeWidth={1.4}/> SINTA · MOVA · TRANSFORME</span>
      <span className={styles.bottomNote}>01 / UMA NOVA ENERGIA</span>
    </div>
  </section>
}
