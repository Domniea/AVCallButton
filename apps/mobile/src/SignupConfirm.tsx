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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  confirmEmailSchema,
  type ConfirmEmailSchema,
} from "@av/forms/src/schemas/auth/confirmEmail";

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

    const hasInviteToken = await AsyncStorage.getItem("inviteToken");
    navigation.replace(hasInviteToken ? "invite" : "login");
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Confirm your email
        </Text>

        <Text fontSize="sm" color={muted}>
          Enter the 6-digit code sent to {email}
        </Text>

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
