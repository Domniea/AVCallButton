import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, VStack, useColorModeValue } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { fetchAuthSession } from "aws-amplify/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootState } from "@av/store";

type RootStackParams = {
  landing: undefined;
  login: undefined;
  home: undefined;
  invite: { token?: string };
};
type InviteNav = NativeStackNavigationProp<RootStackParams, "invite">;

export default function Invite() {
  const navigation = useNavigation<InviteNav>();
  const route = useRoute<RouteProp<RootStackParams, "invite">>();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = Constants.expoConfig?.extra?.API_URL as string | undefined;
  const tokenFromParams = route.params?.token;

  // Persist token from deep link / route params
  useEffect(() => {
    if (tokenFromParams) {
      AsyncStorage.setItem("inviteToken", tokenFromParams);
    }
  }, [tokenFromParams]);

  const acceptInvite = useCallback(
    async (token: string) => {
      if (!apiUrl) {
        setError("API not configured");
        return;
      }
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        const res = await fetch(`${apiUrl}/invites/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data.message || data.error;

          if (msg?.includes("already a member")) {
            await AsyncStorage.removeItem("inviteToken"); // consumed; won’t trigger invite again
            navigation.replace("home");
            return;
          }

          setError(msg || "Failed to accept invite");
          return;
        }

        await AsyncStorage.removeItem("inviteToken"); // consumed; won’t trigger invite again
        navigation.replace("home");
      } catch {
        setError("Something went wrong");
      }
    },
    [apiUrl, navigation]
  );

  useEffect(() => {
    if (authStatus === "loading" || authStatus === "idle") return;

    const run = async () => {
      const token =
        tokenFromParams ?? (await AsyncStorage.getItem("inviteToken"));
      if (!token) {
        setError("No invite token found");
        return;
      }

      if (authStatus === "unauthenticated") {
        navigation.replace("login");
        return;
      }

      if (authStatus === "authenticated") {
        acceptInvite(token);
      }
    };

    run();
  }, [authStatus, acceptInvite, navigation, tokenFromParams]);

  // Redirect after error; clear token so bad/invalid token doesn’t keep sending to invite
  useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(async () => {
      await AsyncStorage.removeItem("inviteToken");
      navigation.replace("home");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [error, navigation]);

  const bg = useColorModeValue("bg", "bgDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  if (error) {
    return (
      <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
        <VStack space="4">
          <Text fontSize="lg" color={textColor}>
            {error}
          </Text>
          <Text fontSize="sm" color={muted}>
            Redirecting you to your workspace…
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <Text fontSize="lg" color={textColor}>
        Processing invite...
      </Text>
    </Box>
  );
}
