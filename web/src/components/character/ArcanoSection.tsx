import { useState } from "react"
import type { Character } from "@/data/characterTypes"
import { ELEMENT_DATA } from "./types"
import type { Accent } from "./types"
import { SectionLabel } from "./CharacterUI"
import { EntropiaDisplay } from "./EntropiaDisplay"
import { ArcaneTestOverlay } from "./ArcaneTestOverlay"

const MODIFICADORES = [
  { key: "potencia",     label: "Potência",     desc: "Dano · Cura" },
  { key: "complexidade", label: "Complexidade",  desc: "Stacks · Condições" },
  { key: "forma",        label: "Forma",         desc: "Área · Direção" },
  { key: "controle",     label: "Controle",      desc: "Precisão · Duração" },
] as const

export function ArcanoSection({
  character,
  accent,
  antAccent,
  onEdit,
  onEntropiaChange,
  onModificadorChange,
}: {
  character: Character
  accent: Accent
  antAccent: Accent
  onEdit?: () => void
  onEntropiaChange?: (newValue: number) => void
  onModificadorChange?: (key: string, delta: number) => void
}) {
  const [arcaneTest, setArcaneTest] = useState(false)

  const arcano = character.attributes.arcano
  const entropiaBonus = arcano * character.entropia

  return (
    <section>
      <SectionLabel accent={accent.text} onEdit={onEdit}>
        Arcano
      </SectionLabel>
      <div className="space-y-3">

        {/* Afinidade + Antítese */}
        <div className="grid grid-cols-2 gap-3">
          <div
            style={{
              padding: "1.25rem",
              borderRadius: 4,
              background: `linear-gradient(135deg, ${accent.bg} 0%, rgba(4,10,20,0.9) 100%)`,
              border: `1px solid ${accent.text}44`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                }}
              >
                Afinidade
              </p>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: `${accent.text}99`,
                  textTransform: "uppercase",
                }}
              >
                sem penalidade
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

          <div
            style={{
              padding: "1.25rem",
              borderRadius: 4,
              background: `linear-gradient(135deg, ${antAccent.bg} 0%, rgba(4,10,20,0.9) 100%)`,
              border: `1px solid ${antAccent.text}33`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                }}
              >
                Antítese
              </p>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: antAccent.text,
                  lineHeight: 1,
                }}
              >
                −10
              </span>
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
          </div>
        </div>

        {/* Arcano attribute + Modificadores */}
        <div
          style={{
            padding: "1.25rem",
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(80,20,140,0.18) 0%, rgba(4,10,20,0.9) 100%)",
            border: "1px solid rgba(140,60,200,0.28)",
          }}
        >
          {/* Arcano attribute value */}
          <div className="flex items-center justify-between mb-4">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(205,146,234,0.83)",
              }}
            >
              Atributo Arcano
            </p>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#EEF4FC",
                  lineHeight: 1,
                }}
              >
                {arcano}
              </span>
              {entropiaBonus > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.65rem",
                    color: "#D080F0",
                    letterSpacing: "0.05em",
                  }}
                >
                  ×{character.entropia} = +{entropiaBonus}
                </span>
              )}
            </div>
          </div>

          {/* Modificadores grid */}
          <div className="grid grid-cols-2 gap-2">
            {MODIFICADORES.map(({ key, label, desc }) => {
              const score = character.modificadores?.[key] ?? 0
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded-sm"
                  style={{
                    background: "rgba(160,60,220,0.08)",
                    border: "1px solid rgba(160,60,220,0.2)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontWeight: 600,
                        fontSize: "0.68rem",
                        color: "rgba(220,160,255,0.9)",
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.55rem",
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {onModificadorChange && (
                      <button
                        onClick={() => onModificadorChange(key, -1)}
                        disabled={score <= 0}
                        style={{
                          width: 18, height: 18, borderRadius: 3,
                          border: "1px solid rgba(160,60,220,0.3)",
                          background: "transparent",
                          color: score > 0 ? "rgba(180,90,240,0.7)" : "rgba(255,255,255,0.15)",
                          cursor: score > 0 ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, lineHeight: 1, padding: 0,
                          opacity: score > 0 ? 1 : 0.35,
                        }}
                      >
                        −
                      </button>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                        color: score > 0 ? "#D080F0" : "rgba(255,255,255,0.2)",
                        lineHeight: 1,
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {score}
                    </span>
                    {onModificadorChange && (
                      <button
                        onClick={() => onModificadorChange(key, +1)}
                        style={{
                          width: 18, height: 18, borderRadius: 3,
                          border: "1px solid rgba(160,60,220,0.3)",
                          background: "transparent",
                          color: "rgba(180,90,240,0.7)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, lineHeight: 1, padding: 0,
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Arcane roll button */}
        <button
          onClick={() => setArcaneTest(true)}
          style={{
            background: accent.bg,
            border: `1px solid ${accent.text}44`,
            borderRadius: 4,
            padding: "0.5rem 1rem",
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent.text,
            cursor: "pointer",
            width: "100%",
          }}
        >
          🎲 Rolar Arcano
        </button>

        {/* Entropia + Marcas */}
        <div
          style={{
            padding: "1.25rem",
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(80,20,140,0.18) 0%, rgba(4,10,20,0.9) 100%)",
            border: "1px solid rgba(140,60,200,0.28)",
          }}
        >
          <EntropiaDisplay
            value={character.entropia}
            arcano={arcano}
            marcas={character.marcas ?? []}
            onEntropiaChange={onEntropiaChange}
          />
        </div>
      </div>

      {arcaneTest && (
        <ArcaneTestOverlay
          afinidade={character.afinidade}
          antitese={character.antitese}
          entropia={character.entropia}
          arcano={arcano}
          modificadores={character.modificadores ?? { potencia: 0, complexidade: 0, forma: 0, controle: 0 }}
          onClose={() => setArcaneTest(false)}
        />
      )}
    </section>
  )
}
