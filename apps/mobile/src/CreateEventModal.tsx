import React, { useEffect, useState } from "react";
import {
  Modal as RNModal,
  Pressable as RNPressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Box, Text, VStack, useColorModeValue } from "native-base";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AppDispatch } from "@av/store";
import { createEventThunk, fetchWorkspacesThunk } from "@av/store";

import { BaseButton } from "../components/BaseButton";
import { BaseInput } from "../components/BaseInput";
import type { RootStackParamList } from "./navigation/types";

type CreateEventModalProps = {
  isOpen: boolean;
  workspaceId: string;
  onClose: () => void;
};

type WorkspaceNav = NativeStackNavigationProp<RootStackParamList, "workspace">;

export default function CreateEventModal({
  isOpen,
  workspaceId,
  onClose,
}: CreateEventModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<WorkspaceNav>();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setLocation("");
      setVenue("");
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const onSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setSubmitError("Show name must be at least 2 characters.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createEventThunk({
          workspaceId,
          data: {
            name: trimmedName,
            location: location.trim() || undefined,
            venue: venue.trim() || undefined,
          },
        }),
      ).unwrap();

      void dispatch(fetchWorkspacesThunk());
      onClose();
      navigation.navigate("event", {
        workspaceId,
        eventId: result.event.id,
      });
    } catch (err) {
      setSubmitError(
        typeof err === "string" ? err : "Could not create show. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <RNPressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centered}
        >
          <RNPressable onPress={(e) => e.stopPropagation()}>
            <Box bg={surface} borderRadius="xl" p={6} w="100%" maxW="400">
              <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
                Create show
              </Text>
              <VStack space={4}>
                <BaseInput
                  label="Show name"
                  placeholder="TechCon 2025"
                  value={name}
                  onChangeText={setName}
                />
                <BaseInput
                  label="Location"
                  placeholder="Optional"
                  value={location}
                  onChangeText={setLocation}
                />
                <BaseInput
                  label="Venue"
                  placeholder="Optional"
                  value={venue}
                  onChangeText={setVenue}
                />
                {submitError ? (
                  <Text color="error.500" fontSize="sm">
                    {submitError}
                  </Text>
                ) : null}
                <BaseButton
                  title={isSubmitting ? "Creating…" : "Create show"}
                  variety="primary"
                  onPress={() => void onSubmit()}
                  isDisabled={isSubmitting}
                />
                <BaseButton title="Cancel" variety="secondary" onPress={onClose} />
              </VStack>
            </Box>
          </RNPressable>
        </KeyboardAvoidingView>
      </RNPressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  centered: {
    width: "100%",
  },
});
