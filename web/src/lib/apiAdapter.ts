import type { Character } from '@/data/characterTypes'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isApiCharacterId(id: string): boolean {
  return UUID_RE.test(id)
}

export function mapApiToCharacter(raw: Record<string, unknown>): Character {
  return {
    id: raw.id as string,
    name: raw.name as string,
    race: raw.race as string,
    concept: raw.concept as string,
    quote: raw.quote as string,
    image: (raw.imageUrl as string | null) ?? null,
    level: raw.level as number,
    attributes: raw.attributes as Character['attributes'],
    skills: raw.skills as Character['skills'],
    talents: (raw.talents as string[]) ?? [],
    hp: raw.hp as number,
    sanidade: raw.sanidade as number,
    currentHp: raw.currentHp as number | undefined,
    currentSanidade: raw.currentSanidade as number | undefined,
    owned: true,
    afinidade: raw.afinidade as string,
    antitese: raw.antitese as string,
    entropia: raw.entropia as number,
    runas: (raw.runas as string[]) ?? [],
    traumas: (raw.traumas as string[]) ?? [],
    antecedentes: (raw.antecedentes as string[]) ?? [],
    historia: (raw.historia as string | undefined) ?? undefined,
  }
}

export function mapCharacterToApi(char: Character): Record<string, unknown> {
  return {
    name: char.name,
    race: char.race,
    concept: char.concept,
    quote: char.quote,
    image_url: char.image,
    level: char.level,
    attributes: char.attributes,
    skills: char.skills,
    talents: char.talents,
    hp: char.hp,
    sanidade: char.sanidade,
    afinidade: char.afinidade,
    antitese: char.antitese,
    entropia: char.entropia,
    runas: char.runas,
    traumas: char.traumas,
    antecedentes: char.antecedentes,
    historia: char.historia,
  }
}
