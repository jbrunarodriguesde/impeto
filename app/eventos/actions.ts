'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { currentMember, localTestCheckout, requireMember } from '@/lib/auth'
import { confirmRegistration, db, getEvent } from '@/lib/db'
import { CheckoutIssue, reserve, stripeCheckout } from '@/lib/payments'
import { slugSchema, uuid, type FormState } from '@/lib/validation'

export async function favorite(form: FormData) {
  const slug = slugSchema.safeParse(form.get('slug'))
  if (!slug.success) return
  const member = await requireMember('/eventos/' + slug.data)
  const event = await getEvent(slug.data)
  if (!event) return
  const database = await db()
  if (form.get('value') === 'remove') {
    await database.query('delete from impeto.favorites where member_id=$1 and event_id=$2', [member.id,event.id])
  } else {
    await database.query('insert into impeto.favorites(member_id,event_id) values ($1,$2) on conflict do nothing', [member.id,event.id])
  }
  revalidatePath('/eventos/' + slug.data)
  revalidatePath('/conta')
}

export async function checkout(_: FormState, form: FormData): Promise<FormState> {
  const slug = slugSchema.safeParse(form.get('slug'))
  if (!slug.success) return { message:'Evento inválido.' }
  const member = await requireMember('/eventos/' + slug.data + '/checkout')
  let target: string
  try {
    const item = await reserve(member.id, slug.data)
    target = '/conta/ingressos/' + item.id
    if (item.status === 'pending' && item.payment_mode === 'stripe') target = await stripeCheckout(item)
    if (item.status === 'pending' && item.payment_mode === 'test') target = '/conta/ingressos/' + item.id + '?teste=1'
  } catch (error) {
    return { message: error instanceof CheckoutIssue ? error.message : 'Não foi possível concluir a inscrição agora. Tente novamente.' }
  }
  revalidatePath('/conta')
  redirect(target)
}

export async function confirmTest(_: FormState, form: FormData): Promise<FormState> {
  const member = await currentMember()
  const id = uuid.safeParse(form.get('id'))
  if (!member || !id.success || !localTestCheckout) return { message:'Pagamento de teste indisponível.' }
  const result = await (await db()).transaction(async query => {
    const [item] = await query<{status:string}>(`select r.status from impeto.registrations r join impeto.events e on e.id=r.event_id
      where r.id=$1 and r.member_id=$2 and r.payment_mode='test' and e.starts_at > now() for update of r`, [id.data,member.id])
    if (!item || item.status === 'expired') return false
    await confirmRegistration(query,id.data)
    return true
  })
  if (!result) return { message:'A reserva expirou.' }
  revalidatePath('/conta')
  redirect('/conta/ingressos/' + id.data)
}
