import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Supabase — Auth e Storage apenas
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((s) => s.split(',')),

  SUPABASE_STORAGE_BUCKET: z.string().default('character-portraits'),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(15),
  MAX_MAP_IMAGE_SIZE_MB: z.coerce.number().default(30),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Variáveis de ambiente inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
