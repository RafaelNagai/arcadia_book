import { useState } from "react"
import { motion } from "framer-motion"
import { BatteryWarning } from "lucide-react"

const EXAUSTAO_COLOR = "#D04040"
const ACAO_SIMPLES_COLOR = "#4CAF6D"

const actionBtn = (disabled: boolean, color: string = EXAUSTAO_COLOR): React.CSSProperties => ({
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

const coin = (color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: color,
  flexShrink: 0,
})

const smallBtn = (disabled: boolean): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: 3,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: disabled ? "rgba(255,100,100,0.35)" : "rgba(255,100,100,0.8)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.8rem",
  lineHeight: 1,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  flexShrink: 0,
})

const coinRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.2rem",
  maxWidth: 176,
}

const flipCoinWrapper: React.CSSProperties = {
  width: 10,
  height: 10,
  flexShrink: 0,
  perspective: "200px",
}

const flipCoinInner: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  transformStyle: "preserve-3d",
}

const flipFace = (color: string, rotated: boolean): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: color,
  backfaceVisibility: "hidden",
  transform: rotated ? "rotateY(180deg)" : undefined,
})

export function ExaustaoSection({
  exaustao,
  onExaustaoChange,
  onExaustaoReset,
}: {
  exaustao: number
  onExaustaoChange?: (delta: number) => void
  onExaustaoReset?: () => void
}) {
  const [pendingSimple, setPendingSimple] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [complexPopIndex, setComplexPopIndex] = useState<number | null>(null)

  const handleAdd = () => {
    if (pendingSimple) {
      if (isFlipping) return
      setIsFlipping(true)
    } else {
      setPendingSimple(true)
    }
  }

  const handleFlipComplete = () => {
    setIsFlipping(false)
    setPendingSimple(false)
    onExaustaoChange?.(+1)
  }

  const handleComplex = () => {
    if (isFlipping) return
    setComplexPopIndex(exaustao)
    onExaustaoChange?.(+1)
  }

  const handleReset = () => {
    if (isFlipping) return
    setPendingSimple(false)
    onExaustaoReset?.()
  }

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
              disabled={exaustao === 0 || isFlipping}
              onClick={() => exaustao > 0 && !isFlipping && onExaustaoChange(-1)}
              style={actionBtn(exaustao === 0 || isFlipping)}
              title="Remover 1 Exaustão"
            >
              −
            </button>
            <button
              onClick={handleAdd}
              style={actionBtn(false, ACAO_SIMPLES_COLOR)}
              title="Registrar 1 Ação Simples (2 = 1 Exaustão)"
            >
              S
            </button>
            <button
              disabled={isFlipping}
              onClick={handleComplex}
              style={actionBtn(isFlipping, EXAUSTAO_COLOR)}
              title="Registrar 1 Ação Complexa (+1 Exaustão)"
            >
              C
            </button>
          </>
        )}

        {onExaustaoReset && (exaustao > 0 || pendingSimple) && (
          <button
            disabled={isFlipping}
            onClick={handleReset}
            style={smallBtn(isFlipping)}
            title="Zerar Exaustão"
          >
            ×
          </button>
        )}
      </div>

      {(exaustao > 0 || pendingSimple) && (
        <div style={coinRowStyle}>
          {Array.from({ length: exaustao }).map((_, i) =>
            i === complexPopIndex ? (
              <motion.span
                key={`exaustao-${i}`}
                style={coin(EXAUSTAO_COLOR)}
                title="1 ponto de Exaustão"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                onAnimationComplete={() => setComplexPopIndex(null)}
              />
            ) : (
              <span
                key={`exaustao-${i}`}
                style={coin(EXAUSTAO_COLOR)}
                title="1 ponto de Exaustão"
              />
            )
          )}
          {pendingSimple && (
            isFlipping ? (
              <span style={flipCoinWrapper}>
                <motion.div
                  style={flipCoinInner}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 180 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  onAnimationComplete={handleFlipComplete}
                >
                  <span style={flipFace(ACAO_SIMPLES_COLOR, false)} />
                  <span style={flipFace(EXAUSTAO_COLOR, true)} />
                </motion.div>
              </span>
            ) : (
              <span style={coin(ACAO_SIMPLES_COLOR)} title="Ação Simples pendente" />
            )
          )}
        </div>
      )}
    </div>
  )
}
