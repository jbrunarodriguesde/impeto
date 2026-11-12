import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { adminEvents, db } from '@/lib/db'
import { requireMember } from '@/lib/auth'
import { EventForm, CheckInForm } from '@/components/admin-forms'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title:'Gestão', robots:{ index:false, follow:false } }

export default async function AdminPage() {
  await connection()
  const admin = await requireMember('/gestao')
  if (!admin.admin) return <section className="wrap page-section narrow"><h1 className="page-title">Acesso reservado.</h1><p className="page-lead">Esta área é restrita à equipe de gestão.</p><Button asChild variant="outline"><Link href="/conta">Voltar à minha área</Link></Button></section>
  const database = await db()
  const [events,[counts],metrics] = await Promise.all([
    adminEvents(),
    database.query<{confirmed:number; pending:number; checked:number}>(`select
      count(*) filter (where status='confirmed')::int as confirmed, count(*) filter (where status='pending')::int as pending,
      count(checked_in_at)::int as checked from impeto.registrations`),
    database.query<{metric:string; count:number; mean:number}>(`select metric,sum(count)::int as count,sum(total)/greatest(sum(count),1) as mean
      from impeto.daily_metrics where day >= current_date - 29 group by metric order by metric`)
  ])
  const stats = [['Eventos publicados',events.filter(e=>e.published).length],['Inscrições confirmadas',counts.confirmed],['Reservas em pagamento',counts.pending],['Check-ins',counts.checked]]
  return <section className="wrap page-section">
    <p className="eyebrow"><span className="editorial-dot"/> Gestão</p><h1 className="page-title">Painel de eventos.</h1>
    <div className="admin-stats">{stats.map(([name,value])=><div className="panel" key={name}><strong>{value}</strong>{name}</div>)}</div>
    <div className="account-grid">
      <div className="admin-sections">
        <section className="panel admin-list"><h2>Eventos</h2>
          <details><summary>Criar evento</summary><EventForm/></details>
          {events.map(event=><details key={event.id}><summary>{event.title} · {event.published ? 'Publicado' : 'Rascunho'} · {event.seats}/{event.capacity} vagas disponíveis</summary><EventForm key={JSON.stringify(event)} event={event}/></details>)}
        </section>
      </div>
      <div>
        <section className="panel"><h2>Check-in</h2><CheckInForm events={events.map(({id,title})=>({id,title}))}/></section>
        <section className="panel"><h2>Medição</h2><p>Últimos 30 dias</p>
          {metrics.length ? metrics.map(({metric,count,mean})=><p key={metric}>{metric === 'view' ? count + ' visualizações' : metric + ' médio · ' + mean.toFixed(metric === 'CLS' ? 3 : 0) + (metric === 'CLS' ? '' : ' ms') + ' · ' + count + ' amostras'}</p>) : <p className="demo-caption">Nenhuma amostra de navegação.</p>}
        </section>
      </div>
    </div>
  </section>
}
