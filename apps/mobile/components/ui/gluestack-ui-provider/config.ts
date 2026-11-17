/**
 * Theme config without NativeWind `vars()`.
 * Importing `nativewind` registers cssInterop on Pressable/Text/View and
 * breaks React Native LogBox (white text, missing dark banner background).
 * Colors are resolved via @av/ui + ColorModeProvider instead.
 */
export const colors = {
  light: {},
  dark: {},
};

export const config = {
  light: {},
  dark: {},
};
