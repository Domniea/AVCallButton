import React from "react";
import { HStack, Text } from "../../components/ui/layout";
import { BasePill } from "../../components/BasePill";
import { useThemeColors } from "../../hooks/useThemeColors";
import {
  phaseLabel,
  phasePillVariant,
  type EventPhase,
} from "./eventPhase";

/** Status + phase pills shared by lead/crew Overview. */
export function OverviewPhaseChrome({
  status,
  phase,
  hint,
  overridden,
}: {
  status: string;
  phase: EventPhase;
  hint?: string;
  /** When true, phase comes from the Dev menu override. */
  overridden?: boolean;
}) {
  const { muted } = useThemeColors();

  return (
    <HStack space={2} flexWrap="wrap" alignItems="center">
      <BasePill label={phaseLabel(phase)} variant={phasePillVariant(phase)} />
      <BasePill label={status} variant="outline" />
      {overridden ? <BasePill label="Dev override" variant="danger" /> : null}
      {hint ? (
        <Text fontSize="sm" color={muted}>
          {hint}
        </Text>
      ) : null}
    </HStack>
  );
}
