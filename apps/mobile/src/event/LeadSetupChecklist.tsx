import React from "react";
import { Text, VStack } from "../../components/ui/layout";
import { BaseButton } from "../../components/BaseButton";
import { BaseCard } from "../../components/BaseCard";
import { ListRow } from "../../components/ListRow";
import { useThemeColors } from "../../hooks/useThemeColors";
import { severityAccent } from "./alertBoardUi";

export type SetupCheck = {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
  onPress?: () => void;
};

/** Pre-show checklist for lead Overview. */
export function LeadSetupChecklist({
  checks,
  onManageZones,
  onManageStaff,
}: {
  checks: SetupCheck[];
  onManageZones: () => void;
  onManageStaff: () => void;
}) {
  const { muted } = useThemeColors();
  const remaining = checks.filter((c) => !c.done).length;

  return (
    <BaseCard title="Setup checklist" titleAlign="start" variant="outline">
      <Text fontSize="sm" color={muted} mb={3}>
        {remaining === 0
          ? "Ready for show day. Activate the event when you’re live."
          : `${remaining} item${remaining === 1 ? "" : "s"} left before go-live.`}
      </Text>

      <VStack space={2} mb={3}>
        {checks.map((check) => (
          <ListRow
            key={check.id}
            title={check.title}
            subtitle={check.subtitle}
            accentColor={
              check.done ? severityAccent("clear") : severityAccent("pending")
            }
            meta={check.done ? "Done" : "Needs attention"}
            onPress={check.onPress}
          />
        ))}
      </VStack>

      <VStack space={2}>
        <BaseButton title="Manage zones & rooms" onPress={onManageZones} />
        <BaseButton
          title="Manage staff"
          variety="secondary"
          onPress={onManageStaff}
        />
      </VStack>
    </BaseCard>
  );
}
