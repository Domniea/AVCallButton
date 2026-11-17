import { useColorMode } from "../providers/ColorModeProvider";

/**
 * App-facing semantic colors as resolved hex values.
 * Keys preserved from the NativeBase era for screen compatibility.
 */
export function useThemeColors() {
  const { palette } = useColorMode();
  return palette;
}
