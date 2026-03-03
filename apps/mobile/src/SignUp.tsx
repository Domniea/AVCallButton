import React from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Switch,
  useColorMode,
  useColorModeValue,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  signupSchema,
  type SignupSchema,
} from "@av/forms/src/schemas/auth/signup";

import { signup } from "@av/auth-client";

type SignupNav = NativeStackNavigationProp<
  ParamListBase & { signupConfirm: { email: string } },
  "signup"
>;

export default function SignUp() {
  const navigation = useNavigation<SignupNav>();
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
    await signup(values.email, values.password);
    navigation.navigate("signupConfirm", { email: values.email });
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Create Account
        </Text>

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

        <BaseButton
          title="Reset"
          variety="secondary"
          onPress={() => reset()}
        />

        <HStack alignItems="center" justifyContent="space-between" pt="6">
          <Text fontSize="lg" color={textColor}>
            {colorMode === "light" ? "Light Mode" : "Dark Mode"}
          </Text>

          <BaseCard variant="elevated" p="4">
            <Switch
              isChecked={colorMode === "dark"}
              onToggle={toggleColorMode}
            />
          </BaseCard>
        </HStack>
      </VStack>
    </Box>
  );
}
