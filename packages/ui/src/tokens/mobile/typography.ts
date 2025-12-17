import { fontFamilies, fontWeights } from "@av/ui/src/tokens/foundation/typography";

export const nativeFontConfig = {
  "sans-serif": {
    400: { normal: "sans-serif" },
    500: { normal: "sans-serif-medium" },
    600: { normal: "sans-serif-medium" },
    700: { normal: "sans-serif-medium" },
  },
  monospace: {
    400: { normal: "monospace" },
  },
};

export const nativeFonts = {
  heading: fontFamilies.heading,
  body: fontFamilies.body,
  mono: fontFamilies.mono,
};

export const nativeFontWeights = fontWeights;
