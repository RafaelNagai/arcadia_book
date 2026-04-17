import type { CharacterSkills, CharacterAttributes } from '@/data/characterTypes'

/* ─── Races & Elements ──────────────────────────────────────────── */

export const RACES = [
  'Humano', 'Humana', 'Elfo', 'Elfa', 'Elfo Noturno', 'Elfa Noturna',
  'Avaro', 'Anão', 'Anã', 'Orc', 'Outro',
]

export const ELEMENTS = ['Energia', 'Anomalia', 'Paradoxo', 'Astral', 'Cognitivo'] as const
export type ElementName = typeof ELEMENTS[number]

export const ELEMENT_COLORS: Record<ElementName, { text: string; bg: string; border: string }> = {
  Energia:   { text: '#E8803A', bg: 'rgba(200,90,32,0.18)',   border: 'rgba(232,128,58,0.5)'  },
  Anomalia:  { text: '#6FC892', bg: 'rgba(42,155,111,0.18)',  border: 'rgba(111,200,146,0.5)' },
  Paradoxo:  { text: '#50C8E8', bg: 'rgba(32,143,168,0.18)',  border: 'rgba(80,200,232,0.5)'  },
  Astral:    { text: '#C090F0', bg: 'rgba(107,63,160,0.18)',  border: 'rgba(192,144,240,0.5)' },
  Cognitivo: { text: '#E8B84B', bg: 'rgba(200,146,42,0.18)',  border: 'rgba(232,184,75,0.5)'  },
}

/** D6 → element (1-5) or free choice (6) */
export const D6_MAP: Record<number, ElementName | null> = {
  1: 'Astral', 2: 'Anomalia', 3: 'Energia', 4: 'Paradoxo', 5: 'Cognitivo', 6: null,
}

/* ─── Attribute + skill groups ──────────────────────────────────── */

export const ATTR_GROUPS = [
  {
    attr: 'fisico' as const,    label: 'Físico',     color: '#C04040',
    desc: 'Força, resistência, vigor',
    skills: [
      { key: 'fortitude'  as const, label: 'Fortitude'  },
      { key: 'vontade'    as const, label: 'Vontade'    },
      { key: 'atletismo'  as const, label: 'Atletismo'  },
      { key: 'combate'    as const, label: 'Combate'    },
    ],
  },
  {
    attr: 'destreza' as const,  label: 'Destreza',   color: '#20A080',
    desc: 'Agilidade, reflexos, precisão',
    skills: [
      { key: 'furtividade' as const, label: 'Furtividade' },
      { key: 'precisao'    as const, label: 'Precisão'    },
      { key: 'acrobacia'   as const, label: 'Acrobacia'   },
      { key: 'reflexo'     as const, label: 'Reflexo'     },
    ],
  },
  {
    attr: 'intelecto' as const, label: 'Intelecto',  color: '#4080C0',
    desc: 'Razão, percepção, conhecimento',
    skills: [
      { key: 'percepcao'    as const, label: 'Percepção'    },
      { key: 'intuicao'     as const, label: 'Intuição'     },
      { key: 'investigacao' as const, label: 'Investigação' },
      { key: 'conhecimento' as const, label: 'Conhecimento' },
    ],
  },
  {
    attr: 'influencia' as const, label: 'Influência', color: '#A060C0',
    desc: 'Carisma, presença, persuasão',
    skills: [
      { key: 'empatia'     as const, label: 'Empatia'     },
      { key: 'dominacao'   as const, label: 'Dominação'   },
      { key: 'persuasao'   as const, label: 'Persuasão'   },
      { key: 'performance' as const, label: 'Performance' },
    ],
  },
]

export const EMPTY_SKILLS: CharacterSkills = {
  fortitude: 0, vontade: 0, atletismo: 0, combate: 0,
  furtividade: 0, precisao: 0, acrobacia: 0, reflexo: 0,
  percepcao: 0, intuicao: 0, investigacao: 0, conhecimento: 0,
  empatia: 0, dominacao: 0, persuasao: 0, performance: 0,
}

export const EMPTY_ATTRS: CharacterAttributes = {
  fisico: 0, destreza: 0, intelecto: 0, influencia: 0,
}

export const STEPS = [
  { id: 1, label: 'Identidade' },
  { id: 2, label: 'Atributos'  },
  { id: 3, label: 'Perícias'   },
  { id: 4, label: 'Arcano'     },
  { id: 5, label: 'Histórico'  },
  { id: 6, label: 'História'   },
]

/* ─── Trauma data ───────────────────────────────────────────────── */

export interface TipoEntry {
  min: number; max: number; name: string; rangeLabel: string;
  effect: string; color: string; textColor: string;
  isSpecial?: boolean; isAlergia?: boolean
}
export interface AlvoEntry { roll: number; name: string }

