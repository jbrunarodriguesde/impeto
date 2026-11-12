import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import QRCode from 'qrcode'
import { ActionForm } from '@/components/action-form'
import { requireMember, localTestCheckout } from '@/lib/auth'
import { getRegistration, isLocal } from '@/lib/db'
import { formatDate, price } from '@/lib/catalog'
import { confirmTest } from '@/app/eventos/actions'
import { uuid } from '@/lib/validation'

export const metadata: Metadata = { title:'Ingresso', robots:{ index:false, follow:false } }

export default async function TicketPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params
  if (!uuid.safeParse(id).success) notFound()
  const user = await requireMember('/conta')
  const item = await getRegistration(user.id,id)
  if (!item || item.status === 'expired') notFound()
  const confirmed = item.status === 'confirmed'
  const qr = confirmed ? await QRCode.toDataURL('impeto:' + item.code, { width:240, margin:2, errorCorrectionLevel:'M' }) : null
  return <section className="wrap page-section narrow">
    <Link href="/conta" className="back"><ArrowLeft size={16}/> Minha área</Link>
    <h1 className="page-title">{confirmed ? 'Seu ingresso.' : 'Seu pagamento.'}</h1>
    <article className="panel stack">
      <h2>{item.title}</h2>
      <p>{formatDate(item.starts_at,{dateStyle:'long',timeStyle:'short'})} (Brasília)</p>
      <p>{item.venue} · {item.city}</p>
      <p>{user.name}</p>
      {isLocal && <p className="demo-caption">Ingresso de demonstração.</p>}
      {qr ? <>
        <p className="feedback ok">{item.checked_in_at ? 'Check-in realizado.' : 'Inscrição confirmada. Apresente o código na entrada.'}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ticket-img" src={qr} width="240" height="240" alt="QR Code do ingresso"/>
        <p className="ticket-code">{item.code}</p>
        <div className="actions">
          <a className="back" href={qr} download={'ingresso-' + item.slug + '.png'}><Download size={16}/> Salvar QR Code</a>
          <a className="back" href={'/eventos/' + item.slug + '/calendario'}><Download size={16}/> Adicionar ao calendário</a>
        </div>
      </> : item.payment_mode === 'test' && localTestCheckout ? <>
        <p className="feedback ok">Pagamento de teste no valor de {price(item.amount)}. Nenhum valor será cobrado.</p>
        <ActionForm action={confirmTest} values={{id}} label="Confirmar pagamento de teste"/>
      </> : <p className="feedback">Aguardando a confirmação do pagamento.</p>}
    </article>
  </section>
}
