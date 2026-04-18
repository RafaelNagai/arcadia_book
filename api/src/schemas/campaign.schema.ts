import { z } from 'zod'

export const CreateCampaignSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).default(''),
  image_url: z.string().url().nullable().optional(),
})

export const UpdateCampaignSchema = CreateCampaignSchema.partial()

export const JoinCampaignSchema = z.object({
  code: z.string().min(1),
  character_id: z.string().uuid(),
})

export const AddNpcSchema = z.object({
  character_id: z.string().uuid(),
})

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>
export type JoinCampaignInput = z.infer<typeof JoinCampaignSchema>
