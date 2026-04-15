import { useState } from "react"

const DA_COLOR = "#6080C0"
const DP_COLOR = "#90B0D8"

export function calcDaTotal(daBase: number, daBonus: number): number {
  return Math.max(0, daBase + daBonus)
}

export function calcDpTotal(da: number, dpBonus: number): number {
  return Math.max(0, Math.floor(da / 2) + dpBonus)
}

const actionBtn = (
  color: string,
  disabled: boolean,
): React.CSSProperties => ({
  width: 28,
  height: 28,
  borderRadius: 4,
  background: disabled ? "rgba(255,255,255,0.03)" : `${color}18`,
  border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : color + "55"}`,
  color: disabled ? "rgba(255,255,255,0.18)" : color,
  fontFamily: "var(--font-ui)",
  fontSize: "1rem",
  lineHeight: 1,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s",
  flexShrink: 0,
})

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
}

function modColor(mod: number) {
  return mod > 0 ? "#6EC840" : "#D04040"
}

function modLabel(mod: number) {
  if (mod > 0) return `+${mod}`
  if (mod < 0) return String(mod)
  return "·"
}

export function DefenseStats({
  daBase,
  daBonus,
  dpBonus,
  onDaBaseChange,
  onDaChange,
  onDaReset,
  onDpChange,
  onDpReset,
}: {
  daBase: number
  daBonus: number
  dpBonus: number
  onDaBaseChange: (delta: number) => void
  onDaChange: (delta: number) => void
  onDaReset: () => void
  onDpChange: (delta: number) => void
  onDpReset: () => void
}) {
  const [editing, setEditing] = useState<"da" | "dp" | null>(null)

  const da = calcDaTotal(daBase, daBonus)
  const dp = calcDpTotal(da, dpBonus)

  return (
    <div>
      {/* ── Label + stepper para DA base ── */}
      <div className="flex items-center gap-2 mb-2">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: DA_COLOR, fontFamily: "var(--font-ui)" }}
        >
          Defesa
        </p>
        <button
          disabled={daBase === 0}
          onClick={() => daBase > 0 && onDaBaseChange(-1)}
          style={actionBtn(DA_COLOR, daBase === 0)}
        >
          −
        </button>
        <button
          onClick={() => onDaBaseChange(+1)}
          style={actionBtn(DA_COLOR, false)}
        >
          +
        </button>
      </div>

      {/* ── DA + DP ── */}
      <div className="flex gap-8 items-start">
        {/* DA */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: DA_COLOR,
              marginBottom: 2,
            }}
          >
            DA
          </p>

          <div
            className="flex items-baseline gap-1.5"
            onClick={() => setEditing(editing === "da" ? null : "da")}
            title={editing === "da" ? "Fechar" : "Clique para adicionar bônus"}
            style={{ cursor: "pointer" }}
          >
            {daBonus !== 0 && (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: modColor(daBonus),
                }}
              >
                {daBonus > 0 ? `+${daBonus}` : daBonus}
              </span>
            )}
            <span
              className="font-display font-bold text-3xl"
              style={{
                color:
                  daBonus !== 0
                    ? modColor(daBonus)
                    : da > 0
                      ? "#EEF4FC"
                      : "rgba(255,255,255,0.28)",
                opacity: editing === "da" ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {da}
            </span>
          </div>

          {editing === "da" && (
            <div className="flex items-center gap-1.5 mt-2">
              <button
                style={{ ...smallBtn, opacity: da === 0 ? 0.3 : 1 }}
                onClick={() => da > 0 && onDaChange(-1)}
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
                    daBonus > 0
                      ? "#6EC840"
                      : daBonus < 0
                        ? "#D04040"
                        : "rgba(255,255,255,0.3)",
                }}
              >
                {modLabel(daBonus)}
              </span>
              <button style={smallBtn} onClick={() => onDaChange(+1)}>
                +
              </button>
              <div style={{ flex: 1 }} />
              <button
                style={{ ...smallBtn, color: "rgba(255,100,100,0.8)" }}
                onClick={() => {
                  onDaReset()
                  setEditing(null)
                }}
                title="Remover bônus"
              >
                ×
              </button>
              <button
                style={{ ...smallBtn, color: "#6EC840" }}
                onClick={() => setEditing(null)}
                title="Confirmar"
              >
                ✓
              </button>
            </div>
          )}
        </div>

        {/* DP */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: DP_COLOR,
              marginBottom: 2,
            }}
          >
            DP
          </p>

          <div
            className="flex items-baseline gap-1.5"
            onClick={() => setEditing(editing === "dp" ? null : "dp")}
            title={editing === "dp" ? "Fechar" : "Clique para adicionar bônus"}
            style={{ cursor: "pointer" }}
          >
            {dpBonus !== 0 && (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: modColor(dpBonus),
                }}
              >
                {dpBonus > 0 ? `+${dpBonus}` : dpBonus}
              </span>
            )}
            <span
              className="font-display font-bold text-3xl"
              style={{
                color:
                  dpBonus !== 0
                    ? modColor(dpBonus)
                    : dp > 0
                      ? "#EEF4FC"
                      : "rgba(255,255,255,0.28)",
                opacity: editing === "dp" ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {dp}
            </span>
          </div>

          {editing === "dp" && (
            <div className="flex items-center gap-1.5 mt-2">
              <button
                style={{ ...smallBtn, opacity: dp === 0 ? 0.3 : 1 }}
                onClick={() => dp > 0 && onDpChange(-1)}
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
                    dpBonus > 0
                      ? "#6EC840"
                      : dpBonus < 0
                        ? "#D04040"
                        : "rgba(255,255,255,0.3)",
                }}
              >
                {modLabel(dpBonus)}
              </span>
              <button style={smallBtn} onClick={() => onDpChange(+1)}>
                +
              </button>
              <div style={{ flex: 1 }} />
              <button
                style={{ ...smallBtn, color: "rgba(255,100,100,0.8)" }}
                onClick={() => {
                  onDpReset()
                  setEditing(null)
                }}
                title="Remover bônus"
              >
                ×
              </button>
              <button
                style={{ ...smallBtn, color: "#6EC840" }}
                onClick={() => setEditing(null)}
                title="Confirmar"
              >
                ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
