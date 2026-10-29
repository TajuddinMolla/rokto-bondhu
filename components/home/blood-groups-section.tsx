"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Droplet, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

import {
  BLOOD_GROUPS,
  type BloodGroup,
  getCompatibleRecipientGroups,
  getCompatibleDonorGroups,
} from "@/constants/blood-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

interface BloodGroupsSectionProps {
  locale: Locale;
  onSelectGroup?: (group: BloodGroup) => void;
}

export function BloodGroupsSection({
  locale,
  onSelectGroup,
}: BloodGroupsSectionProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = React.useState<BloodGroup>("O+");

  const canDonateTo = React.useMemo(
    () => getCompatibleRecipientGroups(selectedGroup),
    [selectedGroup]
  );
  const canReceiveFrom = React.useMemo(
    () => getCompatibleDonorGroups(selectedGroup),
    [selectedGroup]
  );

  const handleGroupClick = (group: BloodGroup) => {
    setSelectedGroup(group);
    if (onSelectGroup) {
      onSelectGroup(group);
    }
  };

  const handleFindDonors = () => {
    const prefix = locale === "en" ? "/en" : "";
    router.push(`${prefix}/donors?bloodGroup=${encodeURIComponent(selectedGroup)}`);
  };

  return (
    <section
      aria-labelledby="blood-groups-heading"
      className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-border/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge
            variant="subtle"
            className="border-primary-border text-primary bg-primary-subtle px-3 py-1 text-xs font-semibold rounded-full"
          >
            <Droplet className="size-3.5 mr-1 fill-current text-primary" aria-hidden="true" />
            {t.home.bloodGroups.badge}
          </Badge>
          <h2
            id="blood-groups-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight text-center"
          >
            {t.home.bloodGroups.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">
            {t.home.bloodGroups.sectionSubtitle}
          </p>
        </div>

        {/* 8 Blood Groups Grid */}
        <div
          role="radiogroup"
          aria-label={t.home.bloodGroups.sectionTitle}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
        >
          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedGroup === group;
            const isUniversalDonor = group === "O-";
            const isUniversalRecipient = group === "AB+";

            return (
              <button
                key={group}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleGroupClick(group)}
                className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[96px] ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 scale-[1.03]"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary-subtle/50 hover:shadow-xs"
                }`}
              >
                {/* Micro badge for universal traits */}
                {isUniversalDonor ? (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none inline-flex items-center justify-center text-center shadow-2xs ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-available-subtle text-available border border-available-border"
                    }`}
                  >
                    Universal
                  </span>
                ) : null}

                {isUniversalRecipient ? (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none inline-flex items-center justify-center text-center shadow-2xs ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-primary-subtle text-primary border border-primary-border"
                    }`}
                  >
                    Recipient
                  </span>
                ) : null}

                <Droplet
                  className={`size-6 mb-2 shrink-0 ${
                    isSelected ? "fill-white text-white" : "fill-primary text-primary"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-center inline-flex items-center justify-center">
                  {group}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Blood Group Details & Transfusion Compatibility Info */}
        <Card className="border border-border/80 bg-background shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-700 text-white font-black text-2xl leading-none text-center shadow-xs shrink-0 select-none">
                  <span>{selectedGroup}</span>
                </div>
                <div className="flex flex-col justify-center space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-foreground leading-tight">
                      {locale === "bn" ? `গ্রুপ ${selectedGroup}` : `Blood Group ${selectedGroup}`}
                    </h3>
                    <CheckCircle2 className="size-4.5 text-available shrink-0" aria-hidden="true" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedGroup === "O-" ? (
                      <Badge variant="available" className="text-xs font-bold">
                        {t.home.bloodGroups.universalDonor}
                      </Badge>
                    ) : null}
                    {selectedGroup === "AB+" ? (
                      <Badge variant="subtle" className="text-xs font-bold">
                        {t.home.bloodGroups.universalRecipient}
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {locale === "en" ? "Transfusion Compatibility" : "রক্ত পরিসঞ্চালন সামঞ্জস্যতা"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleFindDonors}
                size="lg"
                className="self-start sm:self-auto min-h-[48px] font-bold gap-2 shadow-xs inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white"
              >
                <span>{t.home.bloodGroups.searchGroupButton}</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Button>
            </div>

            {/* Compatibility Matrix Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Can Donate To */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-surface p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowRight className="size-3.5 text-available shrink-0" aria-hidden="true" />
                  <span>{t.home.bloodGroups.canDonateToLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canDonateTo.map((recipient) => (
                    <span
                      key={recipient}
                      className="inline-flex items-center justify-center min-w-11 h-10 px-3 rounded-xl border border-border bg-background text-foreground font-extrabold text-sm select-none shadow-2xs"
                    >
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-surface p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Droplet className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>{t.home.bloodGroups.canReceiveFromLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canReceiveFrom.map((donor) => (
                    <span
                      key={donor}
                      className="inline-flex items-center justify-center min-w-11 h-10 px-3 rounded-xl border border-primary-border bg-primary-subtle text-primary font-extrabold text-sm select-none shadow-2xs"
                    >
                      {donor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Authoritative Clinical Disclaimer */}
            <div className="rounded-2xl border border-border bg-surface-raised p-4 sm:p-5 text-left flex items-start gap-3.5">
              <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  {t.home.bloodGroups.clinicalDisclaimerTitle}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.home.bloodGroups.clinicalDisclaimerDesc}
                </p>
                <p className="text-[11px] text-muted-foreground/80 pt-1 font-medium">
                  * {t.home.bloodGroups.donorCountNotice}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
