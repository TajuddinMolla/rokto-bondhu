"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import { z } from "zod";
import {
  ShieldCheck,
  AlertCircle,
  Edit3,
  Loader2,
  CheckCircle2,
  LogOut,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

import { BD_PHONE_REGEX } from "@/lib/validations/donor";
import type { UserProfile } from "@/types/user";
import type { AuthUser } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import type { Locale } from "@/i18n/config";

interface AccountDetailsCardProps {
  user: AuthUser;
  userProfile?: UserProfile | null;
  onUpdateUser: (data: { displayName: string; phoneNumber?: string }) => Promise<void>;
  onLogout: () => Promise<void>;
  locale: Locale;
}

export function AccountDetailsCard({
  user,
  userProfile,
  onUpdateUser,
  onLogout,
  locale,
}: AccountDetailsCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const accountSchema = React.useMemo(() => {
    return z.object({
      displayName: z
        .string()
        .trim()
        .min(
          2,
          locale === "en"
            ? "Name must be at least 2 characters"
            : "নাম কমপক্ষে ২ অক্ষরের হতে হবে"
        ),
      phoneNumber: z
        .string()
        .trim()
        .regex(
          BD_PHONE_REGEX,
          locale === "en"
            ? "Enter a valid Bangladeshi phone number"
            : "সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন"
        )
        .optional()
        .or(z.literal("")),
    });
  }, [locale]);

  type AccountFormValues = z.infer<typeof accountSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(accountSchema as any),
    defaultValues: {
      displayName: userProfile?.displayName || user.displayName || "",
      phoneNumber: userProfile?.phoneNumber || "",
    },
  });

  React.useEffect(() => {
    if (userProfile || user) {
      reset({
        displayName: userProfile?.displayName || user.displayName || "",
        phoneNumber: userProfile?.phoneNumber || "",
      });
    }
  }, [userProfile, user, reset]);

  const onSubmit = async (data: AccountFormValues) => {
    try {
      await onUpdateUser({
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || undefined,
      });
      setIsEditing(false);
    } catch {
      // Error handled by parent / mutation
    }
  };

  const handleSignOutClick = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = userProfile?.displayName || user.displayName || (locale === "en" ? "User" : "ব্যবহারকারী");
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Card className="rounded-3xl border border-border/80 bg-surface shadow-xs overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-border/70 bg-surface">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-rose-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs ring-4 ring-primary/10">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground truncate">
              {displayName}
            </CardTitle>
            <span className="text-xs text-muted-foreground block font-mono truncate max-w-[200px]">
              {user.email}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
        {/* Verification Status */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium text-xs">
              {locale === "en" ? "Email Status" : "ইমেইল অবস্থা"}
            </span>
          </div>
          {user.emailVerified ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-[11px]"
            >
              <ShieldCheck className="size-3 mr-1" />
              <span>{locale === "en" ? "Verified" : "যাচাইকৃত"}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold text-[11px]"
            >
              <AlertCircle className="size-3 mr-1" />
              <span>{locale === "en" ? "Unverified" : "যাচাইহীন"}</span>
            </Badge>
          )}
        </div>

        {/* View Mode Fields */}
        {!isEditing ? (
          <div className="space-y-3.5">
            <div>
              <span className="text-muted-foreground block text-xs mb-1">
                {locale === "en" ? "Contact Phone Number" : "যোগাযোগের ফোন নম্বর"}
              </span>
              <div className="flex items-center gap-2 font-mono font-semibold text-foreground">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>{userProfile?.phoneNumber || (locale === "en" ? "Not set" : "দেওয়া হয়নি")}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-xs mb-1">
                {locale === "en" ? "Member Since" : "নিবন্ধনের তারিখ"}
              </span>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex flex-col gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full justify-center gap-2 min-h-[42px] rounded-xl font-bold cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>{locale === "en" ? "Edit Account Details" : "অ্যাকাউন্ট তথ্য সম্পাদনা"}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOutClick}
                disabled={isLoggingOut}
                className="w-full justify-center text-destructive hover:bg-destructive/10 gap-2 min-h-[42px] rounded-xl font-bold cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <LogOut className="size-3.5" />
                )}
                <span>{locale === "en" ? "Sign Out" : "লগআউট"}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1 animate-in fade-in duration-150">
            <FormField
              id="acc-displayName"
              label={locale === "en" ? "Full Name" : "পুরো নাম"}
              required
              error={errors.displayName?.message}
            >
              <Input
                id="acc-displayName"
                className="min-h-[44px] rounded-xl text-xs sm:text-sm"
                {...register("displayName")}
              />
            </FormField>

            <FormField
              id="acc-phoneNumber"
              label={locale === "en" ? "Phone Number" : "ফোন নম্বর"}
              error={errors.phoneNumber?.message}
            >
              <Input
                id="acc-phoneNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                className="min-h-[44px] rounded-xl font-mono text-xs sm:text-sm"
                {...register("phoneNumber")}
              />
            </FormField>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  reset();
                  setIsEditing(false);
                }}
                disabled={isSubmitting}
                className="flex-1 min-h-[42px] rounded-xl font-semibold cursor-pointer"
              >
                <span>{locale === "en" ? "Cancel" : "বাতিল"}</span>
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="flex-1 min-h-[42px] rounded-xl font-bold gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>{locale === "en" ? "Save Changes" : "সংরক্ষণ করুন"}</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
