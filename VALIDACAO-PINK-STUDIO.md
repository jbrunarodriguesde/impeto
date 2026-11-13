# Validação · Ímpeto

Revisão de 13/11/2026 sobre `jbrunarodriguesde/impeto`, base `f32e0a5`.

## Atualização: paleta azul-céu, branco e rosa-choque

Aplicadas as cores `#0593C6`, `#FFFFFF` e `#DE3995` da referência enviada pela usuária. Novo símbolo e favicon, equipamentos estáticos regenerados, fotografias com duotone azul/branco e interface recolorida, inclusive telas de conta, gestão e eventos. Contraste de leitura na hero conferido (texto `#032130` sobre azul: 4,74:1; títulos grandes brancos: 3,50:1). Build de produção e harness de navegação, sete larguras e estabilidade das imagens aprovados. Revisão visual desktop/mobile concluída.

## Atualização: imagens paradas

Por solicitação da usuária, as composições passam a usar exclusivamente os renders WebP. Removidos o canvas animado, as reações ao mouse/scroll, entradas de blocos com imagens, zoom no hover e transição da galeria. O harness agora compara capturas da arte da hero ao longo do tempo e após movimento do ponteiro, além de verificar ausência de canvas. Os resultados abaixo descrevem a primeira revisão Pink Studio.

## Resultado anterior

- Build otimizado Next.js e checagem TypeScript aprovados.
- Chromium/Playwright em 320, 360, 390, 430, 768, 1024 e 1440 px: sem overflow horizontal; composições estáticas carregadas nas cinco áreas.
- Carrossel mobile percorre as cinco práticas, retorna à anterior e desabilita os controles nas extremidades. Controles separados do texto. Lista focalizável e com scroll nativo por toque/teclado.
- CTA da hero alcança a agenda. Busca “Corre” retorna Corre Juntas. Filtro de gratuitos retorna apenas cards gratuitos. Detalhe do evento abre e o link de inscrição encaminha para login quando não autenticada.
- WebGL renderiza hero, movimento e comunidade. Troca de `prefers-reduced-motion` em tempo real restaura imagens estáticas. Nenhum erro de JavaScript nos cenários executados.
- Fotografias, textos, destinos de links e APIs preservados. Código de autenticação, banco, pagamentos, calendário e ingresso sem alterações.

## Revisão visual

Capturas de produção (desktop 1440 px e mobile 390 px) em `artifacts/`. Foram revisadas composição, silhuetas, legibilidade, alinhamento, áreas seguras, enquadramento e navegação. Equipamentos agora ocupam espaços reais do grid; não há acessórios presos às extremidades nem cenas vazias causadas por sticky prolongado.

A referência publicada `https://impeto-tau.vercel.app/` foi consultada e capturada antes das alterações. As três imagens mencionadas no pedido não estavam anexadas. A paleta e a direção Pink Studio foram calibradas pela descrição fornecida, sem afirmar correspondência com essas imagens ausentes.

## Performance e limites

Um renderer compartilhado, modelos criados ao entrar no viewport, geometrias agrupadas por material para reduzir draw calls, DPR limitado, sem shadow maps, animação suspensa fora da tela e em aba oculta. WebPs transparentes locais como fallback; cerca de 49–67 KB por composição. Nenhuma dependência nova.

Os testes são locais, com PGlite e agenda demonstrativa. Não houve cobrança real, acesso a Supabase/Stripe remoto, publicação ou medição de campo de Core Web Vitals. As pontuações Lighthouse históricas em `VALIDACAO.md` não se aplicam a esta revisão. Testes em aparelhos físicos e INP de campo continuam dependentes do ambiente publicado.

## Reprodução

```sh
npm ci
npm run build
npm run check
npm start -- --port 3001
# Em outro terminal com Playwright e Chromium disponíveis:
STUDIO_URL=http://localhost:3001 node scripts/validate-studio.cjs
```

O script de validação aceita `CHROMIUM_PATH` para outro executável. [design.md](design.md) documenta exportação dos fallbacks, materiais e regras responsivas.
