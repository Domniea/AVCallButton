import {
  useForm,
  type UseFormReturn,
  type DefaultValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function useAppForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  defaultValues?: DefaultValues<z.infer<TSchema>>,
): UseFormReturn<z.infer<TSchema>> {
  
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
    criteriaMode: "firstError",
  });
}
