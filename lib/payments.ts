import 'server-only'
import Stripe from 'stripe'
import { db, confirmRegistration, isLocal, type Registration } from './db'
import { localTestCheckout } from './auth'

const stripeKey = process.env.STRIPE_SECRET_KEY
const webhook = process.env.STRIPE_WEBHOOK_SECRET
const origin = process.env.SITE_URL
export const stripe = stripeKey && webhook && origin && (!isLocal || stripeKey.startsWith('sk_test_') || stripeKey.startsWith('rk_test_'))
  ? new Stripe(stripeKey, { maxNetworkRetries: 1, timeout: 10000 }) : null
export const paymentAvailable = Boolean(stripe || localTestCheckout)

type Reservation = Pick<Registration, 'id' | 'status' | 'amount' | 'payment_mode' | 'stripe_session' | 'created_at'> & { title: string; slug: string }

export async function reserve(memberId: string, slug: string): Promise<Reservation> {
  return (await db()).transaction(async query => {
    const [event] = await query<{id:string; title:string; slug:string; price_cents:number; capacity:number}>(`select id,title,slug,price_cents,capacity
      from impeto.events where slug=$1 and published and starts_at > now() for update`, [slug])
    if (!event) throw new CheckoutIssue('Este evento já encerrou as inscrições.')
    const fields = 'id,status,amount,payment_mode,stripe_session,created_at::text'
    const [previous] = await query<Reservation>(`select ${fields} from impeto.registrations
      where event_id=$1 and member_id=$2 and status <> 'expired'`, [event.id,memberId])
    if (previous) return { ...previous, title:event.title, slug:event.slug }
    const mode = event.price_cents === 0 ? 'free' : stripe ? 'stripe' : localTestCheckout ? 'test' : null
    if (!mode) throw new CheckoutIssue('O pagamento está temporariamente indisponível para este evento.')
    const [{ count }] = await query<{count:number}>(`select count(*)::int as count from impeto.registrations
      where event_id=$1 and status <> 'expired'`, [event.id])
    if (count >= event.capacity) throw new CheckoutIssue('As vagas deste evento se esgotaram.')
    const [record] = await query<Reservation>(`insert into impeto.registrations(event_id,member_id,amount,payment_mode,status)
      values ($1,$2,$3,$4,'pending') returning ${fields}`, [event.id,memberId,event.price_cents,mode])
    if (mode === 'free') {
      await confirmRegistration(query,record.id)
      record.status = 'confirmed'
    }
    return { ...record, title:event.title, slug:event.slug }
  })
}

export class CheckoutIssue extends Error {}

export async function stripeCheckout(registration: Reservation) {
  if (!stripe || !origin) throw new CheckoutIssue('O pagamento está temporariamente indisponível.')
  let session: Stripe.Checkout.Session
  if (registration.stripe_session) {
    session = await stripe.checkout.sessions.retrieve(registration.stripe_session)
  } else {
    // A stable idempotency key prevents parallel requests from creating two charges.
    const age = Date.now() - new Date(registration.created_at).getTime()
    if (age > 23 * 3600000) throw new CheckoutIssue('A reserva precisa ser conciliada pela equipe antes de abrir outro pagamento.')
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ quantity:1, price_data:{ currency:'brl', unit_amount:registration.amount,
        product_data:{ name:'Inscrição Ímpeto' } } }],
      success_url: new URL('/conta?pagamento=processando', origin).href,
      cancel_url: new URL('/eventos/' + registration.slug + '/checkout', origin).href,
      client_reference_id: registration.id,
      metadata: { registration_id:registration.id }
    }, { idempotencyKey:'impeto-registration-' + registration.id })
    await (await db()).query(`update impeto.registrations set stripe_session=$2 where id=$1
      and (stripe_session is null or stripe_session=$2)`, [registration.id,session.id])
  }
  if (session.status === 'complete' || session.status === 'expired') {
    await settleSession(session, session.status === 'expired')
    return '/conta'
  }
  if (!session.url) throw new CheckoutIssue('Não foi possível abrir o pagamento agora.')
  return session.url
}

export async function settleSession(session: Stripe.Checkout.Session, expired: boolean) {
  const id = session.metadata?.registration_id
  if (!id || id !== session.client_reference_id || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) return
  await (await db()).transaction(async query => {
    const [registration] = await query<{status:string; amount:number; stripe_session:string | null}>(`select status,amount,stripe_session
      from impeto.registrations where id=$1 and payment_mode='stripe' for update`, [id])
    if (!registration || registration.status !== 'pending' || (registration.stripe_session && registration.stripe_session !== session.id)) return
    if (registration.amount !== session.amount_total || session.currency !== 'brl') return
    await query('update impeto.registrations set stripe_session=$2 where id=$1', [id,session.id])
    if (expired && session.status === 'expired') await query("update impeto.registrations set status='expired' where id=$1", [id])
    else if (session.payment_status === 'paid') await confirmRegistration(query,id)
  })
}

export function stripeEvent(payload: string, signature: string) {
  if (!stripe || !webhook) return null
  return stripe.webhooks.constructEvent(payload,signature,webhook)
}
