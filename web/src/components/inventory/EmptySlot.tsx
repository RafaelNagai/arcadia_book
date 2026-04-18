export function EmptySlot({
  onClick,
  accentColor,
}: {
  onClick?: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: 5,
        padding: "0.9rem 0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        width: "100%",
        textAlign: "center",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${accentColor}0A`;
        e.currentTarget.style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.015)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span
        style={{ fontSize: "1rem", color: `${accentColor}66`, lineHeight: 1 }}
      >
        +
      </span>
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        Slot vazio
      </span>
    </button>
  );
}
