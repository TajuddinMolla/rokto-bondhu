"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  createModerationActionSchema,
  type ModerationActionFormData,
} from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import type { Locale } from "@/i18n/config";

interface ModerationActionDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  targetTitle?: string;
  confirmLabel: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  locale: Locale;
  onConfirm: (reason: string) => Promise<void> | void;
  onCancel: () => void;
}

export function ModerationActionDialog({
  isOpen,
  title,
  description,
  targetTitle,
  confirmLabel,
  isDestructive = true,
  isLoading = false,
  locale,
  onConfirm,
  onCancel,
}: ModerationActionDialogProps) {
  const schema = React.useMemo(
    () => createModerationActionSchema(locale),
    [locale],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModerationActionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
    },
  });

  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      reset({ reason: "" });
    }
  }

  if (!isOpen) return null;

  const onSubmit = (data: ModerationActionFormData) => {
    onConfirm(data.reason);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg">
        <Card className="border-border shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2.5 text-foreground">
                <div
                  className={`flex size-9 items-center justify-center rounded-lg ${
                    isDestructive
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <AlertTriangle className="size-5" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold">
                  {title}
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </CardDescription>

              {targetTitle && (
                <div className="mt-2 p-2.5 rounded-md bg-muted/60 text-xs font-medium text-foreground">
                  <span className="text-muted-foreground">
                    {locale === "en" ? "Target: " : "বিষয়: "}
                  </span>
                  <span className="font-semibold">{targetTitle}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <FormField
                id="moderation-reason"
                label={
                  locale === "en"
                    ? "Mandatory Moderation Reason"
                    : "মডারেশনের কারণ (বাধ্যতামূলক)"
                }
                error={errors.reason?.message}
                required
                helperText={
                  locale === "en"
                    ? "This explanation is permanently recorded in the immutable audit log."
                    : "এই বিবরণটি স্থায়ীভাবে অপরিবর্তনীয় অডিট লগে সংরক্ষিত হবে।"
                }
              >
                <Textarea
                  id="moderation-reason"
                  placeholder={
                    locale === "en"
                      ? "Explain the justification for this action..."
                      : "এই পদক্ষেপ গ্রহণের কারণ বিস্তারিত লিখুন..."
                  }
                  rows={3}
                  className="resize-none"
                  {...register("reason")}
                />
              </FormField>
            </CardContent>

            <CardFooter className="flex justify-end gap-2.5 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                {locale === "en" ? "Cancel" : "বাতিল"}
              </Button>

              <Button
                type="submit"
                variant={isDestructive ? "destructive" : "default"}
                size="sm"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                )}
                {confirmLabel}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
