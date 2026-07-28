import { Text } from "native-base";

import { ScreenLayout } from "../../components/ScreenLayout";
import { useThemeColors } from "../../hooks/useThemeColors";

/** Placeholder for event chat (middle tab). */
export default function Chat() {
  const { muted } = useThemeColors();

  return (
    <ScreenLayout subtitle="Coming soon" maxW="640">
      <Text fontSize="sm" color={muted}>
        Chat for this event will live here.
      </Text>
    </ScreenLayout>
  );
}
