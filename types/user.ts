/**
 * Domain representation of a registered user profile in Firestore.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  hasDonorProfile: boolean;
  emailNotificationsEnabled?: boolean;
  createdAt?: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
}

/**
 * Payload allowed for updating user account details.
 */
export interface UpdateUserProfileInput {
  displayName?: string;
  phoneNumber?: string;
  emailNotificationsEnabled?: boolean;
}
