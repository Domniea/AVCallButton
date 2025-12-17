// import { fontFamilies, fontWeights } from "@av/ui/src/tokens/foundation/typography";

// export const nativeFontConfig = {
//   "sans-serif": {
//     400: { normal: "sans-serif" },
//     500: { normal: "sans-serif-medium" },
//     600: { normal: "sans-serif-medium" },
//     700: { normal: "sans-serif-medium" },
//   },
//   monospace: {
//     400: { normal: "monospace" },
//   },
// };

// export const nativeFonts = {
//   heading: fontFamilies.heading,
//   body: fontFamilies.body,
//   mono: fontFamilies.mono,
// };

// export const nativeFontWeights = fontWeights;


import { fontFamilies, fontWeights } from "../foundation/typography";

export const nativeFontFamilies = {
  heading: fontFamilies.heading.value,
  body: fontFamilies.body.value,
  mono: fontFamilies.mono.value,
};

export const nativeFontWeights = {
  normal: fontWeights.normal.value,
  medium: fontWeights.medium.value,
  semibold: fontWeights.semibold.value,
  bold: fontWeights.bold.value,
};

export const nativeFontConfig = {
  [nativeFontFamilies.body]: {
    400: { normal: nativeFontFamilies.body },
    500: { normal: nativeFontFamilies.body },
    600: { normal: nativeFontFamilies.body },
    700: { normal: nativeFontFamilies.body },
  },
  [nativeFontFamilies.mono]: {
    400: { normal: nativeFontFamilies.mono },
  },
};