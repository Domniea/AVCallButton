import React, { useEffect } from "react";
import { VStack } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { AuthLayout } from "../components/AuthLayout";
import { ThemeToggle } from "../components/ThemeToggle";
import { LoadingScreen } from "../components/LoadingScreen";

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

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (authStatus === "authenticated") {
    return null;
  }

  return (
    <AuthLayout title="AV Call Button" subtitle="Sign in to continue">
      <VStack space={4}>
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

        <BaseButton
          title={isSubmitting ? "Signing in..." : "Sign In"}
          onPress={handleSubmit(onSubmit)}
          variety="primary"
        />

        <BaseButton
          title="Create account"
          variety="secondary"
          onPress={() => navigation.navigate("signup")}
        />
      </VStack>

      <ThemeToggle />
    </AuthLayout>
  );
}
