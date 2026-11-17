import { View, TextInput, Pressable } from "react-native";
import { createInput } from "@gluestack-ui/core/input/creator";

/**
 * Gluestack headless Input → RN primitives (no NativeWind).
 * Structure: <Input><Input.Input /><Input.Slot /></Input>
 */
export const Input: any = createInput({
  Root: View as any,
  Icon: View as any,
  Slot: Pressable as any,
  Input: TextInput as any,
});
