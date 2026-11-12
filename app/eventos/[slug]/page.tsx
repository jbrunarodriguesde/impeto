import { cache } from 'react'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, Heart, MapPin, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { currentMember } from '@/lib/auth'
import { getEvent, isFavorite, isLocal } from '@/lib/db'
import { formatDate, price } from '@/lib/catalog'
import { favorite } from '../actions'

const eventBySlug = cache(getEvent)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await eventBySlug(slug)
  if (!event) return { title:'Evento indisponível' }
  const description = event.description.slice(0,155)
  return {
    title:event.title, description, alternates:{ canonical:'/eventos/' + slug },
    openGraph:{ title:event.title, description, images:['/fotos/' + event.image + '.webp'] },
    ...(isLocal ? { robots:{ index:false, follow:false } } : {})
  }
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  await connection()
  const { slug } = await params
  const [event, member] = await Promise.all([eventBySlug(slug), currentMember()])
  if (!event) notFound()
  const saved = member ? await isFavorite(member.id,event.id) : false
  const open = Date.parse(event.starts_at) > Date.now()
  const site = process.env.SITE_URL || 'http://localhost:3000'
  const structured = {
    '@context':'https://schema.org', '@type':'Event', name:event.title,
    startDate:new Date(event.starts_at).toISOString(), endDate:new Date(event.ends_at).toISOString(),
    eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
    location:{ '@type':'Place', name:event.venue, address:event.city },
    image:[new URL('/fotos/' + event.image + '.webp',site).href], description:event.description,
    offers:{ '@type':'Offer', url:new URL('/eventos/' + slug + '/checkout',site).href, price:event.price_cents/100,
      priceCurrency:'BRL', availability:'https://schema.org/' + (open && event.seats > 0 ? 'InStock' : 'SoldOut') },
    organizer:{ '@type':'Organization', name:'Ímpeto', url:site }
  }
  return <section className="wrap page-section">
    {!isLocal && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/>}
    <Link href="/#eventos" className="back"><ArrowLeft size={16}/> Voltar à agenda</Link>
    <p className="eyebrow"><span className="editorial-dot"/> {event.category} · {event.modality}</p>
    <h1 className="page-title">{event.title}</h1>
    {isLocal && <p className="demo-caption">Evento demonstrativo. Data e local fictícios.</p>}
    <div className="detail-grid">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={'/fotos/' + event.image + '.webp'} alt="" className="detail-photo" width="768" height="512" fetchPriority="high"/>
        <p className="detail-description">{event.description}</p>
      </div>
      <aside className="panel stack">
        <h2>{price(event.price_cents)}</h2>
        <ul className="detail-meta">
          <li><CalendarDays size={20}/><div><b>{formatDate(event.starts_at,{dateStyle:'long'})}</b><span>{formatDate(event.starts_at,{timeStyle:'short'})} às {formatDate(event.ends_at,{timeStyle:'short'})} (Brasília)</span></div></li>
          <li><MapPin size={20}/><div><b>{event.venue}</b><span>{event.city}</span></div></li>
          <li><Ticket size={20}/><div>{open ? event.seats > 0 ? event.seats + (event.seats === 1 ? ' vaga disponível' : ' vagas disponíveis') : 'Vagas esgotadas' : 'Inscrições encerradas'}</div></li>
        </ul>
        {open && event.seats > 0 && <Button asChild><Link href={'/eventos/' + slug + '/checkout'}>Fazer inscrição <ArrowUpRight size={17}/></Link></Button>}
        <form action={favorite}><input type="hidden" name="slug" value={slug}/><input type="hidden" name="value" value={saved ? 'remove' : 'save'}/><Button variant="outline" className="w-full" aria-pressed={saved}><Heart size={16} fill={saved ? 'currentColor' : 'none'}/>{saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</Button></form>
        <a className="back" href={'/eventos/' + slug + '/calendario'}><Download size={16}/> Adicionar ao calendário</a>
      </aside>
    </div>
  </section>
}
