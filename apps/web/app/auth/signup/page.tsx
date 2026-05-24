"use client";

import React from "react";
import { Box, VStack, Text, HStack, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { signup } from "../../../../../packages/auth-client/src";

import { useColorMode } from "@/components/ui/color-mode";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  signupSchema,
  type SignupSchema,
} from "@av/forms/src/schemas/auth/signupSchema";

export default function SignupPage() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const form = useAppForm(signupSchema, {
    email: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: SignupSchema) => {
    const res = await signup(values.email, values.password);
    console.log('ON SUBMIT',res);
    router.push(`/auth/signup-confirm?email=${encodeURIComponent(values.email)}`);
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
            boxShadow="lg"
          >
            <Text fontSize="2xl" fontWeight="bold" color="text">
              Create Account
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
                placeholder: "Create a password",
                type: "password",
                autoComplete: "new-password",
              }}
            />

            <BaseButton
              title={isSubmitting ? "Creating account..." : "Sign up"}
              variety="primary"
              type="submit"
            />

            <BaseButton
              title="Reset"
              variety="secondary"
              type="button"
              onClick={() => reset()}
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
              <Text color="text">{colorMode === "light" ? "🌞" : "🌙"}</Text>
            </Box>
          </Flex>
        </HStack>
      </VStack>
    </Box>
  );
}
