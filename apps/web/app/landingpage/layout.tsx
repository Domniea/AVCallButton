import React from "react";
import { Box, VStack } from "@chakra-ui/react";
    import LandingHeader from "./LandingHeader";
export default function LandingPageLayout({
    children,
}: {
    children: React.ReactNode; 
}) {
    return (
        <Box>
            <VStack>
                    <LandingHeader />
            {children}
            </VStack>
            
        </Box>
    );
}