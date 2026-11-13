# Validação histórica

Este registro descreve a versão anterior. A validação da revisão Pink Studio está em [VALIDACAO-PINK-STUDIO.md](VALIDACAO-PINK-STUDIO.md). Medidas Lighthouse abaixo não representam esta revisão.

# Validação e decisões técnicas

## Escopo

O projeto foi iniciado a partir do prompt fornecido. A marca Ímpeto é provisória. As fotografias são geradas. A agenda embutida contém dados fictícios, e o painel permite cadastrar a agenda real depois da configuração do ambiente.

A abertura e o revezamento usam cortes e movimento de câmera sobre quadros fotográficos. O progresso da rolagem controla os recortes, deslocamentos e traçados nos dois sentidos. O pacote contém imagens dos momentos do gesto, sem filmagem contínua da atleta.

## Repertório do Notion

Consultei a Central, a Biblioteca e as seis páginas de performance. Hallmark orientou a revisão visual em várias larguras. Ponytail serviu de referência para reduzir dependências e manter as cenas em CSS, GSAP e SVG. Transitions e Spell serviram de repertório para as transições. Beautiful UI, Bencho, BoardUI, Inspora, Refero, Landdding, jiro.build, footer.design e cta.gallery foram avaliados como referências visuais. OpenSEO foi avaliado para revisão futura. A implementação já gera metadados, Open Graph, sitemap e dados estruturados dos eventos publicados. A Cloudflare Security Audit e SkillSpector foram avaliadas como ferramentas de auditoria externa. A avaliação executada aqui cobriu as dependências e o controle de acesso dos fluxos locais. Craft Anything foi consultado como referência de processo. [Central de Skills](https://app.notion.com/p/4155ee1ba87781f593a4cb5745e0f881) · [Biblioteca de Skills](https://app.notion.com/p/36b54845b2cd4e5fb354f0f3b216d973)

Cal.com, Chatwoot, Plane, OpenProject, AppFlowy e os recursos de planejamento e atendimento do catálogo não foram necessários para agenda, inscrição e notificações internas. Os recursos de pesquisa, estudos, carreira, marketing, IA, voz, edição de vídeo e captura de tela foram avaliados por finalidade e ficaram fora da execução do app. O código e os componentes das referências permaneceram fora do projeto.

## Checklist de performance

| Item | Aplicação |
| --- | --- |
| 1 | Estado de carregamento na agenda com Suspense. |
| 2 | Fotografias WebP dimensionadas por uso e capa própria para celular. |
| 3 | Leitura da página e dos metadados do mesmo evento compartilhada por requisição. |
| 4 | Busca enviada por formulário, sem requisição a cada tecla. |
| 5 | Agenda paginada em lotes de nove eventos. |
| 6 | CDN de arquivos é uma configuração de hospedagem. |
| 7 | Eventos de pagamento processados por webhook com repetição do provedor. |
| 8 | Ingressos e favoritos carregados por consultas com join. |
| 9 | Compressão de texto do servidor Next.js habilitada por padrão. |
| 10 | Cache Redis dispensado no volume local medido. |
| 11 | GSAP, Motion e leitor QR usados onde há interação. A narrativa dispensa WebGL. |
| 12 | Prazo de conexão e de consulta no pool. Prazo e repetição limitada no Stripe. |
| 13 | O app não possui geração de texto por IA em tempo real. |
| 14 | Vagas, ingressos e check-in exibem o estado confirmado no banco. |
| 15 | Capa com prioridade. Imagens abaixo da dobra com lazy loading. |
| 16 | Consultas independentes da conta e gestão iniciadas em paralelo. |
| 17 | Índices de agenda, capacidade, ingresso ativo, sessões e notificações. |
| 18 | Tracing distribuído depende da infraestrutura de produção. |
| 19 | Região entre app e banco depende da hospedagem. |
| 20 | SSR para dados do catálogo e da conta. Layout e imagens com cache próprio. |
| 21 | Nenhum script remoto de marketing. A animação é carregada no cliente sob demanda. |
| 22 | Divisão por rota, com imports dinâmicos de GSAP e leitor QR. |
| 23 | Paginação do catálogo cobre o volume previsto. |
| 24 | Colunas explícitas nas consultas. |
| 25 | Pool limitado para o PostgreSQL remoto. |
| 26 | Progresso do scroll aplicado ao DOM sem renderizações React por frame. |
| 27 | Cache explícito de fotos e cache de arquivos com hash do Next.js. |
| 28 | Deploy com múltiplas instâncias depende de ambiente remoto e banco compartilhado. |
| 29 | DM Sans e Instrument Serif servidas pelo projeto. |
| 30 | Telemetria agregada de LCP, CLS, INP e visualizações, desativada por padrão. |
| 31 | Lighthouse com perfil móvel simulado e Playwright com viewport móvel. Teste físico permanece pendente. |

## Testes locais

- Build de produção e checagem TypeScript.
- Navegador Chromium com rolagem reversível, salto para a agenda, filtros, movimento reduzido e ausência de rolagem horizontal em viewport móvel.
- Fluxos de cadastro, favoritos, inscrição gratuita e checkout de teste. QR Code gerado e lido na gestão. Segundo check-in do mesmo ingresso rejeitado.
- Duas contas disputando a última vaga. Apenas uma inscrição foi confirmada. Uma participante não conseguiu abrir o ingresso da outra. Gestão acessível somente a administradoras e webhook sem assinatura rejeitado.
- Notificações de inscrição, marcação como lidas e exportação de calendário.
- Axe sem violações nas regras WCAG 2.0/2.1 A e AA executadas na homepage. Lighthouse local com perfil móvel simulado marcou 96 em desempenho, 100 em acessibilidade e 100 em boas práticas, com LCP de 0,95 s e CLS de 0,026. O INP permanece pendente de medição de campo.
- A auditoria do npm reportou zero vulnerabilidades conhecidas nas dependências de produção no momento da execução.
- A execução foi local com PGlite e dados fictícios. Supabase remoto, Stripe real, publicação e medidas de campo dependem de uma conta e um ambiente configurados.
