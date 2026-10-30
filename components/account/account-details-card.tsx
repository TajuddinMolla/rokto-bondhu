"use client";

import * as React from "react";
import Link from "next/link";
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
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
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
  const { claimAdmin } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isClaimingAdmin, setIsClaimingAdmin] = React.useState(false);
  const [claimFeedback, setClaimFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleClaimAdminClick = async () => {
    setIsClaimingAdmin(true);
    setClaimFeedback(null);
    try {
      if (claimAdmin) {
        const res = await claimAdmin();
        setClaimFeedback({
          type: "success",
          message:
            locale === "en"
              ? res.message || "Administrative privileges successfully claimed!"
              : "অভিনন্দন! আপনার অ্যাকাউন্টে অ্যাডমিন ও সকল প্ল্যাটফর্ম পারমিশন সফলভাবে সক্রিয় করা হয়েছে।",
        });
      }
    } catch (err) {
      setClaimFeedback({
        type: "error",
        message:
          (err as Error)?.message ||
          (locale === "en"
            ? "Failed to activate administrative privileges."
            : "অ্যাডমিন পারমিশন সক্রিয় করতে ব্যর্থ হয়েছে।"),
      });
    } finally {
      setIsClaimingAdmin(false);
    }
  };

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

        {/* Administrative Status & Capability Controls */}
        {user.isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-rose-500/10 to-amber-500/10 border border-primary/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-xs shrink-0 mt-0.5">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5 flex-wrap">
                    <span>{locale === "en" ? "System Administrator" : "সিস্টেম অ্যাডমিনিস্ট্রেটর"}</span>
                    <Badge variant="default" className="text-[10px] font-black px-1.5 py-0 bg-primary text-white">
                      FULL ACCESS
                    </Badge>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {locale === "en"
                      ? "Full authority to manage donors, requests, users, reports, and site data."
                      : "রক্তদাতা, রক্তের অনুরোধ, ব্যবহারকারী, রিপোর্ট ও সাইট সেটিংস পরিচালনার পূর্ণ ক্ষমতা সক্রিয়।"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                asChild
                size="sm"
                className="font-bold gap-1.5 rounded-xl shadow-xs text-xs h-8 flex-1"
              >
                <Link href={locale === "en" ? "/en/admin" : "/admin"}>
                  <ExternalLink className="size-3.5" />
                  <span>{locale === "en" ? "Admin Panel" : "অ্যাডমিন প্যানেল"}</span>
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClaimAdminClick}
                disabled={isClaimingAdmin}
                className="text-xs h-8 gap-1.5 rounded-xl font-semibold cursor-pointer"
              >
                {isClaimingAdmin ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                <span>{locale === "en" ? "Sync Privileges" : "পারমিশন রিফ্রেশ"}</span>
              </Button>
            </div>

            {claimFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  claimFeedback.type === "success"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
                }`}
              >
                {claimFeedback.type === "success" ? (
                  <CheckCircle2 className="size-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="size-3.5 shrink-0" />
                )}
                <span>{claimFeedback.message}</span>
              </div>
            )}
          </div>
        )}

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
