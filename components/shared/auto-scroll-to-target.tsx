"use client";

import * as React from "react";

interface AutoScrollToTargetProps {
  targetId: string;
  headerOffset?: number;
}

/**
 * Ensures smooth, reliable scrolling to a target section (e.g. form)
 * when a user navigates to the page with a hash or clicks on-page anchors.
 * Automatically accounts for sticky navbar height and React Suspense/hydration latency.
 */
export function AutoScrollToTarget({
  targetId,
  headerOffset = 88,
}: AutoScrollToTargetProps) {
  React.useEffect(() => {
    function scrollToTarget() {
      const el = document.getElementById(targetId);
      if (!el) return;

      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }

    function checkAndScroll() {
      if (typeof window === "undefined") return;

      const currentHash = window.location.hash.replace(/^#/, "");
      // Trigger if current hash matches targetId or contains targetId
      if (
        currentHash === targetId ||
        window.location.hash.includes(targetId) ||
        window.location.search.includes(`scroll=${targetId}`)
      ) {
        // Run with sequential fallbacks to guarantee layout stability after Suspense
        scrollToTarget();
        const t1 = setTimeout(scrollToTarget, 100);
        const t2 = setTimeout(scrollToTarget, 300);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }

    const cleanup = checkAndScroll();

    // Listen to hash changes while user remains on the same page
    const handleHashChange = () => {
      checkAndScroll();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [targetId, headerOffset]);

  return null;
}

