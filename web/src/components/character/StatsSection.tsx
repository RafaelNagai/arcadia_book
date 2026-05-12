import { useMemo } from "react";
import type { Character, Condition, ConditionEffectField } from "@/data/characterTypes";
import { HoneycombGrid } from "./HoneycombGrid";
import { SectionLabel } from "./CharacterUI";
import { DefenseStats } from "./DefenseStats";
import { ConditionsSection } from "./ConditionsSection";

export function StatsSection({
  character,
  accentText,
  currentHp,
  currentSanidade,
  owned,
  onHpClick,
  onSanidadeClick,
  daBase,
  daBonus,
  dpBonus,
  onDaBaseChange,
  onDaChange,
  onDaReset,
  onDpChange,
  onDpReset,
  conditions,
  isGm,
  onAddCondition,
  onRemoveCondition,
}: {
  character: Character;
  accentText: string;
  currentHp: number;
  currentSanidade: number;
  owned: boolean;
  onHpClick: (idx: number) => void;
  onSanidadeClick: (idx: number) => void;
  daBase: number;
  daBonus: number;
  dpBonus: number;
  onDaBaseChange?: (delta: number) => void;
  onDaChange?: (delta: number) => void;
  onDaReset?: () => void;
  onDpChange?: (delta: number) => void;
  onDpReset?: () => void;
  onEdit?: () => void;
  conditions: Condition[];
  isGm: boolean;
  onAddCondition?: (c: Condition) => void;
  onRemoveCondition?: (id: string) => void;
}) {
  const conditionEffectMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const cond of conditions) {
      for (const eff of cond.effects ?? []) {
        if (eff.field !== 'dano' && typeof eff.value === 'number') {
          const k = eff.field as ConditionEffectField
          map[k] = (map[k] ?? 0) + eff.value
        }
      }
    }
    return map
  }, [conditions])

  return (
    <section>
      <SectionLabel accent={accentText}>Vitalidade</SectionLabel>
      <div className="flex flex-wrap gap-12 items-start">
        <HoneycombGrid
          total={character.hp + (conditionEffectMap.hpMax ?? 0)}
          current={currentHp}
          colorTop="#9EDA60"
          colorBottom="#1C5C10"
          label="Pontos de Vida"
          accentColor="#6EC840"
          onCellClick={owned ? onHpClick : undefined}
        />
        <HoneycombGrid
          total={character.sanidade + (conditionEffectMap.sanidadeMax ?? 0)}
          current={currentSanidade}
          colorTop="#EAA8A8"
          colorBottom="#9C1818"
          label="Sanidade"
          accentColor="#D04040"
          onCellClick={owned ? onSanidadeClick : undefined}
        />
        <DefenseStats
          daBase={daBase}
          daBonus={daBonus}
          dpBonus={dpBonus}
          conditionEffectMap={conditionEffectMap}
          onDaBaseChange={owned ? onDaBaseChange : undefined}
          onDaChange={owned ? onDaChange : undefined}
          onDaReset={owned ? onDaReset : undefined}
          onDpChange={owned ? onDpChange : undefined}
          onDpReset={owned ? onDpReset : undefined}
        />
        <ConditionsSection
          conditions={conditions}
          isGm={isGm}
          onAddCondition={isGm ? onAddCondition : undefined}
          onRemoveCondition={isGm ? onRemoveCondition : undefined}
        />
      </div>
    </section>
  );
}
