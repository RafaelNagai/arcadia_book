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
  parentSlug?: string
}

export const PARTS: Part[] = [
  'Fundamentos',
  'O Arcano',
  'O Navio e a Tripulação',
  'O Mundo',
  'One-Shots',
]

export const CHAPTERS: ChapterMeta[] = [
  { id: '00_timeline',                slug: 'timeline',                title: 'Timeline',                 part: 'O Mundo',                order: 121,   subtitle: 'As cinco eras de Fragnéia' },
  { id: '00_origem',                  slug: 'origem',                  title: 'Origem do Universo',       part: 'O Mundo',                order: 122,   subtitle: 'Conceito, Essências e os Planos da existência' },
  { id: '01_01_00_introducao',              slug: 'introducao',              title: 'Introdução',               part: 'Fundamentos',            order: 10,  subtitle: 'O Mar de Nuvens aguarda' },
  { id: '01_02_00_personagem',              slug: 'personagem',              title: 'Personagem',               part: 'Fundamentos',            order: 20,  subtitle: 'Quem você é nesse mundo' },
  { id: '01_02_01_pericias',              slug: 'pericia',              title: 'Atributo e Perícia',               part: 'Fundamentos',            order: 21,  subtitle: 'Como você é nesse mundo', parentSlug: 'personagem' },
  { id: '01_02_02_vida_e_sanidade',         slug: 'vida-e-sanidade',         title: 'Vida e Sanidade',          part: 'Fundamentos',            order: 22,  subtitle: 'Vida, Sanidade e crise mental', parentSlug: 'personagem' },
  { id: '01_02_03_traumas',                 slug: 'traumas',                 title: 'Traumas',                  part: 'Fundamentos',            order: 23,  subtitle: 'Cicatrizes são personalidade', parentSlug: 'personagem' },
  { id: '01_02_04_inventario',                 slug: 'inventario',                 title: 'Inventário',                  part: 'Fundamentos',            order: 23,  subtitle: 'Como guardar seus itens', parentSlug: 'personagem' },
  { id: '01_03_00_evolucao_e_testes',       slug: 'evolucao-e-testes',       title: 'Testes e Evolução',        part: 'Fundamentos',            order: 30,  subtitle: 'Como o destino é testado' },
  { id: '01_03_01_esforco',       slug: 'esforco',       title: 'Ponto de Esforço (PE)',        part: 'Fundamentos',            order: 31,  subtitle: 'Falhar é evoluir', parentSlug:'evolucao-e-testes' },
  { id: '01_04_00_combate',                 slug: 'combate',                 title: 'Combate',                  part: 'Fundamentos',            order: 40,  subtitle: 'A arte de sobreviver' },
  { id: '01_04_01_defesa',                 slug: 'defesa',                 title: 'Defesa',                  part: 'Fundamentos',            order: 41,  subtitle: 'A arte de mitigar o dano', parentSlug: 'combate' },
  { id: '01_05_00_equipamentos',            slug: 'equipamentos',            title: 'Item e Equipamento',       part: 'Fundamentos',            order: 50,  subtitle: 'Armas, armaduras e o catálogo do Mar de Nuvens' },
  { id: '01_05_01_criar_equipamento',            slug: 'criar-equipamento',            title: 'Criar um Equipamento',       part: 'Fundamentos',            order: 51,  subtitle: 'Como criar um equipamento', parentSlug: 'equipamentos' },
  { id: '01_06_00_condicoes',               slug: 'condicoes',               title: 'Condições',                part: 'Fundamentos',            order: 60,  subtitle: 'Efeitos que persistem no corpo e na mente' },
  { id: '05_01_00_arcanismo',               slug: 'arcanismo',               title: 'Arcanismo',                part: 'O Arcano',               order: 70,  subtitle: 'O poder tem um preço' },
  { id: '05_02_00_elementos',               slug: 'elementos',               title: 'Elementos',                part: 'O Arcano',               order: 80,  subtitle: 'Cinco forças, um destino' },
  { id: '05_02_01_energia',              slug: 'energia',                 title: 'Energia',                  part: 'O Arcano',               order: 82,  subtitle: 'Onde a pura intenção precede a própria criação', parentSlug: 'elementos' },
  { id: '05_02_02_anomalia',             slug: 'anomalia',                title: 'Anomalia',                 part: 'O Arcano',               order: 83,  subtitle: 'Onde a matéria obedece e a física se curva', parentSlug: 'elementos' },
  { id: '05_02_03_paradoxo',             slug: 'paradoxo',                title: 'Paradoxo',                 part: 'O Arcano',               order: 84,  subtitle: 'Onde a verdade perde o consenso e o absoluto se torna relativo', parentSlug: 'elementos' },
  { id: '05_02_04_cognitivo',            slug: 'cognitivo',               title: 'Cognitivo',                part: 'O Arcano',               order: 85,  subtitle: 'Onde a mente se torna o verdadeiro campo de batalha', parentSlug: 'elementos' },
  { id: '05_02_05_astral',               slug: 'astral',                  title: 'Astral',                   part: 'O Arcano',               order: 86,  subtitle: 'Onde as fronteiras do mundo físico se rompem', parentSlug: 'elementos' },
  { id: '05_03_00_afinidades',              slug: 'afinidades',              title: 'Afinidade e Antítese',     part: 'O Arcano',               order: 81,  subtitle: 'A relação que o Arcano escolhe por você' },
  { id: '05_04_00_conjurar',               slug: 'conjuracao',               title: 'Conjuração',                part: 'O Arcano',               order: 85,  subtitle: 'Descobrindo como conjurar o arcano' },
  { id: '05_05_00_entropia',               slug: 'entropia',               title: 'Entropia',                part: 'O Arcano',               order: 89,  subtitle: 'A linha entre o fisico e o arcano.' },
  { id: '05_01_01_invocacao',               slug: 'invocacao',               title: 'Invocação',                part: 'O Arcano',               order: 62,  subtitle: 'Trazendo entidades ao Plano Material', parentSlug: 'conjuracao' },
  { id: '08_moral',                   slug: 'moral',                   title: 'Moral',                    part: 'O Navio e a Tripulação', order: 90,  subtitle: 'O espírito da tripulação' },
  { id: '09_navios',                  slug: 'navios',                  title: 'Navios',                   part: 'O Navio e a Tripulação', order: 100, subtitle: 'Sua casa nos céus' },
  { id: '09_combate_naval',           slug: 'combate-naval',           title: 'Combate Naval',            part: 'O Navio e a Tripulação', order: 101, subtitle: 'Batalhas nos céus', parentSlug: 'navios' },
  { id: '10_constelacao_e_navegacao', slug: 'constelacao-e-navegacao', title: 'Constelação e Navegação',  part: 'O Navio e a Tripulação', order: 110, subtitle: 'Lendo o céu sem bússola' },
  { id: '11_interludio',              slug: 'interludio',              title: 'Intervalo de Capítulo',    part: 'O Navio e a Tripulação', order: 120, subtitle: 'O tempo entre as tempestades' },
  { id: '12_racas',                   slug: 'racas',                   title: 'Raças',                    part: 'O Mundo',                order: 130, subtitle: 'Povos do Mar de Nuvens' },
  { id: '13_regioes',                 slug: 'regioes',                 title: 'Regiões',                  part: 'O Mundo',                order: 140, subtitle: 'As nações do arquipélago' },
  { id: '14_dimensoes',               slug: 'dimensoes',               title: 'Dimensões',                part: 'O Mundo',                order: 150, subtitle: 'Além do Plano Material' },
  { id: '15_religioes',               slug: 'religioes',               title: 'Religiões',                part: 'O Mundo',                order: 160, subtitle: 'Os deuses que respiram' },
  { id: '17_bestiario',               slug: 'bestiario',               title: 'Bestiário',                part: 'O Mundo',                order: 170, subtitle: 'Criaturas do Mar de Nuvens' },
  { id: 'a_tempestade_de_vidro',      slug: 'a-tempestade-de-vidro',   title: 'A Tempestade de Vidro',    part: 'One-Shots',              order: 180, subtitle: '3-4 horas · Iniciante a Intermediário' },
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
