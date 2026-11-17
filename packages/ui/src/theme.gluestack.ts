import * as foundation from "./tokens/foundation";
import { semanticTokens } from "./tokens/semanticTokens";
import { convertTokens, convertSemanticTokens } from "./convertTokens";

/** Flat foundation + semantic colors matching NativeBase mobileTokens.colors */
export const resolvedColors = {
  ...convertTokens(foundation.colors),
  ...convertSemanticTokens(semanticTokens.colors, foundation.colors),
} as Record<string, string>;

/** Standard danger reds used across screens (not in brand tokens) */
export const dangerColors = {
  "red.300": "#FCA5A5",
  "red.500": "#EF4444",
  "red.600": "#DC2626",
} as const;

export type ColorMode = "light" | "dark";

type ShadeScale = Record<string, string>;

function shade(scale: unknown, key: string, fallback: string): string {
  if (scale && typeof scale === "object" && key in scale) {
    const v = (scale as ShadeScale)[key];
    if (typeof v === "string") return v;
  }
  return fallback;
}

/**
 * App-facing semantic palette for a given color mode.
 * Keys match useThemeColors() return shape.
 */
export function getSemanticPalette(mode: ColorMode) {
  const dark = mode === "dark";
  return {
    bg: (dark ? resolvedColors.bgDark : resolvedColors.bg) as string,
    surface: (dark ? resolvedColors.surfaceDark : resolvedColors.surface) as string,
    text: (dark ? resolvedColors.textDark : resolvedColors.text) as string,
    muted: (dark
      ? resolvedColors.textMutedDark
      : resolvedColors.textMuted) as string,
    textMuted: (dark
      ? resolvedColors.textMutedDark
      : resolvedColors.textMuted) as string,
    border: (dark
      ? resolvedColors.cardBorderDark
      : resolvedColors.cardBorder) as string,
    primary: dark
      ? shade(resolvedColors.accent, "600", "#45FFD4")
      : shade(resolvedColors.primary, "500", "#01796F"),
    primarySoft: dark
      ? shade(resolvedColors.primary, "900", "#002624")
      : shade(resolvedColors.primary, "100", "#B3E5DF"),
  };
}

/** Resolve nested foundation path like primary.500 from resolvedColors */
export function resolveColorToken(
  token: string,
  mode: ColorMode = "light",
): string {
  if (token.startsWith("#") || token.startsWith("rgb") || token === "transparent") {
    return token;
  }

  if (token in dangerColors) {
    return dangerColors[token as keyof typeof dangerColors];
  }

  // Semantic with Dark suffix for dark mode
  if (mode === "dark") {
    const darkKey = `${token}Dark`;
    const darkValue = resolvedColors[darkKey];
    if (typeof darkValue === "string") return darkValue;
  }
  const direct = resolvedColors[token];
  if (typeof direct === "string") return direct;

  // Nested foundation: primary.500 → resolvedColors.primary["500"]
  const parts = token.split(".");
  let current: unknown = resolvedColors;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return token;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "string") return current;

  return token;
}

