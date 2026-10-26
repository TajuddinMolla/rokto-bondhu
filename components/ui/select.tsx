import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <select
          className={cn(
            "w-full h-10 appearance-none rounded-md border border-input bg-surface pl-3 pr-9 py-2 text-base md:text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 disabled:hover:border-input enabled:hover:border-primary/50 cursor-pointer",
            className
          )}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-opacity",
            disabled ? "opacity-30" : "opacity-70"
          )}
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
