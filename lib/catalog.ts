export const categories = ['Esporte', 'Profissional', 'Desenvolvimento pessoal', 'Bem-estar', 'Comunidade'] as const
export const images = ['corrida', 'volei', 'workshop', 'bem-estar', 'largada', 'revezamento'] as const

export type Event = {
  id: string; slug: string; title: string; category: typeof categories[number]; modality: string
  description: string; city: string; venue: string; starts_at: string; ends_at: string
  price_cents: number; capacity: number; image: typeof images[number]; featured: boolean
  published: boolean; seats: number
}

export const demoEvents = [
  { slug:'corre-juntas', title:'Corre Juntas', category:'Esporte', modality:'Corrida', city:'São Paulo, SP', venue:'Parque do Ibirapuera', month:0, day:12, hour:7, duration:2, price:0, capacity:80, image:'corrida', featured:true,
    description:'Uma manhã de corrida em grupo para mulheres de todos os ritmos. Começamos com aquecimento guiado, seguimos em percursos de 3 km ou 5 km e terminamos com uma roda de conversa. Use roupas confortáveis e leve sua garrafa de água.' },
  { slug:'lideranca-em-movimento', title:'Liderança em Movimento', category:'Profissional', modality:'Workshop', city:'Belo Horizonte, MG', venue:'Espaço Savassi', month:0, day:19, hour:14, duration:3, price:8900, capacity:28, image:'workshop', featured:true,
    description:'Um workshop prático para transformar ideias em projetos. Trabalhe em pequenos grupos, experimente ferramentas de planejamento e saia com um plano de ação para suas próximas quatro semanas.' },
  { slug:'respira-e-recomeca', title:'Respira e Recomeça', category:'Bem-estar', modality:'Mobilidade', city:'São Paulo, SP', venue:'Parque Villa-Lobos', month:1, day:9, hour:9, duration:1, price:4500, capacity:32, image:'bem-estar', featured:true,
    description:'Uma prática ao ar livre com movimentos de mobilidade e exercícios suaves de respiração. A aula oferece adaptações para diferentes níveis. Traga uma toalha ou um tapete e uma garrafa de água.' },
  { slug:'volei-de-sabado', title:'Vôlei de Sábado', category:'Esporte', modality:'Vôlei', city:'Belo Horizonte, MG', venue:'Quadra da Serra', month:1, day:16, hour:8, duration:2, price:0, capacity:24, image:'volei', featured:false,
    description:'Treino aberto de vôlei com fundamentos, duplas e jogos curtos. A equipe organiza as partidas por nível e todas as participantes podem experimentar as diferentes posições.' },
  { slug:'circulo-de-ideias', title:'Círculo de Ideias', category:'Comunidade', modality:'Networking', city:'São Paulo, SP', venue:'Estúdio Pinheiros', month:1, day:22, hour:18, duration:2, price:0, capacity:30, image:'workshop', featured:false,
    description:'Traga uma ideia ou um desafio e encontre outras mulheres que também querem tirar projetos do papel. A programação inclui apresentações curtas, rodadas em duplas e conversa aberta.' },
  { slug:'proximos-passos', title:'Próximos Passos', category:'Desenvolvimento pessoal', modality:'Encontro', city:'São Paulo, SP', venue:'Estúdio Pinheiros', month:2, day:5, hour:10, duration:2, price:0, capacity:20, image:'bem-estar', featured:false,
    description:'Reserve uma manhã para rever suas prioridades e planejar os próximos meses. A sessão inclui exercícios de escrita, reflexão individual e troca de experiências em pequenos grupos.' }
]

export const price = (cents: number) => cents === 0 ? 'Gratuito' : new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(cents / 100)
export const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone:'America/Sao_Paulo', ...options }).format(new Date(date))
