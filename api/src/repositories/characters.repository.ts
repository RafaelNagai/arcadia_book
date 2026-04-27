import type { PrismaClient, Character } from '../generated/prisma/client.js'
import type { CreateCharacterInput } from '../schemas/character.schema.js'

export class CharactersRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string): Promise<Character | null> {
    return this.db.character.findUnique({ where: { id } })
  }

  findPublic(excludeUserId?: string) {
    return this.db.character.findMany({
      where: {
        isPublic: true,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        campaignCharacter: {
          select: { role: true, campaign: { select: { id: true, title: true } } },
        },
      },
    })
  }

  findByUserId(userId: string) {
    return this.db.character.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaignCharacter: {
          select: {
            role: true,
            campaign: { select: { id: true, title: true } },
          },
        },
      },
    })
  }

  create(userId: string, input: CreateCharacterInput): Promise<Character> {
    return this.db.character.create({
      data: {
        userId,
        name: input.name,
        race: input.race ?? '',
        nationality: input.nationality ?? null,
        religion: input.religion ?? null,
        concept: input.concept ?? '',
        quote: input.quote ?? '',
        imageUrl: input.image_url ?? null,
        level: input.level ?? 0,
        attributes: input.attributes as object,
        skills: input.skills as object,
        talents: input.talents ?? [],
        hp: input.hp,
        sanidade: input.sanidade,
        afinidade: input.afinidade ?? '',
        antitese: input.antitese ?? '',
        entropia: input.entropia ?? 0,
        runas: input.runas ?? [],
        traumas: input.traumas ?? [],
        antecedentes: input.antecedentes ?? [],
        historia: input.historia ?? null,
        isPublic: input.is_public ?? false,
      },
    })
  }

  update(id: string, patch: Record<string, unknown>): Promise<Character> {
    return this.db.character.update({ where: { id }, data: patch })
  }

  delete(id: string): Promise<Character> {
    return this.db.character.delete({ where: { id } })
  }
}
