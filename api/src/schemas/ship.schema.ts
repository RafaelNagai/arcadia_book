import { z } from 'zod'

const SECTOR_CATEGORIES = [
  'armamentos',
  'casco',
  'velas_motores',
  'radar',
  'dormitorio',
  'cozinha',
  'biblioteca',
  'armazem',
  'prisao',
] as const

const InstalledSectorSchema = z.object({
  id: z.string().min(1),
  category: z.enum(SECTOR_CATEGORIES),
  key: z.string().min(1),
})

const SHIP_TYPES = ['Material', 'Organico'] as const

export const CreateShipSchema = z.object({
  name: z.string().min(1).max(100),
  motto: z.string().max(200).default(''),
  type: z.enum(SHIP_TYPES).default('Material'),
  porte: z.string().max(50).default(''),
  image_url: z.string().url().nullable().optional(),
  description: z.string().max(2000).default(''),
  slots_total: z.number().int().min(0).max(999).default(4),
  hp: z.number().int().min(0).default(4),
  sectors: z.array(InstalledSectorSchema).default([]),
  is_public: z.boolean().default(false),
})

export const UpdateShipSchema = CreateShipSchema.partial()

export const CurrentHpSchema = z.object({
  current_hp: z.number().int().min(0),
})

export const VisibilitySchema = z.object({
  is_public: z.boolean(),
})

export const JoinShipSchema = z.object({
  code: z.string().min(1),
  character_id: z.string().uuid(),
})

export const LeaveShipSchema = z.object({
  character_id: z.string().uuid(),
})

export const MoralActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('roll') }),
  z.object({ action: z.literal('add') }),
  z.object({ action: z.literal('remove'), index: z.number().int().min(0) }),
  z.object({ action: z.literal('adjust'), index: z.number().int().min(0), delta: z.union([z.literal(1), z.literal(-1)]) }),
  z.object({ action: z.literal('set'), index: z.number().int().min(0), value: z.number().int().min(1).max(12) }),
])

export type CreateShipInput = z.infer<typeof CreateShipSchema>
export type UpdateShipInput = z.infer<typeof UpdateShipSchema>
export type MoralActionInput = z.infer<typeof MoralActionSchema>
