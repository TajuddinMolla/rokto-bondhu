import Link from "next/link";
import { Droplet, Search, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTranslations } from "@/i18n/translations";

export default function EnglishHomePage() {
  const t = getTranslations("en");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <main className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
        {/* Brand Icon */}
        <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <Droplet className="size-8 fill-primary" aria-hidden="true" />
        </div>

        {/* Title and Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {t.brand.name}
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-primary">
            {t.brand.tagline}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t.seo.description}
          </p>
        </div>

        {/* Action Placeholders */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
            <Link href="/en/donors">
              <Search className="size-4 mr-2" aria-hidden="true" />
              {t.nav.findDonors}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/en/register">
              <HeartHandshake className="size-4 mr-2" aria-hidden="true" />
              {t.nav.becomeDonor}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
