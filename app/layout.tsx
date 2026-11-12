import type { Metadata } from 'next'
import '@fontsource-variable/dm-sans/wght.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './globals.css'
import { Header, Footer } from '@/components/site'
import { Metrics } from '@/components/metrics'

export const metadata: Metadata = {
  title: { default: 'Ímpeto — Movimento que transforma', template: '%s | Ímpeto' },
  description: 'Encontre eventos de esporte, bem-estar e desenvolvimento profissional e pessoal para mulheres.',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000')
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR">
    <body>
      <a className="sr-skip" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      {process.env.NEXT_PUBLIC_ANALYTICS === '1' && <Metrics />}
    </body>
  </html>
}
