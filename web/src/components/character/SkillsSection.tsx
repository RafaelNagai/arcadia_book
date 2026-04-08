import type { Character } from "@/data/characterTypes"
import { ATTR_GROUPS, AttributeBlock } from "./AttributeBlock"
import { SectionLabel } from "./CharacterUI"

export function SkillsSection({
  character,
  accentText,
  peChecks,
  skillModifiers,
  onPeToggle,
  onModifierChange,
  onModifierReset,
  onEditAttrs,
  onEditSkills,
}: {
  character: Character
  accentText: string
  peChecks: Record<string, boolean[]>
  skillModifiers: Record<string, number>
  onPeToggle: (attr: string, idx: number) => void
  onModifierChange: (skillKey: string, delta: number) => void
  onModifierReset: (skillKey: string) => void
  onEditAttrs?: () => void
  onEditSkills?: () => void
}) {
  const edits =
    onEditAttrs || onEditSkills
      ? [
          ...(onEditAttrs ? [{ label: "atributos", fn: onEditAttrs }] : []),
          ...(onEditSkills ? [{ label: "perícias",  fn: onEditSkills }] : []),
        ]
      : undefined

  return (
    <section>
      <SectionLabel accent={accentText} edits={edits}>
        Atributos e Perícias
      </SectionLabel>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ATTR_GROUPS.map((group) => (
          <AttributeBlock
            key={group.attr}
            group={group}
            character={character}
            peChecks={peChecks[group.attr]}
            onPeToggle={(idx) => onPeToggle(group.attr, idx)}
            skillModifiers={skillModifiers}
            onModifierChange={onModifierChange}
            onModifierReset={onModifierReset}
          />
        ))}
      </div>
      <p
        className="text-xs mt-3"
        style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}
      >
        ◆ com talento — permite rolar 3D12 em testes de perícia · ◇ sem talento
      </p>
    </section>
  )
}
