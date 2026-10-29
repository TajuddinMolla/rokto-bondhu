"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a <Tabs />");
  }
  return context;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange]
    );

    const baseId = React.useId();

    return (
      <TabsContext.Provider value={{ value, setValue, baseId }}>
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex h-11 items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/80 overflow-x-auto max-w-full scrollbar-none",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value: triggerValue, onClick, disabled, ...props }, ref) => {
    const { value, setValue, baseId } = useTabsContext();
    const isSelected = value === triggerValue;

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        id={`${baseId}-tab-${triggerValue}`}
        aria-controls={`${baseId}-panel-${triggerValue}`}
        aria-selected={isSelected}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) {
            setValue(triggerValue);
          }
        }}
        data-state={isSelected ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none touch-manipulation",
          isSelected
            ? "bg-surface text-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value: contentValue, children, ...props }, ref) => {
    const { value, baseId } = useTabsContext();
    const isSelected = value === contentValue;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${contentValue}`}
        aria-labelledby={`${baseId}-tab-${contentValue}`}
        tabIndex={0}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg animate-in fade-in duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
