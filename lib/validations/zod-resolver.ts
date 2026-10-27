import type { FieldValues, Resolver, ResolverResult } from "react-hook-form";
import { toNestErrors } from "@hookform/resolvers";
import type { z } from "zod";

/**
 * Universal Zod Resolver for React Hook Form.
 * Fully compatible with both Zod v3 (`error.errors`) and Zod v4 (`error.issues`).
 * Prevents runtime `ZodError` exceptions caused by breaking changes in Zod v4 issue arrays.
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<any, any, any>
): Resolver<TFieldValues> {
  return async (values, _context, options): Promise<ResolverResult<TFieldValues>> => {
    try {
      const result = await schema.safeParseAsync(values);

      if (result.success) {
        return {
          values: result.data as TFieldValues,
          errors: {},
        };
      }

      // Support both Zod v4 (`result.error.issues`) and Zod v3 (`result.error.errors`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawError = result.error as any;
      const issues = Array.isArray(rawError?.issues)
        ? rawError.issues
        : Array.isArray(rawError?.errors)
        ? rawError.errors
        : [];

      const flatErrors: Record<string, { type: string; message: string }> = {};

      for (const issue of issues) {
        const path = Array.isArray(issue.path) && issue.path.length > 0
          ? issue.path.join(".")
          : "root";

        if (!flatErrors[path]) {
          flatErrors[path] = {
            type: issue.code || "validation",
            message: issue.message || "Invalid value",
          };
        }
      }

      return {
        values: {},
        errors: toNestErrors(flatErrors, options),
      } as ResolverResult<TFieldValues>;
    } catch (unexpectedError: unknown) {
      // Safety guard against unexpected schema errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawError = unexpectedError as any;
      const issues = Array.isArray(rawError?.issues)
        ? rawError.issues
        : Array.isArray(rawError?.errors)
        ? rawError.errors
        : [];

      const flatErrors: Record<string, { type: string; message: string }> = {};
      if (issues.length > 0) {
        for (const issue of issues) {
          const path = Array.isArray(issue.path) && issue.path.length > 0
            ? issue.path.join(".")
            : "root";
          if (!flatErrors[path]) {
            flatErrors[path] = {
              type: issue.code || "validation",
              message: issue.message || "Invalid value",
            };
          }
        }
      } else {
        flatErrors["root"] = {
          type: "unknown",
          message:
            unexpectedError instanceof Error
              ? unexpectedError.message
              : "Validation failed",
        };
      }

      return {
        values: {},
        errors: toNestErrors(flatErrors, options),
      } as ResolverResult<TFieldValues>;
    }
  };
}
