import { useColorMode } from "../../../providers/ColorModeProvider";
import { resolveColorToken } from "@av/ui";

/** Resolve a light/dark semantic token pair to hex for the active mode. */
export function useTokenColor(lightKey: string, darkKey: string): string {
  const { colorMode } = useColorMode();
  return resolveColorToken(colorMode === "dark" ? darkKey : lightKey, colorMode);
}

export function useTokenColorMode(lightKey: string, darkKey: string) {
  return useTokenColor(lightKey, darkKey);
}
