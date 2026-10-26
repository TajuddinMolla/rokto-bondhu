import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-foreground uppercase tracking-wider"
        >
          {label}
          {required ? (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive transition-all"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
