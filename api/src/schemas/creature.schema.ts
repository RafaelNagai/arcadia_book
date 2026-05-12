import { z } from 'zod'

const CreatureEntrySchema = z.object({
  name: z.string(),
  description: z.string(),
})

const CreatureActionSchema = z.object({
  name: z.string(),
  description: z.string(),
  once: z.string().optional(),
})

const CreatureVariantSchema = z.object({
  name: z.string(),
  diceBase: z.string(),
  hp: z.number().int().min(0),
  da: z.number().int().min(0),
  note: z.string(),
})

const CreatureAttributesSchema = z.object({
  fisico: z.number().int().min(0).max(99),
  destreza: z.number().int().min(0).max(99),
  intelecto: z.number().int().min(0).max(99),
  influencia: z.number().int().min(0).max(99),
})

export const CreateCustomCreatureSchema = z.object({
  name: z.string().min(1).max(100),
  levelRange: z.string().max(20).default('1'),
  style: z.string().max(100).default(''),
  imageUrl: z.string().url().nullable().optional(),
  lore: z.string().default(''),
  diceBase: z.string().max(20).default('2D6'),
  hp: z.number().int().min(0).default(10),
  da: z.number().int().min(0).default(1),
  dp: z.number().int().min(0).default(1),
  attributes: CreatureAttributesSchema.default({ fisico: 1, destreza: 1, intelecto: 1, influencia: 1 }),
  immune: z.array(z.string()).default([]),
  vulnerable: z.array(z.string()).default([]),
  interactions: z.array(CreatureEntrySchema).default([]),
  actions: z.array(CreatureActionSchema).default([]),
  reactions: z.array(CreatureActionSchema).default([]),
  variants: z.array(CreatureVariantSchema).default([]),
  isPublic: z.boolean().default(false),
})

export const UpdateCustomCreatureSchema = CreateCustomCreatureSchema.partial()

export const VisibilitySchema = z.object({
  is_public: z.boolean(),
})

export type CreateCustomCreatureInput = z.infer<typeof CreateCustomCreatureSchema>
export type UpdateCustomCreatureInput = z.infer<typeof UpdateCustomCreatureSchema>
