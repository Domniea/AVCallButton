"use client";

import React, { useState } from "react";
import {
  Input,
  VStack,
  Text,
  InputProps,
  IconButton,
} from "@chakra-ui/react";
import { HiEye, HiEyeOff } from "react-icons/hi";

type BaseInputProps = InputProps & {
  label?: string;
  helperText?: string;
  error?: string;

  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
};

export const BaseInput: React.FC<BaseInputProps> = ({
  label,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  type,
  ...props
}) => {
  const isError = Boolean(error);

  const isPassword = type === "password";

  const [showPassword, setShowPassword] = useState(false);

  return (
    <VStack w="100%" align="stretch" gap={2}>
      {label && (
        <Text fontFamily="heading" fontSize="md" color="text">
          {label}
        </Text>
      )}

      <VStack position="relative" w="100%">
        <Input
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          type={isPassword && !showPassword ? "password" : "text"}
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

        {isPassword && (
          <IconButton
            aria-label={showPassword ? "Hide password" : "Show password"}
            position="absolute"
            right="3"
            top="50%"
            transform="translateY(-50%)"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(prev => !prev)}
            _icon={{
              color: "inputFg",
              fontSize: "lg",
            }}
          >
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </IconButton>
        )}

      </VStack>

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
