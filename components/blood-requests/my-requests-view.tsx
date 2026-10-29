"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/validations/zod-resolver";
import {
  Droplet,
  PlusCircle,
  Calendar,
  MapPin,
  Hospital,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Loader2,
  Phone,
  FileText,
  Search,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useMyBloodRequests } from "@/hooks/queries/use-my-blood-requests";
import { useUpdateBloodRequest } from "@/hooks/mutations/use-update-blood-request";
import { useCancelBloodRequest, useFulfillBloodRequest } from "@/hooks/mutations/use-cancel-blood-request";
import { createBloodRequestSchema, type BloodRequestInput } from "@/lib/validations/blood-request";
import { BLOOD_GROUPS } from "@/constants/blood-groups";
import { REQUEST_URGENCIES } from "@/types/blood";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getDistrictById,
  getDivisionById,
  getUpazilaById,
} from "@/constants/locations";
import type { BloodRequest } from "@/types/request";
import type { RequestStatus } from "@/types/blood";
import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";

const emptySubscribe = () => () => {};
let cachedClientNow = 0;
function getClientNow(): number {
  if (cachedClientNow === 0) {
    cachedClientNow = Date.now();
  }
  return cachedClientNow;
}
function getServerNow(): number {
  return 0;
}

interface MyRequestsViewProps {
  locale: Locale;
}

