import React from "react";
import {
  Input,
  VStack,
  Text,
  IInputProps,
  useColorModeValue,
} from "native-base";

interface BaseInputProps extends IInputProps {
  label?: string;
  helperText?: string;
  error?: string;
}

const inputTokens = {
  bg: ["inputBg", "inputBgDark"],
  fg: ["inputFg", "inputFgDark"],
  border: ["inputBorder", "inputBorderDark"],
  placeholder: ["inputPlaceholder", "inputPlaceholderDark"],
  focusBorder: ["inputFocusBorder", "inputFocusBorderDark"],
};

export const BaseInput: React.FC<BaseInputProps> = ({
  label,
  helperText,
  error,
  ...props
}) => {
  const bg = useColorModeValue(inputTokens.bg[0], inputTokens.bg[1]);
  const fg = useColorModeValue(inputTokens.fg[0], inputTokens.fg[1]);
  const border = useColorModeValue(inputTokens.border[0], inputTokens.border[1]);
  const placeholder = useColorModeValue(
    inputTokens.placeholder[0],
    inputTokens.placeholder[1]
  );
  const focusBorder = useColorModeValue(
    inputTokens.focusBorder[0],
    inputTokens.focusBorder[1]
  );

  const isError = Boolean(error);

  return (
    <VStack w="100%" space="md">
      {label && (
        <Text fontFamily="heading" fontSize="xl" color={fg}>
          {label}
        </Text>
      )}

      <Input
        bg={bg}
        color={fg}
        borderColor={isError ? "error.500" : border}
        placeholderTextColor={placeholder}
        borderRadius="md"
        fontFamily="body"
        fontSize="lg"
        py="3"
        px="4"
        height="50px"
        _focus={{
          borderColor: isError ? "error.600" : focusBorder,
          shadow: "input",
        }}
        {...props}
      />

      {isError ? (
        <Text color="error.500">{error}</Text>
      ) : helperText ? (
        <Text color="textMuted">{helperText}</Text>
      ) : null}
    </VStack>
  );
};
