import { useDraggable, useDroppable } from "@dnd-kit/core";

export const RUNA_BONUSES = [2, 4, 6, 8, 10];

export function DraggableRuna({
  runa,
  isSlotted,
  isDraggingThis,
}: {
  runa: string;
  isSlotted: boolean;
  isDraggingThis: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `runa-${runa}`,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
      style={{
        color: isSlotted ? "#C878F0" : "#B060D0",
        background: isSlotted ? "rgba(160,60,220,0.2)" : "rgba(128,40,160,0.15)",
        border: `1px solid ${isSlotted ? "rgba(180,80,240,0.5)" : "rgba(176,96,208,0.27)"}`,
        fontFamily: "var(--font-ui)",
        opacity: isDraggingThis ? 0.3 : isSlotted ? 0.55 : 1,
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        transition: "opacity 0.15s, border-color 0.15s",
      }}
    >
      {isSlotted && (
        <span style={{ fontSize: "0.5rem", lineHeight: 1 }}>◆</span>
      )}
      {runa}
    </div>
  );
}

function DroppableSlot({
  index,
  bonus,
  withinEntropia,
  slotted,
  isDragging,
  onRemove,
}: {
  index: number;
  bonus: number;
  withinEntropia: boolean;
  slotted: string | null;
  isDragging: boolean;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    disabled: !withinEntropia,
  });
  const isHovered = isOver && withinEntropia;

  return (
    <div
      ref={setNodeRef}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative"
      style={{
        borderRadius: 4,
        minHeight: 72,
        background: slotted
          ? "linear-gradient(180deg, rgba(160,60,240,0.28) 0%, rgba(100,30,180,0.18) 100%)"
          : isHovered
            ? "linear-gradient(180deg, rgba(160,60,240,0.32) 0%, rgba(100,30,180,0.2) 100%)"
            : withinEntropia
              ? "linear-gradient(180deg, rgba(160,60,240,0.12) 0%, rgba(100,30,180,0.06) 100%)"
              : "rgba(255,255,255,0.02)",
        border: slotted
          ? "1px solid rgba(180,80,240,0.6)"
          : isHovered
            ? "1px solid rgba(180,80,240,0.8)"
            : isDragging && withinEntropia
              ? "1px dashed rgba(160,80,220,0.5)"
              : withinEntropia
                ? "1px solid rgba(160,80,220,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
        boxShadow: slotted
          ? "0 0 20px rgba(160,80,220,0.3), inset 0 1px 0 rgba(200,100,255,0.12)"
          : isHovered
            ? "0 0 24px rgba(160,80,220,0.45)"
            : withinEntropia
              ? "0 0 10px rgba(160,80,220,0.12)"
              : "none",
        transform: isHovered ? "scale(1.04)" : "scale(1)",
        transition: "all 0.15s ease",
        cursor: withinEntropia ? (slotted ? "pointer" : "default") : "not-allowed",
        opacity: withinEntropia ? 1 : 0.3,
      }}
      onClick={() => {
        if (slotted) onRemove();
      }}
      title={slotted ? `Clique para remover ${slotted}` : undefined}
    >
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.5rem",
          letterSpacing: "0.1em",
          color: withinEntropia ? "rgba(180,100,220,0.6)" : "rgba(255,255,255,0.1)",
          textTransform: "uppercase",
        }}
      >
        {index + 1}ª runa
      </p>
      {slotted ? (
        <>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 700,
              fontSize: "0.65rem",
              color: "#E0A8FF",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {slotted}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#C878F0",
              lineHeight: 1,
            }}
          >
            +{bonus}
          </p>
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 6,
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.2)",
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </>
      ) : (
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: withinEntropia
              ? isHovered
                ? "#D080F0"
                : "rgba(180,100,220,0.4)"
              : "rgba(255,255,255,0.08)",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
        >
          +{bonus}
        </p>
      )}
    </div>
  );
}

export function EntropiaDisplay({
  value,
  slottedRunas,
  draggingRuna,
  onRemoveRuna,
}: {
  value: number;
  slottedRunas: (string | null)[];
  draggingRuna: string | null;
  onRemoveRuna: (slotIdx: number) => void;
}) {
  const activeBonus = slottedRunas
    .slice(0, value)
    .reduce((sum, runa, i) => sum + (runa ? RUNA_BONUSES[i] : 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgba(180,100,220,0.85)", fontFamily: "var(--font-ui)" }}
          >
            Entropia
          </p>
          <span className="font-display font-bold text-3xl" style={{ color: "#EEF4FC" }}>
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
        {value > 0 && (
          <div className="text-right">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Bônus de runas
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: activeBonus > 0 ? "#D080F0" : "rgba(255,255,255,0.38)",
                lineHeight: 1,
                transition: "color 0.2s",
              }}
            >
              {activeBonus > 0 ? `+${activeBonus}` : "—"}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {RUNA_BONUSES.map((bonus, i) => (
          <DroppableSlot
            key={i}
            index={i}
            bonus={bonus}
            withinEntropia={i < value}
            slotted={slottedRunas[i]}
            isDragging={draggingRuna !== null}
            onRemove={() => onRemoveRuna(i)}
          />
        ))}
      </div>

      {value === 0 && (
        <p
          className="mt-3 text-xs"
          style={{ color: "rgba(255,255,255,0.50)", fontFamily: "var(--font-ui)" }}
        >
          Sem slots de entropia ativos
        </p>
      )}
      {value > 0 &&
        draggingRuna === null &&
        slottedRunas.slice(0, value).every((r) => r === null) && (
          <p
            className="mt-3 text-xs"
            style={{ color: "rgba(200,150,240,0.75)", fontFamily: "var(--font-ui)" }}
          >
            Arraste runas para os slots para ativar os bônus
          </p>
        )}
    </div>
  );
}
