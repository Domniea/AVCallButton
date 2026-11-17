import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { createButton } from "@gluestack-ui/core/button/creator";

/**
 * Gluestack headless Button → RN primitives (no NativeWind).
 * Style via `style` / children so LogBox stays readable.
 */
export const Button: any = createButton({
  Root: Pressable as any,
  Text: Text as any,
  Group: View as any,
  Spinner: ActivityIndicator as any,
  Icon: View as any,
});
