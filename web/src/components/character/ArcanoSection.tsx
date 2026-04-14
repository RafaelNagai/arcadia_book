import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import type { Character } from "@/data/characterTypes"
import { ELEMENT_DATA } from "./types"
import type { Accent } from "./types"
import { SectionLabel } from "./CharacterUI"
import { DraggableRuna, EntropiaDisplay } from "./EntropiaDisplay"
import { ArcaneTestOverlay } from "./ArcaneTestOverlay"

export function ArcanoSection({
  character,
  accent,
  antAccent,
  slottedRunas,
  draggingRuna,
  onDragStart,
  onDragEnd,
  onRemoveRuna,
  onEdit,
}: {
  character: Character
  accent: Accent
  antAccent: Accent
  slottedRunas: (string | null)[]
  draggingRuna: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onRemoveRuna: (slotIdx: number) => void
  onEdit?: () => void
}) {
  const [arcaneTest, setArcaneTest] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

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
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: accent.text,
                  lineHeight: 1,
                }}
              >
                +4
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
                  fontSize: "1.5rem",
                  color: antAccent.text,
                  lineHeight: 1,
                }}
              >
                +2
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

        {/* Entropia + Runas */}
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
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
              slottedRunas={slottedRunas}
              draggingRuna={draggingRuna}
              onRemoveRuna={onRemoveRuna}
            />
          </div>

          {character.runas.length > 0 && (
            <div
              style={{
                padding: "1.25rem",
                borderRadius: 4,
                background: "rgba(4,10,20,0.7)",
                border: "1px solid rgba(160,60,210,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "rgba(205,146,234,0.83)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Runas Conhecidas
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    marginLeft: "0.5rem",
                    textTransform: "none",
                    letterSpacing: 0,
                    fontSize: "0.55rem",
                  }}
                >
                  — arraste para os slots
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {character.runas.map((runa) => (
                  <DraggableRuna
                    key={runa}
                    runa={runa}
                    isSlotted={slottedRunas.includes(runa)}
                    isDraggingThis={draggingRuna === runa}
                  />
                ))}
              </div>
            </div>
          )}

          <DragOverlay>
            {draggingRuna ? (
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "#E0A8FF",
                  background: "rgba(140,40,220,0.95)",
                  border: "1px solid rgba(200,120,255,0.8)",
                  fontFamily: "var(--font-ui)",
                  boxShadow: "0 4px 24px rgba(160,60,240,0.6)",
                  cursor: "grabbing",
                  userSelect: "none",
                }}
              >
                {draggingRuna}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {arcaneTest && (
        <ArcaneTestOverlay
          afinidade={character.afinidade}
          antitese={character.antitese}
          entropia={character.entropia}
          slottedRunas={slottedRunas}
          onClose={() => setArcaneTest(false)}
        />
      )}
    </section>
  )
}
