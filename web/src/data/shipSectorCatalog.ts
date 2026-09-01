import type { CharacterSkills } from '@/data/characterTypes'
import type { InstalledSector } from '@/data/shipTypes'

export type SectorCategoryKey =
  | 'armamentos'
  | 'casco'
  | 'velas_motores'
  | 'radar'
  | 'dormitorio'
  | 'cozinha'
  | 'biblioteca'
  | 'armazem'
  | 'prisao'

export interface SectorCatalogEntry {
  key: string
  name: string
  slots: number
  test: keyof CharacterSkills | null
  effect: string
  description: string
  /** Only set for Casco entries — used to derive the ship's DN. Undefined when the sector grants no DN. */
  dn?: number
}

export interface SectorCategoryDef {
  key: SectorCategoryKey
  label: string
  entries: SectorCatalogEntry[]
}

export const SECTOR_CATALOG: SectorCategoryDef[] = [
  {
    key: 'armamentos',
    label: 'Armamentos',
    entries: [
      {
        key: 'catapulta_rustica',
        name: 'Catapulta Rustica',
        slots: 1,
        test: null,
        effect: '3D12 de dano',
        description: 'Uma catapulta que arremessa pedras, sem dependência de arcano.',
      },
      {
        key: 'canhao_a_polvora',
        name: 'Canhão a Pólvora',
        slots: 1,
        test: null,
        effect: '4D12 de dano',
        description: 'Canhão rústico e antigo, sem dependência de arcano.',
      },
      {
        key: 'balesta_gigante',
        name: 'Balesta Gigante',
        slots: 1,
        test: null,
        effect: '1D20 de dano',
        description: 'Arremessa uma flecha gigante.',
      },
      {
        key: 'lanca_serra',
        name: 'Lança-Serra',
        slots: 1,
        test: null,
        effect: '2D20 de dano',
        description: 'Lançador de serras giratórias, extremamente pesado e arcaico.',
      },
      {
        key: 'disparador_automatico_de_ego',
        name: 'Disparador Automatico de Ego',
        slots: 2,
        test: null,
        effect: 'XD20 de dano',
        description:
          'Criado por nobres de Camelot, com um tamanho avantajado para chamar atenção, ele lança dinheiros e barras de Eltys em seus inimigos para mostrar superioridade e riqueza. X é o valor no dado da PM (Pote da Moral), o dado usado no PM vira um valor 1.',
      },
      {
        key: 'catapulta_flamejante',
        name: 'Catapulta Flamejante',
        slots: 2,
        test: null,
        effect: '3D20 de dano em área',
        description: 'Catapulta que lança bolas de fogo em área.',
      },
      {
        key: 'arcada_dentaria',
        name: 'Arcada-Dentaria',
        slots: 2,
        test: null,
        effect: '7D12 + (3) de dano',
        description: 'É mecanismo que dispara inumeros dentes de dragão como uma metralhadora.',
      },
      {
        key: 'rugido_unico',
        name: 'Rugido Único',
        slots: 4,
        test: null,
        effect: '12D20 + (4) de dano',
        description: 'Canhão rúnico de alto nível de destruição. Requer gerador instalado no navio.',
      },
    ],
  },
  {
    key: 'casco',
    label: 'Casco',
    entries: [
      {
        key: 'camada_de_ferro',
        name: 'Camada de Ferro',
        slots: 1,
        test: 'atletismo',
        dn: 7,
        effect: 'DN 7',
        description: 'Camada de ferro fundido, resistente e de fácil instalação.',
      },
      {
        key: 'camada_de_fundicao',
        name: 'Camada de Fundição',
        slots: 2,
        test: 'atletismo',
        dn: 8,
        effect: 'DN 8 · +1 Vida',
        description: 'Camada de ferro fundido varias vezes, para criar esse bloco espesso.',
      },
      {
        key: 'madeira_elfica',
        name: 'Madeira Élfica',
        slots: 1,
        test: 'conhecimento',
        dn: 7,
        effect: 'DN 7 · +2 Vida',
        description: 'Madeira nobre, flexível e de alta durabilidade.',
      },
      {
        key: 'auto_meca_reparavel_de_rubra',
        name: 'Auto-Meca Reparavel de Rubra',
        slots: 3,
        test: null,
        dn: 8,
        effect: 'DN 8 · +5 Vida',
        description:
          'Uma camada espessa de engrenagem e inteligente que se auto concerta. (Teste: Conhecimento ou Atletismo)',
      },
      {
        key: 'protetor_runico',
        name: 'Protetor Rúnico',
        slots: 3,
        test: 'investigacao',
        dn: 10,
        effect: 'DN 10',
        description: 'Domo protetor ao redor do navio que evita todo tipo de dano.',
      },
      {
        key: 'casca_de_eltys',
        name: 'Casca de Eltys',
        slots: 3,
        test: null,
        dn: 9,
        effect: 'DN 9 · +3 contra ataques arcanos',
        description: 'Um casco revestido com Eltys fundido. Ganha +3 contra ataques arcanos. (Teste: Arcano)',
      },
      {
        key: 'gelo_glacial',
        name: 'Gelo Glacial',
        slots: 2,
        test: null,
        dn: 6,
        effect: 'DN 6 · +4 Vida',
        description: 'Madeira congelada no topo das montanhas de North Galahad.',
      },
      {
        key: 'escudo_cascudo',
        name: 'Escudo Cascudo',
        slots: 3,
        test: null,
        effect: '+10 Vida · absorção pura de dano (sem DN)',
        description:
          'Carapaças de tartarugas viajantes como camada extra de proteção. Não concede DN — apenas absorção pura de dano.',
      },
    ],
  },
  {
    key: 'velas_motores',
    label: 'Velas / Motores',
    entries: [
      {
        key: 'vela_de_tecido',
        name: 'Vela de Tecido',
        slots: 2,
        test: 'reflexo',
        effect: '+1 DN durante manobra',
        description: 'Vela de boa fabricação, simples e confiável. +4 de furtividade.',
      },
      {
        key: 'motor_a_carvao',
        name: 'Motor a Carvão',
        slots: 2,
        test: 'atletismo',
        effect: '+2 DN durante manobra',
        description: 'Motor de carvão que faz muito barulho e fumaça, simples e confiável. -4 de furtividade.',
      },
      {
        key: 'vela_luminosa',
        name: 'Vela Luminosa',
        slots: 3,
        test: 'conhecimento',
        effect: '+2 DN durante manobra · +4 Vida',
        description: 'Vela que se alimenta da luz do dia e brilha à noite.',
      },
      {
        key: 'motor_de_biolumes',
        name: 'Motor de Biolumes',
        slots: 3,
        test: 'dominacao',
        effect: '+3 DN durante manobra · +2 Vida',
        description:
          'Um motor luminaria que em seu interior tem inumeros biolumes que abastecem com uma energia vital dessas criaturas.',
      },
      {
        key: 'vela_de_tecido_nobre',
        name: 'Vela de Tecido Nobre',
        slots: 3,
        test: 'precisao',
        effect: '+2 DN durante manobra',
        description: 'Tecido de alta costura e altamente refinado.',
      },
      {
        key: 'motor_de_ego',
        name: 'Motor de Ego',
        slots: 4,
        test: 'persuasao',
        effect: '+X DN durante manobra',
        description:
          'Uma fornalha que queima ouro e dinheiro para criar energia para o navio, nobre e burgueses usam esse metodo para ostentar a sua riqueza. X é o valor no dado da PM (Pote da Moral), o dado usado no PM vira um valor 1. Necessário no mínimo 2 integrantes nesse setor.',
      },
      {
        key: 'vela_de_campo_gravitico',
        name: 'Vela de Campo Gravítico',
        slots: 4,
        test: 'acrobacia',
        effect: '+5 DN durante manobra',
        description: 'Tecido mágico que melhora a retenção de ar e a manobra do navio.',
      },
      {
        key: 'coracao_de_monstro',
        name: 'Coração de Monstro',
        slots: 5,
        test: 'vontade',
        effect: '+4 DN durante manobra · +10 Vida',
        description:
          'Baseado em um experimento realizado em Herion, foi criado um motor que usa os batimentos de um coração de dragão vivo e pulsante.',
      },
    ],
  },
  {
    key: 'radar',
    label: 'Radar',
    entries: [
      {
        key: 'radar_estrelar',
        name: 'Radar Estrelar',
        slots: 1,
        test: 'investigacao',
        effect: '+1 por dado de dano',
        description: 'Localiza alvos com base nas Constelações.',
      },
      {
        key: 'radar_nautico',
        name: 'Radar Náutico',
        slots: 2,
        test: 'investigacao',
        effect: '+2 por dado de dano',
        description: 'Localiza alvos por projeção de trajetória futura.',
      },
      {
        key: 'radar_eco_localizacao',
        name: 'Radar Eco-Localização',
        slots: 3,
        test: 'percepcao',
        effect: '+3 por dado de dano',
        description: 'Localiza alvos por frequencias de ondas e vibrações. +1 para personagens cegos.',
      },
      {
        key: 'radar_runico',
        name: 'Radar Runico',
        slots: 4,
        test: null,
        effect: '+5 por dado de dano',
        description: 'Localiza alvos por aura espectral de cada objeto e individuo. (Teste: Arcano)',
      },
    ],
  },
  {
    key: 'dormitorio',
    label: 'Dormitório',
    entries: [
      {
        key: 'dormitorio_de_redes',
        name: 'Dormitório De Redes',
        slots: 3,
        test: null,
        effect: 'Descanso Precário',
        description: 'Dormitório simples e funcional. Permite comportar 5 individuos nesse setor.',
      },
      {
        key: 'dormitorio_padrao',
        name: 'Dormitório Padrão',
        slots: 1,
        test: null,
        effect: 'Descanso Normal',
        description: 'Dormitório simples e funcional.',
      },
      {
        key: 'dormitorio_refinado',
        name: 'Dormitório Refinado',
        slots: 1,
        test: null,
        effect: 'Descanso Refinado',
        description: 'Dormitório com tecidos e lã de alta qualidade. Produzidas nas fazendas das capivaqueiras.',
      },
      {
        key: 'dormitorio_luxuoso',
        name: 'Dormitório Luxuoso',
        slots: 1,
        test: null,
        effect: 'Descanso Luxuoso',
        description: 'Espaço amplo com cama de alta qualidade.',
      },
    ],
  },
  {
    key: 'cozinha',
    label: 'Cozinha',
    entries: [
      {
        key: 'cozinha_basica',
        name: 'Cozinha Básica',
        slots: 1,
        test: null,
        effect: '+2 no teste de cozinhar',
        description: 'Cozinha simples com os principais utensílios essenciais.',
      },
      {
        key: 'cozinha_equipada',
        name: 'Cozinha Equipada',
        slots: 2,
        test: null,
        effect: '+5 no teste de cozinhar',
        description: 'Cozinha com todos os utensílios essenciais.',
      },
      {
        key: 'cozinha_refinada',
        name: 'Cozinha Refinada',
        slots: 3,
        test: null,
        effect: '+8 no teste de cozinhar',
        description: 'Cozinha sofisticada com equipamentos de restaurante.',
      },
      {
        key: 'cozinha_luxuosa',
        name: 'Cozinha Luxuosa',
        slots: 4,
        test: null,
        effect: '+10 no teste de cozinhar',
        description:
          'Cozinha altamente equipada, com os melhores equipamentos e ingredientes de altissimo nivel. Ganha +2 ao recuperar vida e sanidade com as comidas preparadas nessa cozinha.',
      },
    ],
  },
  {
    key: 'biblioteca',
    label: 'Biblioteca',
    entries: [
      {
        key: 'livraria',
        name: 'Livraria',
        slots: 1,
        test: null,
        effect: '+2 nos testes',
        description: 'Coleção modesta de mapas, tratados e registros de viagem.',
      },
      {
        key: 'biblioteca_compacta',
        name: 'Biblioteca Compacta',
        slots: 2,
        test: null,
        effect: '+5 nos testes',
        description: 'Acervo simples e organizado de referências, pergaminhos e cartas náuticas.',
      },
      {
        key: 'biblioteca_robusta',
        name: 'Biblioteca Robusta',
        slots: 3,
        test: null,
        effect: '+8 nos testes',
        description: 'Acervo denso e bem organizado de referências, pergaminhos e cartas náuticas.',
      },
      {
        key: 'biblioteca_luxuosa',
        name: 'Biblioteca Luxuosa',
        slots: 4,
        test: null,
        effect: '+10 nos testes',
        description:
          'Acervo completo de todos os livros e pergaminhos, com coleções unicas de cada região de arcadia. Personagens que passarem o dia na Biblioteca luxuosa, permite adquirir 1 ponto de esforço (PE) em qualquer atributo, uma vez por dia.',
      },
    ],
  },
  {
    key: 'armazem',
    label: 'Armazém',
    entries: [
      {
        key: 'quartinho',
        name: 'Quartinho',
        slots: 1,
        test: null,
        effect: '+1 Vida',
        description: 'Coleção modesta de mapas, tratados e registros de viagem.',
      },
      {
        key: 'armazem_pequeno',
        name: 'Armazem Pequeno',
        slots: 2,
        test: null,
        effect: '+3 Vida',
        description: 'Um local pequeno para armazenar qualquer item ou estoque.',
      },
      {
        key: 'armazem_medio',
        name: 'Armazem Médio',
        slots: 3,
        test: null,
        effect: '+5 Vida',
        description: 'Um local médio para armazenar qualquer item ou estoque.',
      },
      {
        key: 'armazem_grande',
        name: 'Armazem Grande',
        slots: 4,
        test: null,
        effect: '+8 Vida · +1 dado no Pote da Moral',
        description: 'Um local grande para armazenar qualquer item ou estoque. Ganha +1 dado no Pote da Moral (PM).',
      },
    ],
  },
  {
    key: 'prisao',
    label: 'Prisão',
    entries: [
      {
        key: 'gaiola',
        name: 'Gaiola',
        slots: 1,
        test: null,
        effect: '+1 nos testes de Influência',
        description: 'Uma prisão para criaturas pequenas e moderadas.',
      },
      {
        key: 'cadeia',
        name: 'Cadeia',
        slots: 2,
        test: null,
        effect: '+3 nos testes de Influência',
        description: 'Uma prisão convencional para prender.',
      },
      {
        key: 'calaboucos',
        name: 'Calabouço',
        slots: 3,
        test: null,
        effect: '+5 nos testes de Influência',
        description: 'Uma prisão com utensilios que aterrorizam os individuos prendidos.',
      },
      {
        key: 'masmorra',
        name: 'Masmorra',
        slots: 4,
        test: null,
        effect: '+8 nos testes de Influência',
        description:
          'Uma prisão amedrontadora com equipamentos sofisticados de interrogatorio avançado. Arcanos são anulados dentro dessa area.',
      },
    ],
  },
]

export function findSectorEntry(category: SectorCategoryKey, key: string): SectorCatalogEntry | undefined {
  return SECTOR_CATALOG.find(c => c.key === category)?.entries.find(e => e.key === key)
}

export function getSectorTestLabel(entry: SectorCatalogEntry): string | null {
  if (entry.test) return entry.test
  return entry.description.match(/\(Teste:\s*([^)]+)\)/i)?.[1] ?? null
}

export function getCategoryLabel(category: SectorCategoryKey): string {
  return SECTOR_CATALOG.find(c => c.key === category)?.label ?? category
}

const SHIP_BASE_DN = 5

export function computeSlotsUsed(sectors: InstalledSector[]): number {
  return sectors.reduce((sum, s) => sum + (findSectorEntry(s.category, s.key)?.slots ?? 0), 0)
}

export function computeShipDn(sectors: InstalledSector[]): number {
  const cascoDn = sectors
    .filter(s => s.category === 'casco')
    .map(s => findSectorEntry(s.category, s.key)?.dn)
    .find((dn): dn is number => dn !== undefined)
  return cascoDn ?? SHIP_BASE_DN
}
