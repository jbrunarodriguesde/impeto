import { ArrowDown, ArrowDownRight, ArrowUpRight, Wind, Flower2, CircleDot, MoveUpRight, Dumbbell, Sparkles } from 'lucide-react'
import { FilmMotion } from './film-motion'
import { SilkHero } from './hero/SilkHero'

const milestones = ['Descobrir', 'Aprender', 'Evoluir', 'Conectar', 'Conquistar']
const experiences = [
  { image: 'corrida', pair: 'ciclismo', title: 'Pegue ritmo.', caption: 'Corrida e ciclismo' },
  { image: 'volei', pair: 'futebol', title: 'Jogue em equipe.', caption: 'Vôlei e futebol feminino' },
  { image: 'workshop', pair: 'palestra', title: 'Tire ideias do papel.', caption: 'Workshops, palestras e empreendedorismo' },
  { image: 'bem-estar', pair: 'encontro', title: 'Abra espaço para você.', caption: 'Bem-estar e networking' }
]

const practices = [
  {
    name: 'Meditação',
    headline: 'A coragem de pausar.',
    description: 'Respirar, observar e voltar para o presente. Às vezes, o primeiro passo é desacelerar.',
    image: 'bem-estar',
    icon: Wind,
    feeling: 'Respire fundo'
  },
  {
    name: 'Yoga',
    headline: 'Presença em movimento.',
    description: 'Entre equilíbrio e respiração, descubra um jeito de se mover que respeita o seu tempo.',
    image: 'encontro',
    icon: Flower2,
    feeling: 'Encontre equilíbrio'
  },
  {
    name: 'Pilates',
    headline: 'A força do seu centro.',
    description: 'Controle, postura e consciência corporal em pequenos gestos que fazem diferença.',
    image: 'posicao',
    icon: CircleDot,
    feeling: 'Sinta seu centro'
  },
  {
    name: 'Alongamento',
    headline: 'Mais espaço para ser.',
    description: 'Mobilidade, leveza e liberdade para explorar novas possibilidades com o próprio corpo.',
    image: 'cadarco',
    icon: MoveUpRight,
    feeling: 'Abra novos caminhos'
  },
  {
    name: 'Musculação',
    headline: 'Sua potência é sua.',
    description: 'Construa força, autonomia e confiança, sem comparações ou padrões a seguir.',
    image: 'largada',
    icon: Dumbbell,
    feeling: 'Descubra sua força'
  }
]

