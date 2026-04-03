import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Character } from "@/data/characterTypes";
import charactersData from "@characters";
import {
  getCustomCharacter,
  isOwnedCharacter,
  saveCurrentValues,
} from "@/lib/localCharacters";

const PRESET_CHARACTERS = charactersData as Character[];

/* ─── Element colors ───────────────────────────────────────────── */
const ELEMENT_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  Energia:   { text: "#E8803A", bg: "rgba(200,90,32,0.18)",   glow: "rgba(232,128,58,0.45)"  },
  Anomalia:  { text: "#6FC892", bg: "rgba(42,155,111,0.18)",  glow: "rgba(111,200,146,0.45)" },
  Paradoxo:  { text: "#50C8E8", bg: "rgba(32,143,168,0.18)",  glow: "rgba(80,200,232,0.45)"  },
  Astral:    { text: "#C090F0", bg: "rgba(107,63,160,0.18)",  glow: "rgba(192,144,240,0.45)" },
  Cognitivo: { text: "#E8B84B", bg: "rgba(200,146,42,0.18)",  glow: "rgba(232,184,75,0.45)"  },
};
const DEFAULT_ACCENT = { text: "#C8E0F0", bg: "rgba(32,96,160,0.18)", glow: "rgba(200,224,240,0.3)" };

const ELEMENT_DATA: Record<string, { essence: string }> = {
  Energia:   { essence: "Criação e manifestação física" },
  Anomalia:  { essence: "Mutação e transmutação da matéria" },
  Paradoxo:  { essence: "Distorção de conceitos e tempo" },
  Astral:    { essence: "Trânsito entre planos de existência" },
  Cognitivo: { essence: "Controle da mente e dos sentidos" },
};

