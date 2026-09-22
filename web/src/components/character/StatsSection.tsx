import { useMemo } from "react";
import type { Character, Condition, ConditionEffectField } from "@/data/characterTypes";
import { HoneycombGrid } from "./HoneycombGrid";
import { SectionLabel } from "./CharacterUI";
import { DefenseStats } from "./DefenseStats";
import { ConditionsSection } from "./ConditionsSection";
import { ExaustaoSection } from "./ExaustaoSection";

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
  onDaChange,
  onDaReset,
  onDpChange,
  onDpReset,
  exaustao,
  onExaustaoChange,
  onExaustaoReset,
  pendingSimple,
  onPendingSimpleChange,
  conditions,
  canEdit,
  onAddCondition,
  onRemoveCondition,
  onEditCondition,
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
  onDaChange?: (delta: number) => void;
  onDaReset?: () => void;
  onDpChange?: (delta: number) => void;
  onDpReset?: () => void;
  onEdit?: () => void;
  exaustao: number;
  onExaustaoChange?: (delta: number) => void;
  onExaustaoReset?: () => void;
  pendingSimple: boolean;
  onPendingSimpleChange?: (value: boolean) => void;
  conditions: Condition[];
  canEdit: boolean;
  onAddCondition?: (c: Condition) => void;
  onRemoveCondition?: (id: string) => void;
  onEditCondition?: (c: Condition) => void;
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
      <div className="flex flex-wrap gap-6 sm:gap-12 items-start">
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
          onDaChange={owned ? onDaChange : undefined}
          onDaReset={owned ? onDaReset : undefined}
          onDpChange={owned ? onDpChange : undefined}
          onDpReset={owned ? onDpReset : undefined}
        />
        <div className="flex flex-col gap-3">
          <ExaustaoSection
            exaustao={exaustao}
            onExaustaoChange={owned ? onExaustaoChange : undefined}
            onExaustaoReset={owned ? onExaustaoReset : undefined}
            pendingSimple={pendingSimple}
            onPendingSimpleChange={owned ? onPendingSimpleChange : undefined}
          />
          <ConditionsSection
            conditions={conditions}
            canEdit={canEdit}
            onAddCondition={canEdit ? onAddCondition : undefined}
            onRemoveCondition={canEdit ? onRemoveCondition : undefined}
            onEditCondition={canEdit ? onEditCondition : undefined}
          />
        </div>
      </div>
    </section>
  );
}
