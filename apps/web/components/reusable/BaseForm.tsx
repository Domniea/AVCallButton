"use client";

import { z, ZodObject, ZodRawShape } from "zod";
import { useForm } from "react-hook-form";
import type { Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { BaseButton } from "./BaseButton";
import { BaseInput } from "./BaseInput";
import { VStack, Box } from "@chakra-ui/react";

export function BaseForm<T extends ZodObject<ZodRawShape>>({
  schema,
  onSubmit,
  submitLabel = "Submit",
}: {
  schema: T;
  onSubmit: (values: z.infer<T>) => void;
  submitLabel?: string;
}) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  const fields = Object.keys(schema.shape) as string[];

  function asPath<T extends Record<string, unknown>>(key: keyof T): Path<T> {
    return key as Path<T>;
  }

  return (
  <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
    <VStack w="100%" gap={4}>
      {fields.map((key) => {
        const shape = schema.shape[key];

        let inputType = "text";
        if (shape instanceof z.ZodNumber) inputType = "number";
        if (key.toLowerCase().includes("password")) inputType = "password";

        return (
          <Box key={key} w="100%">
            <RHFInput
              control={control}
              name={asPath<z.infer<T>>(key)}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              Component={BaseInput}
              componentProps={{
                type: inputType,
                w: "100%",
              }}
            />
          </Box>
        );
      })}

      <BaseButton
        title={isSubmitting ? "Submitting..." : submitLabel}
        variety="primary"
        type="submit"
      />
    </VStack>
  </form>
);}
