import 'server-only'
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { db, isLocal } from './db'

const derive = promisify(scrypt)
const sessionCookie = 'impeto_session'
const sessionSeconds = 60 * 60 * 24 * 7
export const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
export const localTestCheckout = isLocal && process.env.LOCAL_TEST_CHECKOUT === '1'
type Member = { id: string; email: string; name: string; admin: boolean }

export async function supabase() {
  const jar = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: updates => {
        try {
          for (const { name, value, options } of updates) jar.set(name, value, options)
        } catch {
          // The proxy refreshes sessions during Server Component requests.
        }
      }
    }
  })
}

export function destination(value: unknown) {
  if (typeof value !== 'string') return '/conta'
  const allowed = /^\/(?:conta|gestao|eventos\/[a-z0-9-]+(?:\/checkout)?)(?:\?[a-z0-9=&%-]+)?$/
  return allowed.test(value) ? value : '/conta'
}

const digest = (value: string) => createHash('sha256').update(value).digest('hex')

async function passwordHash(password: string, salt = randomBytes(16).toString('hex')) {
  const key = await derive(password, salt, 64) as Buffer
  return salt + ':' + key.toString('hex')
}

async function verify(password: string, value?: string) {
  const candidate = await passwordHash(password, value?.split(':')[0] ?? 'impeto-invalid-account')
  return value ? timingSafeEqual(Buffer.from(candidate), Buffer.from(value)) : false
}

async function createSession(id: string) {
  const token = randomBytes(32).toString('base64url')
  const database = await db()
  await database.transaction(async query => {
    await query('delete from impeto.sessions where expires_at < now()')
    await query('insert into impeto.sessions(token_hash,member_id,expires_at) values ($1,$2,now()+make_interval(secs=>$3))', [digest(token),id,sessionSeconds])
  })
  ;(await cookies()).set(sessionCookie, token, { httpOnly:true, sameSite:'lax', secure: process.env.SITE_URL?.startsWith('https:') ?? false, path:'/', maxAge:sessionSeconds })
}

export async function currentMember(): Promise<Member | undefined> {
  if (useSupabase) {
    const { data: { user } } = await (await supabase()).auth.getUser()
    if (!user?.email) return
    const name = typeof user.user_metadata.name === 'string' ? user.user_metadata.name.trim().slice(0,70) : user.email.split('@')[0]
    const [member] = await (await db()).query<Member>(`insert into impeto.members(id,email,name) values ($1,$2,$3)
      on conflict(id) do update set email=excluded.email,name=excluded.name returning id,email,name,admin`, [user.id,user.email,name || user.email])
    return member
  }
  const token = (await cookies()).get(sessionCookie)?.value
  if (!isLocal || !token) return
  const [member] = await (await db()).query<Member>(`select m.id,m.email,m.name,m.admin from impeto.members m
    join impeto.sessions s on s.member_id=m.id where s.token_hash=$1 and s.expires_at > now()`, [digest(token)])
  return member
}

export async function requireMember(next: string) {
  const member = await currentMember()
  if (!member) redirect('/conta?voltar=' + encodeURIComponent(destination(next)))
  return member
}

export async function localLogin(email: string, password: string) {
  if (!isLocal || useSupabase) return false
  const database = await db()
  const [allowed] = await database.query<{attempts: number}>(`insert into impeto.auth_limits(bucket,attempts,expires_at)
    values ($1,1,now()+interval '15 minutes') on conflict(bucket) do update
    set attempts=case when auth_limits.expires_at < now() then 1 else auth_limits.attempts+1 end,
    expires_at=case when auth_limits.expires_at < now() then excluded.expires_at else auth_limits.expires_at end
    returning attempts`, [digest('login:' + email)])
  if (allowed.attempts > 10) return false
  const adminEmail = process.env.LOCAL_ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.LOCAL_ADMIN_PASSWORD
  if (adminEmail === email && adminPassword && adminPassword.length >= 12) {
    const hash = await passwordHash(adminPassword)
    if (!await verify(password, hash)) return false
    const [admin] = await database.query<{id:string}>(`insert into impeto.members(email,name,password_hash,admin)
      values ($1,'Equipe Ímpeto',$2,true) on conflict (lower(email)) where password_hash is not null
      do update set password_hash=excluded.password_hash,admin=true returning id`, [email,hash])
    await createSession(admin.id)
    return true
  }
  const [user] = await database.query<{id:string;password_hash:string}>(`select id,password_hash from impeto.members
    where lower(email)=$1 and password_hash is not null and not admin`, [email])
  if (!await verify(password, user?.password_hash)) return false
  await database.query('delete from impeto.auth_limits where bucket=$1', [digest('login:' + email)])
  await createSession(user.id)
  return true
}

export async function localSignup(email: string, name: string, password: string) {
  if (!isLocal || useSupabase || email === process.env.LOCAL_ADMIN_EMAIL?.trim().toLowerCase()) return false
  const [user] = await (await db()).query<{id:string}>(`insert into impeto.members(email,name,password_hash)
    values ($1,$2,$3) on conflict do nothing returning id`, [email,name,await passwordHash(password)])
  if (!user) return false
  await createSession(user.id)
  return true
}

export async function endSession() {
  if (useSupabase) await (await supabase()).auth.signOut()
  else {
    const jar = await cookies()
    const token = jar.get(sessionCookie)?.value
    if (token && isLocal) await (await db()).query('delete from impeto.sessions where token_hash=$1', [digest(token)])
    jar.delete(sessionCookie)
  }
}
