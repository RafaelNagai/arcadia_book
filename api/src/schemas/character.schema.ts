import { z } from 'zod'

const AttributesSchema = z.object({
  fisico: z.number().int().min(0).max(10),
  destreza: z.number().int().min(0).max(10),
  intelecto: z.number().int().min(0).max(10),
  influencia: z.number().int().min(0).max(10),
})

const SkillsSchema = z.object({
  fortitude: z.number().int().min(0).max(10),
  vontade: z.number().int().min(0).max(10),
  atletismo: z.number().int().min(0).max(10),
  combate: z.number().int().min(0).max(10),
  furtividade: z.number().int().min(0).max(10),
  precisao: z.number().int().min(0).max(10),
  acrobacia: z.number().int().min(0).max(10),
  reflexo: z.number().int().min(0).max(10),
  percepcao: z.number().int().min(0).max(10),
  intuicao: z.number().int().min(0).max(10),
  investigacao: z.number().int().min(0).max(10),
  conhecimento: z.number().int().min(0).max(10),
  empatia: z.number().int().min(0).max(10),
  dominacao: z.number().int().min(0).max(10),
  persuasao: z.number().int().min(0).max(10),
  performance: z.number().int().min(0).max(10),
})

const ELEMENTS = ['Energia', 'Anomalia', 'Paradoxo', 'Astral', 'Cognitivo'] as const

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  race: z.string().max(50).default(''),
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
