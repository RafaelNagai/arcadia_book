import type { PrismaClient, Ship } from '../generated/prisma/client.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, NotFoundError, ValidationError } from '../middleware/error-handler.js'
import { ShipsRepository } from '../repositories/ships.repository.js'
import { CharactersRepository } from '../repositories/characters.repository.js'
import { UploadService } from './upload.service.js'
import type { CreateShipInput, UpdateShipInput } from '../schemas/ship.schema.js'

function generateCrewCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function serializeCrew(crew: Array<{
  id: string
  characterId: string
  joinedAt: Date
  character: { id: string; name: string; imageUrl: string | null; isPublic: boolean; userId: string }
}>) {
  return crew.map(c => ({
    id: c.id,
    characterId: c.characterId,
    joinedAt: c.joinedAt,
    name: c.character.name,
    imageUrl: c.character.imageUrl,
    isPublic: c.character.isPublic,
    userId: c.character.userId,
  }))
}

export class ShipsService {
  private readonly repo: ShipsRepository
  private readonly charRepo: CharactersRepository
  private readonly uploadSvc: UploadService

  constructor(db: PrismaClient, supabase: SupabaseClient) {
    this.repo = new ShipsRepository(db)
    this.charRepo = new CharactersRepository(db)
    this.uploadSvc = new UploadService(supabase)
  }

  create(userId: string, input: CreateShipInput) {
    return this.repo.create(userId, generateCrewCode(), input)
  }

  list(userId: string) {
    return this.repo.findByUserId(userId)
  }

  async listPublic(requestingUserId?: string) {
    const ships = await this.repo.findPublic(requestingUserId)
    return ships.map(s => ({ ...s, crewCode: undefined }))
  }

  async get(id: string, requestingUserId?: string) {
    const ship = await this.repo.findById(id)
    if (!ship) throw new NotFoundError('Navio não encontrado')

    const isOwner = ship.userId === requestingUserId
    const isCrew = requestingUserId
      ? await this.repo.findCrewMembershipForUser(id, requestingUserId)
      : null

    if (!ship.isPublic && !isOwner && !isCrew) throw new ForbiddenError('Este navio é privado')

    return {
      ...ship,
      crewCode: isOwner ? ship.crewCode : undefined,
      crew: serializeCrew(ship.crew),
    }
  }

  async update(id: string, userId: string, input: UpdateShipInput) {
    const ship = await this.assertOwner(id, userId)
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.motto !== undefined) patch.motto = input.motto
    if (input.type !== undefined) patch.type = input.type
    if (input.porte !== undefined) patch.porte = input.porte
    if (input.image_url !== undefined) patch.imageUrl = input.image_url
    if (input.description !== undefined) patch.description = input.description
    if (input.slots_total !== undefined) patch.slotsTotal = input.slots_total
    if (input.hp !== undefined) {
      patch.hp = input.hp
      if (ship.currentHp !== null && ship.currentHp > input.hp) patch.currentHp = input.hp
    }
    if (input.sectors !== undefined) patch.sectors = input.sectors
    if (input.is_public !== undefined) patch.isPublic = input.is_public

    const updated = await this.repo.update(id, patch)
    if ('image_url' in input && ship.imageUrl && ship.imageUrl !== input.image_url) {
      await this.uploadSvc.deleteImageByUrl(ship.imageUrl).catch(() => {})
    }
    return updated
  }

  async updateCurrentHp(id: string, userId: string, currentHp: number) {
    await this.assertOwnerOrCrew(id, userId)
    return this.repo.update(id, { currentHp })
  }

  async setVisibility(id: string, userId: string, isPublic: boolean) {
    await this.assertOwner(id, userId)
    return this.repo.update(id, { isPublic })
  }

  async delete(id: string, userId: string) {
    const ship = await this.assertOwner(id, userId)
    await this.repo.delete(id)
    await this.uploadSvc.deleteShipFolder(ship.userId, id).catch(() => {})
  }

  async regenerateCode(id: string, userId: string) {
    await this.assertOwner(id, userId)
    const updated = await this.repo.update(id, { crewCode: generateCrewCode() })
    return updated.crewCode
  }

  async join(code: string, characterId: string, userId: string) {
    const ship = await this.repo.findByCrewCode(code)
    if (!ship) throw new NotFoundError('Código de convite inválido')

    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')
    if (char.userId !== userId) throw new ForbiddenError()

    const existing = await this.repo.findCrewMembership(characterId)
    if (existing) throw new ValidationError('Este personagem já está em uma tripulação')

    return this.repo.addCrew(ship.id, characterId)
  }

  async leave(shipId: string, characterId: string, userId: string) {
    const ship = await this.repo.findById(shipId)
    if (!ship) throw new NotFoundError('Navio não encontrado')

    const char = await this.charRepo.findById(characterId)
    if (!char) throw new NotFoundError('Personagem não encontrado')

    const isShipOwner = ship.userId === userId
    const isCharOwner = char.userId === userId
    if (!isShipOwner && !isCharOwner) throw new ForbiddenError()

    await this.repo.removeCrew(characterId)
  }

  private async assertOwner(id: string, userId: string): Promise<Ship> {
    const ship = await this.repo.findById(id)
    if (!ship) throw new NotFoundError('Navio não encontrado')
    if (ship.userId !== userId) throw new ForbiddenError()
    return ship
  }

  private async assertOwnerOrCrew(id: string, userId: string): Promise<Ship> {
    const ship = await this.repo.findById(id)
    if (!ship) throw new NotFoundError('Navio não encontrado')
    if (ship.userId === userId) return ship
    const membership = await this.repo.findCrewMembershipForUser(id, userId)
    if (membership) return ship
    throw new ForbiddenError()
  }
}
