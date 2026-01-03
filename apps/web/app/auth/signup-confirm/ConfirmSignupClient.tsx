"use client";

import React from "react";
import { Box, VStack, Text, HStack, Flex } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";

import { useColorMode } from "@/components/ui/color-mode";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  confirmEmailSchema,
  type ConfirmEmailSchema,
} from "@av/forms/src/schemas/auth/confirmEmail";

import { confirmSignup } from "@av/aws";

export default function ConfirmSignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { colorMode, toggleColorMode } = useColorMode();

  const form = useAppForm(confirmEmailSchema, {
    code: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ConfirmEmailSchema) => {
    if (!email) return;

    await confirmSignup(email, values.code);
    router.push("/auth/login");
  };

  return (
    <Box
      height="100vh"
      flex={1}
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
        alignItems="center"
        justifyContent="center"
        gap={6}
      >
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
              Confirm your email
            </Text>

            <Text fontSize="sm" color="muted">
              Enter the 6-digit code sent to {email}
            </Text>

            <RHFInput
              control={control}
              name="code"
              label="Confirmation Code"
              Component={BaseInput}
              componentProps={{
                placeholder: "123456",
                inputMode: "numeric",
                autoComplete: "one-time-code",
              }}
            />

            <BaseButton
              title={isSubmitting ? "Confirming..." : "Confirm"}
              variety="primary"
              type="submit"
            />
          </VStack>
        </form>

        <HStack justifyContent="space-between" width="100%" pt={4}>
          <Flex gap="3" align="center">
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
    </Box>
  );
}
