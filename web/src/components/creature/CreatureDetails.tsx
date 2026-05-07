import { useState, useCallback } from "react";
import type { Creature } from "@/data/creatureTypes";
import type { DieType } from "@/components/widgets/DiceRollerWidget";
import { CreatureRollOverlay } from "./CreatureRollOverlay";

interface Props {
  creature: Creature;
}

interface RollTarget {
  attrLabel: string;
  attrValue: number;
  diceCount: number;
  dieType: DieType;
}

const ATTR_LABELS: Record<string, string> = {
  fisico: "Físico",
  destreza: "Destreza",
  intelecto: "Intelecto",
  influencia: "Influência",
};

/* Cores semânticas por seção */
const C = {
  /* Stats / neutro */
  surface:   "var(--color-surface)",
  border:    "var(--color-border)",

  /* Atributos */
  attrPos:   "#C8922A",   // dourado — valor positivo
  attrNeg:   "var(--color-text-muted)",
  attrZero:  "var(--color-text-secondary)",
  attrHover: "rgba(200,146,42,0.10)",

  /* Imune / Vulnerável */
  imune:     "#6FC892",   // verde
  imunesBg:  "rgba(111,200,146,0.12)",
  imunesBorder: "rgba(111,200,146,0.25)",
  vuln:      "#E8803A",   // laranja-aviso
  vulnBg:    "rgba(232,128,58,0.12)",
  vulnBorder:"rgba(232,128,58,0.28)",

  /* Interações — ouro/lore */
  inter:        "#C8922A",
  interBg:      "rgba(200,146,42,0.06)",
  interBorder:  "rgba(200,146,42,0.22)",

  /* Ações — laranja energia */
  action:       "#E8803A",
  actionBg:     "rgba(232,128,58,0.07)",
  actionBorder: "rgba(232,128,58,0.25)",
  actionOnce:   "#E8803A",

  /* Reações — azul paradoxo */
  react:        "#50C8E8",
  reactBg:      "rgba(80,200,232,0.06)",
  reactBorder:  "rgba(80,200,232,0.20)",
  reactOnce:    "#50C8E8",

  /* Variantes — roxo suave */
  variant:      "#A090C8",
  variantBg:    "rgba(160,144,200,0.06)",
  variantBorder:"rgba(160,144,200,0.22)",
} as const;

function parseDiceBase(diceBase: string): { count: number; dieType: DieType } {
  const [countStr, typeStr] = diceBase.toUpperCase().split("D");
  const count = parseInt(countStr) || 2;
  const rawType = parseInt(typeStr) || 12;
  const valid: DieType[] = [4, 6, 8, 10, 12, 20];
  const dieType = (valid.includes(rawType as DieType) ? rawType : 12) as DieType;
  return { count, dieType };
}

/* ── Sub-components ──────────────────────────────────────────── */

