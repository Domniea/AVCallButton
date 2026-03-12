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
      
      const{ control,
        handleSubmit,
        formstate:{ isSubmitting },
      } = form

      const onSubmit = async (values: LoginSchema) => {
  try {
    await dispatch(
      loginThunk({
        email: values.email,
        password: values.password,
      })
    ).unwrap()
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
         

        </form>
        <Text>Sign Up</Text>
        <Text>Sign up form will go here</Text>
        <BaseButton>Sign Up</BaseButton>
      </VStack>
    </Box>
  );
}
