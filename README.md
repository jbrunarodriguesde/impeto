# Ímpeto

Plataforma de eventos de esporte, desenvolvimento pessoal e profissional, bem-estar e comunidade. Next.js App Router, React, TypeScript, Tailwind, componentes no padrão shadcn/ui, GSAP/ScrollTrigger, Motion, Zod e React Hook Form.

## Abrir no Windows

1. Extraia o ZIP em uma pasta. Requer Node.js 22 ou superior e internet na primeira instalação.
2. Abra `INICIAR.cmd` dentro da pasta extraída e aguarde aparecer `Ready`.
3. Abra [localhost:3000](http://localhost:3000). Crie uma conta em **Minha área** para testar inscrições e favoritos.

Pelo terminal, use `npm ci` e `npm run dev`. A versão otimizada usa `npm run build` seguido de `npm start -- --hostname 127.0.0.1`. O banco PostgreSQL embutido (PGlite) persiste contas, eventos e inscrições na pasta `.data`. Os eventos locais são fictícios e as datas são geradas na primeira abertura.

Para testar a gestão, copie `.env.example` para `.env.local`. Preencha `LOCAL_ADMIN_EMAIL` e escolha `LOCAL_ADMIN_PASSWORD` com pelo menos 12 caracteres. Reinicie e entre em `/gestao` com essas credenciais. Para testar a etapa de pagamento sem cobrança, defina `LOCAL_TEST_CHECKOUT=1`. O QR Code pode ser lido a partir de uma foto ou por código na gestão.

## Usar com Supabase e Stripe

1. Crie ou selecione um projeto Supabase. Aplique `db/schema.sql` no banco do projeto. Defina `DATABASE_URL` com a conexão PostgreSQL TLS do Supabase com acesso ao schema privado `impeto`. Use uma conexão direta ou pool de sessão compatível com seu host.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SITE_URL`. Cadastre a URL de produção e a rota `/auth/callback` nas URLs de redirecionamento do Supabase Auth. Use HTTPS e habilite a confirmação de e-mail. Para o envio de e-mails de cadastro em produção, configure o SMTP no Supabase.
3. Crie a conta da organizadora pela interface e faça login uma vez. No SQL Editor, conceda o papel de gestão por UUID do Supabase Auth. Substitua o UUID de exemplo pelo UUID confirmado da organizadora.

   ```sql
   update impeto.members set admin = true where id = '00000000-0000-0000-0000-000000000000';
   ```

4. Cadastre os eventos reais em `/gestao` e publique cada evento após revisar seus dados. O catálogo de demonstração só é semeado no banco embutido.
5. Defina `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`. No Stripe, aponte o webhook para `/api/stripe/webhook` e selecione `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.expired`. Valide com as chaves de teste antes de configurar cobrança. A confirmação do ingresso depende do status, da moeda e do valor verificados na sessão. O navegador não informa ao banco que houve pagamento.
6. Hospede o app em um ambiente Node compatível com Next.js. Disponibilize os arquivos de `public/` e as variáveis do projeto. Faça o build após definir as variáveis `NEXT_PUBLIC_*`. Mantenha chaves, URLs de conexão e dados de sessão fora do código e do ZIP.

Uma inscrição gratuita e a ocupação da vaga são confirmadas em uma transação. Para eventos pagos, a reserva ocupa a vaga durante a sessão de checkout. O webhook de expiração libera a vaga. Se uma falha do provedor impedir a associação da sessão após repetidas tentativas, confira a reserva com o Stripe antes de liberar a vaga manualmente. Notificações de inscrição ficam em **Minha área**. O calendário usa arquivo `.ics`. O painel mostra totais a partir do banco.

A telemetria opcional usa `NEXT_PUBLIC_ANALYTICS=1`. Grava visualizações e medidas de Web Vitals agregadas por dia, sem identificadores de sessão, e respeita Do Not Track e Global Privacy Control. Antes de ativar, configure a origem canônica e a política de privacidade do site.

## Imagens e movimento

A identidade Pink Studio usa renders estáticos das cenas esportivas criadas com Three.js, integrados aos espaços reservados no grid. Por preferência da usuária, as imagens ficam paradas: sem flutuação, rotação, parallax ou reação ao mouse; não há canvas WebGL na página pública. Os modelos e o exportador continuam disponíveis para regenerar os WebPs. As cinco práticas mantêm o carrossel acessível no celular. Consulte [design.md](design.md) para as regras visuais.

Instrument Serif e DM Sans são distribuídas nos pacotes Fontsource sob SIL Open Font License. A interface foi criada para o projeto. As referências catalogadas no Notion foram consultadas sem copiar seus componentes, instalar skills do catálogo ou executar os scripts externos.

## Referências de implementação

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth com SSR](https://supabase.com/docs/guides/auth/server-side)
- [Confirmação de pagamentos com Stripe Checkout](https://docs.stripe.com/checkout/fulfillment)
- [Licença padrão do GSAP](https://gsap.com/community/standard-license/)
- [Central de Skills e guias de performance](https://app.notion.com/p/4155ee1ba87781f593a4cb5745e0f881)
