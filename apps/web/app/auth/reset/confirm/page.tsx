import { Suspense } from "react";
import { Box, Text } from "@chakra-ui/react";
import ResetConfirmClient from "./ResetConfirmClient";

export default function ResetConfirmPage() {
  return (
    <Suspense fallback={<ConfirmLoading />}>
      <ResetConfirmClient />
    </Suspense>
  );
}

function ConfirmLoading() {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg"
    >
      <Text color="muted">Verifying reset code…</Text>
    </Box>
  );
}
