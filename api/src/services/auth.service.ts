import type { SupabaseClient } from '@supabase/supabase-js'
import { ValidationError } from '../middleware/error-handler.js'
import { env } from '../config/env.js'

export class AuthService {
  constructor(private readonly db: SupabaseClient) {}

  async signUp(email: string, password: string) {
    const { data, error } = await this.db.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })
    if (error) throw new ValidationError(error.message)
    return data.user
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.db.auth.signInWithPassword({ email, password })
    if (error) throw new ValidationError('Email ou senha inválidos')
    return data
  }

  async signOut(token: string) {
    // Resolve userId from token, then invalidate all sessions for that user
    const { data, error: userError } = await this.db.auth.getUser(token)
    if (userError || !data.user) throw new ValidationError('Token inválido')
    const { error } = await this.db.auth.admin.signOut(data.user.id)
    if (error) throw new ValidationError(error.message)
  }

  async forgotPassword(email: string) {
    const { error } = await this.db.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.CORS_ORIGINS[0]}/redefinir-senha`,
    })
    if (error) throw new ValidationError(error.message)
  }

  async resetPassword(token: string, newPassword: string) {
    // Exchange OTP token for a session then update password
    const { data: session, error: sessionError } = await this.db.auth.getUser(token)
    if (sessionError || !session.user) throw new ValidationError('Token inválido ou expirado')

    const { error } = await this.db.auth.admin.updateUserById(session.user.id, {
      password: newPassword,
    })
    if (error) throw new ValidationError(error.message)
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.db.auth.refreshSession({ refresh_token: refreshToken })
    if (error) throw new ValidationError('Refresh token inválido')
    return data
  }
}
