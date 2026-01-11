"use client";

import React from "react";
import { Box, VStack, Text, HStack, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { forgotPassword } from "../../../../../packages/auth-client/src";
import { useColorMode } from "@/components/ui/color-mode";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@av/forms/src/schemas/auth/forgotPassword";

export default function ResetRequestClient() {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  const form = useAppForm(forgotPasswordSchema, {
    email: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ForgotPasswordSchema) => {
    await forgotPassword(values.email);

    router.push(
      `/auth/reset/confirm?email=${encodeURIComponent(values.email)}`,
    );
  };

  return (
    <Box
      height="100vh"
      bg="bg"
      px={6}
      py={10}
      display="flex"
      justifyContent="center"
    >
      <VStack
        width="100%"
        maxWidth="480px"
        height="100%"
        justifyContent="center"
        gap={6}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <VStack bg="bg" borderRadius="xl" p={8} gap={8} boxShadow="lg">
            <Text fontSize="2xl" fontWeight="bold">
              Reset password
            </Text>

            <Text fontSize="sm" color="muted">
              Enter your email to receive a reset code
            </Text>

            <RHFInput
              control={control}
              name="email"
              label="Email"
              Component={BaseInput}
              componentProps={{
                autoComplete: "email",
                placeholder: "you@example.com",
              }}
            />

            <BaseButton
              title={isSubmitting ? "Sending…" : "Send reset code"}
              type="submit"
            />
          </VStack>
        </form>

        <HStack justifyContent="space-between" width="100%" pt={4}>
          <Flex gap="3" align="center">
            <Text fontSize="lg">
              {colorMode === "light" ? "Light" : "Dark"}
            </Text>

            <Box
              as="button"
              onClick={toggleColorMode}
              bg="surface"
              borderRadius="full"
              px="3"
              py="1"
            >
              {colorMode === "light" ? "🌞" : "🌙"}
            </Box>
          </Flex>
        </HStack>
      </VStack>
    </Box>
  );
}
