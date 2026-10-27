import * as React from "react";
import Link from "next/link";
import {
  Droplet,
  ArrowLeft,
  Heart,
  ShieldCheck,
  MapPin,
  Quote,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export interface AuthLayoutProps {
  locale: Locale;
  badgeText: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  maxWidth?: "md" | "lg";
}

export function AuthLayout({
  locale,
  badgeText,
  title,
  subtitle,
  children,
  footerContent,
  maxWidth = "md",
}: AuthLayoutProps) {
  const t = getTranslations(locale);
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* =========================================
          LEFT PANE: Immersive Brand Showcase (Desktop)
          ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-slate-950 text-white select-none">
        {/* Subtle Decorative Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-primary/15 blur-3xl"
          aria-hidden="true"
        />
        {/* Subtle Dot Pattern Overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30"
          aria-hidden="true"
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex items-center gap-3 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-slate-950"
            aria-label={`${t.brand.name} ${t.nav.home}`}
          >
            <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-primary to-rose-700 text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-200">
              <Droplet className="size-6 fill-current animate-pulse" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-tight">
                {t.brand.name}
              </span>
              <span className="text-xs font-medium text-slate-400 tracking-wide">
                {t.brand.tagline}
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Mission & Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto py-10 max-w-lg">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full"
            >
              <Heart className="size-3.5 mr-1.5 fill-current" aria-hidden="true" />
              {t.brand.name}
            </Badge>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t.auth.layout.heroHeading}
            </h1>

            <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
              {t.auth.layout.heroSubtitle}
            </p>
          </div>

          {/* Feature Highlight List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5 group">
              <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 text-rose-400 shrink-0 group-hover:bg-primary/20 transition-colors">
                <Heart className="size-4.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white">
                  {t.auth.layout.feature1Title}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {t.auth.layout.feature1Desc}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <ShieldCheck className="size-4.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white">
                  {t.auth.layout.feature2Title}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {t.auth.layout.feature2Desc}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <MapPin className="size-4.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white">
                  {t.auth.layout.feature3Title}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {t.auth.layout.feature3Desc}
                </div>
              </div>
            </div>
          </div>

          {/* Glassmorphism Quote Card */}
          <div className="relative rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md space-y-2.5">
            <Quote className="size-5 text-primary opacity-60" aria-hidden="true" />
            <p className="text-xs xl:text-sm text-slate-200 italic leading-relaxed">
              &ldquo;{t.auth.layout.quote}&rdquo;
            </p>
            <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              — {t.auth.layout.quoteAuthor}
            </div>
          </div>
        </div>

        {/* Bottom: Localized Copyright Note */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 {t.footer.copyright}
        </div>
      </div>

      {/* =========================================
          RIGHT PANE: Focused Authentication Form
          ========================================= */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-12 min-h-screen bg-surface">
        {/* Top Action Bar: Back to Home + Language Switcher */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-4 pb-4">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            <span>{t.auth.layout.backToHome}</span>
          </Link>

          {/* Mobile Brand Link (visible only when left pane is hidden) */}
          <Link
            href={homeHref}
            className="lg:hidden flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${t.brand.name} ${t.nav.home}`}
          >
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Droplet className="size-4 fill-current" aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-foreground">
              {t.brand.name}
            </span>
          </Link>

          <LanguageSwitcher />
        </div>

        {/* Center: Auth Card & Form */}
        <div className="w-full flex items-center justify-center py-4">
          <div
            className={`w-full ${
              maxWidth === "lg" ? "max-w-xl" : "max-w-md"
            } space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm sm:shadow-md transition-all">
              {/* Top Accent Gradient Border */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-rose-600"
                aria-hidden="true"
              />

              {/* Form Header */}
              <div className="space-y-2.5 pb-6 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
                  >
                    <ShieldCheck className="size-3.5 mr-1.5" aria-hidden="true" />
                    {badgeText}
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Form Body */}
              <div className="space-y-6">
                {children}

                {footerContent ? (
                  <div className="pt-4 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
                    {footerContent}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spacer for Mobile Balancing */}
        <div className="w-full max-w-xl mx-auto py-2 text-center text-[11px] text-muted-foreground lg:hidden">
          © 2026 {t.footer.copyright}
        </div>
      </div>
    </div>
  );
}
