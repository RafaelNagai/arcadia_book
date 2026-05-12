import type { PrismaClient, CustomCreature } from '../generated/prisma/client.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CreaturesRepository } from '../repositories/creatures.repository.js'
import { UploadService } from './upload.service.js'
import type { CreateCustomCreatureInput, UpdateCustomCreatureInput } from '../schemas/creature.schema.js'

export class CreaturesService {
  private readonly repo: CreaturesRepository
  private readonly uploadSvc: UploadService

  constructor(db: PrismaClient, supabase: SupabaseClient) {
    this.repo = new CreaturesRepository(db)
    this.uploadSvc = new UploadService(supabase)
  }

  async list(userId: string): Promise<CustomCreature[]> {
    return this.repo.findByUserId(userId)
  }

  async listPublic(): Promise<CustomCreature[]> {
    return this.repo.findPublic()
  }

  async get(id: string, requestingUserId?: string): Promise<CustomCreature> {
    const creature = await this.repo.findById(id)
    if (!creature) throw new NotFoundError('Criatura não encontrada')
    if (!creature.isPublic && creature.userId !== requestingUserId) {
      throw new ForbiddenError('Esta criatura é privada')
    }
    return creature
  }

  async create(userId: string, input: CreateCustomCreatureInput): Promise<CustomCreature> {
    return this.repo.create(userId, input)
  }

  async update(id: string, userId: string, input: UpdateCustomCreatureInput): Promise<CustomCreature> {
    const creature = await this.assertOwner(id, userId)
    const patch: Record<string, unknown> = { ...input }
    if ('imageUrl' in patch && creature.imageUrl && creature.imageUrl !== patch.imageUrl) {
      await this.uploadSvc.deleteImageByUrl(creature.imageUrl).catch(() => {})
    }
    return this.repo.update(id, patch)
  }

  async setVisibility(id: string, userId: string, isPublic: boolean): Promise<CustomCreature> {
    await this.assertOwner(id, userId)
    return this.repo.update(id, { isPublic })
  }

  async delete(id: string, userId: string): Promise<void> {
    const creature = await this.assertOwner(id, userId)
    await this.repo.delete(id)
    await this.uploadSvc.deleteCreatureFolder(creature.userId, id).catch(() => {})
  }

  private async assertOwner(id: string, userId: string): Promise<CustomCreature> {
    const creature = await this.repo.findById(id)
    if (!creature) throw new NotFoundError('Criatura não encontrada')
    if (creature.userId !== userId) throw new ForbiddenError()
    return creature
  }
}
