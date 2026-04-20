import { z } from 'zod'

export const CreateMapSchema = z.object({
  title: z.string().min(1).max(100),
  grid_enabled: z.boolean().default(false),
  grid_size: z.number().int().min(16).max(256).default(64),
  vision_unified: z.boolean().default(true),
  default_vision_radius: z.number().int().min(50).max(2000).default(150),
})

export const UpdateMapSchema = CreateMapSchema.partial()

export const CreateMapLayerSchema = z.object({
  name: z.string().min(1).max(100),
  order_index: z.number().int().min(0).default(0),
  image_url: z.string().url(),
})

export const UpdateMapLayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order_index: z.number().int().min(0).optional(),
})

export const CreateMapTokenSchema = z.object({
  layer_id: z.string().uuid(),
  character_id: z.string().uuid(),
  x: z.number().default(0),
  y: z.number().default(0),
  vision_radius: z.number().int().min(50).max(2000).nullable().optional(),
  is_visible: z.boolean().default(true),
})

export const UpdateMapTokenSchema = z.object({
  layer_id: z.string().uuid().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  vision_radius: z.number().int().min(50).max(2000).nullable().optional(),
  is_visible: z.boolean().optional(),
})

export type CreateMapInput = z.infer<typeof CreateMapSchema>
export type UpdateMapInput = z.infer<typeof UpdateMapSchema>
export type CreateMapLayerInput = z.infer<typeof CreateMapLayerSchema>
export type UpdateMapLayerInput = z.infer<typeof UpdateMapLayerSchema>
export type CreateMapTokenInput = z.infer<typeof CreateMapTokenSchema>
export type UpdateMapTokenInput = z.infer<typeof UpdateMapTokenSchema>
