import React, { forwardRef, useMemo, useState } from "react";
import {
  View,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  Modal,
  ActivityIndicator,
  Switch as RNSwitch,
  ViewProps,
  TextProps as RNTextProps,
  PressableProps as RNPressableProps,
  ScrollViewProps as RNScrollViewProps,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from "react-native";
import { useColorMode, useColorModeValue } from "../../../providers/ColorModeProvider";
import {
  viewStyleFromProps,
  textStyleFromProps,
  restNativeProps,
  StylePropBag,
} from "./styleProps";
import { spaceValue, resolveColor, fontSizeValue, FONT_SIZES } from "./tokens";

export { useColorMode, useColorModeValue };

export type IBoxProps = StylePropBag & ViewProps;
export type IInputProps = RNTextInputProps & {
  type?: "text" | "password";
  InputRightElement?: React.ReactNode;
  _focus?: StylePropBag;
  bg?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string | number;
  fontFamily?: string;
  fontSize?: string | number;
  py?: string | number;
  px?: string | number;
  height?: string | number;
  w?: string | number;
  placeholderTextColor?: string;
};

function useMode() {
  return useColorMode().colorMode;
}

export const Box = forwardRef<View, IBoxProps>(function Box(props, ref) {
  const mode = useMode();
  const { style, children, ...rest } = props;
  const viewStyle = viewStyleFromProps(rest as StylePropBag, mode);
  const native = restNativeProps(rest as StylePropBag);
  return (
    <View ref={ref} style={[viewStyle, style as object]} {...(native as ViewProps)}>
      {children as React.ReactNode}
    </View>
  );
});

type StackProps = IBoxProps & { space?: string | number };

function Stack({
  direction,
  space,
  style,
  children,
  ...rest
}: StackProps & { direction: "row" | "column" }) {
  const mode = useMode();
  const gap = spaceValue(space);
  const viewStyle = viewStyleFromProps(
    { ...rest, flexDir: direction, gap: gap ?? rest.gap } as StylePropBag,
    mode,
  );
  const native = restNativeProps(rest as StylePropBag);
  return (
    <View style={[viewStyle, style as object]} {...(native as ViewProps)}>
      {children as React.ReactNode}
    </View>
  );
}

export function VStack(props: StackProps) {
  return <Stack direction="column" {...props} />;
}

export function HStack(props: StackProps) {
  return <Stack direction="row" {...props} />;
}

export function Text({
  style,
  children,
  numberOfLines,
  ...rest
}: StylePropBag & RNTextProps) {
  const mode = useMode();
  const textStyle = textStyleFromProps(rest, mode);
  const native = restNativeProps(rest);
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[textStyle, style as object]}
      {...(native as RNTextProps)}
    >
      {children}
    </RNText>
  );
}

export function Pressable({
  style,
  children,
  _pressed,
  disabled,
  isDisabled,
  ...rest
}: StylePropBag &
  RNPressableProps & {
    _pressed?: StylePropBag;
    isDisabled?: boolean;
  }) {
  const mode = useMode();
  const base = viewStyleFromProps(rest, mode);
  const pressedStyle = _pressed
    ? viewStyleFromProps(_pressed, mode)
    : undefined;
  const native = restNativeProps(rest);

  return (
    <RNPressable
      disabled={disabled ?? isDisabled}
      style={({ pressed }) => [
        base,
        pressed && pressedStyle,
        typeof style === "function" ? style({ pressed }) : (style as object),
      ]}
      {...(native as RNPressableProps)}
    >
      {children as React.ReactNode}
    </RNPressable>
  );
}

export const ScrollView = forwardRef<
  RNScrollView,
  StylePropBag & RNScrollViewProps
>(function ScrollView(props, ref) {
  const mode = useMode();
  const {
    style,
    contentContainerStyle,
    children,
    keyboardShouldPersistTaps = "handled",
    ...rest
  } = props;
  const viewStyle = viewStyleFromProps(rest as StylePropBag, mode);
  const native = restNativeProps(rest as StylePropBag);
  return (
    <RNScrollView
      ref={ref}
      style={[viewStyle, style as object]}
      contentContainerStyle={
        contentContainerStyle as RNScrollViewProps["contentContainerStyle"]
      }
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...(native as RNScrollViewProps)}
    >
      {children as React.ReactNode}
    </RNScrollView>
  );
});

export function Spinner({
  color,
  size = "large",
  ...rest
}: StylePropBag & { color?: string; size?: "small" | "large" | number }) {
  const mode = useMode();
  const { palette } = useColorMode();
  const resolved = color
    ? resolveColor(color, mode) ?? palette.primary
    : palette.primary;
  const viewStyle = viewStyleFromProps(rest, mode);
  return (
    <View style={viewStyle}>
      <ActivityIndicator
        color={resolved}
        size={size === "small" || size === "large" ? size : "large"}
      />
    </View>
  );
}

