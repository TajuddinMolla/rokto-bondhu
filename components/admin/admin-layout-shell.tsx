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
  Menu,
  X,
  Droplet,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  locale: Locale;
}

export function AdminLayoutShell({ children, locale }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const prefix = locale === "en" ? "/en/admin" : "/admin";
  const homeHref = locale === "en" ? "/en" : "/";

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
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>

          <Link
            href={prefix}
            className="flex items-center gap-2 font-bold text-foreground"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplet className="size-4 fill-current" />
            </div>
            <span className="text-base sm:text-lg tracking-tight font-extrabold">
              {locale === "en" ? "RoktoBondhu" : "রক্তবন্ধু"}
            </span>
          </Link>

          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 text-[11px] font-semibold flex items-center gap-1 py-0.5"
          >
            <ShieldCheck className="size-3" />
            {locale === "en" ? "Moderation" : "মডারেশন"}
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex text-xs"
          >
            <Link href={homeHref} target="_blank" rel="noopener noreferrer">
              <span>{locale === "en" ? "Public Portal" : "মূল পোর্টাল"}</span>
              <ExternalLink className="size-3 ml-1.5 opacity-70" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 p-4 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border p-4 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-bold text-sm text-foreground">
                  {locale === "en" ? "Admin Navigation" : "প্রশাসনিক মেনু"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <nav className="mt-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Admin Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
