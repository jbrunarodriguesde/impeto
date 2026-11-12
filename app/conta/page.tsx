import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { ArrowUpRight, Ticket, Heart, Bell } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { accountData } from '@/lib/db'
import { currentMember, destination } from '@/lib/auth'
import { formatDate } from '@/lib/catalog'
import { logout, readNotices } from './actions'

export const metadata: Metadata = { title: 'Minha área', robots: { index: false, follow: false } }

export default async function Account({ searchParams }: { searchParams: Promise<{ modo?: string; voltar?: string; erro?: string; pagamento?: string }> }) {
  await connection()
  const [member, params] = await Promise.all([currentMember(),searchParams])
  if (!member) {
    const signup = params.modo === 'cadastro'
    const next = destination(params.voltar)
    const alternate = '/conta?' + new URLSearchParams({ modo: signup ? 'entrar' : 'cadastro', voltar: next })
    return <section className="wrap page-section narrow">
      <p className="eyebrow"><span className="editorial-dot"/> Minha área</p>
      <h1 className="page-title">{signup ? 'Crie sua conta.' : 'Bem-vinda.'}</h1>
      <p className="page-lead">Acesse suas inscrições, ingressos e eventos favoritos.</p>
      <div className="panel stack">
        {params.erro === 'confirmacao' && <p className="feedback">O link de confirmação expirou ou já foi usado.</p>}
        <AuthForm key={String(signup)} signup={signup} next={next}/>
        <Link className="back" href={alternate}>{signup ? 'Já tenho conta' : 'Criar uma conta'} <ArrowUpRight size={15}/></Link>
      </div>
    </section>
  }
  const [tickets, favorites, notices] = await accountData(member.id)
  return <section className="wrap page-section">
    <p className="eyebrow"><span className="editorial-dot"/> Minha área</p>
    <div className="page-head"><h1 className="page-title">Olá, {member.name.split(/\s+/)[0]}.</h1><div className="actions">
      {member.admin && <Button asChild variant="outline"><Link href="/gestao">Painel de gestão</Link></Button>}
      <form action={logout}><Button variant="outline">Sair</Button></form>
    </div></div>
    {params.pagamento === 'processando' && tickets.some(ticket => ticket.status === 'pending') && <p className="feedback ok">Estamos aguardando a confirmação do pagamento. Atualize a página em instantes para consultar seu ingresso.</p>}
    <div className="account-grid"><div>
      <section className="panel"><h2 className="flex items-center gap-3"><Ticket size={22}/> Inscrições</h2>
        {tickets.length ? tickets.map(ticket => <div className="list-entry" key={ticket.id}><Link href={ticket.status === 'confirmed' ? '/conta/ingressos/' + ticket.id : '/eventos/' + ticket.slug + '/checkout'}>{ticket.title} <ArrowUpRight className="inline" size={14}/></Link><p>{formatDate(ticket.starts_at,{dateStyle:'medium',timeStyle:'short'})} · {ticket.status === 'confirmed' ? ticket.checked_in_at ? 'Check-in realizado' : 'Confirmada' : 'Aguardando pagamento'}</p></div>) : <p className="page-lead">Suas inscrições aparecem aqui.</p>}
      </section>
      <section className="panel"><h2 className="flex items-center gap-3"><Heart size={22}/> Favoritos</h2>
        {favorites.length ? favorites.map(item => <div className="list-entry" key={item.slug}><Link href={'/eventos/' + item.slug}>{item.title}</Link></div>) : <p className="page-lead">Salve seus eventos favoritos para consultar depois.</p>}
      </section>
    </div><section className="panel"><h2 className="flex items-center gap-3"><Bell size={22}/> Notificações</h2>
      {notices.length ? notices.map((notice, index) => <div className="list-entry" key={notice.created_at + index}>{!notice.read_at && <span className="tag">Nova</span>}<p>{notice.body}</p></div>) : <p className="page-lead">Você está em dia.</p>}
      {notices.some(notice => !notice.read_at) && <form action={readNotices}><Button variant="outline">Marcar como lidas</Button></form>}
    </section></div>
  </section>
}