/** Hex → "R G B" channels for NativeWind / Gluestack CSS vars */
export function hexToRgbChannels(hex: string): string | null {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 8) {
    // ignore alpha nibble for solid CSS vars
  }
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(cleaned)) {
    return null;
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function channelsOrFallback(value: string, fallback: string): string {
  if (value === "transparent") return "0 0 0";
  const rgb = hexToRgbChannels(value);
  if (rgb) return rgb;
  // rgba(...) — extract rgb if possible
  const m = value.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (m) return `${m[1]} ${m[2]} ${m[3]}`;
  return fallback;
}

/**
 * Gluestack / NativeWind CSS variable maps for light & dark.
 * Preserves our semantic names as custom tokens alongside mapped shadcn keys.
 */
export function buildGluestackCssVars(mode: ColorMode): Record<string, string> {
  const dark = mode === "dark";
  const c = resolvedColors;
  const primary = dark
    ? (c.accent?.["600"] as string) ?? "#45FFD4"
    : (c.primary?.["500"] as string) ?? "#01796F";
  const primaryFg = (c.tertiary?.["50"] as string) ?? "#F2F2F2";
  const bg = dark ? c.bgDark : c.bg;
  const text = dark ? c.textDark : c.text;
  const muted = dark ? c.textMutedDark : c.textMuted;
  const surface = dark ? c.surfaceDark : c.surface;
  const cardBg = dark ? c.cardBgDark : c.cardBg;
  const border = dark ? c.cardBorderDark : c.cardBorder;
  const accent = (c.accent?.["600"] as string) ?? "#45FFD4";

  const secondary = dark
    ? ((c.tertiary as Record<string, string> | undefined)?.["700"] ?? "#3A3A3A")
    : ((c.secondary as Record<string, string> | undefined)?.["50"] ?? "#F0F4F9");
  const primarySoft = dark
    ? ((c.primary as Record<string, string> | undefined)?.["900"] ?? "#002624")
    : ((c.primary as Record<string, string> | undefined)?.["100"] ?? "#B3E5DF");
  const accentFg =
    (c.primary as Record<string, string> | undefined)?.["900"] ?? "#002624";

  const vars: Record<string, string> = {
    // shadcn-style keys Gluestack components expect
    "--background": channelsOrFallback(bg ?? "#F2F2F2", "242 242 242"),
    "--foreground": channelsOrFallback(text ?? "#002624", "0 38 36"),
    "--primary": channelsOrFallback(primary, "1 121 111"),
    "--primary-foreground": channelsOrFallback(primaryFg, "242 242 242"),
    "--secondary": channelsOrFallback(secondary, "240 244 249"),
    "--secondary-foreground": channelsOrFallback(text ?? "#002624", "0 38 36"),
    "--accent": channelsOrFallback(accent, "69 255 212"),
    "--accent-foreground": channelsOrFallback(accentFg, "0 38 36"),
    "--muted": channelsOrFallback(
      (dark ? c.bgMutedDark : c.bgMuted) ?? "#DCDCDC",
      "220 220 220",
    ),
    "--muted-foreground": channelsOrFallback(muted ?? "#5E7083", "94 112 131"),
    "--destructive": channelsOrFallback(
      dark ? dangerColors["red.300"] : dangerColors["red.500"],
      "239 68 68",
    ),
    "--card": channelsOrFallback(cardBg ?? "#FFFFFF", "255 255 255"),
    "--popover": channelsOrFallback(surface ?? "#FFFFFF", "255 255 255"),
    "--popover-foreground": channelsOrFallback(text ?? "#002624", "0 38 36"),
    "--border": channelsOrFallback(border ?? "#C4D2E3", "196 210 227"),
    "--input": channelsOrFallback(
      (dark ? c.inputBorderDark : c.inputBorder) ?? "#01796F",
      "1 121 111",
    ),
    "--ring": channelsOrFallback(primary, "1 121 111"),

    // Our semantic aliases (same meanings as packages/ui tokens)
    "--av-bg": channelsOrFallback(bg ?? "#F2F2F2", "242 242 242"),
    "--av-surface": channelsOrFallback(surface ?? "#FFFFFF", "255 255 255"),
    "--av-text": channelsOrFallback(text ?? "#002624", "0 38 36"),
    "--av-muted": channelsOrFallback(muted ?? "#5E7083", "94 112 131"),
    "--av-border": channelsOrFallback(border ?? "#C4D2E3", "196 210 227"),
    "--av-primary": channelsOrFallback(primary, "1 121 111"),
    "--av-primary-soft": channelsOrFallback(primarySoft, "179 229 223"),
  };

  // Foundation scale as CSS vars for className usage: --av-primary-500 etc.
  for (const [scale, shades] of Object.entries(foundation.colors)) {
    if (scale === "overlay" || scale === "glow" || scale === "light") continue;
    if (typeof shades !== "object") continue;
    for (const [shade, token] of Object.entries(
      shades as Record<string, { value: string }>,
    )) {
      const hex = token?.value;
      if (!hex || typeof hex !== "string") continue;
      const ch = hexToRgbChannels(hex);
      if (ch) {
        vars[`--av-${scale}-${shade}`] = ch;
      }
    }
  }

  return vars;
}

/** Flat hex palette for JS (nav, icons) — light mode keys + *Dark variants */
export const gluestackResolvedPalette = {
  ...resolvedColors,
  ...dangerColors,
};

/** Convenience: semantic colors for light and dark as hex */
export const semanticPaletteByMode = {
  light: getSemanticPalette("light"),
  dark: getSemanticPalette("dark"),
};
