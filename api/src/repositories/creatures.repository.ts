import type { PrismaClient, CustomCreature } from '../generated/prisma/client.js'
import type { CreateCustomCreatureInput } from '../schemas/creature.schema.js'

export class CreaturesRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string): Promise<CustomCreature | null> {
    return this.db.customCreature.findUnique({ where: { id } })
  }

  findByUserId(userId: string): Promise<CustomCreature[]> {
    return this.db.customCreature.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  findPublic(): Promise<CustomCreature[]> {
    return this.db.customCreature.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(userId: string, input: CreateCustomCreatureInput): Promise<CustomCreature> {
    return this.db.customCreature.create({
      data: {
        userId,
        name: input.name,
        levelRange: input.levelRange ?? '1',
        style: input.style ?? '',
        imageUrl: input.imageUrl ?? null,
        lore: input.lore ?? '',
        diceBase: input.diceBase ?? '2D6',
        hp: input.hp ?? 10,
        da: input.da ?? 1,
        dp: input.dp ?? 1,
        attributes: input.attributes as object,
        immune: input.immune ?? [],
        vulnerable: input.vulnerable ?? [],
        interactions: (input.interactions ?? []) as object[],
        actions: (input.actions ?? []) as object[],
        reactions: (input.reactions ?? []) as object[],
        variants: (input.variants ?? []) as object[],
        isPublic: input.isPublic ?? false,
      },
    })
  }

  update(id: string, patch: Record<string, unknown>): Promise<CustomCreature> {
    return this.db.customCreature.update({ where: { id }, data: patch })
  }

  delete(id: string): Promise<CustomCreature> {
    return this.db.customCreature.delete({ where: { id } })
  }
}
