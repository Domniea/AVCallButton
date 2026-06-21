"use client";

import React from "react";
import { Box, VStack, Text, HStack, Flex } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { fetchMeThunk, loginThunk } from "@av/store/src/auth";
import type { AppDispatch } from "@av/store";

import { useColorMode } from "@/components/ui/color-mode";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  loginSchema,
  type LoginSchema,
} from "@av/forms/src/schemas/auth/loginSchema";

export default function LoginPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const form = useAppForm(loginSchema, {
    email: "",
    password: "",
  })
    ;

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: LoginSchema) => {
    clearErrors();
    try {
      await dispatch(
        loginThunk({
          email: values.email,
          password: values.password,
        }),
      )
        .unwrap()
        .then(() => dispatch(fetchMeThunk()));

      const inviteToken = sessionStorage.getItem("inviteToken");
      router.replace(inviteToken ? "/invite" : "/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const message =
        typeof err === "string" && err !== "Invalid credentials"
          ? err
          : "Incorrect email or password.";
      setError("password", { type: "server", message });
    }
  };

  const onSignup = () => {
    router.push("/auth/signup");
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
              title={isSubmitting ? "Logging in..." : "Login"}
              variety="primary"
              type="submit"
            />

            <BaseButton
              title="Create Account"
              variety="secondary"
              type="button"
              onClick={() => onSignup()}
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
