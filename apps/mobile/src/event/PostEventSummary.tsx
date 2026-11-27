import React from "react";
import { Text, VStack } from "../../components/ui/layout";
import { BaseCard } from "../../components/BaseCard";
import { useThemeColors } from "../../hooks/useThemeColors";

/** Post-show Overview card. Metrics stub is lead/org only. */
export function PostEventSummary({
  eventName,
  cancelled,
  showMetricsStub,
}: {
  eventName: string;
  cancelled?: boolean;
  showMetricsStub: boolean;
}) {
  const { muted, text } = useThemeColors();

  return (
    <VStack space={3}>
      <BaseCard
        title={cancelled ? "Event cancelled" : "Show ended"}
        titleAlign="start"
        variant="outline"
      >
        <Text fontSize="sm" color={muted}>
          {cancelled
            ? `“${eventName}” was cancelled. Guest calls are closed.`
            : `“${eventName}” is over. Guest calls are closed.`}
        </Text>
      </BaseCard>

      {showMetricsStub ? (
        <BaseCard title="Metrics" titleAlign="start" variant="outline">
          <Text fontSize="sm" color={text} mb={2}>
            Response times, alert volume, and coverage insights will land here.
          </Text>
          <Text fontSize="xs" color={muted}>
            Org and lead access only — not shown to crew.
          </Text>
        </BaseCard>
      ) : (
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            Thanks for working this event. Metrics are available to leads and
            organizers.
          </Text>
        </BaseCard>
      )}
    </VStack>
  );
}
