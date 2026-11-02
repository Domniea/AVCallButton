import React from "react";
import { Actionsheet, Text, useColorModeValue } from "native-base";

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

function BaseBottomSheetItemRow({
  label,
  onPress,
  isDisabled,
  destructive,
}: Omit<BaseBottomSheetItem, "key">) {
  const defaultFg = useColorModeValue("text", "textDark");
  const dangerFg = useColorModeValue("red.600", "red.300");
  const pressedBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  return (
    <Actionsheet.Item
      onPress={onPress}
      isDisabled={isDisabled}
      _pressed={{ bg: pressedBg }}
      justifyContent="center"
    >
      <Text
        fontFamily="heading"
        fontSize="md"
        fontWeight="medium"
        color={destructive ? dangerFg : defaultFg}
        textAlign="center"
      >
        {label}
      </Text>
    </Actionsheet.Item>
  );
}

/**
 * Mobile bottom sheet / action menu built on NativeBase Actionsheet.
 * Use `items` for simple option lists (camera / library / files), or
 * `children` for custom sheet content.
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
  const titleColor = useColorModeValue("muted", "mutedDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const cancelFg = useColorModeValue("muted", "mutedDark");
  const pressedBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  const handleItemPress = (item: BaseBottomSheetItem) => {
    item.onPress();
    if (closeOnItemPress) onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <Actionsheet.Content bg={surface}>
        {title ? (
          <Text
            w="100%"
            px={4}
            py={2}
            fontSize="sm"
            color={titleColor}
            textAlign="center"
          >
            {title}
          </Text>
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
            _pressed={{ bg: pressedBg }}
            justifyContent="center"
          >
            <Text
              fontFamily="heading"
              fontSize="md"
              fontWeight="medium"
              color={cancelFg}
              textAlign="center"
            >
              {cancelLabel}
            </Text>
          </Actionsheet.Item>
        ) : null}
      </Actionsheet.Content>
    </Actionsheet>
  );
}

BaseBottomSheet.Item = BaseBottomSheetItemRow;
