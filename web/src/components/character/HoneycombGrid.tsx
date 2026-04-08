const HEX_R = 14;
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

export function HoneycombGrid({
  total,
  current,
  colorTop,
  colorBottom,
  label,
  accentColor,
  onCellClick,
}: {
  total: number;
  current: number;
  colorTop: string;
  colorBottom: string;
  label: string;
  accentColor: string;
  onCellClick?: (idx: number) => void;
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
    cells.push({
      cx: col * HEX_W + (isOddRow ? HEX_W / 2 : 0) + HEX_W / 2 + 2,
      cy: row * ROW_SPACING + HEX_R + 2,
      row,
      idx: i,
    });
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-2">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: accentColor, fontFamily: "var(--font-ui)" }}
        >
          {label}
        </p>
        <span className="font-display font-bold text-3xl" style={{ color: "#EEF4FC" }}>
          {current}
        </span>
        <span
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
          }}
        >
          / {total}
        </span>
      </div>

      {onCellClick && (
        <div className="flex items-center gap-2 mb-3">
          <button
            disabled={current <= 0}
            onClick={() => onCellClick(current - 1)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: current > 0 ? `${accentColor}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${current > 0 ? accentColor + "55" : "rgba(255,255,255,0.08)"}`,
              color: current > 0 ? accentColor : "rgba(255,255,255,0.18)",
              fontFamily: "var(--font-ui)",
              fontSize: "1rem",
              lineHeight: 1,
              cursor: current > 0 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            −
          </button>
          <button
            disabled={current >= total}
            onClick={() => onCellClick(current)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: current < total ? `${accentColor}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${current < total ? accentColor + "55" : "rgba(255,255,255,0.08)"}`,
              color: current < total ? accentColor : "rgba(255,255,255,0.18)",
              fontFamily: "var(--font-ui)",
              fontSize: "1rem",
              lineHeight: 1,
              cursor: current < total ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            +
          </button>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ou clique no hexágono
          </span>
        </div>
      )}

      <svg
        width={svgW}
        height={svgH}
        style={{
          display: "block",
          overflow: "visible",
          cursor: onCellClick ? "pointer" : "default",
        }}
      >
        {cells.map(({ cx, cy, row, idx }) => {
          const alive = idx < current;
          const gradientT = totalRows > 1 ? row / (totalRows - 1) : 1;
          return (
            <polygon
              key={idx}
              points={hexPoints(cx, cy)}
              fill={
                alive
                  ? lerpHex(colorTop, colorBottom, gradientT)
                  : "rgba(255,255,255,0.05)"
              }
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
