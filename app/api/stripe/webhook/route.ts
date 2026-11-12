import { stripeEvent, settleSession } from '@/lib/payments'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('Assinatura ausente', { status:400 })
  let event
  try {
    event = stripeEvent(await request.text(),signature)
  } catch {
    return new Response('Assinatura inválida', { status:400 })
  }
  if (!event) return new Response('Pagamento indisponível', { status:503 })
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded' || event.type === 'checkout.session.expired') {
    await settleSession(event.data.object,event.type === 'checkout.session.expired')
  }
  return new Response(null, { status:204 })
}
