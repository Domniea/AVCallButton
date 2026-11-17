import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input, useTokenColor } from "./ui/gluestack";

interface BaseInputProps extends Omit<TextInputProps, "onChangeText" | "onBlur"> {
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  onBlur?: () => void;
  type?: "text" | "password";
}

export const BaseInput = forwardRef<RNTextInput, BaseInputProps>(
  function BaseInput(
    {
      label,
      helperText,
      error,
      value,
      onChangeText,
      onBlur,
      type,
      style,
      ...rest
    },
    ref,
  ) {
    const bg = useTokenColor("inputBg", "inputBgDark");
    const fg = useTokenColor("inputFg", "inputFgDark");
    const border = useTokenColor("inputBorder", "inputBorderDark");
    const placeholder = useTokenColor(
      "inputPlaceholder",
      "inputPlaceholderDark",
    );
    const focusBorder = useTokenColor(
      "inputFocusBorder",
      "inputFocusBorderDark",
    );
    const helperColor = useTokenColor("textMuted", "textMutedDark");
    const errorColor = useTokenColor("red.500", "red.500");

    const isError = Boolean(error);
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = type === "password";
    const { onFocus: onFocusProp, ...inputRest } = rest;

    const borderColor = isError
      ? errorColor
      : focused
        ? focusBorder
        : border;

    return (
      <View style={styles.stack}>
        {label ? (
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        ) : null}

        <Input
          isInvalid={isError}
          style={[
            styles.chrome,
            {
              backgroundColor: bg,
              borderColor,
            },
          ]}
        >
          <Input.Input
            ref={ref as any}
            {...inputRest}
            value={value ?? ""}
            onChangeText={onChangeText}
            placeholderTextColor={placeholder}
            type={isPassword && !show ? "password" : "text"}
            style={[styles.field, { color: fg }, style]}
            onFocus={(e: any) => {
              setFocused(true);
              onFocusProp?.(e);
            }}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
          />
          {isPassword ? (
            <Input.Slot
              onPress={() => setShow((prev) => !prev)}
              accessibilityRole="button"
              style={styles.slot}
            >
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={fg}
              />
            </Input.Slot>
          ) : null}
        </Input>

        {isError ? (
          <Text style={[styles.helper, { color: errorColor }]}>{error}</Text>
        ) : helperText ? (
          <Text style={[styles.helper, { color: helperColor }]}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  stack: {
    width: "100%",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  chrome: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
  },
  field: {
    flex: 1,
    alignSelf: "stretch",
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 44,
  },
  slot: {
    paddingLeft: 8,
    paddingRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  helper: {
    fontSize: 14,
  },
});
