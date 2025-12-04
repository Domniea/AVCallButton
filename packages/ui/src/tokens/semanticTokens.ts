export const semanticTokens = {
  colors: {
    text: {
      value: {
        _light: "{colors.primary.900}",
        _dark: "{colors.tertiary.50}",
      },
    },

    textMuted: {
      value: {
        _light: "{colors.secondary.500}",
        _dark: "{colors.secondary.300}",
      },
    },

    bg: {
      value: {
        _light: "{colors.tertiary.50}",
        _dark: "{colors.primary.900}",
      },
    },

    bgMuted: {
      value: {
        _light: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.800}",
      },
    },

    surface: {
      value: {
        _light: "{colors.light.surface}",
        _dark: "{colors.tertiary.800}",
      },
    },

    surfaceElevated: {
      value: {
        _light: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.700}",
      },
    },

    cardBg: {
      value: {
        _light: "{colors.light.surface}",
        _dark: "{colors.secondary.600}",
      },
    },

    cardBorder: {
      value: {
        _light: "{colors.secondary.200}",
        _dark: "{colors.secondary.700}",
      },
    },

    inputBg: {
      value: {
        _light: "{colors.light.surface}",
        _dark: "{colors.tertiary.700}",
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
        _dark: "{colors.accent.600}",
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
        _light: "{colors.secondary.500}",
        _dark: "{colors.secondary.400}",
      },
    },

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
  },

  shadows: {
    card: {
      value: {
        _light: "0 6px 18px rgba(0,0,0,0.15)",
        _dark: "0 10px 30px rgba(0,0,0,0.60)",
      },
    },

    surface: {
      value: {
        _light: "0 2px 8px rgba(0,0,0,0.10)",
        _dark: "0 4px 16px rgba(0,0,0,0.45)",
      },
    },

    inset: {
      value: {
        _light: "inset 0 2px 4px rgba(0,0,0,0.20)",
        _dark: "inset 0 2px 4px rgba(0,0,0,0.40)",
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
        _light: "0 8px 24px rgba(0,0,0,0.18)",
        _dark: "0 8px 24px rgba(0,0,0,0.50)",
      },
    },

    /* NEW REQUIRED SHADOWS */
buttonPrimaryShadow: {
  value: {
    _light: "0 3px 10px rgba(0,0,0,0.22)",
    _dark:  "0 4px 14px rgba(0,0,0,0.55), 0 0 8px rgba(69,255,212,0.35)",
  },
},


    buttonSecondaryShadow: {
      value: {
        _light: "0 3px 10px rgba(0,0,0,0.18)",
        _dark: "0 3px 12px rgba(0,0,0,0.40)",
      },
    },

    buttonTertiaryShadow: {
      value: {
        _light: "0 0 0 rgba(0,0,0,0)",
        _dark: "0 0 0 rgba(0,0,0,0)",
      },
    },

    inputShadow: {
      value: {
        _light: "inset 0 1px 2px rgba(0,0,0,0.12)",
        _dark: "inset 0 1px 2px rgba(0,0,0,0.35)",
      },
    },
  },
};
