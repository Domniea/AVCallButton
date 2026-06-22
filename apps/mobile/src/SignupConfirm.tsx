import React from "react";
import { VStack } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { AuthLayout } from "../components/AuthLayout";
import { ThemeToggle } from "../components/ThemeToggle";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  confirmEmailSchema,
  type ConfirmEmailSchema,
} from "@av/forms/src/schemas/auth/confirmEmailSchema";

import { confirmSignup } from "@av/auth-client";

type SignupConfirmParams = { email: string };
type SignupConfirmNav = NativeStackNavigationProp<
  { signupConfirm: SignupConfirmParams; invite: undefined; login: undefined },
  "signupConfirm"
>;

export default function SignupConfirm() {
  const navigation = useNavigation<SignupConfirmNav>();
  const route = useRoute<RouteProp<{ params: SignupConfirmParams }, "params">>();
  const email = route.params?.email ?? "";

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

    const hasInviteToken = await AsyncStorage.getItem("inviteToken");
    navigation.replace(hasInviteToken ? "invite" : "login");
  };

  return (
    <AuthLayout
      title="Confirm your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      <VStack space={4}>
        <RHFInput
          control={control}
          name="code"
          label="Confirmation Code"
          Component={BaseInput}
          componentProps={{
            placeholder: "123456",
            keyboardType: "number-pad",
          }}
        />

        <BaseButton
          title={isSubmitting ? "Confirming..." : "Confirm"}
          onPress={handleSubmit(onSubmit)}
          variety="primary"
        />
      </VStack>

      <ThemeToggle />
    </AuthLayout>
  );
}
