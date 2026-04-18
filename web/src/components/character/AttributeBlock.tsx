import { useState } from "react";
import type { Character } from "@/data/characterTypes";
import type { SkillTestData } from "./SkillTestOverlay";

export const ATTR_GROUPS = [
  {
    attr: "fisico" as const,
    label: "Físico",
    color: "#C04040",
    skills: [
      { key: "fortitude" as const, label: "Fortitude" },
      { key: "vontade" as const, label: "Vontade" },
      { key: "atletismo" as const, label: "Atletismo" },
      { key: "combate" as const, label: "Combate" },
    ],
  },
  {
    attr: "destreza" as const,
    label: "Destreza",
    color: "#20A080",
    skills: [
      { key: "furtividade" as const, label: "Furtividade" },
      { key: "precisao" as const, label: "Precisão" },
      { key: "acrobacia" as const, label: "Acrobacia" },
      { key: "reflexo" as const, label: "Reflexo" },
    ],
  },
  {
    attr: "intelecto" as const,
    label: "Intelecto",
    color: "#4080C0",
    skills: [
      { key: "percepcao" as const, label: "Percepção" },
      { key: "intuicao" as const, label: "Intuição" },
      { key: "investigacao" as const, label: "Investigação" },
      { key: "conhecimento" as const, label: "Conhecimento" },
    ],
  },
  {
    attr: "influencia" as const,
    label: "Influência",
    color: "#A060C0",
    skills: [
      { key: "empatia" as const, label: "Empatia" },
      { key: "dominacao" as const, label: "Dominação" },
      { key: "persuasao" as const, label: "Persuasão" },
      { key: "performance" as const, label: "Performance" },
    ],
  },
];