export const TRAUMA_TIPOS: TipoEntry[] = [
  { min: 1,  max: 1,  name: 'Mestre decide',            rangeLabel: '1',     effect: 'O Mestre determina o tipo de trauma.',                                            color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
  { min: 2,  max: 4,  name: 'Vício',                    rangeLabel: '2–4',   effect: 'Ação involuntária para adquirir ou se aproximar do Alvo.',                       color: 'rgba(200,146,42,0.18)', textColor: '#E8B84B' },
  { min: 5,  max: 7,  name: 'Paranoia',                 rangeLabel: '5–7',   effect: 'Pode substituir uma perícia por outra, sem aviso.',                               color: 'rgba(42,143,168,0.18)', textColor: '#5BC8E8' },
  { min: 8,  max: 10, name: 'Fobia',                    rangeLabel: '8–10',  effect: 'Perde 1 ação na presença do Alvo.',                                               color: 'rgba(184,48,48,0.18)',  textColor: '#E88080' },
  { min: 11, max: 13, name: 'Medo',                     rangeLabel: '11–13', effect: 'Desvantagem em perícias perante o Alvo.',                                         color: 'rgba(200,106,32,0.18)', textColor: '#E8903A' },
  { min: 14, max: 16, name: 'Alergia',                  rangeLabel: '14–16', effect: '−3 a −6 em perícias específicas. Role a tabela de Alvo de Alergia.',             color: 'rgba(74,155,111,0.18)', textColor: '#6FC892', isAlergia: true },
  { min: 17, max: 19, name: 'Arrogância / Preconceito', rangeLabel: '17–19', effect: 'Não soma bônus de Atributo nem pode usar PE contra o Alvo.',                      color: 'rgba(123,63,160,0.18)', textColor: '#B080D8' },
  { min: 20, max: 20, name: 'Jogador decide',           rangeLabel: '20',    effect: 'O jogador determina o tipo conforme a narrativa.',                                 color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
]

export const TRAUMA_ALVOS: AlvoEntry[] = [
  { roll: 1,  name: 'Mestre decide'            }, { roll: 2,  name: 'Limpeza'                    },
  { roll: 3,  name: 'Perfeição / Imperfeição'  }, { roll: 4,  name: 'Religião'                   },
  { roll: 5,  name: 'Furto / Crime'            }, { roll: 6,  name: 'Jogos de Azar'              },
  { roll: 7,  name: 'Mentiras'                 }, { roll: 8,  name: 'Luta'                       },
  { roll: 9,  name: 'Multidão'                 }, { roll: 10, name: 'Lugares'                    },
  { roll: 11, name: 'Animal / Criatura'        }, { roll: 12, name: 'Altura'                     },
  { roll: 13, name: 'Cor'                      }, { roll: 14, name: 'Magia / Arcano'             },
  { roll: 15, name: 'Montaria'                 }, { roll: 16, name: 'Conhecimento'               },
  { roll: 17, name: 'Deficiência'              }, { roll: 18, name: 'Raça'                       },
  { roll: 19, name: 'Equipamento / Item'       }, { roll: 20, name: 'Jogador decide'             },
]

export const TRAUMA_ALVOS_ALERGIA: AlvoEntry[] = [
  { roll: 1,  name: 'Mestre decide'         }, { roll: 2,  name: 'Material'                },
  { roll: 3,  name: 'Bebida'                }, { roll: 4,  name: 'Criatura (pelo, dente…)' },
  { roll: 5,  name: 'Vegetal'               }, { roll: 6,  name: 'Carne'                   },
  { roll: 7,  name: 'Fruta'                 }, { roll: 8,  name: 'Arcano'                  },
  { roll: 9,  name: 'Mofo'                  }, { roll: 10, name: 'Tecido'                  },
  { roll: 11, name: 'Poluição / Poeira'     }, { roll: 12, name: 'Radiação'                },
  { roll: 13, name: 'Exercício Físico'      }, { roll: 14, name: 'Inseto'                  },
  { roll: 15, name: 'Planta'               }, { roll: 16, name: 'Gás'                     },
  { roll: 17, name: 'Luz'                   }, { roll: 18, name: 'Grão'                    },
  { roll: 19, name: 'Medicamento / Poção'   }, { roll: 20, name: 'Jogador decide'          },
]

export function getTipo(roll: number): TipoEntry {
  return TRAUMA_TIPOS.find(t => roll >= t.min && roll <= t.max)!
}
export function getAlvo(roll: number, table: AlvoEntry[]): AlvoEntry {
  return table.find(a => a.roll === roll)!
}
export function traumaNarrativeName(tipo: TipoEntry, alvoName: string): string {
  if (tipo.isSpecial) return `${tipo.name} (alvo: ${alvoName})`
  const prep: Record<string, string> = {
    'Vício': 'em', 'Paranoia': 'de', 'Fobia': 'de',
    'Medo': 'de', 'Alergia': 'a', 'Arrogância / Preconceito': 'contra',
  }
  return `${tipo.name} ${prep[tipo.name] ?? 'de'} ${alvoName}`
}

/* ─── Dice helpers ──────────────────────────────────────────────── */

export function d6(): number  { return Math.floor(Math.random() * 6)  + 1 }
export function d20(): number { return Math.floor(Math.random() * 20) + 1 }
