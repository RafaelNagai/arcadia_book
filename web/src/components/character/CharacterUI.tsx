import type { ReactNode } from "react";

export function Tag({
  children,
  color,
  bg,
}: {
  children: ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
      style={{
        color,
        background: bg,
        border: `1px solid ${color}44`,
        fontFamily: "var(--font-ui)",
      }}
    >
      {children}
    </span>
  );
}

export function EditBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: 4,
        color: "rgba(255,255,255,0.4)",
        fontFamily: "var(--font-ui)",
        fontSize: "0.6rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        padding: "0.25rem 0.6rem",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#EEF4FC";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      ✎ {label}
    </button>
  );
}

export function SectionLabel({
  children,
  accent,
  onEdit,
  edits,
}: {
  children: ReactNode;
  accent: string;
  onEdit?: () => void;
  edits?: { label: string; fn: () => void }[];
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 3,
          height: 16,
          background: accent,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <p
        className="text-xs font-semibold uppercase tracking-[0.22em]"
        style={{ color: accent, fontFamily: "var(--font-ui)" }}
      >
        {children}
      </p>
      {onEdit && <EditBtn label="" onClick={onEdit} />}
      {edits &&
        edits.map((e) => (
          <EditBtn key={e.label} label={e.label} onClick={e.fn} />
        ))}
    </div>
  );
}
