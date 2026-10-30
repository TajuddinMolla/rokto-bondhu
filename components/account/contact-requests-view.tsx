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
  Droplet,
  HeartHandshake,
  User,
  Share2,
} from "lucide-react";

import { FacebookIcon, WhatsAppIcon } from "@/components/shared/social-icons";

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
  const [isCopied, setIsCopied] = React.useState(false);

  const urgencyVariant =
    request.urgency === "critical"
      ? "bg-destructive/15 text-destructive border-destructive/30 animate-pulse ring-2 ring-destructive/20"
      : request.urgency === "urgent"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
      : "bg-muted text-muted-foreground border-border";

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${locale === "en" ? "/en" : ""}/blood-request?bloodGroup=${encodeURIComponent(request.donorBloodGroup)}`
      : `${locale === "en" ? "/en" : ""}/blood-request?bloodGroup=${encodeURIComponent(request.donorBloodGroup)}`;

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleWhatsAppShare = () => {
    const shareText =
      locale === "en"
        ? `🚨 URGENT: Blood Needed (${request.donorBloodGroup})\n🏥 Hospital: ${request.hospitalName || "Hospital"}\n👤 Patient: ${request.patientName || "Emergency patient"}\n\n👉 Help or connect with blood donors on RoktoBondhu:\n${shareUrl}\n\n- Shared via RoktoBondhu (রক্তবন্ধু)`
        : `🚨 জরুরি রক্তের আবেদন (${request.donorBloodGroup})\n🏥 হাসপাতাল: ${request.hospitalName || "হাসপাতাল"}\n👤 রোগী: ${request.patientName || "জরুরি রোগী"}\n\n👉 রক্তদাতা খুঁজতে বা সহযোগিতা করতে রক্তবন্ধু দেখুন:\n${shareUrl}\n\n- রক্তবন্ধু (RoktoBondhu) এর মাধ্যমে প্রচারিত`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/95 backdrop-blur-xs p-5 sm:p-7 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-200 group space-y-5">
      {/* Top hairline highlight that illuminates on card hover */}
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />

      {/* Top Header: Blood Group Emblem + Partner Info + Live Urgency Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          {/* Striking 3D Blood Group Shield */}
          <div className="relative flex flex-col items-center justify-center size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-rose-600 via-primary to-rose-900 text-white shadow-md shadow-primary/20 shrink-0 select-none overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/25 transition-all">
            <Droplet
              className="absolute -right-2 -bottom-2 size-10 fill-white/10 text-white/10 pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10 text-xl sm:text-2xl font-black leading-none">
              {request.donorBloodGroup}
            </span>
            <span className="relative z-10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/80 leading-tight mt-0.5">
              {locale === "en" ? "Group" : "গ্রুপ"}
            </span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* Request Direction Role Badge */}
              {tab === "incoming" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/25 shadow-2xs">
                  <HeartHandshake className="size-3" />
                  <span>{locale === "en" ? "Incoming Request for You" : "আপনার কাছে রক্তের অনুরোধ"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 shadow-2xs">
                  <Send className="size-3" />
                  <span>{locale === "en" ? "Your Outgoing Inquiry" : "রক্তদাতার কাছে আপনার আবেদন"}</span>
                </span>
              )}

              {/* Urgency Badge */}
              <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${urgencyVariant}`}>
                {t.domain.requestUrgency[request.urgency]}
              </Badge>
            </div>

            <h3 className="font-black text-base sm:text-lg text-foreground tracking-tight leading-snug">
              {tab === "incoming" ? request.requesterName : request.donorName}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {tab === "incoming" ? (
                <a
                  href={`tel:${request.requesterPhone}`}
                  className="inline-flex items-center gap-1 font-mono text-foreground hover:text-primary transition-colors"
                  title={locale === "en" ? "Call requester" : "রক্তপ্রার্থীকে কল করুন"}
                >
                  <Phone className="size-3.5 text-primary shrink-0" />
                  <span>{request.requesterPhone}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <User className="size-3.5 text-primary shrink-0" />
                  <span>{request.donorBloodGroup} {locale === "en" ? "Volunteer Donor" : "স্বেচ্ছাসেবী রক্তদাতা"}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto shrink-0">
          <StatusPill status={request.status} locale={locale} />
        </div>
      </div>

      {/* Details Box: Clinical Info & Hospital */}
      <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 text-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-muted-foreground">
          {request.patientName && (
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground">
                {locale === "en" ? "Patient:" : "রোগী:"}{" "}
                <strong className="text-foreground">{request.patientName}</strong>
              </span>
            </div>
          )}
          {request.hospitalName && (
            <div className="flex items-center gap-1.5 truncate">
              <Hospital className="size-3.5 text-primary shrink-0" />
              <span className="truncate font-medium text-foreground">{request.hospitalName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary shrink-0" />
            <span>
              {new Date(request.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "bn-BD", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {request.message && (
          <div className="border-t border-border/60 pt-2 text-foreground/90 leading-relaxed italic bg-surface/50 p-2.5 rounded-xl">
            &ldquo;{request.message}&rdquo;
          </div>
        )}
      </div>

      {/* Step 2 Consent Disclosure Box (When Donor has shared Phone) */}
      {request.status === "ACCEPTED" && request.donorConsentGiven && request.sharedContactDetails && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
              <PhoneCall className="size-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] block font-normal opacity-90">
                {tab === "outgoing"
                  ? locale === "en"
                    ? "Donor Verified Phone Number:"
                    : "রক্তদাতার ভেরিফাইড ফোন নম্বর:"
                  : `${t.contactRequests.phoneSharedBadge}: `}
              </span>
              <strong className="font-mono text-sm sm:text-base font-black tracking-wide text-foreground">
                {request.sharedContactDetails.phoneNumber}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl font-bold shadow-xs px-3.5 h-9"
            >
              <a href={`tel:${request.sharedContactDetails.phoneNumber}`}>
                <PhoneCall className="size-3.5" />
                <span>{t.contactRequests.callDonorNow}</span>
              </a>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white gap-1.5 rounded-xl font-bold shadow-xs px-3.5 h-9"
            >
              <a
                href={`https://wa.me/${request.sharedContactDetails.phoneNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-3.5" />
                <span>WhatsApp</span>
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Toolbar: Social Sharing (Facebook, WhatsApp, Copy Link) & Workflow Actions */}
      <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Social Emergency Sharing Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facebook Share Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleFacebookShare}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs transition-transform active:scale-95"
            title={locale === "en" ? "Share emergency on Facebook" : "জরুরি আবেদন ফেসবুকে শেয়ার করুন"}
          >
            <FacebookIcon className="size-3.5" />
            <span>Facebook</span>
          </Button>

          {/* WhatsApp Share Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleWhatsAppShare}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xs transition-transform active:scale-95"
            title={locale === "en" ? "Share emergency on WhatsApp" : "জরুরি আবেদন হোয়াটসঅ্যাপে শেয়ার করুন"}
          >
            <WhatsAppIcon className="size-3.5" />
            <span>WhatsApp</span>
          </Button>

          {/* Copy Link Button */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 font-semibold border-border hover:border-primary/50"
            title={locale === "en" ? "Copy directory link" : "লিংক কপি করুন"}
          >
            {isCopied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">{locale === "en" ? "Copied!" : "কপি হয়েছে!"}</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>{locale === "en" ? "Copy Link" : "লিংক কপি"}</span>
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* INCOMING ACTIONS (DONOR) */}
          {tab === "incoming" && request.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                disabled={isActionLoading}
                className="h-9 px-3 text-xs gap-1.5 text-destructive hover:bg-destructive/10 rounded-xl font-medium"
              >
                <X className="size-3.5" />
                <span>{t.contactRequests.declineAction}</span>
              </Button>
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isActionLoading}
                className="h-9 px-3.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-transform active:scale-95"
              >
                <Check className="size-3.5" />
                <span>{t.contactRequests.acceptAction}</span>
              </Button>
            </>
          )}

          {/* Step 2 Consent Action: When Accepted but Phone not shared yet */}
          {tab === "incoming" &&
            request.status === "ACCEPTED" &&
            !request.donorConsentGiven && (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-medium">
                  {locale === "en"
                    ? "✓ You accepted. Click to share your phone number with this requester."
                    : "✓ অনুরোধ গ্রহণ করেছেন। রক্তপ্রার্থীর সাথে ফোন নম্বর শেয়ার করতে ক্লিক করুন।"}
                </span>
                <Button
                  size="sm"
                  onClick={onOpenConsentDialog}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl font-bold shadow-xs px-3.5 h-9 shrink-0"
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
              className="h-9 px-3 text-xs gap-1.5 rounded-xl font-semibold border-border hover:border-primary/50"
            >
              <CheckCircle2 className="size-3.5 text-emerald-600" />
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
              className="h-9 px-3 text-xs gap-1 text-destructive hover:bg-destructive/10 rounded-xl font-medium"
            >
              <XCircle className="size-3.5" />
              <span>{t.contactRequests.cancelAction}</span>
            </Button>
          )}

          {tab === "outgoing" &&
            request.status === "ACCEPTED" &&
            !request.donorConsentGiven && (
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium italic">
                {locale === "en"
                  ? "✓ Donor accepted! Waiting for donor to authorize contact sharing..."
                  : "✓ রক্তদাতা অনুরোধ গ্রহণ করেছেন। যোগাযোগের অনুমতির অপেক্ষায়..."}
              </span>
            )}
        </div>
      </div>
    </article>
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
      <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
        </span>
        <span>{t.contactRequests.statusPending}</span>
      </span>
    );
  }
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
        </span>
        <span>{t.contactRequests.statusAccepted}</span>
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
        <Check className="size-3" />
        <span>{t.contactRequests.statusCompleted}</span>
      </span>
    );
  }
  if (status === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
        <X className="size-3" />
        <span>{t.contactRequests.statusDeclined}</span>
      </span>
    );
  }
  if (status === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
        <Clock className="size-3" />
        <span>{t.contactRequests.statusExpired}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
      <XCircle className="size-3" />
      <span>{t.contactRequests.statusCancelled}</span>
    </span>
  );
}
