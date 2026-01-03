"use client";

import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@av/aws";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import { resetPasswordSchema, type ResetPasswordSchema } from "@av/forms/src/schemas/auth/resetPassword";

export default function ResetConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const form = useAppForm(resetPasswordSchema, {
    code: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ResetPasswordSchema) => {
    if (!email) return;

    await resetPassword(email, values.code, values.password);
    router.replace("/auth/login");
  };

  return (
    <Box height="100vh" bg="bg" display="flex" justifyContent="center">
      <VStack
        width="100%"
        maxWidth="480px"
        height="100%"
        justifyContent="center"
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <VStack bg="bg" p={8} borderRadius="xl" gap={6} boxShadow="lg">
            <Text fontSize="2xl" fontWeight="bold">
              Set new password
            </Text>

            <RHFInput
              control={control}
              name="code"
              label="Reset code"
              Component={BaseInput}
              componentProps={{
                autoComplete: "one-time-code",
                inputMode: "numeric",
              }}
            />

            <RHFInput
              control={control}
              name="password"
              label="New password"
              Component={BaseInput}
              componentProps={{ type: "password" }}
            />

            <BaseButton
              title={isSubmitting ? "Resetting…" : "Reset password"}
              type="submit"
            />
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
