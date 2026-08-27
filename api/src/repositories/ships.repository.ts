import type { PrismaClient } from '../generated/prisma/client.js'
import type { CreateShipInput } from '../schemas/ship.schema.js'

const CREW_CHARACTER_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  isPublic: true,
  userId: true,
}

export class ShipsRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string) {
    return this.db.ship.findUnique({
      where: { id },
      include: {
        crew: {
          include: { character: { select: CREW_CHARACTER_SELECT } },
        },
      },
    })
  }

  findByCrewCode(code: string) {
    return this.db.ship.findUnique({ where: { crewCode: code.toUpperCase() } })
  }

  findByUserId(userId: string) {
    return this.db.ship.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  }

  findPublic(excludeUserId?: string) {
    return this.db.ship.findMany({
      where: {
        isPublic: true,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(userId: string, crewCode: string, input: CreateShipInput) {
    return this.db.ship.create({
      data: {
        userId,
        name: input.name,
        motto: input.motto ?? '',
        type: input.type ?? 'Material',
        porte: input.porte ?? '',
        imageUrl: input.image_url ?? null,
        description: input.description ?? '',
        slotsTotal: input.slots_total ?? 4,
        hp: input.hp ?? 4,
        sectors: (input.sectors as object[]) ?? [],
        isPublic: input.is_public ?? false,
        crewCode,
      },
    })
  }

  update(id: string, patch: Record<string, unknown>) {
    return this.db.ship.update({ where: { id }, data: patch })
  }

  delete(id: string) {
    return this.db.ship.delete({ where: { id } })
  }

  addCrew(shipId: string, characterId: string) {
    return this.db.shipCrew.create({ data: { shipId, characterId } })
  }

  removeCrew(characterId: string) {
    return this.db.shipCrew.delete({ where: { characterId } })
  }

  findCrewMembership(characterId: string) {
    return this.db.shipCrew.findUnique({ where: { characterId }, include: { ship: true } })
  }

  findCrewMembershipForUser(shipId: string, userId: string) {
    return this.db.shipCrew.findFirst({ where: { shipId, character: { userId } } })
  }
}
