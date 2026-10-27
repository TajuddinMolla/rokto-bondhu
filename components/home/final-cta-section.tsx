import Link from "next/link";
import { Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface FinalCtaSectionProps {
  locale: Locale;
}

export function FinalCtaSection({ locale }: FinalCtaSectionProps) {
  const t = getTranslations(locale);
  const registerHref = locale === "en" ? "/en/donors/register" : "/donors/register";

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="py-16 sm:py-20 bg-slate-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2
          id="final-cta-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight"
        >
          {t.home.finalCta.title}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {t.home.finalCta.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm text-base"
          >
            <a href="#search-panel">
              <Search className="size-4 mr-2" aria-hidden="true" />
              {t.home.finalCta.findDonorsCta}
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-slate-700 bg-slate-800 text-white hover:border-slate-500 hover:bg-slate-700 hover:text-white font-semibold text-base"
          >
            <Link href={registerHref}>
              <UserPlus className="size-4 mr-2" aria-hidden="true" />
              {t.home.finalCta.registerCta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
