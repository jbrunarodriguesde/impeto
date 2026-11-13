import Link from 'next/link'
import { ArrowUpRight, UserRound } from 'lucide-react'

export function Mark({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={className} width="32" height="32" viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="38" height="38" rx="12" fill="#0593C6" stroke="white" strokeOpacity=".5"/><path d="M7 23h7l4-11 5 17 4-9h6" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="31" cy="10" r="4" fill="#DE3995" stroke="white" strokeWidth="1.5"/></svg>
}

export function Header() {
  return <header className="masthead"><div className="masthead-inner">
    <Link className="brand" href="/" aria-label="Ímpeto, início"><Mark />ímpeto<span>.</span></Link>
    <nav aria-label="Navegação principal">
      <Link href="/#movimento">O movimento</Link>
      <Link href="/#eventos">Agenda</Link>
      <Link href="/#comunidade">Comunidade</Link>
    </nav>
    <Link className="account-link" href="/conta"><UserRound size={16}/><span>Minha área</span><ArrowUpRight size={15} className="account-arrow" /></Link>
  </div></header>
}

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-top">
    <Link className="brand" href="/" aria-label="Ímpeto, início"><Mark />ímpeto<span>.</span></Link>
    <nav aria-label="Rodapé"><Link href="/#eventos">Agenda</Link><Link href="/conta">Minha área</Link><Link href="/gestao">Gestão</Link></nav>
  </div><div className="wrap footer-bottom">© {new Date().getFullYear()} Ímpeto</div></footer>
}
