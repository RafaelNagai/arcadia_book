import { z } from 'zod'

const WeightSchema = z.enum([
  'nulo',
  'super_leve',
  'leve',
  'medio',
  'pesado',
  'super_pesado',
  'massivo',
  'hyper_massivo',
])

export const CreateItemSchema = z.object({
  bag_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().default(''),
  weight: WeightSchema.default('nulo'),
  is_equipment: z.boolean().default(false),
  max_durability: z.number().int().min(1).nullable().optional(),
  current_durability: z.number().int().min(0).nullable().optional(),
  image_url: z.string().nullable().optional(),
  catalog_image: z.string().nullable().optional(),
  from_catalog: z.boolean().default(false),
  catalog_subcategory: z.string().nullable().optional(),
  catalog_tier: z.string().nullable().optional(),
  damage: z.string().nullable().optional(),
  da: z.string().nullable().optional(),
  effects: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
})

export const UpdateItemSchema = CreateItemSchema.partial()

export const ReorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int(),
      bag_id: z.string().uuid().nullable().optional(),
    }),
  ),
})

export const CreateBagSchema = z.object({
  name: z.string().min(1).max(100),
  slots: z.number().int().min(1).max(50).default(4),
  sort_order: z.number().int().default(0),
})

export const UpdateBagSchema = CreateBagSchema.partial()

export type CreateItemInput = z.infer<typeof CreateItemSchema>
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>
export type CreateBagInput = z.infer<typeof CreateBagSchema>
export type UpdateBagInput = z.infer<typeof UpdateBagSchema>
