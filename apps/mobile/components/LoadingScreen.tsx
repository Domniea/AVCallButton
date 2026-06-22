import React from "react";
import { Box, Text, Spinner } from "native-base";
import { useThemeColors } from "../hooks/useThemeColors";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading…" }: LoadingScreenProps) {
  const { bg, muted } = useThemeColors();

  return (
    <Box flex={1} bg={bg} justifyContent="center" alignItems="center" px={6}>
      <Spinner color="primary.500" mb={3} />
      <Text color={muted} fontSize="sm">
        {message}
      </Text>
    </Box>
  );
}
