"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  LogOut,
  Home,
  Heart,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import type { Locale } from "@/i18n/config";

export interface VerifyEmailViewProps {
  locale: Locale;
}

export function VerifyEmailView({ locale }: VerifyEmailViewProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const { user, status, loading, isEmailVerified, sendVerification, refreshUser, logout } =
    useAuth();

  const [isChecking, setIsChecking] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const prefix = locale === "en" ? "/en" : "";
  const homeHref = prefix || "/";
  const loginHref = `${prefix}/login`;
  const donorRegisterHref = `${prefix}/donors/register`;

  // Redirect to login if user is not authenticated and finished loading
  React.useEffect(() => {
    if (!loading && status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [loading, status, router, loginHref]);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setActionError(null);
    try {
      await refreshUser();
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      setActionError(getFirebaseErrorMessage(fbErr?.code || "auth/generic-error", locale));
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setActionError(null);
    setResendMessage(null);
    try {
      await sendVerification();
      setResendMessage(t.auth.verifyEmail.resendSuccess);
      setResendCooldown(60);
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      setActionError(getFirebaseErrorMessage(fbErr?.code || "auth/generic-error", locale));
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(homeHref);
  };

  if (loading) {
    return (
      <AuthLayout
        locale={locale}
        badgeText={t.auth.verifyEmail.badge}
        title={t.auth.verifyEmail.title}
        subtitle={t.auth.verifyEmail.subtitle}
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t.auth.verifyEmail.checkingButton}</p>
        </div>
      </AuthLayout>
    );
  }

  // State: Email is already verified
  if (isEmailVerified) {
    return (
      <AuthLayout
        locale={locale}
        badgeText={t.auth.verifyEmail.badge}
        title={t.auth.verifyEmail.verifiedSuccessTitle}
        subtitle={t.auth.verifyEmail.verifiedSuccessDesc}
      >
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto space-y-1">
            <span className="block font-semibold text-foreground">
              {t.auth.verifyEmail.currentEmailLabel}:
            </span>
            <span className="font-mono text-foreground break-all">{user?.email}</span>
            <div className="pt-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                {t.auth.verifyEmail.statusVerified}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="default" className="w-full sm:w-auto shadow-sm">
              <Link href={donorRegisterHref}>
                <Heart className="size-4 mr-1.5 fill-current" aria-hidden="true" />
                {t.auth.verifyEmail.goToDonorRegisterButton}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={homeHref}>
                <Home className="size-4 mr-1.5" aria-hidden="true" />
                {t.auth.verifyEmail.goToHomeButton}
              </Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // State: Email is pending verification
  return (
    <AuthLayout
      locale={locale}
      badgeText={t.auth.verifyEmail.badge}
      title={t.auth.verifyEmail.title}
      subtitle={t.auth.verifyEmail.subtitle}
    >
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Mail className="size-8" aria-hidden="true" />
        </div>

        {/* Notice Card */}
        <div className="space-y-2 text-left bg-surface rounded-xl p-4 sm:p-5 border border-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.auth.verifyEmail.currentEmailLabel}
            </span>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/5 text-[11px]">
              {t.auth.verifyEmail.statusUnverified}
            </Badge>
          </div>
          <div className="font-mono text-sm font-bold text-foreground break-all">
            {user?.email}
          </div>
          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
            {t.auth.verifyEmail.sentNoticeDesc}
          </p>
        </div>

        {/* Resend success notice */}
        {resendMessage && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium animate-in fade-in duration-200"
          >
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{resendMessage}</span>
          </div>
        )}

        {/* Action Error notice */}
        {actionError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in duration-200"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed">{actionError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-11 text-base font-semibold shadow-sm"
          >
            {isChecking ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                {t.auth.verifyEmail.checkingButton}
              </>
            ) : (
              <>
                <RefreshCw className="size-4 mr-2" aria-hidden="true" />
                {t.auth.verifyEmail.checkStatusButton}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                {t.auth.verifyEmail.resendingButton}
              </>
            ) : resendCooldown > 0 ? (
              <>
                {t.auth.verifyEmail.resendButton} ({resendCooldown}s)
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" aria-hidden="true" />
                {t.auth.verifyEmail.resendButton}
              </>
            )}
          </Button>
        </div>

        {/* Logout Option */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
          >
            <LogOut className="size-3.5 mr-1.5" aria-hidden="true" />
            {t.auth.verifyEmail.logoutButton}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
