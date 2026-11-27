import { resolveColorToken, type ColorMode } from "@av/ui";

export const SPACE: Record<string | number, number> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const FONT_SIZES: Record<string, number> = {
  "2xs": 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128,
};

export const RADII: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FONT_WEIGHTS: Record<string, "400" | "500" | "600" | "700" | "800"> =
  {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  };

/** NativeBase blackAlpha / whiteAlpha → rgba */
const ALPHA: Record<string, string> = {
  "blackAlpha.50": "rgba(0,0,0,0.04)",
  "blackAlpha.100": "rgba(0,0,0,0.06)",
  "whiteAlpha.50": "rgba(255,255,255,0.04)",
  "whiteAlpha.100": "rgba(255,255,255,0.10)",
  "error.500": "#EF4444",
  "error.600": "#DC2626",
};

export function spaceValue(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return SPACE[v] ?? v;
  if (typeof v === "string") {
    if (v.endsWith("px")) return parseFloat(v);
    if (v.endsWith("%")) return undefined; // handled as string dimension
    if (v in SPACE) return SPACE[v];
    const n = Number(v);
    if (!Number.isNaN(n)) return SPACE[n] ?? n;
  }
  return undefined;
}

export function sizeValue(
  v: unknown,
): number | `${number}%` | "100%" | "auto" | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return SPACE[v] ?? v;
  if (typeof v === "string") {
    if (v === "full" || v === "100%") return "100%";
    if (v === "auto") return "auto";
    if (v.endsWith("px")) return parseFloat(v);
    if (v.endsWith("%")) return v as `${number}%`;
    if (v in SPACE) return SPACE[v];
    const n = Number(v);
    if (!Number.isNaN(n)) return SPACE[n] ?? n;
  }
  return undefined;
}

export function radiusValue(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string" && v in RADII) return RADII[v];
  return undefined;
}

export function fontSizeValue(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string" && v in FONT_SIZES) return FONT_SIZES[v];
  return undefined;
}

export function resolveColor(token: unknown, mode: ColorMode): string | undefined {
  if (token == null) return undefined;
  if (typeof token !== "string") return undefined;
  if (token in ALPHA) return ALPHA[token];
  return resolveColorToken(token, mode);
}
