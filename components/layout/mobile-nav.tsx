"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Droplet, LogOut, AlertCircle, Bell } from "lucide-react";

import { getLocaleFromPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsDonor } from "@/hooks/use-is-donor";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  // Synchronize state during render when route changes (React 19 recommended pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);
  const { user, status, loading, logout } = useAuth();
  const { isDonor } = useIsDonor();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);
  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale);

  const homeHref = currentLocale === "en" ? "/en" : "/";
  const prefix = currentLocale === "en" ? "/en" : "";
  const accountHref = currentLocale === "en" ? "/en/account" : "/account";
  const primaryAction = userNavItems.find((item) => item.isPrimary);
  const secondaryAction = userNavItems.find((item) => !item.isPrimary);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push(homeHref);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="md:hidden flex items-center gap-2">
      <LanguageSwitcher />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? t.accessibility.closeMenu : t.accessibility.openMenu}
        className="text-foreground hover:bg-muted"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {isOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label={t.accessibility.openMenu}
          className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-md border-b border-border flex flex-col p-6 overflow-y-auto animate-in fade-in-50 duration-200"
        >
          {/* Mobile Language Switcher Card */}
          <div className="mb-6">
            <LanguageSwitcher variant="mobile" />
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
              {currentLocale === "bn" ? "মেনু" : "Navigation"}
            </span>
            <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation Links">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border pt-6 flex flex-col space-y-3 mt-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
              {currentLocale === "bn" ? "অ্যাকাউন্ট ও পদক্ষেপ" : "Account & Actions"}
            </span>

            {!loading && status === "authenticated" && user ? (
              <div className="space-y-3">
                {/* User Info Card (Links to Account Dashboard) */}
                <Link
                  href={accountHref}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {!user.emailVerified ? (
                    <span className="inline-flex items-center text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-medium shrink-0">
                      <AlertCircle className="size-3 mr-1" aria-hidden="true" />
                      {t.auth.userMenu.verifyNow}
                    </span>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 text-[11px] shrink-0">
                      {t.auth.verifyEmail.statusVerified}
                    </Badge>
                  )}
                </Link>

                {/* Notifications Quick Link */}
                <Link
                  href={`${prefix}/account/notifications`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Bell className="size-4.5" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {currentLocale === "bn" ? "বিজ্ঞপ্তি কেন্দ্র" : "Notifications"}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="text-xs font-bold px-2 py-0.5">
                      {unreadCount} {currentLocale === "bn" ? "নতুন" : "new"}
                    </Badge>
                  )}
                </Link>

                {!isDonor && primaryAction && (
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="w-full justify-center shadow-sm"
                  >
                    <Link href={primaryAction.href} onClick={() => setIsOpen(false)}>
                      <Droplet className="size-4 fill-current mr-2" />
                      {primaryAction.label}
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogout}
                  className="w-full justify-center text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4 mr-2" />
                  {t.auth.userMenu.logout}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {secondaryAction && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full justify-center"
                  >
                    <Link href={secondaryAction.href} onClick={() => setIsOpen(false)}>
                      {secondaryAction.label}
                    </Link>
                  </Button>
                )}

                {primaryAction && (
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="w-full justify-center shadow-sm"
                  >
                    <Link href={primaryAction.href} onClick={() => setIsOpen(false)}>
                      <Droplet className="size-4 fill-current mr-2" />
                      {primaryAction.label}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
