import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return <section className="wrap page-section narrow"><h1 className="page-title">Página indisponível.</h1><p className="page-lead">Volte à agenda para ver as próximas experiências.</p><Button asChild><Link href="/#eventos">Ver agenda</Link></Button></section>
}
