import { useState } from "react"
import { motion } from "framer-motion"
import { DEFAULT_FORM } from "./types"
import type { CatalogEntry, ItemFormData } from "./types"
import { CatalogTab } from "./CatalogTab"
import { CustomItemForm } from "./CustomItemForm"

type ModalTab = "catalog" | "custom"

export function ItemModal({
  initial,
  isEdit,
  onConfirm,
  onSelectCatalog,
  onCancel,
  accentColor,
}: {
  initial?: ItemFormData
  isEdit: boolean
  onConfirm: (data: ItemFormData) => void
  onSelectCatalog?: (entry: CatalogEntry) => void
  onCancel: () => void
  accentColor: string
}) {
  const [tab, setTab] = useState<ModalTab>(isEdit ? "custom" : "catalog")
  const [form, setForm] = useState<ItemFormData>(initial ?? DEFAULT_FORM)
  const [nameError, setNameError] = useState(false)

  function handleConfirm() {
    if (!form.name.trim()) {
      setNameError(true)
      return
    }
    onConfirm(form)
  }

  const confirmBtnStyle: React.CSSProperties = {
    background: accentColor + "22",
    border: `1px solid ${accentColor}88`,
    borderRadius: 4,
    color: accentColor,
    fontFamily: "var(--font-ui)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
  }

  const cancelBtnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 4,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "var(--font-ui)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        style={{
          background: "#0A0F1E",
          border: "1px solid rgba(42,58,96,0.9)",
          borderRadius: 8,
          width: 420,
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ padding: "1.1rem 1.25rem 0", flexShrink: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#EEF4FC",
              marginBottom: "0.9rem",
            }}
          >
            {isEdit ? "Editar Item" : "Adicionar ao Inventário"}
          </p>

          {!isEdit && (
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {(["catalog", "custom"] as ModalTab[]).map((t) => {
                const active = tab === t
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: active
                        ? `2px solid ${accentColor}`
                        : "2px solid transparent",
                      color: active ? accentColor : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      padding: "0.45rem 0.75rem",
                      cursor: "pointer",
                      marginBottom: -1,
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {t === "catalog" ? "Catálogo" : "Personalizado"}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>
          {tab === "catalog" ? (
            <CatalogTab onSelectCatalog={onSelectCatalog} accentColor={accentColor} />
          ) : (
            <CustomItemForm
              form={form}
              onChange={setForm}
              nameError={nameError}
              onNameErrorClear={() => setNameError(false)}
              isEdit={isEdit}
              initial={initial}
              accentColor={accentColor}
            />
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <button onClick={onCancel} style={cancelBtnStyle}>
            Cancelar
          </button>
          {(tab === "custom" || isEdit) && (
            <button onClick={handleConfirm} style={confirmBtnStyle}>
              {isEdit ? "Salvar" : "Adicionar"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
