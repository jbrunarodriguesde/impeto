# Ímpeto — decisões de design

> Documento criado em 13/11/2026. Não havia `design.md` na raiz da branch `main` ao iniciar esta alteração. Este registro descreve apenas decisões implementadas, sem substituir um guia de identidade preexistente.

## Identidade preservada
- Tipografia: Instrument Serif nos títulos e DM Sans nos textos.
- Cores existentes: fundo vinho/ameixa, textos claros, acentos rosa e coral.
- Seções, textos, fotografias, animações 3D e agenda mantidos.

## Cinco formas de se reconectar — mobile
- Até 680 px: um único card por vez, ordem fixa Meditação → Yoga → Pilates → Alongamento → Musculação.
- Desktop/tablet acima de 680 px: narrativa existente preservada.
- Controles Anterior e Próximo abaixo do card, botões nativos com área mínima de 44 × 44 px, `aria-label`, `aria-controls` e foco visível.
- Sem loop: limites desabilitados. O foco é movido para o botão ainda habilitado quando o controle ativo chega a uma extremidade.
- Indicador visual `01 / 05` e região `role=status`/`aria-live=polite` atualizados uma vez por navegação.
- Animação de entrada de 380 ms (fade e deslocamento de 14 px), desligada em `prefers-reduced-motion`.
- Swipe horizontal com limiar de 45 px; `touch-action: pan-y` preserva a rolagem vertical.
- Bloqueio de interações repetidas durante transição; botões mantêm foco durante esse intervalo.
- Sem biblioteca nova e sem re-instanciar objetos WebGL na troca de card.
- GSAP não controla mais os cards no mobile, evitando conflito de estado.

## Validação pendente
- Verificar visualmente em navegadores reais com 320, 360, 390, 430 e 768 px.
- Exercitar mouse, toque, teclado e leitor de tela, além de verificar os logs do navegador.
