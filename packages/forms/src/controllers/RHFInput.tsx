import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

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
      render={({ field, fieldState: { error } }) => (
        <Component
          label={label}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={error?.message}
          {...componentProps}
        />
      )}
    />
  );
}

