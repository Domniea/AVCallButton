import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";
import type { ColorMode } from "@av/ui";
import { getSemanticPalette } from "@av/ui";

type ColorModeContextValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  palette: ReturnType<typeof getSemanticPalette>;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

/**
 * App color mode lives in React state only.
 * Do NOT call NativeWind/Appearance setColorScheme — that flips the system
 * scheme and makes React Native LogBox banners unreadable (blank yellow bars).
 */
export function ColorModeProvider({ children }: PropsWithChildren) {
  const [colorMode, setColorModeState] = useState<ColorMode>("light");

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      colorMode,
      setColorMode,
      toggleColorMode,
      palette: getSemanticPalette(colorMode),
    }),
    [colorMode, setColorMode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}
