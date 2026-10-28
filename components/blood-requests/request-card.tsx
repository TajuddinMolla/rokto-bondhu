import * as React from "react";
import Link from "next/link";
import { Clock, MapPin, Building2, Search } from "lucide-react";

import type { BloodRequestSummary } from "@/types/request";
import { formatLocation } from "@/constants/locations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface RequestCardProps {
  request: BloodRequestSummary;
  locale: Locale;
}

export function RequestCard({ request, locale }: RequestCardProps) {
  const t = getTranslations(locale);

  const locationText = formatLocation(
    {
      divisionId: request.divisionId,
      districtId: request.districtId,
      upazilaId: request.upazilaId,
    },
    locale
  );

  const urgencyVariant =
    request.urgency === "critical"
      ? "border-destructive/40 text-destructive bg-destructive/10 animate-pulse"
      : request.urgency === "urgent"
      ? "border-emergency/40 text-emergency bg-emergency/10"
      : "border-border text-muted-foreground bg-muted/40";

  const requestHref = `${locale === "en" ? "/en" : ""}/blood-request/${request.id}`;

  return (
    <Card className="border border-border bg-surface hover:border-primary/40 transition-all duration-200 hover:shadow-xs">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl leading-none text-center shadow-xs shrink-0 select-none">
              <span className="leading-none flex items-center justify-center">
                {request.bloodGroup}
              </span>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                {locale === "bn"
                  ? `${request.unitsNeeded} ব্যাগ রক্ত প্রয়োজন`
                  : `${request.unitsNeeded} unit(s) needed`}
              </h3>
              {request.hospitalName ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span className="truncate">{request.hospitalName}</span>
                </div>
              ) : null}
            </div>
          </div>

          <Badge variant="outline" className={`text-xs ${urgencyVariant}`}>
            {t.domain.requestUrgency[request.urgency]}
          </Badge>
        </div>

        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{locationText}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{request.neededAt}</span>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-7 ml-auto hover:border-primary hover:text-primary"
          >
            <Link href={requestHref}>
              <Search className="size-3" />
              <span>{locale === "en" ? "Find Donors" : "রক্তদাতা খুঁজুন"}</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
