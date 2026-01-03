"use client";

import React from "react";
import {
  Box,
  VStack,
  Text,
  useColorMode,
  useColorModeValue,
  Switch,
  HStack,
  Input,
} from "native-base";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import { loginSchema, LoginSchema } from "@av/forms/src/schemas/auth/login";
import { BaseCard } from "../components/BaseCard";

export default function TestScreen() {
  const { colorMode, toggleColorMode } = useColorMode();
  const form = useAppForm(loginSchema, {
    email: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = (values: LoginSchema) => {
    console.log("Form submitted:", values);
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <Text fontSize="2xl" fontWeight="bold" color={textColor} mb="4">
          Login
        </Text>

        {/* Email */}
        <RHFInput
          control={control}
          name="email"
          label="Email"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your email",
            autoCapitalize: "none",
          }}
        />

        {/* Password */}
        <RHFInput
          control={control}
          name="password"
          label="Password"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your password",
            type: "password",
          }}
        />

        {/* Submit Button */}
        <BaseButton
          title="Submit"
          onPress={handleSubmit(onSubmit)}
          variety="primary"
        />

        {/* Reset */}
        <BaseButton title="Reset" variety="secondary" onPress={() => reset()} />

        <HStack alignItems="center" justifyContent="space-between" pt="6">
          <Text fontSize="lg" color={textColor}>
            {colorMode === "light" ? "Light Mode" : "Dark Mode"}
          </Text>

          <BaseCard variant="elevated" p="4">
            <Switch
              isChecked={colorMode === "dark"}
              onToggle={toggleColorMode}
            />
          </BaseCard>
        </HStack>
      </VStack>
    </Box>
  );
}
