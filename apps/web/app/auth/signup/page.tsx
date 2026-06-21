import { Suspense } from "react";
import { Box, Text } from "@chakra-ui/react";

import SignupClient from "./SignupClient";

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupClient />
    </Suspense>
  );
}

function SignupLoading() {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg"
    >
      <Text fontSize="lg" color="muted">
        Loading…
      </Text>
    </Box>
  );
}
