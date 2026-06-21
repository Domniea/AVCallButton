import React, { useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BaseInput } from "./../components/BaseInput";
import { BaseButton } from "./../components/BaseButton";
import { BaseCard } from "./../components/BaseCard";

import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  loginSchema,
  type LoginSchema,
} from "@av/forms/src/schemas/auth/loginSchema";

import type { AppDispatch, RootState } from "@av/store";
import { fetchMeThunk, logoutThunk, loginThunk } from "@av/store/src/auth";
import type { RootStackParamList } from "./navigation/types";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "login">;

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginNav>();
  const { colorMode, toggleColorMode } = useColorMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigation.replace("dashboard");
    }
  }, [authStatus, navigation]);

  const form = useAppForm(loginSchema, {
    email: "",
    password: "",
  });

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

      const hasInviteToken = await AsyncStorage.getItem("inviteToken");
      navigation.replace(hasInviteToken ? "invite" : "dashboard");
    } catch (err) {
      console.error("Login failed", err);
      const message =
        typeof err === "string" && err !== "Invalid credentials"
          ? err
          : "Incorrect email or password.";
      setError("password", { type: "server", message });
      dispatch(logoutThunk());
    }
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box flex={1} bg={bg} justifyContent="center" alignItems="center">
        <Text color={muted}>Loading…</Text>
      </Box>
    );
  }

  if (authStatus === "authenticated") {
    return null;
  }

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          AV Call Button
        </Text>

        <Text fontSize="sm" color={muted}>
          Sign in to continue
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
          title="Create account"
          variety="secondary"
          onPress={() => navigation.navigate("signup")}
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
