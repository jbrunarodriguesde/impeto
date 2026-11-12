import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import { ActionForm } from '@/components/action-form'
import { activeRegistration, getEvent, isLocal } from '@/lib/db'
import { requireMember, localTestCheckout } from '@/lib/auth'
import { paymentAvailable, stripe } from '@/lib/payments'
import { price, formatDate } from '@/lib/catalog'
import { checkout } from '../../actions'

export const metadata: Metadata = { title:'Inscrição', robots:{ index:false, follow:false } }

export default async function Checkout({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()
  const member = await requireMember('/eventos/' + slug + '/checkout')
  const registration = await activeRegistration(member.id,event.id)
  if (registration?.status === 'confirmed') redirect('/conta/ingressos/' + registration.id)
  const amount = registration?.amount ?? event.price_cents
  const paid = amount > 0
  const test = registration ? registration.payment_mode === 'test' : !stripe
  const canPay = !paid || (registration ? test ? localTestCheckout : Boolean(stripe) : paymentAvailable)
  const open = Date.parse(event.starts_at) > Date.now()
  return <section className="wrap page-section narrow">
    <Link className="back" href={'/eventos/' + slug}><ArrowLeft size={16}/> Voltar ao evento</Link>
    <h1 className="page-title">Sua inscrição.</h1>
    <div className="panel stack">
      <h2>{event.title}</h2>
      <ul className="detail-meta">
        <li><CalendarDays size={18}/>{formatDate(event.starts_at,{dateStyle:'long',timeStyle:'short'})} (Brasília)</li>
        <li><MapPin size={18}/>{event.venue} · {event.city}</li>
      </ul>
      <div className="list-entry"><strong>{member.name}</strong><p>{member.email}</p></div>
      <div className="page-head"><strong>Total</strong><strong>{price(amount)}</strong></div>
      {isLocal && <p className="demo-caption">Inscrição em evento demonstrativo.</p>}
      {paid && localTestCheckout && test && <p className="feedback ok">Checkout de teste. Nenhum valor será cobrado.</p>}
      {open && (event.seats > 0 || registration) && canPay ?
        <ActionForm action={checkout} values={{slug}} label={paid ? 'Continuar para pagamento' : 'Confirmar inscrição'}/> :
        <p className="feedback">{!open ? 'As inscrições foram encerradas.' : event.seats <= 0 && !registration ? 'As vagas deste evento se esgotaram.' : 'O pagamento ainda está indisponível para este evento.'}</p>}
    </div>
  </section>
}
