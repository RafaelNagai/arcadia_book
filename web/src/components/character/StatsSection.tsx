import type { Character } from "@/data/characterTypes";
import { HoneycombGrid } from "./HoneycombGrid";
import { SectionLabel } from "./CharacterUI";
import { DefenseStats } from "./DefenseStats";

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
  onEdit,
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
}) {
  return (
    <section>
      <SectionLabel accent={accentText}>Vitalidade</SectionLabel>
      <div className="flex flex-wrap gap-12 items-start">
        <HoneycombGrid
          total={character.hp}
          current={currentHp}
          colorTop="#9EDA60"
          colorBottom="#1C5C10"
          label="Pontos de Vida"
          accentColor="#6EC840"
          onCellClick={owned ? onHpClick : undefined}
        />
        <HoneycombGrid
          total={character.sanidade}
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
          onDaBaseChange={owned ? onDaBaseChange : undefined}
          onDaChange={owned ? onDaChange : undefined}
          onDaReset={owned ? onDaReset : undefined}
          onDpChange={owned ? onDpChange : undefined}
          onDpReset={owned ? onDpReset : undefined}
        />
      </div>
    </section>
  );
}
