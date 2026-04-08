import type { CSSProperties } from "react";
import type { WeightCategory } from "@/data/characterTypes";
import catalogData from "@equipment";

/* ─── Catalog ───────────────────────────────────────────────────── */

export interface CatalogEntry {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  tier: string;
  damage: string | null;
  weight: WeightCategory;
  isEquipment: boolean;
  maxDurability: number | null;
  effects: string[];
  description: string;
  image: string | null;
}

export const CATALOG: CatalogEntry[] = catalogData as CatalogEntry[];

export const TIER_COLOR: Record<string, string> = {
  SS: "#E8B84B",
  S:  "#C8922A",
  A:  "#C090F0",
  B:  "#50C8E8",
  C:  "#6FC892",
  D:  "#A09880",
  E:  "#6A7080",
};

/* ─── Helpers ───────────────────────────────────────────────────── */

export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const WEIGHT_OPTIONS: { value: WeightCategory; num: number }[] = [
  { value: "nulo",          num: 0  },
  { value: "super_leve",    num: 1  },
  { value: "leve",          num: 2  },
  { value: "medio",         num: 4  },
  { value: "pesado",        num: 8  },
  { value: "super_pesado",  num: 16 },
  { value: "massivo",       num: 32 },
  { value: "hyper_massivo", num: 64 },
];

/** Resolve a catalog image path (relative to public/) to a web URL. */
export function resolveCatalogImage(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `/${path}`;
}

/* ─── Shared styles ─────────────────────────────────────────────── */

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-ui)",
  fontSize: "0.6rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "0.3rem",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  color: "#EEF4FC",
  fontFamily: "var(--font-ui)",
  fontSize: "0.85rem",
  padding: "0.4rem 0.55rem",
  outline: "none",
  boxSizing: "border-box",
};

/* ─── Item form data ────────────────────────────────────────────── */

export interface ItemFormData {
  name: string;
  description: string;
  weight: WeightCategory;
  isEquipment: boolean;
  maxDurability: number;
  image: string;
  damage: string;
  effects: string[];
}

export const DEFAULT_FORM: ItemFormData = {
  name: "",
  description: "",
  weight: "medio",
  isEquipment: false,
  maxDurability: 5,
  image: "",
  damage: "",
  effects: [],
};
