import { Suspense } from 'react'
import { Film } from '@/components/film'
import { Agenda } from '@/components/agenda'
import { getEvents, isLocal } from '@/lib/db'
import { categories } from '@/lib/catalog'

type Search = Promise<{ q?: string; categoria?: string; tipo?: string; pagina?: string }>
const pageSize = 9

async function Listings({ searchParams }: { searchParams: Search }) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 90) : ''
  const category = categories.find(value => value === params.categoria) ?? ''
  const type = params.tipo === 'gratis' || params.tipo === 'pago' ? params.tipo : ''
  const page = Math.min(999, Math.max(1, Number.parseInt(params.pagina || '1', 10) || 1))
  const events = await getEvents({ query, category, type, page, pageSize })
  return <Agenda events={events.slice(0, pageSize)} query={query} category={category} type={type} page={page} more={events.length > pageSize} demo={isLocal}/>
}

export default function Home({ searchParams }: { searchParams: Search }) {
  return <><Film/><Suspense fallback={<section className="wrap agenda-loading" id="eventos" aria-busy="true">Carregando agenda…</section>}><Listings searchParams={searchParams}/></Suspense></>
}
