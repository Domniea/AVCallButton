import { useColorModeValue } from "native-base";

export function useThemeColors() {
  const textMuted = useColorModeValue("textMuted", "textMutedDark");

  return {
    bg: useColorModeValue("bg", "bgDark"),
    surface: useColorModeValue("surface", "surfaceDark"),
    text: useColorModeValue("text", "textDark"),
    /** Secondary / caption text — use this instead of raw "muted" color tokens */
    muted: textMuted,
    textMuted,
    border: useColorModeValue("cardBorder", "cardBorderDark"),
    primary: useColorModeValue("primary.500", "accent.600"),
    primarySoft: useColorModeValue("primary.100", "primary.900"),
  };
}
