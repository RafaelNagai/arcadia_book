import { z } from 'zod'

const AttributesSchema = z.object({
  fisico: z.number().int().min(0).max(99),
  destreza: z.number().int().min(0).max(99),
  intelecto: z.number().int().min(0).max(99),
  influencia: z.number().int().min(0).max(99),
})

const SkillsSchema = z.object({
  fortitude: z.number().int().min(0).max(99),
  vontade: z.number().int().min(0).max(99),
  atletismo: z.number().int().min(0).max(99),
  combate: z.number().int().min(0).max(99),
  furtividade: z.number().int().min(0).max(99),
  precisao: z.number().int().min(0).max(99),
  acrobacia: z.number().int().min(0).max(99),
  reflexo: z.number().int().min(0).max(99),
  percepcao: z.number().int().min(0).max(99),
  intuicao: z.number().int().min(0).max(99),
  investigacao: z.number().int().min(0).max(99),
  conhecimento: z.number().int().min(0).max(99),
  empatia: z.number().int().min(0).max(99),
  dominacao: z.number().int().min(0).max(99),
  persuasao: z.number().int().min(0).max(99),
  performance: z.number().int().min(0).max(99),
})

const ELEMENTS = ['Energia', 'Anomalia', 'Paradoxo', 'Astral', 'Cognitivo'] as const

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  race: z.string().max(50).default(''),
  nationality: z.string().max(100).nullable().optional(),
  religion: z.string().max(100).nullable().optional(),
  concept: z.string().max(200).default(''),
  quote: z.string().max(500).default(''),
  image_url: z.string().url().nullable().optional(),
  level: z.number().int().min(0).default(0),
  attributes: AttributesSchema,
  skills: SkillsSchema,
  talents: z.array(z.string()).default([]),
  hp: z.number().int().min(0),
  sanidade: z.number().int().min(0),
  afinidade: z.enum(ELEMENTS).or(z.literal('')).default(''),
  antitese: z.enum(ELEMENTS).or(z.literal('')).default(''),
  entropia: z.number().int().min(0).max(5).default(0),
  runas: z.array(z.string()).default([]),
  traumas: z.array(z.string()).default([]),
  antecedentes: z.array(z.string()).default([]),
  historia: z.string().nullable().optional(),
  is_public: z.boolean().default(false),
})

export const UpdateCharacterSchema = CreateCharacterSchema.partial()

export const CurrentValuesSchema = z.object({
  current_hp: z.number().int().min(0).optional(),
  current_sanidade: z.number().int().min(0).optional(),
})

export const VisibilitySchema = z.object({
  is_public: z.boolean(),
})

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterSchema>
