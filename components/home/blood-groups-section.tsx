"use client";

import * as React from "react";
import { Droplet, ArrowRight } from "lucide-react";

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

  const handleScrollToSearch = () => {
    const searchPanel = document.getElementById("search-panel");
    if (searchPanel) {
      searchPanel.scrollIntoView({ behavior: "smooth" });
      const selectElement = searchPanel.querySelector("select");
      if (selectElement) {
        selectElement.focus();
      }
    }
  };

  return (
    <section
      aria-labelledby="blood-groups-heading"
      className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold rounded-full"
          >
            {t.home.bloodGroups.badge}
          </Badge>
          <h2
            id="blood-groups-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight text-center"
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
                className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border transition-all duration-200 text-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                    : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/5 hover:shadow-xs"
                }`}
              >
                {/* Micro badge for universal traits */}
                {isUniversalDonor ? (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none inline-flex items-center justify-center text-center ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    Universal
                  </span>
                ) : null}

                {isUniversalRecipient ? (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none inline-flex items-center justify-center text-center ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-primary/10 text-primary border border-primary/20"
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
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none text-center inline-flex items-center justify-center">
                  {group}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Blood Group Details & Transfusion Compatibility Info */}
        <Card className="border border-border bg-background shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl leading-none text-center shadow-xs shrink-0 select-none">
                  <span className="leading-none flex items-center justify-center">{selectedGroup}</span>
                </div>
                <div className="flex flex-col justify-center space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                    {locale === "bn" ? `গ্রুপ ${selectedGroup}` : `Group ${selectedGroup}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedGroup === "O-" ? (
                      <Badge variant="outline" className="border-available/40 text-available bg-available/10 text-xs">
                        {t.home.bloodGroups.universalDonor}
                      </Badge>
                    ) : null}
                    {selectedGroup === "AB+" ? (
                      <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                        {t.home.bloodGroups.universalRecipient}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleScrollToSearch}
                className="self-start sm:self-auto font-semibold gap-2 shadow-xs inline-flex items-center justify-center"
              >
                <span className="leading-none">{t.home.bloodGroups.searchGroupButton}</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Button>
            </div>

            {/* Compatibility Matrix Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Can Donate To */}
              <div className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowRight className="size-3.5 text-available shrink-0" aria-hidden="true" />
                  <span className="leading-none">{t.home.bloodGroups.canDonateToLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canDonateTo.map((recipient) => (
                    <span
                      key={recipient}
                      className="inline-flex items-center justify-center min-w-11 h-9 px-3 rounded-lg border border-border bg-background text-foreground font-bold text-sm leading-none text-center select-none"
                    >
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Droplet className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span className="leading-none">{t.home.bloodGroups.canReceiveFromLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canReceiveFrom.map((donor) => (
                    <span
                      key={donor}
                      className="inline-flex items-center justify-center min-w-11 h-9 px-3 rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold text-sm leading-none text-center select-none"
                    >
                      {donor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scientific Notice */}
            <div className="text-xs text-muted-foreground pt-2 text-center sm:text-left leading-normal">
              * {t.home.bloodGroups.donorCountNotice}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
