import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { STEPS } from "./types";

/* ─── Image compression ─────────────────────────────────────────── */

const IMAGE_MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB original
const IMAGE_MAX_DIM = 1440; // px (largest side)
const IMAGE_JPEG_QUALITY = 0.9;

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(
        1,
        IMAGE_MAX_DIM / Math.max(img.width, img.height),
      );
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao carregar imagem"));
    };
    img.src = objectUrl;
  });
}

/* ─── Shared input style ────────────────────────────────────────── */

export const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 4,
  outline: "none",
  color: "#EEF4FC",
  fontFamily: "var(--font-ui)",
  fontSize: "0.9rem",
  transition: "border-color 0.15s",
};

/* ─── StepHeader ────────────────────────────────────────────────── */

export function StepHeader({
  current,
  onBack,
}: {
  current: number;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(4,10,20,0.93)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "0.75rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            ← {current === 1 ? "Sair" : "Voltar"}
          </button>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {current} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background:
                  s.id <= current
                    ? "var(--color-arcano)"
                    : "rgba(255,255,255,0.08)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <p
          style={{
            marginTop: 6,
            fontFamily: "var(--font-ui)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-arcano-dim)",
          }}
        >
          {STEPS[current - 1].label}
        </p>
      </div>
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────────────────── */

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            color: "var(--color-text-muted)",
            opacity: 0.7,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─── TextInput ─────────────────────────────────────────────────── */

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={baseInputStyle}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-arcano)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    />
  );
}

/* ─── Stepper ───────────────────────────────────────────────────── */

export function Stepper({
  value,
  min = 0,
  onChange,
  color = "var(--color-arcano)",
}: {
  value: number;
  min?: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 28,
    height: 32,
    borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: disabled ? "rgba(255,255,255,0.18)" : "#EEF4FC",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-ui)",
    fontSize: "1rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={btnStyle(value <= min)}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!isNaN(v) && v >= min) onChange(v);
        }}
        style={
          {
            width: 48,
            height: 32,
            textAlign: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            outline: "none",
            color,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            MozAppearance: "textfield",
          } as React.CSSProperties
        }
        onFocus={(e) => {
          e.target.style.borderColor = color;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      />
      <button onClick={() => onChange(value + 1)} style={btnStyle(false)}>
        +
      </button>
    </div>
  );
}

/* ─── TagInput ──────────────────────────────────────────────────── */

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  function add() {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          style={{ ...baseInputStyle, flex: 1 }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "var(--color-arcano)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "rgba(255,255,255,0.1)";
          }}
        />
        <button
          onClick={add}
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: 4,
            background: "rgba(200,146,42,0.15)",
            border: "1px solid rgba(200,146,42,0.3)",
            color: "var(--color-arcano-glow)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Adicionar
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {tag}
              <button
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.7rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── StatPill ──────────────────────────────────────────────────── */

export function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center px-3 py-2 rounded-sm"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}33`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.4rem",
          color,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── SectionDivider ────────────────────────────────────────────── */

export function SectionDivider({ label }: { label: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.65rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "1rem",
        marginTop: "1rem",
      }}
    >
      {label}
    </p>
  );
}

/* ─── ImageUpload ───────────────────────────────────────────────── */

type ImageUploadMode = "upload" | "url";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [mode, setMode] = useState<ImageUploadMode>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são aceitas.");
      return;
    }
    if (file.size > IMAGE_MAX_FILE_BYTES) {
      setError("Arquivo muito grande. Máximo: 5 MB.");
      return;
    }
    setLoading(true);
    try {
      onChange(await compressImageFile(file));
      setUrlInput("");
    } catch {
      setError("Falha ao processar imagem.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleUrlCommit() {
    const url = urlInput.trim();
    if (!url) return;
    onChange(url);
    setError(null);
  }

  function handleRemove() {
    onChange(null);
    setUrlInput("");
    setError(null);
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.35rem 0",
    borderRadius: 4,
    background: active ? "rgba(200,146,42,0.15)" : "transparent",
    border: `1px solid ${active ? "rgba(200,146,42,0.35)" : "rgba(255,255,255,0.08)"}`,
    color: active ? "var(--color-arcano-glow)" : "var(--color-text-muted)",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    transition: "all 0.15s",
  });

  return (
    <div className="space-y-3">
      {/* preview */}
      {value && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={value}
            alt="Personagem"
            style={{
              display: "block",
              width: 96,
              height: 96,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <button
            onClick={handleRemove}
            title="Remover imagem"
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(10,15,30,0.95)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* mode tabs */}
      <div className="flex gap-1.5">
        <button
          style={tabBtn(mode === "upload")}
          onClick={() => {
            setMode("upload");
            setError(null);
          }}
        >
          Arquivo
        </button>
        <button
          style={tabBtn(mode === "url")}
          onClick={() => {
            setMode("url");
            setError(null);
          }}
        >
          URL
        </button>
      </div>

      {/* upload zone */}
      {mode === "upload" && (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            height: 88,
            borderRadius: 6,
            border: `1px dashed ${loading ? "rgba(200,146,42,0.4)" : "rgba(255,255,255,0.12)"}`,
            background: "rgba(255,255,255,0.02)",
            cursor: loading ? "wait" : "pointer",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textAlign: "center",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "rgba(200,146,42,0.4)";
              e.currentTarget.style.background = "rgba(200,146,42,0.04)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = loading
              ? "rgba(200,146,42,0.4)"
              : "rgba(255,255,255,0.12)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
          {loading ? (
            <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>
              Processando…
            </span>
          ) : (
            <>
              <span style={{ fontSize: "1.4rem", opacity: 0.35 }}>↑</span>
              <span>Clique ou arraste uma imagem</span>
              <span style={{ opacity: 0.5 }}>JPG, PNG, WebP · máx. 5 MB</span>
            </>
          )}
        </label>
      )}

      {/* url input */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlCommit();
              }
            }}
            placeholder="https://…"
            style={{ ...baseInputStyle, flex: 1, fontSize: "0.8rem" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-arcano)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <button
            onClick={handleUrlCommit}
            disabled={!urlInput.trim()}
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: 4,
              background: urlInput.trim()
                ? "rgba(200,146,42,0.15)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${urlInput.trim() ? "rgba(200,146,42,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: urlInput.trim()
                ? "var(--color-arcano-glow)"
                : "rgba(255,255,255,0.2)",
              cursor: urlInput.trim() ? "pointer" : "not-allowed",
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            Aplicar
          </button>
        </div>
      )}

      {error && (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            color: "#E06060",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
