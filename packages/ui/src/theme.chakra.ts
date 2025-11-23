import { createSystem, defineConfig } from "@chakra-ui/react";
import { tokens } from "./tokens";

const config = defineConfig({
  theme: {
    tokens: {
      colors: tokens.colors,
      radii: tokens.radii,
      spacing: tokens.spacing,
      fonts: {
        heading: tokens.fonts.heading,
        body: tokens.fonts.body,
      },
    },
  },
});

export const chakraTheme = createSystem(config);
