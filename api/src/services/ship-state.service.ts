import { randomUUID } from 'node:crypto'
import type { PrismaClient, ShipState, Ship } from '../generated/prisma/client.js'
import { ForbiddenError, NotFoundError, ValidationError } from '../middleware/error-handler.js'
import { ShipsRepository } from '../repositories/ships.repository.js'
import { ShipStateRepository } from '../repositories/ship-state.repository.js'
import type { MoralActionInput } from '../schemas/ship.schema.js'
import type { MoralLogEntry } from '../types/domain.js'

function rollD12(): number {
  return Math.floor(Math.random() * 12) + 1
}

export class ShipStateService {
  private readonly shipsRepo: ShipsRepository
  private readonly repo: ShipStateRepository

  constructor(db: PrismaClient) {
    this.shipsRepo = new ShipsRepository(db)
    this.repo = new ShipStateRepository(db)
  }

  async get(shipId: string, userId?: string): Promise<ShipState> {
    await this.assertReadable(shipId, userId)
    return this.repo.findOrCreate(shipId)
  }

  async mutateMoral(shipId: string, userId: string, action: MoralActionInput): Promise<ShipState> {
    await this.assertOwnerOrCrew(shipId, userId)
    const state = await this.repo.findOrCreate(shipId)
    const pool = [...((state.moralPool as unknown) as number[])]
    let detail: string

    switch (action.action) {
      case 'roll': {
        pool.length = 0
        for (let i = 0; i < 5; i++) pool.push(rollD12())
        detail = `O Capitão rolou 5D12 para o Pote de Moral: [${pool.join(', ')}]`
        break
      }
      case 'add': {
        const value = rollD12()
        pool.push(value)
        detail = `Um dado foi adicionado ao Pote de Moral: ${value}`
        break
      }
      case 'remove': {
        if (action.index < 0 || action.index >= pool.length) throw new ValidationError('Dado inválido')
        const [removed] = pool.splice(action.index, 1)
        detail = `Um dado foi removido do Pote de Moral: ${removed}`
        break
      }
      case 'adjust': {
        if (action.index < 0 || action.index >= pool.length) throw new ValidationError('Dado inválido')
        const current = pool[action.index]
        const next = Math.min(12, Math.max(1, current + action.delta))
        pool[action.index] = next
        detail = `Dado ajustado de ${current} para ${next}`
        break
      }
      case 'set': {
        if (action.index < 0 || action.index >= pool.length) throw new ValidationError('Dado inválido')
        const current = pool[action.index]
        pool[action.index] = action.value
        detail = `Dado definido manualmente: ${current} → ${action.value}`
        break
      }
    }

    const entry: MoralLogEntry = {
      id: randomUUID(),
      timestamp: Date.now(),
      action: action.action,
      detail,
      pool: [...pool],
    }

    return this.repo.applyMoralMutation(shipId, pool, entry)
  }

  private async assertOwnerOrCrew(shipId: string, userId: string): Promise<Ship> {
    const ship = await this.shipsRepo.findById(shipId)
    if (!ship) throw new NotFoundError('Navio não encontrado')
    if (ship.userId === userId) return ship
    const membership = await this.shipsRepo.findCrewMembershipForUser(shipId, userId)
    if (membership) return ship
    throw new ForbiddenError()
  }

  private async assertReadable(shipId: string, userId?: string): Promise<Ship> {
    const ship = await this.shipsRepo.findById(shipId)
    if (!ship) throw new NotFoundError('Navio não encontrado')
    if (ship.isPublic) return ship
    if (!userId) throw new ForbiddenError()
    if (ship.userId === userId) return ship
    const membership = await this.shipsRepo.findCrewMembershipForUser(shipId, userId)
    if (membership) return ship
    throw new ForbiddenError()
  }
}
