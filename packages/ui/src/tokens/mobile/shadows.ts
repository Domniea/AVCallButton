export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },

  surface: {
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },

  inset: {
    // RN doesn't support inset shadows natively
    shadowColor: "transparent",
    elevation: 0,
  },
};
