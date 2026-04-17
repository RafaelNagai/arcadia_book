import { z } from 'zod'

export const PeChecksSchema = z.object({
  pe_checks: z.record(z.array(z.boolean())),
})

export const SkillModifiersSchema = z.object({
  skill_modifiers: z.record(z.number()),
})

export const DefenseModifiersSchema = z.object({
  defense_modifiers: z.object({
    daBase: z.number().int(),
    daBonus: z.number().int(),
    dpBonus: z.number().int(),
  }),
})

export const DiceLogEntrySchema = z.object({
  id: z.string(),
  skill: z.string(),
  roll: z.array(z.number()),
  total: z.number(),
  result: z.enum(['critico', 'acerto', 'falha', 'falha_critica']),
  timestamp: z.number(),
})

export const AppendDiceLogSchema = z.object({
  entry: DiceLogEntrySchema,
})
