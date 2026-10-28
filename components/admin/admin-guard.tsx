"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";

import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Locale } from "@/i18n/config";

interface AdminGuardProps {
  children: React.ReactNode;
  locale: Locale;
}

export function AdminGuard({ children, locale }: AdminGuardProps) {
  const { isAdmin, loading, isAuthenticated } = useAdmin();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
        <Loader2
          className="size-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted-foreground">
          {locale === "en"
            ? "Verifying administrative authorization..."
            : "প্রশাসনিক অনুমোদন যাচাই করা হচ্ছে..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-6">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg text-center">
          <CardHeader className="space-y-3 pb-4">
            <div className="mx-auto size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="size-8" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
              {locale === "en" ? "Access Restricted" : "অননুমোদিত প্রবেশাধিকার"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "This administrative area requires authorized moderator privileges. Your current session does not hold the necessary security credentials."
                : "এই প্রশাসনিক অংশে প্রবেশের জন্য মডারেটর অনুমতির প্রয়োজন। আপনার বর্তমান অ্যাকাউন্টে প্রয়োজনীয় নিরাপত্তা অধিকার নেই।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="default" className="w-full">
              <Link href={locale === "en" ? "/en" : "/"}>
                <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
                {locale === "en" ? "Return to Homepage" : "মূল পাতায় ফিরে যান"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
