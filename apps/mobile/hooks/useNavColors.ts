import { useThemeColors } from "./useThemeColors";
import { useColorMode } from "../providers/ColorModeProvider";
import { getSemanticPalette } from "@av/ui";

/** Navigation chrome colors from semantic palette (hex). */
export function useNavColors() {
  const { colorMode } = useColorMode();
  const palette = getSemanticPalette(colorMode);
  const theme = useThemeColors();

  return {
    headerBg: palette.surface,
    headerTint: palette.text,
    contentBg: palette.bg,
    tabBarBg: palette.surface,
    tabActive: theme.primary,
    tabInactive: colorMode === "dark" ? "#C4D2E3" : "#4E5D6E",
    tabBorder: palette.border,
    navThemeColors: {
      background: palette.bg,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: theme.primary,
    },
  };
}
