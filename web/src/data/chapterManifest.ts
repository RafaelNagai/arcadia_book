export type Part =
  | 'Fundamentos'
  | 'O Arcano'
  | 'O Navio e a Tripulação'
  | 'O Mundo'
  | 'One-Shots'

export interface ChapterMeta {
  id: string
  slug: string
  title: string
  part: Part
  order: number
  subtitle?: string
}

export const PARTS: Part[] = [
  'Fundamentos',
  'O Arcano',
  'O Navio e a Tripulação',
  'O Mundo',
  'One-Shots',
]

export const CHAPTERS: ChapterMeta[] = [
  { id: '01_introducao',              slug: 'introducao',              title: 'Introdução',               part: 'Fundamentos',            order: 1,  subtitle: 'O Mar de Nuvens aguarda' },
  { id: '02_personagem',              slug: 'personagem',              title: 'Personagem',               part: 'Fundamentos',            order: 2,  subtitle: 'Quem você é nesse mundo' },
  { id: '03_evolucao_e_testes',       slug: 'evolucao-e-testes',       title: 'Evolução e Testes',        part: 'Fundamentos',            order: 3,  subtitle: 'Como o destino é testado' },
  { id: '04_combate',                 slug: 'combate',                 title: 'Combate',                  part: 'Fundamentos',            order: 4,  subtitle: 'A arte de sobreviver' },
  { id: '16_equipamentos',            slug: 'equipamentos',            title: 'Equipamentos',             part: 'Fundamentos',            order: 5,  subtitle: 'Armas, armaduras e itens do Mar de Nuvens' },
  { id: '05_arcanismo',               slug: 'arcanismo',               title: 'Arcanismo',                part: 'O Arcano',               order: 6,  subtitle: 'O poder tem um preço' },
  { id: '06_elementos_e_afinidades',  slug: 'elementos-e-afinidades',  title: 'Elementos e Afinidades',   part: 'O Arcano',               order: 6,  subtitle: 'Cinco forças, um destino' },
  { id: '07_condicoes_e_trauma',      slug: 'condicoes-e-trauma',      title: 'Condições e Trauma',       part: 'O Arcano',               order: 7,  subtitle: 'O que o mundo deixa em você' },
  { id: '08_moral',                   slug: 'moral',                   title: 'Moral',                    part: 'O Navio e a Tripulação', order: 8,  subtitle: 'O espírito da tripulação' },
  { id: '09_navios',                  slug: 'navios',                  title: 'Navios',                   part: 'O Navio e a Tripulação', order: 9,  subtitle: 'Sua casa nos céus' },
  { id: '10_constelacao_e_navegacao', slug: 'constelacao-e-navegacao', title: 'Constelação e Navegação',  part: 'O Navio e a Tripulação', order: 10, subtitle: 'Lendo o céu sem bússola' },
  { id: '11_interludio',              slug: 'interludio',              title: 'Intervalo de Capítulo',    part: 'O Navio e a Tripulação', order: 11, subtitle: 'O tempo entre as tempestades' },
  { id: '12_racas',                   slug: 'racas',                   title: 'Raças',                    part: 'O Mundo',                order: 12, subtitle: 'Povos do Mar de Nuvens' },
  { id: '13_regioes',                 slug: 'regioes',                 title: 'Regiões',                  part: 'O Mundo',                order: 13, subtitle: 'As nações do arquipélago' },
  { id: '14_dimensoes',               slug: 'dimensoes',               title: 'Dimensões',                part: 'O Mundo',                order: 14, subtitle: 'Além do Plano Finito' },
  { id: '15_religioes',               slug: 'religioes',               title: 'Religiões',                part: 'O Mundo',                order: 15, subtitle: 'Os deuses que respiram' },
  { id: 'a_tempestade_de_vidro',      slug: 'a-tempestade-de-vidro',   title: 'A Tempestade de Vidro',    part: 'One-Shots',              order: 16, subtitle: '3-4 horas · Iniciante a Intermediário' },
]

export function getChapterBySlug(slug: string): ChapterMeta | undefined {
  return CHAPTERS.find(c => c.slug === slug)
}

export function getAdjacentChapters(slug: string): { prev: ChapterMeta | null; next: ChapterMeta | null } {
  const idx = CHAPTERS.findIndex(c => c.slug === slug)
  return {
    prev: idx > 0 ? CHAPTERS[idx - 1] : null,
    next: idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null,
  }
}

export function getChaptersByPart(part: Part): ChapterMeta[] {
  return CHAPTERS.filter(c => c.part === part)
}