export function Film() {
  return <div id="filme">
    <FilmMotion />
    <SilkHero/>
    <section id="movimento" className="film-scene evolution" aria-labelledby="evolution-title">
      <div className="film-stage evolution-stage">
        <div className="wrap evolution-copy">
          <p className="eyebrow"><span className="editorial-dot"/> O movimento</p>
          <h2 id="evolution-title">Movimento<br/> é <em>evolução.</em></h2>
          <ol className="milestones">{milestones.map(word=><li key={word}>{word}</li>)}</ol>
        </div>
        <svg className="track-map" viewBox="0 0 1200 630" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="track-rail" d="M-65 590 C156 590 192 463 343 437 C552 404 708 516 847 411 C941 340 918 199 1090 181 C1150 175 1205 191 1272 157"/>
          <path className="track-rail" d="M-65 632 C156 632 192 505 343 479 C552 446 708 558 847 453 C941 382 918 241 1090 223 C1150 217 1205 233 1272 199"/>
          <path className="track-progress" pathLength="1" d="M-65 590 C156 590 192 463 343 437 C552 404 708 516 847 411 C941 340 918 199 1090 181 C1150 175 1205 191 1272 157"/>
          <circle className="track-dot" r="8" cx="0" cy="0"/>
        </svg>
      </div>
    </section>
    <section className="film-scene paths-scene" aria-labelledby="paths-title">
      <div className="film-stage paths-stage wrap">
        <div className="paths-heading"><p className="eyebrow"><span className="editorial-dot"/> Experiências</p><h2 id="paths-title">Diferentes caminhos,<br/><em>infinitas possibilidades.</em></h2></div>
        <div className="experience-window">
          <div className="experience-reel">{experiences.map(exp=><figure className="experience" key={exp.image}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={'/fotos/' + exp.image + '.webp'} alt="" loading="lazy" width="768" height="512"/>
            <picture className="experience-pair">
              <source media="(max-width: 680px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"/>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={'/fotos/' + exp.pair + '.webp'} alt="" loading="lazy" width="600" height="400"/>
            </picture>
            <figcaption><small>{exp.caption}</small><strong>{exp.title}</strong></figcaption>
          </figure>)}</div>
          <div className="reel-line" aria-hidden="true"><span/></div>
        </div>
      </div>
    </section>
    <section className="breath-scene" aria-labelledby="breath-title">
      <div className="wrap breath-layout">
        <div className="breath-symbol" aria-hidden="true">
          <span className="breath-orbit breath-orbit-one"/>
          <span className="breath-orbit breath-orbit-two"/>
          <span className="breath-orbit breath-orbit-three"/>
          <span className="breath-core"><Wind size={40} strokeWidth={0.9}/></span>
        </div>
        <div className="breath-content">
          <p className="eyebrow"><span className="editorial-dot"/> Um convite para sentir</p>
          <h2 id="breath-title">Antes de tudo, <em>respire.</em></h2>
          <p>Não é sobre fazer mais. É sobre descobrir o que faz bem, no seu ritmo, do seu jeito.</p>
          <a href="#bem-estar" className="breath-link">Encontre o seu movimento <ArrowDownRight size={18}/></a>
        </div>
        <span className="breath-watermark" aria-hidden="true">pausa</span>
      </div>
    </section>
    <section id="bem-estar" className="wellness-chapter" aria-labelledby="wellness-title">
      <div className="wrap wellness-layout">
        <div className="wellness-intro">
          <p className="eyebrow"><span className="editorial-dot"/> Corpo &amp; mente</p>
          <h2 id="wellness-title">Nem todo avanço <em>precisa ser rápido.</em></h2>
          <p className="wellness-lead">Há dias de pausa. Há dias de potência. E todos eles fazem parte de uma jornada que é só sua.</p>
          <figure className="wellness-photo">
            <div className="wellness-gallery" aria-hidden="true">
              {practices.map((practice, index) =>
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={practice.name} className={'wellness-gallery-frame' + (index === 0 ? ' is-visible' : '')}
                  src={'/fotos/' + practice.image + '.webp'} alt="" loading="lazy" width="768" height="512"/>)}
            </div>
            <div className="wellness-photo-chrome">
              <span className="wellness-photo-label"><Sparkles size={15} strokeWidth={1.4}/> SENSAÇÕES EM MOVIMENTO</span>
              <figcaption>Seu corpo. Seu ritmo. <em>Seu movimento.</em></figcaption>
              <div className="wellness-photo-progress" aria-hidden="true">
                <span className="wellness-current-frame">01</span>
                <div className="wellness-progress-track"><i/></div>
                <span>05</span>
              </div>
            </div>
          </figure>
        </div>
        <div className="wellness-journey">
          <p className="wellness-overline">Cinco formas de se reconectar <span>01 — 05</span></p>
          <ol className="wellness-steps">
            {practices.map((practice, index) => {
              const Icon = practice.icon
              return <li className="wellness-step" key={practice.name}>
                <span className="wellness-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="wellness-step-content">
                  <div className="wellness-step-topline">
                    <p className="wellness-name">{practice.name}</p>
                    <Icon className="wellness-practice-icon" size={24} strokeWidth={1.25} aria-hidden="true"/>
                  </div>
                  <h3>{practice.headline}</h3>
                  <p className="wellness-description">{practice.description}</p>
                  <div className="wellness-step-thumb" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={'/fotos/' + practice.image + '.webp'} alt="" loading="lazy" width="768" height="512"/>
                    <span>{practice.feeling}</span>
                  </div>
                  <p className="wellness-feeling">{practice.feeling}<ArrowUpRight size={14} strokeWidth={1.5}/></p>
                </div>
              </li>
            })}
          </ol>
          <a className="wellness-link" href="#eventos">Descubra experiências para você <ArrowDownRight size={19}/></a>
        </div>
      </div>
    </section>
    <section id="comunidade" className="film-scene relay-scene" aria-labelledby="relay-title">
      <div className="film-stage relay-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="relay-frame" src="/fotos/revezamento.webp" alt="" width="768" height="512" loading="lazy"/>
        <div className="relay-shade"/>
        <svg className="relay-paths" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path pathLength="1" d="M621 332C688 345 789 334 844 399S879 556 1067 592"/>
          <path pathLength="1" d="M844 399C916 393 963 321 1028 303S1118 305 1169 267"/>
          <path pathLength="1" d="M844 399C903 420 994 440 1081 407"/>
          <circle cx="1067" cy="592" r="5"/><circle cx="1169" cy="267" r="5"/><circle cx="1081" cy="407" r="5"/>
        </svg>
        <div className="wrap relay-copy"><p className="eyebrow"><span className="editorial-dot"/> Conquistas compartilhadas</p><h2 id="relay-title">Quando uma mulher avança, <em>novos caminhos se abrem.</em></h2><a href="#eventos" className="hero-cta">Encontre sua próxima experiência <ArrowUpRight size={18}/></a></div>
      </div>
    </section>
  </div>
}
