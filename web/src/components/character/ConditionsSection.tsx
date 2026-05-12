import { useState, useRef, useEffect } from "react"
import type { Condition, ConditionEffect, ConditionEffectField } from "@/data/characterTypes"

const CONDITION_ICONS = [
  "☠️","💀","🔥","❄️","⚡","🌀","💚","💛","🔴","🟣",
  "⚔️","🛡️","🩸","🧪","🌑","🌟","💫","🎭","🕷️","🌿",
]

const EFFECT_FIELD_LABELS: Record<ConditionEffectField | 'dano', string> = {
  fortitude: "Fortitude",
  vontade: "Vontade",
  atletismo: "Atletismo",
  combate: "Combate",
  furtividade: "Furtividade",
  precisao: "Precisão",
  acrobacia: "Acrobacia",
  reflexo: "Reflexo",
  percepcao: "Percepção",
  intuicao: "Intuição",
  investigacao: "Investigação",
  conhecimento: "Conhecimento",
  empatia: "Empatia",
  dominacao: "Dominação",
  persuasao: "Persuasão",
  performance: "Performance",
  fisico: "Físico",
  destreza: "Destreza",
  intelecto: "Intelecto",
  influencia: "Influência",
  hpMax: "HP Máximo",
  sanidadeMax: "Sanidade Máx.",
  daBase: "DA Base",
  daBonus: "DA Bônus",
  dpBonus: "DP Bônus",
  dano: "Dano",
  peso: "Peso",
  slots: "Slots",
  arcano: "Arcano",
}

const ALL_FIELDS = Object.keys(EFFECT_FIELD_LABELS) as (ConditionEffectField | 'dano')[]

