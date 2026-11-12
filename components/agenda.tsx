import Form from 'next/form'
import Link from 'next/link'
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search } from 'lucide-react'
import { categories, type Event, formatDate, price } from '@/lib/catalog'
import { Button } from '@/components/ui/button'

export function EventCard({ event }: { event: Event }) {
  return <article className="event-card">
    <Link href={'/eventos/' + event.slug} className="event-card-link">
      <div className="card-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={'/fotos/' + event.image + '.webp'} alt="" loading="lazy" width="768" height="512" />
        <span className="card-date"><b>{formatDate(event.starts_at,{day:'2-digit'})}</b><span>{formatDate(event.starts_at,{month:'short'}).replace('.','')}</span></span>
      </div>
      <div className="card-info">
        <p className="eyebrow card-category">{event.category} <span/> {event.modality}</p>
        <h3>{event.title}</h3>
        <p className="card-location"><MapPin size={15}/>{event.city}</p>
        <div className="card-end"><span>{price(event.price_cents)}<small className="card-availability">{event.seats > 0 ? 'Inscrições abertas' : 'Vagas esgotadas'}</small></span><span className="card-action"><ArrowUpRight size={18}/></span></div>
      </div>
    </Link>
  </article>
}

export function Agenda({ events, query, category, type, page, more, demo }: {
  events: Event[]; query: string; category: string; type: string; page: number; more: boolean; demo: boolean
}) {
  const href = (nextCategory: string, nextPage = 1) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (nextCategory) params.set('categoria', nextCategory)
    if (type) params.set('tipo', type)
    if (nextPage > 1) params.set('pagina', String(nextPage))
    return '/' + (params.size ? '?' + params : '') + '#eventos'
  }

  return <section id="eventos" className="agenda"><div className="wrap">
    <div className="agenda-header">
      <div><p className="eyebrow"><span className="editorial-dot"/> Agenda</p><h2>Sua próxima <em>experiência.</em></h2></div>
      <ArrowDownRight className="agenda-arrow" size={56} strokeWidth={0.8} aria-hidden="true"/>
    </div>
    <div className="filters">
      <nav className="filter-tabs" aria-label="Categorias de eventos">
        {['', ...categories].map(item=><Link key={item} className="filter-pill" href={href(item)} aria-current={category === item ? 'page' : undefined}>{item || 'Todos'}</Link>)}
      </nav>
      <Form action="/#eventos" className="event-search">
        {category && <input name="categoria" type="hidden" value={category}/>}
        <label className="search-box"><Search size={16}/><input type="search" aria-label="Buscar eventos" name="q" defaultValue={query} placeholder="Buscar eventos" maxLength={90}/></label>
        <select name="tipo" aria-label="Preço" defaultValue={type}><option value="">Qualquer preço</option><option value="gratis">Gratuitos</option><option value="pago">Pagos</option></select>
        <Button type="submit">Buscar</Button>
      </Form>
    </div>
    {demo && <p className="demo-caption"><CalendarDays size={14}/> Agenda demonstrativa. As datas e os locais são fictícios.</p>}
    {events.length ? <div className="event-grid">{events.map(event=><EventCard key={event.id} event={event}/>)}</div> :
      <div className="empty"><CalendarDays size={24}/><h3>{query || category || type ? 'Nenhum evento encontrado' : 'Novos eventos em breve'}</h3>{(query || category || type) && <Button asChild variant="outline"><Link href="/#eventos">Limpar filtros</Link></Button>}</div>}
    {(page > 1 || more) && <nav className="pagination" aria-label="Paginação dos eventos">
      {page > 1 && <Button asChild variant="outline"><Link href={href(category, page - 1)}><ArrowLeft size={16}/> Anterior</Link></Button>}
      {more && <Button asChild variant="outline"><Link href={href(category, page + 1)}>Próxima <ArrowRight size={16}/></Link></Button>}
    </nav>}
  </div></section>
}
