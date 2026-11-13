# Ímpeto · Azul-céu, branco e rosa-choque

Direção atual, 13/11/2026. Substitui a capa vinho, os acessórios transparentes nas bordas e a narrativa com cenas longas presas à rolagem. O repositório original não continha `design.md`.

## Identidade atual

Paleta extraída da imagem enviada pela usuária: azul-céu `#0593C6`, branco `#FFFFFF` e rosa-choque `#DE3995`. A identidade anterior Pink Studio foi substituída.

| Papel | Cor |
|---|---|
| Principal / hero, comunidade e rodapé | `#0593C6` |
| Superfícies de leitura | `#FFFFFF` |
| Acentos / ponto da marca | `#DE3995` |
| Fundos claros derivados do azul | `#DFF4FB`, `#F2FAFF` |
| Texto escuro derivado do azul | `#032130` |
| Rosa de alto contraste para textos pequenos | `#B51E76` |

Títulos brancos nas áreas azuis; textos de leitura escuros. CTAs principais da hero e comunidade brancos, com texto azul escuro. Filtros ativos e destaques usam rosa. Instrument Serif e DM Sans preservadas. Foco visível e controles de pelo menos 44 px.

Símbolo novo: quadrado azul de cantos arredondados, traço de pulso branco e ponto rosa. Mesmo desenho no cabeçalho, rodapé e favicon. Fotografias originais preservadas com tratamento duotone azul/branco via filtro SVG local. Equipamentos usam azul, branco e rosa-choque nos materiais de origem; os WebPs foram regenerados. Sem animação das imagens.

## Grid e composição

- `SilkHero`: grid de duas colunas no desktop; área de leitura à esquerda e tênis dominante à direita. Garrafa em segundo plano e halteres na base. O nome do componente foi mantido para preservar a estrutura do projeto.
- `SportStage`: reserva espaço real dentro do layout; não posicionar objetos em coordenadas globais sobre textos. As cenas são WebPs estáticos, sem sobreposição de canvas.
- Movimento: halteres e bola, com linhas SVG discretas atrás do conjunto editorial.
- Experiências: bicicleta e vôlei no espaço ao lado do título; fotos e legendas originais mantidas. Fotografias complementares em pequenas molduras apenas no desktop.
- Pausa: bola de pilates e tapete em plano claro; texto em coluna própria.
- Bem-estar: fotografia sincronizada às cinco práticas. No desktop, coluna editorial acompanha a lista. No mobile, um card por vez, scroll-snap e controles externos abaixo da lista; toque, teclado e botões permanecem disponíveis.
- Comunidade: fones como objeto principal, fotografia de revezamento como contexto discreto.
- Agenda: sem objetos decorativos. Busca, filtros, paginação, preço, disponibilidade e links preservados.

Máximo de leitura: descrições de 375–430 px; títulos quebram naturalmente no grid. Sem textos sobre partes complexas dos objetos. Sem partículas, acessórios minúsculos ou elementos cortados nas bordas da página.

## Responsividade

Até 680 px, as cenas passam a linhas próprias, depois do conteúdo prioritário. A hero mostra título, descrição e CTAs antes da arte. Proporções das cenas: hero 1,25; movimento e pausa 1,5; experiências 1,6. Os fones ficam centralizados. Nenhum objeto principal depende de recorte para caber.

De 681 a 1050 px, grid e escala respondem à largura real dos espaços. Os renders mantêm a proporção e o enquadramento pelo CSS. Fotografias de experiências passam de quatro a duas colunas até 880 px. Agenda: três, duas ou uma coluna conforme largura. Cabeçalho mobile em duas linhas, com todos os destinos originais.

Validar sempre 320, 360, 390, 430, 768, 1024 e 1440 px. Não corrigir overflow apenas escondendo a rolagem horizontal. Alinhar áreas de leitura e cenas por CSS Grid, não por coordenadas absolutas da janela.

## Modelos, materiais e luz

Three.js existente, modelos procedurais locais (sem downloads GLB, texturas externas ou dependências adicionais; geometrias agrupadas por material para reduzir draw calls). Tênis com solado, cabedal, painel lateral, colar, lingueta, cadarços, alça e sulcos; acessórios com silhuetas e detalhes próprios. Materiais na paleta azul/branco/rosa opacos, clearcoat suave, metalness baixo. Sem transmissão transparente que apague o equipamento. Acrílico ou vidro fosco só quando a silhueta continuar clara.

Luz de ambiente de estúdio via RoomEnvironment/PMREM, hemisphere, key, fill e rim. Tonemapping ACES, exposição 1,05. Sombras difusas por textura radial leve, sem shadow maps. Não transformar as peças em ícones planos ou adicionar detalhes sem função.

## Imagens estáticas, acesso e custo

Atualização solicitada pela usuária: manter as imagens paradas, eliminando a tremulação observada na versão animada.

- As cinco cenas usam permanentemente os renders WebP existentes, sem troca para canvas, loop WebGL, rotação, flutuação, parallax ou reação ao mouse.
- Fotografias de experiências e introdução de bem-estar não recebem animação de entrada. Cards de eventos não ampliam a foto no hover. A galeria pode trocar a imagem conforme a prática ativa, sem transição animada.
- Carrossel, links, filtros e demais controles continuam funcionais. Entradas dos blocos de texto e traçado SVG não alteram as imagens; `prefers-reduced-motion` continua respeitado.
- Hero com prioridade alta e demais renders com lazy loading. Espaço reservado e imagens no fluxo do layout, sem canvas fixo disputando posição com o scroll.
- Modelos, materiais e luzes em Three.js são mantidos somente como fonte para o exportador dos renders. Não são carregados pela página pública.

## Reprodução e revisão

`npm ci`, `npm run check`, `npm run build`. Iniciar localmente com `npm run dev` ou build de produção com `npm start`.

O harness `scripts/validate-studio.cjs` requer Playwright e Chromium disponíveis no ambiente; `CHROMIUM_PATH` e `STUDIO_URL` configuram executável e URL. Verifica sete larguras, carrossel, agenda, detalhes, redirecionamento de inscrição, estabilidade das imagens, preferência reduzida e erros de JS. Capturas em `artifacts/`.

Para regenerar arte estática após mudar modelos/luzes: com servidor de desenvolvimento ativo, executar `node scripts/export-studio.cjs`. O script cria uma rota temporária a partir do template local e a remove ao terminar. Não publicar a rota de exportação.

## Histórico e limites

`STORYBOARD.md` descreve a direção atual. Os quadros fotográficos, textos, links e fluxos do catálogo, autenticação, favoritos, calendário, ingresso e gestão foram preservados. A implementação de autenticação, banco e pagamentos não mudou.

As três imagens citadas no pedido não foram anexadas nesta conversa; a calibração usa a paleta e a direção textual fornecidas. As medidas locais não substituem Core Web Vitals em produção ou teste em aparelho físico.

Histórico: a primeira revisão Pink Studio usava um renderer animado compartilhado. A pedido da usuária, esse comportamento foi substituído por renders estáticos para eliminar tremulação.

Histórico cromático: a direção rosa predominante foi substituída após a usuária enviar a referência de azul-céu, branco e rosa-choque. As composições e a decisão de manter imagens estáticas continuam vigentes.
