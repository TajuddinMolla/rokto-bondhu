"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/queries/use-user-profile";
import { useDonorProfile } from "@/hooks/queries/use-donor-profile";
import { useMyBloodRequests } from "@/hooks/queries/use-my-blood-requests";
import {
  useIncomingContactRequests,
  useOutgoingContactRequests,
} from "@/hooks/queries/use-contact-requests";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-notifications";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useUpdateDonorAvailability } from "@/hooks/mutations/use-update-donor-availability";
import { useUpdateUserProfile } from "@/hooks/mutations/use-update-user-profile";
import { useUpdateDonorContactMode } from "@/hooks/mutations/use-contact-request-mutations";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/use-notification-mutations";

import { AccountAlerts } from "@/components/account/account-alerts";
import { AccountDetailsCard } from "@/components/account/account-details-card";
import { DonorProfileCard } from "@/components/account/donor-profile-card";
import { DashboardRequestsSummary } from "@/components/account/dashboard-requests-summary";
import {
  NotificationPreferencesCard,
  NotificationCenterCard,
} from "@/components/account/notification-settings-card";

import type { Locale } from "@/i18n/config";
import type { DonorContactMode } from "@/types/donor";

interface ProfileManagerProps {
  locale: Locale;
}

export function ProfileManager({ locale }: ProfileManagerProps) {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [accountUpdateSuccess, setAccountUpdateSuccess] = React.useState(false);

  // Queries
  const { data: userProfile, isLoading: isUserLoading } = useUserProfile(user?.uid);
  const { data: donorProfile, isLoading: isDonorLoading } = useDonorProfile(user?.uid);
  const { data: myRequests = [] } = useMyBloodRequests(user?.uid);
  const { data: incomingContactRequests = [] } = useIncomingContactRequests(user?.uid);
  const { data: outgoingContactRequests = [] } = useOutgoingContactRequests(user?.uid);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.uid);
  const pushState = usePushNotifications();

  // Mutations
  const updateAvailabilityMutation = useUpdateDonorAvailability();
  const updateUserMutation = useUpdateUserProfile();
  const updateContactModeMutation = useUpdateDonorContactMode();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const prefix = locale === "en" ? "/en" : "";
  const loginHref = `${prefix}/login`;

  // Redirect unauthenticated user
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push(loginHref);
    }
  }, [status, router, loginHref]);

  // Handlers
  const handleUpdateAccount = async (data: { displayName: string; phoneNumber?: string }) => {
    if (!user) return;
    await updateUserMutation.mutateAsync({
      uid: user.uid,
      data: {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || undefined,
      },
    });
    setAccountUpdateSuccess(true);
    setTimeout(() => setAccountUpdateSuccess(false), 4000);
  };

  const handleToggleAvailability = async () => {
    if (!user || !donorProfile) return;
    const nextStatus = donorProfile.availabilityStatus === "available" ? "unavailable" : "available";
    await updateAvailabilityMutation.mutateAsync({
      uid: user.uid,
      status: nextStatus,
    });
  };

  const handleSelectContactMode = async (mode: DonorContactMode) => {
    if (!user || !donorProfile) return;
    await updateContactModeMutation.mutateAsync({
      uid: user.uid,
      mode,
    });
  };

  const handleToggleEmailNotifications = () => {
    if (!user) return;
    updatePreferencesMutation.mutate({
      userId: user.uid,
      emailNotificationsEnabled: userProfile?.emailNotificationsEnabled === false,
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push(prefix || "/");
  };

  if (status === "loading" || (isUserLoading && !userProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {locale === "en" ? "Loading profile..." : "প্রোফাইল লোড হচ্ছে..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dynamic Account & Moderation Alerts */}
      <AccountAlerts
        userProfile={userProfile}
        donorProfile={donorProfile}
        emailVerified={user.emailVerified}
        updateSuccess={accountUpdateSuccess}
        locale={locale}
      />

      {/* Main Account Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column: Account Details & Quick Preferences */}
        <div className="lg:col-span-1 space-y-6">
          <AccountDetailsCard
            user={user}
            userProfile={userProfile}
            onUpdateUser={handleUpdateAccount}
            onLogout={handleLogout}
            locale={locale}
          />

          <NotificationPreferencesCard
            locale={locale}
            emailNotificationsEnabled={userProfile?.emailNotificationsEnabled}
            isPending={updatePreferencesMutation.isPending}
            onToggle={handleToggleEmailNotifications}
          />
        </div>

        {/* Right Column: Donor Profile, Blood Requests & Notification Center */}
        <div className="lg:col-span-2 space-y-6">
          <DonorProfileCard
            donorProfile={donorProfile}
            isLoading={isDonorLoading}
            isUpdatingAvailability={updateAvailabilityMutation.isPending}
            isUpdatingContactMode={updateContactModeMutation.isPending}
            onToggleAvailability={handleToggleAvailability}
            onSelectContactMode={handleSelectContactMode}
            isSuspended={donorProfile?.isSuspended}
            locale={locale}
          />

          <DashboardRequestsSummary
            locale={locale}
            myRequests={myRequests}
            incomingContactRequests={incomingContactRequests}
            outgoingContactRequests={outgoingContactRequests}
          />

          <NotificationCenterCard
            locale={locale}
            unreadCount={unreadCount}
            pushState={pushState}
          />
        </div>
      </div>
    </div>
  );
}
