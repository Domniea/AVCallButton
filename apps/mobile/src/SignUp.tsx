import React from "react";
import { VStack } from "native-base";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { AuthLayout } from "../components/AuthLayout";
import { ThemeToggle } from "../components/ThemeToggle";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  signupSchema,
  type SignupSchema,
} from "@av/forms/src/schemas/auth/signupSchema";

import { signup } from "@av/auth-client";

type SignupNav = NativeStackNavigationProp<
  ParamListBase & { signupConfirm: { email: string } },
  "signup"
>;

export default function SignUp() {
  const navigation = useNavigation<SignupNav>();

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
    await signup(values.email, values.password);
    navigation.navigate("signupConfirm", { email: values.email });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Get started with AV Call Button"
    >
      <VStack space={4}>
        <RHFInput
          control={control}
          name="email"
          label="Email"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your email",
            autoCapitalize: "none",
            autoComplete: "email",
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
          onPress={handleSubmit(onSubmit)}
          variety="primary"
        />

        <BaseButton title="Reset" variety="secondary" onPress={() => reset()} />
      </VStack>

      <ThemeToggle />
    </AuthLayout>
  );
}
