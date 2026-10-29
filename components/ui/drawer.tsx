"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Drawer({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const titleId = React.useId();
  const descriptionId = React.useId();

  return (
    <DrawerContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </DrawerContext.Provider>
  );
}

interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) {
            setOpen(true);
          }
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DrawerTrigger.displayName = "DrawerTrigger";

function DrawerPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open, setOpen } = useDrawerContext();

  if (!open) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onClick={() => setOpen(false)}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200",
        className
      )}
      {...props}
    />
  );
});
DrawerOverlay.displayName = "DrawerOverlay";

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hideHandle?: boolean;
  hideCloseButton?: boolean;
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, hideHandle = false, hideCloseButton = false, ...props }, ref) => {
    const { open, setOpen, titleId, descriptionId } = useDrawerContext();

    // Lock body scroll when drawer is open
    React.useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [open]);

    // Handle Escape key
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-border bg-surface text-foreground shadow-2xl max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300 focus:outline-none",
            className
          )}
          {...props}
        >
          {!hideHandle && (
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/25" />
            </div>
          )}

          {!hideCloseButton && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer touch-manipulation z-10"
              aria-label="Close drawer"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        </div>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 pb-4 border-b border-border/80 text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border/80 gap-2 sm:gap-0 mt-auto",
      className
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { titleId } = useDrawerContext();
  return (
    <h2
      ref={ref}
      id={titleId}
      className={cn("text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug", className)}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId } = useDrawerContext();
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn("text-xs sm:text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
});
DrawerDescription.displayName = "DrawerDescription";

const DrawerClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useDrawerContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      className={className}
      {...props}
    />
  );
});
DrawerClose.displayName = "DrawerClose";

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};

