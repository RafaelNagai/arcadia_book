import { z } from 'zod'

const SessionDescriptionSchema = z.object({
  sdp: z.string().min(1),
  type: z.enum(['offer', 'answer']),
})

const TrackObjectSchema = z.object({
  location: z.enum(['local', 'remote']),
  mid: z.string().optional(),
  trackName: z.string().min(1),
  sessionId: z.string().optional(),
  kind: z.enum(['audio', 'video']).optional(),
})

export const NegotiateTracksSchema = z.object({
  sessionDescription: SessionDescriptionSchema.optional(),
  tracks: z.array(TrackObjectSchema).min(1),
  autoDiscover: z.boolean().optional(),
})

export const RenegotiateSchema = z.object({
  sessionDescription: SessionDescriptionSchema,
})

export type NegotiateTracksInput = z.infer<typeof NegotiateTracksSchema>
export type RenegotiateInput = z.infer<typeof RenegotiateSchema>