export function Switch({
  isChecked,
  onToggle,
  ...rest
}: {
  isChecked?: boolean;
  onToggle?: () => void;
} & StylePropBag) {
  const { palette } = useColorMode();
  return (
    <RNSwitch
      value={!!isChecked}
      onValueChange={() => onToggle?.()}
      trackColor={{ false: palette.border, true: palette.primary }}
      {...(restNativeProps(rest) as object)}
    />
  );
}

export function Icon({
  as: AsComp,
  name,
  size = "md",
  color,
  style,
  ...rest
}: StylePropBag & {
  as?: React.ComponentType<any>;
  name?: string;
  size?: string | number;
}) {
  const mode = useMode();
  const resolved = resolveColor(color, mode);
  const px =
    typeof size === "number"
      ? size
      : size === "sm"
        ? 16
        : size === "lg"
          ? 28
          : size === "xl"
            ? 32
            : 22;
  const margin = viewStyleFromProps(rest, mode);
  if (!AsComp) return null;
  return (
    <AsComp
      name={name}
      size={px}
      color={resolved}
      style={[margin, style as object]}
    />
  );
}

export const Input = forwardRef<RNTextInput, IInputProps>(function Input(
  props,
  ref,
) {
  const mode = useMode();
  const {
    style,
    type,
    InputRightElement,
    _focus,
    secureTextEntry,
    placeholderTextColor,
    onFocus,
    onBlur,
    value,
    onChangeText,
    editable,
    autoCapitalize,
    autoCorrect,
    autoComplete,
    keyboardType,
    returnKeyType,
    placeholder,
    maxLength,
    multiline,
    numberOfLines,
    textContentType,
    ...rest
  } = props;
  const [focused, setFocused] = useState(false);

  // Visual chrome on the row wrapper (border/bg/radius/height)
  const chromeProps: StylePropBag = {
    bg: rest.bg,
    borderColor: rest.borderColor,
    borderWidth: rest.borderWidth ?? 1,
    borderRadius: rest.borderRadius,
    height: rest.height ?? rest.h ?? 50,
    px: rest.px ?? 4,
    shadow: focused ? rest.shadow : undefined,
  };
  const chrome = viewStyleFromProps(chromeProps, mode);
  const focusChrome =
    focused && _focus ? viewStyleFromProps(_focus as StylePropBag, mode) : null;

  const color = resolveColor(rest.color, mode);
  const placeholderColor =
    typeof placeholderTextColor === "string"
      ? resolveColor(placeholderTextColor, mode)
      : undefined;
  const fontSize =
    fontSizeValue(rest.fontSize) ?? FONT_SIZES.lg;
  const padY = spaceValue(rest.py ?? 3) ?? 12;

  const isSecure =
    secureTextEntry ?? (type === "password" ? true : false);

  return (
    <View
      style={[
        styles.inputRow,
        chrome,
        focusChrome,
        { flexDirection: "row", alignItems: "center" },
      ]}
    >
      <RNTextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textContentType={textContentType}
        placeholderTextColor={placeholderColor}
        secureTextEntry={isSecure}
        style={[
          {
            flex: 1,
            alignSelf: "stretch",
            color,
            fontSize,
            paddingVertical: padY,
            paddingHorizontal: 0,
            margin: 0,
            // Ensure a real hit target even if parent height fails
            minHeight: 44,
          },
          style as object,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {InputRightElement as React.ReactNode}
    </View>
  );
});

type ActionsheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

function ActionsheetRoot({ isOpen, onClose, children }: ActionsheetProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetRoot}>
        <RNPressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheetWrap}>{children}</View>
      </View>
    </Modal>
  );
}

function ActionsheetContent({
  children,
  ...rest
}: StylePropBag & { children?: React.ReactNode }) {
  const mode = useMode();
  const style = viewStyleFromProps(rest, mode);
  return (
    <View style={[styles.sheetContent, style]}>{children}</View>
  );
}

function ActionsheetItem({
  children,
  onPress,
  isDisabled,
  _pressed,
  ...rest
}: StylePropBag & {
  onPress?: () => void;
  isDisabled?: boolean;
  _pressed?: StylePropBag;
  children?: React.ReactNode;
}) {
  const mode = useMode();
  const base = viewStyleFromProps(
    { py: 3, px: 4, ...rest } as StylePropBag,
    mode,
  );
  const pressedStyle = _pressed
    ? viewStyleFromProps(_pressed, mode)
    : { backgroundColor: resolveColor("blackAlpha.50", mode) };

  return (
    <RNPressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && pressedStyle]}
    >
      {children}
    </RNPressable>
  );
}

export const Actionsheet = Object.assign(ActionsheetRoot, {
  Content: ActionsheetContent,
  Item: ActionsheetItem,
});

const styles = StyleSheet.create({
  inputRow: {
    borderWidth: 1,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetWrap: {
    width: "100%",
  },
  sheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 8,
    maxHeight: "80%",
  },
});
