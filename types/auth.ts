/**
 * Authentication & User Account Types.
 * Designed to provide clear frontend contracts and ready interfaces
 * for future Firebase / API integration without breaking the UI layer.
 */

export interface LoginInput {
  identifier: string; // Email or Bangladeshi phone number
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
  token?: string;
}

/**
 * Clean contract for future user authentication state.
 * Currently unused by design since no backend or session is created in Phase 8.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAdmin?: boolean;
  role?: string;
  isSuspended?: boolean;
  createdAt?: string;
}
