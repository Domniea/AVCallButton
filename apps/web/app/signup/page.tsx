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
} from "@av/forms/src/schemas/auth/login";

export default function SignupPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const form = useAppForm(loginSchema, {
    email: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: LoginSchema) => {
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
      router.replace(inviteToken ? "/invite" : "/home");
    } catch (err) {
      console.error("Login failed:", err);
    }

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
            <VStack>
              <Text fontSize="2xl" fontWeight="bold">
                Sign up
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
                  autoComplete: "current-password",
                  type: "password",
                }}
              />

              <BaseButton
                title ={isSubmitting ? "Signing up..." : "Sign Up"}
                variety="primary"
                type ="submit"
                />

                <BaseButton
                title="Already have an account? Log in"
                variety="secondary"
                onClick={() => router.push("/auth/login")}
              />
            </VStack>
          </form>
          <Text>Sign Up</Text>
          <Text>Sign up form will go here</Text>
          <BaseButton>Sign Up</BaseButton>
        </VStack>
      </Box>
    );
  };
}
