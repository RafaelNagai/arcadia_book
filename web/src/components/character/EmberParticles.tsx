import { useEffect, useRef } from "react";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

export function EmberParticles({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [r, g, b] = hexToRgb(color);
    const embers: Ember[] = [];
    let rafId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawn = () => {
      embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - Math.random() * canvas.height * 0.08,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -(Math.random() * 0.6 + 0.7),
        size: Math.random() * 4.2 + 0.8,
        life: 0,
        maxLife: Math.floor(Math.random() * 1070 + 55),
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.17) spawn();
      if (Math.random() < 0.05) spawn();

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
          continue;
        }

        e.x += e.vx + Math.sin(e.life * 0.09 + i) * 0.25;
        e.y += e.vy;
        e.vy -= 0.01;

        const t = e.life / e.maxLife;
        const alpha = t < 0.1 ? t / 0.1 : 1 - ((t - 0.1) / 0.9) ** 0.7;
        const radius = e.size * (1 - t * 0.5);

        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radius * 4);
        grad.addColorStop(0, `rgba(${r},${g},${b},${(alpha * 0.85).toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${(alpha * 0.25).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(e.x, e.y, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.75).toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    />
  );
}
