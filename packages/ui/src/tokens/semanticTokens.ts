export const semanticTokens = {
  colors: {
    /* TEXT */
    text: {
      value: {
        base: "{colors.tertiary.900}",
        _dark: "{colors.tertiary.50}",
      },
    },

    "text-muted": {
      value: {
        base: "{colors.tertiary.400}",
        _dark: "{colors.tertiary.300}",
      },
    },

    /* BACKGROUNDS */
    bg: {
      value: {
        base: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    "bg-muted": {
      value: {
        base: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.800}",
      },
    },

    /* BORDERS */
    border: {
      value: {
        base: "{colors.secondary.300}",
        _dark: "{colors.secondary.700}",
      },
    },

    "border-muted": {
      value: {
        base: "{colors.secondary.100}",
        _dark: "{colors.secondary.800}",
      },
    },

    /* BUTTONS — PRIMARY */
    "button.primary.bg": {
      value: {
        base: "{colors.primary.500}",
        _dark: "{colors.primary.500}",
      },
    },

    "button.primary.fg": {
      value: {
        base: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.50}",
      },
    },

    "button.primary.hover-bg": {
      value: {
        base: "{colors.primary.600}",
        _dark: "{colors.primary.600}",
      },
    },

    /* BUTTONS — SECONDARY */
    "button.secondary.bg": {
      value: {
        base: "transparent",
        _dark: "transparent",
      },
    },

    "button.secondary.fg": {
      value: {
        base: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    "button.secondary.border": {
      value: {
        base: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    "button.secondary.hover-bg": {
      value: {
        base: "rgba(1,121,111,0.06)",
        _dark: "rgba(69,255,212,0.10)",
      },
    },

    /* BUTTONS — TERTIARY */
    "button.tertiary.fg": {
      value: {
        base: "{colors.primary.500}",
        _dark: "{colors.accent.600}",
      },
    },

    "button.tertiary.hover-bg": {
      value: {
        base: "rgba(1,121,111,0.08)",
        _dark: "rgba(69,255,212,0.08)",
      },
    },


   "button.primary.shadow": {
      value: {
        base: "{shadows.card}",
        _dark: "{shadows.card}"
      }
    },

    "button.secondary.shadow": {
      value: {
        base: "{shadows.surface}",
        _dark: "{shadows.surface}"
      }
    },

    "button.tertiary.shadow": {
      value: {
        base: "none",
        _dark: "none"
      }
    },



    /* INPUTS */
    "input.bg": {
      value: {
        base: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    "input.fg": {
      value: {
        base: "{colors.tertiary.900}",
        _dark: "{colors.tertiary.50}",
      },
    },

    "input.border": {
      value: {
        base: "{colors.primary.500}",
        _dark: "{colors.primary.600}",
      },
    },

    "input.focus-border": {
      value: {
        base: "{colors.primary.400}",
        _dark: "{colors.accent.600}",
      },
    },

    "input.placeholder": {
      value: {
        base: "{colors.tertiary.400}",
        _dark: "{colors.tertiary.300}",
      },
    },

    /* SURFACES */
    surface: {
      value: {
        base: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    "surface-elevated": {
      value: {
        base: "{colors.tertiary.100}",
        _dark: "{colors.tertiary.800}",
      },
    },

    /* CARDS */
    "card.bg": {
      value: {
        base: "{colors.tertiary.50}",
        _dark: "{colors.tertiary.900}",
      },
    },

    "card.border": {
      value: {
        base: "{colors.secondary.100}",
        _dark: "{colors.secondary.800}",
      },
    },

    "card.shadow": {
      value: {
        base: "{colors.glow.blue}",
        _dark: "{colors.glow.cyan}",
      },
    },
  },
};
