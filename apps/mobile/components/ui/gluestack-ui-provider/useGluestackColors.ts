import { useColorMode } from "../../../providers/ColorModeProvider";
import { buildGluestackCssVars } from "@av/ui";

function rgbChannelsToHex(channels: string): string {
  const parts = channels.trim().split(/\s+/);
  if (parts.length !== 3) return "#000000";
  const [r, g, b] = parts.map((s) => {
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, Math.min(255, n));
  });
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toCamelCase(str: string): string {
  return str
    .replace(/^--/, "")
    .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export type GluestackColors = Record<string, string>;

/** Hex map of theme CSS-var keys for the active color mode (no NativeWind). */
export function useGluestackColors(): GluestackColors {
  const { colorMode } = useColorMode();
  const theme = buildGluestackCssVars(colorMode);
  const result: GluestackColors = {};
  for (const [key, value] of Object.entries(theme)) {
    result[toCamelCase(key)] = rgbChannelsToHex(value);
  }
  return result;
}

export function useCalendarTheme(): Record<string, string> {
  const { palette } = useColorMode();
  return {
    backgroundColor: palette.bg,
    calendarBackground: palette.bg,
    textSectionTitleColor: palette.muted,
    selectedDayBackgroundColor: palette.primary,
    selectedDayTextColor: "#F2F2F2",
    todayTextColor: palette.primary,
    todayBackgroundColor: palette.primarySoft,
    dayTextColor: palette.text,
    textDisabledColor: palette.muted,
    dotColor: palette.primary,
    selectedDotColor: "#F2F2F2",
    arrowColor: palette.text,
    monthTextColor: palette.text,
    indicatorColor: palette.primary,
  };
}
