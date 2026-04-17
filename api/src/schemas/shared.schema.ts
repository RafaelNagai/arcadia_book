import { z } from 'zod'

export const UUIDParamSchema = z.object({
  id: z.string().uuid(),
})

export const UUIDItemParamSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const UUIDBagParamSchema = z.object({
  id: z.string().uuid(),
  bagId: z.string().uuid(),
})