export function AttributeBlock({
  group,
  character,
  peChecks,
  onPeToggle,
  skillModifiers,
  onModifierChange,
  onModifierReset,
  onSkillTest,
}: {
  group: (typeof ATTR_GROUPS)[number];
  character: Character;
  peChecks: boolean[];
  onPeToggle?: (idx: number) => void;
  skillModifiers: Record<string, number>;
  onModifierChange?: (key: string, delta: number) => void;
  onModifierReset?: (key: string) => void;
  onSkillTest?: (data: SkillTestData) => void;
}) {
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        background: "rgba(4,10,20,0.7)",
        border: `1px solid ${group.color}33`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${group.color}AF 0%, transparent 90%)`,
          borderBottom: `1px solid ${group.color}33`,
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-base"
          style={{ color: group.color, fontFamily: "var(--font-ui)" }}
        >
          {group.label}
        </span>
        <span
          className="font-display font-bold text-2xl"
          style={{ color: group.color }}
        >
          {character.attributes[group.attr]}
        </span>
      </div>

      {/* PE checkboxes */}
      <div
        className="px-4 py-2 flex items-center gap-1.5 sm:gap-3"
        style={{ borderBottom: `1px solid ${group.color}22` }}
      >
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.55rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(200,210,230,0.7)",
          }}
        >
          PE
        </span>
        {peChecks.map((checked, i) => (
          <button
            key={i}
            onClick={onPeToggle ? () => onPeToggle(i) : undefined}
            title={onPeToggle ? (checked ? `Desmarcar PE ${i + 1}` : `Marcar PE ${i + 1}`) : undefined}
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              background: checked
                ? `${group.color}33`
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${checked ? group.color + "CC" : "rgba(200,210,230,0.35)"}`,
              color: checked ? group.color : "rgba(200,210,230,0.35)",
              fontSize: "0.55rem",
              lineHeight: 1,
              cursor: onPeToggle ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.12s",
              flexShrink: 0,
              padding: 0,
            }}
          >
            {checked ? "✦" : "✧"}
          </button>
        ))}
      </div>

      {/* Skills */}
      <div className="px-4 py-3 space-y-2.5">
        {group.skills.map((skill) => {
          const val = character.skills[skill.key];
          const hasTalent = character.talents.includes(skill.key);
          const mod = skillModifiers[skill.key] ?? 0;
          const total = val + mod;
          const isEditing = editingSkill === skill.key;
          const modColor = mod > 0 ? "#6EC840" : "#D04040";

          const smallBtn: React.CSSProperties = {
            width: 20,
            height: 20,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          };

          return (
            <div key={skill.key}>
              {/* Main row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    style={{
                      fontSize: "0.6rem",
                      lineHeight: 1,
                      flexShrink: 0,
                      color: hasTalent ? group.color : "rgba(255,255,255,0.38)",
                      fontWeight: hasTalent ? 700 : 400,
                    }}
                  >
                    {hasTalent ? "◆" : "◇"}
                  </span>
                  <span
                    className="text-[0.6rem] sm:text-xs"
                    onClick={
                      onSkillTest
                        ? () =>
                            onSkillTest({
                              skillLabel: skill.label,
                              skillValue: val,
                              modifier: mod,
                              hasTalent,
                              defaultAttr: group.attr,
                              attrColor: group.color,
                              attributes: character.attributes,
                            })
                        : undefined
                    }
                    title={
                      onSkillTest ? `Rolar teste de ${skill.label}` : undefined
                    }
                    style={{
                      color:
                        val > 0
                          ? "var(--color-text-secondary)"
                          : "var(--color-text-muted)",
                      fontFamily: "var(--font-ui)",
                      fontWeight: hasTalent ? 600 : 400,
                      cursor: onSkillTest ? "pointer" : "default",
                      borderBottom: onSkillTest
                        ? `1px dotted ${group.color}55`
                        : "none",
                      transition: "color 0.12s",
                    }}
                    onMouseEnter={
                      onSkillTest
                        ? (e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              group.color;
                          }
                        : undefined
                    }
                    onMouseLeave={
                      onSkillTest
                        ? (e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              val > 0
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-muted)";
                          }
                        : undefined
                    }
                  >
                    {skill.label}
                  </span>
                </div>

                {/* Clickable value — toggles edit */}
                <div
                  className="flex items-center gap-1.5"
                  style={{ cursor: onModifierChange ? "pointer" : "default", flexShrink: 0 }}
                  onClick={onModifierChange ? () => setEditingSkill(isEditing ? null : skill.key) : undefined}
                  title={onModifierChange ? (isEditing ? "Fechar" : "Clique para modificar") : undefined}
                >
                  {mod !== 0 && (
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: modColor,
                      }}
                    >
                      {mod > 0 ? `+${mod}` : mod}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color:
                        mod !== 0
                          ? modColor
                          : val > 0
                            ? "rgba(220,230,245,0.9)"
                            : "rgba(255,255,255,0.28)",
                      minWidth: 24,
                      textAlign: "right",
                      opacity: isEditing ? 0.6 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {total}
                  </span>
                </div>
              </div>

              {/* Expanded controls */}
              {isEditing && onModifierChange && (
                <div
                  className="flex items-center gap-1.5 mt-1.5"
                  style={{ paddingLeft: 12 }}
                >
                  <button
                    style={smallBtn}
                    onClick={() => onModifierChange(skill.key, -1)}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      minWidth: 26,
                      textAlign: "center",
                      color:
                        mod > 0
                          ? "#6EC840"
                          : mod < 0
                            ? "#D04040"
                            : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {mod > 0 ? `+${mod}` : mod === 0 ? "·" : String(mod)}
                  </span>
                  <button
                    style={smallBtn}
                    onClick={() => onModifierChange(skill.key, +1)}
                  >
                    +
                  </button>

                  <div style={{ flex: 1 }} />

                  <button
                    style={{ ...smallBtn, color: "rgba(255,100,100,0.8)" }}
                    onClick={() => {
                      onModifierReset(skill.key);
                      setEditingSkill(null);
                    }}
                    title="Remover modificador"
                  >
                    ×
                  </button>
                  <button
                    style={{ ...smallBtn, color: "#6EC840" }}
                    onClick={() => setEditingSkill(null)}
                    title="Confirmar"
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
