import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { Pool } from 'pg'
import { demoEvents, type Event } from './catalog'
import { ensureDataDir } from './data-dir'

type Query = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>
type Database = { query: Query; transaction: <T>(fn: (query: Query) => Promise<T>) => Promise<T> }

const persistentUrl = process.env.DATABASE_URL
export const isLocal = !persistentUrl
const state = globalThis as typeof globalThis & { impetoDb?: Promise<Database> }
export const db = () => state.impetoDb ??= connect().catch(error => {
  delete state.impetoDb
  console.error('[Ímpeto] Falha ao inicializar o banco de dados:', error)
  throw error
})

async function connect(): Promise<Database> {
  if (persistentUrl) {
    const pool = new Pool({ connectionString: persistentUrl, max: 6, connectionTimeoutMillis: 5000, statement_timeout: 10000 })
    return {
      query: async <T>(sql: string, params?: unknown[]) => (await pool.query(sql, params)).rows as T[],
      transaction: async fn => {
        const client = await pool.connect()
        try {
          await client.query('begin')
          const result = await fn(async <T>(sql: string, params?: unknown[]) => (await client.query(sql, params)).rows as T[])
          await client.query('commit')
          return result
        } catch (error) {
          await client.query('rollback')
          throw error
        } finally {
          client.release()
        }
      }
    }
  }

  const data = await ensureDataDir()
  const local = new PGlite(data)
  await local.exec(await readFile(join(process.cwd(), 'db/schema.sql'), 'utf8'))
  const result: Database = {
    query: async <T>(sql: string, params?: unknown[]) => (await local.query<T>(sql, params)).rows,
    transaction: fn => local.transaction(tx => fn(async <T>(sql: string, params?: unknown[]) => (await tx.query<T>(sql, params)).rows))
  }
  const [existing] = await result.query<{ exists: boolean }>('select exists(select 1 from impeto.events)')
  if (!existing.exists) {
    const now = new Date()
    await result.transaction(async query => {
      for (const e of demoEvents) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + e.month + 1, e.day, e.hour + 3))
        const end = new Date(date.getTime() + e.duration * 3600000)
        await query(`insert into impeto.events
          (slug,title,category,modality,description,city,venue,starts_at,ends_at,price_cents,capacity,image,featured,published)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true)`, [e.slug,e.title,e.category,e.modality,e.description,e.city,e.venue,date.toISOString(),end.toISOString(),e.price,e.capacity,e.image,e.featured])
      }
    })
  }
  return result
}

const columns = 'e.id,e.slug,e.title,e.category,e.modality,e.description,e.city,e.venue,e.starts_at::text,e.ends_at::text,e.price_cents,e.capacity,e.image,e.featured,e.published'
const seats = "greatest(0, e.capacity - (select count(*)::int from impeto.registrations r where r.event_id=e.id and r.status <> 'expired')) as seats"

export async function getEvents({ query, category, type, page, pageSize }: {
  query: string; category: string; type: string; page: number; pageSize: number
}) {
  try {
    const database = await db()
  const term = query.toLowerCase().normalize('NFD').replace(/\p{Mark}/gu, '').replace(/[\\%_]/g, char => '\\' + char)
  return database.query<Event>(`select ${columns}, ${seats} from impeto.events e
    where e.published and e.starts_at > now()
      and ($1 = '' or translate(lower(concat_ws(' ',e.title,e.modality,e.category,e.city,e.venue)),
        'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc') like '%' || $1 || '%')
      and ($2 = '' or e.category = $2)
      and ($3 = '' or ($3 = 'gratis' and e.price_cents=0) or ($3='pago' and e.price_cents>0))
    order by e.featured desc, e.starts_at, e.id limit $4 offset $5`, [term, category, type, pageSize + 1, (page - 1) * pageSize])
  } catch (error) {
    console.error('[Ímpeto] Não foi possível carregar a lista de eventos:', error)
    return [] as Event[]
  }
}

export async function getEvent(slug: string) {
  const [event] = await (await db()).query<Event>(`select ${columns}, ${seats} from impeto.events e where slug=$1 and published`, [slug])
  return event
}

export async function adminEvents() {
  return (await db()).query<Event>(`select ${columns}, ${seats} from impeto.events e order by e.starts_at desc, e.id`)
}

export type Registration = {
  id: string; event_id: string; title: string; slug: string; starts_at: string
  status: 'pending' | 'confirmed' | 'expired'; amount: number; code: string
  payment_mode: 'free' | 'test' | 'stripe'; stripe_session: string | null
  checked_in_at: string | null; created_at: string; venue: string; city: string
}
export type Notice = { body: string; read_at: string | null; created_at: string }

const registrationColumns = `r.id, r.event_id, e.title, e.slug, e.starts_at::text, r.status, r.amount, r.code,
  r.payment_mode, r.stripe_session, r.checked_in_at::text, r.created_at::text, e.venue, e.city`

export async function accountData(user: string) {
  const database = await db()
  return Promise.all([
    database.query<Registration>(`select ${registrationColumns} from impeto.registrations r join impeto.events e on e.id=r.event_id
      where r.member_id=$1 and r.status <> 'expired' order by e.starts_at limit 100`, [user]),
    database.query<{ title: string; slug: string }>(`select e.title,e.slug from impeto.favorites f join impeto.events e on e.id=f.event_id
      where f.member_id=$1 and e.published order by e.starts_at limit 100`, [user]),
    database.query<Notice>('select body,read_at::text,created_at::text from impeto.notifications where member_id=$1 order by created_at desc limit 20', [user])
  ])
}

export async function getRegistration(user: string, id: string) {
  const [item] = await (await db()).query<Registration>(`select ${registrationColumns} from impeto.registrations r
    join impeto.events e on e.id=r.event_id where r.member_id=$1 and r.id=$2`, [user,id])
  return item
}

export async function activeRegistration(member: string, event: string) {
  const [item] = await (await db()).query<Pick<Registration,'id'|'status'|'amount'|'payment_mode'>>(
    "select id,status,amount,payment_mode from impeto.registrations where member_id=$1 and event_id=$2 and status <> 'expired'",
    [member,event]
  )
  return item
}

export async function isFavorite(user: string, event: string) {
  const [result] = await (await db()).query('select 1 from impeto.favorites where member_id=$1 and event_id=$2', [user,event])
  return Boolean(result)
}

export async function confirmRegistration(query: Query, id: string) {
  const [registration] = await query<{ member_id: string; title: string }>(`update impeto.registrations r set status='confirmed'
    from impeto.events e where r.id=$1 and r.event_id=e.id and r.status='pending' returning r.member_id,e.title`, [id])
  if (registration) {
    await query(`insert into impeto.notifications(registration_id,member_id,body) values ($1,$2,$3) on conflict do nothing`,
      [id,registration.member_id,'Inscrição confirmada em ' + registration.title + '. Seu ingresso está disponível.'])
  }
}
