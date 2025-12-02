// import { shadows } from "./foundation";

// export const semanticTokens = {
//   colors: {
//     /* TEXT */
//     text: {
//       value: {
//         _light: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.50}",
//       },
//     },

//     "text-muted": {
//       value: {
//         base: "{colors.tertiary.400}",
//         _dark: "{colors.tertiary.300}",
//       },
//     },

//     /* BACKGROUNDS */
//     bg: {
//       value: {
//         base: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.900}",
//       },
//     },

//     "bg-muted": {
//       value: {
//         base: "{colors.tertiary.100}",
//         _dark: "{colors.tertiary.800}",
//       },
//     },

//     /* BORDERS */
//     border: {
//       value: {
//         base: "{colors.secondary.300}",
//         _dark: "{colors.secondary.700}",
//       },
//     },

//     "border-muted": {
//       value: {
//         base: "{colors.secondary.100}",
//         _dark: "{colors.secondary.800}",
//       },
//     },

//     /* BUTTONS — PRIMARY */
//     "button.primary.bg": {
//       value: {
//         base: "{colors.primary.500}",
//         _dark: "{colors.primary.500}",
//       },
//     },

//     "button.primary.fg": {
//       value: {
//         base: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.50}",
//       },
//     },

//     "button.primary.hover-bg": {
//       value: {
//         base: "{colors.primary.600}",
//         _dark: "{colors.primary.600}",
//       },
//     },

//     /* BUTTONS — SECONDARY */
//     "button.secondary.bg": {
//       value: {
//         base: "transparent",
//         _dark: "transparent",
//       },
//     },

//     "button.secondary.fg": {
//       value: {
//         base: "{colors.primary.500}",
//         _dark: "{colors.accent.600}",
//       },
//     },

//     "button.secondary.border": {
//       value: {
//         base: "{colors.primary.500}",
//         _dark: "{colors.accent.600}",
//       },
//     },

//     "button.secondary.hover-bg": {
//       value: {
//         base: "rgba(1,121,111,0.06)",
//         _dark: "rgba(69,255,212,0.10)",
//       },
//     },

//     /* BUTTONS — TERTIARY */
//     "button.tertiary.fg": {
//       value: {
//         base: "{colors.primary.500}",
//         _dark: "{colors.accent.600}",
//       },
//     },

//     "button.tertiary.hover-bg": {
//       value: {
//         base: "rgba(1,121,111,0.08)",
//         _dark: "rgba(69,255,212,0.08)",
//       },
//     },


//    "button.primary.shadow": {
//       value: {
//         base: "{shadows.card}",
//         _dark: "{shadows.card}"
//       }
//     },

//     "button.secondary.shadow": {
//       value: {
//         base: "{shadows.surface}",
//         _dark: "{shadows.surface}"
//       }
//     },

//     "button.tertiary.shadow": {
//       value: {
//         base: "none",
//         _dark: "none"
//       }
//     },



//     /* INPUTS */
//     "input.bg": {
//       value: {
//         base: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.900}",
//       },
//     },

//     "input.fg": {
//       value: {
//         base: "{colors.tertiary.900}",
//         _dark: "{colors.tertiary.50}",
//       },
//     },

//     "input.border": {
//       value: {
//         base: "{colors.primary.500}",
//         _dark: "{colors.primary.600}",
//       },
//     },

//     "input.focus-border": {
//       value: {
//         base: "{colors.primary.400}",
//         _dark: "{colors.accent.600}",
//       },
//     },

//     "input.placeholder": {
//       value: {
//         base: "{colors.tertiary.400}",
//         _dark: "{colors.tertiary.300}",
//       },
//     },

//     /* SURFACES */
//     surface: {
//       value: {
//         base: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.900}",
//       },
//     },

//     "surface-elevated": {
//       value: {
//         base: "{colors.tertiary.100}",
//         _dark: "{colors.tertiary.800}",
//       },
//     },

//     /* CARDS */
//     "card.bg": {
//       value: {
//         base: "{colors.tertiary.50}",
//         _dark: "{colors.tertiary.900}",
//       },
//     },

//     "card.border": {
//       value: {
//         base: "{colors.secondary.100}",
//         _dark: "{colors.secondary.800}",
//       },
//     },

//     "card.shadow": {
//       value: {
//         base: "{colors.glow.blue}",
//         _dark: "{colors.glow.cyan}",
//       },
//     },
//   },
//   shadows: {
//         cardShadow: {
//         value: {
//           _light: "0 4px 12px rgba(0,0,0,0.14",

