import { Suspense } from "react";
import ConfirmClient from "./ConfirmSignupClient";
import { Box, Text } from "@chakra-ui/react";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmLoading />}>
      <ConfirmClient />
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
      <Text fontSize="lg" color="muted">
        Confirming your account…
      </Text>
    </Box>
  );
}