function getAccent(element: string | null | undefined) {
  return element ? (ELEMENT_COLORS[element] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT;
}

/* ─── Attribute groups ─────────────────────────────────────────── */
const ATTR_GROUPS = [
  {
    attr: "fisico" as const,
    label: "Físico",
    color: "#C04040",
    skills: [
      { key: "fortitude"  as const, label: "Fortitude"  },
      { key: "vontade"    as const, label: "Vontade"    },
      { key: "atletismo"  as const, label: "Atletismo"  },
      { key: "combate"    as const, label: "Combate"    },
    ],
  },
  {
    attr: "destreza" as const,
    label: "Destreza",
    color: "#20A080",
    skills: [
      { key: "furtividade" as const, label: "Furtividade" },
      { key: "precisao"    as const, label: "Precisão"    },
      { key: "acrobacia"   as const, label: "Acrobacia"   },
      { key: "reflexo"     as const, label: "Reflexo"     },
    ],
  },
  {
    attr: "intelecto" as const,
    label: "Intelecto",
    color: "#4080C0",
    skills: [
      { key: "percepcao"    as const, label: "Percepção"    },
      { key: "intuicao"     as const, label: "Intuição"     },
      { key: "investigacao" as const, label: "Investigação" },
      { key: "conhecimento" as const, label: "Conhecimento" },
    ],
  },
  {
    attr: "influencia" as const,
    label: "Influência",
    color: "#A060C0",
    skills: [
      { key: "empatia"    as const, label: "Empatia"    },
      { key: "dominacao"  as const, label: "Dominação"  },
      { key: "persuasao"  as const, label: "Persuasão"  },
      { key: "performance" as const, label: "Performance" },
    ],
  },
];

/* ─── Honeycomb grid ───────────────────────────────────────────── */
const HEX_R = 11;
const HEX_W = Math.sqrt(3) * HEX_R;
const ROW_SPACING = HEX_R * 1.5;

function hexPoints(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 - i * (Math.PI / 3);
    return `${(cx + HEX_R * Math.cos(angle)).toFixed(2)},${(cy + HEX_R * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

function lerpHex(c1: string, c2: string, t: number): string {
  const h = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${lerp(h(c1, 1), h(c2, 1))},${lerp(h(c1, 3), h(c2, 3))},${lerp(h(c1, 5), h(c2, 5))})`;
}

function HoneycombGrid({ total, current, colorTop, colorBottom, label, accentColor, onCellClick }: {
  total: number; current: number; colorTop: string; colorBottom: string;
  label: string; accentColor: string; onCellClick?: (idx: number) => void;
}) {
  const COLS = Math.min(8, Math.max(4, Math.round(Math.sqrt(total))));
  const totalRows = Math.ceil(total / COLS);
  const svgW = (COLS + 0.5) * HEX_W + 4;
  const svgH = totalRows * ROW_SPACING + HEX_R + 4;

  const cells: { cx: number; cy: number; row: number; idx: number }[] = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const isOddRow = row % 2 === 1;
    cells.push({ cx: col * HEX_W + (isOddRow ? HEX_W / 2 : 0) + HEX_W / 2 + 2, cy: row * ROW_SPACING + HEX_R + 2, row, idx: i });
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor, fontFamily: "var(--font-ui)" }}>{label}</p>
        <span className="font-display font-bold text-3xl" style={{ color: "#EEF4FC" }}>{current}</span>
        <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.8rem" }}>/ {total}</span>
        {onCellClick && (
          <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: 4 }}>
            clique para editar
          </span>
        )}
      </div>
      <svg width={svgW} height={svgH} style={{ display: "block", overflow: "visible", cursor: onCellClick ? "pointer" : "default" }}>
        {cells.map(({ cx, cy, row, idx }) => {
          const alive = idx < current;
          const gradientT = totalRows > 1 ? row / (totalRows - 1) : 1;
          return (
            <polygon key={idx} points={hexPoints(cx, cy)}
              fill={alive ? lerpHex(colorTop, colorBottom, gradientT) : "rgba(255,255,255,0.05)"}
              stroke={alive ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.08)"}
              strokeWidth={1.5}
              onClick={onCellClick ? () => onCellClick(idx) : undefined}
              style={onCellClick ? { transition: "fill 0.1s" } : undefined}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Attribute block ──────────────────────────────────────────── */
function AttributeBlock({ group, character }: { group: (typeof ATTR_GROUPS)[number]; character: Character }) {
  return (
    <div className="rounded-sm overflow-hidden" style={{ background: "rgba(4,10,20,0.7)", border: `1px solid ${group.color}33` }}>
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(90deg, ${group.color}1A 0%, transparent 100%)`, borderBottom: `1px solid ${group.color}33` }}>
        <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: group.color, fontFamily: "var(--font-ui)" }}>{group.label}</span>
        <span className="font-display font-bold text-2xl" style={{ color: group.color }}>{character.attributes[group.attr]}</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {group.skills.map((skill) => {
          const val = character.skills[skill.key];
          const hasTalent = character.talents.includes(skill.key);
          return (
            <div key={skill.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{ fontSize: "0.6rem", lineHeight: 1, flexShrink: 0, color: hasTalent ? group.color : "rgba(255,255,255,0.18)", fontWeight: hasTalent ? 700 : 400 }}>
                  {hasTalent ? "◆" : "◇"}
                </span>
                <span className="text-xs" style={{ color: val > 0 ? "var(--color-text-secondary)" : "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontWeight: hasTalent ? 600 : 400 }}>
                  {skill.label}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: val > 0 ? group.color : "rgba(255,255,255,0.18)", minWidth: 24, textAlign: "right" }}>
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Arcano: Drag & Drop ──────────────────────────────────────── */
const RUNA_BONUSES = [2, 4, 6, 8, 10];

function DraggableRuna({ runa, isSlotted, isDraggingThis }: { runa: string; isSlotted: boolean; isDraggingThis: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `runa-${runa}` });
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
      {isSlotted && <span style={{ fontSize: "0.5rem", lineHeight: 1 }}>◆</span>}
      {runa}
    </div>
  );
}

function DroppableSlot({ index, bonus, withinEntropia, slotted, isDragging, onRemove }: {
  index: number; bonus: number; withinEntropia: boolean; slotted: string | null; isDragging: boolean; onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}`, disabled: !withinEntropia });
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
      onClick={() => { if (slotted) onRemove(); }}
      title={slotted ? `Clique para remover ${slotted}` : undefined}
    >
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.5rem", letterSpacing: "0.1em", color: withinEntropia ? "rgba(180,100,220,0.6)" : "rgba(255,255,255,0.1)", textTransform: "uppercase" }}>
        {index + 1}ª runa
      </p>
      {slotted ? (
        <>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "0.65rem", color: "#E0A8FF", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
            {slotted}
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "#C878F0", lineHeight: 1 }}>+{bonus}</p>
          <span style={{ position: "absolute", top: 4, right: 6, fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>×</span>
        </>
      ) : (
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: withinEntropia ? (isHovered ? "#D080F0" : "rgba(180,100,220,0.4)") : "rgba(255,255,255,0.08)", lineHeight: 1, transition: "color 0.15s" }}>
          +{bonus}
        </p>
      )}
    </div>
  );
}

