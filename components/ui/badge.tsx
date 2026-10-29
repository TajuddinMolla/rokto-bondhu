import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none text-center",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        subtle:
          "border-primary-border bg-primary-subtle text-primary hover:bg-primary-subtle/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border-border text-foreground hover:bg-muted",
        available:
          "border-status-available-border bg-status-available-bg text-status-available-text",
        pending:
          "border-status-pending-border bg-status-pending-bg text-status-pending-text",
        urgent:
          "border-status-pending-border bg-status-pending-bg text-status-pending-text",
        emergency:
          "border-status-emergency-border bg-status-emergency-bg text-status-emergency-text",
        unavailable:
          "border-status-unavailable-border bg-status-unavailable-bg text-status-unavailable-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
