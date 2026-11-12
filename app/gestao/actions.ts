'use server'

import { revalidatePath } from 'next/cache'
import { currentMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { eventSchema, uuid, type FormState } from '@/lib/validation'

export async function saveEvent(_: FormState, form: FormData): Promise<FormState> {
  const admin = await currentMember()
  if (!admin?.admin) return { message:'Acesso reservado à equipe.' }
  const parsed = eventSchema.safeParse({ ...Object.fromEntries(form), id: form.get('id') || undefined,
    featured:form.get('featured') === 'on', published:form.get('published') === 'on' })
  if (!parsed.success) return { message:'Confira os campos. Use uma data final posterior e preço de pelo menos R$ 1 ou zero.' }
  const e = parsed.data
  const values = [e.slug,e.title,e.category,e.modality,e.description,e.city,e.venue,e.starts_at.toISOString(),e.ends_at.toISOString(),e.price_cents,e.capacity,e.image,e.featured,e.published]
  try {
    const result = await (await db()).transaction(async query => {
      if (!e.id) {
        const [inserted] = await query(`insert into impeto.events
          (slug,title,category,modality,description,city,venue,starts_at,ends_at,price_cents,capacity,image,featured,published)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict(slug) do nothing returning id`, values)
        return inserted ? '' : 'Esse endereço já está em uso.'
      }
      const [current] = await query<{slug:string}>('select slug from impeto.events where id=$1 for update', [e.id])
      if (!current) return 'Evento indisponível.'
      if (current.slug !== e.slug) return 'Mantenha o endereço original deste evento.'
      const [{count}] = await query<{count:number}>("select count(*)::int from impeto.registrations where event_id=$1 and status <> 'expired'", [e.id])
      if (e.capacity < count) return 'A capacidade deve comportar as inscrições e reservas existentes.'
      await query(`update impeto.events set slug=$1,title=$2,category=$3,modality=$4,description=$5,city=$6,venue=$7,
        starts_at=$8,ends_at=$9,price_cents=$10,capacity=$11,image=$12,featured=$13,published=$14 where id=$15`, [...values,e.id])
      return ''
    })
    if (result) return { message:result }
  } catch {
    return { message:'Não foi possível salvar o evento. Tente novamente.' }
  }
  revalidatePath('/')
  revalidatePath('/gestao')
  revalidatePath('/eventos/' + e.slug)
  return { ok:true, message:'Evento salvo.' }
}

export async function checkIn(_: FormState, form: FormData): Promise<FormState> {
  const admin = await currentMember()
  if (!admin?.admin) return { message:'Acesso reservado à equipe.' }
  const value = form.get('code')
  const code = uuid.safeParse(typeof value === 'string' ? value.trim().replace(/^impeto:/,'') : value)
  const event = uuid.safeParse(form.get('event'))
  if (!code.success || !event.success) return { message:'Escolha o evento e informe um código de ingresso válido.' }
  const result = await (await db()).transaction(async query => {
    const [ticket] = await query<{id:string; checked_in_at:string|null; name:string}>(`select r.id,r.checked_in_at::text,m.name
      from impeto.registrations r join impeto.members m on m.id=r.member_id
      where r.code=$1 and r.event_id=$2 and r.status='confirmed' for update of r`, [code.data,event.data])
    if (!ticket) return { message:'Ingresso inválido para este evento.' }
    if (ticket.checked_in_at) return { message:'Este ingresso já foi utilizado.' }
    await query('update impeto.registrations set checked_in_at=now() where id=$1', [ticket.id])
    return { ok:true, message:'Check-in confirmado para ' + ticket.name + '.' }
  })
  revalidatePath('/gestao')
  return result
}
