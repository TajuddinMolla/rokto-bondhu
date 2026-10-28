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
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  locale: Locale;
}

export function AdminLayoutShell({ children, locale }: AdminLayoutShellProps) {
  const pathname = usePathname();

  const prefix = locale === "en" ? "/en/admin" : "/admin";

  const navItems = [
    {
      label: locale === "en" ? "Dashboard" : "ড্যাশবোর্ড",
      href: prefix,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: locale === "en" ? "Donors" : "রক্তদাতা",
      href: `${prefix}/donors`,
      icon: Users,
    },
    {
      label: locale === "en" ? "Blood Requests" : "রক্তের অনুরোধ",
      href: `${prefix}/requests`,
      icon: Droplets,
    },
    {
      label: locale === "en" ? "Users" : "ব্যবহারকারী",
      href: `${prefix}/users`,
      icon: UserCheck,
    },
    {
      label: locale === "en" ? "Reports Queue" : "অভিযোগের তালিকা",
      href: `${prefix}/reports`,
      icon: AlertTriangle,
    },
    {
      label: locale === "en" ? "Audit Logs" : "অডিট লগ",
      href: `${prefix}/audit-logs`,
      icon: History,
    },
  ];

  return (
    <main className="flex-1 bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Section Header matching Public Account Style */}
        <div className="space-y-2 text-center sm:text-left">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            <ShieldCheck className="size-3.5 mr-1.5" aria-hidden="true" />
            {locale === "en" ? "Admin Console" : "প্রশাসনিক ড্যাশবোর্ড"}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {locale === "en"
              ? "Administration & Moderation"
              : "প্রশাসনিক প্যানেল ও মডারেশন"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {locale === "en"
              ? "Manage registered donors, emergency blood requests, user accounts, and community reports."
              : "প্ল্যাটফর্মের রক্তদাতা, জরুরি রক্তের অনুরোধ, ব্যবহারকারী অ্যাকাউন্ট এবং রিপোর্টসমূহ পরিচালনা করুন।"}
          </p>
        </div>

        {/* Navigation Tabs Bar */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none"
          aria-label={
            locale === "en" ? "Admin Sections" : "প্রশাসনিক সেকশনসমূহ"
          }
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
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Page Content */}
        <div>{children}</div>
      </div>
    </main>
  );
}
