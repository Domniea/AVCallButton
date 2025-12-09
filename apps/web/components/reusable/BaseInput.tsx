"use client";

import React from "react";
import { Input, VStack, Text, InputProps } from "@chakra-ui/react";

type BaseInputProps = InputProps & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const BaseInput: React.FC<BaseInputProps> = ({
  label,
  helperText,
  error,
  ...props
}) => {
  const isError = Boolean(error);

  return (
    <VStack w="100%" align="stretch" gap={2}>
      {/* Label */}
      {label && (
        <Text fontFamily="heading" fontSize="md" color="text">
          {label}
        </Text>
      )}

      <Input
        bg="inputBg"
        color="inputFg"
        borderColor={isError ? "red.400" : "inputBorder"}
        borderWidth="1px"
        _placeholder={{ color: "inputPlaceholder" }}
        _focus={{
          borderColor: isError ? "red.500" : "inputFocusBorder",
          bg: "inputBg",
          boxShadow: "inputShadow",
        }}
        fontFamily="body"
        fontSize="md"
        h="52px"
        px={4}
        borderRadius="md"
        {...props}
      />

      {/* Helper or Error */}
      {isError ? (
        <Text color="red.400" fontSize="sm">
          {error}
        </Text>
      ) : helperText ? (
        <Text color="textMuted" fontSize="sm">
          {helperText}
        </Text>
      ) : null}
    </VStack>
  );
};
