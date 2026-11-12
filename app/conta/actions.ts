'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { currentMember, destination, endSession, localLogin, localSignup, supabase, useSupabase } from '@/lib/auth'
import { db, isLocal } from '@/lib/db'
import { loginSchema, signupSchema, type FormState } from '@/lib/validation'

export async function authenticate(_: FormState, form: FormData): Promise<FormState> {
  const signup = form.get('mode') === 'cadastro'
  const next = destination(form.get('next'))
  const data = Object.fromEntries(form)
  const parsed = signup ? signupSchema.safeParse(data) : loginSchema.safeParse(data)
  if (!parsed.success) return { message: 'Confira os campos. Para criar conta, use uma senha com pelo menos 12 caracteres.' }
  const { email, password } = parsed.data
  const name = 'name' in parsed.data ? String(parsed.data.name) : ''
  if (!isLocal && !useSupabase) return { message: 'O acesso à conta está temporariamente indisponível.' }
  try {
    if (useSupabase) {
      const client = await supabase()
      if (signup) {
        const origin = process.env.SITE_URL
        if (!origin) return { message: 'O cadastro está temporariamente indisponível.' }
        const callback = new URL('/auth/callback', origin)
        callback.searchParams.set('next', next)
        const { data, error } = await client.auth.signUp({ email,password,options:{ data:{name},emailRedirectTo:callback.href } })
        if (error) return { message: 'Não foi possível concluir o cadastro. Confira os dados ou tente entrar.' }
        if (!data.session) return { ok:true, message: 'Confira seu e-mail para confirmar o cadastro.' }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password })
        if (error) return { message: 'E-mail ou senha inválidos. Se você acabou de se cadastrar, confirme seu e-mail.' }
      }
    } else {
      const success = signup ? await localSignup(email, name, password) : await localLogin(email, password)
      if (!success) return { message: signup ? 'Não foi possível criar a conta. Você pode tentar entrar.' : 'E-mail ou senha inválidos. Tente novamente mais tarde se o limite de tentativas foi atingido.' }
    }
  } catch {
    return { message: 'Não foi possível acessar a conta agora. Tente novamente em instantes.' }
  }
  redirect(next)
}

export async function logout() {
  await endSession()
  redirect('/')
}

export async function readNotices() {
  const member = await currentMember()
  if (!member) return
  await (await db()).query('update impeto.notifications set read_at=now() where member_id=$1 and read_at is null', [member.id])
  revalidatePath('/conta')
}
