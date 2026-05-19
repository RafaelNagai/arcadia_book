import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getAccent } from "./types";
import type { CharacterModificadores } from "@/data/characterTypes";

const ALL_ELEMENTS = ["Energia", "Anomalia", "Paradoxo", "Astral", "Cognitivo"];

export type ModKey = keyof CharacterModificadores;
export const MOD_KEYS: ModKey[] = ["potencia", "complexidade", "forma", "controle"];
export const MOD_LABELS: Record<ModKey, string> = {
  potencia:     "Potência",
  complexidade: "Complexidade",
  forma:        "Forma",
  controle:     "Controle",
};

type TokenLoc = "pool" | ModKey;

interface ArcaneConfigPanelProps {
  afinidade: string;
  antitese: string;
  arcano: number;
  entropia: number;
  selectedElement: string;
  onSelectElement: (el: string) => void;
  modificadores: CharacterModificadores;
  onRoll: (allocation: Record<ModKey, number>, entropiaAllocation: Record<ModKey, number>) => void;
  onClose: () => void;
}

/* ── Draggable token ─────────────────────────────────────────────── */

function DragToken({
  id,
  color,
  label,
  size = 36,
}: {
  id: string;
  color: string;
  label: string;
  size?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${color}44 0%, ${color}22 100%)`,
        border: `1.5px solid ${color}99`,
        boxShadow: isDragging ? `0 0 20px ${color}66` : `0 0 8px ${color}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cinzel, serif",
        fontWeight: 800,
        fontSize: Math.floor(size * 0.3),
        color,
        cursor: "grab",
        touchAction: "none",
        opacity: isDragging ? 0.35 : 1,
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? undefined : "box-shadow 0.12s, opacity 0.12s",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

function TokenVisual({ color, label, size = 36 }: { color: string; label: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${color}66 0%, ${color}44 100%)`,
        border: `1.5px solid ${color}bb`,
        boxShadow: `0 0 24px ${color}66, 0 4px 16px rgba(0,0,0,0.4)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cinzel, serif",
        fontWeight: 800,
        fontSize: Math.floor(size * 0.3),
        color,
        cursor: "grabbing",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

/* ── Droppable zone ──────────────────────────────────────────────── */

function DropZone({
  id,
  children,
  style,
}: {
  id: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        outline: isOver ? "1.5px dashed rgba(255,255,255,0.3)" : undefined,
        transition: "outline 0.1s",
      }}
    >
      {children}
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */

export function ArcaneConfigPanel({
  afinidade,
  antitese,
  arcano,
  entropia,
  selectedElement,
  onSelectElement,
  modificadores,
  onRoll,
  onClose,
}: ArcaneConfigPanelProps) {
  const isAnti = selectedElement === antitese;
  const elementBonus = isAnti ? -10 : 0;
  const typeColor = getAccent(selectedElement).text;
  const entropiaBonus = arcano * entropia;

  // Stable IDs for all tokens
  const diceIds = useMemo<["d12-0", "d12-1"]>(() => ["d12-0", "d12-1"], []);
  const bonusIds = useMemo(
    () => Array.from({ length: entropia }, (_, i) => `bonus-${i}`),
    [entropia],
  );

  // Location of each token — all start in pool
  const [tokenLoc, setTokenLoc] = useState<Record<string, TokenLoc>>(() => {
    const loc: Record<string, TokenLoc> = { "d12-0": "pool", "d12-1": "pool" };
    for (let i = 0; i < entropia; i++) loc[`bonus-${i}`] = "pool";
    return loc;
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  // Derived allocation from token positions
  const allocation = useMemo<Record<ModKey, number>>(() => {
    const a: Record<ModKey, number> = { potencia: 0, complexidade: 0, forma: 0, controle: 0 };
    for (const id of diceIds) {
      const loc = tokenLoc[id];
      if (loc && loc !== "pool") a[loc]++;
    }
    return a;
  }, [tokenLoc, diceIds]);

  const entropiaAllocation = useMemo<Record<ModKey, number>>(() => {
    const a: Record<ModKey, number> = { potencia: 0, complexidade: 0, forma: 0, controle: 0 };
    for (const id of bonusIds) {
      const loc = tokenLoc[id];
      if (loc && loc !== "pool") a[loc] += arcano;
    }
    return a;
  }, [tokenLoc, bonusIds, arcano]);

  const totalDice = diceIds.filter((id) => tokenLoc[id] !== "pool").length;
  const remaining = 2 - totalDice;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const id = active.id as string;
    const overId = over.id as string;
    const newLoc: TokenLoc = MOD_KEYS.includes(overId as ModKey)
      ? (overId as ModKey)
      : "pool";

    // D12: max 2 per modifier (can't exceed 2 total anyway since only 2 exist)
    if (id.startsWith("d12-") && newLoc !== "pool") {
      const diceAlreadyThere = diceIds.filter((did) => did !== id && tokenLoc[did] === newLoc).length;
      if (diceAlreadyThere >= 2) return;
    }

    setTokenLoc((prev) => ({ ...prev, [id]: newLoc }));
  }

  const activeIsDice = activeId?.startsWith("d12-");
  const activeColor = activeIsDice ? "#D080F0" : "#C8922A";
  const activeLabel = activeIsDice ? "D12" : `+${arcano}`;
  const activeSize = activeIsDice ? 40 : 36;

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
          border: `1px solid ${typeColor}44`,
          borderRadius: 16,
          padding: "24px 28px",
          minWidth: 320,
          maxWidth: 440,
          width: "92vw",
          boxShadow: `0 16px 60px rgba(0,0,0,0.7), 0 0 40px ${typeColor}18`,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

          {/* Header */}
          <div
            style={{
              marginBottom: 18,
              borderBottom: "1px solid rgba(140,60,200,0.25)",
              paddingBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Teste Arcano
              </span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(205,146,234,0.7)", textTransform: "uppercase" }}>
                2D12
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
                  dados
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: remaining > 0 ? "#D080F0" : "rgba(255,255,255,0.25)", lineHeight: 1 }}>
                  {remaining}
                </span>
              </div>
              {entropiaBonus > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
                    bônus
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#C8922A", lineHeight: 1 }}>
                    +{entropiaBonus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Token pool */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8 }}>
              Arraste para os modificadores
            </p>
            <DropZone
              id="pool"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                minHeight: 52,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              {diceIds.map((id) =>
                tokenLoc[id] === "pool" ? (
                  <DragToken key={id} id={id} color="#D080F0" label="D12" size={40} />
                ) : null,
              )}
              {entropia > 0 && (
                <>
                  <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)", margin: "0 2px", flexShrink: 0 }} />
                  {bonusIds.map((id) =>
                    tokenLoc[id] === "pool" ? (
                      <DragToken key={id} id={id} color="#C8922A" label={`+${arcano}`} size={36} />
                    ) : null,
                  )}
                </>
              )}
            </DropZone>
          </div>

          {/* Element picker */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8 }}>
              Elemento
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
              {ALL_ELEMENTS.map((el) => {
                const acc = getAccent(el);
                const isElemAfin = el === afinidade;
                const isElemAnti = el === antitese;
                const canUse = isElemAfin || isElemAnti;
                const active = selectedElement === el;
                return (
                  <button
                    key={el}
                    onClick={() => canUse && onSelectElement(el)}
                    disabled={!canUse}
                    style={{
                      padding: "7px 3px",
                      borderRadius: 7,
                      border: `1px solid ${active ? acc.text : canUse ? "var(--color-border)" : "rgba(255,255,255,0.04)"}`,
                      background: active ? acc.text + "22" : canUse ? "rgba(255,255,255,0.02)" : "transparent",
                      cursor: canUse ? "pointer" : "not-allowed",
                      boxShadow: active ? `0 0 10px ${acc.text}33` : "none",
                      transition: "all 0.12s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      opacity: canUse ? 1 : 0.2,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, color: active ? acc.text : canUse ? "var(--color-text-secondary)" : "rgba(255,255,255,0.2)", lineHeight: 1.2, textAlign: "center" }}>
                      {el}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, color: active ? acc.text : acc.text + (canUse ? "88" : "22"), lineHeight: 1 }}>
                      {isElemAnti ? "−10" : isElemAfin ? "—" : "✕"}
                    </span>
                    {(isElemAfin || isElemAnti) && (
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 7, letterSpacing: "0.08em", color: acc.text + (active ? "cc" : "66"), textTransform: "uppercase", lineHeight: 1 }}>
                        {isElemAfin ? "Afin" : "Anti"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modifier drop zones */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8 }}>
              Modificadores
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MOD_KEYS.map((k) => {
                const score = modificadores[k] ?? 0;
                const alloc = allocation[k];
                const eAlloc = entropiaAllocation[k];
                const total = score + eAlloc + elementBonus;
                const isActive = alloc > 0 || eAlloc > 0;
                const diceInMod = diceIds.filter((id) => tokenLoc[id] === k);
                const bonusInMod = bonusIds.filter((id) => tokenLoc[id] === k);

                return (
                  <DropZone
                    key={k}
                    id={k}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: isActive ? "rgba(160,80,240,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? "rgba(180,90,240,0.4)" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Name + formula */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, color: isActive ? "rgba(220,160,255,0.95)" : "var(--color-text-secondary)", lineHeight: 1, marginBottom: 2 }}>
                          {MOD_LABELS[k]}
                        </p>
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.03em" }}>
                          {score}{eAlloc > 0 ? ` + ${eAlloc}` : ""}{elementBonus < 0 ? " − 10" : ""} = {total}
                          {alloc > 0 && <span style={{ color: "#D080F0" }}> + {alloc}D12</span>}
                        </p>
                      </div>

                      {/* Tokens sitting inside this modifier */}
                      {(diceInMod.length > 0 || bonusInMod.length > 0) && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {diceInMod.map((id) => (
                            <DragToken key={id} id={id} color="#D080F0" label="D12" size={30} />
                          ))}
                          {bonusInMod.map((id) => (
                            <DragToken key={id} id={id} color="#C8922A" label={`+${arcano}`} size={28} />
                          ))}
                        </div>
                      )}
                    </div>
                  </DropZone>
                );
              })}
            </div>
          </div>

          {/* Roll button */}
          <button
            onClick={() => onRoll(allocation, entropiaAllocation)}
            disabled={totalDice === 0}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 8,
              border: `1px solid ${totalDice > 0 ? typeColor : "var(--color-border)"}`,
              background: totalDice > 0 ? typeColor + "28" : "transparent",
              color: totalDice > 0 ? typeColor : "var(--color-text-muted)",
              fontFamily: "var(--font-ui)", fontWeight: 800, fontSize: 13,
              letterSpacing: "0.22em", cursor: totalDice === 0 ? "not-allowed" : "pointer",
              opacity: totalDice === 0 ? 0.4 : 1, transition: "all 0.15s",
              boxShadow: totalDice > 0 ? `0 0 18px ${typeColor}44` : "none",
            }}
          >
            ROLAR {totalDice > 0 ? `${totalDice}D12` : ""}
          </button>
          <button
            onClick={onClose}
            style={{
              marginTop: 8, width: "100%", padding: "6px 0",
              background: "transparent", border: "none",
              color: "var(--color-text-muted)",
              fontSize: 11, fontFamily: "var(--font-ui)",
              cursor: "pointer", letterSpacing: "0.1em",
            }}
          >
            cancelar
          </button>

          <DragOverlay>
            {activeId ? (
              <TokenVisual color={activeColor} label={activeLabel} size={activeSize} />
            ) : null}
          </DragOverlay>

        </DndContext>
      </motion.div>
    </motion.div>
  );
}
