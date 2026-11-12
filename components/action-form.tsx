'use client'

import { useActionState } from 'react'
import { Button } from './ui/button'
import type { FormState } from '@/lib/validation'

export function ActionForm({ action, values, label }: {
  action: (state: FormState, data: FormData) => Promise<FormState>
  values: Record<string,string>
  label: string
}) {
  const [state, submit, pending] = useActionState(action, {})
  return <form action={submit} className="stack">
    {Object.entries(values).map(([name,value]) => <input key={name} type="hidden" name={name} value={value}/>)}
    <Button type="submit" disabled={pending}>{pending ? 'Processando…' : label}</Button>
    <p className={'feedback ' + (state.ok ? 'ok' : '')} role="status">{state.message}</p>
  </form>
}