function EntropiaDisplay({ value, slottedRunas, draggingRuna, onRemoveRuna }: {
  value: number; slottedRunas: (string | null)[]; draggingRuna: string | null; onRemoveRuna: (slotIdx: number) => void;
}) {
  const activeBonus = slottedRunas.slice(0, value).reduce((sum, runa, i) => sum + (runa ? RUNA_BONUSES[i] : 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(180,100,220,0.85)", fontFamily: "var(--font-ui)" }}>Entropia</p>
          <span className="font-display font-bold text-3xl" style={{ color: "#EEF4FC" }}>{value}</span>
          <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.75rem" }}>/ 5</span>
        </div>
        {value > 0 && (
          <div className="text-right">
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Bônus de runas</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: activeBonus > 0 ? "#D080F0" : "rgba(255,255,255,0.15)", lineHeight: 1, transition: "color 0.2s" }}>
              {activeBonus > 0 ? `+${activeBonus}` : "—"}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {RUNA_BONUSES.map((bonus, i) => (
          <DroppableSlot key={i} index={i} bonus={bonus} withinEntropia={i < value}
            slotted={slottedRunas[i]} isDragging={draggingRuna !== null} onRemove={() => onRemoveRuna(i)} />
        ))}
      </div>
      {value === 0 && (
        <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-ui)" }}>Sem slots de entropia ativos</p>
      )}
      {value > 0 && draggingRuna === null && slottedRunas.slice(0, value).every((r) => r === null) && (
        <p className="mt-3 text-xs" style={{ color: "rgba(180,100,220,0.35)", fontFamily: "var(--font-ui)" }}>Arraste runas para os slots para ativar os bônus</p>
      )}
    </div>
  );
}

/* ─── Misc sub-components ──────────────────────────────────────── */
function Tag({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
      style={{ color, background: bg, border: `1px solid ${color}44`, fontFamily: "var(--font-ui)" }}>
      {children}
    </span>
  );
}

function EditBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0.25rem 0.6rem", transition: "color 0.15s, border-color 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#EEF4FC"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
    >
      ✎ {label}
    </button>
  );
}

function SectionLabel({ children, accent, onEdit, edits }: {
  children: React.ReactNode; accent: string; onEdit?: () => void; edits?: { label: string; fn: () => void }[];
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: "var(--font-ui)" }}>{children}</p>
      {onEdit && <EditBtn label="" onClick={onEdit} />}
      {edits && edits.map((e) => <EditBtn key={e.label} label={e.label} onClick={e.fn} />)}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */
