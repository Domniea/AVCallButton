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
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { BaseInput } from "./../components/BaseInput";
import { BaseButton } from "./../components/BaseButton";
import { BaseCard } from "./../components/BaseCard";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  loginSchema,
  type LoginSchema,
} from "@av/forms/src/schemas/auth/login";

import { signIn, getCurrentUser } from "aws-amplify/auth";
import type { AppDispatch, RootState } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";
import { logout } from "packages/auth-client/src";
import { loginThunk } from "@av/store/src/auth";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { colorMode, toggleColorMode } = useColorMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const form = useAppForm(loginSchema, {
    email: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: LoginSchema) => {
    try {
      dispatch(
        loginThunk({
          password: values.password,
          email: values.email
        }),
      );

      navigation.navigate("home" as never);
    } catch (err) {
      console.error("Login failed", err);
      dispatch(logoutThunk());
    }
  };
  
  const onLogout = () => {
    logout();
    dispatch(logoutThunk());
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Login
        </Text>

        <Text fontSize="sm" color={muted}>
          Status: {authStatus}
        </Text>

        {/* Email */}
        <RHFInput
          control={control}
          name="email"
          label="Email"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your email",
            autoCapitalize: "none",
          }}
        />

        {/* Password */}
        <RHFInput
          control={control}
          name="password"
          label="Password"
          Component={BaseInput}
          componentProps={{
            placeholder: "Enter your password",
            type: "password",
          }}
        />

        {/* Submit Button */}
        <BaseButton
          title={isSubmitting ? "Signing in..." : "Sign In"}
          onPress={handleSubmit(onSubmit)}
          variety="primary"
        />

        {/* Reset */}
        <BaseButton
          title="Logout"
          variety="secondary"
          onPress={() => onLogout()}
        />

        {/* Theme Toggle */}
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
