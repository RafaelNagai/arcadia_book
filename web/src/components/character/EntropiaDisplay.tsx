/** One shape per Entropia level, matching the die that level adds to the roll. */
const LEVELS: { level: number; die: number; color: string; points: string }[] = [
  { level: 1, die: 4, color: "#7dd8f0", points: "12,2 20.66,17 3.34,17" },
  {
    level: 2,
    die: 8,
    color: "#90d8a8",
    points:
      "21.24,15.83 15.83,21.24 8.17,21.24 2.76,15.83 2.76,8.17 8.17,2.76 15.83,2.76 21.24,8.17",
  },
  {
    level: 3,
    die: 12,
    color: "#d0a8f8",
    points: "12,2 21.51,8.91 17.88,20.09 6.12,20.09 2.49,8.91",
  },
  {
    level: 4,
    die: 20,
    color: "#f07080",
    points: "12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7",
  },
];

export function EntropiaDiceRow({
  value,
  onEntropiaChange,
}: {
  value: number;
  onEntropiaChange?: (newValue: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {LEVELS.map(({ level, die, color, points }) => {
        const active = value === level;
        return (
          <button
            key={level}
            onClick={
              onEntropiaChange
                ? () => onEntropiaChange(active ? 0 : level)
                : undefined
            }
            title={`Entropia ${level} — D${die}`}
            style={{
              padding: 0,
              width: 22,
              height: 22,
              background: "transparent",
              border: "none",
              cursor: onEntropiaChange ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width="100%" height="100%">
              <polygon
                points={points}
                fill={active ? `${color}33` : "transparent"}
                stroke={active ? color : "rgba(200,210,230,0.3)"}
                strokeWidth={active ? 1.6 : 1.2}
                style={{
                  filter: active ? `drop-shadow(0 0 3px ${color}CC)` : "none",
                  transition: "all 0.15s",
                }}
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
