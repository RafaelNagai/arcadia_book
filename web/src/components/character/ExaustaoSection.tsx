import { BatteryWarning } from "lucide-react"

const EXAUSTAO_COLOR = "#D04040"

const actionBtn = (disabled: boolean): React.CSSProperties => ({
  width: 28,
  height: 28,
  borderRadius: 4,
  background: disabled ? "rgba(255,255,255,0.03)" : `${EXAUSTAO_COLOR}18`,
  border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : EXAUSTAO_COLOR + "55"}`,
  color: disabled ? "rgba(255,255,255,0.18)" : EXAUSTAO_COLOR,
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
  color: "rgba(255,100,100,0.8)",
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

export function ExaustaoSection({
  exaustao,
  onExaustaoChange,
  onExaustaoReset,
}: {
  exaustao: number
  onExaustaoChange?: (delta: number) => void
  onExaustaoReset?: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        Exaustão
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <BatteryWarning
          size={18}
          strokeWidth={2}
          color={exaustao > 0 ? EXAUSTAO_COLOR : "rgba(255,255,255,0.28)"}
        />
        <span
          className="font-display font-bold text-2xl"
          style={{ color: exaustao > 0 ? EXAUSTAO_COLOR : "rgba(255,255,255,0.28)" }}
          title={exaustao > 0 ? `-${exaustao * 10} nos testes de Perícia e Arcano` : undefined}
        >
          {exaustao}
        </span>

        {onExaustaoChange && (
          <>
            <button
              disabled={exaustao === 0}
              onClick={() => exaustao > 0 && onExaustaoChange(-1)}
              style={actionBtn(exaustao === 0)}
              title="Remover 1 Exaustão"
            >
              −
            </button>
            <button
              onClick={() => onExaustaoChange(+1)}
              style={actionBtn(false)}
              title="Adicionar 1 Exaustão"
            >
              +
            </button>
          </>
        )}

        {onExaustaoReset && exaustao > 0 && (
          <button onClick={onExaustaoReset} style={smallBtn} title="Zerar Exaustão">
            ×
          </button>
        )}
      </div>
    </div>
  )
}
