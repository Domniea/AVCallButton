import { PropsWithChildren } from "react";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { ColorModeProvider, useColorMode } from "./ColorModeProvider";

function GluestackThemeBridge({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();
  return (
    <GluestackUIProvider mode={colorMode}>{children}</GluestackUIProvider>
  );
}

export function GluestackProviderWrapper({ children }: PropsWithChildren) {
  return (
    <ColorModeProvider>
      <GluestackThemeBridge>{children}</GluestackThemeBridge>
    </ColorModeProvider>
  );
}
