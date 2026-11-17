import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Actionsheet, useTokenColor } from "./ui/gluestack";
import { useColorMode } from "../providers/ColorModeProvider";

export type BaseBottomSheetItem = {
  key: string;
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  /** Renders the label in a destructive (danger) color */
  destructive?: boolean;
};

type BaseBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Convenience list of action rows. Ignored when `children` is provided. */
  items?: BaseBottomSheetItem[];
  /** Custom sheet body. Prefer this for non-menu content. */
  children?: React.ReactNode;
  cancelLabel?: string;
  showCancel?: boolean;
  /** Close the sheet after an item `onPress` (default true). */
  closeOnItemPress?: boolean;
};

function pressedWash(mode: "light" | "dark") {
  return mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.04)";
}

function BaseBottomSheetItemRow({
  label,
  onPress,
  isDisabled,
  destructive,
}: Omit<BaseBottomSheetItem, "key">) {
  const defaultFg = useTokenColor("text", "textDark");
  const dangerFg = useTokenColor("red.600", "red.300");
  const { colorMode } = useColorMode();
  const [pressed, setPressed] = useState(false);

  return (
    <Actionsheet.Item
      onPress={onPress}
      isDisabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.item,
        pressed ? { backgroundColor: pressedWash(colorMode) } : null,
      ]}
    >
      <Actionsheet.ItemText
        style={[
          styles.itemText,
          { color: destructive ? dangerFg : defaultFg },
        ]}
      >
        {label}
      </Actionsheet.ItemText>
    </Actionsheet.Item>
  );
}

/**
 * Mobile bottom sheet / action menu (Gluestack Actionsheet, no NativeWind).
 * Use `items` for simple option lists, or `children` for custom content.
 */
export function BaseBottomSheet({
  isOpen,
  onClose,
  title,
  items,
  children,
  cancelLabel = "Cancel",
  showCancel = true,
  closeOnItemPress = true,
}: BaseBottomSheetProps) {
  const titleColor = useTokenColor("textMuted", "textMutedDark");
  const surface = useTokenColor("surface", "surfaceDark");
  const cancelFg = useTokenColor("textMuted", "textMutedDark");
  const { colorMode } = useColorMode();
  const [cancelPressed, setCancelPressed] = useState(false);

  const handleItemPress = (item: BaseBottomSheetItem) => {
    item.onPress();
    if (closeOnItemPress) onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose} useRNModal>
      <Actionsheet.Backdrop style={styles.backdrop} />
      <Actionsheet.Content style={[styles.content, { backgroundColor: surface }]}>
        <Actionsheet.DragIndicatorWrapper style={styles.indicatorWrap}>
          <Actionsheet.DragIndicator style={styles.indicator} />
        </Actionsheet.DragIndicatorWrapper>

        {title ? (
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        ) : null}

        {children
          ? children
          : items?.map((item) => (
              <BaseBottomSheetItemRow
                key={item.key}
                label={item.label}
                isDisabled={item.isDisabled}
                destructive={item.destructive}
                onPress={() => handleItemPress(item)}
              />
            ))}

        {showCancel ? (
          <Actionsheet.Item
            onPress={onClose}
            onPressIn={() => setCancelPressed(true)}
            onPressOut={() => setCancelPressed(false)}
            style={[
              styles.item,
              cancelPressed
                ? { backgroundColor: pressedWash(colorMode) }
                : null,
            ]}
          >
            <Actionsheet.ItemText style={[styles.itemText, { color: cancelFg }]}>
              {cancelLabel}
            </Actionsheet.ItemText>
          </Actionsheet.Item>
        ) : null}
      </Actionsheet.Content>
    </Actionsheet>
  );
}

BaseBottomSheet.Item = BaseBottomSheetItemRow;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 8,
    maxHeight: "80%",
  },
  indicatorWrap: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.45)",
  },
  title: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: "center",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
