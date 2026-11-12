import Link from 'next/link'
import { ArrowUpRight, UserRound } from 'lucide-react'

export function Mark({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={className} width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M3 25C9 25 10 9 18 9h5M10 25c6 0 7-16 15-16h4M17 25c6 0 7-16 14-16" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round"/></svg>
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
