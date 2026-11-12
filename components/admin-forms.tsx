'use client'

import { useActionState, useRef, useState } from 'react'
import { saveEvent, checkIn } from '@/app/gestao/actions'
import { categories, images, type Event } from '@/lib/catalog'
import { Button } from './ui/button'

function dateInput(date?: string) {
  if (!date) return ''
  const stamp = date.replace(' ', 'T').replace(/([+-]\d\d)$/, '$1:00')
  const saoPaulo = new Date(Date.parse(stamp) - 3 * 3600000)
  return saoPaulo.toISOString().slice(0,16)
}

export function EventForm({ event }: {event?:Event}) {
  const [state, action, pending] = useActionState(saveEvent,{})
  return <form action={action} className="form-grid">
    {event && <input type="hidden" name="id" value={event.id}/>}
    <div className="form-row">
      <label>Nome<input name="title" defaultValue={event?.title} required minLength={3} maxLength={95}/></label>
      <label>Endereço do evento<input name="slug" readOnly={Boolean(event)} defaultValue={event?.slug} required minLength={3} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nome-do-evento"/></label>
    </div>
    <div className="form-row">
      <label>Categoria<select name="category" defaultValue={event?.category}>{categories.map(item=><option key={item}>{item}</option>)}</select></label>
      <label>Modalidade<input name="modality" defaultValue={event?.modality} required minLength={2} maxLength={60}/></label>
    </div>
    <label>Descrição<textarea name="description" defaultValue={event?.description} required minLength={20} maxLength={5000}/></label>
    <div className="form-row">
      <label>Cidade e UF<input name="city" defaultValue={event?.city} required minLength={2} maxLength={90}/></label>
      <label>Local<input name="venue" defaultValue={event?.venue} required minLength={2} maxLength={120}/></label>
    </div>
    <div className="form-row">
      <label>Início (Brasília)<input name="starts_at" type="datetime-local" defaultValue={dateInput(event?.starts_at)} required/></label>
      <label>Fim (Brasília)<input name="ends_at" type="datetime-local" defaultValue={dateInput(event?.ends_at)} required/></label>
    </div>
    <div className="form-row">
      <label>Capacidade<input name="capacity" type="number" min="1" max="100000" defaultValue={event?.capacity} required/></label>
      <label>Preço em centavos<input name="price_cents" type="number" min="0" max="1000000" defaultValue={event?.price_cents ?? 0} required/></label>
    </div>
    <label>Fotografia<select name="image" defaultValue={event?.image}>{images.map(item=><option key={item}>{item}</option>)}</select></label>
    <div className="form-row">
      <label className="check-field"><input name="featured" type="checkbox" defaultChecked={event?.featured}/> Em destaque</label>
      <label className="check-field"><input name="published" type="checkbox" defaultChecked={event?.published}/> Publicado</label>
    </div>
    <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar evento'}</Button>
    <p className={'feedback ' + (state.ok ? 'ok' : '')} role="status">{state.message}</p>
  </form>
}

export function CheckInForm({ events }: {events: Pick<Event,'id'|'title'>[]}) {
  const [state, action, pending] = useActionState(checkIn,{})
  const [scan, setScan] = useState('')
  const code = useRef<HTMLInputElement>(null)
  async function readImage(file?:File) {
    if (!file || !code.current) return
    setScan('Lendo imagem…')
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error()
      const [{default:decode}, bitmap] = await Promise.all([import('jsqr'), createImageBitmap(file)])
      const canvas = document.createElement('canvas')
      const scale = Math.min(1,1400 / Math.max(bitmap.width,bitmap.height))
      canvas.width = Math.max(1,Math.round(bitmap.width * scale))
      canvas.height = Math.max(1,Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')!
      context.drawImage(bitmap,0,0,canvas.width,canvas.height)
      bitmap.close()
      const image = context.getImageData(0,0,canvas.width,canvas.height)
      const qr = decode(image.data,image.width,image.height)
      if (!qr?.data.startsWith('impeto:')) throw new Error()
      code.current.value = qr.data
      setScan('Código lido. Confirme o check-in abaixo.')
    } catch {
      setScan('Não consegui ler o QR Code. Experimente outra imagem ou digite o código.')
    }
  }
  return <form action={action} className="form-grid">
    <label>Evento<select name="event" required><option value="">Selecione</option>{events.map(event=><option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
    <label>Fotografe o QR Code ou envie a imagem<input className="file-picker" type="file" accept="image/*" capture="environment" onChange={e => void readImage(e.target.files?.[0])}/></label>
    {scan && <small role="status">{scan}</small>}
    <label>Código<input ref={code} name="code" autoComplete="off" required maxLength={50}/></label>
    <Button type="submit" disabled={pending}>{pending ? 'Validando…' : 'Confirmar check-in'}</Button>
    <p className={'feedback ' + (state.ok ? 'ok' : '')} role="status">{state.message}</p>
  </form>
}
