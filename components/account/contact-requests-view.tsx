"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Send,
  Phone,
  Hospital,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useDonorProfile } from "@/hooks/queries/use-donor-profile";
import {
  useIncomingContactRequests,
  useOutgoingContactRequests,
} from "@/hooks/queries/use-contact-requests";
import {
  useAcceptContactRequest,
  useDeclineContactRequest,
  useCancelContactRequest,
  useShareContactConsent,
  useCompleteContactRequest,
} from "@/hooks/mutations/use-contact-request-mutations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type {
  DonorContactRequest,
  ContactRequestStatus,
} from "@/types/contact-request";

interface ContactRequestsViewProps {
  locale: Locale;
}

export function ContactRequestsView({ locale }: ContactRequestsViewProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const { user, status } = useAuth();
  const { data: userProfile } = useUserProfile(user?.uid);
  const { data: donorProfile } = useDonorProfile(user?.uid);

  const isDonor = Boolean(userProfile?.hasDonorProfile || donorProfile);

  // Default to incoming if donor, otherwise outgoing
  const [activeTab, setActiveTab] = React.useState<"incoming" | "outgoing">(
    isDonor ? "incoming" : "outgoing"
  );
  const [activeFilter, setActiveFilter] = React.useState<
    "ALL" | ContactRequestStatus
  >("ALL");

  // Consent modal state for step 2 contact disclosure
  const [consentingRequest, setConsentingRequest] =
    React.useState<DonorContactRequest | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;
  const accountHref = `${prefix}/account`;
  const donorsDirectoryHref = `${prefix}/donors`;

  // Queries
  const { data: incoming = [], isLoading: isIncomingLoading } =
    useIncomingContactRequests(user?.uid);
  const { data: outgoing = [], isLoading: isOutgoingLoading } =
    useOutgoingContactRequests(user?.uid);

  // Mutations
  const acceptMutation = useAcceptContactRequest();
  const declineMutation = useDeclineContactRequest();
  const cancelMutation = useCancelContactRequest();
  const consentMutation = useShareContactConsent();
  const completeMutation = useCompleteContactRequest();

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [status, router, loginHref]);

  const activeList = activeTab === "incoming" ? incoming : outgoing;
  const filteredList = React.useMemo(() => {
    if (activeFilter === "ALL") return activeList;
    return activeList.filter((item) => item.status === activeFilter);
  }, [activeList, activeFilter]);

  const counts = React.useMemo(() => {
    const list = activeList;
    return {
      all: list.length,
      pending: list.filter((r) => r.status === "PENDING").length,
      accepted: list.filter((r) => r.status === "ACCEPTED").length,
      completed: list.filter((r) => r.status === "COMPLETED").length,
      declined: list.filter((r) => r.status === "DECLINED").length,
      cancelled: list.filter((r) => r.status === "CANCELLED").length,
    };
  }, [activeList]);

  // Actions
  const handleAccept = async (request: DonorContactRequest) => {
    if (!user?.uid) return;
    setActionError(null);
    try {
      await acceptMutation.mutateAsync({
        requestId: request.id,
        donorId: user.uid,
      });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to accept request");
    }
  };

  const handleDecline = async (request: DonorContactRequest) => {
    if (!user?.uid) return;
    setActionError(null);
    try {
      await declineMutation.mutateAsync({
        requestId: request.id,
        donorId: user.uid,
      });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to decline request");
    }
  };

  const handleCancel = async (request: DonorContactRequest) => {
    if (!user?.uid) return;
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({
        requestId: request.id,
        requesterId: user.uid,
      });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to cancel request");
    }
  };

  const handleConfirmConsent = async () => {
    if (!consentingRequest || !user?.uid) return;
    setActionError(null);
    const donorPhone = donorProfile?.phoneNumber || userProfile?.phoneNumber;
    if (!donorPhone) {
      setActionError(
        locale === "en"
          ? "No registered phone number found on your donor profile"
          : "আপনার প্রোফাইলে কোনো নিবন্ধিত ফোন নম্বর পাওয়া যায়নি"
      );
      return;
    }

    try {
      await consentMutation.mutateAsync({
        requestId: consentingRequest.id,
        donorId: user.uid,
        donorPhoneNumber: donorPhone,
      });
      setConsentingRequest(null);
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to share contact");
    }
  };

  const handleComplete = async (request: DonorContactRequest) => {
    if (!user?.uid) return;
    setActionError(null);
    try {
      await completeMutation.mutateAsync({
        requestId: request.id,
        actorId: user.uid,
      });
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to complete request");
    }
  };

  if (status === "loading" || isIncomingLoading || isOutgoingLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          {locale === "en" ? "Loading contact requests..." : "যোগাযোগের অনুরোধ লোড হচ্ছে..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link
            href={accountHref}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>{locale === "en" ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরে যান"}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquare className="size-7 text-primary fill-current" />
            <span>{t.contactRequests.pageTitle}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.contactRequests.pageSubtitle}
          </p>
        </div>

        {/* Quick Directory Link */}
        <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Link href={donorsDirectoryHref}>
            <Send className="size-3.5" />
            <span>{locale === "en" ? "Find Donors" : "রক্তদাতা খুঁজুন"}</span>
          </Link>
        </Button>
      </div>

      {/* Global Action Error Alert */}
      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{actionError}</span>
        </div>
      )}

      {/* Dual Tab Navigation (Incoming vs Outgoing) */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        {isDonor && (
          <button
            type="button"
            onClick={() => {
              setActiveTab("incoming");
              setActiveFilter("ALL");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === "incoming"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t.contactRequests.incomingTab}</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {incoming.length}
            </Badge>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveTab("outgoing");
            setActiveFilter("ALL");
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === "outgoing"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Send className="size-4" />
          <span>{t.contactRequests.outgoingTab}</span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {outgoing.length}
          </Badge>
        </button>
      </div>

      {/* Lifecycle Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {locale === "en" ? "All" : "সকল"} ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("PENDING")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "PENDING"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t.contactRequests.statusPending} ({counts.pending})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("ACCEPTED")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "ACCEPTED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t.contactRequests.statusAccepted} ({counts.accepted})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("COMPLETED")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "COMPLETED"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t.contactRequests.statusCompleted} ({counts.completed})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("DECLINED")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "DECLINED"
              ? "bg-destructive text-destructive-foreground shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t.contactRequests.statusDeclined} ({counts.declined})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("CANCELLED")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "CANCELLED"
              ? "bg-muted-foreground text-surface shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t.contactRequests.statusCancelled} ({counts.cancelled})
        </button>
      </div>

      {/* Requests List */}
      {filteredList.length === 0 ? (
        <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-4">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
            <MessageSquare className="size-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {activeTab === "incoming"
                ? t.contactRequests.noIncoming
                : t.contactRequests.noOutgoing}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeTab === "incoming"
                ? t.contactRequests.noIncomingDesc
                : t.contactRequests.noOutgoingDesc}
            </p>
          </div>
          {activeTab === "outgoing" && (
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href={donorsDirectoryHref}>
                  <Send className="size-3.5 mr-1.5" />
                  <span>{locale === "en" ? "Explore Donors Directory" : "রক্তদাতা ডিরেক্টরি দেখুন"}</span>
                </Link>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((req) => (
            <ContactRequestCard
              key={req.id}
              request={req}
              tab={activeTab}
              locale={locale}
              onAccept={() => handleAccept(req)}
              onDecline={() => handleDecline(req)}
              onCancel={() => handleCancel(req)}
              onOpenConsentDialog={() => setConsentingRequest(req)}
              onComplete={() => handleComplete(req)}
              isActionLoading={
                acceptMutation.isPending ||
                declineMutation.isPending ||
                cancelMutation.isPending ||
                completeMutation.isPending
              }
            />
          ))}
        </div>
      )}

      {/* Explicit Second-Step Contact Disclosure Consent Modal */}
      <Dialog
        open={Boolean(consentingRequest)}
        onOpenChange={(open) => !open && setConsentingRequest(null)}
      >
        <DialogContent className="max-w-md">
          {consentingRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5 text-foreground">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <DialogTitle>{t.contactRequests.consentDialogTitle}</DialogTitle>
                </div>
                <DialogDescription>
                  {t.contactRequests.consentDialogDesc}
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {locale === "en" ? "Authorized Requester:" : "অনুমোদিত রক্তপ্রার্থী:"}
                    </span>
                    <strong className="text-foreground">{consentingRequest.requesterName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {locale === "en" ? "Requester Contact:" : "রক্তপ্রার্থীর নম্বর:"}
                    </span>
                    <span className="font-mono text-foreground font-semibold">
                      {consentingRequest.requesterPhone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/80 pt-2.5">
                    <span className="text-muted-foreground">
                      {locale === "en" ? "Your Phone Number:" : "আপনার ফোন নম্বর:"}
                    </span>
                    <span className="font-mono text-primary font-bold">
                      {donorProfile?.phoneNumber || userProfile?.phoneNumber || "—"}
                    </span>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setConsentingRequest(null)}
                  disabled={consentMutation.isPending}
                  className="min-h-[44px] rounded-xl px-5"
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>
                <Button
                  size="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 min-h-[44px] rounded-xl px-5"
                  onClick={handleConfirmConsent}
                  disabled={consentMutation.isPending}
                >
                  {consentMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{locale === "en" ? "Sharing..." : "শেয়ার হচ্ছে..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>{t.contactRequests.consentConfirmBtn}</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------------------------------------------------------------------
// Individual Contact Request Item Component
// -------------------------------------------------------------------
interface ContactRequestCardProps {
  request: DonorContactRequest;
  tab: "incoming" | "outgoing";
  locale: Locale;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onOpenConsentDialog: () => void;
  onComplete: () => void;
  isActionLoading: boolean;
}

function ContactRequestCard({
  request,
  tab,
  locale,
  onAccept,
  onDecline,
  onCancel,
  onOpenConsentDialog,
  onComplete,
  isActionLoading,
}: ContactRequestCardProps) {
  const t = getTranslations(locale);

  const urgencyVariant =
    request.urgency === "critical"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : request.urgency === "urgent"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : "bg-muted text-muted-foreground border-border";

  return (
    <Card className="border border-border bg-surface p-5 space-y-4 hover:border-primary/30 transition-colors shadow-xs">
      {/* Top Header: Partner Name & Urgency Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shrink-0 select-none">
            {request.donorBloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground leading-tight">
                {tab === "incoming" ? request.requesterName : request.donorName}
              </h3>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold ${urgencyVariant}`}>
                {t.domain.requestUrgency[request.urgency]}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground block">
              {tab === "incoming"
                ? `${locale === "en" ? "Requester Phone:" : "রক্তপ্রার্থীর নম্বর:"} ${request.requesterPhone}`
                : `${request.donorBloodGroup} ${locale === "en" ? "Volunteer Donor" : "স্বেচ্ছাসেবী রক্তদাতা"}`}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <StatusPill status={request.status} locale={locale} />
      </div>

      {/* Details Box */}
      <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
          {request.patientName && (
            <div>
              <span className="font-semibold text-foreground">
                {locale === "en" ? "Patient: " : "রোগী: "}
              </span>
              <span>{request.patientName}</span>
            </div>
          )}
          {request.hospitalName && (
            <div className="flex items-center gap-1.5 truncate">
              <Hospital className="size-3 text-primary shrink-0" />
              <span className="truncate">{request.hospitalName}</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-foreground">
              {locale === "en" ? "Requested: " : "অনুরোধের তারিখ: "}
            </span>
            <span>{new Date(request.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "bn-BD")}</span>
          </div>
        </div>

        {request.message && (
          <p className="text-muted-foreground italic border-t border-border/60 pt-2 leading-relaxed">
            &ldquo;{request.message}&rdquo;
          </p>
        )}
      </div>

      {/* Step 2 Consent Disclosure Box (When Donor has shared Phone) */}
      {request.status === "ACCEPTED" && request.donorConsentGiven && request.sharedContactDetails && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
            <PhoneCall className="size-4 shrink-0" />
            <span>
              {tab === "outgoing"
                ? `${locale === "en" ? "Donor Phone:" : "রক্তদাতার ফোন নম্বর:"} `
                : `${t.contactRequests.phoneSharedBadge}: `}
              <strong className="font-mono text-sm">
                {request.sharedContactDetails.phoneNumber}
              </strong>
            </span>
          </div>

          {tab === "outgoing" && (
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs">
              <a href={`tel:${request.sharedContactDetails.phoneNumber}`}>
                <PhoneCall className="size-3.5" />
                <span>{t.contactRequests.callDonorNow}</span>
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
        {/* INCOMING ACTIONS (DONOR) */}
        {tab === "incoming" && request.status === "PENDING" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              disabled={isActionLoading}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              <X className="size-3.5 mr-1" />
              <span>{t.contactRequests.declineAction}</span>
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              disabled={isActionLoading}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Check className="size-3.5 mr-1" />
              <span>{t.contactRequests.acceptAction}</span>
            </Button>
          </>
        )}

        {/* Step 2 Consent Action: When Accepted but Phone not shared yet */}
        {tab === "incoming" &&
          request.status === "ACCEPTED" &&
          !request.donorConsentGiven && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs">
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {locale === "en"
                  ? "Accepted. Phone number is still private."
                  : "গৃহীত। ফোন নম্বর এখনও গোপন রয়েছে।"}
              </span>
              <Button
                size="sm"
                onClick={onOpenConsentDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs shrink-0"
              >
                <Phone className="size-3.5" />
                <span>{t.contactRequests.shareConsentAction}</span>
              </Button>
            </div>
          )}

        {/* Mark Completed */}
        {request.status === "ACCEPTED" && request.donorConsentGiven && (
          <Button
            variant="outline"
            size="sm"
            onClick={onComplete}
            disabled={isActionLoading}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{t.contactRequests.completeAction}</span>
          </Button>
        )}

        {/* OUTGOING ACTIONS (REQUESTER) */}
        {tab === "outgoing" && request.status === "PENDING" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isActionLoading}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <XCircle className="size-3.5 mr-1" />
            <span>{t.contactRequests.cancelAction}</span>
          </Button>
        )}

        {tab === "outgoing" &&
          request.status === "ACCEPTED" &&
          !request.donorConsentGiven && (
            <span className="text-xs text-muted-foreground italic">
              {locale === "en"
                ? "Donor accepted! Waiting for donor to authorize contact sharing..."
                : "রক্তদাতা অনুরোধ গ্রহণ করেছেন। যোগাযোগের অনুমতির অপেক্ষায়..."}
            </span>
          )}
      </div>
    </Card>
  );
}

function StatusPill({
  status,
  locale,
}: {
  status: ContactRequestStatus;
  locale: Locale;
}) {
  const t = getTranslations(locale);

  if (status === "PENDING") {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
        <Clock className="size-3 mr-1" />
        <span>{t.contactRequests.statusPending}</span>
      </Badge>
    );
  }
  if (status === "ACCEPTED") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
        <CheckCircle2 className="size-3 mr-1" />
        <span>{t.contactRequests.statusAccepted}</span>
      </Badge>
    );
  }
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
        <Check className="size-3 mr-1" />
        <span>{t.contactRequests.statusCompleted}</span>
      </Badge>
    );
  }
  if (status === "DECLINED") {
    return (
      <Badge variant="outline" className="border-destructive/30 text-destructive text-xs font-semibold">
        <X className="size-3 mr-1" />
        <span>{t.contactRequests.statusDeclined}</span>
      </Badge>
    );
  }
  if (status === "EXPIRED") {
    return (
      <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 text-xs font-semibold">
        <Clock className="size-3 mr-1" />
        <span>{t.contactRequests.statusExpired}</span>
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">
      <XCircle className="size-3 mr-1" />
      <span>{t.contactRequests.statusCancelled}</span>
    </Badge>
  );
}
