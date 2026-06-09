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
]

export const CHAPTERS: ChapterMeta[] = [
  { id: '01_01_00_introducao',              slug: 'introducao',              title: 'Introdução',               part: 'Fundamentos',            order: 10,  subtitle: 'O Mar de Nuvens aguarda' },
  { id: '01_02_00_personagem',              slug: 'personagem',              title: 'Personagem',               part: 'Fundamentos',            order: 20,  subtitle: 'Quem você é nesse mundo' },
  { id: '01_02_01_pericias',                slug: 'pericia',                 title: 'Atributos e Perícias',     part: 'Fundamentos',            order: 21,  subtitle: 'Como você é nesse mundo', parentSlug: 'personagem' },
  { id: '01_02_02_vida_e_sanidade',         slug: 'vida-e-sanidade',         title: 'Vida e Sanidade',          part: 'Fundamentos',            order: 22,  subtitle: 'Vida, Sanidade e crise mental', parentSlug: 'personagem' },
  { id: '01_02_03_traumas',                 slug: 'traumas',                 title: 'Traumas',                  part: 'Fundamentos',            order: 23,  subtitle: 'Cicatrizes são personalidade', parentSlug: 'personagem' },
  { id: '01_02_04_inventario',              slug: 'inventario',              title: 'Inventário',               part: 'Fundamentos',            order: 24,  subtitle: 'Como guardar seus itens', parentSlug: 'personagem' },
  { id: '01_03_00_evolucao_e_testes',       slug: 'testes',                  title: 'Testes',                   part: 'Fundamentos',            order: 30,  subtitle: 'Como o destino é testado' },
  { id: '01_03_01_esforco',                 slug: 'esforco',                 title: 'Pontos de Esforço (PE)',   part: 'Fundamentos',            order: 31,  subtitle: 'Determinação além do limite', parentSlug: 'testes' },
  { id: '01_03_02_evolucao',               slug: 'evolucao',                title: 'Evolução',                 part: 'Fundamentos',            order: 32,  subtitle: 'Crescer no momento que importa' },
  { id: '01_04_00_combate',                 slug: 'conflito',                title: 'Conflito',                 part: 'Fundamentos',            order: 40,  subtitle: 'Narração sob pressão' },
  { id: '01_04_01_defesa',                  slug: 'defesa',                  title: 'Defesa',                   part: 'Fundamentos',            order: 41,  subtitle: 'A arte de mitigar o dano', parentSlug: 'conflito' },
  { id: '01_04_02_dificuldade_testes',      slug: 'dificuldade-testes',      title: 'Dificuldade dos Testes',   part: 'Fundamentos',            order: 42,  subtitle: 'A medida do impossível', parentSlug: 'testes' },
  { id: '01_05_00_equipamentos',            slug: 'equipamentos',            title: 'Item e Equipamento',       part: 'Fundamentos',            order: 50,  subtitle: 'Armas, armaduras e o catálogo do Mar de Nuvens' },
  { id: '01_05_01_criar_equipamento',       slug: 'criar-equipamento',       title: 'Criando um Equipamento',   part: 'Fundamentos',            order: 51,  subtitle: 'Como criar um equipamento', parentSlug: 'equipamentos' },
  { id: '01_06_00_condicoes',               slug: 'condicoes',               title: 'Condições',                part: 'Fundamentos',            order: 60,  subtitle: 'Efeitos que persistem no corpo e na mente' },
  { id: '02_01_00_arcanismo',               slug: 'arcanismo',               title: 'Arcanismo',                part: 'O Arcano',               order: 70,  subtitle: 'O poder tem um preço' },
  { id: '02_02_00_elementos',               slug: 'elementos',               title: 'Elementos',                part: 'O Arcano',               order: 80,  subtitle: 'Cinco forças, um destino' },
  { id: '02_03_00_afinidades',              slug: 'afinidades',              title: 'Afinidade e Antítese',     part: 'O Arcano',               order: 81,  subtitle: 'A relação que o Arcano escolhe por você' },
  { id: '02_02_01_energia',                 slug: 'energia',                 title: 'Energia',                  part: 'O Arcano',               order: 82,  subtitle: 'Onde a pura intenção precede a própria criação', parentSlug: 'elementos' },
  { id: '02_02_02_anomalia',                slug: 'anomalia',                title: 'Anomalia',                 part: 'O Arcano',               order: 83,  subtitle: 'Onde a matéria obedece e a física se curva', parentSlug: 'elementos' },
  { id: '02_02_03_paradoxo',                slug: 'paradoxo',                title: 'Paradoxo',                 part: 'O Arcano',               order: 84,  subtitle: 'Onde a verdade perde o consenso e o absoluto se torna relativo', parentSlug: 'elementos' },
  { id: '02_02_04_cognitivo',               slug: 'cognitivo',               title: 'Cognitivo',                part: 'O Arcano',               order: 85,  subtitle: 'Onde a mente se torna o verdadeiro campo de batalha', parentSlug: 'elementos' },
  { id: '02_02_05_astral',                  slug: 'astral',                  title: 'Astral',                   part: 'O Arcano',               order: 86,  subtitle: 'Onde as fronteiras do mundo físico se rompem', parentSlug: 'elementos' },
  { id: '02_04_00_conjurar',                slug: 'conjuracao',              title: 'Conjuração',               part: 'O Arcano',               order: 87,  subtitle: 'Descobrindo como conjurar o arcano' },
  { id: '02_01_01_invocacao',               slug: 'invocacao',               title: 'Invocação',                part: 'O Arcano',               order: 88,  subtitle: 'Trazendo entidades ao Plano Material', parentSlug: 'conjuracao' },
  { id: '02_05_00_entropia',                slug: 'entropia',                title: 'Entropia',                 part: 'O Arcano',               order: 89,  subtitle: 'A linha entre o físico e o arcano.' },
  { id: '03_01_00_moral',                   slug: 'moral',                   title: 'Moral',                    part: 'O Navio e a Tripulação', order: 90,  subtitle: 'O espírito da tripulação' },
  { id: '03_02_00_navios',                  slug: 'navios',                  title: 'Navios',                   part: 'O Navio e a Tripulação', order: 100, subtitle: 'Sua casa nos céus' },
  { id: '03_02_01_combate_naval',           slug: 'combate-naval',           title: 'Combate Naval',            part: 'O Navio e a Tripulação', order: 101, subtitle: 'Batalhas nos céus', parentSlug: 'navios' },
  { id: '03_03_00_constelacao_e_navegacao', slug: 'constelacao-e-navegacao', title: 'Constelação e Navegação',  part: 'O Navio e a Tripulação', order: 110, subtitle: 'Lendo o céu sem bússola' },
  { id: '03_04_00_interludio',              slug: 'interludio',              title: 'Intervalo de Capítulo',    part: 'O Navio e a Tripulação', order: 120, subtitle: 'O tempo entre as tempestades' },
  { id: '04_01_00_origem',                  slug: 'origem',                  title: 'Origem do Universo',       part: 'O Mundo',                order: 121, subtitle: 'Conceito, Essências e os Planos da existência' },
  { id: '00_timeline',                      slug: 'timeline',                title: 'Timeline',                 part: 'O Mundo',                order: 122, subtitle: 'As cinco eras de Fragnéia' },
  { id: '04_02_00_racas',                   slug: 'racas',                   title: 'Raças',                    part: 'O Mundo',                order: 130, subtitle: 'Povos do Mar de Nuvens' },
  { id: '04_03_00_regioes',                 slug: 'regioes',                 title: 'Regiões',                  part: 'O Mundo',                order: 140, subtitle: 'As nações do arquipélago' },
  { id: '04_04_00_dimensoes',               slug: 'dimensoes',               title: 'Plano Dimensional',        part: 'O Mundo',                order: 150, subtitle: 'Além do Plano Material' },
  { id: '04_05_00_religioes',               slug: 'religioes',               title: 'Religiões',                part: 'O Mundo',                order: 160, subtitle: 'Os deuses que respiram' },
  { id: '04_06_00_bestiario',               slug: 'bestiario',               title: 'Bestiário',                part: 'O Mundo',                order: 170, subtitle: 'Criaturas do Mar de Nuvens' },
  { id: '04_06_01_criando_criatura',        slug: 'criando-criatura',        title: 'Criando uma Criatura',     part: 'O Mundo',                order: 171, subtitle: 'Guia para o Mestre criar suas próprias criaturas', parentSlug: 'bestiario' },
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
