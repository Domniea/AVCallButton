import React from "react";
import { Input, IInputProps, VStack, Text } from "native-base";

type BaseInputProps = IInputProps & {
  label?: string;
};

export const BaseInput: React.FC<BaseInputProps> = ({ label, ...props }) => {
  return (
    <VStack space="md" w="100%">
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
        bg="input.bg"
        borderColor="input.border"
        color="input.fg"
        placeholderTextColor="input.placeholder"
        borderRadius="md"
        fontFamily="body"
        fontSize="2xl"
        py="3"
        px="4"
        height="52px"

        _focus={{
          borderColor: "input.focus-border",
          bg: "input.bg",
        }}

        {...props}
      />
    </VStack>
  );
};
