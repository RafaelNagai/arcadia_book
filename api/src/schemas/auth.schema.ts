import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
})
