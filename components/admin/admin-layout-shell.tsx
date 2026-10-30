"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Droplets,
  UserCheck,
  AlertTriangle,
  History,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/queries/use-admin-data";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  locale: Locale;
}

export function AdminLayoutShell({ children, locale }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const { data: stats } = useAdminStats();

  const prefix = locale === "en" ? "/en/admin" : "/admin";
  const publicHomeHref = locale === "en" ? "/en" : "/";

  const navItems = [
    {
      label: locale === "en" ? "Dashboard" : "ড্যাশবোর্ড",
      href: prefix,
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      label: locale === "en" ? "Donors" : "রক্তদাতা",
      href: `${prefix}/donors`,
      icon: Users,
      badge: stats?.activeDonors ? stats.activeDonors.toLocaleString() : null,
    },
    {
      label: locale === "en" ? "Blood Requests" : "রক্তের অনুরোধ",
      href: `${prefix}/requests`,
      icon: Droplets,
      badge: stats?.openRequests ? stats.openRequests.toLocaleString() : null,
    },
    {
      label: locale === "en" ? "Users" : "ব্যবহারকারী",
      href: `${prefix}/users`,
      icon: UserCheck,
      badge: null,
    },
    {
      label: locale === "en" ? "Reports Queue" : "অভিযোগের তালিকা",
      href: `${prefix}/reports`,
      icon: AlertTriangle,
      badge: stats && stats.pendingReports > 0 ? stats.pendingReports : null,
      isAlertBadge: true,
    },
    {
      label: locale === "en" ? "Audit Logs" : "অডিট লগ",
      href: `${prefix}/audit-logs`,
      icon: History,
      badge: null,
    },
  ];

  return (
    <main className="flex-1 bg-background py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Executive Admin Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] via-surface to-rose-500/[0.04] p-5 sm:p-7 shadow-xs">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs font-bold rounded-full shadow-2xs gap-1.5"
                >
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  <span>{locale === "en" ? "Admin Console" : "প্রশাসনিক ড্যাশবোর্ড"}</span>
                </Badge>

                {/* Security Guard Operational Beacon */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                  </span>
                  <span>{locale === "en" ? "Security Active" : "নিরাপত্তা গার্ড সক্রিয়"}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                {locale === "en"
                  ? "Administration & Community Safety"
                  : "প্ল্যাটফর্ম প্রশাসন ও কমিউনিটি সুরক্ষা"}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {locale === "en"
                  ? "Manage voluntary donor profiles, verify emergency blood requests, protect personal contact information, and resolve user safety reports."
                  : "স্বেচ্ছাসেবী রক্তদাতা প্রোফাইল, জরুরি রক্তের অনুরোধ পর্যবেক্ষণ, ফোন নম্বরের নিরাপত্তা এবং কমিউনিটি রিপোর্ট দ্রুত সমাধান করুন।"}
              </p>
            </div>

            {/* Quick Link back to Public Portal */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-semibold shadow-2xs">
                <Link href={publicHomeHref}>
                  <span>{locale === "en" ? "Public Portal" : "মূল ওয়েবসাইট"}</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Elevated Segmented Navigation Bar */}
        <div className="border-b border-border/80 pb-1">
          <nav
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-2"
            aria-label={locale === "en" ? "Admin Navigation" : "প্রশাসনিক মেনু"}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "bg-surface hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>

                  {item.badge ? (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        item.isAlertBadge
                          ? "bg-destructive text-destructive-foreground animate-pulse"
                          : isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Page Content */}
        <div>{children}</div>
      </div>
    </main>
  );
}
