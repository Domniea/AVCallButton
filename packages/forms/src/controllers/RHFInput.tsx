import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

const isNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

const isWeb = !isNative;

interface RHFInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  Component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
}

export function RHFInput<T extends FieldValues>({
  control,
  name,
  label,
  Component,
  componentProps = {},
}: RHFInputProps<T>) {
  
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={"" as any}
      render={({ field, fieldState: { error } }) => (
        <Component
          label={label}
          value={field.value ?? ""}
          error={error?.message}
          onBlur={field.onBlur}
          onChange={
            isWeb
              ? (e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(e.target.value)
              : undefined
          }
          onChangeText={isNative ? field.onChange : undefined}
          {...componentProps}
        />
      )}
    />
  );
}
