import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, 'VALIDATION_ERROR', message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message)
  }
}

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message },
    })
  }

  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.flatten().fieldErrors,
      },
    })
  }

  // Fastify validation errors (from schema)
  if ('statusCode' in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: { code: 'BAD_REQUEST', message: error.message },
    })
  }

  console.error(error)
  return reply.status(500).send({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
  })
}
