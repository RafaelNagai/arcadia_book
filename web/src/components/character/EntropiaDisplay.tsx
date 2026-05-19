import type { EntropiaMarca } from "@/data/characterTypes";

const D20_NAMES: Record<
  number,
  { name: string; type: "negative" | "narrative" | "mixed" | "positive" }
> = {
  1: { name: "Eco Arcano", type: "negative" },
  2: { name: "Drenagem Ampliada", type: "negative" },
  3: { name: "Fragilidade Mental", type: "negative" },
  4: { name: "Desgaste Físico", type: "negative" },
  5: { name: "Vulnerabilidade Elemental", type: "negative" },
  6: { name: "Fome Arcana", type: "negative" },
  7: { name: "Atração Indesejada", type: "negative" },
  8: { name: "Memória Fragmentada", type: "negative" },
  9: { name: "Instabilidade Passiva", type: "narrative" },
  10: { name: "Marca Visível", type: "narrative" },
  11: { name: "Sonhos do Arcano", type: "narrative" },
  12: { name: "Voz do Elemento", type: "narrative" },
  13: { name: "Presença Arcana", type: "mixed" },
  14: { name: "Consumo Acelerado", type: "mixed" },
  15: { name: "Toque Arcano", type: "mixed" },
  16: { name: "Visão Dupla", type: "mixed" },
  17: { name: "Afinidade Aguçada", type: "positive" },
  18: { name: "Resistência Elemental", type: "positive" },
  19: { name: "Clareza Arcana", type: "positive" },
  20: { name: "Dom do Abismo", type: "positive" },
};

const TYPE_COLOR: Record<string, string> = {
  negative: "#F07070",
  narrative: "#90B8E0",
  mixed: "#D0A830",
  positive: "#70C890",
};

const arcanoColor = "#70d9ff";

export function EntropiaDisplay({
  value,
  marcas,
  onEntropiaChange,
}: {
  value: number;
  marcas: EntropiaMarca[];
  onEntropiaChange?: (newValue: number) => void;
}) {
  function handleDotClick(dotIndex: number) {
    if (!onEntropiaChange) return;
    const next = dotIndex < value ? dotIndex : dotIndex + 1;
    onEntropiaChange(Math.min(5, Math.max(0, next)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              color: arcanoColor,
              fontFamily: "var(--font-ui)",
            }}
          >
            Entropia
          </p>
          <span
            className="font-display font-bold text-3xl"
            style={{ color: "#EEF4FC" }}
          >
            {value}
          </span>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
            }}
          >
            / 5
          </span>
        </div>
      </div>

      {/* Entropia dots */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            onClick={() => handleDotClick(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                i < value
                  ? `linear-gradient(135deg, ${arcanoColor} 0%, ${arcanoColor} 100%)`
                  : "rgba(255,255,255,0.05)",
              border: `1px solid ${i < value ? arcanoColor : "rgba(255,255,255,0.2)"}`,
              boxShadow: i < value ? `0 0 10px ${arcanoColor}CC` : "none",
              transition: "all 0.2s",
              cursor: onEntropiaChange ? "pointer" : "default",
            }}
          />
        ))}
      </div>

      {value === 0 && (
        <p
          className="text-xs"
          style={{
            color: "rgba(255,255,255,0.40)",
            fontFamily: "var(--font-ui)",
          }}
        >
          Não esta exposto ao Arcano
        </p>
      )}

      {/* Marcas */}
      {marcas.length > 0 && (
        <div className="mt-3">
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(180,100,220,0.6)",
              marginBottom: "0.5rem",
            }}
          >
            Marcas
          </p>
          <div className="flex flex-col gap-1.5">
            {marcas.map((marca, i) => {
              const info = D20_NAMES[marca.d20Result];
              const col = info ? TYPE_COLOR[info.type] : "#aaa";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-sm"
                  style={{
                    background: `${col}12`,
                    border: `1px solid ${col}33`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.6rem",
                        color: `${col}99`,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {marca.d20Result}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.7rem",
                        color: col,
                        fontWeight: 600,
                      }}
                    >
                      {info?.name ?? `Marca ${marca.d20Result}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.55rem",
                        color: "rgba(255,255,255,0.4)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      X={marca.entropiaLevel}
                    </span>
                    {marca.permanent && (
                      <span
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.5rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#F07070",
                          background: "rgba(240,112,112,0.12)",
                          border: "1px solid rgba(240,112,112,0.3)",
                          borderRadius: 3,
                          padding: "1px 5px",
                        }}
                      >
                        Permanente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
