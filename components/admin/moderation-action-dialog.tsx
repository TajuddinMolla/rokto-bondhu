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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const onSubmit = (data: ModerationActionFormData) => {
    onConfirm(data.reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-foreground">
              <div
                className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${
                  isDestructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <AlertTriangle className="size-5" />
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription>{description}</DialogDescription>

            {targetTitle && (
              <div className="mt-2 p-2.5 rounded-xl bg-muted/60 text-xs font-medium text-foreground">
                <span className="text-muted-foreground">
                  {locale === "en" ? "Target: " : "বিষয়: "}
                </span>
                <span className="font-semibold">{targetTitle}</span>
              </div>
            )}
          </DialogHeader>

          <DialogBody>
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
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onCancel}
              disabled={isLoading}
              className="min-h-[44px] rounded-xl px-5"
            >
              {locale === "en" ? "Cancel" : "বাতিল"}
            </Button>

            <Button
              type="submit"
              variant={isDestructive ? "destructive" : "default"}
              size="default"
              disabled={isLoading}
              className="min-h-[44px] rounded-xl px-5 gap-2"
            >
              {isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              <span>{confirmLabel}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
