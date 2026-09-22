import { useState } from "react";
import type { Character } from "@/data/characterTypes";
import { ELEMENT_DATA } from "./types";
import type { Accent } from "./types";
import { SectionLabel } from "./CharacterUI";
import { EntropiaDiceRow } from "./EntropiaDisplay";
import { ArcaneTestOverlay } from "./ArcaneTestOverlay";
import type { ModKey } from "./ArcaneConfigPanel";

const MODIFICADORES: { key: ModKey; label: string; desc: string }[] = [
  { key: "potencia", label: "Potência", desc: "Dano físico/material" },
  { key: "complexidade", label: "Complexidade", desc: "Cura · Condições" },
  { key: "controle", label: "Controle", desc: "Criar · Moldar · Proteger" },
];

export function ArcanoSection({
  character,
  accent,
  antAccent,
  onEdit,
  onEntropiaChange,
  skillModifiers,
  onModifierChange,
  onModifierReset,
  arcanoPeChecks,
  onArcanoPeToggle,
  exaustao,
}: {
  character: Character;
  accent: Accent;
  antAccent: Accent;
  onEdit?: () => void;
  onEntropiaChange?: (newValue: number) => void;
  skillModifiers?: Record<string, number>;
  onModifierChange?: (key: string, delta: number) => void;
  onModifierReset?: (key: string) => void;
  arcanoPeChecks?: boolean[];
  onArcanoPeToggle?: (idx: number) => void;
  exaustao: number;
}) {
  const [arcaneTest, setArcaneTest] = useState<ModKey | null>(null);
  const [editingSkill, setEditingSkill] = useState<ModKey | null>(null);

  const arcano = character.attributes.arcano;
  const arcanoColor = "#70d9ff";
  const dupla = character.afinidade === character.antitese;

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
    <section>
      <SectionLabel accent={accent.text} onEdit={onEdit}>
        Arcano
      </SectionLabel>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Arcano attribute + Perícias */}
          <div className="flex flex-col">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: arcanoColor,
                marginBottom: "8px",
              }}
            >
              Perícias Arcanas
            </p>
            {/* PE row — Arcano attribute's own PE pool — + Entropia on the right */}
            <div
              className="flex items-center justify-between gap-2 px-1"
              style={{
                borderTop: "1px solid rgba(60,220,217,0.12)",
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(200,210,230,0.55)",
                  }}
                >
                  PE
                </span>
                {(arcanoPeChecks ?? Array(5).fill(false)).map(
                  (checked: boolean, i: number) => (
                    <button
                      key={i}
                      onClick={
                        onArcanoPeToggle ? () => onArcanoPeToggle(i) : undefined
                      }
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        background: checked
                          ? `${arcanoColor}33`
                          : "rgba(255,255,255,0.06)",
                        border: `1px solid ${checked ? arcanoColor + "CC" : "rgba(200,210,230,0.35)"}`,
                        color: checked ? arcanoColor : "rgba(200,210,230,0.35)",
                        fontSize: "0.55rem",
                        lineHeight: 1,
                        cursor: onArcanoPeToggle ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {checked ? "✦" : "✧"}
                    </button>
                  ),
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(200,210,230,0.55)",
                  }}
                >
                  Entropia
                </span>
                <EntropiaDiceRow
                  value={character.entropia}
                  onEntropiaChange={onEntropiaChange}
                />
              </div>
            </div>
            {/* Perícias */}
            <div className="flex flex-col gap-2.5">
              {MODIFICADORES.map(({ key, label, desc }) => {
                const score = character.modificadores?.[key] ?? 0;
                const mod = skillModifiers?.[key] ?? 0;
                const total = score + mod;
                const isEditing = editingSkill === key;
                const modColor = mod > 0 ? "#6EC840" : "#D04040";

                return (
                  <div
                    key={key}
                    className="px-3 py-2 rounded-sm"
                    style={{
                      background: "rgba(60, 199, 220, 0.08)",
                      border: "1px solid rgba(60, 220, 217, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div
                        onClick={() => setArcaneTest(key)}
                        title="Rolar teste arcano"
                        style={{ cursor: "pointer", minWidth: 0 }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            color: arcanoColor,
                            lineHeight: 1.2,
                            borderBottom: "1px dotted rgba(112,217,255,0.4)",
                            display: "inline-block",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.6rem",
                            color: "rgba(200,210,230,0.5)",
                          }}
                        >
                          {desc}
                        </p>
                      </div>
                      {/* Clickable value — toggles bonus edit */}
                      <div
                        className="flex items-center gap-1.5"
                        style={{
                          cursor: onModifierChange ? "pointer" : "default",
                          flexShrink: 0,
                        }}
                        onClick={
                          onModifierChange
                            ? () => setEditingSkill(isEditing ? null : key)
                            : undefined
                        }
                        title={
                          onModifierChange
                            ? isEditing
                              ? "Fechar"
                              : "Clique para modificar"
                            : undefined
                        }
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
                            fontSize: "1.4rem",
                            color:
                              mod !== 0
                                ? modColor
                                : total > 0
                                  ? arcanoColor
                                  : "rgba(255,255,255,0.2)",
                            opacity: isEditing ? 0.6 : 1,
                          }}
                        >
                          {total}
                        </span>
                      </div>
                    </div>

                    {/* Expanded bonus controls */}
                    {isEditing && onModifierChange && (
                      <div
                        className="flex items-center gap-1.5 mt-1.5"
                        style={{ paddingLeft: 4 }}
                      >
                        <button
                          style={smallBtn}
                          onClick={() => onModifierChange(key, -1)}
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
                          onClick={() => onModifierChange(key, +1)}
                        >
                          +
                        </button>
                        <div style={{ flex: 1 }} />
                        <button
                          style={{ ...smallBtn, color: "rgba(255,100,100,0.8)" }}
                          onClick={() => {
                            onModifierReset?.(key);
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
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "#C8922A",
                background: "rgba(200,146,42,0.1)",
                border: "1px solid rgba(200,146,42,0.25)",
                borderRadius: 4,
                marginTop: 10,
                padding: "5px 8px",
              }}
            >
              Cada conjuração custa {character.entropia + 1} de Sanidade.
            </p>
          </div>
          <div>
            {/* Arcano attribute value */}
            <div className="flex flex-col items-center justify-between w-full">
              <div
                className="px-4 py-3 flex items-center justify-between w-full"
                style={{
                  background: `linear-gradient(90deg, ${arcanoColor}AF 0%, transparent 90%)`,
                  borderBottom: `2px solid ${arcanoColor}33`,
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-[0.18em] sm:text-3xl"
                  style={{ color: arcanoColor, fontFamily: "var(--font-ui)" }}
                >
                  Arcano
                </span>
                <span
                  className="font-display font-bold text-3xl"
                  style={{ color: arcanoColor }}
                >
                  {arcano}
                </span>
              </div>
            </div>
            {/* Afinidade + Antítese */}
            {dupla ? (
              <div
                style={{
                  padding: "1.2rem",
                  background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.glow} 100%)`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.2em",
                      color: "rgba(255,255,255,0.65)",
                      textTransform: "uppercase",
                    }}
                  >
                    Afinidade · Antítese
                  </p>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: accent.text,
                      lineHeight: 1,
                    }}
                  >
                    Vantagem · 3D12
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: accent.text,
                    marginBottom: "0.3rem",
                  }}
                >
                  {character.afinidade}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    fontStyle: "italic",
                  }}
                >
                  {ELEMENT_DATA[character.afinidade]?.essence ?? ""}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2">
                <div
                  style={{
                    padding: "1.2rem",
                    background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.glow} 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.65)",
                        textTransform: "uppercase",
                      }}
                    >
                      Afinidade
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: accent.text,
                      marginBottom: "0.3rem",
                    }}
                  >
                    {character.afinidade}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      fontStyle: "italic",
                    }}
                  >
                    {ELEMENT_DATA[character.afinidade]?.essence ?? ""}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: accent.text,
                      opacity: 0.75,
                      marginTop: "0.4rem",
                    }}
                  >
                    Normal · 2D12
                  </p>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    background: `linear-gradient(135deg, ${antAccent.bg} 0%, ${antAccent.glow} 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.65)",
                        textTransform: "uppercase",
                      }}
                    >
                      Antítese
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: antAccent.text,
                      marginBottom: "0.3rem",
                    }}
                  >
                    {character.antitese}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      fontStyle: "italic",
                    }}
                  >
                    {ELEMENT_DATA[character.antitese]?.essence ?? ""}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: antAccent.text,
                      opacity: 0.75,
                      marginTop: "0.4rem",
                    }}
                  >
                    Desvantagem · 1D12
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {arcaneTest && (
        <ArcaneTestOverlay
          initialPericia={arcaneTest}
          periciaModifier={skillModifiers?.[arcaneTest] ?? 0}
          afinidade={character.afinidade}
          antitese={character.antitese}
          entropia={character.entropia}
          arcano={arcano}
          modificadores={character.modificadores}
          exhaustionPenalty={exaustao > 0 ? -10 * exaustao : 0}
          onClose={() => setArcaneTest(null)}
        />
      )}
    </section>
  );
}
