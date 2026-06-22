import React from "react";
import { VStack, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { AuthLayout } from "../components/AuthLayout";
import { ThemeToggle } from "../components/ThemeToggle";
import { useThemeColors } from "../hooks/useThemeColors";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppDispatch, RootState } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./navigation/types";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "home">;

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeNav>();
  const { text, muted } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      await AsyncStorage.removeItem("inviteToken");
      navigation.replace("login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthLayout title="Account" subtitle={`Status: ${authStatus}`}>
      {user?.email ? (
        <BaseCard variant="outline" p={4}>
          <VStack space={1}>
            <Text fontSize="xs" color={muted}>
              Signed in as
            </Text>
            <Text fontSize="md" fontWeight="medium" color={text}>
              {user.email}
            </Text>
          </VStack>
        </BaseCard>
      ) : null}

      <BaseButton title="Log out" variety="secondary" onPress={onLogout} />

      <ThemeToggle />
    </AuthLayout>
  );
}