//     },
//    },
//   }
// };
export const semanticTokens = {
  colors: {
    /* TEXT */
    text: {
      value: {
        _light: "{colors.primary.900}",
        _dark: "{colors.tertiary.50}",
      },
    },

    textMuted: {
      value: {
        _light: "{colors.tertiary.400}",
        _dark: "{colors.tertiary.300}",
      },
    },

    /* BACKGROUNDS */
    bg: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    bgMuted: {
      value: {
        _light: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.800}",
      },
    },

    /* BORDERS */
    border: {
      value: {
        _light: "{colors.secondary.300}",
        _dark: "{colors.secondary.600}",
      },
    },

    borderMuted: {
      value: {
        _light: "{colors.secondary.100}",
        _dark: "{colors.secondary.700}",
      },
    },

    /* BUTTON — PRIMARY */
    buttonPrimaryBg: {
      value: {
        _light: "{colors.primary.500}",
        _dark: "{colors.primary.500}",
      },
    },

    buttonPrimaryFg: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.50}",
      },
    },

    buttonPrimaryHoverBg: {
      value: {
        _light: "{colors.primary.600}",
        _dark: "{colors.primary.600}",
      },
    },

    /* BUTTON — SECONDARY */
    buttonSecondaryBg: {
      value: {
        _light: "transparent",
        _dark: "transparent",
      },
    },

    buttonSecondaryFg: {
      value: {
        _light: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    buttonSecondaryBorder: {
      value: {
        _light: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    buttonSecondaryHoverBg: {
      value: {
        _light: "rgba(1,121,111,0.06)",
        _dark: "rgba(69,255,212,0.10)",
      },
    },

    /* BUTTON — TERTIARY */
    buttonTertiaryFg: {
      value: {
        _light: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    buttonTertiaryHoverBg: {
      value: {
        _light: "rgba(1,121,111,0.08)",
        _dark: "rgba(69,255,212,0.08)",
      },
    },

    /* INPUTS */
    inputBg: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    inputFg: {
      value: {
        _light: "{colors.tertiary.900}",
        _dark: "{colors.tertiary.50}",
      },
    },

    inputBorder: {
      value: {
        _light: "{colors.primary.500}",
        _dark: "{colors.primary.600}",
      },
    },

    inputFocusBorder: {
      value: {
        _light: "{colors.primary.400}",
        _dark: "{colors.accent.600}",
      },
    },

    inputPlaceholder: {
      value: {
        _light: "{colors.tertiary.400}",
        _dark: "{colors.tertiary.300}",
      },
    },

    /* SURFACES */
    surface: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    surfaceElevated: {
      value: {
        _light: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.800}",
      },
    },

    /* CARDS */
    cardBg: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    cardBorder: {
      value: {
        _light: "{colors.secondary.100}",
        _dark: "{colors.secondary.800}",
      },
    },
  },

  /* SHADOWS */
  shadows: {
    /* CARD SHADOW */
    card: {
      value: {
        _light: "0 4px 12px rgba(0,0,0,0.14)",
        _dark: "0 4px 12px rgba(0,0,0,0.40)",
      },
    },

    /* BUTTON SHADOWS */
    buttonPrimary: {
      value: {
        _light: "0 4px 14px rgba(87,115,255,0.45)",
        _dark: "0 4px 14px rgba(87,115,255,0.65)",
      },
    },

    buttonSecondary: {
      value: {
        _light: "0 4px 12px rgba(0,0,0,0.18)",
        _dark: "0 4px 12px rgba(0,0,0,0.45)",
      },
    },

    buttonTertiary: {
      value: {
        _light: "0 0 0 rgba(0,0,0,0)",
        _dark: "0 0 0 rgba(0,0,0,0)",
      },
    },

    /* GENERAL USE */
    surface: {
      value: {
        _light: "0 2px 8px rgba(0,0,0,0.10)",
        _dark: "0 2px 8px rgba(0,0,0,0.32)",
      },
    },

    inset: {
      value: {
        _light: "inset 0 2px 4px rgba(0,0,0,0.25)",
        _dark: "inset 0 2px 4px rgba(0,0,0,0.45)",
      },
    },

    subtle: {
      value: {
        _light: "0 1px 3px rgba(0,0,0,0.12)",
        _dark: "0 1px 3px rgba(0,0,0,0.30)",
      },
    },

    outer: {
      value: {
        _light: "0 6px 20px rgba(0,0,0,0.20)",
        _dark: "0 6px 20px rgba(0,0,0,0.45)",
      },
    },
  },
};
