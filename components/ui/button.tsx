import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active",
        subtle:
          "border border-primary-border bg-primary-subtle text-primary shadow-xs hover:bg-primary/15 hover:border-primary/40",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:bg-destructive/95",
        outline:
          "border border-border bg-surface text-foreground shadow-xs hover:bg-muted hover:text-foreground hover:border-border/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/90",
        ghost:
          "hover:bg-muted text-foreground/85 hover:text-foreground active:scale-100",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-11 sm:h-10 px-4 py-2",
        sm: "h-9 sm:h-8 rounded-md px-3 text-xs",
        lg: "h-12 sm:h-11 rounded-xl px-7 text-base font-semibold",
        icon: "h-11 w-11 sm:h-10 sm:w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
