import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon: Icon,
      title,
      description,
      action,
      secondaryAction,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 p-8 sm:p-12 text-center transition-all",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground mx-auto mb-4 border border-border/60 shadow-2xs">
            <Icon className="size-7" aria-hidden={true} />
          </div>
        )}

        <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug">
          {title}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mt-1.5">
            {description}
          </p>
        )}

        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {action}
            {secondaryAction}
          </div>
        )}

        {children}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
