import type { WeightCategory } from "@/data/characterTypes";
import { WEIGHT_VALUES, WEIGHT_LABELS } from "@/data/characterTypes";

export function WeightBadge({ weight }: { weight: WeightCategory }) {
  const val = WEIGHT_VALUES[weight];
  const label = WEIGHT_LABELS[weight];
  const color =
    val === 0
      ? "rgba(255,255,255,0.25)"
      : val <= 2
        ? "#6EC840"
        : val <= 8
          ? "#C8922A"
          : "#C05050";

  return (
    <span
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.55rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 3,
        padding: "1px 5px",
        flexShrink: 0,
      }}
    >
      {label} · {val}
    </span>
  );
}