export function MyRequestsView({ locale }: MyRequestsViewProps) {
  const router = useRouter();
  const { user, status } = useAuth();

  const now = React.useSyncExternalStore(emptySubscribe, getClientNow, getServerNow);

  const [activeFilter, setActiveFilter] = React.useState<"all" | RequestStatus>("all");
  const [editingRequest, setEditingRequest] = React.useState<BloodRequest | null>(null);
  const [cancellingRequest, setCancellingRequest] = React.useState<BloodRequest | null>(null);
  const [fulfillingRequest, setFulfillingRequest] = React.useState<BloodRequest | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const { data: requests = [], isLoading } = useMyBloodRequests(user?.uid);
  const cancelMutation = useCancelBloodRequest();
  const fulfillMutation = useFulfillBloodRequest();

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(locale === "en" ? "/en/login" : "/login");
    }
  }, [status, router, locale]);

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    if (activeFilter === "all") return requests;
    return requests.filter((r) => r.status === activeFilter);
  }, [requests, activeFilter]);

  // Counts
  const counts = React.useMemo(() => {
    return {
      all: requests.length,
      open: requests.filter((r) => r.status === "open").length,
      fulfilled: requests.filter((r) => r.status === "fulfilled").length,
      cancelled: requests.filter((r) => r.status === "cancelled").length,
    };
  }, [requests]);

  const handleConfirmCancel = async () => {
    if (!cancellingRequest || !user?.uid) return;
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({
        requestId: cancellingRequest.id,
        userId: user.uid,
      });
      setCancellingRequest(null);
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to cancel request");
    }
  };

  const handleConfirmFulfill = async () => {
    if (!fulfillingRequest || !user?.uid) return;
    setActionError(null);
    try {
      await fulfillMutation.mutateAsync({
        requestId: fulfillingRequest.id,
        userId: user.uid,
      });
      setFulfillingRequest(null);
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message || "Failed to mark request fulfilled");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          {locale === "en" ? "Loading your blood requests..." : "আপনার রক্তের অনুরোধ লোড হচ্ছে..."}
        </p>
      </div>
    );
  }

  const createHref = locale === "en" ? "/en/blood-request/create" : "/blood-request/create";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Droplet className="size-7 text-primary fill-current" />
            <span>{locale === "en" ? "My Blood Requests" : "আমার রক্তের অনুরোধ"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "en"
              ? "Track, update details, or close your broadcasted emergency requests"
              : "আপনার তৈরি করা জরুরি রক্তের অনুরোধ পর্যবেক্ষণ ও পরিচালনা করুন"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="default" className="gap-2 shadow-xs">
            <Link href={createHref}>
              <PlusCircle className="size-4" />
              <span>{locale === "en" ? "New Request" : "নতুন অনুরোধ তৈরি"}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{actionError}</span>
        </div>
      ) : null}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground"
          }`}
        >
          {locale === "en" ? "All Requests" : "সকল অনুরোধ"} ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("open")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "open"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground"
          }`}
        >
          {locale === "en" ? "Active" : "সক্রিয়"} ({counts.open})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("fulfilled")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "fulfilled"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground"
          }`}
        >
          {locale === "en" ? "Fulfilled" : "সম্পন্ন"} ({counts.fulfilled})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("cancelled")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeFilter === "cancelled"
              ? "bg-muted-foreground text-surface shadow-xs"
              : "bg-surface hover:bg-muted text-muted-foreground"
          }`}
        >
          {locale === "en" ? "Cancelled" : "বাতিল"} ({counts.cancelled})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="border border-border bg-surface text-center p-8 sm:p-12 space-y-4">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
            <FileText className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {locale === "en" ? "No requests found" : "কোনো অনুরোধ পাওয়া যায়নি"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              {activeFilter === "all"
                ? locale === "en"
                  ? "You have not broadcasted any blood requests yet."
                  : "আপনি এখনও কোনো রক্তের অনুরোধ প্রকাশ করেননি।"
                : locale === "en"
                ? `You have no ${activeFilter} blood requests.`
                : `আপনার কোনো ${activeFilter} রক্তের অনুরোধ নেই।`}
            </p>
          </div>
          {activeFilter === "all" ? (
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href={createHref}>
                  <PlusCircle className="size-4 mr-2" />
                  <span>{locale === "en" ? "Create Blood Request" : "রক্তের অনুরোধ তৈরি করুন"}</span>
                </Link>
              </Button>
            </div>
          ) : null}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              locale={locale}
              now={now}
              onEdit={() => setEditingRequest(req)}
              onCancel={() => setCancellingRequest(req)}
              onFulfill={() => setFulfillingRequest(req)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={Boolean(cancellingRequest)}
        onOpenChange={(open) => !open && setCancellingRequest(null)}
      >
        <DialogContent className="max-w-md">
          {cancellingRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5 text-foreground">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
                    <AlertCircle className="size-5" />
                  </div>
                  <DialogTitle>
                    {locale === "en" ? "Cancel Blood Request?" : "রক্তের অনুরোধ বাতিল করবেন?"}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {locale === "en"
                    ? "This request will be marked as cancelled. Blood donors will no longer be contacted for this patient requirement."
                    : "এই রক্তের অনুরোধটি বাতিল হিসেবে চিহ্নিত হবে। রক্তদাতারা এই রোগীর চাহিদার জন্য আর যোগাযোগ করবেন না।"}
                </DialogDescription>
              </DialogHeader>

              <DialogBody>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                  <span className="font-bold text-foreground">
                    {cancellingRequest.bloodGroup} • {cancellingRequest.unitsNeeded}{" "}
                    {locale === "en" ? "Bags" : "ব্যাগ"}
                  </span>
                  <p className="text-muted-foreground">
                    {cancellingRequest.hospitalName || cancellingRequest.locationAddress || "—"}
                  </p>
                </div>
              </DialogBody>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setCancellingRequest(null)}
                  disabled={cancelMutation.isPending}
                  className="min-h-[44px] rounded-xl px-5"
                >
                  {locale === "en" ? "Keep Active" : "সক্রিয় রাখুন"}
                </Button>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleConfirmCancel}
                  disabled={cancelMutation.isPending}
                  className="min-h-[44px] rounded-xl px-5 gap-2"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  <span>{locale === "en" ? "Confirm Cancel" : "হ্যাঁ, বাতিল করুন"}</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fulfill Confirmation Dialog */}
      <Dialog
        open={Boolean(fulfillingRequest)}
        onOpenChange={(open) => !open && setFulfillingRequest(null)}
      >
        <DialogContent className="max-w-md">
          {fulfillingRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5 text-foreground">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <DialogTitle>
                    {locale === "en" ? "Mark Request as Fulfilled?" : "অনুরোধটি সম্পন্ন হিসেবে চিহ্নিত করবেন?"}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {locale === "en"
                    ? "Confirm that the required blood has been arranged. This will celebrate donor efforts and update the status."
                    : "নিশ্চিত করুন যে প্রয়োজনীয় রক্ত সংগ্রহ সম্পন্ন হয়েছে। এটি অনুরোধটি সফলভাবে বন্ধ করবে।"}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setFulfillingRequest(null)}
                  disabled={fulfillMutation.isPending}
                  className="min-h-[44px] rounded-xl px-5"
                >
                  {locale === "en" ? "Cancel" : "বাতিল"}
                </Button>
                <Button
                  size="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] rounded-xl px-5 gap-2"
                  onClick={handleConfirmFulfill}
                  disabled={fulfillMutation.isPending}
                >
                  {fulfillMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  <span>{locale === "en" ? "Mark as Fulfilled" : "সম্পন্ন করুন"}</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      {editingRequest ? (
        <EditRequestModal
          request={editingRequest}
          locale={locale}
          onClose={() => setEditingRequest(null)}
          onSuccess={() => setEditingRequest(null)}
        />
      ) : null}
    </div>
  );
}

