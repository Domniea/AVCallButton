"use client";

import React from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Flex,
} from "@chakra-ui/react";

import { useColorMode } from "@/components/ui/color-mode";
import { BaseInput } from "../components/reusable/BaseInput";
import { BaseButton } from "../components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import { loginSchema, type LoginSchema } from "@av/forms/src/schemas/login";

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

  return (
  <Box height="100vh" flex={1} bg="bg" px={6} py={10} display="flex" justifyContent="center">
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <VStack
        bg="bg"
        borderRadius="xl"
        p={8}
        gap={8}
        width="100%"
        maxWidth="480px"
        boxShadow="lg"
      >
        <Text fontSize="2xl" fontWeight="bold" color="text">
          Login
        </Text>

        <RHFInput
          control={control}
          name="email"
          label="Email"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your email",
            autoComplete: "email",
            type: "text",
          }}
        />

        <RHFInput
          control={control}
          name="password"
          label="Password"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your password",
            type: "password",
            autoComplete: "current-password",
          }}
        />

        <BaseButton
          title={isSubmitting ? "Submitting..." : "Submit"}
          variety="primary"
          type="submit"
        />

        <BaseButton
          title="Reset"
          variety="secondary"
          type="button"
          onClick={() => reset()}
        />

        <HStack justifyContent="space-between" width="100%" pt={4}>
          <Flex top="10" right="10" gap="3" align="center">
            <Text fontSize="lg" color="text">
              {colorMode === "light" ? "Light" : "Dark"}
            </Text>

            <Box
              as="button"
              onClick={toggleColorMode}
              bg="surface"
              borderRadius="full"
              px="3"
              py="1"
              shadow="sm"
            >
              <Text color="text">
                {colorMode === "light" ? "🌞" : "🌙"}
              </Text>
            </Box>
          </Flex>
        </HStack>
      </VStack>
    </form>
  </Box>
);
}
