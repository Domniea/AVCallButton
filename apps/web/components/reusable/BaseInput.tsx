"use client";

import React from "react";
import {
  Input,
  VStack,
  Text,
  InputProps,
//   useMultiStyleConfig,
//   FormControl,
} from "@chakra-ui/react";

type BaseInputProps = InputProps & {
  label?: string;
};

export const BaseInput: React.FC<BaseInputProps> = ({
  label,
  ...props
}) => {
  return (
    <VStack gap='lg' w="100%" align="stretch">
      {/* Label */}
      {label && (
        <Text
          fontFamily="heading"
          fontSize="2xl"
          color="text-muted"
          mb="1"
        >
          {label}
        </Text>
      )}

      <Input
        
        bg="white"
        borderColor="input.border"
        color="input.fg"
        _placeholder={{ color: "input.placeholder" }}
        borderRadius="md"
        fontFamily="body"
        fontSize="2xl"
        py="3"
        px="4"
        h="52px"
        _focus={{
          borderColor: "input.focus-border",
          bg: "input.bg",
        }}
        {...props}
      />
    </VStack>
  );
};
