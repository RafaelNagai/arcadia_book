import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient
  }

  interface FastifyRequest {
    user?: User
  }
}
