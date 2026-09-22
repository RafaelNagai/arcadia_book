import { motion } from "framer-motion";
import { getAccent } from "./types";
import type { CharacterModificadores } from "@/data/characterTypes";
import type { ElementRelation } from "@/lib/diceLog";

const ALL_ELEMENTS = ["Energia", "Anomalia", "Paradoxo", "Astral", "Cognitivo"];

export type ModKey = keyof CharacterModificadores;
export const MOD_KEYS: ModKey[] = ["potencia", "complexidade", "controle"];
export const MOD_LABELS: Record<ModKey, string> = {
  potencia: "Potência",
  complexidade: "Complexidade",
  controle: "Controle",
};
export const MOD_HINTS: Record<ModKey, string> = {
  potencia: "Tira Vida — dano físico ou material",
  complexidade: "Cura ou condições numa criatura",
  controle: "Cria, molda ou move o mundo",
};

/** Entropia level (0–4) → die shown alongside the roll. */
export const ENTROPIA_DIE: Record<number, number | null> = {
  0: null,
  1: 4,
  2: 8,
  3: 12,
  4: 20,
};

export function elementRelation(
  afinidade: string,
  antitese: string,
  selectedElement: string,
): ElementRelation {
  if (afinidade === antitese && selectedElement === afinidade) return "dupla";
  if (selectedElement === antitese) return "antitese";
  return "afinidade";
}

export function diceCountFor(relation: ElementRelation): number {
  return relation === "dupla" ? 3 : relation === "antitese" ? 1 : 2;
}

const DICE_HINT: Record<number, string> = {
  0: "sem dados",
  1: "Desvantagem",
  2: "padrão",
  3: "Vantagem",
};

interface ArcaneConfigPanelProps {
  afinidade: string;
  antitese: string;
  arcano: number;
  entropia: number;
  selectedElement: string;
  onSelectElement: (el: string) => void;
  pericia: ModKey;
  periciaScore: number;
  periciaModifier: number;
  diceCount: number;
  onDiceCountChange: (n: number) => void;
  exhaustionPenalty: number;
  onRoll: () => void;
  onClose: () => void;
}

export function ArcaneConfigPanel({
  afinidade,
  antitese,
  arcano,
  entropia,
  selectedElement,
  onSelectElement,
  pericia,
  periciaScore,
  periciaModifier,
  diceCount,
  onDiceCountChange,
  exhaustionPenalty,
  onRoll,
  onClose,
}: ArcaneConfigPanelProps) {
  const entropiaDie = ENTROPIA_DIE[entropia];
  const typeColor = getAccent(selectedElement).text;
  const total = arcano + periciaScore;

  return (
    <motion.div
      key="config"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(2,4,12,0.88)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        overflowY: "auto",
        padding: "24px 0",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-deep)",
          border: `1px solid ${typeColor}55`,
          borderRadius: 16,
          padding: "28px 32px",
          minWidth: 320,
          maxWidth: 380,
          width: "90vw",
          boxShadow: `0 16px 60px rgba(0,0,0,0.7), 0 0 40px ${typeColor}22`,
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 22,
            borderBottom: `1px solid ${typeColor}33`,
            paddingBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: typeColor,
              fontFamily: "var(--font-ui)",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Teste Arcano
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {MOD_LABELS[pericia]}
            </span>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 28,
                  color: typeColor,
                }}
              >
                {total}
              </span>
              {periciaModifier !== 0 && (
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    color: periciaModifier > 0 ? "#6EC840" : "#D04040",
                    letterSpacing: "0.08em",
                  }}
                >
                  perícia {periciaScore - periciaModifier}{" "}
                  {periciaModifier > 0 ? `+${periciaModifier}` : periciaModifier}
                </div>
              )}
              {exhaustionPenalty !== 0 && (
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#D04040",
                    letterSpacing: "0.08em",
                  }}
                >
                  Exaustão {exhaustionPenalty}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Element picker */}
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: 10,
            }}
          >
            Elemento
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 5,
            }}
          >
            {ALL_ELEMENTS.map((el) => {
              const acc = getAccent(el);
              const isElemAfin = el === afinidade;
              const isElemAnti = el === antitese;
              const canUse = isElemAfin || isElemAnti;
              const active = selectedElement === el;
              const rel = elementRelation(afinidade, antitese, el);
              return (
                <button
                  key={el}
                  onClick={() => {
                    if (!canUse) return;
                    onSelectElement(el);
                    onDiceCountChange(diceCountFor(rel));
                  }}
                  disabled={!canUse}
                  style={{
                    padding: "7px 3px",
                    borderRadius: 7,
                    border: `1px solid ${active ? acc.text : canUse ? "var(--color-border)" : "rgba(255,255,255,0.04)"}`,
                    background: active
                      ? acc.text + "22"
                      : canUse
                        ? "rgba(255,255,255,0.02)"
                        : "transparent",
                    cursor: canUse ? "pointer" : "not-allowed",
                    boxShadow: active ? `0 0 10px ${acc.text}33` : "none",
                    transition: "all 0.12s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    opacity: canUse ? 1 : 0.2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 9,
                      color: active
                        ? acc.text
                        : canUse
                          ? "var(--color-text-secondary)"
                          : "rgba(255,255,255,0.2)",
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    {el}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 10,
                      color: active
                        ? acc.text
                        : acc.text + (canUse ? "88" : "22"),
                      lineHeight: 1,
                    }}
                  >
                    {canUse ? diceCountFor(rel) + "D12" : "✕"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dice count */}
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: 10,
            }}
          >
            Dados D12
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => onDiceCountChange(Math.max(0, diceCount - 1))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--color-text-secondary)",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 26,
                color: "var(--color-text-primary)",
                minWidth: 24,
                textAlign: "center",
              }}
            >
              {diceCount}
            </span>
            <button
              onClick={() => onDiceCountChange(diceCount + 1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--color-text-secondary)",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
              }}
            >
              {DICE_HINT[diceCount] ??
                (diceCount > 2 ? `+${diceCount - 2} Vantagem` : `Desvantagem extra`)}
            </span>
          </div>
        </div>

        {/* Formula preview */}
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>2 maiores {diceCount}D12</span>
          <span>+</span>
          <span style={{ color: typeColor }}>
            {MOD_LABELS[pericia]} ({total})
          </span>
          {entropiaDie !== null && (
            <>
              <span>+</span>
              <span style={{ color: "#C8922A" }}>1D{entropiaDie} (Entropia {entropia})</span>
            </>
          )}
        </div>

        <p
          style={{
            marginBottom: 20,
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            color: "var(--color-text-muted)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Crítico/Milagre ignora penalidades · Falha Crítica/Desastre ignora
          bônus (mas não a Entropia)
        </p>

        {/* Roll button */}
        <button
          onClick={onRoll}
          disabled={diceCount === 0}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            border: `1px solid ${diceCount > 0 ? typeColor : "var(--color-border)"}`,
            background: diceCount > 0 ? typeColor + "28" : "transparent",
            color: diceCount > 0 ? typeColor : "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.22em",
            cursor: diceCount === 0 ? "not-allowed" : "pointer",
            opacity: diceCount === 0 ? 0.4 : 1,
            transition: "all 0.15s",
            boxShadow: diceCount > 0 ? `0 0 18px ${typeColor}44` : "none",
          }}
        >
          ROLAR {diceCount > 0 ? `${diceCount}D12${entropiaDie !== null ? ` + 1D${entropiaDie}` : ""}` : ""}
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "7px 0",
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: 11,
            fontFamily: "var(--font-ui)",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}
