"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Droplet } from "lucide-react";

import { getLocaleFromPathname } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { getMainNavItems, getUserNavItems } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  // Synchronize state during render when route changes (React 19 recommended pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const currentLocale = getLocaleFromPathname(pathname);
  const t = getTranslations(currentLocale);
  const mainNavItems = getMainNavItems(currentLocale);
  const userNavItems = getUserNavItems(currentLocale);

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
            {userNavItems.map((item) => {
              if (item.isPrimary) {
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="default"
                    size="lg"
                    className="w-full justify-center shadow-sm"
                  >
                    <Link href={item.href} onClick={() => setIsOpen(false)}>
                      <Droplet className="size-4 fill-current mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
