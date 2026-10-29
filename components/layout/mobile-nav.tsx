"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Droplet,
  LogOut,
  AlertCircle,
  Bell,
  ShieldCheck,
  Home,
  Search,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

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

  // Synchronize state during render when route changes (React 19 pattern)
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
  const accountHref = `${prefix}/account`;
  const myRequestsHref = `${prefix}/account/requests`;
  const contactRequestsHref = `${prefix}/account/contact-requests`;
  const notificationsHref = `${prefix}/account/notifications`;
  const adminHref = `${prefix}/admin`;
  const verifyEmailHref = `${prefix}/verify-email`;

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
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push(homeHref);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  const getNavIcon = (href: string) => {
    if (href === "/" || href === "/en") return Home;
    if (href.includes("/donors")) return Search;
    if (href.includes("/blood-request")) return Droplet;
    return Droplet;
  };

  return (
    <div className="md:hidden flex items-center gap-2">
      <LanguageSwitcher />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={
          isOpen ? t.accessibility.closeMenu : t.accessibility.openMenu
        }
        className="flex items-center justify-center size-11 rounded-xl border border-border bg-surface text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-manipulation cursor-pointer"
      >
        {isOpen ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label={t.accessibility.openMenu}
          className="fixed inset-0 top-16 z-50 flex flex-col bg-background/98 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 max-w-lg mx-auto w-full">
            {/* Language Switcher Card */}
            <LanguageSwitcher variant="mobile" />

            {/* Main Navigation Links */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
                {currentLocale === "bn" ? "প্রধান মেনু" : "Navigation"}
              </span>

              <nav className="space-y-1.5" aria-label="Mobile Navigation Links">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const NavIcon = getNavIcon(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-xl text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation",
                        isActive
                          ? "bg-primary-subtle text-primary font-bold shadow-2xs border border-primary-border"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <NavIcon
                          className={cn(
                            "size-5",
                            isActive ? "text-primary fill-primary/20" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" aria-hidden="true" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Account & Actions Section */}
            <div className="border-t border-border pt-6 space-y-3 mt-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
                {currentLocale === "bn"
                  ? "অ্যাকাউন্ট ও নিরাপত্তা"
                  : "Account & Profile"}
              </span>

              {!loading && status === "authenticated" && user ? (
                <div className="space-y-3">
                  {/* User Profile Card */}
                  <Link
                    href={accountHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-surface hover:bg-muted/50 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 ring-1 ring-primary/20">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {!user.emailVerified ? (
                      <Link
                        href={verifyEmailHref}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 font-semibold shrink-0"
                      >
                        <AlertCircle className="size-3 mr-1" aria-hidden="true" />
                        {t.auth.userMenu.verifyNow}
                      </Link>
                    ) : (
                      <Badge variant="available" className="text-[11px] shrink-0">
                        {t.auth.verifyEmail.statusVerified}
                      </Badge>
                    )}
                  </Link>

                  {/* Navigation Grid for User Modules */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={myRequestsHref}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface hover:bg-muted/50 text-xs font-semibold text-foreground transition-colors"
                    >
                      <FileText className="size-4 text-primary shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {currentLocale === "en" ? "My Requests" : "আমার অনুরোধ"}
                      </span>
                    </Link>

                    <Link
                      href={contactRequestsHref}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface hover:bg-muted/50 text-xs font-semibold text-foreground transition-colors"
                    >
                      <MessageSquare className="size-4 text-primary shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {currentLocale === "en" ? "Contact Requests" : "যোগাযোগের তালিকা"}
                      </span>
                    </Link>
                  </div>

                  {/* Notifications Hub Shortcut */}
                  <Link
                    href={notificationsHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Bell className="size-4.5" aria-hidden="true" />
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

                  {/* Admin Console Shortcut */}
                  {user.isAdmin && (
                    <Link
                      href={adminHref}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground shrink-0">
                          <ShieldCheck className="size-4.5" aria-hidden="true" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground block">
                            {currentLocale === "bn" ? "প্রশাসনিক প্যানেল" : "Admin Console"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {currentLocale === "bn" ? "প্ল্যাটফর্ম ব্যবস্থাপনা" : "Management"}
                          </span>
                        </div>
                      </div>
                      <Badge variant="subtle" className="text-xs font-semibold">
                        Admin
                      </Badge>
                    </Link>
                  )}

                  {/* Become a Donor CTA (if not donor) */}
                  {!isDonor && primaryAction && (
                    <Button
                      asChild
                      variant="default"
                      size="lg"
                      className="w-full justify-center shadow-xs font-semibold min-h-[48px]"
                    >
                      <Link href={primaryAction.href} onClick={() => setIsOpen(false)}>
                        <Droplet className="size-4.5 fill-current mr-2" aria-hidden="true" />
                        {primaryAction.label}
                      </Link>
                    </Button>
                  )}

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLogout}
                    className="w-full justify-center text-destructive hover:bg-destructive/10 min-h-[48px] font-semibold"
                  >
                    <LogOut className="size-4.5 mr-2" aria-hidden="true" />
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
                      className="w-full justify-center min-h-[48px] font-semibold"
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
                      className="w-full justify-center shadow-xs min-h-[48px] font-semibold"
                    >
                      <Link href={primaryAction.href} onClick={() => setIsOpen(false)}>
                        <Droplet className="size-4.5 fill-current mr-2" aria-hidden="true" />
                        {primaryAction.label}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
