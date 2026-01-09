import { Suspense } from "react";
import { Box, Text } from "@chakra-ui/react";
import ResetRequestClient from "./ResetRequestClient";

export default function ResetPage() {
  return (
    <Suspense fallback={<ResetLoading />}>
      <ResetRequestClient />
    </Suspense>
  );
}

function ResetLoading() {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg"
    >
      <Text color="muted">Preparing password reset…</Text>
    </Box>
  );
}
