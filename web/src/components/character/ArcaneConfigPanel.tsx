import { motion } from "framer-motion";
import { getAccent } from "./types";

const ALL_ELEMENTS = ["Energia", "Anomalia", "Paradoxo", "Astral", "Cognitivo"];

interface ArcaneConfigPanelProps {
  afinidade: string;
  antitese: string;
  selectedElement: string;
  onSelectElement: (el: string) => void;
  diceCount: number;
  onDiceCountChange: (fn: (c: number) => number) => void;
  runaCount: number;
  runaBonus: number;
  onRoll: () => void;
  onClose: () => void;
}

export function ArcaneConfigPanel({
  afinidade,
  antitese,
  selectedElement,
  onSelectElement,
  diceCount,
  onDiceCountChange,
  runaCount,
  runaBonus,
  onRoll,
  onClose,
}: ArcaneConfigPanelProps) {
  const afinidadeBonus = selectedElement === afinidade ? 4 : 0;
  const antiteseBonus = selectedElement === antitese ? 2 : 0;
  const elementBonus = afinidadeBonus + antiteseBonus;
  const totalBonus = elementBonus + runaBonus;
  const typeColor = getAccent(selectedElement).text;

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
          border: `1px solid ${typeColor}44`,
          borderRadius: 16,
          padding: "28px 32px",
          minWidth: 320,
          maxWidth: 400,
          width: "92vw",
          boxShadow: `0 16px 60px rgba(0,0,0,0.7), 0 0 40px ${typeColor}18`,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 20,
            borderBottom: "1px solid rgba(140,60,200,0.25)",
            paddingBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Teste Arcano
          </span>
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "rgba(205,146,234,0.7)",
              textTransform: "uppercase",
            }}
          >
            2D12
          </span>
        </div>

        {/* Element picker */}
        <div style={{ marginBottom: 18 }}>
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
              gap: 6,
            }}
          >
            {ALL_ELEMENTS.map((el) => {
              const acc = getAccent(el);
              const isAfin = el === afinidade;
              const isAnti = el === antitese;
              const bonus = (isAfin ? 4 : 0) + (isAnti ? 2 : 0);
              const active = selectedElement === el;
              return (
                <button
                  key={el}
                  onClick={() => onSelectElement(el)}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: `1px solid ${active ? acc.text : "var(--color-border)"}`,
                    background: active
                      ? acc.text + "22"
                      : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    boxShadow: active ? `0 0 12px ${acc.text}33` : "none",
                    transition: "all 0.12s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 11,
                      color: active
                        ? acc.text
                        : "var(--color-text-secondary)",
                      lineHeight: 1.1,
                      textAlign: "center",
                    }}
                  >
                    {el}
                  </span>
                  {bonus > 0 ? (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 13,
                        color: active ? acc.text : acc.text + "88",
                        lineHeight: 1,
                      }}
                    >
                      +{bonus}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.15)",
                        lineHeight: 1,
                      }}
                    >
                      —
                    </span>
                  )}
                  {(isAfin || isAnti) && (
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 8,
                        letterSpacing: "0.1em",
                        color: acc.text + (active ? "cc" : "66"),
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      {isAfin && isAnti
                        ? "Afin+Anti"
                        : isAfin
                          ? "Afinidade"
                          : "Antítese"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bonus breakdown */}
        <div
          style={{
            marginBottom: 18,
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {elementBonus > 0 ? (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: typeColor,
                }}
              >
                +{elementBonus} {selectedElement}
                {afinidadeBonus > 0 && antiteseBonus > 0 && (
                  <span style={{ fontSize: 9, opacity: 0.7 }}>
                    {" "}
                    (Afin+Anti)
                  </span>
                )}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                sem bônus de elemento
              </span>
            )}
            {runaCount > 0 ? (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "#d0a8f8",
                }}
              >
                +{runaBonus} ({runaCount} runa{runaCount > 1 ? "s" : ""})
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                sem runas encaixadas
              </span>
            )}
            {totalBonus > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 16,
                  color: typeColor,
                }}
              >
                = +{totalBonus}
              </span>
            )}
          </div>
        </div>

        {/* Dice count */}
        <div style={{ marginBottom: 18 }}>
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
              onClick={() => onDiceCountChange((c) => Math.max(0, c - 1))}
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
              onClick={() => onDiceCountChange((c) => c + 1)}
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
              {diceCount === 0
                ? "sem dados"
                : diceCount === 1
                  ? "desvantagem"
                  : diceCount === 2
                    ? "padrão"
                    : `+${diceCount - 2} vantagem`}
            </span>
          </div>
        </div>

        {/* Formula preview */}
        <div
          style={{
            marginBottom: 20,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span>2 maiores D12</span>
          {totalBonus > 0 && (
            <>
              <span>+</span>
              <span style={{ color: typeColor, fontWeight: 700 }}>
                {totalBonus} bônus
              </span>
            </>
          )}
        </div>

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
          ROLAR {diceCount > 0 ? `${diceCount}D12` : ""}
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