// -------------------------------------------------------------
// Individual Request Card Component
// -------------------------------------------------------------
interface RequestCardProps {
  request: BloodRequest;
  locale: Locale;
  now: number;
  onEdit: () => void;
  onCancel: () => void;
  onFulfill: () => void;
}

function RequestCard({ request, locale, now, onEdit, onCancel, onFulfill }: RequestCardProps) {
  const divObj = getDivisionById(request.divisionId);
  const distObj = getDistrictById(request.districtId);
  const upaObj = getUpazilaById(request.upazilaId);

  const locationText = [
    upaObj ? (locale === "en" ? upaObj.nameEn : upaObj.nameBn) : "",
    distObj ? (locale === "en" ? distObj.nameEn : distObj.nameBn) : "",
    divObj ? (locale === "en" ? divObj.nameEn : divObj.nameBn) : "",
  ]
    .filter(Boolean)
    .join(", ");

  const isPastDue =
    request.status === "open" &&
    Boolean(request.neededAt) &&
    now > 0 &&
    new Date(request.neededAt).getTime() < now;

  return (
    <Card className="border border-border bg-surface shadow-xs hover:border-primary/30 transition-all overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left: Blood Group Badge & Core Information */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center justify-center size-14 sm:size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <span className="text-xl sm:text-2xl font-black">{request.bloodGroup}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {request.unitsNeeded} {locale === "en" ? "bag" : "ব্যাগ"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {request.requesterName}
              </h2>
              {/* Urgency Badge */}
              <Badge
                variant={request.urgency === "critical" ? "destructive" : "default"}
                className="text-[10px] uppercase font-bold"
              >
                {request.urgency}
              </Badge>
              {/* Status Badge */}
              <StatusBadge status={request.status} locale={locale} />
              {/* Past Due Warning */}
              {isPastDue ? (
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/10">
                  {locale === "en" ? "Past Due" : "সময় অতিক্রান্ত"}
                </Badge>
              ) : null}
            </div>

            {/* Location & Hospital */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {request.hospitalName ? (
                <span className="inline-flex items-center gap-1">
                  <Hospital className="size-3.5 text-primary shrink-0" />
                  <span>{request.hospitalName}</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                <span>{locationText || "—"}</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                <span>{request.contactNumber}</span>
              </span>
            </div>

            {/* Needed Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <span>
                {locale === "en" ? "Needed at:" : "প্রয়োজনীয় সময়:"}{" "}
                <strong className="text-foreground">{request.neededAt}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        {request.status === "open" ? (
          <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            <Button
              asChild
              size="sm"
              className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-initial shadow-xs"
            >
              <Link href={`${locale === "en" ? "/en" : ""}/blood-request/${request.id}`}>
                <Search className="size-3.5" />
                <span>{locale === "en" ? "Find Donors" : "রক্তদাতা খুঁজুন"}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial"
            >
              <Edit3 className="size-3.5" />
              <span>{locale === "en" ? "Edit" : "সম্পাদনা"}</span>
            </Button>
            <Button
              size="sm"
              onClick={onFulfill}
              className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-initial"
            >
              <CheckCircle2 className="size-3.5" />
              <span>{locale === "en" ? "Fulfilled" : "সম্পন্ন"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 flex-1 sm:flex-initial"
            >
              <XCircle className="size-3.5" />
              <span>{locale === "en" ? "Cancel" : "বাতিল"}</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial"
            >
              <Link href={`${locale === "en" ? "/en" : ""}/blood-request/${request.id}`}>
                <Search className="size-3.5" />
                <span>{locale === "en" ? "View Details" : "বিস্তারিত ও ম্যাচ"}</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatusBadge({ status, locale }: { status: RequestStatus; locale: Locale }) {
  if (status === "open") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold">
        {locale === "en" ? "Open" : "সক্রিয়"}
      </Badge>
    );
  }
  if (status === "fulfilled") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-semibold">
        {locale === "en" ? "Fulfilled" : "সম্পন্ন"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground text-[10px] font-semibold">
      {locale === "en" ? "Cancelled" : "বাতিল"}
    </Badge>
  );
}

// -------------------------------------------------------------
// Edit Request Modal Component
// -------------------------------------------------------------
interface EditRequestModalProps {
  request: BloodRequest;
  locale: Locale;
  onClose: () => void;
  onSuccess: () => void;
}

function EditRequestModal({ request, locale, onClose, onSuccess }: EditRequestModalProps) {
  const t = getTranslations(locale);
  const formId = React.useId();
  const { user } = useAuth();
  const updateMutation = useUpdateBloodRequest();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const requestSchema = React.useMemo(() => createBloodRequestSchema(locale), [locale]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BloodRequestInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(requestSchema as any),
    defaultValues: {
      requesterName: request.requesterName,
      contactNumber: request.contactNumber,
      bloodGroup: request.bloodGroup,
      unitsNeeded: request.unitsNeeded,
      urgency: request.urgency,
      divisionId: request.divisionId,
      districtId: request.districtId,
      upazilaId: request.upazilaId,
      hospitalName: request.hospitalName || "",
      locationAddress: request.locationAddress || "",
      neededAt: request.neededAt,
      additionalNotes: request.additionalNotes || "",
      consent: true,
    },
    mode: "onTouched",
  });

  const watchedDivisionId = useWatch({ control, name: "divisionId" });
  const watchedDistrictId = useWatch({ control, name: "districtId" });

  const divisions = React.useMemo(() => getDivisions(), []);
  const districts = React.useMemo(
    () => (watchedDivisionId ? getDistricts(watchedDivisionId) : getDistricts()),
    [watchedDivisionId]
  );
  const upazilas = React.useMemo(
    () => (watchedDistrictId ? getUpazilas(watchedDistrictId) : []),
    [watchedDistrictId]
  );

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("divisionId", val, { shouldValidate: true });
    setValue("districtId", "", { shouldValidate: false });
    setValue("upazilaId", "", { shouldValidate: false });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parentDivision = val ? getDistrictById(val)?.divisionId : watchedDivisionId;
    if (parentDivision && parentDivision !== watchedDivisionId) {
      setValue("divisionId", parentDivision, { shouldValidate: true });
    }
    setValue("districtId", val, { shouldValidate: true });
    setValue("upazilaId", "", { shouldValidate: false });
  };

  const onUpdateSubmit = async (data: BloodRequestInput) => {
    if (!user?.uid) return;
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        requestId: request.id,
        userId: user.uid,
        updates: {
          requesterName: data.requesterName,
          contactNumber: data.contactNumber,
          bloodGroup: data.bloodGroup,
          unitsNeeded: data.unitsNeeded,
          divisionId: data.divisionId,
          districtId: data.districtId,
          upazilaId: data.upazilaId,
          hospitalName: data.hospitalName || undefined,
          locationAddress: data.locationAddress || undefined,
          neededAt: data.neededAt,
          urgency: data.urgency,
          additionalNotes: data.additionalNotes || undefined,
        },
      });
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string })?.message || "Failed to update request");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {locale === "en" ? "Edit Blood Request" : "রক্তের অনুরোধ সম্পাদনা"}
          </DialogTitle>
          <DialogDescription>
            {locale === "en" ? "Update requisition details" : "অনুরোধের তথ্য সংশোধন করুন"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
          <DialogBody className="max-h-[65vh]">
            {errorMsg ? (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errorMsg}
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requester Name */}
              <FormField
                id={`${formId}-requesterName`}
                label={t.bloodRequestCreatePage.form.requesterNameLabel}
                required
                error={errors.requesterName?.message}
              >
                <Input id={`${formId}-requesterName`} {...register("requesterName")} />
              </FormField>

              {/* Contact Phone */}
              <FormField
                id={`${formId}-contactNumber`}
                label={t.bloodRequestCreatePage.form.contactLabel}
                required
                error={errors.contactNumber?.message}
              >
                <Input id={`${formId}-contactNumber`} {...register("contactNumber")} />
              </FormField>

              {/* Blood Group */}
              <FormField
                id={`${formId}-bloodGroup`}
                label={t.bloodRequestCreatePage.form.bloodGroupLabel}
                required
                error={errors.bloodGroup?.message}
              >
                <Select id={`${formId}-bloodGroup`} {...register("bloodGroup")}>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Units */}
              <FormField
                id={`${formId}-unitsNeeded`}
                label={t.bloodRequestCreatePage.form.unitsLabel}
                required
                error={errors.unitsNeeded?.message}
              >
                <Input
                  id={`${formId}-unitsNeeded`}
                  type="number"
                  min={1}
                  max={20}
                  {...register("unitsNeeded", { valueAsNumber: true })}
                />
              </FormField>

              {/* Urgency */}
              <FormField
                id={`${formId}-urgency`}
                label={t.bloodRequestCreatePage.form.urgencyLabel}
                required
                error={errors.urgency?.message}
              >
                <Select id={`${formId}-urgency`} {...register("urgency")}>
                  {REQUEST_URGENCIES.map((u) => (
                    <option key={u} value={u}>
                      {t.domain.requestUrgency[u]}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Needed At */}
              <FormField
                id={`${formId}-neededAt`}
                label={t.bloodRequestCreatePage.form.neededAtLabel}
                required
                error={errors.neededAt?.message}
              >
                <Input id={`${formId}-neededAt`} type="datetime-local" {...register("neededAt")} />
              </FormField>

              {/* Division */}
              <FormField
                id={`${formId}-divisionId`}
                label={t.bloodRequestCreatePage.form.divisionLabel}
                required
                error={errors.divisionId?.message}
              >
                <Select
                  id={`${formId}-divisionId`}
                  {...register("divisionId")}
                  onChange={handleDivisionChange}
                >
                  <option value="">{t.bloodRequestCreatePage.form.divisionPlaceholder}</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "en" ? d.nameEn : d.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* District */}
              <FormField
                id={`${formId}-districtId`}
                label={t.bloodRequestCreatePage.form.districtLabel}
                required
                error={errors.districtId?.message}
              >
                <Select
                  id={`${formId}-districtId`}
                  {...register("districtId")}
                  onChange={handleDistrictChange}
                >
                  <option value="">{t.bloodRequestCreatePage.form.districtPlaceholder}</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "en" ? d.nameEn : d.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Upazila */}
              <FormField
                id={`${formId}-upazilaId`}
                label={t.bloodRequestCreatePage.form.upazilaLabel}
                required
                error={errors.upazilaId?.message}
              >
                <Select id={`${formId}-upazilaId`} {...register("upazilaId")}>
                  <option value="">{t.bloodRequestCreatePage.form.upazilaPlaceholder}</option>
                  {upazilas.map((u) => (
                    <option key={u.id} value={u.id}>
                      {locale === "en" ? u.nameEn : u.nameBn}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Hospital Name */}
              <FormField
                id={`${formId}-hospitalName`}
                label={t.bloodRequestCreatePage.form.hospitalNameLabel}
                error={errors.hospitalName?.message}
              >
                <Input id={`${formId}-hospitalName`} {...register("hospitalName")} />
              </FormField>
            </div>

            {/* Address */}
            <FormField
              id={`${formId}-locationAddress`}
              label={t.bloodRequestCreatePage.form.locationAddressLabel}
              error={errors.locationAddress?.message}
            >
              <Input id={`${formId}-locationAddress`} {...register("locationAddress")} />
            </FormField>

            {/* Notes */}
            <FormField
              id={`${formId}-additionalNotes`}
              label={t.bloodRequestCreatePage.form.notesLabel}
              error={errors.additionalNotes?.message}
            >
              <Textarea id={`${formId}-additionalNotes`} {...register("additionalNotes")} />
            </FormField>

          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-5"
            >
              {locale === "en" ? "Cancel" : "বাতিল"}
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={updateMutation.isPending}
              className="min-h-[44px] rounded-xl px-5 gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              <span>{locale === "en" ? "Save Changes" : "সংরক্ষণ করুন"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
