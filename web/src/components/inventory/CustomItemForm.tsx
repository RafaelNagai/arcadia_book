import type { WeightCategory } from "@/data/characterTypes"
import { WEIGHT_LABELS } from "@/data/characterTypes"
import { WEIGHT_OPTIONS, labelStyle, inputStyle } from "./types"
import type { ItemFormData } from "./types"

export function CustomItemForm({
  form,
  onChange,
  nameError,
  onNameErrorClear,
  isEdit,
  initial,
  accentColor,
}: {
  form: ItemFormData
  onChange: (updater: (prev: ItemFormData) => ItemFormData) => void
  nameError: boolean
  onNameErrorClear: () => void
  isEdit: boolean
  initial?: ItemFormData
  accentColor: string
}) {
  return (
    <div>
      {/* Name */}
      <label style={{ display: "block", marginBottom: "0.875rem" }}>
        <span style={labelStyle}>Nome *</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            onNameErrorClear()
            onChange((f) => ({ ...f, name: e.target.value }))
          }}
          placeholder="Ex: Espada do Viajante"
          style={{
            ...inputStyle,
            borderColor: nameError
              ? "rgba(200,60,60,0.7)"
              : "rgba(255,255,255,0.12)",
          }}
          autoFocus={isEdit}
        />
        {nameError && (
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              color: "#D04040",
              marginTop: 3,
              display: "block",
            }}
          >
            O nome é obrigatório
          </span>
        )}
      </label>

      {/* Description */}
      <label style={{ display: "block", marginBottom: "0.875rem" }}>
        <span style={labelStyle}>Descrição</span>
        <textarea
          value={form.description}
          onChange={(e) => onChange((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descreva o item..."
          rows={2}
          style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
        />
      </label>

      {/* Damage */}
      <label style={{ display: "block", marginBottom: "0.875rem" }}>
        <span style={labelStyle}>Damage</span>
        <input
          type="text"
          value={form.damage}
          onChange={(e) => onChange((f) => ({ ...f, damage: e.target.value }))}
          placeholder="Ex: 2D6, 1D8+2..."
          style={inputStyle}
        />
      </label>

      {/* DA */}
      <label style={{ display: "block", marginBottom: "0.875rem" }}>
        <span style={labelStyle}>DA (Defesa)</span>
        <input
          type="text"
          value={form.da}
          onChange={(e) => onChange((f) => ({ ...f, da: e.target.value }))}
          placeholder="Ex: 3, +1..."
          style={{ ...inputStyle, width: 120 }}
        />
      </label>

      {/* Effects */}
      <div style={{ marginBottom: "0.875rem" }}>
        <span style={labelStyle}>Efeitos</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {form.effects.map((effect, i) => (
            <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <input
                type="text"
                value={effect}
                onChange={(e) =>
                  onChange((f) => {
                    const next = [...f.effects]
                    next[i] = e.target.value
                    return { ...f, effects: next }
                  })
                }
                placeholder={`Efeito ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() =>
                  onChange((f) => ({
                    ...f,
                    effects: f.effects.filter((_, idx) => idx !== i),
                  }))
                }
                style={{
                  background: "none",
                  border: "1px solid rgba(200,60,60,0.3)",
                  borderRadius: 4,
                  color: "rgba(200,60,60,0.6)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange((f) => ({ ...f, effects: [...f.effects, ""] }))}
            style={{
              background: `${accentColor}0D`,
              border: `1px dashed ${accentColor}44`,
              borderRadius: 4,
              color: accentColor,
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.35rem 0.6rem",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            + Adicionar efeito
          </button>
        </div>
      </div>

      {/* Weight */}
      <label style={{ display: "block", marginBottom: "0.875rem" }}>
        <span style={labelStyle}>Peso</span>
        <select
          value={form.weight}
          onChange={(e) =>
            onChange((f) => ({ ...f, weight: e.target.value as WeightCategory }))
          }
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {WEIGHT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "#0A0F1E" }}>
              {WEIGHT_LABELS[o.value]} ({o.num})
            </option>
          ))}
        </select>
      </label>

      {/* isEquipment */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.875rem",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={form.isEquipment}
          onChange={(e) => onChange((f) => ({ ...f, isEquipment: e.target.checked }))}
          style={{ width: 14, height: 14, accentColor }}
        />
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Possui durabilidade (equipamento)
        </span>
      </label>

      {/* maxDurability */}
      {form.isEquipment && (
        <label style={{ display: "block", marginBottom: "0.875rem" }}>
          <span style={labelStyle}>Durabilidade Máxima</span>
          <input
            type="number"
            min={1}
            max={99}
            value={form.maxDurability}
            onChange={(e) =>
              onChange((f) => ({
                ...f,
                maxDurability: Math.max(1, parseInt(e.target.value) || 1),
              }))
            }
            style={{ ...inputStyle, width: 80 }}
          />
        </label>
      )}

      {/* Image URL */}
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={labelStyle}>URL da imagem</span>
        <input
          type="url"
          value={form.image}
          onChange={(e) => onChange((f) => ({ ...f, image: e.target.value }))}
          placeholder={
            isEdit && initial && !initial.image
              ? "Deixe em branco para manter a imagem original"
              : "https://..."
          }
          style={inputStyle}
        />
        {form.image && (
          <div
            style={{
              marginTop: "0.5rem",
              borderRadius: 4,
              overflow: "hidden",
              height: 80,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <img
              src={form.image}
              alt="preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        )}
      </label>
    </div>
  )
}
