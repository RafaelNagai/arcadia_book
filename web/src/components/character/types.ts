export type Accent = { text: string; bg: string; glow: string };

export const ELEMENT_COLORS: Record<string, Accent> = {
  Energia:   { text: "#E8803A", bg: "rgba(200,90,32,0.18)",   glow: "rgba(232,128,58,0.45)"  },
  Anomalia:  { text: "#6FC892", bg: "rgba(42,155,111,0.18)",  glow: "rgba(111,200,146,0.45)" },
  Paradoxo:  { text: "#50C8E8", bg: "rgba(32,143,168,0.18)",  glow: "rgba(80,200,232,0.45)"  },
  Astral:    { text: "#C090F0", bg: "rgba(107,63,160,0.18)",  glow: "rgba(192,144,240,0.45)" },
  Cognitivo: { text: "#E8B84B", bg: "rgba(200,146,42,0.18)",  glow: "rgba(232,184,75,0.45)"  },
};

export const DEFAULT_ACCENT: Accent = {
  text: "#C8E0F0",
  bg:   "rgba(32,96,160,0.18)",
  glow: "rgba(200,224,240,0.3)",
};

export const ELEMENT_DATA: Record<string, { essence: string }> = {
  Energia:   { essence: "Criação e Manifestação dos Elementos"  },
  Anomalia:  { essence: "Mutação e Transmutação da Matéria"     },
  Paradoxo:  { essence: "Distorção e Manipulação de Conceitos"  },
  Astral:    { essence: "Trânsito entre Planos de Existência"   },
  Cognitivo: { essence: "Controle da Mente e dos Sentidos"      },
};

export function getAccent(element: string | null | undefined): Accent {
  return element ? (ELEMENT_COLORS[element] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT;
}
