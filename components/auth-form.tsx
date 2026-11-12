'use client'

import { useActionState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { authenticate } from '@/app/conta/actions'
import { loginSchema, signupSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'

export function AuthForm({ signup, next }: { signup: boolean; next: string }) {
  const [feedback, run] = useActionState(authenticate, {})
  const [pending, start] = useTransition()
  const reduced = useReducedMotion()
  const { register, handleSubmit, formState: { errors } } = useForm<{ name?: string; email: string; password: string }>({
    resolver: zodResolver(signup ? signupSchema : loginSchema)
  })
  return <form className="form-grid" onSubmit={handleSubmit(values => {
    const form = new FormData()
    for (const [name, value] of Object.entries(values)) if (value !== undefined) form.set(name,value)
    form.set('mode', signup ? 'cadastro' : 'entrar')
    form.set('next', next)
    start(() => run(form))
  })}>
    {signup && <div className="form-field"><label>Nome<input {...register('name')} autoComplete="name" required maxLength={70} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'auth-name-help' : undefined}/></label>{errors.name && <small id="auth-name-help">Informe pelo menos dois caracteres.</small>}</div>}
    <div className="form-field"><label>E-mail<input {...register('email')} type="email" autoComplete="email" required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'auth-email-help' : undefined}/></label>{errors.email && <small id="auth-email-help">Informe um e-mail válido.</small>}</div>
    <div className="form-field"><label>Senha<input {...register('password')} type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 12 : 1} maxLength={128} aria-invalid={Boolean(errors.password)} aria-describedby={signup ? 'auth-password-help' : undefined}/></label>{signup && <small id="auth-password-help">Use pelo menos 12 caracteres.</small>}</div>
    {feedback.message && <motion.p className={'feedback ' + (feedback.ok ? 'ok' : '')} role="status" initial={reduced ? false : { opacity:0 }} animate={{opacity:1}}>{feedback.message}</motion.p>}
    <Button type="submit" disabled={pending}>{pending ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</Button>
  </form>
}
