import { spacing } from "../foundation/spacing";

export const webSpacing = Object.fromEntries(
  Object.entries(spacing).map(([key, token]) => [key, `${token.value}px`])
);