function generateId(): string {
  return `cond_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

interface EffectRow {
  field: ConditionEffectField | 'dano'
  value: string
}

interface ConditionFormState {
  name: string
  icon: string
  description: string
  advanced: boolean
  effects: EffectRow[]
}

const DEFAULT_FORM: ConditionFormState = {
  name: "",
  icon: "🔥",
  description: "",
  advanced: false,
  effects: [{ field: "fortitude", value: "0" }],
}

function TooltipPortal({ children, anchor }: { children: React.ReactNode; anchor: HTMLElement | null }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!anchor) { setPos(null); return }
    const rect = anchor.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
  }, [anchor])

  if (!pos) return null

  return (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  )
}

function ConditionTooltip({ condition }: { condition: Condition }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 6,
        padding: "0.5rem 0.75rem",
        maxWidth: 220,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--color-arcano)",
          marginBottom: condition.description ? "0.25rem" : 0,
        }}
      >
        {condition.icon} {condition.name}
      </p>
      {condition.description && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.4,
          }}
        >
          {condition.description}
        </p>
      )}
      {(condition.effects?.length ?? 0) > 0 && (
        <ul style={{ marginTop: "0.35rem", paddingLeft: 0, listStyle: "none" }}>
          {condition.effects!.map((e, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.65rem",
                color:
                  typeof e.value === "number"
                    ? e.value > 0
                      ? "#6EC840"
                      : e.value < 0
                        ? "#E07070"
                        : "var(--color-text-muted)"
                    : "var(--color-arcano)",
              }}
            >
              {EFFECT_FIELD_LABELS[e.field as ConditionEffectField | 'dano']}: {typeof e.value === "number" && e.value > 0 ? `+${e.value}` : e.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ConditionChip({
  condition,
  onRemove,
  isGm,
}: {
  condition: Condition
  onRemove?: () => void
  isGm: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          padding: isGm ? "0.3rem 0.3rem 0.3rem 0.5rem" : "0.3rem 0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          cursor: "default",
          transition: "border-color 0.15s",
          ...(hovered ? { borderColor: "var(--color-arcano)" } : {}),
        }}
        title={condition.name}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{condition.icon}</span>
        {isGm && onRemove && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            style={{
              fontSize: "0.65rem",
              lineHeight: 1,
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
              padding: "0 2px",
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#E07070" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)" }}
          >
            ×
          </span>
        )}
      </button>
      {hovered && (
        <TooltipPortal anchor={ref.current}>
          <ConditionTooltip condition={condition} />
        </TooltipPortal>
      )}
    </>
  )
}

function AddConditionModal({
  onAdd,
  onClose,
}: {
  onAdd: (c: Condition) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<ConditionFormState>({ ...DEFAULT_FORM })

  function updateEffect(idx: number, patch: Partial<EffectRow>) {
    setForm((prev) => {
      const effects = [...prev.effects]
      effects[idx] = { ...effects[idx], ...patch }
      return { ...prev, effects }
    })
  }

  function addEffect() {
    setForm((prev) => ({
      ...prev,
      effects: [...prev.effects, { field: "fortitude", value: "0" }],
    }))
  }

  function removeEffect(idx: number) {
    setForm((prev) => ({
      ...prev,
      effects: prev.effects.filter((_, i) => i !== idx),
    }))
  }

  function handleSubmit() {
    if (!form.name.trim()) return
    const effects: ConditionEffect[] = form.advanced
      ? form.effects
          .filter((e) => e.value !== "" && e.value !== "0")
          .map((e) => {
            if (e.field === "dano") return { field: "dano" as const, value: e.value }
            return { field: e.field as Exclude<ConditionEffectField, 'dano'>, value: Number(e.value) }
          })
      : []
    onAdd({ id: generateId(), name: form.name.trim(), icon: form.icon, description: form.description.trim(), effects })
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(4,6,12,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.5rem",
          width: "100%",
          maxWidth: 420,
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-arcano)",
          }}
        >
          Nova Condição
        </p>

        {/* Nome */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={labelStyle}>Nome</label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="ex: Amaldiçoado"
            style={inputStyle}
          />
        </div>

        {/* Ícone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={labelStyle}>Ícone</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {CONDITION_ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                style={{
                  fontSize: "1.3rem",
                  background: form.icon === emoji ? "rgba(200,146,42,0.18)" : "transparent",
                  border: `1px solid ${form.icon === emoji ? "var(--color-arcano)" : "transparent"}`,
                  borderRadius: 4,
                  padding: "0.2rem 0.3rem",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={labelStyle}>Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descreva o efeito narrativo…"
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Modo avançado toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={form.advanced}
            onChange={(e) => setForm((p) => ({ ...p, advanced: e.target.checked }))}
            style={{ accentColor: "var(--color-arcano)", width: 14, height: 14 }}
          />
          Modo avançado (efeitos mecânicos)
        </label>

        {/* Efeitos (modo avançado) */}
        {form.advanced && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={labelStyle}>Efeitos</label>
            {form.effects.map((row, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <select
                  value={row.field}
                  onChange={(e) => updateEffect(idx, { field: e.target.value as ConditionEffectField | 'dano' })}
                  style={{ ...inputStyle, flex: 2, padding: "0.35rem 0.5rem" }}
                >
                  {ALL_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {EFFECT_FIELD_LABELS[f]}
                    </option>
                  ))}
                </select>
                <input
                  value={row.value}
                  onChange={(e) => updateEffect(idx, { value: e.target.value })}
                  placeholder={row.field === "dano" ? "+1" : "0"}
                  style={{ ...inputStyle, flex: 1, padding: "0.35rem 0.5rem" }}
                />
                <button
                  onClick={() => removeEffect(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,100,100,0.7)",
                    cursor: "pointer",
                    fontSize: "1rem",
                    lineHeight: 1,
                    padding: "0 0.25rem",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addEffect}
              style={{
                background: "rgba(200,146,42,0.08)",
                border: "1px dashed var(--color-arcano)",
                borderRadius: 4,
                color: "var(--color-arcano)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.72rem",
                cursor: "pointer",
                padding: "0.35rem",
                letterSpacing: "0.06em",
              }}
            >
              + Adicionar efeito
            </button>
          </div>
        )}

        {/* Ações */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            style={{
              ...confirmBtnStyle,
              opacity: form.name.trim() ? 1 : 0.4,
              cursor: form.name.trim() ? "pointer" : "not-allowed",
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.8rem",
  padding: "0.45rem 0.65rem",
  outline: "none",
  width: "100%",
}

const cancelBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 4,
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.72rem",
  cursor: "pointer",
  padding: "0.45rem 0.9rem",
}

const confirmBtnStyle: React.CSSProperties = {
  background: "rgba(200,146,42,0.15)",
  border: "1px solid var(--color-arcano)",
  borderRadius: 4,
  color: "var(--color-arcano)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.72rem",
  fontWeight: 700,
  padding: "0.45rem 0.9rem",
}

export function ConditionsSection({
  conditions,
  isGm,
  onAddCondition,
  onRemoveCondition,
}: {
  conditions: Condition[]
  isGm: boolean
  onAddCondition?: (c: Condition) => void
  onRemoveCondition?: (id: string) => void
}) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
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
          Condições
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
          {conditions.length === 0 && !isGm && (
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.72rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              Nenhuma condição ativa
            </span>
          )}
          {conditions.map((c) => (
            <ConditionChip
              key={c.id}
              condition={c}
              isGm={isGm}
              onRemove={onRemoveCondition ? () => onRemoveCondition(c.id) : undefined}
            />
          ))}
          {isGm && onAddCondition && (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                background: "rgba(200,146,42,0.08)",
                border: "1px dashed var(--color-arcano)",
                borderRadius: 6,
                color: "var(--color-arcano)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.8rem",
                lineHeight: 1,
                cursor: "pointer",
                padding: "0.3rem 0.5rem",
                transition: "background 0.15s",
              }}
              title="Adicionar condição"
            >
              +
            </button>
          )}
        </div>
      </div>

      {modalOpen && onAddCondition && (
        <AddConditionModal
          onAdd={onAddCondition}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
