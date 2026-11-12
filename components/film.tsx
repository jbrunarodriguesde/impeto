import { ArrowDown, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { FilmMotion } from './film-motion'

const milestones = ['Descobrir', 'Aprender', 'Evoluir', 'Conectar', 'Conquistar']
const experiences = [
  { image: 'corrida', pair: 'ciclismo', title: 'Pegue ritmo.', caption: 'Corrida e ciclismo' },
  { image: 'volei', pair: 'futebol', title: 'Jogue em equipe.', caption: 'Vôlei e futebol feminino' },
  { image: 'workshop', pair: 'palestra', title: 'Tire ideias do papel.', caption: 'Workshops, palestras e empreendedorismo' },
  { image: 'bem-estar', pair: 'encontro', title: 'Abra espaço para você.', caption: 'Bem-estar e networking' }
]

export function Film() {
  return <div id="filme">
    <FilmMotion />
    <section className="film-scene hero-scene" aria-labelledby="hero-title">
      <div className="film-stage hero-stage">
        <div className="hero-frames" aria-hidden="true">
          <picture className="hero-frame hero-cover">
            <source media="(max-width: 680px)" srcSet="/fotos/capa-mobile.webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/capa.webp" alt="" width="1536" height="1024" fetchPriority="high" />
          </picture>
          {['cadarco', 'posicao', 'largada'].map(frame =>
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className={'hero-frame alternate frame-' + frame} key={frame} data-src={'/fotos/' + frame + '.webp'} alt="" width="768" height="512" />
          )}
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <svg className="hero-lane" viewBox="0 0 1200 630" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path pathLength="1" d="M1200 472C925 471 943 535 667 535C395 535 288 530 -65 590"/>
        </svg>
        <div className="wrap hero-body">
          <div className="hero-copy">
            <div className="eyebrow hero-kicker"><span/> Esporte, desenvolvimento e comunidade</div>
            <h1 id="hero-title">O seu próximo<br className="wide-break"/> movimento<br/><em>transforma tudo.</em></h1>
            <p>Corra, aprenda e encontre mulheres que também querem dar o próximo passo.</p>
            <a className="hero-cta" href="#eventos">Explore os eventos <ArrowUpRight size={18}/></a>
          </div>
          <div className="hero-side" aria-hidden="true"><span/> O PRIMEIRO PASSO</div>
        </div>
        <div className="hero-bottom"><div className="wrap hero-bottom-inner">
          <a href="#movimento" className="scroll-link"><span className="round-arrow"><ArrowDown size={15}/></span> <span>Role para começar</span></a>
          <div className="chapter-indicator" aria-hidden="true"><span>01</span><div><i/></div><span>04</span></div>
          <a href="#eventos" className="jump-link">Ir direto aos eventos <ArrowDownRight size={15}/></a>
        </div></div>
      </div>
    </section>
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
