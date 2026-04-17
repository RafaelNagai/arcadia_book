import type { FastifyInstance } from 'fastify'
import { AuthService } from '../services/auth.service.js'
import {
  ForgotPasswordSchema,
  RefreshTokenSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
} from '../schemas/auth.schema.js'
import { UnauthorizedError } from '../middleware/error-handler.js'

export async function authController(fastify: FastifyInstance) {
  const svc = new AuthService(fastify.supabase)

  fastify.post('/signup', async (req, reply) => {
    const { email, password } = SignUpSchema.parse(req.body)
    const user = await svc.signUp(email, password)
    return reply.status(201).send({ user })
  })

  fastify.post('/signin', async (req, reply) => {
    const { email, password } = SignInSchema.parse(req.body)
    const data = await svc.signIn(email, password)
    return reply.send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    })
  })

  fastify.post('/signout', async (req, reply) => {
    const token = req.headers.authorization?.slice(7)
    if (!token) throw new UnauthorizedError()
    await svc.signOut(token)
    return reply.status(204).send()
  })

  fastify.post('/forgot-password', async (req, reply) => {
    const { email } = ForgotPasswordSchema.parse(req.body)
    await svc.forgotPassword(email)
    return reply.send({ message: 'Email de recuperação enviado' })
  })

  fastify.post('/reset-password', async (req, reply) => {
    const token = req.headers.authorization?.slice(7)
    if (!token) throw new UnauthorizedError()
    const { password } = ResetPasswordSchema.parse(req.body)
    await svc.resetPassword(token, password)
    return reply.send({ message: 'Senha alterada com sucesso' })
  })

  fastify.get('/me', async (req, reply) => {
    await fastify.authenticate(req)
    return reply.send({ user: req.user })
  })

  fastify.post('/refresh', async (req, reply) => {
    const { refresh_token } = RefreshTokenSchema.parse(req.body)
    const data = await svc.refreshToken(refresh_token)
    return reply.send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    })
  })
}
