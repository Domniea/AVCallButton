import React from "react";
import { Box, VStack, Text, HStack, useColorModeValue } from "native-base";

import type { RosterAssignment } from "@av/store";
import { BasePill } from "../../components/BasePill";
import { InlineAction } from "../../components/InlineAction";
import { coverageLabel, type CoverageEntry } from "./eventHelpers";

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");

  if (!value) return null;
  return (
    <Box>
      <Text fontSize="xs" color={muted} mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color={textColor}>
        {value}
      </Text>
    </Box>
  );
}

export function StaffRow({
  email,
  subtitle,
  badge,
}: {
  email: string | null;
  subtitle?: string;
  badge: string;
}) {
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      space={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor={rowBorder}
      borderRadius="lg"
      bg={surface}
      shadow="subtle"
    >
      <Box flex={1}>
        <Text fontSize="sm" color={textColor} numberOfLines={1}>
          {email ?? "—"}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color={muted}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <BasePill label={badge} variant="outline" />
    </HStack>
  );
}

export function CoverageList({
  rows,
  roster,
  onRemove,
  removingMembershipId,
  label,
  onAdd,
  addLabel = "Add staff",
}: {
  rows: CoverageEntry[];
  roster: RosterAssignment[];
  onRemove?: (membershipId: string) => void;
  removingMembershipId?: string | null;
  label?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");

  return (
    <Box>
      {label || onAdd ? (
        <HStack
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          minH={6}
        >
          {label ? (
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              {label}
            </Text>
          ) : (
            <Box flex={1} />
          )}
          {onAdd ? (
            <InlineAction title={addLabel} onPress={onAdd} />
          ) : null}
        </HStack>
      ) : null}
      {rows.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          No coverage assigned yet.
        </Text>
      ) : (
        <VStack space={2}>
          {rows.map((row) => {
            const isRemoving = removingMembershipId === row.membershipId;
            return (
              <HStack
                key={row.id}
                justifyContent="space-between"
                alignItems="center"
                space={2}
                py={2}
                px={3}
                borderWidth={1}
                borderColor={rowBorder}
                borderRadius="lg"
                bg={surface}
              >
                <Text fontSize="sm" color={textColor} flex={1} numberOfLines={2}>
                  {coverageLabel(row, roster)}
                </Text>
                {onRemove ? (
                  <InlineAction
                    title={isRemoving ? "Removing…" : "Remove"}
                    variant="danger"
                    disabled={isRemoving}
                    onPress={() => onRemove(row.membershipId)}
                  />
                ) : null}
              </HStack>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}
