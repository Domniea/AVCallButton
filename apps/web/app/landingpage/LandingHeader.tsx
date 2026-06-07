"use client";
import React from "react";
import {Box,VStack,Text,HStack} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/reusable/BaseButton";
export default function LandingHeader(){
    const router = useRouter();
    // #region agent log
    fetch('http://127.0.0.1:7671/ingest/1d15955c-ed5b-442f-9637-4738c30e6b2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2814f1'},body:JSON.stringify({sessionId:'2814f1',runId:'post-fix',hypothesisId:'A',location:'LandingHeader.tsx:render',message:'LandingHeader mounted',data:{moduleResolved:true},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return (
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <Text fontSize="xl" fontWeight="bold" color="text">
          WarRoom
        </Text>
        <HStack gap={3}>
          <BaseButton
            title="Log in"
            variety="secondary"
            onClick={() => router.push("/auth/login")}
          />
          <BaseButton
            title="Sign up"
            variety="primary"
            onClick={() => router.push("/auth/signup")}
          />
        </HStack>
      </HStack>
    )
}