function SectionHeader({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.10em",
          color,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function StatCell({
  label,
  value,
  right = false,
}: {
  label: string;
  value: string | number;
  right?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 px-2"
      style={{
        borderRight: right ? `1px solid ${C.border}` : "none",
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-ui)",
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "Cinzel, serif",
          fontWeight: 700,
          fontSize: 17,
          color: "var(--color-text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionCard({
  name,
  description,
  once,
  bg,
  border,
  nameColor,
  onceColor,
}: {
  name: string;
  description: string;
  once?: string;
  bg: string;
  border: string;
  nameColor: string;
  onceColor: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 18,
            letterSpacing: "0.06em",
            color: nameColor,
          }}
        >
          {name}
        </span>
        {once && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: onceColor,
              background: `${onceColor}18`,
              border: `1px solid ${onceColor}44`,
              borderRadius: 4,
              padding: "2px 8px",
              flexShrink: 0,
            }}
          >
            {once}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export function CreatureDetails({ creature }: Props) {
  const [rollTarget, setRollTarget] = useState<RollTarget | null>(null);
  const { count: parsedCount, dieType: parsedDieType } = parseDiceBase(creature.diceBase);

  const handleAttrClick = useCallback(
    (key: string, value: number) => {
      setRollTarget({
        attrLabel: ATTR_LABELS[key] ?? key,
        attrValue: value,
        diceCount: parsedCount,
        dieType: parsedDieType,
      });
    },
    [parsedCount, parsedDieType],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {rollTarget && (
        <CreatureRollOverlay
          attrLabel={rollTarget.attrLabel}
          attrValue={rollTarget.attrValue}
          diceCount={rollTarget.diceCount}
          dieType={rollTarget.dieType}
          onClose={() => setRollTarget(null)}
        />
      )}

      {/* Lore */}
      <p
        style={{
          fontFamily: "EB Garamond, Garamond, Georgia, serif",
          fontSize: 15,
          lineHeight: 1.8,
          fontStyle: "italic",
          color: "var(--color-text-secondary)",
          borderLeft: "2px solid var(--color-border)",
          paddingLeft: "0.875rem",
          margin: 0,
        }}
      >
        {creature.lore}
      </p>

      {/* Stats strip — HP / DA / DP / Dados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <StatCell label="Dados Base" value={creature.diceBase} right />
        <StatCell label="HP" value={creature.hp} right />
        <StatCell label="DA" value={creature.da} right />
        <StatCell label="DP" value={creature.dp} />
      </div>

      {/* Attributes — clickable */}
      <div>
        <SectionHeader color={C.attrPos}>Atributos</SectionHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(["fisico", "destreza", "intelecto", "influencia"] as const).map(
            (key, i) => {
              const val = creature.attributes[key];
              const sign = val >= 0 ? `+${val}` : String(val);
              const valColor =
                val > 0 ? C.attrPos : val < 0 ? C.attrNeg : C.attrZero;
              return (
                <button
                  key={key}
                  onClick={() => handleAttrClick(key, val)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 8px",
                    borderRight:
                      i < 3 ? `1px solid ${C.border}` : "none",
                    background: "transparent",
                    border: "none",
                    borderRadius: 0,
                    cursor: "pointer",
                    transition: "background 0.13s",
                    gap: 3,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.attrHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    {ATTR_LABELS[key]}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 36,
                      color: valColor,
                      lineHeight: 1,
                    }}
                  >
                    {sign}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: `${C.attrPos}55`,
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    rolar
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Immune / Vulnerable */}
      {(creature.immune.length > 0 || creature.vulnerable.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {creature.immune.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: C.imune,
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Imune
              </span>
              {creature.immune.map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-ui)",
                    color: C.imune,
                    background: C.imunesBg,
                    border: `1px solid ${C.imunesBorder}`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
          {creature.vulnerable.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: C.vuln,
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Vulnerável
              </span>
              {creature.vulnerable.map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-ui)",
                    color: C.vuln,
                    background: C.vulnBg,
                    border: `1px solid ${C.vulnBorder}`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-border)" }} />

      {/* Interações */}
      {creature.interactions.length > 0 && (
        <div>
          <SectionHeader color={C.inter}>Interações</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {creature.interactions.map((item) => (
              <div
                key={item.name}
                style={{
                  background: C.interBg,
                  border: `1px solid ${C.interBorder}`,
                  borderRadius: 8,
                  padding: "9px 13px",
                  display: "flex",
                  gap: 8,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 16,
                    letterSpacing: "0.06em",
                    color: C.inter,
                    flexShrink: 0,
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações + Reações — 2 colunas no desktop, 1 no mobile */}
      {(creature.actions.length > 0 || creature.reactions.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, alignItems: "start" }}>
          {/* Coluna esquerda — Ações */}
          {creature.actions.length > 0 && (
            <div>
              <SectionHeader color={C.action}>Ações</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {creature.actions.map((a) => (
                  <ActionCard
                    key={a.name}
                    name={a.name}
                    description={a.description}
                    once={a.once}
                    bg={C.actionBg}
                    border={C.actionBorder}
                    nameColor={C.action}
                    onceColor={C.actionOnce}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Coluna direita — Reações */}
          {creature.reactions.length > 0 && (
            <div>
              <SectionHeader color={C.react}>Reações</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {creature.reactions.map((r) => (
                  <ActionCard
                    key={r.name}
                    name={r.name}
                    description={r.description}
                    once={r.once}
                    bg={C.reactBg}
                    border={C.reactBorder}
                    nameColor={C.react}
                    onceColor={C.reactOnce}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variantes */}
      {creature.variants && creature.variants.length > 0 && (
        <div>
          <div style={{ height: 1, background: "var(--color-border)", marginBottom: 16 }} />
          <SectionHeader color={C.variant}>Variantes</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {creature.variants.map((v) => (
              <div
                key={v.name}
                style={{
                  background: C.variantBg,
                  border: `1px solid ${C.variantBorder}`,
                  borderRadius: 8,
                  padding: "9px 13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.variant,
                    flexShrink: 0,
                  }}
                >
                  {v.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-ui)",
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {v.diceBase} · HP {v.hp} · DA {v.da}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {v.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