export function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = id ? (PRESET_CHARACTERS.find((c) => c.id === id) ?? getCustomCharacter(id)) : undefined;
  const owned = id ? isOwnedCharacter(id) : false;

  const [currentHp, setCurrentHp] = useState<number>(() => character ? (character.currentHp ?? character.hp) : 0);
  const [currentSanidade, setCurrentSanidade] = useState<number>(() => character ? (character.currentSanidade ?? character.sanidade) : 0);
  const [slottedRunas, setSlottedRunas] = useState<(string | null)[]>(Array(5).fill(null));
  const [draggingRuna, setDraggingRuna] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 900], [0, -220]);
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const backOpacity = useTransform(scrollY, [0, 150], [1, 0.35]);

  useEffect(() => {
    document.title = character ? `${character.name} — Arcádia` : "Arcádia";
    window.scrollTo({ top: 0 });
  }, [id]);

  function handleDragStart(event: DragStartEvent) {
    setDraggingRuna(String(event.active.id).replace("runa-", ""));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingRuna(null);
    if (!over || !character) return;
    const runaName = String(active.id).replace("runa-", "");
    const slotIdx = parseInt(String(over.id).replace("slot-", ""), 10);
    if (isNaN(slotIdx) || slotIdx >= character.entropia) return;
    setSlottedRunas((prev) => {
      const next = [...prev];
      const prevSlot = next.indexOf(runaName);
      if (prevSlot !== -1) next[prevSlot] = null;
      next[slotIdx] = runaName;
      return next;
    });
  }

  function handleRemoveRuna(slotIdx: number) {
    setSlottedRunas((prev) => { const next = [...prev]; next[slotIdx] = null; return next; });
  }

  function goEdit(step: number) { navigate(`/editar-ficha/${id}?step=${step}`); }

  function handleHpClick(idx: number) {
    if (!owned || !id) return;
    const next = idx < currentHp ? idx : idx + 1;
    setCurrentHp(next);
    saveCurrentValues(id, next, currentSanidade);
  }

  function handleSanidadeClick(idx: number) {
    if (!owned || !id) return;
    const next = idx < currentSanidade ? idx : idx + 1;
    setCurrentSanidade(next);
    saveCurrentValues(id, currentHp, next);
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-abyss)" }}>
        <div className="text-center space-y-4">
          <p className="font-display text-2xl" style={{ color: "var(--color-text-secondary)" }}>Personagem não encontrado</p>
          <button onClick={() => navigate('/personagens')} style={{ color: "var(--color-arcano-glow)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "0.8rem" }}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const accent = getAccent(character.afinidade);
  const antAccent = getAccent(character.antitese);

  return (
    <div style={{ background: "var(--color-abyss)", minHeight: "100vh" }}>
      {/* ── Fixed back button ────────────────────────────── */}
      <motion.div style={{ opacity: backOpacity, position: "fixed", top: 16, left: 16, zIndex: 50 }}>
        <button onClick={() => navigate('/personagens')}
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(4,10,20,0.75)", border: "1px solid rgba(255,255,255,0.13)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-ui)", cursor: "pointer", letterSpacing: "0.12em" }}>
          ← Voltar
        </button>
      </motion.div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
        <motion.div style={{ y: heroImgY, position: "absolute", top: "-20%", left: 0, right: 0, bottom: "-20%" }}>
          {character.image ? (
            <img src={character.image} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `radial-gradient(ellipse 55% 55% at 65% 35%, ${accent.glow} 0%, transparent 65%), linear-gradient(155deg, rgba(4,10,20,0.97) 0%, rgba(8,18,36,0.78) 50%, rgba(4,10,20,1) 100%)` }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: `repeating-linear-gradient(0deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px)` }} />
              <div style={{ position: "absolute", top: "50%", left: "60%", transform: "translate(-50%, -50%)", fontSize: "min(32rem, 58vw)", fontFamily: "var(--font-display)", fontWeight: 700, color: accent.text, opacity: 0.04, lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>
                {character.name[0]}
              </div>
            </div>
          )}
        </motion.div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, rgba(4,10,20,0.97) 0%, rgba(4,10,20,0.4) 45%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to right, rgba(4,10,20,0.52) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, pointerEvents: "none", background: `linear-gradient(90deg, ${accent.text} 0%, ${accent.text}44 50%, transparent 80%)` }} />

        <motion.div style={{ y: heroContentY, opacity: heroOpacity, position: "absolute", bottom: "9%", left: 0, right: 0, paddingLeft: "max(2rem, env(safe-area-inset-left))", paddingRight: "2rem" }}>
          <div style={{ maxWidth: 680 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.24em] font-semibold" style={{ color: accent.text, fontFamily: "var(--font-ui)" }}>{character.race}</span>
              <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}>Nível {character.level}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(3.2rem, 9vw, 7rem)", lineHeight: 0.92, color: "#EEF4FC", letterSpacing: "-0.02em", textShadow: `0 0 80px ${accent.glow}`, marginBottom: "0.75rem" }}>
              {character.name}
            </h1>
            <p className="text-sm font-semibold mb-3" style={{ color: accent.text, fontFamily: "var(--font-ui)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{character.concept}</p>
            <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "1rem", color: "rgba(200,220,240,0.6)", borderLeft: `2px solid ${accent.text}55`, paddingLeft: "1rem", maxWidth: 480 }}>
              "{character.quote}"
            </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: useTransform(scrollY, [0, 180], [0.65, 0]), position: "absolute", bottom: 24, right: 24 }} className="flex flex-col items-center gap-1.5">
          <span style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-ui)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>ficha</span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${accent.text}55, transparent)` }} />
        </motion.div>
      </div>

      {/* ── SHEET ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">

        {/* Vitalidade */}
        <section>
          <SectionLabel accent={accent.text} edits={owned ? [{ label: "identidade", fn: () => goEdit(1) }] : undefined}>Vitalidade</SectionLabel>
          <div className="flex flex-wrap gap-12">
            <HoneycombGrid total={character.hp} current={currentHp} colorTop="#9EDA60" colorBottom="#1C5C10" label="Pontos de Vida" accentColor="#6EC840" onCellClick={owned ? handleHpClick : undefined} />
            <HoneycombGrid total={character.sanidade} current={currentSanidade} colorTop="#EAA8A8" colorBottom="#9C1818" label="Sanidade" accentColor="#D04040" onCellClick={owned ? handleSanidadeClick : undefined} />
          </div>
        </section>

        {/* Atributos e Perícias */}
        <section>
          <SectionLabel accent={accent.text} edits={owned ? [{ label: "atributos", fn: () => goEdit(2) }, { label: "perícias", fn: () => goEdit(3) }] : undefined}>Atributos e Perícias</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ATTR_GROUPS.map((group) => <AttributeBlock key={group.attr} group={group} character={character} />)}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}>
            ◆ com talento — permite rolar 3D12 em testes de perícia · ◇ sem talento
          </p>
        </section>

        {/* Arcano */}
        <section>
          <SectionLabel accent={accent.text} onEdit={owned ? () => goEdit(4) : undefined}>Arcano</SectionLabel>
          <div className="space-y-3">

            {/* Afinidade + Antítese */}
            <div className="grid grid-cols-2 gap-3">
              <div style={{ padding: "1.25rem", borderRadius: 4, background: `linear-gradient(135deg, ${accent.bg} 0%, rgba(4,10,20,0.9) 100%)`, border: `1px solid ${accent.text}44` }}>
                <div className="flex items-start justify-between mb-3">
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Afinidade</p>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: accent.text, lineHeight: 1 }}>+4</span>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: accent.text, marginBottom: "0.3rem" }}>{character.afinidade}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>{ELEMENT_DATA[character.afinidade]?.essence ?? ""}</p>
              </div>
              <div style={{ padding: "1.25rem", borderRadius: 4, background: `linear-gradient(135deg, ${antAccent.bg} 0%, rgba(4,10,20,0.9) 100%)`, border: `1px solid ${antAccent.text}33` }}>
                <div className="flex items-start justify-between mb-3">
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Antítese</p>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: antAccent.text, lineHeight: 1 }}>+2</span>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: antAccent.text, marginBottom: "0.3rem" }}>{character.antitese}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>{ELEMENT_DATA[character.antitese]?.essence ?? ""}</p>
              </div>
            </div>

            {/* Entropia + Runas com DndContext */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div style={{ padding: "1.25rem", borderRadius: 4, background: "linear-gradient(135deg, rgba(80,20,140,0.18) 0%, rgba(4,10,20,0.9) 100%)", border: "1px solid rgba(140,60,200,0.28)" }}>
                <EntropiaDisplay value={character.entropia} slottedRunas={slottedRunas} draggingRuna={draggingRuna} onRemoveRuna={handleRemoveRuna} />
              </div>

              {character.runas.length > 0 && (
                <div style={{ padding: "1.25rem", borderRadius: 4, background: "rgba(4,10,20,0.7)", border: "1px solid rgba(160,60,210,0.2)" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(180,100,220,0.65)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Runas Conhecidas
                    <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: "0.5rem", textTransform: "none", letterSpacing: 0, fontSize: "0.55rem" }}>— arraste para os slots</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {character.runas.map((runa) => (
                      <DraggableRuna key={runa} runa={runa} isSlotted={slottedRunas.includes(runa)} isDraggingThis={draggingRuna === runa} />
                    ))}
                  </div>
                </div>
              )}

              <DragOverlay>
                {draggingRuna ? (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#E0A8FF", background: "rgba(140,40,220,0.95)", border: "1px solid rgba(200,120,255,0.8)", fontFamily: "var(--font-ui)", boxShadow: "0 4px 24px rgba(160,60,240,0.6)", cursor: "grabbing", userSelect: "none" }}>
                    {draggingRuna}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </section>

        {/* Antecedentes */}
        <section>
          <SectionLabel accent={accent.text} onEdit={owned ? () => goEdit(5) : undefined}>Antecedentes</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {character.antecedentes.map((ant) => <Tag key={ant} color="#80A8C8" bg="rgba(32,96,160,0.12)">{ant}</Tag>)}
          </div>
        </section>

        {/* Traumas */}
        {character.traumas.length > 0 && (
          <section>
            <SectionLabel accent={accent.text} onEdit={owned ? () => goEdit(5) : undefined}>Traumas</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {character.traumas.map((trauma) => <Tag key={trauma} color="#C05050" bg="rgba(160,32,32,0.15)">{trauma}</Tag>)}
            </div>
          </section>
        )}

        <div className="pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button onClick={() => navigate('/personagens')}
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
